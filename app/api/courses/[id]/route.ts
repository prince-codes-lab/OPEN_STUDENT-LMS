import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Course } from "@/lib/mongodb/models/Course"
import mongoose from "mongoose"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
    }

    const course = await Course.findById(id)

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({
      _id: course._id.toString(),
      title: course.title,
      description: course.description,
      category: course.category,
      priceNgn: course.priceNgn,
      priceUsd: course.priceUsd,
      durationWeeks: course.durationWeeks,
      googleClassroomLink: course.googleClassroomLink,
      contentType: course.contentType,
      isActive: course.isActive,
    })
  } catch (error) {
    console.error("[v0] Course fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
    }

    const body = await request.json()

    const course = await Course.findByIdAndUpdate(id, body, { new: true })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("[v0] Course update error:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}
