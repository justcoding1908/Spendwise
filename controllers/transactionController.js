import supabase from '../config/supabase.js'

// GET /api/transactions - with optional month/year filter
export const getTransactions = async (req, res) => {
  try {
    const month = req.query.month
    const year = req.query.year
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)

    if (month && year) {
      // 🧠 LEARNING: JS Date months are 0-indexed but we're sending 1-indexed
      // So we subtract 1: month=4 (April) → new Date(2026, 3, 1) = April 1st ✅
      const start = `${year}-${String(month).padStart(2, '0')}-01`
      const end = new Date(year, parseInt(month), 0).toISOString().split('T')[0]
      query = query.gte('date', start).lte('date', end)
    }

    const { data, error } = await query.order('date', { ascending: false })

    if (error) return res.status(500).json({ success: false, message: error.message })
    res.json({ success: true, transactions: data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/transactions/stats
export const getStats = async (req, res) => {
  try {
    // 🧠 LEARNING: req.query reads URL parameters
    // When frontend calls /api/transactions/stats?month=4&year=2026
    // req.query = { month: '4', year: '2026' }
    // Note: they come as STRINGS, so we use parseInt() to convert to numbers
    const now = new Date()
    const month = parseInt(req.query.month) || now.getMonth() + 1
    const year  = parseInt(req.query.year)  || now.getFullYear()

    // 🧠 LEARNING: Building date range for SQL filtering
    // padStart(2,'0') ensures "4" becomes "04" — SQL needs YYYY-MM-DD format
    // So April 2026 becomes: startDate = "2026-04-01"
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`

    // 🧠 LEARNING: The "day 0 trick"
    // new Date(2026, 4, 0) means "day 0 of May 2026"
    // Day 0 of any month = last day of previous month
    // So this gives us April 30, 2026 automatically — works for any month!
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    // helpful log — check your terminal when this runs
    console.log(`📊 Stats for: ${startDate} to ${endDate}`)

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('date', startDate)   // 🧠 gte = "greater than or equal" = >=
      .lte('date', endDate)     // 🧠 lte = "less than or equal" = <=

    if (error) return res.status(500).json({ success: false, message: error.message })

    const totalSpent = data.reduce((s, t) => s + Number(t.amount), 0)

    const byCategory = {}
    data.forEach(tx => {
      byCategory[tx.category] = (byCategory[tx.category] || 0) + Number(tx.amount)
    })

    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
    const biggest = data.reduce((max, t) => Number(t.amount) > max ? Number(t.amount) : max, 0)

    res.json({
      success: true,
      stats: {
        totalSpent,
        count: data.length,
        topCategory: topCategory ? topCategory[0] : null,
        biggestTransaction: biggest,
        byCategory,
        month,   // 🧠 send these back so frontend knows what period this data is for
        year
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/transactions - create single transaction
export const createTransaction = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body
    
    if (!amount || !category || !date) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: req.user.id,
        amount: Number(amount),
        category,
        description,
        date
      }])
      .select()

    if (error) return res.status(500).json({ success: false, message: error.message })
    res.json({ success: true, transaction: data[0] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/transactions/bulk - create multiple transactions
export const createBulkTransactions = async (req, res) => {
  try {
    const { transactions } = req.body
    
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid transactions array' })
    }

    const txWithUserId = transactions.map(tx => ({
      ...tx,
      user_id: req.user.id,
      amount: Number(tx.amount)
    }))

    const { data, error } = await supabase
      .from('transactions')
      .insert(txWithUserId)
      .select()

    if (error) return res.status(500).json({ success: false, message: error.message })
    res.json({ success: true, transactions: data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE /api/transactions/:id
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) return res.status(500).json({ success: false, message: error.message })
    res.json({ success: true, message: 'Transaction deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}