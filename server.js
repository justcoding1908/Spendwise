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
    /\.vercel\.app$/
  ],
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

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

// In production we run the email worker inside this same process instead
// of paying for a separate always-on service — a Node process can serve
// HTTP requests and run a BullMQ worker at the same time, they're just
// two independent pieces of code sharing one event loop. Gated behind an
// env var so local dev is unaffected: locally we keep running the worker
// as its own process (`npm run worker`) in a separate terminal, on
// purpose, so it's actually visible as a separate thing while learning.
if (process.env.RUN_EMBEDDED_WORKER === 'true') {
  await import('./workers/emailWorker.js')
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})