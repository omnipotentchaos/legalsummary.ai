// lib/firebase.js - Fixed for Cloud Run SSR/Build
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;

// CRITICAL FIX: Only initialize Firebase in the browser
// During build/SSR, we create a mock app to prevent crashes
if (typeof window !== 'undefined') {
  // Browser environment - initialize real Firebase
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized in browser');
    } catch (e) {
      console.error("Client Firebase Init failed:", e);
      app = null;
    }
  } else {
    app = getApps()[0];
  }
} else {
  // Server/Build environment - use mock to prevent crashes
  console.log('⚠️ Server environment detected - using Firebase mock');
  app = null;
}

// Export clients with null checks
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export default app;