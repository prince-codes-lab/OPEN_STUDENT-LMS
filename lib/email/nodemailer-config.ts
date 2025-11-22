import nodemailer from "nodemailer"

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    throw new Error(
      "Email configuration is incomplete. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD environment variables.",
    )
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number.parseInt(smtpPort),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })

  return transporter
}

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const transporter = getTransporter()
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER

    const info = await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME || "Open Student"} <${fromEmail}>`,
      to,
      subject,
      html,
    })

    console.log("[v0] Email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("[v0] Email send failed:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
