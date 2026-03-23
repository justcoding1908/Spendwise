import supabase from '../config/supabase.js'

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' })

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { name }
    })
    if (error)
      return res.status(400).json({ success: false, message: error.message })

    // Insert into profiles table
    await supabase.from('profiles').insert({
      id: data.user.id, name, email
    })

    // Sign in to get token
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError)
      return res.status(400).json({ success: false, message: signInError.message })

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: signInData.session.access_token,
      user: { id: data.user.id, name, email }
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

    const profile = await supabase.from('profiles').select('name').eq('id', data.user.id).single()

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

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: { id: req.user.id, name: req.user.name, email: req.user.email }
  })
}