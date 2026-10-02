import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const MISSING = 'MISSING_ENV_VAR';

const firebaseConfig = {
  // Fall back to a placeholder so module import never throws during
  // `next build` without env vars. Real Firebase calls then fail soft
  // via the try/catch in the data helpers until proper config is provided.
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || MISSING,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || MISSING,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || MISSING,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || MISSING,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || MISSING,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || MISSING,
};

// Don't crash the build when env vars are missing (e.g. local `next build`
// without .env.local). Firestore helpers already fail soft at runtime, so
// warn once here and let those code paths handle the unreachable backend.
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.warn(
    'Warning: NEXT_PUBLIC_FIREBASE_API_KEY is not set. Firebase features will fail soft until it is configured.'
  );
}

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

export { app, auth, db, storage };
export default app;