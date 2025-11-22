import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"

export async function GET(request: NextRequest) {
  try {
    const adminEmail = request.headers.get("x-admin-email")
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized - admin access required" }, { status: 401 })
    }

    await connectDB()

    const enrollments = await Enrollment.find().sort({ createdAt: -1 }).limit(100)

    return NextResponse.json(
      enrollments.map((e: any) => ({
        _id: e._id.toString(),
        userId: e.userId,
        courseId: e.courseId,
        paymentStatus: e.paymentStatus,
        progress: e.progress,
        completed: e.completed,
        amountPaid: e.amountPaid,
        currency: e.currency,
        createdAt: e.createdAt,
      })),
    )
  } catch (error) {
    console.error("[v0] Enrollments fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}
