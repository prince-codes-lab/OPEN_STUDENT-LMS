import { User } from "@/lib/mongodb/models/User"
import { connectDB } from "@/lib/mongodb/connection"

export async function authenticateUser(email: string, password: string) {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    await connectDB()

    const user = await User.findOne({ email }).select("+password").maxTimeMS(5000)
    if (!user) {
      console.log("[v0] User not found:", email)
      return { success: false, error: "Invalid email or password" }
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      console.log("[v0] Invalid password for user:", email)
      return { success: false, error: "Invalid email or password" }
    }

    console.log("[v0] User authenticated successfully:", email)
    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] User authentication error:", errorMsg)
    return { success: false, error: "Authentication failed. Please try again." }
  }
}

export async function createUser(
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  age?: number,
  country?: string,
) {
  try {
    if (!email || !password || !fullName) {
      return { success: false, error: "Email, password, and full name are required" }
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }

    if (!email.includes("@")) {
      return { success: false, error: "Please provide a valid email address" }
    }

    await connectDB()

    const existingUser = await User.findOne({ email }).maxTimeMS(5000)
    if (existingUser) {
      console.log("[v0] User already exists:", email)
      return { success: false, error: "Email already registered" }
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      fullName,
      phone,
      age,
      country,
      role: "student",
    })

    await user.save()
    console.log("[v0] User created successfully:", email)

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] User creation error - Message:", errorMessage)
    console.error("[v0] User creation error - Full object:", error)

    if (errorMessage.includes("duplicate key") || errorMessage.includes("E11000")) {
      return { success: false, error: "Email already registered" }
    }
    if (errorMessage.includes("validation")) {
      return { success: false, error: "Invalid user data provided" }
    }

    return { success: false, error: "Failed to create user. Please try again." }
  }
}

export async function verifyAuth() {
  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return null
    }

    const { verifyJWT } = await import("@/lib/auth/jwt")
    const payload = await verifyJWT(token)
    if (!payload) {
      return null
    }

    await connectDB()
    const user = await User.findById(payload.userId).maxTimeMS(5000)

    return user
  } catch (error) {
    console.error("[v0] Auth verification error:", error)
    return null
  }
}
