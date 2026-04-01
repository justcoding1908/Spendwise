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