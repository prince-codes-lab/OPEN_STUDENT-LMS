import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Tour } from "@/lib/mongodb/models/Tour"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectDB()
    const body = await request.json()

    const tour = await Tour.findByIdAndUpdate(id, body, { new: true })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error("[v0] Trip update error:", error)
    return NextResponse.json({ error: "Failed to update tour" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectDB()

    const tour = await Tour.findByIdAndDelete(id)

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Trip delete error:", error)
    return NextResponse.json({ error: "Failed to delete tour" }, { status: 500 })
  }
}
