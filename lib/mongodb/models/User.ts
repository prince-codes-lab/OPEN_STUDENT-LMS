import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: String,
    phone: String,
    age: Number,
    country: String,
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password)
}

UserSchema.methods.generateVerificationToken = function () {
  const verificationToken = require("crypto").randomBytes(32).toString("hex")
  this.verificationToken = require("crypto").createHash("sha256").update(verificationToken).digest("hex")
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  return verificationToken
}

UserSchema.methods.generatePasswordResetToken = function () {
  const resetToken = require("crypto").randomBytes(32).toString("hex")
  this.passwordResetToken = require("crypto").createHash("sha256").update(resetToken).digest("hex")
  this.passwordResetExpires = Date.now() + 1 * 60 * 60 * 1000 // 1 hour
  return resetToken
}

UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ createdAt: -1 })
UserSchema.index({ emailVerified: 1 })

export const User = mongoose.models.User || mongoose.model("User", UserSchema)
