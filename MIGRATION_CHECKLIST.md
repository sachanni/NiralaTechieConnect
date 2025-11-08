# Migration Checklist - New Platform Setup

Use this checklist when setting up authentication on a new platform.

---

## Pre-Migration (5 minutes)

- [ ] Create Firebase project at https://console.firebase.google.com/
- [ ] Enable Email/Password authentication in Firebase Console
- [ ] Enable Phone authentication in Firebase Console
- [ ] Create SendGrid account at https://sendgrid.com
- [ ] Create PostgreSQL database (Neon, AWS RDS, etc.)

---

## Setup Phase (15 minutes)

### Firebase Setup
- [ ] Download service account JSON (Project Settings → Service Accounts)
- [ ] Add Firebase config to frontend
- [ ] Enable reCAPTCHA v2 for phone auth

### SendGrid Setup
- [ ] Create API key (Settings → API Keys)
- [ ] Verify sender email (Settings → Sender Authentication → Single Sender)
- [ ] OR authenticate domain (Settings → Sender Authentication → Domain)
- [ ] Wait for DNS verification (15 min - 24 hours)

### Database Setup
- [ ] Create database instance
- [ ] Get connection string
- [ ] Test connection: `psql $DATABASE_URL`

---

## Code Migration (20 minutes)

- [ ] Copy `.env.template` → `.env` and fill values
- [ ] Copy `server/firebase-admin.ts`
- [ ] Copy `server/lib/sendgrid.ts`
- [ ] Copy password reset API endpoints to `server/routes.ts`
- [ ] Copy `client/src/lib/firebase.ts`
- [ ] Copy `client/src/components/EmailPasswordLogin.tsx`
- [ ] Copy `client/src/components/PasswordResetAction.tsx`
- [ ] Update Firebase config in frontend
- [ ] Add database schema fields:
  ```typescript
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  ```
- [ ] Run database migration: `npx drizzle-kit push:pg`

---

## Configuration (10 minutes)

### Environment Variables
- [ ] Set `DATABASE_URL`
- [ ] Set `FIREBASE_SERVICE_ACCOUNT` (JSON as single line)
- [ ] Set `SENDGRID_API_KEY`
- [ ] Set `SENDGRID_FROM_EMAIL`
- [ ] Set `APP_URL` (production domain)

### Frontend Routing
- [ ] Add route for `/?mode=resetPassword` → PasswordResetAction component
- [ ] Add login page with EmailPasswordLogin component

---

## Testing Phase (15 minutes)

### Test Password Reset via Email
1. - [ ] Open login page
2. - [ ] Click "Forgot password?"
3. - [ ] Enter your email
4. - [ ] Check inbox (should arrive in < 30 seconds)
5. - [ ] Click reset link in email
6. - [ ] Verify redirects to your domain (not localhost)
7. - [ ] Enter new password
8. - [ ] Submit and verify success screen
9. - [ ] Try logging in with new password

### Test Email/Password Login
- [ ] Login with email + password
- [ ] Verify successful authentication
- [ ] Check Firebase Console → Authentication → Users

### Test SendGrid Delivery
- [ ] Check SendGrid dashboard: https://app.sendgrid.com/
- [ ] Navigate to Activity → Email Activity
- [ ] Verify status = "delivered" (not "processed" or "bounced")
- [ ] Test with Gmail, Outlook, Yahoo email addresses
- [ ] Check spam folder (should be in inbox)

---

## Production Deployment (10 minutes)

### Pre-Deploy Checklist
- [ ] Set production `APP_URL`
- [ ] Verify all environment variables are set
- [ ] Run database migration on production DB
- [ ] Test email delivery from production server
- [ ] Verify Firebase project is in production mode

### Deploy
- [ ] Build application: `npm run build`
- [ ] Deploy to platform (Heroku, AWS, DigitalOcean, etc.)
- [ ] Verify environment variables are loaded
- [ ] Restart application

### Post-Deploy Verification
- [ ] Test password reset flow end-to-end
- [ ] Verify emails arrive (check inbox, not spam)
- [ ] Test from mobile device
- [ ] Monitor SendGrid dashboard for delivery rates

---

## Troubleshooting

### Emails not arriving
- [ ] Check SendGrid Activity dashboard
- [ ] Verify sender email is verified
- [ ] Check DNS records for domain authentication
- [ ] Test with different email providers

### Reset link goes to wrong domain
- [ ] Verify `APP_URL` is set correctly
- [ ] Restart application after changing env vars
- [ ] Check backend logs for actual URL being sent

### Firebase errors
- [ ] Verify service account JSON is correct
- [ ] Check Firebase project quotas
- [ ] Enable Email/Password provider in Firebase Console

### Database errors
- [ ] Verify `DATABASE_URL` format
- [ ] Check database is accessible from server
- [ ] Run migration: `npx drizzle-kit push:pg`
- [ ] Verify columns exist: `password_reset_token`, `password_reset_expiry`

---

## Success Metrics

After successful migration, you should see:

✅ **Cost Savings:**
- Phone OTP: Used only for registration (₹0.03 one-time)
- All logins: Email/password (₹0.00)
- Password resets: Email via SendGrid (₹0.00)
- **Total savings: 99% vs phone-only auth**

✅ **Email Deliverability:**
- 99%+ inbox delivery rate
- Emails arrive in < 30 seconds
- Professional branded emails
- SPF/DKIM/DMARC authentication

✅ **User Experience:**
- Fast email/password login
- Professional password reset flow
- Custom branded pages
- Mobile-responsive

---

## Platform-Specific Notes

### Heroku
```bash
heroku config:set APP_URL=https://yourapp.herokuapp.com
heroku config:set SENDGRID_API_KEY=SG.xxx
heroku config:set SENDGRID_FROM_EMAIL=noreply@yourdomain.com
heroku config:set DATABASE_URL=postgresql://...
heroku config:set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

### AWS Elastic Beanstalk
```bash
eb setenv APP_URL=https://yourdomain.com
eb setenv SENDGRID_API_KEY=SG.xxx
# ... etc
```

### DigitalOcean App Platform
Set environment variables in App Platform dashboard under Settings → App-Level Environment Variables

### Vercel
Set environment variables in project settings:
```bash
vercel env add APP_URL production
vercel env add SENDGRID_API_KEY production
# ... etc
```

---

**Total Migration Time: ~75 minutes**

**Need Help?** Refer to:
- `QUICK_START_TEMPLATE.md` - Copy-paste code
- `AUTH_IMPLEMENTATION_GUIDE.md` - Detailed explanations
- `DEPLOYMENT_CONFIG.md` - Environment setup guide
