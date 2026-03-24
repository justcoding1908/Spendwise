import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <div className="spinner" style={{ width:36, height:36, borderWidth:3 }} />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function Public({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" toastOptions={{
          style: { background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '12px', fontFamily: 'var(--font-body)', fontSize: '14px' },
          success: { iconTheme: { primary: '#00e5a0', secondary: '#000' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} />
        <Routes>
          <Route path="/"          element={<Public><Landing /></Public>} />
          <Route path="/login"     element={<Public><Login /></Public>} />
          <Route path="/register"  element={<Public><Register /></Public>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}