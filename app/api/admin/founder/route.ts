import { NextResponse } from "next/server"
import { connectDB2 } from "@/lib/mongodb/connection"
import { Founder } from "@/lib/mongodb/models/Founder"

export async function GET() {
  try {
    const mongoUri = process.env.MONGODB_URI_2
    if (!mongoUri) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    await connectDB2(mongoUri)
    const founder = await Founder.findOne()

    return NextResponse.json(founder || {})
  } catch (error) {
    console.error("[v0] Founder fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch founder info" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const mongoUri = process.env.MONGODB_URI_2
    if (!mongoUri) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    await connectDB2(mongoUri)
    const body = await request.json()

    let founder = await Founder.findOne()
    if (!founder) {
      founder = new Founder(body)
    } else {
      Object.assign(founder, body)
    }

    await founder.save()
    return NextResponse.json(founder)
  } catch (error) {
    console.error("[v0] Founder save error:", error)
    return NextResponse.json({ error: "Failed to save founder info" }, { status: 500 })
  }
}
