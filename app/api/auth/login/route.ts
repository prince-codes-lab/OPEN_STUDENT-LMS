import { createJWT } from "@/lib/auth/jwt"
import { authenticateUser } from "@/lib/auth/mongodb-auth"
import { NextResponse } from "next/server"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { validateEmail, validatePassword } from "@/lib/validation/input-validation"
import { validateRequestSize, REQUEST_SIZE_LIMITS } from "@/lib/api-security"
import { logAudit } from "@/lib/audit-log"

export async function POST(request: Request) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    const sizeCheck = await validateRequestSize(request, REQUEST_SIZE_LIMITS.AUTH)
    if (!sizeCheck.valid) {
      logAudit({
        userId: null,
        action: "LOGIN_ATTEMPT",
        resource: "auth",
        status: "failure",
        details: sizeCheck.error,
        ipAddress: clientIp,
      })
      return NextResponse.json({ error: sizeCheck.error }, { status: 413 })
    }

    const rateLimitKey = `login_${clientIp}`

    if (!checkRateLimit(rateLimitKey, RATE_LIMITS.AUTH.LOGIN.limit, RATE_LIMITS.AUTH.LOGIN.windowMs)) {
      logAudit({
        userId: null,
        action: "LOGIN_ATTEMPT",
        resource: "auth",
        status: "failure",
        details: "Rate limit exceeded",
        ipAddress: clientIp,
      })
      return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const { email, password } = body

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 })
    }

    const result = await authenticateUser(email, password)

    if (!result.success) {
      logAudit({
        userId: null,
        action: "LOGIN_ATTEMPT",
        resource: "auth",
        status: "failure",
        details: "Invalid credentials",
        ipAddress: clientIp,
      })
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    const token = await createJWT({
      userId: result.user._id,
      email: result.user.email,
      role: result.user.role,
    })

    const response = NextResponse.json(
      {
        success: true,
        userId: result.user._id,
      },
      { status: 200 },
    )

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    })

    logAudit({
      userId: result.user._id,
      action: "LOGIN_SUCCESS",
      resource: "auth",
      status: "success",
      ipAddress: clientIp,
    })

    return response
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Login route error:", errorMsg)
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 })
  }
}
