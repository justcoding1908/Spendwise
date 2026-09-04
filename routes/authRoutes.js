import express from 'express'
import { register, login, getMe, verifyEmail } from '../controllers/authController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/verify-email', verifyEmail)
router.get('/me', protect, getMe)

export default router