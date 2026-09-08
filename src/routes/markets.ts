import { Router } from 'express'
import { marketAssets } from '../config/markets.js'

const router = Router()

const CACHE_TTL_MS = 20_000
let cache: { data: unknown; expiresAt: number } | null = null

router.get('/prices', async (_req, res) => {
  if (cache && cache.expiresAt > Date.now()) {
    res.json(cache.data)
    return
  }

  try {
    const baseUrl =
      process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3'
    const ids = marketAssets.map((a) => a.coingeckoId).join(',')
    const url = `${baseUrl}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`

    const upstream = await fetch(url)
    if (!upstream.ok) {
      throw new Error(`CoinGecko responded with ${upstream.status}`)
    }

    const data = await upstream.json()
    cache = { data, expiresAt: Date.now() + CACHE_TTL_MS }
    res.json(data)
  } catch (err) {
    console.error('Failed to fetch market prices:', err)
    res.status(502).json({ error: 'Unable to fetch market prices' })
  }
})

export default router
