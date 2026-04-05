import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { CATEGORIES, CHART_COLORS, formatCurrency, formatDate, getGreeting } from '../utils/categories'
import { parseUPISMS } from '../utils/smsParser'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

// ── Animated Counter ──────────────────────────────────────────────────────────
function Counter({ value, prefix = '' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!value) { setDisplay(0); return }
    let start = 0
    const step = value / (1000 / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <span>{prefix}{Number(display).toLocaleString('en-IN')}</span>
}

// ── Chart Tooltip ─────────────────────────────────────────────────────────────
function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1a1d24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>
      <div style={{ color: '#64748b', marginBottom: 2 }}>{payload[0].name}</div>
      <div style={{ color: '#00e5a0', fontWeight: 600 }}>{formatCurrency(payload[0].value)}</div>
    </div>
  )
}

// ── Floating Coins ────────────────────────────────────────────────────────────
function FloatingCoins() {
  const coins = [
    { emoji: '₹', top: '10%', left: '3%', delay: 0, dur: 5 },
    { emoji: '💸', top: '70%', left: '2%', delay: 1, dur: 6 },
    { emoji: '📈', top: '20%', right: '3%', delay: 2, dur: 4.5 },
    { emoji: '💰', top: '75%', right: '2%', delay: 0.5, dur: 7 },
  ]
  return (
    <>
      {coins.map((c, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.35, y: [0, -16, 0] }}
          transition={{ delay: c.delay, duration: c.dur, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'fixed', top: c.top, left: c.left, right: c.right, zIndex: 0,
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            backdropFilter: 'blur(8px)', pointerEvents: 'none' }}>
          {c.emoji}
        </motion.div>
      ))}
    </>
  )
}

