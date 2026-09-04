import supabase from '../config/supabase.js'
import { emailQueue } from '../queues/emailQueue.js'
import { generateVerificationToken } from '../utils/tokens.js'
import { buildVerificationEmail } from '../utils/verificationEmail.js'

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' })

    // Create user in Supabase Auth. email_confirm: true means Supabase's
    // OWN confirmation system considers them confirmed immediately — we're
    // not using that system. Our `email_verified` column on `profiles` is
    // our own, separate verification flag that actually gates login below.
    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { name }
    })
    if (error)
      return res.status(400).json({ success: false, message: error.message })

    const verificationToken = generateVerificationToken()
    const verificationTokenExpiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString()

    // Insert into profiles table, unverified, with the token attached
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id, name, email,
      email_verified: false,
      verification_token: verificationToken,
      verification_token_expires_at: verificationTokenExpiresAt
    })

    if (profileError) {
      // Without this, a failed insert here leaves a real Supabase Auth
      // user with no profiles row — permanently stuck (can't re-register,
      // since the email already exists; can't log in, since login() has
      // nothing to read `email_verified` from). Roll the auth user back
      // instead, so the email is free to try registering again cleanly.
      console.error('Profile insert failed during registration:', profileError)
      await supabase.auth.admin.deleteUser(data.user.id)
      return res.status(500).json({ success: false, message: 'Something went wrong creating your account. Please try again.' })
    }

    // Build the link they'll click from their inbox
    const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`
    const { subject, html } = buildVerificationEmail(name, verifyUrl)

    // Hand off to the background queue — the HTTP response below does NOT
    // wait for this email to actually send.
    await emailQueue.add('verification-email', { to: email, subject, html })

    // No token/session here — login is blocked until they verify (see login() below).
    res.status(201).json({
      success: true,
      message: 'Account created! Check your email to verify your account before logging in.'
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' })

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error)
      return res.status(401).json({ success: false, message: 'Invalid email or password' })

    const profile = await supabase.from('profiles').select('name, email_verified').eq('id', data.user.id).single()

    // 403, not 401 — this user IS who they say they are (Supabase just
    // confirmed their password), they're just not allowed in yet. Using
    // 401 here would trip the frontend's global "session expired" redirect
    // instead of showing this specific message.
    if (!profile.data?.email_verified)
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in. Check your inbox for the verification link.' })

    res.json({
      success: true,
      message: 'Login successful',
      token: data.session.access_token,
      user: { id: data.user.id, name: profile.data?.name, email: data.user.email }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/auth/verify-email?token=...
// Reached by the user clicking the link in their email, not called by the
// frontend SPA — so it responds with plain HTML rather than JSON.
export const verifyEmail = async (req, res) => {
  const { token } = req.query
  if (!token)
    return res.status(400).send('<h2>Missing verification token.</h2>')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, verification_token_expires_at')
    .eq('verification_token', token)
    .single()

  if (!profile)
    return res.status(400).send('<h2>Invalid or already-used verification link.</h2>')

  if (new Date(profile.verification_token_expires_at) < new Date())
    return res.status(400).send('<h2>This verification link has expired.</h2>')

  await supabase.from('profiles').update({
    email_verified: true,
    verification_token: null,
    verification_token_expires_at: null
  }).eq('id', profile.id)

  res.send('<h2>✅ Email verified! You can close this tab and log in.</h2>')
}

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: { id: req.user.id, name: req.user.name, email: req.user.email }
  })
}