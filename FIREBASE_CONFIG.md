# Firebase Password Reset Configuration

## Custom Password Reset Page Setup

Your app now includes a professional, branded password reset page instead of Firebase's default page.

### Configure Firebase Console

To use the custom password reset page, you need to configure Firebase to redirect users to your domain:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: NiralaTechieConnect
3. **Navigate to**: Authentication → Templates → Password reset
4. **Click "Edit template"** (pencil icon)
5. **Update the Action URL**: 
   - Development: `https://your-repl-url.replit.dev/?mode=resetPassword&oobCode=CODE`
   - Production: `https://your-domain.com/?mode=resetPassword&oobCode=CODE`
   
   **Important**: Keep `%LINK%` at the end or manually replace with the format above

6. **Click "Save"**

### How It Works

**Old Flow (Default Firebase):**
```
User clicks reset link → Firebase hosted page (basic, unbranded) → Password reset
```

**New Flow (Custom Branded):**
```
User clicks reset link → Your app's custom page → Professional UI → Password reset
```

### Custom Page Features

✅ **Branded Design**: Matches your app's look and feel
✅ **Professional UI**: Modern card-based layout with icons
✅ **Better UX**: Clear error messages and visual feedback
✅ **Validation**: Real-time password matching and strength validation
✅ **Security**: Verifies reset code before allowing password change
✅ **Responsive**: Works perfectly on mobile and desktop

### URL Parameters

The password reset link contains these parameters:
- `mode=resetPassword` - Identifies this as a password reset action
- `oobCode=xxx` - One-time code to verify the reset request

### Testing

1. Go to your app's login page
2. Click "Forgot password?"
3. Enter your email and click "Send" (Email Reset)
4. Check your email
5. Click the reset link
6. You should see the custom branded page (not Firebase's default page)

### Fallback

If Firebase is not configured with the custom URL, users will still see Firebase's default page. The custom page will work once the action URL is configured in Firebase Console.

### Email Template Customization

You can also customize the email template in Firebase Console:
1. Go to: Authentication → Templates → Password reset
2. Edit the email subject and body
3. Keep the `%LINK%` variable for the reset link
4. Add your branding, logo, or custom message

### Support

If users report seeing the old Firebase page:
1. Verify the action URL is correctly configured in Firebase Console
2. Make sure the URL includes your domain
3. Test with a fresh password reset request
