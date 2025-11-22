import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { CourseModule } from "@/lib/mongodb/models/CourseModule"

export async function GET(request: Request) {
  try {
    const courseId = new URL(request.url).searchParams.get("courseId")
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 })
    }

    console.log("[v0] Fetching modules for course:", courseId)
    await connectDB()

    const modules = await CourseModule.find({ courseId }).sort({ order: 1 }).maxTimeMS(5000).lean()

    console.log("[v0] Modules fetched:", modules.length)
    return NextResponse.json(modules)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Modules GET error:", errorMsg)
    return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()

    if (!body.courseId || !body.title) {
      return NextResponse.json({ error: "courseId and title are required" }, { status: 400 })
    }

    console.log("[v0] Creating module:", body.title)
    const module = new CourseModule(body)
    await module.save()

    console.log("[v0] Module created:", module._id)
    return NextResponse.json(module, { status: 201 })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Module POST error:", errorMsg)
    return NextResponse.json({ error: "Failed to create module" }, { status: 500 })
  }
}
