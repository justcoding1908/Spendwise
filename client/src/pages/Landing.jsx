import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const features = [
  { icon: '📱', title: 'Paste. Done.', desc: 'Dump your SBI UPI SMS messages. We extract every transaction in seconds — merchant, amount, date, category. All automatic.' },
  { icon: '🤖', title: 'AI That Gets You', desc: 'No boring bank-speak. Your AI coach actually says "bro you spent ₹3k on Swiggy" and tells you what to do about it.' },
  { icon: '📊', title: 'Charts That Slap', desc: 'See exactly where your money goes with beautiful real-time charts. Daily trends, category breakdowns, weekly patterns.' },
  { icon: '🎯', title: 'Budget Goals', desc: 'Set limits for each category. Watch the progress bar fill up. Feel the anxiety. Save money. Repeat.' },
  { icon: '⚡', title: 'Instant Everything', desc: 'No loading screens. No sign-in with 5 steps. Paste SMS → see data → done. Built for people with zero patience.' },
  { icon: '🔒', title: 'Your SMS Stays Yours', desc: 'Nothing leaves your device. Only spending totals go to AI. Your bank messages are private. Always.' },
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
          <button className="btn btn-mint btn-sm" onClick={() => navigate('/register')}>Get Started →</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 60px', position: 'relative', zIndex: 1 }}>

        {/* Floating cards behind */}
        <div style={{ position: 'absolute', top: '15%', left: '5%', opacity: 0.4 }}>
          <div className="float-card card" style={{ padding: '12px 16px', minWidth: 160 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>JUST NOW</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--mint)' }}>-₹349</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Jio Recharge</div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: '25%', right: '6%', opacity: 0.35, animationDelay: '1s' }}>
          <div className="float-card card" style={{ padding: '12px 16px', minWidth: 160 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>2 MINS AGO</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--red)' }}>-₹580</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Swiggy Food Order</div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: '20%', left: '8%', opacity: 0.3, animationDelay: '2s' }}>
          <div className="float-card card" style={{ padding: '12px 16px', minWidth: 160 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>TODAY</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--amber)' }}>-₹250</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Uber Cab</div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--mint-dim)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 36, fontSize: 12, color: 'var(--mint)', fontWeight: 600, letterSpacing: 0.5 }}>
            <span style={{ width: 6, height: 6, background: 'var(--mint)', borderRadius: '50%', display: 'inline-block', animation: 'spin 3s linear infinite' }} />
            BUILT FOR UPI USERS IN INDIA
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 8vw, 96px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: -3, marginBottom: 24, maxWidth: 800 }}>
          Finally know where your{' '}
          <span className="gradient-text">₹₹₹</span>
          {' '}actually goes
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
          style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 480, lineHeight: 1.7, marginBottom: 44 }}>
          Paste your UPI SMS messages. Get instant breakdown. AI tells you exactly where you're bleeding money.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
          <button className="btn btn-mint btn-lg neopop" onClick={() => navigate('/register')}>
            Track my spending →
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>
            I have an account
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ display: 'flex', gap: 32, color: 'var(--text-3)', fontSize: 13 }}>
          {['100% Free', 'No signup BS', 'Privacy first', 'Works offline'].map((t, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--mint)', fontSize: 10 }}>✦</span> {t}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 40px', maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, letterSpacing: -1.5, marginBottom: 14 }}>
            Everything you need.<br />
            <span className="gradient-text">Nothing you don't.</span>
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: 15 }}>No subscription. No ads. No nonsense.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <motion.div key={i} className="card card-glow card-lift" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              style={{ padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 10, letterSpacing: -0.3 }}>{f.title}</div>
              <div style={{ color: 'var(--text-3)', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '60px 24px 100px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div className="card" initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ maxWidth: 560, margin: '0 auto', padding: '56px 40px', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>💸</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 14 }}>
            Stop wondering where<br />your money went.
          </h2>
          <p style={{ color: 'var(--text-3)', marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>Takes 30 seconds to set up. Just paste your SMS and go.</p>
          <button className="btn btn-mint btn-lg neopop" onClick={() => navigate('/register')}>
            Start for free — it's instant
          </button>
        </motion.div>
      </section>

      <footer style={{ textAlign: 'center', padding: 24, color: 'var(--text-3)', fontSize: 12, borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        SpendWise 2026 · Built for broke college students and young professionals 🫡
      </footer>
    </div>
  )
}