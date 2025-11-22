import { connectDB } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { verifyAdminAuth } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { AdminGuard } from "@/components/admin-guard"
import { BookOpen, MapPin, Calendar, DollarSign } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminEnrollmentsPage() {
  const admin = await verifyAdminAuth()
  if (!admin) {
    redirect("/admin/login")
  }

  await connectDB()

  // Get all enrollments with related data
  const enrollments = await Enrollment.find({})
    .populate("user_id")
    .populate("course_id")
    .populate("tour_id")
    .sort({ createdAt: -1 })

  const completedEnrollments = enrollments?.filter((e) => e.payment_status === "completed") || []
  const pendingEnrollments = enrollments?.filter((e) => e.payment_status === "pending") || []

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#4E0942] mb-2">Enrollments</h1>
            <p className="text-gray-600">Manage all course and tour enrollments</p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-[#4E0942]">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-[#4E0942]">{enrollments?.length || 0}</div>
                <div className="text-sm text-gray-600">Total Enrollments</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#FEEB00]">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-[#4E0942]">{completedEnrollments.length}</div>
                <div className="text-sm text-gray-600">Completed Payments</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#FF2768]">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-[#FF2768]">{pendingEnrollments.length}</div>
                <div className="text-sm text-gray-600">Pending Payments</div>
              </CardContent>
            </Card>
          </div>

          {/* Enrollments List */}
          <Card className="border-2 border-[#4E0942]">
            <CardHeader>
              <CardTitle className="text-[#4E0942]">All Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollments?.map((enrollment) => {
                  const studentName = enrollment.user_id?.full_name || "Unknown Student"
                  const programName = enrollment.course_id?.title || enrollment.tour_id?.title || "Unknown Program"
                  const programType = enrollment.course_id ? "Course" : "Tour"
                  const Icon = enrollment.course_id ? BookOpen : MapPin

                  return (
                    <div key={enrollment.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-[#4E0942] rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon size={20} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#4E0942]">{studentName}</h3>
                            <p className="text-sm text-gray-600">{enrollment.user_id?.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {programType}
                              </Badge>
                              <span className="text-sm text-gray-700">{programName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge
                            className={`${
                              enrollment.payment_status === "completed"
                                ? "bg-[#FEEB00] text-[#4E0942]"
                                : "bg-gray-400 text-white"
                            }`}
                          >
                            {enrollment.payment_status}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <DollarSign size={14} />
                            <span>
                              {enrollment.currency} {enrollment.amount_paid?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {enrollment.payment_status === "completed" && programType === "Course" && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-[#4E0942]">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2" />
                          {enrollment.completed && (
                            <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                              <Badge className="bg-green-500 text-white">Completed</Badge>
                              {enrollment.certificate_sent && (
                                <Badge className="bg-[#FEEB00] text-[#4E0942]">Certificate Sent</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}</span>
                        {enrollment.payment_reference && (
                          <span className="ml-4">Ref: {enrollment.payment_reference}</span>
                        )}
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
