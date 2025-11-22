import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { ModuleLesson } from "@/lib/mongodb/models/ModuleLesson"

export async function GET(request: Request) {
  try {
    const moduleId = new URL(request.url).searchParams.get("moduleId")
    if (!moduleId) {
      return NextResponse.json({ error: "moduleId is required" }, { status: 400 })
    }

    console.log("[v0] Fetching lessons for module:", moduleId)
    await connectDB()

    const lessons = await ModuleLesson.find({ moduleId }).sort({ order: 1 }).maxTimeMS(5000).lean()

    console.log("[v0] Lessons fetched:", lessons.length)
    return NextResponse.json(lessons)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Lessons GET error:", errorMsg)
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()

    if (!body.moduleId || !body.title) {
      return NextResponse.json({ error: "moduleId and title are required" }, { status: 400 })
    }

    console.log("[v0] Creating lesson:", body.title)
    const lesson = new ModuleLesson(body)
    await lesson.save()

    console.log("[v0] Lesson created:", lesson._id)
    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Lesson POST error:", errorMsg)
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 })
  }
}
