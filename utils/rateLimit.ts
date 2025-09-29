// Utilidad de rate limiting usando un store en memoria (mantener si hay contexto útil)
// En producción, usar Redis o similar (mantener si hay contexto útil)

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

interface RateLimitOptions {
  interval: number
  uniqueTokenPerInterval: number
}

const tokenStore = new Map<string, { count: number; lastReset: number }>()

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options
  
  return {
    check: async (token: string, limit: number): Promise<RateLimitResult> => {
      const now = Date.now()
      const key = `${token}-${Math.floor(now / interval)}`
      
  // Limpia entradas antiguas
      for (const [k, v] of tokenStore.entries()) {
        if (now - v.lastReset > interval) {
          tokenStore.delete(k)
        }
      }
      
  // Verifica si se excedió el límite de tokens únicos
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
