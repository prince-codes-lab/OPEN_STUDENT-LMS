import mongoose from "mongoose"
import { User } from "../lib/mongodb/models/User"
import { Enrollment } from "../lib/mongodb/models/Enrollment"
import { Certificate } from "../lib/mongodb/models/Certificate"

async function addDatabaseIndexes() {
  try {
    console.log("[v0] Connecting to database...")
    await mongoose.connect(process.env.MONGODB_URI || "")

    console.log("[v0] Creating indexes...")

    // User indexes
    console.log("[v0] Creating User indexes...")
    await User.collection.createIndex({ email: 1 }, { unique: true })
    await User.collection.createIndex({ createdAt: -1 })
    await User.collection.createIndex({ emailVerified: 1 })

    // Enrollment indexes
    console.log("[v0] Creating Enrollment indexes...")
    await Enrollment.collection.createIndex({ userId: 1 })
    await Enrollment.collection.createIndex({ courseId: 1 })
    await Enrollment.collection.createIndex({ tourId: 1 })
    await Enrollment.collection.createIndex({ paymentReference: 1 }, { unique: true })
    await Enrollment.collection.createIndex({ completed: 1, userId: 1 })
    await Enrollment.collection.createIndex({ userId: 1, createdAt: -1 })
    await Enrollment.collection.createIndex({ paymentStatus: 1, userId: 1 })

    // Certificate indexes
    console.log("[v0] Creating Certificate indexes...")
    await Certificate.collection.createIndex({ userId: 1 })
    await Certificate.collection.createIndex({ enrollmentId: 1 })
    await Certificate.collection.createIndex({ certificateNumber: 1 }, { unique: true })
    await Certificate.collection.createIndex({ issuedAt: -1 })

    console.log("[v0] All indexes created successfully!")
    await mongoose.disconnect()
  } catch (error) {
    console.error("[v0] Error creating indexes:", error)
    process.exit(1)
  }
}

addDatabaseIndexes()
