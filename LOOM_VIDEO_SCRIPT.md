# 🎬 Spendwise Project - 5-Minute Loom Video Script

## Production Guide
- **Total Duration**: 5 minutes (300 seconds)
- **Recording Tool**: Loom
- **Screen Resolution**: 1920x1080 recommended
- **Font Size**: Increase VS Code font to 16-18 for visibility
- **Background**: Clean desktop, VS Code in fullscreen
- **Pace**: Deliberate and clear (allow time to read code)

---

## ⏱️ SEGMENT 1: INTRO & PROJECT OVERVIEW (0:00 - 0:30 | 30 seconds)

**SCRIPT:**
> "Hi! I'm walking you through **Spendwise**, a full-stack expense tracking app I built for Indian UPI users. In just 5 minutes, I'll show you the architecture, key decisions, and code quality that went into this project.
> 
> Spendwise intelligently parses bank SMS messages, uses AI to provide financial coaching, tracks budgets, and generates spending insights. It's built with React, Node.js, and Groq's LLaMA models."

**ACTIONS:**
- Show desktop with VS Code closed
- Open Terminal and run:
  ```bash
  cd Spendwise && code .
  ```
- Wait for VS Code to fully load

---

## ⏱️ SEGMENT 2: ARCHITECTURE OVERVIEW (0:30 - 1:15 | 45 seconds)

**SCRIPT:**
> "Let me show you the architecture. This project follows a **clean separation of concerns** with a dedicated frontend, backend, and configuration layers.
> 
> We have the **backend** with controllers for auth, transactions, budgets, and AI features. The **frontend** is a React app with pages, components, and context for state management. The **config** folder handles Supabase setup.
> 
> This modular structure makes it easy to scale, test, and maintain."

**ACTIONS:**
1. Click on VS Code file explorer
2. Expand folder structure to show:
   ```
   Spendwise/
   ├── server.js (entry point)
   ├── config/
   ├── controllers/
   ├── routes/
   ├── middleware/
   └── client/ (React app)
   ```
3. Collapse and expand a few times to highlight organization
4. **Highlight**: Point to each folder and briefly mention purpose

**CODE TO SHOW**: File tree in Explorer (5-10 seconds)

---

## ⏱️ SEGMENT 3: BACKEND - ENTRY POINT (1:15 - 1:45 | 30 seconds)

**SCRIPT:**
> "Let's start with the backend entry point. Here's `server.js` — it initializes Express, sets up CORS, configures middleware for JWT validation, and mounts all four API route groups.
> 
> Notice how **clean and readable** this is — we're importing routes from separate files and using middleware to validate tokens on protected routes. This makes the code maintainable and testable."

**ACTIONS:**
1. Open `server.js`
2. **Highlight these sections** (use Cmd+G to go to line):
   - Lines 1-10: Imports and setup
   - Lines 15-25: CORS and middleware configuration
   - Lines 30-40: Route mounting
   - Show the structure of error handling (lines 45-55)

**KEY POINTS TO MENTION:**
- "Express middleware chain is clean and organized"
- "Routes are modularized into separate files"
- "Error handling is centralized at the bottom"

**CODE SNIPPET TO EMPHASIZE:**
```javascript
// Middleware setup
app.use(express.json());
app.use(cors(corsOptions));
app.use(require('./middleware/auth')); // JWT validation

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
```

---

## ⏱️ SEGMENT 4: BACKEND - CONTROLLERS (1:45 - 2:45 | 60 seconds)

**SCRIPT:**
> "Now let's look at the **business logic** in the controllers. I'll start with `transactionController.js` — this is the heart of the app.
> 
> Notice how **each function has a single responsibility**: `getTransactions()` fetches, `createTransaction()` adds new transactions, `bulkCreateTransactions()` imports SMS data, and `getTransactionStats()` calculates analytics.
> 
> The code uses **async/await** for clean asynchronous handling, validates inputs, and returns consistent JSON responses. This is professional-grade code architecture."

**ACTIONS:**
1. Open `controllers/transactionController.js`
2. **Scroll through and highlight**:
   - Line 1-5: Imports (Supabase client)
   - Lines 10-20: `getTransactions()` function
   - Lines 25-40: `createTransaction()` with validation
   - Lines 50-70: `bulkCreateTransactions()` for SMS import
   - Lines 80-100: `getTransactionStats()` for analytics

