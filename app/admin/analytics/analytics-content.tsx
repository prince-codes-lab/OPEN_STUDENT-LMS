import { connectDB } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { User } from "@/lib/mongodb/models/User"
import { Certificate } from "@/lib/mongodb/models/Certificate"
import { verifyAdminAuth } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { AdminGuard } from "@/components/admin-guard"
import { Users, BookOpen, Award, TrendingUp, DollarSign } from "lucide-react"

export default async function AdminAnalyticsContent() {
  const admin = await verifyAdminAuth()
  if (!admin) {
    redirect("/admin/login")
  }

  await connectDB()

  // Get all enrollments with related data
  const enrollments = await Enrollment.find({ payment_status: "completed" })
    .populate("user_id")
    .populate("course_id")
    .populate("tour_id")
    .sort({ created_at: -1 })

  // Get all students
  const students = await User.find({})

  // Get all certificates
  const certificates = await Certificate.find({})

  // Calculate statistics
  const totalStudents = students?.length || 0
  const totalEnrollments = enrollments?.length || 0
  const totalCertificates = certificates?.length || 0
  const completedCourses = enrollments?.filter((e) => e.completed).length || 0
  const averageProgress =
    enrollments && enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
      : 0

  // Calculate revenue
  const totalRevenue = enrollments?.reduce((sum, e) => sum + (e.amount_paid || 0), 0) || 0
  const revenueNGN =
    enrollments?.filter((e) => e.currency === "NGN").reduce((sum, e) => sum + (e.amount_paid || 0), 0) || 0
  const revenueUSD =
    enrollments?.filter((e) => e.currency === "USD").reduce((sum, e) => sum + (e.amount_paid || 0), 0) || 0

  // Get course enrollment breakdown
  const courseEnrollments = enrollments?.filter((e) => e.course_id) || []
  const tourEnrollments = enrollments?.filter((e) => e.tour_id) || []

  // Group by course
  const courseStats = courseEnrollments.reduce(
    (acc, enrollment) => {
      const courseTitle = enrollment.course_id?.title || "Unknown"
      if (!acc[courseTitle]) {
        acc[courseTitle] = { count: 0, completed: 0, totalProgress: 0 }
      }
      acc[courseTitle].count++
      if (enrollment.completed) acc[courseTitle].completed++
      acc[courseTitle].totalProgress += enrollment.progress || 0
      return acc
    },
    {} as Record<string, { count: number; completed: number; totalProgress: number }>,
  )

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#4E0942] mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track student performance and platform metrics</p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 border-[#4E0942]/20 hover:border-[#4E0942] transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="text-[#4E0942]" size={24} />
                  <Badge className="bg-[#4E0942] text-white">{totalStudents}</Badge>
                </div>
                <div className="text-2xl font-bold text-[#4E0942]">{totalStudents}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#FF2768]/20 hover:border-[#FF2768] transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="text-[#FF2768]" size={24} />
                  <Badge className="bg-[#FF2768] text-white">{totalEnrollments}</Badge>
                </div>
                <div className="text-2xl font-bold text-[#FF2768]">{totalEnrollments}</div>
                <div className="text-sm text-gray-600">Total Enrollments</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#FEEB00]/20 hover:border-[#FEEB00] transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Award className="text-[#FEEB00]" size={24} />
                  <Badge className="bg-[#FEEB00] text-[#4E0942]">{totalCertificates}</Badge>
                </div>
                <div className="text-2xl font-bold text-[#4E0942]">{totalCertificates}</div>
                <div className="text-sm text-gray-600">Certificates Issued</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#DD91D0]/20 hover:border-[#DD91D0] transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="text-[#DD91D0]" size={24} />
                  <Badge className="bg-[#DD91D0] text-white">{averageProgress}%</Badge>
                </div>
                <div className="text-2xl font-bold text-[#4E0942]">{averageProgress}%</div>
                <div className="text-sm text-gray-600">Avg Progress</div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942] flex items-center gap-2">
                  <DollarSign size={20} />
                  Revenue (NGN)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#4E0942]">₦{revenueNGN.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#FF2768]">
              <CardHeader>
                <CardTitle className="text-[#FF2768] flex items-center gap-2">
                  <DollarSign size={20} />
                  Revenue (USD)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#FF2768]">${revenueUSD.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#FEEB00]">
              <CardHeader>
                <CardTitle className="text-[#4E0942] flex items-center gap-2">
                  <Award size={20} />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#4E0942]">
                  {totalEnrollments > 0 ? Math.round((completedCourses / totalEnrollments) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Performance */}
          <Card className="border-2 border-[#4E0942] mb-8">
            <CardHeader>
              <CardTitle className="text-[#4E0942]">Course Performance</CardTitle>
              <CardDescription>Enrollment and completion statistics by course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(courseStats).map(([courseTitle, stats]) => {
                  const avgProgress = Math.round(stats.totalProgress / stats.count)
                  const completionRate = Math.round((stats.completed / stats.count) * 100)

                  return (
                    <div key={courseTitle} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-[#4E0942]">{courseTitle}</h3>
                          <p className="text-sm text-gray-600">
                            {stats.count} students • {stats.completed} completed
                          </p>
                        </div>
                        <Badge className="bg-[#4E0942] text-white">{completionRate}% completion</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Average Progress</span>
                          <span className="font-semibold text-[#4E0942]">{avgProgress}%</span>
                        </div>
                        <Progress value={avgProgress} className="h-2" />
                      </div>
                    </div>
                  )
                })}
                {Object.keys(courseStats).length === 0 && (
                  <p className="text-center text-gray-500 py-8">No course enrollments yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card className="border-2 border-[#DD91D0]">
            <CardHeader>
              <CardTitle className="text-[#4E0942]">Recent Enrollments</CardTitle>
              <CardDescription>Latest student enrollments and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enrollments?.slice(0, 10).map((enrollment) => {
                  const studentName = enrollment.user_id?.full_name || "Unknown Student"
                  const programName = enrollment.course_id?.title || enrollment.tour_id?.title || "Unknown Program"
                  const isProgramType = enrollment.course_id ? "Course" : "Tour"

                  return (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-[#4E0942]">{studentName}</p>
                        <p className="text-sm text-gray-600">
                          {programName} • {isProgramType}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(enrollment.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={`${
                            enrollment.completed ? "bg-[#FEEB00] text-[#4E0942]" : "bg-[#4E0942] text-white"
                          }`}
                        >
                          {enrollment.completed ? "Completed" : `${enrollment.progress || 0}%`}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">
                          {enrollment.currency} {enrollment.amount_paid?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {(!enrollments || enrollments.length === 0) && (
                  <p className="text-center text-gray-500 py-8">No enrollments yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Link href="/admin" className="text-[#4E0942] hover:text-[#FF2768] font-medium flex items-center gap-2">
              ← Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
