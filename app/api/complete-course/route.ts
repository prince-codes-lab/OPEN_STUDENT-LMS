import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { Certificate } from "@/lib/mongodb/models/Certificate"
import { User } from "@/lib/mongodb/models/User"
import { Course } from "@/lib/mongodb/models/Course"
import { Tour } from "@/lib/mongodb/models/Tour"
import { generateCertificateNumber, generateCertificateSVG, sendCertificateEmail } from "@/lib/certificates"
import { getVerifiedAuth, forbiddenResponse } from "@/lib/auth/auth-helper"
import { logAudit } from "@/lib/audit-log"

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    const auth = await getVerifiedAuth(request)
    if (!auth || !auth.userId) {
      logAudit({
        userId: null,
        action: "COMPLETE_COURSE",
        resource: "course",
        status: "failure",
        details: "Unauthorized",
        ipAddress: clientIp,
      })
      return forbiddenResponse("Unauthorized")
    }

    const { enrollmentId } = await request.json()

    if (!enrollmentId) {
      logAudit({
        userId: auth.userId,
        action: "COMPLETE_COURSE",
        resource: "course",
        status: "failure",
        details: "Missing enrollmentId",
        ipAddress: clientIp,
      })
      return NextResponse.json({ success: false, error: "Enrollment ID is required" }, { status: 400 })
    }

    console.log("[v0] Completing course for enrollment:", enrollmentId)
    await connectDB()

    // Get enrollment details
    const enrollment = await Enrollment.findById(enrollmentId).maxTimeMS(5000)

    if (!enrollment) {
      logAudit({
        userId: auth.userId,
        action: "COMPLETE_COURSE",
        resource: "course",
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
        action: "COMPLETE_COURSE",
        resource: "course",
        resourceId: enrollmentId,
        status: "failure",
        details: "Permission denied - enrollment ownership mismatch",
        ipAddress: clientIp,
      })
      return forbiddenResponse("You cannot complete this enrollment")
    }

    // Check if already completed
    if (enrollment.completed) {
      logAudit({
        userId: auth.userId,
        action: "COMPLETE_COURSE",
        resource: "course",
        resourceId: enrollmentId,
        status: "failure",
        details: "Course already completed",
        ipAddress: clientIp,
      })
      return NextResponse.json({ success: false, error: "Course already completed" }, { status: 400 })
    }

    const user = await User.findById(enrollment.userId).maxTimeMS(5000)
    const course = enrollment.courseId ? await Course.findById(enrollment.courseId).maxTimeMS(5000) : null
    const tour = enrollment.tourId ? await Tour.findById(enrollment.tourId).maxTimeMS(5000) : null

    if (!user) {
      console.error("[v0] User not found for enrollment:", enrollmentId)
      logAudit({
        userId: auth.userId,
        action: "COMPLETE_COURSE",
        resource: "course",
        resourceId: enrollmentId,
        status: "failure",
        details: "User not found",
        ipAddress: clientIp,
      })
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Mark as completed
    enrollment.completed = true
    enrollment.progress = 100
    enrollment.completedAt = new Date()
    await enrollment.save()

    // Generate certificate
    const certificateNumber = generateCertificateNumber()
    const studentName = user.fullName || "Student"
    const programName = course?.title || tour?.title || "Program"
    const completionDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const certificateSVG = generateCertificateSVG({
      studentName,
      courseName: course?.title,
      tourName: tour?.title,
      completionDate,
      certificateNumber,
    })

    // Create certificate record
    const certificate = new Certificate({
      enrollmentId,
      userId: enrollment.userId,
      certificateNumber,
      certificateUrl: `data:image/svg+xml;base64,${Buffer.from(certificateSVG).toString("base64")}`,
      issuedAt: new Date(),
    })

    await certificate.save()

    console.log("[v0] Certificate created:", certificate._id)

    // Send certificate email
    const emailResult = await sendCertificateEmail(user.email, studentName, programName, certificate.certificateUrl)

    logAudit({
      userId: auth.userId,
      action: "COMPLETE_COURSE",
      resource: "course",
      resourceId: enrollmentId,
      status: "success",
      details: `Certificate ${certificateNumber} issued`,
      ipAddress: clientIp,
    })

    return NextResponse.json({
      success: true,
      data: {
        certificateNumber,
        certificateUrl: certificate.certificateUrl,
        emailSent: emailResult.success,
      },
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Course completion error:", errorMsg)
    return NextResponse.json({ success: false, error: "Failed to complete course" }, { status: 500 })
  }
}
