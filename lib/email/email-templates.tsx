export function getVerificationEmailTemplate(fullName: string, verificationLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin-top: 20px; }
          .button { display: inline-block; margin: 20px 0; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Open Student</h1>
          </div>
          <div class="content">
            <p>Hi ${fullName},</p>
            <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationLink}" class="button">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><small>${verificationLink}</small></p>
            <p>This link expires in 24 hours.</p>
            <p>If you did not sign up for this account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Open Student. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getPasswordResetEmailTemplate(fullName: string, resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin-top: 20px; }
          .button { display: inline-block; margin: 20px 0; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { color: #dc3545; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${fullName},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><small>${resetLink}</small></p>
            <p class="warning">This link expires in 1 hour.</p>
            <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Open Student. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getCertificateEmailTemplate(fullName: string, programName: string, certificateUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin-top: 20px; }
          .button { display: inline-block; margin: 20px 0; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Congratulations!</h1>
          </div>
          <div class="content">
            <p>Hi ${fullName},</p>
            <p>You have successfully completed <strong>${programName}</strong>!</p>
            <p>Your certificate has been generated and attached to this email.</p>
            <a href="${certificateUrl}" class="button">View Certificate</a>
            <p>Great job on completing your learning journey!</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Open Student. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
