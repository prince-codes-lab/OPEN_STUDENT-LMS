import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminEmail || !adminPasswordHash) {
    console.error("[v0] Admin credentials not configured in environment variables")
    return false
  }

  if (email !== adminEmail) {
    return false
  }

  try {
    const isValid = await bcrypt.compare(password, adminPasswordHash)
    if (!isValid) {
      console.log("[v0] Admin credentials verification: FAILED")
    }
    return isValid
  } catch (error) {
    console.error("[v0] Bcrypt verification error:", error)
    return false
  }
}

export async function setAdminSession() {
  try {
    const cookieStore = await cookies()
    cookieStore.set("admin_authenticated", "true", {
      httpOnly: true,
      secure: true, // Always use secure in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    })
    console.log("[v0] Admin session created")
  } catch (error) {
    console.error("[v0] Failed to set admin session:", error)
  }
}

export async function clearAdminSession() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("admin_authenticated")
    console.log("[v0] Admin session cleared")
  } catch (error) {
    console.error("[v0] Failed to clear admin session:", error)
  }
}

export async function isAdminAuthenticated() {
  try {
    const cookieStore = await cookies()
    return cookieStore.get("admin_authenticated")?.value === "true"
  } catch {
    return false
  }
}

export async function verifyAdminAuth() {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return null
    }
    return {
      email: process.env.ADMIN_EMAIL,
      authenticated: true,
    }
  } catch (error) {
    console.error("[v0] Admin auth verification error:", error)
    return null
  }
}

export { verifyAdminCredentials }
