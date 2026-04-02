import express from 'express'
import { getTransactions, createTransaction, createBulkTransactions, deleteTransaction, getStats, updateTransactionCategory } from '../controllers/transactionController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.get('/stats', getStats)
router.get('/', getTransactions)
router.post('/bulk', createBulkTransactions)
router.post('/', createTransaction)
router.delete('/:id', deleteTransaction)

export default router