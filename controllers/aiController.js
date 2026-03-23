import Groq from 'groq-sdk'
import dotenv from 'dotenv'
dotenv.config()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

// POST /api/ai/insight
export const getFinancialInsight = async (req, res) => {
  try {
    const { totalSpent, byCategory, transactionCount, topCategory } = req.body

    if (totalSpent === undefined) {
      return res.status(400).json({ success: false, message: 'Spending data required' })
    }

    const categoryBreakdown = Object.entries(byCategory || {})
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `${cat}: ₹${amt}`)
      .join(', ')

    const prompt = `You are a friendly, witty financial buddy for a college student in India who tracks UPI spending. Talk like a cool friend — casual, fun, slightly roast-y but helpful. Use Indian context.

Their spending this month:
- Total spent: ₹${totalSpent}
- Number of transactions: ${transactionCount || 0}
- Top category: ${topCategory || 'Unknown'}
- Breakdown: ${categoryBreakdown || 'No data'}

Give exactly 3 savage-but-helpful money saving tips. Rules:
- Talk like a friend texting them, NOT a banker
- Use Indian slang naturally (bhai, yaar, bro) — but don't overdo it
- Reference actual apps they use (Swiggy, Zomato, Amazon, Jio, Rapido)
- Roast their spending a little but stay encouraging
- Each tip max 2 sentences
- Format: just 1. 2. 3. with no headers
- End with ONE hype line to motivate them
Example tone: "Bro ₹3k on Swiggy? That's literally a month of groceries 😭 Switch to cooking 3 days a week and watch that number drop."
Return ONLY valid JSON array, zero explanation, zero markdown:
[{"merchant":"Clean Merchant Name","amount":349.00,"category":"Bills","date":"2026-03-03T00:00:00Z","type":"debit"}]
If nothing found: []`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.7
    })

    const insight = response.choices[0].message.content
    res.json({ success: true, insight })

  } catch (error) {
    console.error('Groq API error:', error)
    res.status(500).json({ success: false, message: 'Failed to generate insight' })
  }
}

// POST /api/ai/parse-sms
export const parseSMSWithAI = async (req, res) => {
  try {
    const { smsText } = req.body

    if (!smsText) {
      return res.status(400).json({ success: false, message: 'SMS text required' })
    }

    const prompt = `You are a precise SMS parser for Indian UPI bank messages.

Parse ALL UPI debit transaction SMS messages from this text.

SMS Text:
${smsText}

SBI format: "Dear UPI user A/C XXXXX debited by AMOUNT on date DATE trf to MERCHANT Refno NUMBER"
Date format in SMS: DDMmmYY (example: 03Mar26 means 2026-03-03)

Auto-categorize merchant into one of: Food, Transport, Travel, Shopping, Groceries, Bills, Health, Entertainment, Other

Categorization guide:
- Food: Swiggy, Zomato, Dominos, restaurants, cafes, hotels
- Transport: Uber, Ola, Rapido, metro, IRCTC, bus
- Bills: Jio, Airtel, BSNL, Netflix, Hotstar, electricity, recharge
- Shopping: Amazon, Flipkart, Myntra, Ajio, Nykaa
- Groceries: BigBasket, Blinkit, Zepto, DMart, Grofers
- Health: Apollo, Medplus, 1mg, Pharmeasy, pharmacy
- Entertainment: BookMyShow, PVR, INOX
- Travel: MakeMyTrip, Goibibo, OYO, hotels

Respond ONLY with a valid JSON array. No explanation. No markdown. No code blocks.
Example format:
[{"merchant":"Jio Prepaid Recharge","amount":349.00,"category":"Bills","date":"2026-03-03T00:00:00Z","type":"debit"}]

If no valid transactions found, return exactly: []`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.1
    })

    const responseText = response.choices[0].message.content.trim()

    let transactions = []
    try {
      // Remove markdown code blocks if present
      const cleaned = responseText.replace(/```json|```/g, '').trim()
      transactions = JSON.parse(cleaned)
    } catch {
      // Try to extract JSON array from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          transactions = JSON.parse(jsonMatch[0])
        } catch {
          transactions = []
        }
      }
    }

    res.json({ success: true, count: transactions.length, transactions })

  } catch (error) {
    console.error('SMS parse error:', error)
    res.status(500).json({ success: false, message: 'Failed to parse SMS' })
  }
}

// POST /api/ai/detect-anomalies
export const detectAnomalies = async (req, res) => {
  try {
    const { transactions, byCategory } = req.body

    if (!transactions || !transactions.length) {
      return res.status(400).json({ success: false, anomalies: [] })
    }

    const categoryAverages = {
      Food: 2000,
      Shopping: 3000,
      Transport: 1000,
      Groceries: 2500,
      Bills: 1500,
      Health: 1000,
      Entertainment: 800,
      Travel: 3000
    }

    const anomalies = []

    // High spending detection
    Object.entries(byCategory || {}).forEach(([cat, spent]) => {
      const avg = categoryAverages[cat]
      if (avg && spent > avg * 1.5) {
        anomalies.push({
          type: 'high_spending',
          category: cat,
          amount: spent,
          message: `${cat} spending ₹${spent} is unusually high this month`,
          severity: spent > avg * 2 ? 'high' : 'medium'
        })
      }
    })

    // Large single transaction detection
    transactions.forEach(tx => {
      if (tx.amount > 5000) {
        anomalies.push({
          type: 'large_transaction',
          category: tx.category,
          amount: tx.amount,
          merchant: tx.merchant,
          message: `Large transaction: ₹${tx.amount} at ${tx.merchant}`,
          severity: 'medium'
        })
      }
    })

    // Recurring merchant detection
    const merchantCount = {}
    transactions.forEach(tx => {
      const key = tx.merchant.toLowerCase().split(' ')[0]
      merchantCount[key] = (merchantCount[key] || 0) + 1
    })

    Object.entries(merchantCount).forEach(([key, count]) => {
      if (count >= 2) {
        const tx = transactions.find(t =>
          t.merchant.toLowerCase().startsWith(key)
        )
        if (tx) {
          anomalies.push({
            type: 'recurring',
            merchant: tx.merchant,
            count,
            message: `Recurring payment: ${tx.merchant} appears ${count} times`,
            severity: 'info'
          })
        }
      }
    })

    res.json({ success: true, count: anomalies.length, anomalies })

  } catch (error) {
    console.error('Anomaly detection error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
