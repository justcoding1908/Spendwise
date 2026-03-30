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
      .join('\n')

    const prompt = `You are a brutally honest but caring financial coach for a college student in India. You talk like a close friend — casual, witty, Gen-Z energy. You know Indian apps, Indian prices, Indian student life.

Here is their UPI spending this month:
Total spent: ₹${totalSpent}
Transactions: ${transactionCount || 0}
Top category: ${topCategory || 'Unknown'}
Category breakdown:
${categoryBreakdown || 'No data'}

Your job: Give them a SHORT, punchy financial reality check. 

FORMAT YOUR RESPONSE EXACTLY LIKE THIS — use these exact emoji markers:

💸 [One savage but funny one-liner roasting their biggest spend. Max 1 sentence.]

📊 [Tip 1 — specific, actionable, references their actual categories. Max 2 sentences.]

🎯 [Tip 2 — a concrete challenge or habit they can start TODAY. Max 2 sentences.]

🔥 [Tip 3 — a money hack relevant to Indian students. Max 2 sentences.]

⚡ [One short hype line to motivate them. Max 1 sentence.]

RULES:
- Use Indian context: Swiggy, Zomato, Jio, Rapido, IRCTC, UPI, etc.
- Use Indian slang naturally: bhai, yaar, bro — but max once or twice total
- Reference their ACTUAL numbers from the breakdown above
- Be specific, not generic. "You spent ₹X on Y" not "you spend too much"
- Each section separated by a blank line
- NO numbered lists, NO headers, NO bullet points — just the emoji + text
- Total response should be under 180 words`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a witty, caring financial coach for Indian college students. You give sharp, specific, emoji-formatted advice. Never use numbered lists. Always reference actual spending numbers.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.75
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
      const cleaned = responseText.replace(/```json|```/g, '').trim()
      transactions = JSON.parse(cleaned)
    } catch {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try { transactions = JSON.parse(jsonMatch[0]) } catch { transactions = [] }
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
      Food: 2000, Shopping: 3000, Transport: 1000,
      Groceries: 2500, Bills: 1500, Health: 1000,
      Entertainment: 800, Travel: 3000
    }

    const anomalies = []

    Object.entries(byCategory || {}).forEach(([cat, spent]) => {
      const avg = categoryAverages[cat]
      if (avg && spent > avg * 1.5) {
        anomalies.push({
          type: 'high_spending', category: cat, amount: spent,
          message: `${cat} spending ₹${spent} is unusually high this month`,
          severity: spent > avg * 2 ? 'high' : 'medium'
        })
      }
    })

    transactions.forEach(tx => {
      if (tx.amount > 5000) {
        anomalies.push({
          type: 'large_transaction', category: tx.category,
          amount: tx.amount, merchant: tx.merchant,
          message: `Large transaction: ₹${tx.amount} at ${tx.merchant}`,
          severity: 'medium'
        })
      }
    })

    const merchantCount = {}
    transactions.forEach(tx => {
      const key = tx.merchant.toLowerCase().split(' ')[0]
      merchantCount[key] = (merchantCount[key] || 0) + 1
    })

    Object.entries(merchantCount).forEach(([key, count]) => {
      if (count >= 2) {
        const tx = transactions.find(t => t.merchant.toLowerCase().startsWith(key))
        if (tx) {
          anomalies.push({
            type: 'recurring', merchant: tx.merchant, count,
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

// POST /api/ai/scan-receipt
export const scanReceipt = async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Image required' })
    }

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`
              }
            },
            {
              type: 'text',
              text: `You are a receipt parser. Extract information from this receipt image.

Respond ONLY with a valid JSON object. No explanation. No markdown. No code blocks.

Extract:
- vendor: store/restaurant name (string)
- amount: total amount paid as a number (just the final total, not subtotal)
- date: in YYYY-MM-DD format (if not visible use today: ${new Date().toISOString().split('T')[0]})
- category: one of Food, Transport, Travel, Shopping, Groceries, Bills, Health, Entertainment, Other

Category guide:
- Food: restaurants, cafes, fast food, dhabas, hotels
- Groceries: supermarkets, kirana stores, DMart, BigBasket
- Health: pharmacy, medical, clinic, hospital
- Shopping: clothing, electronics, general retail
- Bills: utility, recharge, subscription
- Entertainment: movies, events, games

Example response:
{"vendor":"Dominos Pizza","amount":349.00,"date":"2026-03-25","category":"Food"}

If you cannot read the receipt clearly, return:
{"error":"Could not read receipt clearly"}`
            }
          ]
        }
      ],
      max_tokens: 200,
      temperature: 0.1
    })

    const responseText = response.choices[0].message.content.trim()

    let result
    try {
      const cleaned = responseText.replace(/```json|```/g, '').trim()
      result = JSON.parse(cleaned)
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        return res.status(422).json({ success: false, message: 'Could not parse receipt' })
      }
    }

    if (result.error) {
      return res.status(422).json({ success: false, message: result.error })
    }

    res.json({ success: true, receipt: result })

  } catch (error) {
    console.error('Receipt scan error:', error)
    res.status(500).json({ success: false, message: 'Failed to scan receipt' })
  }
}