import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { AdminSettings } from "@/lib/mongodb/models/AdminSettings"

export async function GET() {
  try {
    await connectDB()
    let settings = await AdminSettings.findOne({})

    if (!settings) {
      settings = new AdminSettings({
        logoUrl: null,
        logoName: "logo.png",
        environmentVariables: {},
      })
      await settings.save()
    }

    return NextResponse.json({
      logoUrl: settings.logoUrl,
      logoName: settings.logoName,
      environmentVariables: settings.environmentVariables,
    })
  } catch (error) {
    console.error("[v0] Settings fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()

    let settings = await AdminSettings.findOne({})

    if (!settings) {
      settings = new AdminSettings(body)
    } else {
      settings.logoUrl = body.logoUrl || settings.logoUrl
      settings.logoName = body.logoName || settings.logoName
      settings.environmentVariables = body.environmentVariables || settings.environmentVariables
    }

    await settings.save()

    return NextResponse.json({
      logoUrl: settings.logoUrl,
      logoName: settings.logoName,
      environmentVariables: settings.environmentVariables,
    })
  } catch (error) {
    console.error("[v0] Settings save error:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
