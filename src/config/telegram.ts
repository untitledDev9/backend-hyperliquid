import 'dotenv/config'

export const telegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  chatId: process.env.TELEGRAM_CHAT_ID || '',
}

export function isTelegramConfigured(): boolean {
  return !!(telegramConfig.botToken && telegramConfig.chatId)
}