export function buildVerificationEmail(name, verifyUrl) {
  return {
    subject: 'Verify your SpendWise email',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Hi ${name},</h2>
        <p>Thanks for signing up for SpendWise! Click below to verify your email and activate your account:</p>
        <p>
          <a href="${verifyUrl}" style="background:#10b981;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">
            Verify my email
          </a>
        </p>
        <p style="color:#888;font-size:13px;">This link expires in 24 hours. If you didn't sign up for SpendWise, you can ignore this email.</p>
      </div>
    `
  }
}
