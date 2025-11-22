import mongoose from "mongoose"

const EnrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    courseId: mongoose.Schema.Types.ObjectId,
    tourId: mongoose.Schema.Types.ObjectId,
    paymentReference: {
      type: String,
      required: true,
      unique: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    amountPaid: Number,
    currency: {
      type: String,
      enum: ["NGN", "USD"],
    },
    enrollmentType: {
      type: String,
      enum: ["course", "tour", "combo"],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    certificateSent: {
      type: Boolean,
      default: false,
    },
    certificateSentAt: Date,
  },
  {
    timestamps: true,
  },
)

// Index for fetching user's enrollments
EnrollmentSchema.index({ userId: 1 })
// Index for course enrollment queries
EnrollmentSchema.index({ courseId: 1 })
// Index for tour enrollment queries
EnrollmentSchema.index({ tourId: 1 })
// Index for payment lookups
EnrollmentSchema.index({ paymentReference: 1 }, { unique: true })
// Index for completion tracking
EnrollmentSchema.index({ completed: 1, userId: 1 })
// Compound index for user progress tracking
EnrollmentSchema.index({ userId: 1, createdAt: -1 })
// Index for payment status queries
EnrollmentSchema.index({ paymentStatus: 1, userId: 1 })

export const Enrollment = mongoose.models.Enrollment || mongoose.model("Enrollment", EnrollmentSchema)
