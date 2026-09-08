import 'dotenv/config'
import app from './app.js'
import { connectDB } from './config/db.js'

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hyperliquid'

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})

connectDB(MONGODB_URI).catch((err) => {
  console.error('MongoDB connection failed — continuing without it:', err.message)
})
