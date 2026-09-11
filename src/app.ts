import cors from 'cors'
import express from 'express'
import healthRouter from './routes/health.js'
import marketsRouter from './routes/markets.js'
import adminRouter from './routes/admin.js'
import walletRouter from './routes/wallet.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.use('/api/health', healthRouter)
app.use('/api/markets', marketsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/wallet', walletRouter)

export default app