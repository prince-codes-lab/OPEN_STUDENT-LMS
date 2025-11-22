import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { User } from "@/lib/mongodb/models/User"
import { validatePassword } from "@/lib/validation/input-validation"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 })
    }

    await connectDB()

    // Hash the token to match what's stored in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).maxTimeMS(5000)

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Update password
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    return NextResponse.json({ success: true, message: "Password has been reset successfully" })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Reset password error:", errorMsg)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
