import cors from 'cors'
import express from 'express'
import healthRouter from './routes/health.js'
import marketsRouter from './routes/markets.js'
import adminRouter from './routes/admin.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/markets', marketsRouter)
app.use('/api/admin', adminRouter)

export default app
