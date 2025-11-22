import mongoose from "mongoose"

const ProfileSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: String,
    email: {
      type: String,
      required: true,
    },
    phone: String,
    age: Number,
    country: String,
  },
  {
    timestamps: true,
  },
)

export const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema)
