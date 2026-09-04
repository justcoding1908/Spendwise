import 'dotenv/config'
import { Worker } from 'bullmq'
import { Resend } from 'resend'
import { redisConnection } from '../config/redis.js'

const resend = new Resend(process.env.RESEND_API_KEY)

// Same idea as demoWorker.js, except the job body now does real work:
// it calls Resend's API instead of a fake setTimeout delay. Job data is
// kept generic ({ to, subject, html }) so any future email (password
// reset, weekly summary, etc.) can reuse this same worker.
const worker = new Worker(
  'email',
  async (job) => {
    const { to, subject, html } = job.data
    console.log(`\n📥 Sending email job #${job.id} to ${to}`)

    const { data, error } = await resend.emails.send({
      from: 'noreply@mail.spendwisely.me',
      to,
      subject,
      html
    })

    if (error) {
      // Throwing tells BullMQ this job failed, so it knows to retry it
      // instead of silently swallowing the problem.
      throw new Error(error.message || 'Resend failed to send the email')
    }

    console.log(`✅ Email sent (Resend id: ${data.id})`)
  },
  { connection: redisConnection }
)

worker.on('failed', (job, err) => {
  console.error(`❌ Job #${job?.id} failed:`, err.message)
})

console.log('👷 Email worker is running and listening on the "email" queue... (Ctrl+C to stop)')
