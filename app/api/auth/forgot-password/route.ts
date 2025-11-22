import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { User } from "@/lib/mongodb/models/User"
import { sendEmail } from "@/lib/email/nodemailer-config"
import { getPasswordResetEmailTemplate } from "@/lib/email/email-templates"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { validateEmail } from "@/lib/validation/input-validation"

export async function POST(request: Request) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const rateLimitKey = `forgot_password_${clientIp}`

    if (
      !checkRateLimit(rateLimitKey, RATE_LIMITS.AUTH.FORGOT_PASSWORD.limit, RATE_LIMITS.AUTH.FORGOT_PASSWORD.windowMs)
    ) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const { email } = await request.json()

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email }).maxTimeMS(5000)

    if (!user) {
      // Return generic message for security
      return NextResponse.json({ success: true, message: "If email exists, password reset link has been sent" })
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken()
    await user.save()

    // Create reset link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`

    // Send email
    const emailResult = await sendEmail(
      user.email,
      "Password Reset Request - Open Student",
      getPasswordResetEmailTemplate(user.fullName || "User", resetLink),
    )

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Password reset link has been sent to your email" })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Forgot password error:", errorMsg)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
