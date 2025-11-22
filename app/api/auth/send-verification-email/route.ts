import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { User } from "@/lib/mongodb/models/User"
import { sendEmail } from "@/lib/email/nodemailer-config"
import { getVerificationEmailTemplate } from "@/lib/email/email-templates"
import { validateEmail } from "@/lib/validation/input-validation"
import { logAudit } from "@/lib/audit-log"

export async function POST(request: Request) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const { email } = await request.json()

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      logAudit({
        userId: null,
        action: "SEND_VERIFICATION_EMAIL",
        resource: "email",
        status: "failure",
        details: emailValidation.error,
        ipAddress: clientIp,
      })
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email }).maxTimeMS(5000)

    if (!user) {
      logAudit({
        userId: null,
        action: "SEND_VERIFICATION_EMAIL",
        resource: "email",
        status: "failure",
        details: "User not found",
        ipAddress: clientIp,
      })
      // Return generic message for security
      return NextResponse.json({ success: true, message: "If email exists, verification link has been sent" })
    }

    if (user.emailVerified) {
      logAudit({
        userId: user._id.toString(),
        action: "SEND_VERIFICATION_EMAIL",
        resource: "email",
        status: "failure",
        details: "Email already verified",
        ipAddress: clientIp,
      })
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 })
    }

    // Generate verification token
    const verificationToken = user.generateVerificationToken()
    await user.save()

    // Create verification link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const verificationLink = `${baseUrl}/auth/verify-email?token=${verificationToken}`

    // Send email
    const emailResult = await sendEmail(
      user.email,
      "Verify Your Email - Open Student",
      getVerificationEmailTemplate(user.fullName || "User", verificationLink),
    )

    if (!emailResult.success) {
      logAudit({
        userId: user._id.toString(),
        action: "SEND_VERIFICATION_EMAIL",
        resource: "email",
        status: "failure",
        details: "Email send failed",
        ipAddress: clientIp,
      })
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    logAudit({
      userId: user._id.toString(),
      action: "SEND_VERIFICATION_EMAIL",
      resource: "email",
      status: "success",
      ipAddress: clientIp,
    })

    return NextResponse.json({ success: true, message: "Verification email has been sent" })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Send verification email error:", errorMsg)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
