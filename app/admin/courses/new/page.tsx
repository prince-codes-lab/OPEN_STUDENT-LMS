"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { AdminGuard } from "@/components/admin-guard"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useGoogleClassroom, setUseGoogleClassroom] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    durationWeeks: "",
    priceNgn: "",
    priceUsd: "",
    category: "writing",
    googleClassroomLink: "",
    contentType: "external", // 'external' for Google Classroom or 'internal' for direct upload
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleContentTypeChange = (type: string) => {
    setUseGoogleClassroom(type === "external")
    setFormData((prev) => ({
      ...prev,
      contentType: type,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        durationWeeks: Number.parseInt(formData.durationWeeks),
        priceNgn: Number.parseInt(formData.priceNgn),
        priceUsd: Number.parseInt(formData.priceUsd),
        category: formData.category,
        googleClassroomLink: useGoogleClassroom ? formData.googleClassroomLink : null,
        contentType: formData.contentType,
        isActive: true,
      }

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      })

      if (!response.ok) {
        throw new Error("Failed to create course")
      }

      router.push("/admin/courses")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#4E0942] mb-2">Create New Course</h1>
              <p className="text-gray-600">Add a new course to your platform</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Course Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Professional Writing Masterclass"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="Describe what students will learn..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E0942]"
                    >
                      <option value="writing">Writing</option>
                      <option value="graphics">Graphics Design</option>
                      <option value="video">Video Editing</option>
                      <option value="speaking">Public Speaking</option>
                      <option value="leadership">Leadership</option>
                      <option value="storytelling">Storytelling</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priceNgn">Price (NGN) *</Label>
                      <Input
                        id="priceNgn"
                        name="priceNgn"
                        type="number"
                        value={formData.priceNgn}
                        onChange={handleChange}
                        required
                        placeholder="5000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priceUsd">Price (USD) *</Label>
                      <Input
                        id="priceUsd"
                        name="priceUsd"
                        type="number"
                        value={formData.priceUsd}
                        onChange={handleChange}
                        required
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="durationWeeks">Duration (weeks) *</Label>
                    <Input
                      id="durationWeeks"
                      name="durationWeeks"
                      type="number"
                      value={formData.durationWeeks}
                      onChange={handleChange}
                      required
                      placeholder="6"
                    />
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <Label className="text-base font-semibold">Content Delivery Method *</Label>
                    <div className="space-y-3">
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          !useGoogleClassroom ? "border-[#4E0942] bg-[#4E0942]/5" : "border-gray-300 bg-white"
                        }`}
                        onClick={() => handleContentTypeChange("internal")}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="contentType"
                            value="internal"
                            checked={!useGoogleClassroom}
                            onChange={() => handleContentTypeChange("internal")}
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="font-semibold text-[#4E0942]">Upload Content Directly</p>
                            <p className="text-sm text-gray-600">
                              Add modules, lessons, and materials through the admin panel
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          useGoogleClassroom ? "border-[#FF2768] bg-[#FF2768]/5" : "border-gray-300 bg-white"
                        }`}
                        onClick={() => handleContentTypeChange("external")}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="contentType"
                            value="external"
                            checked={useGoogleClassroom}
                            onChange={() => handleContentTypeChange("external")}
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="font-semibold text-[#FF2768]">Use Google Classroom Link</p>
                            <p className="text-sm text-gray-600">
                              Students will access content through an external Google Classroom link
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {useGoogleClassroom && (
                    <div className="space-y-2">
                      <Label htmlFor="googleClassroomLink">Google Classroom Link *</Label>
                      <Input
                        id="googleClassroomLink"
                        name="googleClassroomLink"
                        type="url"
                        value={formData.googleClassroomLink}
                        onChange={handleChange}
                        required={useGoogleClassroom}
                        placeholder="https://classroom.google.com/c/..."
                      />
                      <p className="text-xs text-gray-600">Paste the full URL to your Google Classroom</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading} className="flex-1 bg-[#4E0942] hover:bg-[#4E0942]/90">
                      {loading ? "Creating..." : "Create Course"}
                    </Button>
                    <Button
                      asChild
                      type="button"
                      variant="outline"
                      className="flex-1 border-[#4E0942] text-[#4E0942] bg-transparent"
                    >
                      <Link href="/admin/courses">Cancel</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
