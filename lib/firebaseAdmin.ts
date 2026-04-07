/**
 * Firebase Admin SDK — Server-Side Only
 * 
 * Used for:
 * - Verifying Firebase ID tokens in API routes
 * - Setting custom claims (admin role)
 * - Server-side user management
 * 
 * NOTE: This module CANNOT be used in Next.js Edge middleware.
 * For middleware token verification, use `jose` with Google JWKS.
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

export function getAdminApp(): App {
    if (adminApp) return adminApp;

    if (getApps().length > 0) {
        adminApp = getApps()[0];
        return adminApp;
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountJson) {
        throw new Error(
            'FIREBASE_SERVICE_ACCOUNT_KEY env var is missing. ' +
            'Download from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key'
        );
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        adminApp = initializeApp({
            credential: cert(serviceAccount),
        });
        return adminApp;
    } catch (e) {
        throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ' + (e as Error).message);
    }
}

export function getAdminAuth(): Auth {
    if (adminAuth) return adminAuth;
    adminAuth = getAuth(getAdminApp());
    return adminAuth;
}

export function getAdminFirestore() {
    return getFirestore(getAdminApp());
}

export function getAdminMessaging() {
    return getMessaging(getAdminApp());
}

/**
 * Verify a Firebase ID token and return decoded claims.
 * For use in API routes / server components only (NOT Edge middleware).
 */
export async function verifyIdToken(token: string) {
    const auth = getAdminAuth();
    return auth.verifyIdToken(token);
}
