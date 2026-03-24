import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const features = [
  { icon: '📱', title: 'Paste. Done.', desc: 'Dump your SBI UPI SMS messages. Every transaction auto-extracted — merchant, amount, date, category. Instant.' },
  { icon: '🤖', title: 'AI That Gets You', desc: 'No boring bank-speak. Your AI coach says "bro you spent ₹3k on Swiggy" and tells you exactly what to do.' },
  { icon: '📊', title: 'Charts That Slap', desc: 'See where your money goes with beautiful real-time charts. Daily trends, category splits, weekly patterns.' },
  { icon: '🎯', title: 'Budget Goals', desc: 'Set limits per category. Watch the bar fill up. Feel the pressure. Save money. Repeat.' },
  { icon: '⚡', title: 'Zero Friction', desc: 'No loading. No 5-step signup. Paste SMS → see data → done. Built for people with zero patience.' },
  { icon: '🔒', title: 'Privacy First', desc: 'Your SMS never leaves your device. Only spending totals go to AI. Always private.' },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 60, background: 'rgba(8,9,10,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--mint)', letterSpacing: -0.5 }}>SpendWise</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-mint btn-sm neopop" onClick={() => navigate('/register')}>Get Started →</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 60px', position: 'relative', zIndex: 1 }}>
        {/* Floating mini cards */}
        {[
          { top: '18%', left: '6%', label: 'Jio Recharge', amount: '-₹349', color: '#f59e0b', delay: 0 },
          { top: '28%', right: '5%', label: 'Swiggy Order', amount: '-₹580', color: '#ef4444', delay: 1 },
          { top: '72%', left: '7%', label: 'Uber Cab', amount: '-₹250', color: '#3b82f6', delay: 2 },
          { top: '65%', right: '6%', label: 'Netflix', amount: '-₹649', color: '#7c3aed', delay: 0.5 },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.45, y: [0, -12, 0] }}
            transition={{ delay: c.delay, duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: c.top, left: c.left, right: c.right,
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
              padding: '10px 16px', minWidth: 150, pointerEvents: 'none', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3, fontWeight: 600, letterSpacing: 0.5 }}>JUST NOW</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: c.color, fontWeight: 700 }}>{c.amount}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{c.label}</div>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--mint-dim)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 32, fontSize: 12, color: 'var(--mint)', fontWeight: 700, letterSpacing: 0.5 }}>
            <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 6, height: 6, background: 'var(--mint)', borderRadius: '50%', display: 'inline-block' }} />
            BUILT FOR UPI USERS · INDIA
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 8vw, 92px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: -3, marginBottom: 22, maxWidth: 820 }}>
          Finally know where your{' '}
          <span className="gradient-text">₹₹₹</span>
          {' '}actually goes
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: 17, color: 'var(--text-2)', maxWidth: 460, lineHeight: 1.7, marginBottom: 40 }}>
          Paste your UPI SMS → instant breakdown → AI tells you exactly where you're bleeding money. Takes 30 seconds.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 44 }}>
          <button className="btn btn-mint btn-lg neopop" onClick={() => navigate('/register')}>Track my spending →</button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>I have an account</button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ display: 'flex', gap: 28, color: 'var(--text-3)', fontSize: 13, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['100% Free', 'No app install', 'Privacy first', 'Works instantly'].map((t, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--mint)', fontSize: 10 }}>✦</span> {t}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 32px 80px', maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, letterSpacing: -1.5, marginBottom: 12 }}>
            Everything you need.<br /><span className="gradient-text">Nothing you don't.</span>
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: 15 }}>No subscription. No ads. No nonsense.</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <motion.div key={i} className="card card-glow" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4 }} style={{ padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8, letterSpacing: -0.3 }}>{f.title}</div>
              <div style={{ color: 'var(--text-3)', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 24px 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div className="card" initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ maxWidth: 520, margin: '0 auto', padding: '52px 40px', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>💸</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>Stop wondering where<br />your money went.</h2>
          <p style={{ color: 'var(--text-3)', marginBottom: 28, fontSize: 14, lineHeight: 1.6 }}>Takes 30 seconds. Just paste your SMS and go.</p>
          <button className="btn btn-mint btn-lg neopop" onClick={() => navigate('/register')}>Start for free →</button>
        </motion.div>
      </section>

      <footer style={{ textAlign: 'center', padding: 20, color: 'var(--text-3)', fontSize: 12, borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        SpendWise 2026 · Built for broke college students and young professionals 🫡
      </footer>
    </div>
  )
}