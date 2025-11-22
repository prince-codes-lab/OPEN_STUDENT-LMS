import mongoose from "mongoose"

const CourseModuleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export const CourseModule = mongoose.models.CourseModule || mongoose.model("CourseModule", CourseModuleSchema)
