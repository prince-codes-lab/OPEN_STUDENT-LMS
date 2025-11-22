import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { User } from "@/lib/mongodb/models/User"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    await connectDB()

    // Hash the token to match what's stored in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    }).maxTimeMS(5000)

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    // Mark email as verified
    user.emailVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined
    await user.save()

    return NextResponse.json({ success: true, message: "Email verified successfully" })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Email verification error:", errorMsg)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
