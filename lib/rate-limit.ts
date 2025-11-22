// In-memory store for rate limiting (for production, consider using Upstash Redis)
const requests: { [key: string]: { count: number; resetTime: number } } = {}

function cleanupOldEntries() {
  const now = Date.now()
  Object.keys(requests).forEach((key) => {
    if (requests[key].resetTime < now) {
      delete requests[key]
    }
  })
}

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  cleanupOldEntries()

  const now = Date.now()
  if (!requests[key]) {
    requests[key] = { count: 1, resetTime: now + windowMs }
    return true
  }

  if (requests[key].resetTime < now) {
    requests[key] = { count: 1, resetTime: now + windowMs }
    return true
  }

  requests[key].count++
  return requests[key].count <= limit
}

export function getRemainingAttempts(key: string, limit: number): number {
  if (!requests[key]) return limit
  return Math.max(0, limit - requests[key].count)
}

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  AUTH: {
    LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    SIGNUP: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    FORGOT_PASSWORD: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    VERIFY_EMAIL: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 attempts per hour
  },
  API: {
    DEFAULT: { limit: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
    ENROLLMENTS: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20 requests per hour
  },
}
