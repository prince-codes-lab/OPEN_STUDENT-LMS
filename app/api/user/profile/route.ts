import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { User } from "@/lib/mongodb/models/User"
import { getVerifiedAuth, forbiddenResponse } from "@/lib/auth/auth-helper"

export async function GET(request: NextRequest) {
  try {
    const auth = await getVerifiedAuth(request)
    if (!auth || !auth.userId) {
      return forbiddenResponse("Unauthorized")
    }

    await connectDB()
    const user = await User.findById(auth.userId).select("-password").maxTimeMS(5000)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error("[v0] Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
