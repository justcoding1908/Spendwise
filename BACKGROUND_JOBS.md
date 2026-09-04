# Background Jobs & Email Verification — How It Works

This explains the background job / task queue system we built for SpendWise, and the email verification feature on top of it. Written in plain language — no prior background-job experience assumed.

## The Core Idea (in one sentence)

Instead of making a user wait while the server sends an email (slow, unreliable), the server writes down "send this email" as a to-do item and responds immediately — a separate, always-running process picks up that to-do item whenever it gets to it.

## The Three Pieces

**Redis** — a super-fast, in-memory data store. It's not the queue itself; it's just where the queue's data physically lives.

**BullMQ** — a Node.js library that turns Redis into an actual job queue. It gives us two objects:
- `Queue` — used to *add* jobs ("please send this email")
- `Worker` — a long-running process that *picks up and processes* jobs

**Resend** — the actual email-sending service. Our worker calls Resend's API to send the real email.

## How They Fit Together

```
[register() in authController.js]
        |
        | 1. emailQueue.add({ to, subject, html })
        v
      [Redis]   <-- the job just sits here, waiting
        |
        | 2. the Worker (a separate, always-running
        |    process) is watching Redis and picks it up
        v
[emailWorker.js processes the job]
        |
        | 3. calls resend.emails.send(...)
        v
     [Resend]  --sends the real email-->  [user's inbox]
```

The trick: step 1 happens **instantly** (writing to Redis is fast) — the HTTP response to the browser goes out right after. Steps 2 and 3 (the actually-slow part) happen separately, in a different process, on their own time.

## The Full Registration & Verification Flow

1. User fills out the register form → `POST /api/auth/register`
2. Backend creates the account in Supabase Auth
3. Backend generates a random token (`utils/tokens.js`) with a 24-hour expiry
4. Backend saves a `profiles` row: `email_verified: false`, plus the token + expiry
5. Backend builds the email content (`utils/verificationEmail.js`) and adds a job to the `email` queue (`queues/emailQueue.js`)
6. Backend responds to the browser immediately ("check your email") — **the email hasn't actually sent yet at this point**
7. Separately, `workers/emailWorker.js` (its own process) picks up the job and calls Resend
8. User receives the email, clicks the link → `GET /api/auth/verify-email?token=...`
9. Backend checks the token is valid and unexpired, flips `email_verified` to `true`
10. Now `POST /api/auth/login` lets this user in — it checks `email_verified` and returns `403 Forbidden` while it's still `false`

## Where Everything Lives

| File | What it does |
|---|---|
| `config/redis.js` | Builds the shared connection to Redis (an `ioredis` client) |
| `queues/emailQueue.js` | Defines the `email` queue — the "producer" side |
| `workers/emailWorker.js` | The actual email-sending logic — the "consumer" side. Runs as its own process (`npm run worker`) |
| `utils/tokens.js` | Generates a random, unguessable verification token |
| `utils/verificationEmail.js` | Builds the HTML content of the verification email |
| `controllers/authController.js` | `register()` creates the token + queues the email; `login()` checks `email_verified`; `verifyEmail()` handles the link click |
| `routes/authRoutes.js` | Wires up `GET /api/auth/verify-email` |
| `client/src/context/AuthContext.jsx` | `register()` no longer auto-logs-in — there's no session to give, the account isn't usable yet |
| `client/src/pages/Register.jsx` | Shows "check your email" and redirects to `/login` instead of `/dashboard` |

## Running It Locally

Four things need to be running at once, each in its own terminal:

1. **Redis**: `docker compose up redis -d` (background; only need to redo this after restarting Docker)
2. **Backend**: `npm run dev` (project root)
3. **Worker**: `npm run worker` (project root) — easy to forget! If it's not running, emails just pile up in Redis, unsent, waiting for a worker to show up
4. **Frontend**: `npm run dev` (inside `client/`)

## Gotchas We Actually Ran Into

- **`client/.env` needs `VITE_API_URL=http://localhost:5000/api`** — without it, the frontend silently talks to the live production backend instead of your local one.
- **The worker doesn't hot-reload.** Unlike the backend (`nodemon`), the worker is a plain `node` process — editing `workers/emailWorker.js` requires manually stopping (Ctrl+C) and restarting it.
- **Resend's free tier (before a verified domain) only delivers to the email you signed up with.** This is why testing with other/fake addresses failed until we verified `mail.spendwisely.me`.
- **A missing `profiles` row is treated as "not verified."** If a Supabase Auth user exists but its `profiles` insert failed (or never happened), `login()` fails closed with the same 403 — this is exactly what happened with an old pre-existing account that predated this feature.
- **Editing `email_verified` by hand in Supabase's table editor triggers nothing.** No email gets sent — no application code runs when you edit a row directly, only `register()` (or a future "resend verification" endpoint) can queue one.

## What's NOT Built Yet (Known Gaps)

- **No "resend verification email" feature.** If a user loses the email or the 24-hour link expires, they're currently stuck with no way to request a new one — would need a `POST /api/auth/resend-verification` endpoint.
- **No rate-limiting** on registration or verification attempts. Not a concern at this project's current scale, but worth knowing.

## Deploying This to Production

Right now, everything runs on your own machine. To make it work for real users on the live site, a few things need to move off localhost — and we deliberately chose the free-tier-friendly version of each:

1. **A production Redis** — your laptop's Docker Redis isn't reachable from the internet. Need a cloud-hosted one. **Upstash** (upstash.com) has a solid free tier and is the easiest option.
2. **Somewhere for the worker to run** — Render's dedicated **Background Worker** service type is the "textbook" answer, but it requires a paid plan. Instead, we run the worker **inside the same process as the backend** (see `server.js` — gated behind a `RUN_EMBEDDED_WORKER` env var), which costs nothing extra since it reuses the backend service you already have. Locally we keep them as separate processes on purpose, since seeing them as two separate terminals is what makes the producer/consumer concept visible while learning — this embedding is a production-only shortcut.
3. **Environment variables updated on Render** (backend service only — no second service needed): `REDIS_URL` (Upstash's ready-made connection string), `RESEND_API_KEY`, `BACKEND_URL` (your real Render URL, e.g. `https://spendwise-backend-rr7x.onrender.com`, so the emailed link points somewhere real instead of `localhost:5000`), and `RUN_EMBEDDED_WORKER=true`.
4. **The frontend needs no changes** — `client/src/api.js` already falls back to the Render backend URL when `VITE_API_URL` isn't set, so Vercel is unaffected by this feature.

### Steps

1. Create a free Redis database on **Upstash** → copy its `REDIS_URL` (looks like `rediss://default:<password>@<host>:<port>` — the double `s` means it's TLS, which `ioredis` handles automatically).
2. On Render → your backend service → **Environment** tab → add/update: `REDIS_URL`, `RESEND_API_KEY`, `BACKEND_URL`, `RUN_EMBEDDED_WORKER=true`.
3. Merge the `feature/email-verification-jobs` branch into `main` (only once step 2 is done — merging first would redeploy the backend with code expecting Redis before it's configured, breaking live registration).
4. Render auto-redeploys the backend from `main` — it now runs the email worker in-process alongside the API.
5. Test on the live site with a real email address.

One tradeoff worth knowing: if your Render plan is on the free tier, the whole service (API + embedded worker) spins down after 15 minutes of no HTTP traffic, and takes ~30-60 seconds to wake back up on the next request. This isn't a new downside from embedding the worker — your API already has this behavior today — it just means a verification email sent while the service is asleep gets delayed until something wakes it up (a login/register attempt, for instance), rather than sent instantly.
