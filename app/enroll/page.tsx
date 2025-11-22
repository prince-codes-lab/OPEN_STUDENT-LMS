"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { LoadingModal } from "@/components/loading-modal"

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string
        email: string
        amount: number
        currency: string
        ref: string
        metadata?: Record<string, unknown>
        onClose: () => void
        callback: (response: { reference: string }) => void
      }) => {
        openIframe: () => void
      }
    }
  }
}

interface CourseData {
  _id: string
  title: string
  priceNgn: number
  priceUsd: number
}

export default function EnrollPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")
  const [selectedItem, setSelectedItem] = useState<CourseData | null>(null)
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN")
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check auth token
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth_token="))
          ?.split("=")[1]

        if (!token) {
          router.push(`/auth/login?redirect=/enroll?${searchParams.toString()}`)
          return
        }

        // Get user email
        const profileRes = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (profileRes.ok) {
          const profile = await profileRes.json()
          setUserEmail(profile.email)
        }

        // Load course data
        const courseId = searchParams.get("course")
        if (courseId) {
          const courseRes = await fetch(`/api/courses/${courseId}`)
          if (courseRes.ok) {
            const course = await courseRes.json()
            setSelectedItem(course)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error("[v0] Error loading enrollment data:", error)
        setLoading(false)
      }
    }

    loadData()

    // Load Paystack script
    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    script.onload = () => {
      console.log("[v0] Paystack script loaded")
      setScriptLoaded(true)
    }
    script.onerror = () => {
      console.error("[v0] Failed to load Paystack script")
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [searchParams, router])

  const handlePayment = async () => {
    if (!selectedItem || !userEmail || !scriptLoaded) {
      alert("Please wait for the page to fully load")
      return
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!paystackKey) {
      alert("Payment system is not configured")
      return
    }

    setProcessing(true)

    try {
      const amount = currency === "NGN" ? selectedItem.priceNgn * 100 : selectedItem.priceUsd * 100

      const reference = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create enrollment
      const enrollRes = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedItem._id,
          paymentReference: reference,
          paymentStatus: "pending",
          amountPaid: amount / 100,
          currency,
          enrollmentType: "course",
        }),
      })

      if (!enrollRes.ok) {
        throw new Error("Failed to create enrollment")
      }

      // Initialize Paystack
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: userEmail,
        amount: amount,
        currency: currency,
        ref: reference,
        metadata: {
          course_id: selectedItem._id,
          course_title: selectedItem.title,
        },
        onClose: () => {
          console.log("[v0] Payment popup closed")
          setProcessing(false)
        },
        callback: async (response: { reference: string }) => {
          try {
            // Verify payment
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference: response.reference }),
            })

            const result = await verifyRes.json()

            if (result.success) {
              router.push(`/enrollment-success?reference=${response.reference}`)
            } else {
              alert(`Payment verification failed: ${result.error}`)
              setProcessing(false)
            }
          } catch (error) {
            console.error("[v0] Verification error:", error)
            alert("Payment verification failed. Please contact support.")
            setProcessing(false)
          }
        },
      })

      handler.openIframe()
    } catch (error) {
      console.error("[v0] Payment error:", error)
      alert(error instanceof Error ? error.message : "An error occurred")
      setProcessing(false)
    }
  }

  if (loading || processing) {
    return <LoadingModal message={processing ? "Processing payment..." : "Loading enrollment details..."} />
  }

  if (!selectedItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#DD91D0]/5 to-[#FF2768]/5">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-700">No course selected. Please go back and select one.</p>
            <Button asChild className="mt-4 bg-[#4E0942] hover:bg-[#4E0942]/90 text-white">
              <a href="/programs">Browse Programs</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const price = currency === "NGN" ? selectedItem.priceNgn : selectedItem.priceUsd

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DD91D0]/5 to-[#FF2768]/5">
      <Navigation />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4 animate-fade-in-up">
              <Badge className="bg-[#FEEB00] text-[#4E0942] hover:bg-[#FEEB00]/90 text-sm font-bold px-4 py-2">
                Enrollment
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-[#4E0942]">Complete Your Enrollment</h1>
              <p className="text-lg text-gray-700">You're one step away from starting your learning journey</p>
            </div>

            {/* Enrollment Details */}
            <Card className="border-2 border-[#DD91D0] shadow-xl animate-scale-in">
              <CardHeader>
                <CardTitle className="text-2xl text-[#4E0942]">{selectedItem.title}</CardTitle>
                <CardDescription className="text-base">Digital Course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Currency Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-[#4E0942]">Select Currency</Label>
                  <RadioGroup value={currency} onValueChange={(value) => setCurrency(value as "NGN" | "USD")}>
                    <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-[#FF2768] transition-colors cursor-pointer">
                      <RadioGroupItem value="NGN" id="ngn" />
                      <Label htmlFor="ngn" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Nigerian Naira (₦)</span>
                          <span className="text-2xl font-bold text-[#FF2768]">
                            ₦{selectedItem.priceNgn.toLocaleString()}
                          </span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-[#FF2768] transition-colors cursor-pointer">
                      <RadioGroupItem value="USD" id="usd" />
                      <Label htmlFor="usd" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">US Dollar ($)</span>
                          <span className="text-2xl font-bold text-[#FF2768]">${selectedItem.priceUsd}</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* What's Included */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold text-[#4E0942]">What's Included:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 size={20} className="text-[#FEEB00]" />
                      <span>Full course access via Google Classroom</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 size={20} className="text-[#FEEB00]" />
                      <span>Guided workbook and learning materials</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 size={20} className="text-[#FEEB00]" />
                      <span>Certificate of completion via email</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 size={20} className="text-[#FEEB00]" />
                      <span>Lifetime access to course materials</span>
                    </li>
                  </ul>
                </div>

                {/* Payment Summary */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-semibold text-[#4E0942]">Total Amount:</span>
                    <span className="text-3xl font-bold text-[#FF2768]">
                      {currency === "NGN" ? `₦${price.toLocaleString()}` : `$${price}`}
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-bold text-lg py-6"
                >
                  Pay with Paystack
                </Button>

                <p className="text-xs text-center text-gray-600">
                  Secure payment powered by Paystack. Your payment information is encrypted and secure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
