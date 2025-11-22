"use server"

import { cookies } from "next/headers"

const ADMIN_CREDENTIALS = {
  email: "sheisdaniellawilliams@gmail.com",
  password: "sheisdaniellawilliams",
}

export async function setAdminSession() {
  try {
    const cookieStore = await cookies()
    cookieStore.set("admin_authenticated", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })
    cookieStore.set("admin_email", ADMIN_CREDENTIALS.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
    cookieStore.delete("admin_email")
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
      email: ADMIN_CREDENTIALS.email,
      authenticated: true,
    }
  } catch (error) {
    console.error("[v0] Admin auth verification error:", error)
    return null
  }
}
