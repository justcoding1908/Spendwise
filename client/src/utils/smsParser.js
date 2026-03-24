import { CATEGORIES } from './categories'

const MERCHANT_MAP = {
  swiggy:'Food', zomato:'Food', dominos:'Food', "mcdonald":'Food',
  kfc:'Food', subway:'Food', starbucks:'Food', barbeque:'Food',
  uber:'Transport', ola:'Transport', rapido:'Transport',
  metro:'Transport', irctc:'Transport', redbus:'Transport',
  jio:'Bills', airtel:'Bills', bsnl:'Bills', vi:'Bills',
  netflix:'Bills', spotify:'Bills', hotstar:'Bills', electricity:'Bills',
  bescom:'Bills', tatapower:'Bills',
  flipkart:'Shopping', myntra:'Shopping', ajio:'Shopping',
  nykaa:'Shopping', amazon:'Shopping', meesho:'Shopping',
  bigbasket:'Groceries', blinkit:'Groceries', zepto:'Groceries',
  dmart:'Groceries', grofers:'Groceries', dunzo:'Groceries',
  apollo:'Health', medplus:'Health', pharmeasy:'Health',
  netmeds:'Health', lenskart:'Health',
  makemytrip:'Travel', goibibo:'Travel', cleartrip:'Travel', oyo:'Travel',
  bookmyshow:'Entertainment', pvr:'Entertainment', inox:'Entertainment',
}

export function categorize(merchant) {
  const lower = merchant.toLowerCase()
  for (const [key, cat] of Object.entries(MERCHANT_MAP)) {
    if (lower.includes(key)) return cat
  }
  return 'Other'
}

export function parseUPISMS(rawText) {
  if (!rawText?.trim()) return { parsed: [], unrecognized: [] }

  const chunks = rawText
    .split(/(?=Dear UPI user)/i)
    .map(s => s.trim())
    .filter(Boolean)

  const parsed = [], unrecognized = []

  chunks.forEach((chunk, idx) => {
    const pattern = /Dear UPI user\s+A\/C\s+\w+\s+debited by\s+([\d,]+\.?\d*)\s+on date\s+(\d{2}\w{3}\d{2})\s+trf to\s+(.+?)\s+Refno\s+\d+/i
    const match = chunk.match(pattern)
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''))
      const date = parseSBIDate(match[2])
      const merchant = cleanMerchant(match[3])
      parsed.push({
        id: `sms_${Date.now()}_${idx}`,
        amount, date, merchant,
        category: categorize(merchant),
        type: 'debit', raw_sms: chunk
      })
    } else if (chunk.toLowerCase().includes('upi')) {
      unrecognized.push(chunk)
    }
  })

  return { parsed, unrecognized }
}

function parseSBIDate(str) {
  const months = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 }
  const day = parseInt(str.slice(0,2))
  const mon = str.slice(2,5).toLowerCase()
  const year = 2000 + parseInt(str.slice(5,7))
  return new Date(year, months[mon] ?? 0, day).toISOString()
}

function cleanMerchant(raw) {
  return raw.trim().toLowerCase()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .slice(0, 40)
}