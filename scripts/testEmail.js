import 'dotenv/config'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Replace with whatever address you want to send a test email to.
const TO_EMAIL = 'your-email@example.com'

const { data, error } = await resend.emails.send({
  from: 'noreply@mail.spendwisely.me', // our verified sending domain
  to: TO_EMAIL,
  subject: 'SpendWise — Resend test',
  html: '<p>If you are reading this in your inbox, Resend is wired up correctly! 🎉</p>'
})

if (error) {
  console.error('❌ Failed to send:', error)
} else {
  console.log('✅ Email sent! Resend ID:', data.id)
}
