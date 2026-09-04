import { demoQueue } from '../queues/demoQueue.js'

const job = await demoQueue.add('say-hello', {
  message: 'Hello from the producer!',
  sentAt: new Date().toISOString()
})

console.log(`📤 Job #${job.id} added to the queue.`)
console.log('   This script is exiting NOW — it did not wait for the worker.')

process.exit(0)
