import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

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

export default router
