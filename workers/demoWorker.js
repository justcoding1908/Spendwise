import { Worker } from 'bullmq'
import { redisConnection } from '../config/redis.js'

// A Worker is the "consumer" side. BullMQ handles the polling of Redis for
// us — we just give it a function that runs once per job it picks up.
const worker = new Worker(
  'demo',
  async (job) => {
    console.log(`\n📥 Picked up job #${job.id} ("${job.name}")`)
    console.log('   payload:', job.data)

    // Pretend this is a slow external call, e.g. hitting an email provider's API.
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log(`✅ Finished job #${job.id}`)
  },
  { connection: redisConnection }
)

worker.on('failed', (job, err) => {
  console.error(`❌ Job #${job?.id} failed:`, err.message)
})

console.log('👷 Worker is running and listening on the "demo" queue... (Ctrl+C to stop)')
