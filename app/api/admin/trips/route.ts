import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Tour } from "@/lib/mongodb/models/Tour"

export async function GET() {
  try {
    await connectDB()
    const tours = await Tour.find().sort({ date: 1 })
    return NextResponse.json(
      tours.map((t: any) => ({
        _id: t._id.toString(),
        title: t.title,
        description: t.description,
        state: t.state,
        location: t.location,
        date: t.date,
        priceNgn: t.priceNgn,
        priceUsd: t.priceUsd,
        maxParticipants: t.maxParticipants,
        currentParticipants: t.currentParticipants || 0,
        googleClassroomLink: t.googleClassroomLink,
        proofImages: t.proofImages || [],
        isActive: t.isActive,
      })),
    )
  } catch (error) {
    console.error("[v0] Trips fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch tours" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()

    const tour = new Tour({
      title: body.title,
      description: body.description,
      state: body.state,
      location: body.location,
      date: body.date,
      priceNgn: body.priceNgn,
      priceUsd: body.priceUsd,
      maxParticipants: body.maxParticipants,
      currentParticipants: 0,
      googleClassroomLink: body.googleClassroomLink,
      proofImages: body.proofImages || [],
      isActive: true,
    })

    await tour.save()

    return NextResponse.json(
      {
        _id: tour._id.toString(),
        title: tour.title,
        description: tour.description,
        state: tour.state,
        location: tour.location,
        date: tour.date,
        priceNgn: tour.priceNgn,
        priceUsd: tour.priceUsd,
        maxParticipants: tour.maxParticipants,
        currentParticipants: tour.currentParticipants,
        googleClassroomLink: tour.googleClassroomLink,
        proofImages: tour.proofImages,
        isActive: tour.isActive,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Trip save error:", error)
    return NextResponse.json({ error: "Failed to create tour" }, { status: 500 })
  }
}
