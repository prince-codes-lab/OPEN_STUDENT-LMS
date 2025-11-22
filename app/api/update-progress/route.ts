import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { getVerifiedAuth, forbiddenResponse } from "@/lib/auth/auth-helper"
import { validateProgressUpdate } from "@/lib/validation/input-validation"
import { logAudit } from "@/lib/audit-log"

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    const auth = await getVerifiedAuth(request)
    if (!auth || !auth.userId) {
      logAudit({
        userId: null,
        action: "UPDATE_PROGRESS",
        resource: "enrollment",
        status: "failure",
        details: "Unauthorized",
        ipAddress: clientIp,
      })
      return forbiddenResponse("Unauthorized")
    }

    const { enrollmentId, progress } = await request.json()

    if (!enrollmentId) {
      logAudit({
        userId: auth.userId,
        action: "UPDATE_PROGRESS",
        resource: "enrollment",
        status: "failure",
        details: "Missing enrollmentId",
        ipAddress: clientIp,
      })
      return NextResponse.json({ success: false, error: "Enrollment ID is required" }, { status: 400 })
    }

    const progressValidation = validateProgressUpdate(progress)
    if (!progressValidation.valid) {
      logAudit({
        userId: auth.userId,
        action: "UPDATE_PROGRESS",
        resource: "enrollment",
        resourceId: enrollmentId,
        status: "failure",
        details: progressValidation.error,
        ipAddress: clientIp,
      })
      return NextResponse.json({ success: false, error: progressValidation.error }, { status: 400 })
    }

    console.log("[v0] Updating progress for enrollment:", enrollmentId, "progress:", progress)
    await connectDB()

    const enrollment = await Enrollment.findById(enrollmentId).maxTimeMS(5000)

    if (!enrollment) {
      logAudit({
        userId: auth.userId,
        action: "UPDATE_PROGRESS",
        resource: "enrollment",
        resourceId: enrollmentId,
        status: "failure",
        details: "Enrollment not found",
        ipAddress: clientIp,
      })
      return NextResponse.json({ success: false, error: "Enrollment not found" }, { status: 404 })
    }

    if (enrollment.userId.toString() !== auth.userId) {
      logAudit({
        userId: auth.userId,
        action: "UPDATE_PROGRESS",
        resource: "enrollment",
        resourceId: enrollmentId,
        status: "failure",
        details: "Permission denied - enrollment ownership mismatch",
        ipAddress: clientIp,
      })
      return forbiddenResponse("You cannot update this enrollment")
    }

    await Enrollment.findByIdAndUpdate(
      enrollmentId,
      {
        progress,
        updatedAt: new Date(),
      },
      { new: true, maxTimeMS: 5000 },
    )

    logAudit({
      userId: auth.userId,
      action: "UPDATE_PROGRESS",
      resource: "enrollment",
      resourceId: enrollmentId,
      status: "success",
      details: `Progress updated to ${progress}%`,
      ipAddress: clientIp,
    })

    // If progress is 100%, automatically complete the course
    if (progress === 100) {
      try {
        const completeResponse = await fetch(`${request.nextUrl.origin}/api/complete-course`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${request.cookies.get("auth_token")?.value || ""}`,
          },
          body: JSON.stringify({ enrollmentId }),
        })

        const completeResult = await completeResponse.json()

        return NextResponse.json({
          success: true,
          completed: true,
          certificate: completeResult.data,
        })
      } catch (completeError) {
        console.error("[v0] Error completing course:", completeError)
        return NextResponse.json({ success: true, completed: false })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Progress update error:", errorMsg)
    return NextResponse.json({ success: false, error: "Failed to update progress" }, { status: 500 })
  }
}
