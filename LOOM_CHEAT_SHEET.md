# 🎥 Spendwise Loom Video - QUICK REFERENCE CHEAT SHEET

## Use this while recording! Keep it in a separate window.

---

## 0:00-0:30 | INTRO
**Say:** "Hi! I'm walking you through Spendwise, a full-stack expense tracking app I built for Indian UPI users. In just 5 minutes, I'll show you the architecture, key decisions, and code quality."

**Do:** 
- Show desktop
- Open VS Code
- Let it load

---

## 0:30-1:15 | ARCHITECTURE (45 sec)
**Say:** "This project follows clean separation of concerns. Backend with controllers for auth, transactions, budgets, and AI. Frontend is React with pages, components, and context. Config folder handles Supabase."

**Show:**
- File explorer structure
- Expand: server.js, config/, controllers/, routes/, middleware/, client/
- Point to each folder as you talk about it

**Key Point:** "Modular structure makes it easy to scale, test, and maintain."

---

## 1:15-1:45 | SERVER.JS (30 sec)
**Say:** "Here's server.js — it initializes Express, sets up CORS, configures JWT middleware, and mounts all four API route groups. Notice how clean this is."

**Open:** `server.js`

**Highlight Lines:**
- 1-10: Imports
- 15-25: Middleware setup
- 30-40: Route mounting

**Code to point at:**
```javascript
app.use(express.json());
app.use(cors(corsOptions));
app.use(require('./middleware/auth'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
```

**Key Point:** "Express middleware chain is clean, routes are modularized, error handling is centralized."

---

## 1:45-2:45 | TRANSACTION CONTROLLER (60 sec)
**Say:** "Here's the heart of the app — transactionController.js. Each function has a single responsibility: getTransactions(), createTransaction(), bulkCreateTransactions() for SMS import, and getTransactionStats() for analytics."

**Open:** `controllers/transactionController.js`

**Highlight These Functions:**
- `getTransactions()` — Fetch all transactions
- `createTransaction()` — Add single transaction with validation
- `bulkCreateTransactions()` — Import SMS data
- `getTransactionStats()` — Calculate analytics

**Code to emphasize:**
```javascript
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT
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

**Key Points:** 
- "Each function is focused and testable"
- "Async/await for clean code"
- "Consistent error handling"
- "User validation ensures privacy"

---

## 2:45-3:15 | AI CONTROLLER (30 sec)
**Say:** "The AI features use Groq's LLaMA 3.3 model — faster and cheaper than OpenAI. parseSMS() extracts transactions from bank messages, generateInsights() creates financial coaching, scanReceipt() uses vision to parse images."

**Open:** `controllers/aiController.js`

**Highlight:**
- Groq client initialization at top
- `parseSMS()` function
- `generateInsights()` function
- `scanReceipt()` function

**Code to emphasize:**
```javascript
const response = await groq.chat.completions.create({
  model: "mixtral-8x7b-32768",
  messages: [{
    role: "user",
    content: `User spent ₹${totalSpent} this month...`
  }],
  temperature: 0.7,
  max_tokens: 150,
});
```

**Key Points:**
- "Production-grade AI integration"
- "SMS data never exposed (privacy-first)"
- "Groq is lightweight and fast"

---

## 3:15-4:00 | FRONTEND ARCHITECTURE (45 sec)
**Say:** "The frontend uses React 18, Vite, and Tailwind. Instead of Redux, we use React Context for global auth. The Dashboard breaks into smart components: SMSSection, AnalyticsSection, BudgetSection, and AIBubble."

**Open:** `client/src/context/AuthContext.jsx`

**Highlight:**
- Context creation
- AuthProvider wrapper
- useAuth hook

**Then open:** `client/src/pages/Dashboard.jsx`

**Highlight:**
- Component imports (show organization)
- JSX structure
- useEffect for API calls

**Code to emphasize:**
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sw_token'));
  
  useEffect(() => {
    if (token) validateToken();
  }, [token]);
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

**Key Points:**
- "Context API simplifies state management"
- "Custom hooks encapsulate logic"
- "Components are modular"
- "Clean separation of UI and business logic"

---

## 4:00-4:30 | GIT & CODE QUALITY (30 sec)
**Say:** "Let me show you the development process through Git. Each commit is thoughtful and well-documented. This isn't hacking — it's professional development."

**Open Terminal:** (Ctrl+`)

**Run:**
```bash
git log --oneline -15
```

**Point out commits:**
- "feat: Implement SMS parser with AI categorization"
- "refactor: Move API calls to separate utils"
- "feat: Add budget tracking with analytics"
- "fix: JWT token validation in middleware"
- "feat: Receipt scanning with LLaMA Vision"

**Key Point:** "Commits are atomic, focused, with clear messages."

---

## 4:30-5:00 | LIVE DEMO & OUTRO (30 sec)
**Say:** "Let me quickly show you the app running. SMS import with AI categorization, analytics with charts, budget tracking, and personalized financial coaching. This project brings together clean architecture, modern tech, AI integration, and polished UX. Thanks for watching!"

**Do:**
- Open Terminal
- Run: `npm run dev` (or `yarn dev`)
- Wait for server to start
- Open browser to `http://localhost:5173`
- Show landing page (5 sec)
- Show dashboard (10 sec)
- Hover over features, show animations
- Close everything

---

## 🎙️ TONE & DELIVERY

✅ **Confident** — You built this, be proud  
✅ **Clear** — Speak at moderate pace  
✅ **Specific** — Point to exact code lines  
✅ **Concise** — Don't over-explain, let code speak  
✅ **Enthusiastic** — Show genuine passion for the project  

---

## ⚡ QUICK TERMINAL COMMANDS TO HAVE READY

```bash
# Show git log
git log --oneline -15

# Start frontend dev server
cd client && npm run dev

# Start backend (if needed)
npm run dev
```

---

## 🖱️ VS CODE SHORTCUTS TO SPEED THINGS UP

| Action | Windows | Mac |
|--------|---------|-----|
| Open file | Ctrl+P | Cmd+P |
| Go to line | Ctrl+G | Cmd+G |
| Find in file | Ctrl+F | Cmd+F |
| Find all references | Ctrl+Shift+F | Cmd+Shift+F |
| Toggle comment | Ctrl+/ | Cmd+/ |
| Format code | Shift+Alt+F | Shift+Option+F |

---

## ✅ PRE-RECORDING CHECKLIST

- [ ] Font size 16-18 in VS Code
- [ ] Close all notifications
- [ ] Close Slack, Discord, email
- [ ] Quiet environment
- [ ] Test microphone
- [ ] Test screen recording (Loom)
- [ ] Close unnecessary browser tabs
- [ ] Have this cheat sheet open in a separate window

---

## 🎬 LOOM TIPS

- **Pause mid-recording** if you stumble (edit it out later)
- **Use pointer tool** to draw attention to code
- **Use Loom's highlight** feature for important lines
- **Let code breathe** — 3-5 seconds per code block
- **Add captions** after recording for accessibility

---

**You've got this! This project is genuinely impressive. Let your passion shine through! 🚀**
