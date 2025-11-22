import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { Course } from "@/lib/mongodb/models/Course"
import { User } from "@/lib/mongodb/models/User"

export async function GET() {
  try {
    await connectDB()

    // Get counts
    const totalUsers = await User.countDocuments()
    const totalCourses = await Course.countDocuments()
    const totalEnrollments = await Enrollment.countDocuments()
    const completedEnrollments = await Enrollment.countDocuments({ completed: true })
    const pendingPayments = await Enrollment.countDocuments({ paymentStatus: "pending" })
    const completedPayments = await Enrollment.countDocuments({ paymentStatus: "completed" })

    // Get revenue
    const revenueData = await Enrollment.aggregate([
      { $match: { paymentStatus: "completed" } },
      {
        $group: {
          _id: "$currency",
          total: { $sum: "$amountPaid" },
        },
      },
    ])

    const revenue = {
      NGN: 0,
      USD: 0,
    }

    revenueData.forEach((item: any) => {
      revenue[item._id as keyof typeof revenue] = item.total
    })

    // Get enrollment trend (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const enrollmentTrend = await Enrollment.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return NextResponse.json({
      totalUsers,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      pendingPayments,
      completedPayments,
      revenue,
      enrollmentTrend,
    })
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
