import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw new Error('Invalid Firebase service account credentials');
  }
}

export const auth = admin.auth();

export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function getPhoneNumberFromToken(idToken: string): Promise<string> {
  const decodedToken = await verifyIdToken(idToken);
  if (!decodedToken.phone_number) {
    throw new Error('No phone number in token');
  }
  return decodedToken.phone_number;
}

export async function getUserIdentifierFromToken(idToken: string): Promise<{ type: 'phone' | 'email', value: string }> {
  const decodedToken = await verifyIdToken(idToken);
  
  if (decodedToken.phone_number) {
    return { type: 'phone', value: decodedToken.phone_number };
  } else if (decodedToken.email) {
    return { type: 'email', value: decodedToken.email };
  } else {
    throw new Error('Token has neither phone number nor email');
  }
}

export async function updateUserPassword(userId: string, newPassword: string, email?: string): Promise<void> {
  try {
    const updateData: admin.auth.UpdateRequest = {
      password: newPassword
    };
    
    // If email is provided, set it in Firebase Auth (enables email/password login)
    if (email) {
      updateData.email = email;
      updateData.emailVerified = true; // Mark as verified since they proved ownership via reset token
    }
    
    await auth.updateUser(userId, updateData);
  } catch (error) {
    console.error('Failed to update password:', error);
    throw new Error('Failed to update password');
  }
}
