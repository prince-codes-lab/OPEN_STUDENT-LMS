"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save } from "lucide-react"
import { AdminGuard } from "@/components/admin-guard"

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json()
      setSettings(data)
      if (data.logoUrl) setLogoPreview(data.logoUrl)
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error fetching settings:", error)
      setLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "File size must be less than 5MB" })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setLogoPreview(base64String)
        setSettings({
          ...settings,
          logoUrl: base64String,
          logoName: file.name,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEnvChange = (key: string, value: string) => {
    setSettings({
      ...settings,
      environmentVariables: {
        ...settings.environmentVariables,
        [key]: value,
      },
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: "error", text: "Failed to save settings" })
      }
    } catch (error) {
      console.error("[v0] Error saving settings:", error)
      setMessage({ type: "error", text: "Error saving settings" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="p-8 text-center">
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-[#4E0942] mb-8">Site Settings & Configuration</h1>

          {message && (
            <Alert variant={message.type === "success" ? "default" : "destructive"} className="mb-6">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
            {/* Logo Upload */}
            <Card className="border-2 border-[#DD91D0]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Site Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  {logoPreview && (
                    <div className="relative">
                      <img
                        src={logoPreview || "/placeholder.svg"}
                        alt="Logo preview"
                        className="h-24 w-24 object-contain border-2 border-[#DD91D0] rounded p-2"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label htmlFor="logo-upload" className="block mb-2 font-semibold text-[#4E0942]">
                      Upload New Logo
                    </Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      PNG, JPG, GIF up to 5MB. Logo will be saved to MongoDB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environment Variables */}
            <Card className="border-2 border-[#FF2768]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Environment Variables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    { key: "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY", label: "Paystack Public Key" },
                    { key: "PAYSTACK_SECRET_KEY", label: "Paystack Secret Key" },
                    { key: "NEXT_PUBLIC_SITE_URL", label: "Site URL" },
                    { key: "JWT_SECRET", label: "JWT Secret" },
                    { key: "MONGODB_URI", label: "MongoDB URI 1" },
                    { key: "MONGODB_URI_2", label: "MongoDB URI 2" },
                  ].map((env) => (
                    <div key={env.key}>
                      <Label htmlFor={env.key} className="text-sm font-semibold text-[#4E0942]">
                        {env.label}
                      </Label>
                      <Input
                        id={env.key}
                        type={env.key.includes("SECRET") || env.key.includes("JWT") ? "password" : "text"}
                        value={settings?.environmentVariables?.[env.key] || ""}
                        onChange={(e) => handleEnvChange(env.key, e.target.value)}
                        placeholder={`Enter ${env.label}`}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-bold"
              >
                <Save className="mr-2" size={18} />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
