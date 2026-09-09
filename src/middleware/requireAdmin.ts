import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    res.status(401).json({ error: 'Missing admin token' })
    return
  }

  try {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET!)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired admin token' })
  }
}
