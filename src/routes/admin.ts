import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { WalletConnection } from '../models/WalletConnection.js'

const router = Router()

// ==================== AUTH ====================
router.post('/login', (req, res) => {
  const { password } = req.body ?? {}

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Incorrect password' })
    return
  }

  const token = jwt.sign({ role: 'admin' }, process.env.ADMIN_JWT_SECRET!, {
    expiresIn: '12h',
  })
  res.json({ token })
})

router.get('/check', requireAdmin, (_req, res) => {
  res.json({ ok: true, message: 'You are authenticated as admin.' })
})

// ==================== WALLET CONNECTIONS ====================

// Get all wallet connections
router.get('/wallet-connections', requireAdmin, async (_req, res) => {
  try {
    const connections = await WalletConnection.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()

    res.json({
      success: true,
      count: connections.length,
      data: connections,
    })
  } catch (err) {
    console.error('Failed to fetch connections:', err)
    res.status(500).json({ success: false, error: 'Failed to fetch connections' })
  }
})

// Get connections by wallet name
router.get('/wallet-connections/:wallet', requireAdmin, async (req, res) => {
  try {
    const connections = await WalletConnection.find({
      wallet: req.params.wallet,
    })
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      count: connections.length,
      data: connections,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch connections' })
  }
})

// Get single connection by ID
router.get('/wallet-connection/:id', requireAdmin, async (req, res) => {
  try {
    const connection = await WalletConnection.findById(req.params.id).lean()
    if (!connection) {
      res.status(404).json({ success: false, error: 'Not found' })
      return
    }
    res.json({ success: true, data: connection })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch' })
  }
})

// Get stats
router.get('/wallet-stats', requireAdmin, async (_req, res) => {
  try {
    const total = await WalletConnection.countDocuments()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = await WalletConnection.countDocuments({
      createdAt: { $gte: today },
    })

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekCount = await WalletConnection.countDocuments({
      createdAt: { $gte: weekAgo },
    })

    const byWallet = await WalletConnection.aggregate([
      { $group: { _id: '$wallet', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    const byMethod = await WalletConnection.aggregate([
      { $group: { _id: '$method', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    res.json({
      success: true,
      data: {
        total,
        today: todayCount,
        week: weekCount,
        byWallet,
        byMethod,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' })
  }
})

export default router