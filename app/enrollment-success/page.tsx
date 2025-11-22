import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { connectDB } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { redirect } from "next/navigation"

export default async function EnrollmentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>
}) {
  const params = await searchParams
  const reference = params.reference

  if (!reference) {
    redirect("/programs")
  }

  try {
    await connectDB()

    const enrollment = await Enrollment.findOne({ payment_reference: reference })
      .populate("course_id")
      .populate("tour_id")

    if (!enrollment) {
      redirect("/programs")
    }

    const itemTitle = enrollment.course_id?.title || enrollment.tour_id?.title || "Your Program"

    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#DD91D0]/5 to-[#FF2768]/5">
        <Navigation />

        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto space-y-8">
              <Card className="border-2 border-[#FEEB00] shadow-2xl animate-scale-in">
                <CardHeader className="text-center space-y-4 pb-4">
                  <div className="w-20 h-20 bg-[#FEEB00] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={48} className="text-[#4E0942]" />
                  </div>
                  <CardTitle className="text-3xl md:text-4xl font-bold text-[#4E0942]">
                    Enrollment Successful!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-lg text-gray-700">
                      Congratulations! You've successfully enrolled in <span className="font-bold">{itemTitle}</span>
                    </p>
                    <p className="text-sm text-gray-600">Reference: {reference}</p>
                  </div>

                  <div className="bg-gradient-to-br from-[#4E0942]/5 to-[#DD91D0]/5 rounded-lg p-6 space-y-4">
                    <h3 className="font-bold text-[#4E0942] text-lg">What's Next?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#FEEB00] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#4E0942] text-sm font-bold">1</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#4E0942]">Check Your Email</p>
                          <p className="text-sm text-gray-700">
                            We've sent you a confirmation email with access details and next steps.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#FEEB00] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#4E0942] text-sm font-bold">2</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#4E0942]">Access Your Dashboard</p>
                          <p className="text-sm text-gray-700">
                            Visit your student dashboard to access course materials and track your progress.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#FEEB00] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#4E0942] text-sm font-bold">3</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#4E0942]">Start Learning</p>
                          <p className="text-sm text-gray-700">
                            Join your Google Classroom and begin your learning journey today!
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button asChild className="flex-1 bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-bold py-6">
                      <Link href="/dashboard">
                        Go to Dashboard
                        <ArrowRight className="ml-2" size={20} />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 border-2 border-[#FF2768] text-[#FF2768] hover:bg-[#FF2768] hover:text-white font-bold py-6 bg-transparent"
                    >
                      <Link href="/programs">Browse More Programs</Link>
                    </Button>
                  </div>

                  <p className="text-xs text-center text-gray-600 pt-4">
                    Need help? Contact us at info@theopenstudents.com
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    )
  } catch (error) {
    console.error("Error fetching enrollment data:", error)
    redirect("/programs")
  }
}
