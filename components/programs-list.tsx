"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Palette, Video, Mic, UsersIcon, BookText, AlertCircle } from "lucide-react"

interface Course {
  _id: string
  title: string
  description: string
  category: string
  priceNgn: number
  priceUsd: number
  durationWeeks: number
}

const iconMap = {
  BookOpen,
  Palette,
  Video,
  Mic,
  UsersIcon,
  BookText,
} as const

export function ProgramsList({
  categoryColors,
}: {
  categoryColors: Record<string, string>
}) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setError(null)
      const response = await fetch("/api/courses")
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`)
      }
      const data = await response.json()
      if (!Array.isArray(data)) {
        throw new Error("Invalid courses data format")
      }
      setCourses(data)
    } catch (error) {
      console.error("[v0] Error fetching courses:", error)
      setError(error instanceof Error ? error.message : "Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading courses...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 font-semibold mb-2">Failed to load courses</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchCourses} className="bg-[#4E0942] hover:bg-[#4E0942]/90 text-white">
          Try Again
        </Button>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>No courses available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses?.map((course, index) => {
        const IconComponent = iconMap[course.category as keyof typeof iconMap]
        const color = categoryColors[course.category] || "#4E0942"

        return (
          <Card
            key={course._id}
            className="border-2 hover:border-[#FF2768] transition-all hover:shadow-xl group animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${color}20` }}
              >
                {IconComponent && <IconComponent size={28} style={{ color }} />}
              </div>
              <CardTitle className="text-xl text-[#4E0942]">{course.title}</CardTitle>
              <CardDescription className="text-base">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold text-[#4E0942]">{course.durationWeeks} weeks</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#FF2768]">₦{course.priceNgn.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">${course.priceUsd}</div>
                </div>
                <Button asChild className="bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-semibold">
                  <Link href={`/enroll?course=${course._id}`}>Enroll Now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
