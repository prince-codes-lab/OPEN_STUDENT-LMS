import crypto from "crypto"

const csrfTokens: { [key: string]: { token: string; expires: number } } = {}

function cleanupExpiredTokens() {
  const now = Date.now()
  Object.keys(csrfTokens).forEach((key) => {
    if (csrfTokens[key].expires < now) {
      delete csrfTokens[key]
    }
  })
}

export function generateCSRFToken(sessionId: string): string {
  cleanupExpiredTokens()

  const token = crypto.randomBytes(32).toString("hex")
  csrfTokens[sessionId] = {
    token,
    expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }

  return token
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  cleanupExpiredTokens()

  const stored = csrfTokens[sessionId]
  if (!stored) {
    return false
  }

  const isValid = crypto.timingSafeEqual(Buffer.from(stored.token), Buffer.from(token))

  // Token can only be used once
  delete csrfTokens[sessionId]

  return isValid
}

export function getCSRFTokenFromRequest(request: Request): string | null {
  // Check header first
  const headerToken = request.headers.get("x-csrf-token")
  if (headerToken) return headerToken

  // Check form body (for POST requests)
  // Note: This requires parsing the body, which should be done in route handlers
  return null
}
