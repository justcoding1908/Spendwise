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
//
// Locally we connect with plain host/port (no password, no TLS). In
// production, a hosted Redis (e.g. Upstash) instead gives you one ready
// connection string like `rediss://default:<password>@<host>:<port>` —
// the extra "s" means TLS, which ioredis handles automatically when it
// sees that scheme. Set REDIS_URL there and this picks it up automatically.
export const redisConnection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null
    })
