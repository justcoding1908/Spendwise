import dotenv from 'dotenv'
dotenv.config()

import Redis from 'ioredis'

// BullMQ needs an actual Redis client instance to talk to Redis — in a
// native ESM project it can't auto-construct one itself, so we build it
// with ioredis and hand BullMQ the finished object. Both the Queue
// (producer side) and the Worker (consumer side) import this same client.
//
// `maxRetriesPerRequest: null` is required by BullMQ specifically — it
// uses long-lived "blocking" Redis commands to wait efficiently for new
// jobs, and ioredis's normal retry limit conflicts with that.
export const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null
})
