import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { connectDB } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import mongoose from "mongoose"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid enrollment ID" }, { status: 400 })
    }

    const body = await request.json()
    const { progress } = body

    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return NextResponse.json({ error: "Progress must be between 0 and 100" }, { status: 400 })
    }

    await connectDB()

    const enrollment = await Enrollment.findByIdAndUpdate(
      id,
      {
        progress,
        completed: progress === 100,
        completedAt: progress === 100 ? new Date() : undefined,
      },
      { new: true },
    )

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    if (enrollment.userId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("[v0] Progress update error:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
