# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SpendWise is a full-stack UPI expense tracker for Indian users: paste bank SMS text (or scan a receipt) to auto-log transactions, then get category analytics, budgets, spend forecasts, and AI financial coaching. Live: https://spendwise-woad.vercel.app.

Two independent apps in one repo, no shared tooling/monorepo config:
- **Backend** — repo root. Node/Express, ESM (`"type": "module"`).
- **Frontend** — `client/`. Vite + React 18.

### Repo layout gotcha
`Spendwise/` at the repo root is a **git submodule that points at this same repo** (self-referential — `git ls-tree` shows it as a `160000` gitlink to `github.com/justcoding1908/Spendwise`, no `.gitmodules` present). It's a stray duplicate, not a separate project — ignore it and work from the repo root. Don't edit files inside `Spendwise/`; changes there don't affect the real app.

## Commands

Backend (repo root):
```bash
npm install
npm run dev     # nodemon server.js — http://localhost:5000
npm start        # node server.js
```

Frontend (`client/`):
```bash
cd client
npm install
npm run dev       # vite dev server — http://localhost:5173
npm run build
npm run preview
```

There is no test suite and no lint config (no `.eslintrc`, no `eslint.config.*`, no `test` script) in either package — don't assume `npm test`/`npm run lint` exist.

### Docker (optional, local-only — not what's actually deployed)
```bash
cp .env.example .env   # fill in real values
docker compose up --build
# backend  → http://localhost:5000
# frontend → http://localhost:5173 (nginx serving the Vite build)
```
`docker-compose.yml` builds the backend from the root `Dockerfile` (Node 20 alpine) and the frontend from `client/Dockerfile` (Vite build → static `nginx:alpine`), passing `VITE_API_URL=http://localhost:5000/api` as a build arg so the containerized frontend talks to the containerized backend. Production itself is **not** Docker-based — Render runs `node server.js` directly and Vercel builds the Vite app directly; this compose setup is for local dev/parity only.

### Environment variables (backend `.env`, gitignored)
```
PORT=5000
NODE_ENV=development
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
GROQ_API_KEY=
```
Note: `jsonwebtoken` and `JWT_SECRET` are declared but **not actually used anywhere** in the code — auth is delegated entirely to Supabase (see below). `client/src/api.js` reads `import.meta.env.VITE_API_URL` and falls back to the deployed Render backend if unset — so a plain `npm run dev` in `client/` (no `.env` there) still talks to **production** backend data unless you set `VITE_API_URL` yourself; the Docker Compose setup sets it automatically to point at the local backend container.

## Architecture

### Backend (`server.js`, `routes/`, `controllers/`, `middleware/`, `config/`)
Four route groups mounted in `server.js`, each `protect`-gated except auth register/login:
- `/api/auth` → `authController.js` — register/login/me, backed by Supabase Auth (`supabase.auth.admin.createUser`, `signInWithPassword`), plus a `profiles` table row per user.
- `/api/transactions` → CRUD + `/stats` (in-memory aggregation: total spent, top category, biggest txn, category breakdown for a given month/year) + `/bulk` (used by the SMS import flow) + `PATCH /:id/category`.
- `/api/budgets` → per-category monthly limits, upserted on `(user_id, category, month, year)`.
- `/api/ai` → all Groq-backed endpoints (see below).

**Auth model**: `middleware/auth.js` verifies the bearer token via `supabase.auth.getUser(token)` — it does *not* do its own JWT sign/verify despite the `jsonwebtoken` dependency. `config/supabase.js` creates the Supabase client with the **service-role key**, which bypasses Row-Level Security entirely; every controller therefore does its own authorization by hand-filtering `.eq('user_id', req.user.id)` on each query. When touching a controller, keep that filter — RLS is not a backstop here.

### AI pipeline (`controllers/aiController.js`, Groq SDK)
- `llama-3.3-70b-versatile` — financial coaching insight (`/insight`), AI-based SMS transaction extraction (`/parse-sms`), vendor→category classification with a confidence + reasoning field (`/categorize-vendor`).
- `meta-llama/llama-4-scout-17b-16e-instruct` (vision) — receipt image → `{vendor, amount, date, category}` (`/scan-receipt`).
- `/detect-anomalies` is plain JS (no LLM): flags category overspend vs. hardcoded per-category averages, transactions over ₹5000, and repeat merchants.
- All LLM calls are prompted to return raw JSON; responses are parsed defensively (strip ```` ```json ```` fences, then regex-extract the first `{...}`/`[...]` as a fallback) since the model doesn't use structured-output mode.

### SMS parsing — two independent implementations
The primary, live path is **client-side regex**, not the AI endpoint above:
- `client/src/utils/smsParser.js` — `parseUPISMS()` matches two SBI SMS formats (old debit-only format, newer credit/debit format) via regex, then categorizes via a local `MERCHANT_MAP` keyword table with a `localStorage` override (`sw_vendor_map`) for merchants the user has manually corrected.
- `controllers/aiController.js`'s `parseSMSWithAI` (`POST /api/ai/parse-sms`) is a second, AI-based SMS parser that exists server-side but is **not wired into the main dashboard SMS flow** (`SMSSection` in `Dashboard.jsx` calls `parseUPISMS` directly). Treat it as an alternate/unused path unless you find a caller.

### Frontend (`client/src/`)
- `App.jsx` — router with `Protected`/`Public` route wrappers gated on `AuthContext`.
- `context/AuthContext.jsx` — holds `user`; login/register/logout persist the Supabase token/user to `localStorage` (`sw_token`, `sw_user`); `api.js`'s response interceptor auto-logs-out and redirects to `/login` on any `401`.
- `utils/categories.js` — category metadata (emoji/color), `formatCurrency`/`formatDate` (en-IN locale), greeting helper.
- **`pages/Dashboard.jsx` is a ~1300-line monolith** — there are no components under `components/` or hooks under `hooks/` (both dirs are empty). Every dashboard section is a function defined inline in this one file: `HeroCard`, `StatCards`, `SMSSection`, `ReceiptScanner`, `UnknownVendorPopup`, `TxnsSection`, `ForecastSection` (contains `weightedForecast()`, a client-side weighted-moving-average spend forecast), `AnalyticsSection`, `BudgetSection`, `AIBubble`, `MonthSwitcher`, `Navbar`. When asked to change "a component," look inside this file first.

### Deployment
- Frontend → Vercel; `client/vercel.json` has a catch-all SPA rewrite to `index.html` (needed for client-side routing on refresh).
- Backend → Render, CORS-allowlisted in `server.js` for `localhost:5173`/`5175` and any `*.vercel.app` origin.
- Database → Supabase Postgres (`transactions`, `budgets`, `profiles` tables; schema itself isn't in this repo).
