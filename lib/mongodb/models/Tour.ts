import mongoose from "mongoose"

const TourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    location: String,
    state: String,
    date: Date,
    priceNgn: Number,
    priceUsd: Number,
    maxParticipants: Number,
    currentParticipants: {
      type: Number,
      default: 0,
    },
    googleClassroomLink: String,
    proofImages: {
      type: [String],
      default: [],
    },
    thumbnailUrl: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Tour = mongoose.models.Tour || mongoose.model("Tour", TourSchema)