**KEY POINTS TO MENTION:**
- "Each function is focused and testable"
- "Error handling with try/catch blocks"
- "Consistent response format with HTTP status codes"
- "User validation ensures data privacy"

**CODE SNIPPET TO EMPHASIZE:**
```javascript
// Clean async/await pattern
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

---

## ⏱️ SEGMENT 5: BACKEND - AI INTEGRATION (2:45 - 3:15 | 30 seconds)

**SCRIPT:**
> "The **AI features** are one of the standout parts. Let me show you `aiController.js`.
> 
> We're using **Groq's LLaMA 3.3 model** for SMS parsing and financial insights — it's faster and cheaper than OpenAI while delivering great results.
> 
> See here — `parseSMS()` uses Groq to extract transactions from unstructured bank messages, `generateInsights()` creates personalized financial coaching, and `scanReceipt()` uses LLaMA's vision capabilities to parse images.
> 
> This is **production-grade AI integration** with proper error handling."

**ACTIONS:**
1. Open `controllers/aiController.js`
2. **Highlight**:
   - Lines 1-10: Groq client initialization
   - Lines 20-35: `parseSMS()` function with prompt
   - Lines 45-60: `generateInsights()` with context
   - Lines 70-85: `scanReceipt()` with vision

**KEY POINTS TO MENTION:**
- "Groq SDK is lightweight and fast"
- "Prompts are engineered for accuracy"
- "User context is passed for personalization"
- "SMS data never exposed to AI (privacy-first)"

**CODE SNIPPET TO EMPHASIZE:**
```javascript
const generateInsights = async (req, res) => {
  try {
    const { totalSpent, categories, biggestTransaction } = req.body;
    
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [{
        role: "user",
        content: `User spent ₹${totalSpent} this month. Categories: ${JSON.stringify(categories)}. Give witty Gen-Z financial advice.`
      }],
      temperature: 0.7,
      max_tokens: 150,
    });
    
    res.json({ insight: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

---

## ⏱️ SEGMENT 6: FRONTEND - REACT ARCHITECTURE (3:15 - 4:00 | 45 seconds)

**SCRIPT:**
> "Now to the **frontend** — built with React 18, Vite, and Tailwind CSS.
> 
> Here's the **context-based state management**. Instead of Redux, we use React Context for global auth and user data. Notice how clean this is — a single source of truth for logged-in state.
> 
> The Dashboard is the main page, and it's broken into **smart, reusable components**: SMSSection for imports, AnalyticsSection with charts, BudgetSection with tracking, and an AIBubble for real-time coaching.
> 
> Let me show you the component structure and how everything connects."

**ACTIONS:**
1. Open `client/src/context/AuthContext.jsx`
2. **Highlight**:
   - Lines 1-5: Context creation
   - Lines 10-20: AuthProvider wrapper
   - Lines 25-35: useAuth hook

3. Switch to `client/src/pages/Dashboard.jsx`
4. **Highlight**:
   - Lines 1-10: Import statements (show component organization)
   - Lines 20-35: Component structure (JSX layout)
   - Lines 50-70: API calls with useEffect

**KEY POINTS TO MENTION:**
- "Context API simplifies state management"
- "Custom hooks encapsulate logic"
- "Components are modular and composable"
- "Clean separation of UI and business logic"

**CODE SNIPPET TO EMPHASIZE:**
```javascript
// AuthContext.jsx - Simple, powerful state management
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

---

## ⏱️ SEGMENT 7: GIT COMMITS & CODE QUALITY (4:00 - 4:30 | 30 seconds)

**SCRIPT:**
> "Let me show you the **development process** through Git commits. Each commit represents a thoughtful feature or fix.
> 
> See these commits — structured with clear messages about what changed and why. This isn't just hacking together code; it's a **professional development workflow**.
> 
> We've iterated on the design, integrated AI, optimized database queries, and improved security. The commit history tells the story of a well-planned project."

**ACTIONS:**
1. Open Terminal (Ctrl+`)
2. Run:
   ```bash
   git log --oneline -15
   ```
3. **Scroll through and highlight** meaningful commits:
   - "feat: Implement SMS parser with AI categorization"
   - "refactor: Move API calls to separate utils"
   - "feat: Add budget tracking with analytics"
   - "fix: JWT token validation in middleware"
   - "feat: Receipt scanning with LLaMA Vision"

**KEY POINTS TO MENTION:**
- "Commits are atomic and focused"
- "Clear commit messages explain intent"
- "Regular commits show iterative development"

**TERMINAL COMMAND:**
```bash
git log --oneline --graph -10
```

---

## ⏱️ SEGMENT 8: LIVE DEMO & CONCLUSION (4:30 - 5:00 | 30 seconds)

**SCRIPT:**
> "Let me quickly show you the app running. Here's the Dashboard with all the features we discussed.
> 
> **SMS import** — paste bank messages, AI automatically categorizes transactions. **Analytics** — real-time charts showing spending by category and weekly trends. **Budgets** — set monthly limits and get alerts when you overspend. **AI Coaching** — personalized financial advice generated on demand.
> 
> This project brings together **clean architecture, modern tech stack, AI integration, and a polished user experience**. It's something I'm genuinely proud of.
> 
> Thanks for watching!"

**ACTIONS:**
1. Open Terminal
2. Run:
   ```bash
   npm run dev  # or yarn dev
   ```
   (Frontend development server)
3. Wait for local server to start
4. Open browser to `http://localhost:5173`
5. **Show**:
   - Landing page (5 seconds)
   - Dashboard after login (10 seconds)
   - Hover over a few features, show animations
6. Close browser
7. Show final slide or goodbye message

**KEY POINTS TO MENTION:**
- "Dark mode with smooth animations"
- "Responsive design for all devices"
- "Real-time data updates"
- "Polished, production-ready UI"

---

## 📝 ADDITIONAL TIPS FOR RECORDING

### Before You Hit Record:
- [ ] Increase VS Code font size to 16-18
- [ ] Close all notifications
- [ ] Use dark theme in VS Code (already matching Spendwise)
- [ ] Turn off Slack, Discord, email notifications
- [ ] Use a quiet environment (no background noise)
- [ ] Close unnecessary browser tabs

### During Recording:
- [ ] Speak clearly and at a moderate pace
- [ ] Use Loom's pause feature if you need to stop
- [ ] Hover your mouse over important code
- [ ] Use Cmd+D or Cmd+F to highlight code terms
- [ ] Let viewers read code for 3-5 seconds before moving on
- [ ] Use Ctrl+K Ctrl+O in VS Code to open files quickly

### Camera Setup:
- [ ] Show your face in the small corner (not necessary, but adds personality)
- [ ] Include screen recording with code visible (primary focus)
- [ ] Use Loom's pointer/highlight tool to draw attention to key lines

### Post-Recording:
- [ ] Edit out long pauses (Loom allows editing)
- [ ] Add captions for accessibility
- [ ] Add title and description highlighting the stack
- [ ] Share on LinkedIn, Twitter, or GitHub with relevant hashtags

---

## 🎯 KEY TALKING POINTS SUMMARY

| Segment | Key Message |
|---------|-----------|
| **Intro** | Full-stack AI-powered expense tracking for Indian users |
| **Architecture** | Clean, modular, scalable structure |
| **Backend** | Professional Express setup with smart routing |
| **Controllers** | Single-responsibility functions with proper error handling |
| **AI** | Production-grade Groq integration for SMS parsing & insights |
| **Frontend** | React + Context API + Tailwind for modern UX |
| **Git** | Thoughtful, well-documented development process |
| **Demo** | Polished, feature-rich, responsive app |

---

## 🎬 FINAL TIPS

✅ **Show, don't tell** — Keep talking concise, let the code speak  
✅ **Use shortcuts** — Cmd+P (open file), Cmd+G (go to line), Cmd+F (find)  
✅ **Intentional pacing** — Give viewers time to read code  
✅ **Highlight decisions** — Explain *why*, not just *what*  
✅ **Professional tone** — Confident, knowledgeable, enthusiastic  

---

## 📊 TIME BREAKDOWN

| Segment | Duration | Content |
|---------|----------|---------|
| Intro | 0:30 | Project overview |
| Architecture | 0:45 | Folder structure & design |
| Entry Point | 0:30 | server.js |
| Controllers | 1:00 | Business logic deep dive |
| AI Integration | 0:30 | Groq + LLaMA features |
| Frontend | 0:45 | React architecture |
| Git & Quality | 0:30 | Commits & workflow |
| Demo | 0:30 | Live app showcase |
| **TOTAL** | **5:00** | |

---

Good luck with your recording! This project is impressive — let your confidence shine through! 🚀
