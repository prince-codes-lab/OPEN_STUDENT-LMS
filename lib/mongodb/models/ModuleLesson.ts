import mongoose from "mongoose"

const ModuleLessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseModule",
      required: true,
    },
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
    contentType: {
      type: String,
      enum: ["video", "text", "quiz", "assignment"],
      default: "text",
    },
    content: String,
    videoUrl: String,
    duration: Number, // in minutes
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export const ModuleLesson = mongoose.models.ModuleLesson || mongoose.model("ModuleLesson", ModuleLessonSchema)
