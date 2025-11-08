import sgMail from '@sendgrid/mail';

let connectionSettings: any;

/**
 * Get SendGrid credentials from environment variables or Replit connector
 * Priority: Manual env vars > Replit connector (for portability)
 */
async function getCredentials() {
  // Option 1: Use manual environment variables (works on ANY server)
  const manualApiKey = process.env.SENDGRID_API_KEY;
  const manualFromEmail = process.env.SENDGRID_FROM_EMAIL;
  
  if (manualApiKey && manualFromEmail) {
    console.log('[SendGrid] Using manual environment variables');
    return { apiKey: manualApiKey, email: manualFromEmail };
  }
  
  // Option 2: Fall back to Replit connector (Replit-specific)
  console.log('[SendGrid] Falling back to Replit connector');
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    throw new Error('SendGrid not configured. Please set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL environment variables.');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not configured. Please set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL environment variables.');
  }
  return {apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email};
}

export async function getUncachableSendGridClient() {
  const {apiKey, email} = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const msg = {
      to: options.to,
      from: {
        email: fromEmail,
        name: 'NiralaTechieConnect'
      },
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    await client.send(msg);
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('SendGrid email error:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🔒 Password Reset</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                Hi there,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                We received a request to reset your password for your <strong>NiralaTechieConnect</strong> account.
              </p>
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #333333;">
                Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px 0; font-size: 14px; line-height: 20px; color: #666666;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 30px 0; font-size: 13px; line-height: 20px; color: #667eea; word-break: break-all;">
                ${resetLink}
              </p>
              
              <!-- Security Notice -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; line-height: 20px; color: #856404;">
                  <strong>⏰ This link expires in 1 hour</strong> for your security.
                </p>
              </div>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 20px; color: #666666;">
                If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                <strong>NiralaTechieConnect</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Connecting techies in Nirala Estate
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Bottom Disclaimer -->
        <p style="margin: 20px 0 0 0; font-size: 12px; color: #999999; text-align: center;">
          This is an automated security email. Please do not reply to this message.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Reset Your Password

Hi there,

We received a request to reset your password for your NiralaTechieConnect account.

Click the link below to create a new password:
${resetLink}

This link expires in 1 hour for your security.

If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.

---
NiralaTechieConnect
Connecting techies in Nirala Estate
  `;

  await sendEmail({
    to: email,
    subject: 'Reset your password - NiralaTechieConnect',
    html,
    text
  });
}

export async function sendWelcomeEmail(email: string, displayName: string): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NiralaTechieConnect</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0 0 10px 0; color: #ffffff; font-size: 32px; font-weight: 700;">🎉 Welcome!</h1>
              <p style="margin: 0; color: #ffffff; font-size: 16px; opacity: 0.95;">You're now part of the community</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 18px; line-height: 26px; color: #333333;">
                Hi <strong>${displayName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                Welcome to <strong>NiralaTechieConnect</strong> - your community platform for connecting with fellow techies in Nirala Estate! 🚀
              </p>
              
              <!-- What You Can Do -->
              <h2 style="margin: 30px 0 20px 0; font-size: 20px; font-weight: 600; color: #333333;">
                Here's what you can do:
              </h2>
              
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 10px;">
                    <p style="margin: 0; font-size: 15px; color: #333333;">
                      <strong style="color: #667eea;">💼 Skill Swap:</strong> Exchange skills with other techies
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 10px;">
                    <p style="margin: 0; font-size: 15px; color: #333333;">
                      <strong style="color: #667eea;">📢 Jobs:</strong> Find job opportunities or post openings
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 10px;">
                    <p style="margin: 0; font-size: 15px; color: #333333;">
                      <strong style="color: #667eea;">🎪 Events:</strong> Join or host community events
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 10px;">
                    <p style="margin: 0; font-size: 15px; color: #333333;">
                      <strong style="color: #667eea;">💬 Forums:</strong> Discuss topics with the community
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
                    <p style="margin: 0; font-size: 15px; color: #333333;">
                      <strong style="color: #667eea;">🛠️ Services:</strong> Offer or find professional services
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Next Steps -->
              <div style="background: linear-gradient(135deg, #f0f4ff 0%, #f8f0ff 100%); border-radius: 8px; padding: 25px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #333333;">
                  🎯 Get Started:
                </h3>
                <ol style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 24px; color: #555555;">
                  <li style="margin-bottom: 8px;">Complete your profile with skills and interests</li>
                  <li style="margin-bottom: 8px;">Browse skill swap opportunities</li>
                  <li style="margin-bottom: 8px;">Join upcoming community events</li>
                  <li>Start connecting with fellow techies!</li>
                </ol>
              </div>
              
              <p style="margin: 20px 0 0 0; font-size: 15px; line-height: 22px; color: #666666;">
                Need help? Feel free to reach out to our support team anytime.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                <strong>NiralaTechieConnect</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Connecting techies in Nirala Estate
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Bottom Note -->
        <p style="margin: 20px 0 0 0; font-size: 12px; color: #999999; text-align: center;">
          You're receiving this email because you created an account on NiralaTechieConnect.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Welcome to NiralaTechieConnect!

Hi ${displayName},

Welcome to NiralaTechieConnect - your community platform for connecting with fellow techies in Nirala Estate! 🚀

Here's what you can do:
• Skill Swap: Exchange skills with other techies
• Jobs: Find job opportunities or post openings
• Events: Join or host community events
• Forums: Discuss topics with the community
• Services: Offer or find professional services

Get Started:
1. Complete your profile with skills and interests
2. Browse skill swap opportunities
3. Join upcoming community events
4. Start connecting with fellow techies!

Need help? Feel free to reach out to our support team anytime.

---
NiralaTechieConnect
Connecting techies in Nirala Estate
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to NiralaTechieConnect! 🎉',
    html,
    text
  });
}
