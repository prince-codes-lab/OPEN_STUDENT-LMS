import mongoose from "mongoose"

const LessonProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    courseId: mongoose.Schema.Types.ObjectId,
    lessonId: String,
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  },
)

export const LessonProgress = mongoose.models.LessonProgress || mongoose.model("LessonProgress", LessonProgressSchema)
