# 🎯 Spendwise Loom Video - CODE SECTIONS TO HIGHLIGHT

## Quick visual guide to exactly which code to show at each timestamp

---

## 1:15-1:45 | server.js

**Open file:** `server.js`

**SECTION 1: Imports & Setup**
```javascript
1  const express = require('express');
2  const cors = require('cors');
3  const dotenv = require('dotenv');
4  const supabase = require('./config/supabase');
5  
6  dotenv.config();
7  const app = express();
```
**Say:** "First, we import Express, CORS, and our Supabase config."

---

**SECTION 2: Middleware Setup**
```javascript
15 app.use(express.json());
16 app.use(cors({
17   origin: process.env.CLIENT_URL,
18   credentials: true
19 }));
20 app.use(require('./middleware/auth'));
21 
22 // Error handling
23 app.use((err, req, res, next) => {
24   console.error(err.stack);
25   res.status(500).json({ error: err.message });
26 });
```
**Say:** "Middleware is configured: JSON parsing, CORS for frontend, JWT auth validation, and centralized error handling."

---

**SECTION 3: Route Mounting**
```javascript
30 app.use('/api/auth', require('./routes/authRoutes'));
31 app.use('/api/transactions', require('./routes/transactionRoutes'));
32 app.use('/api/budgets', require('./routes/budgetRoutes'));
33 app.use('/api/ai', require('./routes/aiRoutes'));
34 
35 const PORT = process.env.PORT || 5000;
36 app.listen(PORT, () => {
37   console.log(`Server running on port ${PORT}`);
38 });
```
**Say:** "All routes are mounted cleanly — auth, transactions, budgets, and AI. The separation makes it scalable."

---

## 1:45-2:45 | controllers/transactionController.js

**Open file:** `controllers/transactionController.js`

**SECTION 1: getTransactions()**
```javascript
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```
**Say:** "getTransactions() is clean and simple. It validates the user from JWT, queries Supabase, handles errors gracefully, and returns JSON. This is production-grade code."

**Highlight:**
- `req.user.id` — JWT validation (security)
- `.eq('user_id', userId)` — Privacy: each user only sees their data
- `async/await` — Modern, readable async handling
- `try/catch` — Proper error handling

---

**SECTION 2: createTransaction()**
```javascript
const createTransaction = async (req, res) => {
  try {
    const { merchant, amount, category, type, date, note } = req.body;
    const userId = req.user.id;
    
    // Validation
    if (!merchant || !amount || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        merchant,
        amount,
        category,
        type: type || 'expense',
        date: date || new Date(),
        note
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```
**Say:** "createTransaction() shows defensive programming. It validates inputs, checks for empty fields, ensures positive amounts, and only then inserts into the database. Each transaction is associated with the user's ID for privacy."

**Highlight:**
- Input validation blocks
- `user_id: userId` — Privacy
- `.insert()` with `.select()` — Returns created record
- `res.status(201)` — Correct HTTP status

---

**SECTION 3: bulkCreateTransactions()**
```javascript
const bulkCreateTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = req.body.transactions; // Array from SMS parsing
    
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'Invalid transactions array' });
    }
    
    // Add user_id to each transaction
    const txnsWithUser = transactions.map(t => ({
      ...t,
      user_id: userId,
      type: t.type || 'expense'
    }));
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(txnsWithUser)
      .select();
    
    if (error) throw error;
    res.status(201).json({
      created: data.length,
      transactions: data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```
**Say:** "bulkCreateTransactions() is what SMS parsing uses. It takes an array of transactions, validates it, adds the user ID to each one for privacy, and inserts them all at once. Efficient and secure."

**Highlight:**
- Takes array from SMS parser
- Maps `user_id` to each transaction
- Batch insert for efficiency
- Returns count + data

---

**SECTION 4: getTransactionStats()**
```javascript
const getTransactionStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, category, date')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Calculate stats
    const totalSpent = data.reduce((sum, t) => sum + t.amount, 0);
    const byCategory = {};
    data.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    
    const biggestTransaction = Math.max(...data.map(t => t.amount));
    
    res.json({
      totalSpent,
      transactionCount: data.length,
      byCategory,
      biggestTransaction
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```
**Say:** "getTransactionStats() powers the dashboard analytics. It calculates total spending, breaks it down by category, and finds the biggest transaction. This data feeds the charts and visualizations you see in the frontend."

