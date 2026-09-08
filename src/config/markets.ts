export interface MarketAsset {
  coingeckoId: string
  symbol: string
  name: string
}

export const marketAssets: MarketAsset[] = [
  { coingeckoId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { coingeckoId: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { coingeckoId: 'solana', symbol: 'SOL', name: 'Solana' },
  { coingeckoId: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { coingeckoId: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
  { coingeckoId: 'arbitrum', symbol: 'ARB', name: 'Arbitrum' },
  { coingeckoId: 'optimism', symbol: 'OP', name: 'Optimism' },
  { coingeckoId: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
]
