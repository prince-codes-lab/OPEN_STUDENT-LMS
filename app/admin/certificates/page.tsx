import { connectDB } from "@/lib/mongodb/connection"
import { Certificate } from "@/lib/mongodb/models/Certificate"
import { verifyAdminAuth } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminGuard } from "@/components/admin-guard"
import { Award, Download, Calendar, User } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminCertificatesPage() {
  const admin = await verifyAdminAuth()
  if (!admin) {
    redirect("/admin/login")
  }

  let certificates = []

  try {
    await connectDB()
    certificates = await Certificate.find({})
      .populate("user_id")
      .populate("enrollment_id")
      .sort({ issued_at: -1 })
      .maxTimeMS(5000)
      .lean()
  } catch (error) {
    console.log("[v0] Failed to load certificates during build")
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#4E0942] mb-2">Certificates</h1>
            <p className="text-gray-600">View all issued certificates</p>
          </div>

          <Card className="border-2 border-[#FEEB00]">
            <CardHeader>
              <CardTitle className="text-[#4E0942] flex items-center gap-2">
                <Award size={24} />
                All Certificates ({certificates?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates?.map((cert) => {
                  const studentName = cert.user_id?.full_name || "Unknown Student"
                  const programName =
                    cert.enrollment_id?.courses?.title || cert.enrollment_id?.tours?.title || "Unknown Program"

                  return (
                    <Card key={cert.id} className="border-2 border-[#FEEB00] hover:shadow-xl transition-all">
                      <CardContent className="p-6 space-y-4">
                        <div className="w-16 h-16 bg-[#FEEB00] rounded-full flex items-center justify-center mx-auto">
                          <Award size={32} className="text-[#4E0942]" />
                        </div>
                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <User size={14} />
                            <span>{studentName}</span>
                          </div>
                          <h3 className="font-bold text-[#4E0942]">{programName}</h3>
                          <Badge className="bg-[#4E0942] text-white">#{cert.certificate_number}</Badge>
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>{new Date(cert.issued_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {cert.certificate_url && (
                          <Button
                            asChild
                            variant="outline"
                            className="w-full border-2 border-[#4E0942] text-[#4E0942] bg-transparent"
                          >
                            <a href={cert.certificate_url} download>
                              <Download size={16} className="mr-2" />
                              Download
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
                {(!certificates || certificates.length === 0) && (
                  <div className="col-span-full text-center text-gray-500 py-12">No certificates issued yet</div>
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
