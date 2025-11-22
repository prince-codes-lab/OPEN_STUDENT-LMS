import { NextResponse } from "next/server"
import { verifyAdminCredentials, setAdminSession } from "@/lib/admin-auth"
import { createJWT } from "@/lib/auth/jwt"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const isValid = await verifyAdminCredentials(email, password)

    if (!isValid) {
      console.log("[v0] Admin login failed: Invalid credentials")
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = await createJWT({
      email,
      role: "admin",
    })

    // Set both JWT (in cookie) and authenticate flag
    await setAdminSession()

    const response = NextResponse.json({ success: true, message: "Admin logged in successfully" }, { status: 200 })

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    })

    console.log("[v0] Admin logged in successfully")
    return response
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Admin login error:", errorMsg)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
