import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { validateEnrollment } from "@/lib/validation/enrollment-validation"
import { handleAPIError, ValidationError } from "@/lib/api-error"
import { getVerifiedAuth, forbiddenResponse } from "@/lib/auth/auth-helper"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const auth = await getVerifiedAuth(request)
    if (!auth || !auth.userId) {
      return forbiddenResponse("Unauthorized")
    }

    console.log("[v0] Fetching enrollments for user:", auth.userId)
    await connectDB()

    const enrollments = await Enrollment.find({ userId: auth.userId }).maxTimeMS(5000).lean()

    console.log("[v0] Enrollments fetched:", enrollments.length)

    return NextResponse.json(
      enrollments.map((e: any) => ({
        _id: e._id.toString(),
        userId: e.userId,
        courseId: e.courseId,
        tourId: e.tourId,
        progress: e.progress,
        completed: e.completed,
        paymentStatus: e.paymentStatus,
        amountPaid: e.amountPaid,
        currency: e.currency,
      })),
    )
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Enrollments GET error:", errorMsg)
    const errorResponse = handleAPIError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getVerifiedAuth(request)
    if (!auth || !auth.userId) {
      return forbiddenResponse("Unauthorized")
    }

    const body = await request.json()

    // Validate enrollment data
    const validation = validateEnrollment(body)
    if (!validation.valid) {
      throw new ValidationError("Invalid enrollment data", validation.errors)
    }

    console.log("[v0] Creating enrollment for user:", auth.userId)
    await connectDB()

    const enrollment = new Enrollment({
      userId: auth.userId,
      courseId: body.courseId,
      tourId: body.tourId,
      paymentReference: body.paymentReference,
      paymentStatus: body.paymentStatus || "pending",
      amountPaid: body.amountPaid,
      currency: body.currency,
      enrollmentType: body.enrollmentType,
      progress: 0,
      completed: false,
    })

    await enrollment.save()

    console.log("[v0] Enrollment created:", enrollment._id)

    return NextResponse.json(
      {
        _id: enrollment._id.toString(),
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        paymentStatus: enrollment.paymentStatus,
        progress: enrollment.progress,
      },
      { status: 201 },
    )
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Enrollments POST error:", errorMsg)
    const errorResponse = handleAPIError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}
