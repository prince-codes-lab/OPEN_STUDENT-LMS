"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Award, TrendingUp, ExternalLink, LogOut, User } from "lucide-react"
import { ProgressUpdater } from "@/components/progress-updater"

interface Enrollment {
  _id: string
  userId: string
  courseId?: string
  tourId?: string
  progress: number
  completed: boolean
  paymentStatus: string
  amountPaid: number
}

interface Course {
  _id: string
  title: string
  description: string
  category: string
  durationWeeks: number
  googleClassroomLink?: string
}

interface Certificate {
  _id: string
  userId: string
  enrollmentId: string
  certificateNumber: string
  issuedAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<{ email: string; userId: string } | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [courses, setCourses] = useState<{ [key: string]: Course }>({})
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    try {
      // Check if user has auth token
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1]

      if (!token) {
        router.push("/auth/login?redirect=/dashboard")
        return
      }

      // Fetch user profile
      const profileRes = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!profileRes.ok) {
        router.push("/auth/login?redirect=/dashboard")
        return
      }

      const userData = await profileRes.json()
      setProfile(userData)

      // Fetch enrollments
      const enrollmentsRes = await fetch("/api/enrollments", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json()
        setEnrollments(enrollmentsData.filter((e: Enrollment) => e.paymentStatus === "completed"))

        // Fetch courses for these enrollments
        const courseIds = enrollmentsData.filter((e: Enrollment) => e.courseId).map((e: Enrollment) => e.courseId)
        const uniqueCourseIds = [...new Set(courseIds)]

        if (uniqueCourseIds.length > 0) {
          const coursesRes = await fetch("/api/courses?ids=" + uniqueCourseIds.join(","))
          if (coursesRes.ok) {
            const coursesData = await coursesRes.json()
            const coursesMap: { [key: string]: Course } = {}
            coursesData.forEach((course: Course) => {
              coursesMap[course._id] = course
            })
            setCourses(coursesMap)
          }
        }
      }

      setLoading(false)
    } catch (error) {
      console.error("[v0] Error fetching dashboard data:", error)
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#DD91D0]/5 to-[#FF2768]/5">
        <Navigation />
        <div className="pt-32 pb-16 text-center">
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const courseEnrollments = enrollments.filter((e) => e.courseId)
  const completedCount = enrollments.filter((e) => e.completed).length
  const averageProgress =
    enrollments.length > 0 ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DD91D0]/5 to-[#FF2768]/5">
      <Navigation />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
              <div>
                <h1 className="text-4xl font-bold text-[#4E0942] mb-2">Welcome back!</h1>
                <p className="text-lg text-gray-700">Continue your learning journey</p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline" className="border-2 border-[#4E0942] text-[#4E0942] bg-transparent">
                  <Link href="/dashboard/profile">
                    <User size={18} className="mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-2 border-[#FF2768] text-[#FF2768] bg-transparent"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="border-2 border-[#4E0942]/20 hover:border-[#4E0942] transition-all animate-scale-in">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="text-[#4E0942]" size={24} />
                    <Badge className="bg-[#4E0942] text-white">{courseEnrollments.length}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-[#4E0942]">{courseEnrollments.length}</div>
                  <div className="text-sm text-gray-600">Active Courses</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#FF2768]/20 hover:border-[#FF2768] transition-all animate-scale-in delay-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="text-[#FF2768]" size={24} />
                    <Badge className="bg-[#FF2768] text-white">{completedCount}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-[#FF2768]">{completedCount}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#FEEB00]/20 hover:border-[#FEEB00] transition-all animate-scale-in delay-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="text-[#FEEB00]" size={24} />
                    <Badge className="bg-[#FEEB00] text-[#4E0942]">{certificates.length}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-[#4E0942]">{certificates.length}</div>
                  <div className="text-sm text-gray-600">Certificates</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#DD91D0]/20 hover:border-[#DD91D0] transition-all animate-scale-in delay-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="text-[#DD91D0]" size={24} />
                    <Badge className="bg-[#DD91D0] text-white">{averageProgress}%</Badge>
                  </div>
                  <div className="text-2xl font-bold text-[#4E0942]">{averageProgress}%</div>
                  <div className="text-sm text-gray-600">Average Progress</div>
                </CardContent>
              </Card>
            </div>

            {/* My Courses */}
            {courseEnrollments.length > 0 && (
              <div className="space-y-6 animate-fade-in-up delay-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-[#4E0942]">My Courses</h2>
                  <Button asChild variant="outline" className="border-2 border-[#4E0942] text-[#4E0942] bg-transparent">
                    <Link href="/programs">Browse More</Link>
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {courseEnrollments.map((enrollment) => {
                    const course = courses[enrollment.courseId!]
                    if (!course) return null

                    return (
                      <div key={enrollment._id} className="space-y-4">
                        <Card className="border-2 hover:border-[#FF2768] transition-all hover:shadow-xl group">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <Badge
                                className={`${
                                  enrollment.completed ? "bg-[#FEEB00] text-[#4E0942]" : "bg-[#4E0942] text-white"
                                }`}
                              >
                                {enrollment.completed ? "Completed" : "In Progress"}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl text-[#4E0942] group-hover:text-[#FF2768] transition-colors">
                              {course.title}
                            </CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-semibold text-[#4E0942]">{enrollment.progress}%</span>
                              </div>
                              <Progress value={enrollment.progress} className="h-2" />
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>Duration: {course.durationWeeks} weeks</span>
                              <span className="capitalize">{course.category}</span>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                asChild
                                className="flex-1 bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-semibold"
                              >
                                <Link href={`/learn/${course._id}`}>
                                  <BookOpen size={16} className="mr-2" />
                                  Start Learning
                                </Link>
                              </Button>
                              {course.googleClassroomLink && (
                                <Button
                                  asChild
                                  variant="outline"
                                  className="border-2 border-[#4E0942] text-[#4E0942] bg-transparent"
                                >
                                  <a href={course.googleClassroomLink} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink size={16} />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {!enrollment.completed && (
                          <ProgressUpdater
                            enrollmentId={enrollment._id}
                            currentProgress={enrollment.progress}
                            courseTitle={course.title}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {enrollments.length === 0 && (
              <Card className="border-2 border-[#DD91D0] shadow-xl animate-scale-in">
                <CardContent className="p-12 text-center space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#4E0942] to-[#DD91D0] rounded-full flex items-center justify-center mx-auto">
                    <BookOpen size={48} className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-[#4E0942]">Start Your Learning Journey</h3>
                    <p className="text-gray-700 max-w-md mx-auto">
                      You haven't enrolled in any courses yet. Browse our programs and start learning today!
                    </p>
                  </div>
                  <Button asChild size="lg" className="bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-bold">
                    <Link href="/programs">Browse Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
