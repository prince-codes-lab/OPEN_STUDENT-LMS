import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyJWT } from "./jwt"

export async function getAuthTokenFromRequest(request: NextRequest | Request): Promise<string | null> {
  // First try Authorization header (JWT)
  if (request instanceof NextRequest || "headers" in request) {
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.substring(7)
    }
  }

  // Fall back to cookie
  if (request instanceof NextRequest) {
    return request.cookies.get("auth_token")?.value || null
  }

  // For regular Request objects, use cookies helper
  try {
    const cookieStore = await cookies()
    return cookieStore.get("auth_token")?.value || null
  } catch {
    return null
  }
}

export async function verifyAuthToken(token: string | null) {
  if (!token) {
    return null
  }

  try {
    const payload = await verifyJWT(token)
    if (!payload || !payload.userId) {
      return null
    }
    return payload
  } catch (error) {
    console.error("[v0] Token verification failed:", error instanceof Error ? error.message : String(error))
    return null
  }
}

export async function getVerifiedAuth(request: NextRequest | Request) {
  const token = await getAuthTokenFromRequest(request)
  const payload = await verifyAuthToken(token)
  return payload
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 })
}
