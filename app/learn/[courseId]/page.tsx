import { connectDB } from "@/lib/mongodb/connection"
import { Course } from "@/lib/mongodb/models/Course"
import { CourseModule } from "@/lib/mongodb/models/CourseModule"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { LessonProgress } from "@/lib/mongodb/models/LessonProgress"
import { verifyAuth } from "@/lib/auth/mongodb-auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, Circle, PlayCircle, FileText, ClipboardList, Award } from "lucide-react"

export default async function LearnCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params

  const user = await verifyAuth()
  if (!user) {
    redirect("/auth/login")
  }

  await connectDB()

  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({
    user_id: user._id,
    course_id: courseId,
  })

  if (!enrollment) {
    redirect("/programs")
  }

  // Get course details
  const course = await Course.findById(courseId)

  // Get modules and lessons
  const modules = await CourseModule.find({ course_id: courseId }).populate("module_lessons").sort({ order_index: 1 })

  // Get user's lesson progress
  const progress = await LessonProgress.find({ user_id: user._id })

  const progressMap = new Map(progress?.map((p) => [p.lesson_id.toString(), p.completed]) || [])

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return PlayCircle
      case "text":
        return FileText
      case "quiz":
        return ClipboardList
      case "assignment":
        return Award
      default:
        return FileText
    }
  }

  if (!course) {
    return <div>Course not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#4E0942] mb-2">{course.title}</h1>
          <p className="text-gray-600">{course.description}</p>
        </div>

        {/* Course Progress */}
        <Card className="border-2 border-[#4E0942] mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#4E0942]">Course Progress</span>
              <span className="text-sm font-bold text-[#4E0942]">{enrollment.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#4E0942] to-[#DD91D0] h-3 rounded-full transition-all"
                style={{ width: `${enrollment.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Modules and Lessons */}
        <div className="space-y-6">
          {modules?.map((module: any, moduleIndex: number) => (
            <Card key={module.id} className="border-2 border-[#DD91D0]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">
                  Module {moduleIndex + 1}: {module.title}
                </CardTitle>
                {module.description && <p className="text-sm text-gray-600">{module.description}</p>}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {module.module_lessons?.map((lesson: any, lessonIndex: number) => {
                    const isCompleted = progressMap.get(lesson._id.toString()) || false
                    const Icon = getIcon(lesson.content_type)

                    return (
                      <Link key={lesson._id} href={`/learn/${courseId}/lesson/${lesson._id}`} className="block">
                        <div className="flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-[#FF2768] hover:shadow-md transition-all group">
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 size={24} className="text-green-500" />
                            ) : (
                              <Circle size={24} className="text-gray-400 group-hover:text-[#FF2768]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon size={16} className="text-[#4E0942]" />
                              <span className="font-medium text-[#4E0942] group-hover:text-[#FF2768]">
                                {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="capitalize">{lesson.content_type}</span>
                              {lesson.duration_minutes > 0 && <span>• {lesson.duration_minutes} min</span>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {(!modules || modules.length === 0) && (
            <Card className="border-2 border-dashed border-[#DD91D0]">
              <CardContent className="p-12 text-center">
                <p className="text-gray-600 mb-4">Course content is being prepared. Check back soon!</p>
                {course.google_classroom_link && (
                  <Button asChild className="bg-[#4E0942] hover:bg-[#4E0942]/90">
                    <Link href={course.google_classroom_link} target="_blank">
                      Open Google Classroom
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8">
          <Button asChild variant="outline" className="border-[#4E0942] text-[#4E0942] bg-transparent">
            <Link href="/dashboard">← Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