// ── 3D Hero Card ──────────────────────────────────────────────────────────────
function HeroCard({ stats, user, onAddSMS }) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientY - rect.top - rect.height / 2) / 20
    const y = -(e.clientX - rect.left - rect.width / 2) / 20
    setRotation({ x, y })
  }

  const now = new Date()
  const monthName = now.toLocaleString('en-IN', { month: 'long' })
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()

  return (
    <motion.div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={() => setRotation({ x: 0, y: 0 })}
      animate={{ rotateX: rotation.x, rotateY: rotation.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000,
        background: 'linear-gradient(135deg, #111318 0%, #1a1d24 50%, #111318 100%)',
        border: '1px solid rgba(0,229,160,0.2)', borderRadius: 28, padding: '40px 36px',
        position: 'relative', overflow: 'hidden', cursor: 'default', marginBottom: 24,
        boxShadow: '0 0 0 1px rgba(0,229,160,0.05), 0 40px 80px rgba(0,0,0,0.5)' }}>

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,229,160,0.04) 0%, transparent 50%, rgba(124,58,237,0.04) 100%)', borderRadius: 28, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,229,160,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', borderRadius: 28, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ fontSize: 13, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>
              {getGreeting(user?.name)}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
              {monthName} Spending
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 12, padding: '8px 14px', fontSize: 12, color: '#00e5a0', fontWeight: 600 }}>
            {daysLeft}d left in month
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
          style={{ fontFamily: 'JetBrains Mono', fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 700, color: '#00e5a0', letterSpacing: -3, lineHeight: 1, marginBottom: 20 }}>
          <Counter value={stats.totalSpent || 0} prefix="₹" />
        </motion.div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
          {[
            { label: 'transactions', value: stats.count || 0, mono: true },
            { label: 'top category', value: stats.topCategory ? `${CATEGORIES[stats.topCategory]?.emoji} ${stats.topCategory}` : '—', mono: false },
            { label: 'biggest', value: stats.biggestTransaction ? formatCurrency(stats.biggestTransaction) : '₹0', mono: true },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
              <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontFamily: s.mono ? 'JetBrains Mono' : 'inherit', fontWeight: 600, color: '#94a3b8' }}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        {stats.totalSpent === 0 ? (
          <motion.button className="btn btn-mint neopop" onClick={onAddSMS}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '12px 24px', fontSize: 14 }}>
            📱 Paste your first SMS →
          </motion.button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <motion.button className="btn btn-mint btn-sm neopop" onClick={onAddSMS}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              + Add SMS
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Stat Cards Row ────────────────────────────────────────────────────────────
function StatCards({ stats }) {
  const cards = [
    { label: 'TOTAL SPENT', value: stats.totalSpent || 0, prefix: '₹', color: '#00e5a0', icon: '💸', bg: 'rgba(0,229,160,0.06)' },
    { label: 'TRANSACTIONS', value: stats.count || 0, color: '#f1f5f9', icon: '🧾', bg: 'rgba(255,255,255,0.04)' },
    { label: 'BIGGEST SPEND', value: stats.biggestTransaction || 0, prefix: '₹', color: '#f59e0b', icon: '🔥', bg: 'rgba(245,158,11,0.06)' },
    { label: 'CATEGORIES', value: Object.keys(stats.byCategory || {}).length, color: '#a78bfa', icon: '🗂️', bg: 'rgba(124,58,237,0.06)' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
      {cards.map((c, i) => (
        <motion.div key={i} className="stat-card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.07 }}
          whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
          style={{ background: c.bg, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="stat-label">{c.label}</div>
            <span style={{ fontSize: 20 }}>{c.icon}</span>
          </div>
          <div className="stat-value" style={{ color: c.color, fontSize: 28 }}>
            <Counter value={c.value} prefix={c.prefix || ''} />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Receipt Scanner Modal ─────────────────────────────────────────────────────
function ReceiptScanner({ onAdd, onClose }) {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image too large — max 5MB'); return }
    setError(''); setResult(null); setImage(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }

  const scan = async () => {
    if (!image) return
    setScanning(true); setError('')
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result.split(',')[1]
          const res = await api.post('/ai/scan-receipt', { imageBase64: base64, mimeType: image.type })
          const r = res.data.receipt
          setResult(r)
          setCategory(r.category || 'Other')
        } catch (err) {
          setError(err.response?.data?.message || 'Could not read receipt. Try a clearer photo.')
        }
        setScanning(false)
      }
      reader.readAsDataURL(image)
    } catch {
      setError('Something went wrong. Try again.')
      setScanning(false)
    }
  }

  const confirm = async () => {
    if (!result) return
    try {
      await api.post('/transactions', {
        merchant: result.vendor,
        amount: result.amount,
        category,
        date: result.date,
        type: 'debit',
        note: 'Added via receipt scan'
      })
      toast.success(`₹${result.amount} at ${result.vendor} added! 🧾`)
      onAdd(); onClose()
    } catch { toast.error('Failed to add transaction') }
  }

  const CATS = ['Food','Transport','Travel','Shopping','Groceries','Bills','Health','Entertainment','Other']

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999,
        backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        style={{ background: '#111318', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 24,
          width: '100%', maxWidth: 460, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(0,229,160,0.08), rgba(124,58,237,0.06))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 }}>🧾 Scan Receipt</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Upload a photo — AI extracts everything</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Drop zone */}
          {!result && (
            <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${preview ? 'rgba(0,229,160,0.4)' : 'var(--border)'}`,
                borderRadius: 16, padding: preview ? 0 : '36px 24px', textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.2s', overflow: 'hidden',
                background: preview ? 'transparent' : 'var(--surface-2)' }}>
              <input ref={fileRef} type="file" accept="image/*" capture="environment"
                style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
              {preview ? (
                <img src={preview} alt="Receipt" style={{ width: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 14, display: 'block' }} />
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                  <div style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 600, marginBottom: 6 }}>Click to upload or drag & drop</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>JPG, PNG up to 5MB</div>
                  <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--surface-3)', padding: '4px 10px', borderRadius: 20 }}>📸 Camera</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--surface-3)', padding: '4px 10px', borderRadius: 20 }}>🖼️ Gallery</span>
                  </div>
                </>
              )}
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, fontSize: 13, color: '#ef4444' }}>
              ⚠️ {error}
            </div>
          )}

          {preview && !result && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => { setPreview(null); setImage(null) }} style={{ padding: '12px 20px', fontSize: 13 }}>🔄 Retake</button>
              <button className="btn btn-mint" onClick={scan} disabled={scanning} style={{ flex: 1, padding: '12px', fontSize: 13 }}>
                {scanning
                  ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><div className="spinner" /> Scanning receipt...</span>
                  : '🔍 Scan with AI'}
              </button>
            </div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: 16, background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--mint)', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>✅ RECEIPT SCANNED</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[['VENDOR', result.vendor, 'var(--text)', false], ['AMOUNT', `₹${result.amount}`, '#00e5a0', true], ['DATE', result.date, 'var(--text-2)', false], ['AI CATEGORY', result.category, 'var(--text-2)', false]].map(([label, val, color, mono]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color, fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">Confirm Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {CATS.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      style={{ padding: '6px 14px', borderRadius: 20,
                        border: `1px solid ${category === cat ? 'var(--mint)' : 'var(--border)'}`,
                        background: category === cat ? 'var(--mint-dim)' : 'transparent',
                        color: category === cat ? 'var(--mint)' : 'var(--text-3)',
                        fontSize: 12, fontWeight: category === cat ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" onClick={() => { setResult(null); setPreview(null); setImage(null) }} style={{ padding: '12px 20px', fontSize: 13 }}>🔄 Rescan</button>
                <button className="btn btn-mint" onClick={confirm} style={{ flex: 1, padding: '12px', fontSize: 13 }}>✅ Add Transaction</button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── SMS Parser Section ────────────────────────────────────────────────────────
function SMSSection({ onSave, onOpenReceiptScanner }) {
  const [tab, setTab] = useState('sms')
  const [smsText, setSmsText] = useState('')
  const [parsed, setParsed] = useState([])
  const [unrecognized, setUnrecognized] = useState([])
  const [saving, setSaving] = useState(false)
  const [manual, setManual] = useState({ merchant: '', amount: '', category: 'Food', date: '', note: '' })

  const handleChange = (e) => {
    const val = e.target.value; setSmsText(val)
    if (val.trim()) { const r = parseUPISMS(val); setParsed(r.parsed); setUnrecognized(r.unrecognized) }
    else { setParsed([]); setUnrecognized([]) }
  }

  const handleSave = async () => {
    if (!parsed.length) return
    setSaving(true)
    try {
      const res = await api.post('/transactions/bulk', { transactions: parsed })

      // Find "Other" vendors to send to LLM categorizer
      const savedTxns = res.data.transactions || []
      const otherVendors = savedTxns
        .filter(tx => tx.category === 'Other')
        .reduce((acc, tx) => {
          const existing = acc.find(v => v.merchant === tx.merchant)
          if (existing) {
            existing.ids.push(tx.id)
          } else {
            acc.push({
              merchant: tx.merchant,
              amount:   tx.amount,
              date:     tx.date,
              ids:      [tx.id]
            })
          }
          return acc
        }, [])

      toast.success(`${parsed.length} transactions saved! 🔥`)
      onSave(otherVendors)
      setSmsText(''); setParsed([]); setUnrecognized([])
    } catch { toast.error('Failed to save') }
    setSaving(false)
  }

  const handleManual = async () => {
    if (!manual.merchant || !manual.amount) { toast.error('Merchant and amount required'); return }
    try {
      await api.post('/transactions', {
        merchant: manual.merchant, amount: parseFloat(manual.amount),
        category: manual.category,
        date: manual.date ? new Date(manual.date).toISOString() : new Date().toISOString(),
        type: 'debit', note: manual.note
      })
      toast.success('Added! 🎯'); onSave()
      setManual({ merchant: '', amount: '', category: 'Food', date: '', note: '' })
    } catch { toast.error('Failed to add') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
      className="section" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="section-title">📱 Add Transactions</div>
          <div className="section-sub">Paste your SBI UPI SMS or add manually</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', padding: 4, borderRadius: 10 }}>
            {[['sms', '📱 Paste SMS'], ['manual', '✏️ Manual']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                  background: tab === id ? 'var(--mint)' : 'transparent',
                  color: tab === id ? '#000' : 'var(--text-3)' }}>
                {label}
              </button>
            ))}
          </div>
          <button className="btn btn-outline btn-sm" onClick={onOpenReceiptScanner}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            🧾 Scan Receipt
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'sms' && (
          <motion.div key="sms" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label className="input-label">Paste SBI UPI messages</label>
              <textarea className="input" style={{ height: 260 }}
                placeholder={"Dear UPI user A/C XXXXX debited by 349.00 on date 03Mar26 trf to Jio Prepaid Rech Refno 606239689420\n\nPaste multiple messages..."}
                value={smsText} onChange={handleChange} />
              <motion.button className="btn btn-mint" style={{ width: '100%', marginTop: 12, padding: '13px' }}
                onClick={handleSave} disabled={!parsed.length || saving} whileTap={{ scale: 0.98 }}>
                {saving
                  ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><div className="spinner" />Saving...</span>
                  : parsed.length > 0 ? `Save ${parsed.length} transaction${parsed.length !== 1 ? 's' : ''} →` : 'Paste SMS above first'}
              </motion.button>
            </div>
            <div>
              <label className="input-label">Live Preview</label>
              <div style={{ height: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {!parsed.length && !unrecognized.length && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', fontSize: 13 }}>
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 36, marginBottom: 8 }}>👀</motion.div>
                    Transactions appear here as you type
                  </div>
                )}
                <AnimatePresence>
                  {parsed.map((tx, i) => {
                    const conf = CATEGORIES[tx.category] || CATEGORIES.Other
                    return (
                      <motion.div key={tx.id} initial={{ opacity: 0, x: 20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: i * 0.05 }}
                        style={{ background: 'var(--surface-2)', border: '1px solid rgba(0,229,160,0.12)', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{tx.merchant}</span>
                          <span style={{ fontFamily: 'JetBrains Mono', color: '#ef4444', fontWeight: 700 }}>-{formatCurrency(tx.amount)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: '#00e5a0' }}>{conf.emoji} {tx.category}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{formatDate(tx.date)}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                {unrecognized.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 6, fontWeight: 700 }}>⚠️ UNRECOGNIZED ({unrecognized.length})</div>
                    {unrecognized.map((u, i) => (
                      <div key={i} style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace', marginBottom: 4, wordBreak: 'break-all' }}>
                        {u.slice(0, 120)}...
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'manual' && (
          <motion.div key="manual" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="input-label">Merchant *</label><input className="input" placeholder="e.g. Swiggy Food Order" value={manual.merchant} onChange={e => setManual({ ...manual, merchant: e.target.value })} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label className="input-label">Amount (₹) *</label><input className="input" type="number" placeholder="0.00" value={manual.amount} onChange={e => setManual({ ...manual, amount: e.target.value })} /></div>
              <div><label className="input-label">Date</label><input className="input" type="date" value={manual.date} onChange={e => setManual({ ...manual, date: e.target.value })} /></div>
            </div>
            <div><label className="input-label">Category</label>
              <select className="input" value={manual.category} onChange={e => setManual({ ...manual, category: e.target.value })}>
                {Object.keys(CATEGORIES).filter(c => c !== 'Unusual').map(c => <option key={c} value={c}>{CATEGORIES[c].emoji} {c}</option>)}
              </select>
            </div>
            <motion.button className="btn btn-mint" onClick={handleManual} style={{ width: '100%', padding: '13px' }} whileTap={{ scale: 0.98 }}>+ Add Transaction</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Transactions Section ──────────────────────────────────────────────────────
function TxnsSection({ transactions, onDelete }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showAll, setShowAll] = useState(false)

  const filtered = transactions.filter(tx =>
    tx.merchant.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'All' || tx.category === filter)
  )
  const displayed = showAll ? filtered : filtered.slice(0, 8)
  const merchantCounts = {}
  transactions.forEach(tx => {
    const key = tx.merchant.toLowerCase().split(' ')[0]
    merchantCounts[key] = (merchantCounts[key] || 0) + 1
  })

  const exportCSV = () => {
    const rows = [['Date','Merchant','Category','Amount'], ...transactions.map(tx => [formatDate(tx.date), tx.merchant, tx.category, tx.amount])]
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'spendwise.csv'; a.click()
    toast.success('Exported! 📥')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
      className="section" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div className="section-title">💳 Transactions</div>
          <div className="section-sub">{filtered.length} total · {transactions.length} this period</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={exportCSV}>📥 CSV</button>
      </div>

      <input className="input" style={{ marginBottom: 14 }} placeholder="🔍  Search merchant..." value={search} onChange={e => setSearch(e.target.value)} />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {['All', ...Object.keys(CATEGORIES)].map(f => (
          <motion.button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} whileTap={{ scale: 0.95 }}>
            {f !== 'All' ? CATEGORIES[f]?.emoji + ' ' : ''}{f}
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 40, marginBottom: 12 }}>🕳️</motion.div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Nothing here</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence>
              {displayed.map((tx, i) => {
                const conf = CATEGORIES[tx.category] || CATEGORIES.Other
                const isRec = merchantCounts[tx.merchant.toLowerCase().split(' ')[0]] >= 2
                return (
                  <motion.div key={tx.id} className="tx-row" layout
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: i * 0.025 }} style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <motion.div className="cat-dot" whileHover={{ scale: 1.15, rotate: 10 }}
                        style={{ background: conf.bg, color: conf.color, width: 40, height: 40, borderRadius: 12 }}>
                        {conf.emoji}
                      </motion.div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{tx.merchant}</span>
                          {isRec && <span className="badge badge-mint">🔄 recurring</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{tx.category} · {formatDate(tx.date)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'JetBrains Mono', color: '#ef4444', fontWeight: 700, fontSize: 14 }}>-{formatCurrency(tx.amount)}</span>
                      <motion.button onClick={() => onDelete(tx.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 15, padding: '2px 6px', borderRadius: 6, transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none' }}>✕</motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
          {filtered.length > 8 && (
            <motion.button className="btn btn-ghost" onClick={() => setShowAll(!showAll)} style={{ width: '100%', marginTop: 12, padding: '12px' }}>
              {showAll ? '↑ Show less' : `↓ Show all ${filtered.length} transactions`}
            </motion.button>
          )}
        </>
      )}
    </motion.div>
  )
}

// ── Analytics Section ─────────────────────────────────────────────────────────
function AnalyticsSection({ transactions, stats }) {
  const catData = Object.entries(stats.byCategory || {}).map(([name, value]) => ({ name, value }))
  const now = new Date()
  const weeks = [0, 0, 0, 0]
  transactions.forEach(tx => {
    const d = new Date(tx.date)
    const diff = Math.floor((now - d) / (7 * 24 * 60 * 60 * 1000))
    if (diff >= 0 && diff < 4) weeks[3 - diff] += tx.amount
  })
  const weeklyData = ['3w ago', '2w ago', 'Last wk', 'This wk'].map((name, i) => ({ name, amount: weeks[i] }))

  if (!transactions.length) return null

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
      <div className="section">
        <div className="section-title" style={{ marginBottom: 4 }}>📊 Category Split</div>
        <div className="section-sub" style={{ marginBottom: 16 }}>Where your money actually goes</div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value">
                {catData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {catData.sort((a, b) => b.value - a.value).slice(0, 4).map((d, i) => (
            <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {CATEGORIES[d.name]?.emoji} {d.name}
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-2)' }}>{formatCurrency(d.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-title" style={{ marginBottom: 4 }}>📈 Weekly Trend</div>
        <div className="section-sub" style={{ marginBottom: 16 }}>Last 4 weeks</div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={weeklyData} barSize={42}>
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {weeklyData.map((_, i) => <Cell key={i} fill={i === 3 ? '#00e5a0' : 'rgba(0,229,160,0.3)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

// ── Budget Section ────────────────────────────────────────────────────────────
function BudgetSection({ stats }) {
  const now = new Date()
  const [budgets, setBudgets] = useState({})
  const [editing, setEditing] = useState(false)
  const [temp, setTemp] = useState({})

  useEffect(() => {
    api.get(`/budgets?month=${now.getMonth()}&year=${now.getFullYear()}`)
      .then(r => {
        const map = {}
        r.data.budgets.forEach(b => { map[b.category] = b.monthly_limit })
        setBudgets(map)
      }).catch(() => {})
  }, [])

  const save = async () => {
    try {
      await Promise.all(Object.entries(temp).filter(([, v]) => v).map(([category, limit]) =>
        api.post('/budgets', { category, monthlyLimit: Number(limit), month: now.getMonth(), year: now.getFullYear() })
      ))
      setBudgets(prev => ({ ...prev, ...Object.fromEntries(Object.entries(temp).filter(([, v]) => v).map(([k, v]) => [k, Number(v)])) }))
      toast.success('Budgets saved! 🎯'); setEditing(false); setTemp({})
    } catch { toast.error('Failed to save budgets') }
  }

  const cats = Object.keys(CATEGORIES).filter(c => c !== 'Unusual')
  const pClass = (p) => p >= 100 ? 'progress-red' : p >= 80 ? 'progress-amber' : 'progress-mint'

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
      className="section" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div className="section-title">🎯 Budget Goals</div>
          <div className="section-sub">Monthly limits per category</div>
        </div>
        {!editing
          ? <button className="btn btn-outline btn-sm" onClick={() => { setTemp({ ...budgets }); setEditing(true) }}>✏️ Set Limits</button>
          : <button className="btn btn-mint btn-sm" onClick={save}>💾 Save</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {cats.map((cat, i) => {
          const spent = stats.byCategory?.[cat] || 0
          const limit = budgets[cat] || 0
          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
          const conf = CATEGORIES[cat]
          return (
            <motion.div key={cat} className="card" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2 }} style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{conf.emoji}</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{cat}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-2)' }}>{formatCurrency(spent)}</span>
                  {limit > 0 && <span style={{ fontSize: 11, color: pct >= 80 ? '#ef4444' : '#00e5a0', fontWeight: 700 }}>{Math.round(pct)}%</span>}
                </div>
              </div>
              {editing ? (
                <input className="input" type="number" placeholder="Monthly limit ₹" style={{ fontSize: 13, padding: '8px 12px' }}
                  value={temp[cat] || ''} onChange={e => setTemp({ ...temp, [cat]: e.target.value })} />
              ) : (
                <>
                  <div className="progress-track">
                    <motion.div className={`progress-fill ${pClass(pct)}`} initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>
                    {limit > 0 ? `${formatCurrency(spent)} of ${formatCurrency(limit)}` : 'No limit — tap Set Limits'}
                  </div>
                  {pct >= 80 && limit > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ marginTop: 6, fontSize: 11, color: pct >= 100 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                      {pct >= 100 ? '🚨 Over budget!' : '⚠️ Almost there!'}
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── AI Bubble ─────────────────────────────────────────────────────────────────
function parseInsight(text) {
  if (!text) return []
  const sections = [
    { emoji: '💸', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
    { emoji: '📊', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
    { emoji: '🎯', color: '#00e5a0', bg: 'rgba(0,229,160,0.08)', border: 'rgba(0,229,160,0.15)' },
    { emoji: '🔥', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.15)' },
    { emoji: '⚡', color: '#eab308', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.15)' },
  ]
  return sections.map(s => {
    const regex = new RegExp(`${s.emoji}\\s*(.+?)(?=💸|📊|🎯|🔥|⚡|$)`, 's')
    const match = text.match(regex)
    return match ? { ...s, text: match[1].trim() } : null
  }).filter(Boolean)
}

function AIBubble({ stats, transactions }) {
  const [open, setOpen] = useState(false)
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [visibleCards, setVisibleCards] = useState(0)

  const generate = async () => {
    if (!transactions.length) { toast.error('Add transactions first!'); return }
    setLoading(true); setInsight(''); setVisibleCards(0); setHasGenerated(true)
    try {
      const res = await api.post('/ai/insight', {
        totalSpent: stats.totalSpent,
        byCategory: stats.byCategory,
        transactionCount: stats.count,
        topCategory: stats.topCategory,
      })
      const text = res.data.insight
      setInsight(text)
      const parsed = parseInsight(text)
      parsed.forEach((_, i) => setTimeout(() => setVisibleCards(i + 1), i * 300))
    } catch { toast.error('AI is sleeping 😴 Try again!') }
    setLoading(false)
  }

  const cards = parseInsight(insight)

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9997, backdropFilter: 'blur(4px)' }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ position: 'fixed', bottom: 90, right: 24, width: 370, zIndex: 9998,
              background: '#111318', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 24,
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>

            <div style={{ background: 'linear-gradient(135deg, rgba(0,229,160,0.12), rgba(124,58,237,0.08))', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: 28 }}>🤖</motion.div>
                  <div>
                    <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 15, fontWeight: 700 }}>SpendWise AI</div>
                    <div style={{ fontSize: 11, color: '#00e5a0', fontWeight: 600 }}>● online · Powered by Groq</div>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, padding: 4 }}>✕</button>
              </div>
            </div>

            <div style={{ padding: '16px', minHeight: 150, maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!hasGenerated && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-2)' }}>
                    Hey! I'm your AI finance buddy.<br />
                    I'll <strong style={{ color: '#ef4444' }}>roast your spending</strong> and give you{' '}
                    <strong style={{ color: '#00e5a0' }}>actual tips</strong> — not boring bank advice.
                  </div>
                </motion.div>
              )}

              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1, 2, 3].map(i => (
                    <motion.div key={i} animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      style={{ height: 64, borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--border)' }} />
                  ))}
                  <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Analyzing your spending... 🔍</div>
                </div>
              )}

              {cards.map((card, i) => i < visibleCards && (
                <motion.div key={i} initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35 }}
                  style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: `${card.color}22`, border: `1px solid ${card.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {card.emoji}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-2)', paddingTop: 2 }}>
                    {card.emoji === '⚡' ? <strong style={{ color: card.color }}>{card.text}</strong> : card.text}
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <motion.button className="btn btn-mint" onClick={generate} disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 13 }} whileTap={{ scale: 0.97 }}>
                {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><div className="spinner" />Thinking...</span>
                  : hasGenerated ? '🔄 Ask again' : '⚡ Get my roast'}
              </motion.button>
            </div>
            <div style={{ padding: '0 16px 14px', fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>
              🔒 Only spending totals sent · SMS stays on your device
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setOpen(!open)} animate={{ scale: open ? 0.9 : 1 }} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, width: 58, height: 58, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #00e5a0, #00c5ff)', boxShadow: '0 8px 32px rgba(0,229,160,0.4)', fontSize: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>{open ? '✕' : '🤖'}</motion.span>
      </motion.button>

      {!open && (
        <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }}
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9998, width: 58, height: 58, borderRadius: '50%', border: '2px solid rgba(0,229,160,0.4)', pointerEvents: 'none' }} />
      )}
    </>
  )
}

