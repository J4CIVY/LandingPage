// Rate limiting utility using a simple in-memory store
// In production, consider using Redis or a similar external store

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

interface RateLimitOptions {
  interval: number // in milliseconds
  uniqueTokenPerInterval: number
}

const tokenStore = new Map<string, { count: number; lastReset: number }>()

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options
  
  return {
    check: async (token: string, limit: number): Promise<RateLimitResult> => {
      const now = Date.now()
      const key = `${token}-${Math.floor(now / interval)}`
      
      // Clean up old entries
      for (const [k, v] of tokenStore.entries()) {
        if (now - v.lastReset > interval) {
          tokenStore.delete(k)
        }
      }
      
      // Check if we've exceeded the unique token limit
      if (tokenStore.size >= uniqueTokenPerInterval) {
        throw new Error('Rate limit exceeded')
      }
      
      const tokenData = tokenStore.get(key) || { count: 0, lastReset: now }
      
      if (tokenData.count >= limit) {
        throw new Error('Rate limit exceeded')
      }
      
      tokenData.count++
      tokenData.lastReset = now
      tokenStore.set(key, tokenData)
      
      return {
        success: true,
        limit,
        remaining: limit - tokenData.count,
        reset: Math.ceil((tokenData.lastReset + interval) / 1000)
      }
    }
  }
}
