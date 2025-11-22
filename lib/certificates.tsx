import { sendEmail } from "@/lib/email/nodemailer-config"
import { getCertificateEmailTemplate } from "@/lib/email/email-templates"

export function generateCertificateNumber(): string {
  return `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

export function generateCertificateSVG(data: {
  studentName: string
  courseName?: string
  tourName?: string
  completionDate: string
  certificateNumber: string
}): string {
  const programName = data.courseName || data.tourName || "Program"

  return `
    <svg width="1000" height="700" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .certificate-bg { fill: #f5f5f5; stroke: #333; stroke-width: 3; }
          .certificate-border { fill: none; stroke: #d4af37; stroke-width: 8; }
          .title { font-size: 48px; font-weight: bold; text-anchor: middle; }
          .subtitle { font-size: 32px; text-anchor: middle; font-style: italic; }
          .content { font-size: 24px; text-anchor: middle; }
          .label { font-size: 18px; text-anchor: middle; }
        </style>
      </defs>
      
      <rect width="1000" height="700" class="certificate-bg"/>
      <rect x="20" y="20" width="960" height="660" class="certificate-border"/>
      
      <text x="500" y="100" class="title">Certificate of Completion</text>
      
      <text x="500" y="200" class="content">This is to certify that</text>
      <text x="500" y="270" class="subtitle">${data.studentName}</text>
      
      <text x="500" y="350" class="content">has successfully completed</text>
      <text x="500" y="420" class="subtitle">${programName}</text>
      
      <text x="500" y="500" class="content">Completion Date: ${data.completionDate}</text>
      <text x="500" y="550" class="label">Certificate Number: ${data.certificateNumber}</text>
      
      <text x="500" y="650" class="label">Open Student</text>
    </svg>
  `
}

export async function sendCertificateEmail(
  email: string,
  fullName: string,
  programName: string,
  certificateUrl: string,
) {
  try {
    const result = await sendEmail(
      email,
      `Certificate of Completion - ${programName}`,
      getCertificateEmailTemplate(fullName, programName, certificateUrl),
    )
    return result
  } catch (error) {
    console.error("[v0] Certificate email error:", error)
    return { success: false }
  }
}
