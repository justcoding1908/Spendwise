export const CATEGORIES = {
  Food:          { emoji: '🍔', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  Transport:     { emoji: '🚗', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  Travel:        { emoji: '✈️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  Shopping:      { emoji: '🛍️', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  Groceries:     { emoji: '🛒', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'  },
  Bills:         { emoji: '💡', color: '#eab308', bg: 'rgba(234,179,8,0.12)'  },
  Health:        { emoji: '🏥', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  Entertainment: { emoji: '🎬', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)'  },
  Other:         { emoji: '📦', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)'},
  Unusual:       { emoji: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
}

export const CHART_COLORS = [
  '#00e5a0','#7c3aed','#f97316','#3b82f6',
  '#ec4899','#06b6d4','#eab308','#f43f5e','#94a3b8'
]

export function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN')
}

export function formatDate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getGreeting(name) {
  const h = new Date().getHours()
  const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${time}, ${name?.split(' ')[0] || 'there'} 👋`
}