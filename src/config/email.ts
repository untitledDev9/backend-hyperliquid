import 'dotenv/config'

export const emailConfig = {
  resendApiKey: process.env.RESEND_API_KEY || '',
  notificationEmail: process.env.NOTIFICATION_EMAIL || '',
  fromEmail: process.env.EMAIL_FROM || 'notifications@yourdomain.com',
}

export function isEmailConfigured(): boolean {
  return !!(emailConfig.resendApiKey && emailConfig.notificationEmail)
}