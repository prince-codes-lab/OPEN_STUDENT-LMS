# Deployment Steps for Production

## Pre-Deployment

1. **Verify Security Fixes**
   - Review all changes in SECURITY_FIXES_SUMMARY.md
   - Check all environment variables are configured
   - Test authentication flows locally

2. **Database Preparation**
   \`\`\`bash
   npx ts-node scripts/add-database-indexes.ts
   \`\`\`

3. **Local Testing**
   \`\`\`bash
   npm install
   npm run dev
   # Test signup, login, email verification, password reset
   \`\`\`

## Vercel Deployment

1. **Set Environment Variables**
   - Go to Vercel Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Ensure JWT_SECRET is at least 32 characters
   - Test SMTP credentials before deploying

2. **Deploy to Production**
   \`\`\`bash
   git push (automatically deploys to Vercel)
   \`\`\`

3. **Post-Deployment Verification**
   - [ ] Test signup endpoint
   - [ ] Test login with rate limiting
   - [ ] Test email verification
   - [ ] Test password reset
   - [ ] Verify security headers in browser DevTools
   - [ ] Check audit logs for activity

## GitHub Integration

1. Connect your Vercel project to GitHub
2. Set production environment variables
3. Enable auto-deployments on push to main branch

## Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication
2. Create App Password (https://myaccount.google.com/apppasswords)
3. Use generated password for SMTP_PASSWORD

### Alternative Providers
- SendGrid: signup.sendgrid.com
- Resend: resend.com
- Mailgun: mailgun.com

## Monitoring

1. **Enable Vercel Analytics**
   - Monitor performance metrics
   - Track page load times

2. **Monitor Logs**
   - Check audit logs for suspicious activity
   - Monitor rate limit triggers
   - Track email delivery failures

3. **Set Up Alerts**
   - Configure alerts for deployment failures
   - Monitor database connection errors
   - Track email sending failures

## Rollback Plan

If issues occur:
1. Revert to previous commit: `git revert <commit-hash>`
2. Push to trigger Vercel redeploy
3. Check logs to identify issue
4. Fix and redeploy

---

Contact support if you encounter any issues during deployment.
