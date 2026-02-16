import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyB3fBQnH-LpJKi3nmSAtIxuYhH7rz4IwlA",
  authDomain: "rohis-app.firebaseapp.com",
  projectId: "rohis-app",
  storageBucket: "rohis-app.appspot.com",
  appId: "1:1099339631960:web:825e61739138470e2ba92d",
};

// Lazy singleton caches
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  }
  return _app;
}

/**
 * Lazy-loaded Auth — firebase/auth JS only loaded when first called.
 * Reduces initial bundle by ~150KB.
 */
export async function getFirebaseAuth(): Promise<Auth> {
  if (!_auth) {
    const { getAuth } = await import("firebase/auth");
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

/**
 * Lazy-loaded Firestore — firebase/firestore JS only loaded when first called.
 * Reduces initial bundle by ~250KB.
 */
export async function getFirebaseDb(): Promise<Firestore> {
  if (!_db) {
    const { getFirestore } = await import("firebase/firestore");
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

// Lazy-loaded storage getter — only imported when needed (announcements upload)
export const getFirebaseStorage = async () => {
  const { getStorage } = await import("firebase/storage");
  return getStorage(getFirebaseApp());
};