// ── Unknown Vendor Popup ─────────────────────────────────────────────────────
function UnknownVendorPopup({ vendors, onFetchData, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState('')
  const [saving, setSaving] = useState(false)

  const vendor = vendors[currentIdx]
  const goNext = () => {
    if (currentIdx < vendors.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setSelected('')
    } else {
      onComplete()
    }
  }

  const handleConfirm = async () => {
    if (!selected) { toast.error('Pick a category first'); return }
    setSaving(true)
    try {
      await Promise.all(
        vendor.ids.map(id =>
          api.patch(`/transactions/${id}/category`, { category: selected })
        )
      )
      toast.success(`${vendor.merchant} → ${selected} ✅`)
      goNext()
    } catch { toast.error('Failed to update') }
    setSaving(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onComplete}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 5000, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111318', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 24,
          padding: 32, maxWidth: 420, width: '90%', zIndex: 5001, boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
        }} >

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>
            Unknown Vendor · {currentIdx + 1}/{vendors.length}
          </div>
          <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            {vendor.merchant}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {formatCurrency(vendor.amount)} · {formatDate(vendor.date)}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="input-label">Pick a category</label>
          <select className="input" value={selected} onChange={e => setSelected(e.target.value)}
            style={{ fontSize: 13, padding: '10px 12px' }}>
            <option value="">Select category...</option>
            {Object.keys(CATEGORIES).filter(c => c !== 'Unusual' && c !== 'Other').map(c =>
              <option key={c} value={c}>{CATEGORIES[c].emoji} {c}</option>
            )}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button className="btn btn-ghost" onClick={goNext} style={{ flex: 1 }} whileTap={{ scale: 0.98 }}>
            Skip
          </motion.button>
          <motion.button className="btn btn-mint" onClick={handleConfirm} disabled={!selected || saving} style={{ flex: 1, padding: '12px' }} whileTap={{ scale: 0.98 }}>
            {saving ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><div className="spinner" />Saving...</span> : 'Confirm'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ user, onLogout }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <motion.nav className="navbar" initial={{ y: -60 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
      <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 18, fontWeight: 800, color: '#00e5a0', letterSpacing: -0.5, marginRight: 16, flexShrink: 0 }}>
        SpendWise
      </div>
      <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {[['hero', '⚡ Overview'], ['sms-section', '📱 Add SMS'], ['txns-section', '💳 Transactions'], ['analytics-section', '📊 Analytics'], ['budget-section', '🎯 Budget']].map(([id, label]) => (
          <button key={id} className="nav-item" onClick={() => scrollTo(id)}>{label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text-3)' }}><span style={{ fontSize: 16 }}>👤</span> {user?.name?.split(' ')[0]}</div>
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
      </div>
    </motion.nav>
  )
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({ totalSpent: 0, count: 0, byCategory: {}, topCategory: null, biggestTransaction: 0 })
  const [loading, setLoading] = useState(true)
  const [showReceiptScanner, setShowReceiptScanner] = useState(false)  // ← state lives here
  const [showVendorPopup, setShowVendorPopup] = useState(false)
  const [unknownVendors, setUnknownVendors] = useState([])

  const fetchData = useCallback(async () => {
    try {
      const [txRes, statsRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/transactions/stats')
      ])
      setTransactions(txRes.data.transactions || [])
      setStats(statsRes.data.stats || {})
    } catch { toast.error('Failed to load data') }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`)
      toast.success('Deleted!')
      fetchData()
    } catch { toast.error('Failed to delete') }
  }

  const handleLogout = () => { logout(); toast.success('See ya! 👋') }
  const scrollToSMS = () => document.getElementById('sms-section')?.scrollIntoView({ behavior: 'smooth' })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 40, height: 40, border: '3px solid rgba(0,229,160,0.15)', borderTop: '3px solid #00e5a0', borderRadius: '50%' }} />
      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
        style={{ color: 'var(--text-3)', fontSize: 14 }}>Loading your finances...</motion.div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      <FloatingCoins />
      <Navbar user={user} onLogout={handleLogout} />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 20px 100px', position: 'relative', zIndex: 1 }}>
        <div id="hero">
          <HeroCard stats={stats} user={user} onAddSMS={scrollToSMS} />
          <StatCards stats={stats} />
        </div>

        <div id="sms-section">
          {/* onOpenReceiptScanner prop passes the setter down */}
          <SMSSection
            onSave={(otherVendors) => {
              fetchData()
              if (otherVendors?.length > 0) {
                setUnknownVendors(otherVendors)
                setShowVendorPopup(true)
              }
            }}
            onOpenReceiptScanner={() => setShowReceiptScanner(true)}
          />
        </div>

        <div id="txns-section">
          <TxnsSection transactions={transactions} onDelete={handleDelete} />
        </div>

        <div id="analytics-section">
          <AnalyticsSection transactions={transactions} stats={stats} />
        </div>

        <div id="budget-section">
          <BudgetSection stats={stats} />
        </div>
      </main>

      {/* Receipt Scanner Modal — renders at top level in Dashboard */}
      <AnimatePresence>
        {showReceiptScanner && (
          <ReceiptScanner
            onAdd={fetchData}
            onClose={() => setShowReceiptScanner(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVendorPopup && unknownVendors.length > 0 && (
          <UnknownVendorPopup
            vendors={unknownVendors}
            onFetchData={fetchData}
            onComplete={() => {
              setShowVendorPopup(false)
              setUnknownVendors([])
            }}
          />
        )}
      </AnimatePresence>

      <AIBubble stats={stats} transactions={transactions} />
    </div>
  )
}