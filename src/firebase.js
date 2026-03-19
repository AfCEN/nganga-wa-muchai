import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let db = null;
let storage = null;
let auth = null;

const isConfigured = Object.values(firebaseConfig).every(
  (val) => val !== undefined && val !== ""
);

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    app = null;
    db = null;
    storage = null;
    auth = null;
  }
} else {
  console.log(
    "Running in local mode — Firebase environment variables are not set. " +
      "Data will be stored in localStorage. To enable Firebase, add VITE_FIREBASE_* " +
      "variables to your .env file."
  );
}

export { app, db, storage, auth };
export const isFirebaseAvailable = Boolean(app);
