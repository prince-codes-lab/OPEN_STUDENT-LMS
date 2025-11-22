import { connectDB } from "@/lib/mongodb/connection"
import { ModuleLesson } from "@/lib/mongodb/models/ModuleLesson"
import { LessonProgress } from "@/lib/mongodb/models/LessonProgress"
import { verifyAuth } from "@/lib/auth/mongodb-auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react"

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params

  const user = await verifyAuth()
  if (!user) {
    redirect("/auth/login")
  }

  await connectDB()

  // Get lesson details
  const lesson = await ModuleLesson.findById(lessonId).populate("course_modules")

  // Get lesson progress
  const progress = await LessonProgress.findOne({
    user_id: user._id,
    lesson_id: lessonId,
  })

  async function markComplete() {
    "use server"
    await connectDB()
    const user = await verifyAuth()
    if (!user) return

    await LessonProgress.findOneAndUpdate(
      { user_id: user._id, lesson_id: lessonId },
      {
        user_id: user._id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date(),
      },
      { upsert: true },
    )

    redirect(`/learn/${courseId}`)
  }

  if (!lesson) {
    return <div>Lesson not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href={`/learn/${courseId}`}
              className="text-[#4E0942] hover:text-[#FF2768] font-medium flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Course
            </Link>
          </div>

          {/* Lesson Content */}
          <Card className="border-2 border-[#4E0942]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{lesson.course_modules?.title}</p>
                  <CardTitle className="text-[#4E0942] text-2xl">{lesson.title}</CardTitle>
                </div>
                {progress?.completed && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 size={20} />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video Content */}
              {lesson.content_type === "video" && lesson.content_url && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {lesson.content_url.includes("youtube.com") || lesson.content_url.includes("youtu.be") ? (
                    <iframe
                      src={lesson.content_url.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <video src={lesson.content_url} controls className="w-full h-full" />
                  )}
                </div>
              )}

              {/* Text Content */}
              {lesson.content_text && (
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{lesson.content_text}</div>
                </div>
              )}

              {/* Duration */}
              {lesson.duration_minutes > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Duration:</span> {lesson.duration_minutes} minutes
                </div>
              )}

              {/* Mark Complete Button */}
              {!progress?.completed && (
                <form action={markComplete}>
                  <Button type="submit" className="w-full bg-[#4E0942] hover:bg-[#4E0942]/90 text-lg py-6">
                    <CheckCircle2 className="mr-2" size={20} />
                    Mark as Complete
                  </Button>
                </form>
              )}

              {progress?.completed && (
                <Button asChild className="w-full bg-[#FF2768] hover:bg-[#FF2768]/90 text-lg py-6">
                  <Link href={`/learn/${courseId}`}>
                    Continue to Next Lesson
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
