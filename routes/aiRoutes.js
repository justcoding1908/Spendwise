import express from 'express'
import { getFinancialInsight, parseSMSWithAI, detectAnomalies, scanReceipt, categorizeVendor  } from '../controllers/aiController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.post('/insight', getFinancialInsight)
router.post('/parse-sms', parseSMSWithAI)
router.post('/detect-anomalies', detectAnomalies)
router.post('/scan-receipt', scanReceipt) 

export default router
