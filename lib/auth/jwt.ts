import { jwtVerify, SignJWT } from "jose"

function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET environment variable is not set or too short (minimum 32 characters). " +
        "Please set a strong JWT_SECRET in your Vercel environment variables.",
    )
  }
  return new TextEncoder().encode(secret)
}

let cachedSecret: Uint8Array | null = null

export async function createJWT(payload: Record<string, any>) {
  if (!cachedSecret) {
    cachedSecret = getJWTSecret()
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(cachedSecret)
}

export async function verifyJWT(token: string) {
  try {
    if (!cachedSecret) {
      cachedSecret = getJWTSecret()
    }
    const verified = await jwtVerify(token, cachedSecret)
    return verified.payload
  } catch (error) {
    console.error("[v0] JWT verification failed:", error instanceof Error ? error.message : String(error))
    return null
  }
}
