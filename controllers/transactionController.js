import supabase from '../config/supabase.js'
 
// GET /api/transactions
export const getTransactions = async (req, res) => {
  try {
    const { category, search, month, year } = req.query
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false })
 
    if (category && category !== 'All') query = query.eq('category', category)
    if (search) query = query.ilike('merchant', `%${search}%`)
    if (month && year) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`
      const end   = new Date(year, parseInt(month), 0).toISOString().split('T')[0]
      query = query.gte('date', start).lte('date', end)
    }
 
    const { data, error } = await query
    if (error) return res.status(500).json({ success: false, message: error.message })
 
    res.json({ success: true, count: data.length, transactions: data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
 
// POST /api/transactions (single)
export const createTransaction = async (req, res) => {
  try {
    const { merchant, amount, category, date, type, note, raw_sms } = req.body
 
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id:  req.user.id,
        merchant,
        amount,
        category,
        date:     date || new Date().toISOString(),
        type:     type || 'debit',
        note:     note || '',
        raw_sms:  raw_sms || ''
      })
      .select()
      .single()
 
    if (error) return res.status(500).json({ success: false, message: error.message })
    res.status(201).json({ success: true, transaction: data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
 
// POST /api/transactions/bulk
export const createBulkTransactions = async (req, res) => {
  try {
    const { transactions } = req.body
 
    if (!transactions || !transactions.length)
      return res.status(400).json({ success: false, message: 'No transactions provided' })
 
    const withUser = transactions.map(tx => ({
      user_id:  req.user.id,
      merchant: tx.merchant,
      amount:   tx.amount,
      category: tx.category || 'Other',
      date:     tx.date || new Date().toISOString(),
      type:     tx.type || 'debit',
      note:     tx.note || '',
      raw_sms:  tx.raw_sms || tx.rawSMS || ''
    }))
 
    const { data, error } = await supabase
      .from('transactions')
      .insert(withUser)
      .select()
 
    if (error) return res.status(500).json({ success: false, message: error.message })
    res.status(201).json({ success: true, count: data.length, transactions: data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
 
// DELETE /api/transactions/:id
export const deleteTransaction = async (req, res) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
 
    if (error) return res.status(500).json({ success: false, message: error.message })
    res.json({ success: true, message: 'Transaction deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
 
// GET /api/transactions/stats
export const getStats = async (req, res) => {
  try {
    const now   = new Date()
    const month = parseInt(req.query.month) || now.getMonth() + 1
    const year  = parseInt(req.query.year)  || now.getFullYear()
 
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate   = new Date(year, month, 0).toISOString().split('T')[0]
 
    console.log(`📊 Stats for: ${startDate} to ${endDate}`)
 
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('date', startDate)
      .lte('date', endDate)
 
    if (error) return res.status(500).json({ success: false, message: error.message })
 
    const totalSpent = data.reduce((s, t) => s + Number(t.amount), 0)
    const byCategory = {}
    data.forEach(tx => {
      byCategory[tx.category] = (byCategory[tx.category] || 0) + Number(tx.amount)
    })
    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
    const biggest     = data.reduce((max, t) => Number(t.amount) > max ? Number(t.amount) : max, 0)
 
    res.json({
      success: true,
      stats: {
        totalSpent,
        count:              data.length,
        topCategory:        topCategory ? topCategory[0] : null,
        biggestTransaction: biggest,
        byCategory,
        month,
        year
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}