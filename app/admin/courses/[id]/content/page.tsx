import { connectDB } from "@/lib/mongodb/connection"
import { Course } from "@/lib/mongodb/models/Course"
import { CourseModule } from "@/lib/mongodb/models/CourseModule"
import { ModuleLesson } from "@/lib/mongodb/models/ModuleLesson"
import { verifyAdminAuth } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function CourseContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const admin = await verifyAdminAuth()
  if (!admin) {
    redirect("/admin/login")
  }

  await connectDB()

  const course = await Course.findById(id)

  const modules = await CourseModule.find({ course_id: id }).populate("module_lessons").sort({ order_index: 1 })

  async function addModule(formData: FormData) {
    "use server"
    await connectDB()

    const moduleData = {
      course_id: id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      order_index: Number.parseInt(formData.get("order_index") as string) || 0,
    }

    await CourseModule.create(moduleData)
    redirect(`/admin/courses/${id}/content`)
  }

  async function addLesson(formData: FormData) {
    "use server"
    await connectDB()

    const lessonData = {
      module_id: formData.get("module_id") as string,
      title: formData.get("title") as string,
      content_type: formData.get("content_type") as string,
      content_url: formData.get("content_url") as string,
      content_text: formData.get("content_text") as string,
      duration_minutes: Number.parseInt(formData.get("duration_minutes") as string) || 0,
      order_index: Number.parseInt(formData.get("order_index") as string) || 0,
    }

    await ModuleLesson.create(lessonData)
    redirect(`/admin/courses/${id}/content`)
  }

  if (!course) {
    return <div>Course not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#4E0942] mb-2">{course.title}</h1>
          <p className="text-gray-600">Manage course modules and lessons</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Module Form */}
          <Card className="border-2 border-[#4E0942] h-fit">
            <CardHeader>
              <CardTitle className="text-[#4E0942]">Add New Module</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addModule} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="module-title">Module Title *</Label>
                  <Input id="module-title" name="title" required placeholder="e.g., Introduction to Writing" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="module-description">Description</Label>
                  <Textarea id="module-description" name="description" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="module-order">Order</Label>
                  <Input id="module-order" name="order_index" type="number" defaultValue="0" />
                </div>
                <Button type="submit" className="w-full bg-[#4E0942] hover:bg-[#4E0942]/90">
                  <Plus className="mr-2" size={18} />
                  Add Module
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Add Lesson Form */}
          <Card className="border-2 border-[#FF2768] h-fit">
            <CardHeader>
              <CardTitle className="text-[#FF2768]">Add New Lesson</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addLesson} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson-module">Module *</Label>
                  <select
                    id="lesson-module"
                    name="module_id"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2768]"
                  >
                    <option value="">Select a module</option>
                    {modules?.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-title">Lesson Title *</Label>
                  <Input id="lesson-title" name="title" required placeholder="e.g., Writing Basics" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-type">Content Type *</Label>
                  <select
                    id="lesson-type"
                    name="content_type"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2768]"
                  >
                    <option value="video">Video</option>
                    <option value="text">Text/Article</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-url">Content URL (for videos)</Label>
                  <Input id="lesson-url" name="content_url" type="url" placeholder="https://youtube.com/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-text">Content Text</Label>
                  <Textarea id="lesson-text" name="content_text" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                  <Input id="lesson-duration" name="duration_minutes" type="number" defaultValue="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-order">Order</Label>
                  <Input id="lesson-order" name="order_index" type="number" defaultValue="0" />
                </div>
                <Button type="submit" className="w-full bg-[#FF2768] hover:bg-[#FF2768]/90">
                  <Plus className="mr-2" size={18} />
                  Add Lesson
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Modules and Lessons */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#4E0942] mb-4">Course Content</h2>
          <div className="space-y-4">
            {modules?.map((module) => (
              <Card key={module.id} className="border-2 border-[#DD91D0]">
                <CardHeader>
                  <CardTitle className="text-[#4E0942]">{module.title}</CardTitle>
                  {module.description && <p className="text-sm text-gray-600">{module.description}</p>}
                </CardHeader>
                <CardContent>
                  {module.module_lessons && module.module_lessons.length > 0 ? (
                    <div className="space-y-2">
                      {module.module_lessons.map((lesson: any) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-[#4E0942]">{lesson.title}</p>
                            <p className="text-sm text-gray-600">
                              {lesson.content_type} • {lesson.duration_minutes} min
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No lessons yet. Add lessons using the form above.</p>
                  )}
                </CardContent>
              </Card>
            ))}
            {(!modules || modules.length === 0) && (
              <Card className="border-2 border-dashed border-[#DD91D0]">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">No modules yet. Create your first module to get started!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Button asChild variant="outline" className="border-[#4E0942] text-[#4E0942] bg-transparent">
            <Link href="/admin/courses">← Back to Courses</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
