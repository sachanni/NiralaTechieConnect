# Deployment Configuration Guide

This guide explains how to configure your application for deployment on any server.

## Required Environment Variables

### Core Application Settings

#### APP_URL (Optional on Replit, Required on Other Servers)
The public URL of your application, used for password reset links and other email notifications.

**Examples:**
- Production: `https://yourdomain.com`
- Staging: `https://staging.yourdomain.com`
- Custom domain: `https://niralatech.community`

**On Replit:**
- Optional - auto-detects the Replit dev domain
- Set this only if using a custom domain

**On Other Servers (AWS, Heroku, DigitalOcean, etc.):**
- **REQUIRED** - Must be set manually
- Should match your actual public URL

**How to Set:**

**Replit:**
```bash
# In Secrets (lock icon in sidebar)
APP_URL=https://yourdomain.com
```

**Heroku:**
```bash
heroku config:set APP_URL=https://yourapp.herokuapp.com
```

**AWS/DigitalOcean/Generic:**
```bash
export APP_URL=https://yourdomain.com
```

**Docker/Docker Compose:**
```yaml
environment:
  - APP_URL=https://yourdomain.com
```

### Email Configuration (SendGrid)

#### SENDGRID_API_KEY
Your SendGrid API key for sending transactional emails.

**How to Get:**
1. Go to https://app.sendgrid.com/
2. Navigate to Settings → API Keys
3. Click "Create API Key"
4. Choose "Full Access" or minimum "Mail Send" permission
5. Copy the key (shown only once!)

#### SENDGRID_FROM_EMAIL
The verified email address to send FROM.

**Requirements:**
- Must be verified in SendGrid
- Either single sender verification OR domain authentication

**Examples:**
- `noreply@yourdomain.com`
- `support@yourdomain.com`
- `niraj@auinovatechsoft.com`

### Database Configuration

#### DATABASE_URL
PostgreSQL connection string.

**Format:**
```
postgresql://username:password@host:port/database?sslmode=require
```

**On Replit:** Auto-provided when you create a Neon database
**On Other Servers:** Get from your database provider (Neon, AWS RDS, etc.)

### Firebase Configuration

#### FIREBASE_SERVICE_ACCOUNT
Firebase Admin SDK service account JSON (as a single-line string).

**How to Get:**
1. Go to Firebase Console → Project Settings
2. Navigate to Service Accounts tab
3. Click "Generate New Private Key"
4. Download the JSON file
5. Minify it to a single line (remove newlines)

### Payment Configuration (Razorpay)

#### RAZORPAY_KEY_ID
Your Razorpay API key ID.

#### RAZORPAY_KEY_SECRET
Your Razorpay API secret key.

**How to Get:**
1. Go to Razorpay Dashboard
2. Settings → API Keys
3. Generate new keys or use existing

---

## Deployment Checklist

Before deploying to a new server:

- [ ] Set `APP_URL` to your public domain
- [ ] Set `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`
- [ ] Set `DATABASE_URL` (from Neon or your DB provider)
- [ ] Set `FIREBASE_SERVICE_ACCOUNT` JSON
- [ ] Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- [ ] Verify SendGrid domain authentication is complete
- [ ] Run database migrations: `npm run db:push`
- [ ] Test password reset flow
- [ ] Test email delivery

## Testing Configuration

After deployment, test:

1. **Password Reset:**
   - Click "Forgot password?"
   - Enter registered email
   - Check email arrives (inbox, not spam)
   - Click reset link (should go to YOUR domain)
   - Reset password successfully

2. **Welcome Email:**
   - Register a new user
   - Check welcome email arrives
   - Verify email contains correct branding

3. **General:**
   - All links point to correct domain
   - No localhost/Replit URLs in production

## Quick Deploy Commands

### Replit (Current)
```bash
# Environment vars already set in Secrets
npm install
npm run db:push
npm run dev
```

### Heroku
```bash
heroku create your-app-name
heroku config:set APP_URL=https://your-app-name.herokuapp.com
heroku config:set SENDGRID_API_KEY=your_key
heroku config:set SENDGRID_FROM_EMAIL=noreply@yourdomain.com
heroku config:set DATABASE_URL=your_neon_url
# ... set other vars
git push heroku main
```

### DigitalOcean App Platform
```bash
# Set environment variables in App Platform dashboard
doctl apps create --spec .do/app.yaml
```

### AWS Elastic Beanstalk
```bash
eb init
eb setenv APP_URL=https://yourdomain.com
eb setenv SENDGRID_API_KEY=your_key
# ... set other vars
eb deploy
```

---

## Troubleshooting

**Password reset link goes to wrong domain:**
- Check `APP_URL` is set correctly
- Restart the application after changing

**Emails not sending:**
- Verify `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` are set
- Check SendGrid dashboard for delivery status
- Ensure sender email is verified

**Database connection fails:**
- Verify `DATABASE_URL` format is correct
- Check database is accessible from your server
- Run `npm run db:push` to sync schema
