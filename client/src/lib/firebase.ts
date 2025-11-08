import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  ConfirmationResult,
  updatePassword,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  console.error('Firebase configuration missing:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    hasAppId: !!firebaseConfig.appId,
  });
  throw new Error('Firebase configuration is incomplete. Please check environment variables.');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export class PhoneAuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  setupRecaptcha(containerId: string) {
    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA verified');
      }
    });
  }

  async sendOTP(phoneNumber: string): Promise<void> {
    if (!this.recaptchaVerifier) {
      throw new Error('reCAPTCHA not initialized');
    }

    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    try {
      this.confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        this.recaptchaVerifier
      );
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  async verifyOTP(code: string): Promise<string> {
    if (!this.confirmationResult) {
      throw new Error('No confirmation result available');
    }

    try {
      const result = await this.confirmationResult.confirm(code);
      const idToken = await result.user.getIdToken();
      return idToken;
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  cleanup() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }
}

export class EmailPasswordAuthService {
  async linkEmailPassword(email: string, password: string): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user to link');
      }

      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(user, credential);
      const idToken = await user.getIdToken();
      return idToken;
    } catch (error: any) {
      console.error('Error linking email/password:', error);
      throw error;
    }
  }

  async signInWithEmail(email: string, password: string): Promise<string> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      return idToken;
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  }

  async updateUserPassword(newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user to update password');
      }

      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async verifyPasswordResetCode(code: string): Promise<string> {
    try {
      const email = await verifyPasswordResetCode(auth, code);
      return email;
    } catch (error: any) {
      console.error('Error verifying password reset code:', error);
      throw error;
    }
  }

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      await confirmPasswordReset(auth, code, newPassword);
    } catch (error: any) {
      console.error('Error confirming password reset:', error);
      throw error;
    }
  }
}
