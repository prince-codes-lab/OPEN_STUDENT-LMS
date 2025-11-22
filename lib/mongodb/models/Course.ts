import mongoose from "mongoose"

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["writing", "graphics", "video", "speaking", "leadership", "storytelling"],
    },
    priceNgn: {
      type: Number,
      required: true,
    },
    priceUsd: {
      type: Number,
      required: true,
    },
    durationWeeks: Number,
    thumbnailUrl: String,
    googleClassroomLink: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema)
