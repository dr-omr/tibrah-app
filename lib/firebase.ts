import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only once (singleton pattern for hot-reload safety)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Debug: Log environment variable status (NOT the actual values for security)
console.log("🔥 Firebase Config Debug:", {
    apiKeyLoaded: !!firebaseConfig.apiKey,
    authDomainLoaded: !!firebaseConfig.authDomain,
    projectIdLoaded: !!firebaseConfig.projectId,
    storageBucketLoaded: !!firebaseConfig.storageBucket,
    appIdLoaded: !!firebaseConfig.appId,
    projectId: firebaseConfig.projectId, // Safe to log project ID
    authDomain: firebaseConfig.authDomain, // Safe to log auth domain
});

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Add additional scopes for Google provider
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Firestore Database
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app);

// Analytics (only in browser)
export const initAnalytics = async () => {
    if (typeof window !== 'undefined') {
        const supported = await isSupported();
        if (supported) {
            return getAnalytics(app);
        }
    }
    return null;
};

export default app;
