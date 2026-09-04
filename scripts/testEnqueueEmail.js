import { emailQueue } from '../queues/emailQueue.js'

// Replace with whatever address you want to send a test email to.
const TO_EMAIL = 'your-email@example.com'

const job = await emailQueue.add('test-email', {
  to: TO_EMAIL,
  subject: 'SpendWise — sent via the background queue',
  html: '<p>This one went through Redis + BullMQ + Resend, all together. 🚀</p>'
})

console.log(`📤 Job #${job.id} added to the "email" queue.`)
console.log('   This script is exiting NOW — check the worker terminal for progress.')

process.exit(0)
