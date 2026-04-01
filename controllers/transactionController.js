import supabase from '../config/supabase.js'

// GET /api/transactions
export const getTransactions = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    const month = req.query.month
    const year  = req.query.year

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)

    if (month && year) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`
      const end   = new Date(year, parseInt(month), 0).toISOString().split('T')[0]
      query = query.gte('date', start).lte('date', end)
    }

    const { data, error } = await query.order('date', { ascending: false })

    if (error) {
      console.error('Transaction fetch error:', error)
      return res.status(500).json({ success: false, message: error.message })
    }

    res.json({ success: true, transactions: data })

  } catch (error) {
    console.error('getTransactions error:', error)
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

    if (error) {
      console.error('Get stats error:', error)
      return res.status(500).json({ success: false, message: error.message })
    }

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
        count: data.length,
        topCategory: topCategory ? topCategory[0] : null,
        biggestTransaction: biggest,
        byCategory,
        month,
        year
      }
    })

  } catch (error) {
    console.error('getStats error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/transactions — single transaction (manual entry + receipt scan)
export const createTransaction = async (req, res) => {
  try {
    const { merchant, amount, category, date, type, note } = req.body

    if (!merchant || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: merchant, amount, category, date'
      })
    }

    // 🧠 date arrives as either ISO string ("2026-04-01T00:00:00Z")
    // or plain date string ("2026-04-01") — extract just the date part
    const dateOnly = date.split('T')[0]

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id:     req.user.id,
        merchant:    merchant,
        amount:      Number(amount),
        category:    category,
        date:        dateOnly,
        type:        type || 'debit',
        note:        note || '',
        description: merchant   // keep description in sync with merchant
      }])
      .select()

    if (error) {
      console.error('Create transaction error:', error)
      return res.status(500).json({ success: false, message: error.message })
    }

    res.json({ success: true, transaction: data[0] })

  } catch (error) {
    console.error('createTransaction error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/transactions/bulk — SMS parsed batch (this is what SMSSection uses)
export const createBulkTransactions = async (req, res) => {
  try {
    const { transactions } = req.body

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid transactions array' })
    }

    // 🧠 SMS parser sends: { merchant, amount, category, date (ISO), type, raw_sms }
    // We map each one carefully — date comes as full ISO, we extract just the date part
    const rows = transactions.map(tx => ({
      user_id:     req.user.id,
      merchant:    tx.merchant   || 'Unknown',
      amount:      Number(tx.amount),
      category:    tx.category   || 'Other',
      date:        (tx.date || new Date().toISOString()).split('T')[0],
      type:        tx.type       || 'debit',
      note:        tx.note       || '',
      description: tx.merchant   || 'Unknown',
      raw_sms:     tx.raw_sms    || ''
    }))

    const { data, error } = await supabase
      .from('transactions')
      .insert(rows)
      .select()

    if (error) {
      console.error('Bulk create error:', error)
      return res.status(500).json({ success: false, message: error.message })
    }

    res.json({ success: true, count: data.length, transactions: data })

  } catch (error) {
    console.error('createBulkTransactions error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE /api/transactions/:id
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ success: false, message: 'Transaction ID required' })
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)  // 🔒 RLS double-check — only delete own transactions

    if (error) {
      console.error('Delete transaction error:', error)
      return res.status(500).json({ success: false, message: error.message })
    }

    res.json({ success: true, message: 'Transaction deleted' })

  } catch (error) {
    console.error('deleteTransaction error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}