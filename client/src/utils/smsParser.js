import { CATEGORIES } from './categories'

const MERCHANT_MAP = {
  swiggy:'Food', zomato:'Food', dominos:'Food', mcdonald:'Food',
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
  // 🧠 Check user's remembered mappings first
  try {
    const map = JSON.parse(localStorage.getItem('sw_vendor_map') || '{}')
    const remembered = map[merchant.toLowerCase().trim()]
    if (remembered) return remembered
  } catch {}

  // Fall back to keyword matching
  const lower = merchant.toLowerCase()
  for (const [key, cat] of Object.entries(MERCHANT_MAP)) {
    if (lower.includes(key)) return cat
  }
  return 'Other'
}

export function parseUPISMS(rawText) {
  if (!rawText?.trim()) return { parsed: [], unrecognized: [] }

  // Split on either "Dear UPI user" or "Dear UPI User"
  const chunks = rawText
    .split(/(?=Dear UPI [Uu]ser)/i)
    .map(s => s.trim())
    .filter(Boolean)

  const parsed = [], unrecognized = []

  chunks.forEach((chunk, idx) => {

    // FORMAT 1 (original SBI debit):
    // Dear UPI user A/C XXXXX debited by 349.00 on date 03Mar26 trf to Merchant Refno 123
    const fmt1 = chunk.match(
      /Dear UPI user\s+A\/C\s+\w+\s+debited by\s+([\d,]+\.?\d*)\s+on date\s+(\d{2}\w{3}\d{2})\s+trf to\s+(.+?)\s+Refno\s+\d+/i
    )

    // FORMAT 2 (new SBI credit/debit):
    // Dear UPI User, your A/c XXXXXX-credited/debited by Rs20.00 on 01-03-26 transfer from/to Name Ref No 123
    const fmt2 = chunk.match(
      /Dear UPI User,?\s+your A\/c\s+\w+-?(credited|debited) by Rs([\d,]+\.?\d*)\s+on\s+(\d{2}-\d{2}-\d{2})\s+transfer\s+(?:from|to)\s+(.+?)\s+Ref No\s+\d+/i
    )

    if (fmt1) {
      const amount = parseFloat(fmt1[1].replace(/,/g, ''))
      const date = parseSBIDate(fmt1[2])
      const merchant = cleanMerchant(fmt1[3])
      parsed.push({
        id: `sms_${Date.now()}_${idx}`,
        amount, date, merchant,
        category: categorize(merchant),
        type: 'debit',
        raw_sms: chunk
      })

    } else if (fmt2) {
      const type = fmt2[1].toLowerCase() === 'credited' ? 'credit' : 'debit'
      const amount = parseFloat(fmt2[2].replace(/,/g, ''))
      const date = parseDDMMYY(fmt2[3])
      const merchant = cleanMerchant(fmt2[4])
      parsed.push({
        id: `sms_${Date.now()}_${idx}`,
        amount, date, merchant,
        category: type === 'credit' ? 'Other' : categorize(merchant),
        type,
        raw_sms: chunk
      })

    } else if (chunk.toLowerCase().includes('upi')) {
      unrecognized.push(chunk)
    }
  })

  return { parsed, unrecognized }
}

// Format: 03Mar26 → ISO date
function parseSBIDate(str) {
  const months = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 }
  const day = parseInt(str.slice(0,2))
  const mon = str.slice(2,5).toLowerCase()
  const year = 2000 + parseInt(str.slice(5,7))
  return new Date(year, months[mon] ?? 0, day).toISOString()
}

// Format: 01-03-26 → ISO date
function parseDDMMYY(str) {
  const [dd, mm, yy] = str.split('-').map(Number)
  return new Date(2000 + yy, mm - 1, dd).toISOString()
}

function cleanMerchant(raw) {
  return raw.trim().toLowerCase()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .slice(0, 40)
}