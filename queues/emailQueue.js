import { Queue } from 'bullmq'
import { redisConnection } from '../config/redis.js'

// The real queue the app uses to send emails in the background. Any route
// (register, password reset, etc.) can import this and call .add(...) to
// schedule an email without waiting for it to actually send.
export const emailQueue = new Queue('email', { connection: redisConnection })
