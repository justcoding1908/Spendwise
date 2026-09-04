import { Queue } from 'bullmq'
import { redisConnection } from '../config/redis.js'

// A Queue is the "producer" handle — code that wants to schedule work
// calls demoQueue.add(...) on this. It doesn't do the work itself, it just
// writes a job into Redis and returns immediately.
export const demoQueue = new Queue('demo', { connection: redisConnection })
