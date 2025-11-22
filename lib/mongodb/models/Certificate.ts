import mongoose from "mongoose"

const CertificateSchema = new mongoose.Schema(
  {
    enrollmentId: mongoose.Schema.Types.ObjectId,
    userId: {
      type: String,
      required: true,
    },
    certificateNumber: {
      type: String,
      unique: true,
    },
    certificateUrl: String,
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

CertificateSchema.index({ userId: 1 })
CertificateSchema.index({ enrollmentId: 1 })
CertificateSchema.index({ certificateNumber: 1 }, { unique: true })
CertificateSchema.index({ issuedAt: -1 })

export const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema)
