import supabase from '../config/supabase.js'

// GET /api/budgets
export const getBudgets = async (req, res) => {
  try {
    const now = new Date()
    const month = parseInt(req.query.month ?? now.getMonth())
    const year = parseInt(req.query.year ?? now.getFullYear())

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('month', month)
      .eq('year', year)

    if (error) return res.status(500).json({ success: false, message: error.message })
    res.json({ success: true, budgets: data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/budgets
export const setBudget = async (req, res) => {
  try {
    const { category, monthlyLimit, month, year } = req.body

    if (!category || !monthlyLimit || month === undefined || !year)
      return res.status(400).json({ success: false, message: 'All fields required' })

    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        user_id: req.user.id,
        category,
        monthly_limit: monthlyLimit,
        month,
        year
      }, { onConflict: 'user_id,category,month,year' })
      .select()
      .single()

    if (error) return res.status(500).json({ success: false, message: error.message })
    res.json({ success: true, budget: data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE /api/budgets/:id
export const deleteBudget = async (req, res) => {
  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)

    if (error) return res.status(500).json({ success: false, message: error.message })
    res.json({ success: true, message: 'Budget removed' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}