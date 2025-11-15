import admin from 'firebase-admin';

let initialized = false;

function initializeFirebase() {
  if (initialized) return;
  
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw new Error('Invalid Firebase service account credentials');
  }
}

function getAuth() {
  if (!initialized) {
    initializeFirebase();
  }
  return admin.auth();
}

export async function verifyIdToken(idToken: string) {
  try {
    const auth = getAuth();
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

