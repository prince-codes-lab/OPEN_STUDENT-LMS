import { type NextRequest, NextResponse } from "next/server"
import { verifyPaystackPayment } from "@/lib/paystack"
import { connectDB } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ success: false, error: "Reference is required" }, { status: 400 })
    }

    console.log("[v0] Verifying payment reference:", reference)

    // Verify payment with Paystack
    const verification = await verifyPaystackPayment(reference)

    if (!verification.success) {
      console.error("[v0] Payment verification failed:", verification.error)
      return NextResponse.json({ success: false, error: verification.error }, { status: 400 })
    }

    console.log("[v0] Payment verified successfully")

    // Update enrollment status in MongoDB
    await connectDB()

    const enrollment = await Enrollment.findOneAndUpdate(
      { paymentReference: reference },
      {
        paymentStatus: "completed",
        amountPaid: verification.data?.amount || 0,
      },
      { new: true },
    )

    if (!enrollment) {
      console.error("[v0] Enrollment not found for reference:", reference)
      return NextResponse.json({ success: false, error: "Enrollment not found" }, { status: 404 })
    }

    console.log("[v0] Enrollment updated successfully")

    return NextResponse.json({ success: true, data: verification.data })
  } catch (error) {
    console.error("[v0] Payment verification error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 },
    )
  }
}
