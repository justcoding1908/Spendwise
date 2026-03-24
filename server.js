process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err)
})

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err)
})

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import budgetRoutes from './routes/budgetRoutes.js'
import aiRoutes from './routes/aiRoutes.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5175",
    /\.vercel\.app$/        // ← allows any vercel subdomain
  ],
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/ai', aiRoutes)

app.get('/', (req, res) => {
  res.json({ success: true, message: 'SpendWise API is running 🚀' })
})

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SpendWise API is running 🚀' })
})

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})