import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Course } from "@/lib/mongodb/models/Course"
import { validateCourse } from "@/lib/validation/course-validation"
import { handleAPIError, ValidationError } from "@/lib/api-error"

export async function GET() {
  try {
    console.log("[v0] Fetching courses...")
    await connectDB()

    const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 }).maxTimeMS(5000).lean()

    console.log("[v0] Courses fetched successfully:", courses.length)

    return NextResponse.json(
      courses.map((c: any) => ({
        _id: c._id.toString(),
        title: c.title,
        description: c.description,
        category: c.category,
        priceNgn: c.priceNgn,
        priceUsd: c.priceUsd,
        durationWeeks: c.durationWeeks,
        googleClassroomLink: c.googleClassroomLink,
        contentType: c.contentType,
      })),
    )
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Courses GET error:", errorMsg)
    const errorResponse = handleAPIError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate course data
    const validation = validateCourse(body)
    if (!validation.valid) {
      throw new ValidationError("Invalid course data", validation.errors)
    }

    console.log("[v0] Creating course:", body.title)
    await connectDB()

    const course = new Course({
      title: body.title,
      description: body.description,
      category: body.category,
      priceNgn: body.priceNgn,
      priceUsd: body.priceUsd,
      durationWeeks: body.durationWeeks,
      googleClassroomLink: body.googleClassroomLink,
      contentType: body.contentType,
      isActive: true,
    })

    await course.save()

    console.log("[v0] Course created successfully:", course._id)

    return NextResponse.json(
      {
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        category: course.category,
        priceNgn: course.priceNgn,
        priceUsd: course.priceUsd,
        durationWeeks: course.durationWeeks,
        googleClassroomLink: course.googleClassroomLink,
        contentType: course.contentType,
      },
      { status: 201 },
    )
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Courses POST error:", errorMsg)
    const errorResponse = handleAPIError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}
