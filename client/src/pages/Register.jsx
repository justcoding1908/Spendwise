import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Fill in everything'); return }
    if (form.password.length < 6) { toast.error('Password needs 6+ characters'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success("You're in! Let's get you sorted 🚀")
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-wrap" style={{ background: 'var(--bg)', position: 'relative' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--mint)', letterSpacing: -0.5, marginBottom: 6 }}>SpendWise</div>
          <div style={{ color: 'var(--text-3)', fontSize: 14 }}>Create your account. Free forever.</div>
        </div>
        <div className="auth-card">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div><label className="input-label">Your name</label><input className="input" type="text" placeholder="Shubh Kaushal" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="input-label">Email</label><input className="input" type="email" placeholder="you@gmail.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="input-label">Password</label><input className="input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            <button className="btn btn-mint" type="submit" disabled={loading} style={{ width: '100%', padding: '14px', marginTop: 6 }}>
              {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><div className="spinner" />Creating account...</span> : 'Create Account →'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--text-3)' }}>
            Already in? <Link to="/login" style={{ color: 'var(--mint)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </div>
          <div style={{ marginTop: 18, padding: '10px 14px', background: 'var(--mint-dim)', borderRadius: 10, fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
            🔒 SMS data stays on your device. Always.
          </div>
        </div>
      </motion.div>
    </div>
  )
}