# SendGrid Configuration Guide

This application uses **portable environment variables** for SendGrid configuration, making it work on ANY server (Replit, AWS, Heroku, DigitalOcean, etc.).

## Required Environment Variables

Add these two secrets to your environment:

### 1. SENDGRID_API_KEY
Your SendGrid API key (found in SendGrid dashboard)

**How to get it:**
1. Go to https://app.sendgrid.com/
2. Navigate to **Settings → API Keys**
3. Click **"Create API Key"**
4. Choose **"Full Access"** or at minimum **"Mail Send"** permission
5. Copy the API key (you'll only see it once!)

### 2. SENDGRID_FROM_EMAIL
The verified email address to send FROM

**Must be one of:**
- `niraj@auinovatechsoft.com` (already verified)
- `noreply@em5065.auinovatechsoft.com` (domain verified)
- Any other email from your verified domain

## Setup on Different Servers

### Replit (Current Server)
1. Click the lock icon 🔐 in the left sidebar (Secrets)
2. Add both secrets:
   - Key: `SENDGRID_API_KEY`, Value: your API key
   - Key: `SENDGRID_FROM_EMAIL`, Value: `niraj@auinovatechsoft.com`
3. Restart the server

### AWS / Heroku / DigitalOcean / Any Other Server
1. Set environment variables in your hosting platform:
   ```bash
   export SENDGRID_API_KEY="your-api-key-here"
   export SENDGRID_FROM_EMAIL="niraj@auinovatechsoft.com"
   ```
2. Or add to `.env` file (for local development):
   ```
   SENDGRID_API_KEY=your-api-key-here
   SENDGRID_FROM_EMAIL=niraj@auinovatechsoft.com
   ```

## How It Works

The application checks for credentials in this order:
1. **Manual environment variables** (SENDGRID_API_KEY + SENDGRID_FROM_EMAIL) ← Portable
2. **Replit connector** (fallback, Replit-only)

This ensures your application is **portable** and can run anywhere!

## Testing

After setting the variables, test the password reset flow:
1. Go to login page
2. Click "Forgot password?"
3. Enter a registered email
4. Check inbox (email should arrive in ~5 seconds, NOT in spam!)

## Production Deployment

When deploying to production:
1. Set both environment variables on your production server
2. Ensure SendGrid domain authentication is complete
3. Monitor SendGrid dashboard for delivery rates