**Highlight:**
- `.reduce()` for sum calculation
- Category breakdown logic
- Returns structured stats object

---

## 2:45-3:15 | controllers/aiController.js

**Open file:** `controllers/aiController.js`

**SECTION 1: Groq Client Setup**
```javascript
1  const Groq = require('groq-sdk');
2  
3  const groq = new Groq({
4    apiKey: process.env.GROQ_API_KEY,
5  });
```
**Say:** "We initialize the Groq SDK with our API key. Groq's LLaMA models are fast and cost-effective."

---

**SECTION 2: parseSMS()**
```javascript
const parseSMS = async (req, res) => {
  try {
    const { smsText } = req.body;
    
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [{
        role: "user",
        content: `Parse this UPI SMS and extract transactions:
        
SMS: "${smsText}"

Return JSON array like: [{ merchant: "Starbucks", amount: 250, type: "expense" }]`
      }],
      temperature: 0.3, // Low temp for accuracy
      max_tokens: 500,
    });
    
    const parsed = JSON.parse(response.choices[0].message.content);
    res.json({ transactions: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```
**Say:** "parseSMS() sends bank SMS text to Groq and asks it to extract transactions. The prompt is specific: extract merchant, amount, type. Temperature 0.3 keeps it accurate. It returns structured JSON that we can insert into the database."

**Highlight:**
- Groq API call structure
- Clear prompt engineering
- `temperature: 0.3` for accuracy
- JSON parsing from response
- Low token limit for speed

---

**SECTION 3: generateInsights()**
```javascript
const generateInsights = async (req, res) => {
  try {
    const { totalSpent, categories, biggestTransaction } = req.body;
    const userId = req.user.id;
    
    const categoryList = Object.entries(categories)
      .map(([cat, amt]) => `${cat}: ₹${amt}`)
      .join(', ');
    
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [{
        role: "user",
        content: `You are a witty financial coach for Gen-Z Indians. User spent ₹${totalSpent} this month.
        
Breakdown: ${categoryList}
Biggest transaction: ₹${biggestTransaction}

Give them 2-3 sentences of honest, funny financial advice. Include an emoji. Be Indian slang friendly.`
      }],
      temperature: 0.7, // Allows creativity
      max_tokens: 150,
    });
    
    const insight = response.choices[0].message.content;
    res.json({ insight });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```
**Say:** "generateInsights() is where the personality comes in. We send the user's spending data and ask LLaMA to generate witty, Gen-Z friendly financial advice in an Indian context. Temperature 0.7 allows creativity. The prompt is carefully engineered for tone and context."

**Highlight:**
- Context-aware prompt with emoji reminder
- User spending data (not raw SMS, so private)
- `temperature: 0.7` for creativity
- Character limit (150 tokens) for snappy advice
- Direct appeal to Gen-Z values

---

**SECTION 4: scanReceipt()**
```javascript
const scanReceipt = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Extract vendor name and total amount from this receipt." },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      }],
      temperature: 0.1,
      max_tokens: 100,
    });
    
    const extracted = response.choices[0].message.content;
    res.json({ extracted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```
**Say:** "scanReceipt() uses Groq's vision-capable LLaMA model. You pass in a base64-encoded image, it analyzes it, and extracts vendor and amount. This powers the receipt scanner feature."

**Highlight:**
- Vision model usage
- Image as base64 data URI
- Very low temperature (0.1) for accuracy
- Simple, focused prompt

---

## 3:15-4:00 | Frontend - React Architecture

**Open file:** `client/src/context/AuthContext.jsx`

**SECTION 1: AuthContext Creation**
```javascript
1  import { createContext, useState, useContext, useEffect } from 'react';
2  import axios from 'axios';
3  
4  const AuthContext = createContext();
5  
6  export const AuthProvider = ({ children }) => {
7    const [user, setUser] = useState(null);
7    const [token, setToken] = useState(localStorage.getItem('sw_token'));
8    const [loading, setLoading] = useState(true);
```
**Say:** "Here's our global auth state using React Context. We store the user object, JWT token (from localStorage), and loading state. This is our single source of truth for authentication."

---

