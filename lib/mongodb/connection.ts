import mongoose from "mongoose"

let isConnected = false
const connections: { [key: string]: any } = {}

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("[v0] Using existing database connection")
    return mongoose.connection
  }

  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.error("[v0] MONGODB_URI environment variable is not set")
    throw new Error("MongoDB URI is not defined. Please add MONGODB_URI to your environment variables.")
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 50000,
      connectTimeoutMS: 15000,
      retryWrites: true,
      w: "majority",
    })
    isConnected = true
    console.log("[v0] MongoDB connected successfully on primary database")
    return connection.connection
  } catch (error) {
    isConnected = false
    console.error("[v0] MongoDB connection failed:", error instanceof Error ? error.message : error)
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function connectDB2(mongoUri?: string) {
  const uri = mongoUri || process.env.MONGODB_URI_2

  if (!uri) {
    console.error("[v0] MONGODB_URI_2 environment variable is not set")
    throw new Error("MongoDB URI 2 is not defined. Please add MONGODB_URI_2 to your environment variables.")
  }

  if (connections["admin"] && connections["admin"].readyState === 1) {
    console.log("[v0] Using existing admin database connection")
    return connections["admin"]
  }

  try {
    const connection = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 50000,
      connectTimeoutMS: 15000,
      retryWrites: true,
      w: "majority",
    })
    connections["admin"] = connection
    console.log("[v0] MongoDB connected successfully on secondary database")
    return connection
  } catch (error) {
    console.error("[v0] MongoDB 2 connection failed:", error instanceof Error ? error.message : error)
    throw new Error(`Failed to connect to MongoDB 2: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function disconnectDB() {
  if (isConnected) {
    mongoose.disconnect()
    isConnected = false
    console.log("[v0] MongoDB disconnected")
  }
}
