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
