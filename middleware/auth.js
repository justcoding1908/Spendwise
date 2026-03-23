import supabase from '../config/supabase.js'

const protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token)
      return res.status(401).json({ success: false, message: 'Not authorized, no token' })

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user)
      return res.status(401).json({ success: false, message: 'Token invalid or expired' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', data.user.id)
      .single()

    req.user = { id: data.user.id, email: data.user.email, name: profile?.name }
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Auth error' })
  }
}

export default protect