**SECTION 2: Login Function**
```javascript
const login = async (email, password) => {
  try {
    const { data } = await axios.post('/api/auth/login', { email, password });
    
    setToken(data.token);
    setUser(data.user);
    
    localStorage.setItem('sw_token', data.token);
    localStorage.setItem('sw_user', JSON.stringify(data.user));
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data?.error };
  }
};
```
**Say:** "Login fetches from the backend, stores the token and user locally, and sets it as the default Authorization header for all future requests. This is how we maintain state across page refreshes."

**Highlight:**
- API call to backend
- localStorage persistence
- Axios header setup for JWT
- Error handling

---

**SECTION 3: useAuth Hook**
```javascript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```
**Say:** "This custom hook lets any component access auth state with a single line: `const { user, token } = useAuth()`. Clean and reusable."

---

**Open file:** `client/src/pages/Dashboard.jsx`

**SECTION 4: Dashboard Structure**
```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SMSSection from '../components/SMSSection';
import AnalyticsSection from '../components/AnalyticsSection';
import BudgetSection from '../components/BudgetSection';
import AIBubble from '../components/AIBubble';

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  return (
    <div className="dark">
      <SMSSection onImport={fetchTransactions} />
      <AnalyticsSection transactions={transactions} />
      <BudgetSection />
      <AIBubble />
    </div>
  );
}
```
**Say:** "The Dashboard imports modular components: SMSSection for importing, AnalyticsSection for charts, BudgetSection for limits, and AIBubble for coaching. Each is independent and reusable."

**Highlight:**
- Component composition
- useAuth hook usage
- useEffect for data fetching
- Callback props for communication

---

## 4:00-4:30 | Git Log

**Open Terminal:** `Ctrl+`` (or in separate terminal)

**Run:**
```bash
git log --oneline -15
```

**You'll see commits like:**
```
a1b2c3d feat: Add receipt scanning with LLaMA Vision
d4e5f6g feat: Implement AI financial coaching
h7i8j9k refactor: Optimize transaction queries
l0m1n2o feat: Add budget tracking with analytics
p3q4r5s fix: JWT token validation in auth middleware
t6u7v8w feat: SMS parser with Groq integration
x9y0z1a feat: Add analytics dashboard with Recharts
b2c3d4e fix: CORS configuration for production
f5g6h7i feat: Implement dark mode with Tailwind
j8k9l0m feat: User authentication with Supabase
n1o2p3q feat: Initialize Express backend
r4s5t6u feat: Set up React + Vite + Tailwind frontend
```

**Say:** "Looking at the commit history, you can see the project evolved thoughtfully. We started with infrastructure (React/Express setup), added core features (auth, SMS parsing, transactions), then layered in AI, analytics, and polish."

**Point to specific commits:**
- "feat: SMS parser with Groq" → "This is where we integrated AI"
- "refactor: Optimize queries" → "Shows we optimized as we learned"
- "feat: Dark mode with Tailwind" → "Design matured over time"

---

## 4:30-5:00 | Live Demo

**Commands to run:**
```bash
# Navigate to frontend
cd client

# Start dev server
npm run dev
```

**Browser will open to:** `http://localhost:5173`

**Show these screens in order:**

1. **Landing Page** (3 seconds)
   - Show the hero section
   - Show "Get Started" button
   - Say: "This is the landing page. Clean, animated, tells the story."

2. **Login/Register** (3 seconds)
   - Click through to login
   - Say: "Authentication powered by Supabase."

3. **Dashboard** (10 seconds)
   - Show top section with welcome
   - Scroll to SMS section — "Users paste SMS here, AI extracts transactions"
   - Scroll to analytics — "Real-time charts showing spending by category"
   - Scroll to budgets — "Budget tracking with visual progress bars"
   - Show AI bubble — "Click here for personalized financial coaching"
   - Hover over transactions — "Smooth animations, responsive design"

4. **Final words:**
   "This project brings together clean architecture, modern tech stack, AI integration, and a polished user experience. It's something I'm genuinely proud of."

---

## 🎬 RECORDING FLOW

Follow this order:
1. **0:00** — Start with intro
2. **0:30** — Show architecture
3. **1:15** — Open server.js
4. **1:45** — Open transactionController.js
5. **2:45** — Open aiController.js
6. **3:15** — Open AuthContext.jsx
7. **3:40** — Open Dashboard.jsx
8. **4:00** — Open Terminal, git log
9. **4:30** — Run dev server, show browser
10. **5:00** — Done!

**Total: 5 minutes ✅**

---

Good luck! You've built something impressive. 🚀
