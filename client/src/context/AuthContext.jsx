import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sw_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sw_token')
    if (token) {
      api.get('/auth/me')
        .then(r => { setUser(r.data.user); setLoading(false) })
        .catch(() => { logout(); setLoading(false) })
    } else setLoading(false)
  }, [])

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password })
    localStorage.setItem('sw_token', r.data.token)
    localStorage.setItem('sw_user', JSON.stringify(r.data.user))
    setUser(r.data.user)
    return r.data
  }

  const register = async (name, email, password) => {
    const r = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('sw_token', r.data.token)
    localStorage.setItem('sw_user', JSON.stringify(r.data.user))
    setUser(r.data.user)
    return r.data
  }

  const logout = () => {
    localStorage.removeItem('sw_token')
    localStorage.removeItem('sw_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)