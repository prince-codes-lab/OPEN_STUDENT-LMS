import { createJWT } from "@/lib/auth/jwt"
import { createUser } from "@/lib/auth/mongodb-auth"
import { NextResponse } from "next/server"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { validateEmail, validatePassword, validateString, validatePhoneNumber } from "@/lib/validation/input-validation"
import { validateRequestSize, REQUEST_SIZE_LIMITS } from "@/lib/api-security"
import { logAudit } from "@/lib/audit-log"

export async function POST(request: Request) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    const sizeCheck = await validateRequestSize(request, REQUEST_SIZE_LIMITS.AUTH)
    if (!sizeCheck.valid) {
      logAudit({
        userId: null,
        action: "SIGNUP_ATTEMPT",
        resource: "auth",
        status: "failure",
        details: sizeCheck.error,
        ipAddress: clientIp,
      })
      return NextResponse.json({ error: sizeCheck.error }, { status: 413 })
    }

    const rateLimitKey = `signup_${clientIp}`

    if (!checkRateLimit(rateLimitKey, RATE_LIMITS.AUTH.SIGNUP.limit, RATE_LIMITS.AUTH.SIGNUP.windowMs)) {
      logAudit({
        userId: null,
        action: "SIGNUP_ATTEMPT",
        resource: "auth",
        status: "failure",
        details: "Rate limit exceeded",
        ipAddress: clientIp,
      })
      return NextResponse.json({ error: "Too many signup attempts. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const { email, password, fullName, phone, age, country } = body

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 })
    }

    const fullNameValidation = validateString(fullName, "Full name", 2, 100)
    if (!fullNameValidation.valid) {
      return NextResponse.json({ error: fullNameValidation.error }, { status: 400 })
    }

    if (phone) {
      const phoneValidation = validatePhoneNumber(phone)
      if (!phoneValidation.valid) {
        return NextResponse.json({ error: phoneValidation.error }, { status: 400 })
      }
    }

    if (age && (age < 10 || age > 120)) {
      return NextResponse.json({ error: "Please provide a valid age" }, { status: 400 })
    }

    if (country) {
      const countryValidation = validateString(country, "Country", 2, 100)
      if (!countryValidation.valid) {
        return NextResponse.json({ error: countryValidation.error }, { status: 400 })
      }
    }

    const result = await createUser(email, password, fullName, phone, age, country)

    if (!result.success) {
      logAudit({
        userId: null,
        action: "SIGNUP_ATTEMPT",
        resource: "auth",
        status: "failure",
        details: result.error,
        ipAddress: clientIp,
      })
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const token = await createJWT({
      userId: result.user._id,
      email: result.user.email,
      role: "student",
    })

    const response = NextResponse.json(
      {
        success: true,
        userId: result.user._id,
      },
      { status: 201 },
    )

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    })

    logAudit({
      userId: result.user._id,
      action: "SIGNUP_SUCCESS",
      resource: "auth",
      status: "success",
      ipAddress: clientIp,
    })

    return response
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Signup route error:", errorMsg)
    return NextResponse.json({ error: "Signup failed. Please try again." }, { status: 500 })
  }
}
