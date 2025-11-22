import { NextResponse } from "next/server"

// Request size limits by endpoint type
export const REQUEST_SIZE_LIMITS = {
  AUTH: 10 * 1024, // 10 KB for auth endpoints
  API: 100 * 1024, // 100 KB for general API endpoints
  UPLOAD: 5 * 1024 * 1024, // 5 MB for uploads
}

// Middleware to check request size
export async function validateRequestSize(
  request: Request,
  maxBytes: number,
): Promise<{ valid: boolean; error?: string }> {
  const contentLength = request.headers.get("content-length")

  if (!contentLength) {
    return { valid: true }
  }

  const size = Number.parseInt(contentLength, 10)
  if (isNaN(size)) {
    return { valid: false, error: "Invalid content-length header" }
  }

  if (size > maxBytes) {
    return { valid: false, error: `Request body exceeds maximum size of ${maxBytes} bytes` }
  }

  return { valid: true }
}

// Validate request content type
export function validateContentType(request: Request, expectedTypes: string[]): boolean {
  const contentType = request.headers.get("content-type")

  if (!contentType) {
    return expectedTypes.length === 0
  }

  return expectedTypes.some((type) => contentType.includes(type))
}

// Secure response headers
export function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")

  return response
}

// Rate limit exceeded response
export function rateLimitExceededResponse(retryAfter?: number) {
  const response = NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })

  if (retryAfter) {
    response.headers.set("Retry-After", retryAfter.toString())
  }

  return response
}

// Bad request response
export function badRequestResponse(error: string) {
  return NextResponse.json({ error }, { status: 400 })
}

// Internal server error response
export function internalErrorResponse(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 })
}
