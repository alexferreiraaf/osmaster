'use client';
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { firebaseConfig } from "./config";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Validate firebase config to provide a better developer experience
if (!firebaseConfig.apiKey) {
    throw new Error('Firebase configuration is missing or incomplete. Make sure all NEXT_PUBLIC_FIREBASE_ variables are set in your .env file.');
}

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };
