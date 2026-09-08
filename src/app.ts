import cors from 'cors'
import express from 'express'
import healthRouter from './routes/health.js'
import marketsRouter from './routes/markets.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/markets', marketsRouter)

export default app
