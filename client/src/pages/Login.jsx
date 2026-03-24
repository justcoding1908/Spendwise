import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Fill in all fields'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 🔥')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wrong email or password')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-wrap" style={{ background: 'var(--bg)', position: 'relative' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--mint)', letterSpacing: -0.5, marginBottom: 6 }}>SpendWise</div>
          <div style={{ color: 'var(--text-3)', fontSize: 14 }}>Sign in and see the damage 💀</div>
        </div>
        <div className="auth-card">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="you@gmail.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="btn btn-mint" type="submit" disabled={loading} style={{ width: '100%', padding: '14px', marginTop: 6 }}>
              {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><div className="spinner" />Signing in...</span> : 'Sign In →'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--text-3)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--mint)', textDecoration: 'none', fontWeight: 600 }}>Create one free</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}