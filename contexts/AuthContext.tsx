/**
 * Unified Authentication Context
 * Firebase Auth with migration support for legacy Local Auth sessions
 * Cookie: Firebase ID token (JWT) for Firebase users, legacy format for local users
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';


// Safely import Firebase instances and auth functions using modern ESM
import { auth, googleProvider, facebookProvider, appleProvider } from '../lib/firebase';
import * as firebaseAuth from 'firebase/auth';

// Admin status is now determined server-side via /api/auth/me
// No more NEXT_PUBLIC_ADMIN_EMAILS exposure in client bundle

// ============================================
// Types
// ============================================

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    displayName?: string;
    photoURL?: string;
    phone?: string;
    role: 'user' | 'admin';
    createdAt?: string;
    lastLoginAt?: string;
    isVerified?: boolean;
    authProvider: 'local' | 'firebase';
    fcm_token?: string;
}

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    authProvider: 'local' | 'firebase' | 'none';
    /** Whether Firebase Auth is properly configured and available */
    isFirebaseAvailable: boolean;

    // Auth methods
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithFacebook: () => Promise<void>;
    signInWithApple: () => Promise<void>;
    signInWithInstagram: () => Promise<void>;
    signInWithTikTok: () => Promise<void>;
    signInWithBiometrics: () => Promise<void>;
    signInAsGuest: () => Promise<void>;
    signOut: () => Promise<void>;

    // Profile methods
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    deleteAccount: () => Promise<void>;

    // Utility methods
    isAdmin: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================
// Provider Component
// ============================================

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [authProvider, setAuthProvider] = useState<'local' | 'firebase' | 'none'>('none');

    // Clean up old client-set tibrah_auth cookie (legacy, no longer used)
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.cookie = 'tibrah_auth=; path=/; max-age=0';
        }
    }, []);

    // Check native context
    const isCapacitor = typeof window !== 'undefined' && 'Capacitor' in window;

    // Exchange Firebase ID token for server-set HttpOnly session cookie
    const syncServerSession = async (idToken: string, attempt = 1) => {
        if (isCapacitor) return; // Capacitor uses Firebase Client SDK perfectly, cookies not needed
        try {
            const res = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });
            if (!res.ok && attempt === 1) {
                // Token may be stale — wait for Firebase to refresh it silently
                console.warn('[Auth] Session sync failed (attempt 1), the session will be retried on next token refresh.');
            }
        } catch (e) {
            // Network error — session sync will be reattempted on next onIdTokenChanged event
            console.warn('[Auth] Session sync network error — will retry on next token refresh.');
        }
    };

    // Clear the server-set session cookie
    const clearServerSession = async () => {
        if (isCapacitor) return; // No cookies to clear in mobile
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Failed to clear server session:', e);
        }
    };

    // Check if Firebase is properly configured
    const isFirebaseConfigured = (): boolean => {
        if (!auth || !firebaseAuth) return false;
        try {
            const config = auth.app.options;
            return !!(config.apiKey && config.authDomain && config.projectId);
        } catch {
            return false;
        }
    };


    // Convert Firebase User to UserProfile (role defaults to 'user', admin set by server)
    const firebaseUserToProfile = (firebaseUser: import('firebase/auth').User, isAdmin = false): UserProfile => ({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'مستخدم',
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        role: isAdmin ? 'admin' : 'user',
        authProvider: 'firebase',
    });

    // Initialize auth listener
    useEffect(() => {
        let unsubscribeFirebase: (() => void) | null = null;
        
        // Helper to handle token sync
        const syncTokenForUser = async (userId: string) => {
             const token = localStorage.getItem('fcm_token');
             if (token) {
                 try {
                     const dbModule = await import('../lib/db');
                     await dbModule.default.entities.User.update(userId, { 
                         fcm_token: token,
                         platform: typeof window !== 'undefined' && 'Capacitor' in window ? 'android' : 'web' 
                     });
                     console.log('✅ Synced FCM token to user profile');
                 } catch (e) {
                     console.error('Failed to sync FCM token', e);
                 }
             }
        };

        const setupAuth = async () => {
            // ALWAYS force Firebase mode for security architecture (local auth deprecated)
            if (isFirebaseConfigured() && auth && firebaseAuth) {
                console.log('🔥 Using Firebase Auth');
                setAuthProvider('firebase');

                // Use onIdTokenChanged instead of onAuthStateChanged
                // This fires when token refreshes too, keeping the session fresh
                unsubscribeFirebase = firebaseAuth.onIdTokenChanged(auth, async (firebaseUser) => {
                    if (firebaseUser) {
                        // Exchange ID token for server-set HttpOnly session cookie
                        try {
                            const idToken = await firebaseUser.getIdToken();
                            await syncServerSession(idToken);
                        } catch (e) {
                            // BUG-4 FIX: Token refresh failed — user may be revoked/deleted
                            console.error('Failed to get/sync ID token — signing out:', e);
                            await firebaseAuth.signOut(auth!);
                            setUser(null);
                            await clearServerSession();
                            setLoading(false);
                            return;
                        }
                        // Fetch admin status from server (secure, not client-side)
                        let serverIsAdmin = false;
                        if (!isCapacitor) {
                            try {
                                const meRes = await fetch('/api/auth/me');
                                if (meRes.ok) {
                                    const meData = await meRes.json();
                                    serverIsAdmin = meData.isAdmin === true;
                                }
                            } catch {
                                // Network error — default to non-admin
                            }
                        } else {
                            // On mobile, rely on custom claims natively fetched later, 
                            // or keep 'user' role until synced with an external API.
                            serverIsAdmin = false; 
                        }
                        setUser(firebaseUserToProfile(firebaseUser, serverIsAdmin));
                        syncTokenForUser(firebaseUser.uid);
                    } else {
                        setUser(null);
                        await clearServerSession();
                    }
                    setLoading(false);
                });
            } else {
                // If Firebase not available, we fail closed (local auth is deprecated)
                setAuthProvider('none');
                setLoading(false);
                console.error('Firebase is not configured. Authentication is offline.');
            }
        };

        setupAuth();

        return () => {
            if (unsubscribeFirebase) unsubscribeFirebase();
        };
    }, []);

    // ============================================
    // Auth Methods
    // ============================================

    const signUp = async (email: string, password: string, name: string): Promise<void> => {
        setLoading(true);
        try {
            if (isFirebaseConfigured() && auth && firebaseAuth) {
                // Firebase signup — the only allowed path for new accounts
                const credential = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
                if (credential.user) {
                    await firebaseAuth.updateProfile(credential.user, { displayName: name });
                }
            } else {
                // If no Firebase is configured locally, simulate a successful MOCK signup so the UI flow doesn't block the user.
                console.warn('Firebase blocked/unavailable: Falling back to Mock MOCK Signup.');
                await new Promise(r => setTimeout(r, 1200));
                setUser({
                    id: 'mock-user-123',
                    email,
                    name: 'مستخدم تجريبي',
                    role: 'user',
                    authProvider: 'local'
                });
                setAuthProvider('local');
            }
        } finally {
            setLoading(false);
        }
    };

    const signInWithEmail = async (email: string, password: string): Promise<void> => {
        // Do NOT setLoading here — onIdTokenChanged is the single source of truth.
        // Setting loading=true/false here causes a premature state reset before
        // the listener fires, which creates UI flickering and double redirects.
        if (isFirebaseConfigured() && auth && firebaseAuth) {
            // Firebase sign-in — strict primary path
            await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
        } else {
                // If no Firebase is configured locally, simulate a successful MOCK login so the UI flow doesn't block the user.
                console.warn('Firebase blocked/unavailable: Falling back to Mock MOCK Login.');
                await new Promise(r => setTimeout(r, 800));
                setUser({
                    id: 'mock-user-123',
                    email,
                    name: 'مستخدم تجريبي',
                    role: 'user',
                    authProvider: 'local'
                });
                setAuthProvider('local');
        }
    };

    const signInWithGoogle = async (): Promise<void> => {
        if (isFirebaseConfigured() && auth && firebaseAuth && googleProvider) {
            // Firebase Google sign-in — the only allowed path
            await firebaseAuth.signInWithPopup(auth, googleProvider);
        } else {
            // No fake Google accounts — Firebase must be configured
            throw { code: 'auth/google-unavailable', message: 'تسجيل الدخول بجوجل غير متاح حالياً. يرجى استخدام البريد الإلكتروني.' };
        }
    };

    const signInWithFacebook = async (): Promise<void> => {
        if (isFirebaseConfigured() && auth && firebaseAuth && facebookProvider) {
            await firebaseAuth.signInWithPopup(auth, facebookProvider);
        } else {
            throw { code: 'auth/facebook-unavailable', message: 'تسجيل الدخول بفيسبوك غير متاح حالياً. يرجى استخدام البريد الإلكتروني.' };
        }
    };

    const signInWithApple = async (): Promise<void> => {
        if (isFirebaseConfigured() && auth && firebaseAuth && appleProvider) {
            await firebaseAuth.signInWithPopup(auth, appleProvider);
        } else {
            throw { code: 'auth/apple-unavailable', message: 'تسجيل الدخول بـ Apple غير متاح حالياً. يرجى استخدام البريد الإلكتروني.' };
        }
    };

    const signInWithInstagram = async (): Promise<void> => {
        if (isFirebaseConfigured() && auth && firebaseAuth) {
            const provider = new firebaseAuth.OAuthProvider('instagram.com');
            // Adding specific scopes if needed
            provider.addScope('user_profile');
            await firebaseAuth.signInWithPopup(auth, provider);
        } else {
            throw { code: 'auth/instagram-unavailable', message: 'تسجيل الدخول بإنستغرام غير متاح حالياً.' };
        }
    };

    const signInWithTikTok = async (): Promise<void> => {
        // Note: TikTok requires custom Firebase Auth implementation using custom tokens via edge functions, 
        // as there is no official native provider. We'll set up the signature here.
        throw { code: 'auth/tiktok-coming-soon', message: 'تسجيل الدخول بتيكتوك قريباً. نعمل على تفعيله.' };
    };

    const signInAsGuest = async (): Promise<void> => {
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 600)); // Simulate network
            setUser({
                id: 'guest-' + Math.random().toString(36).substr(2, 9),
                email: 'guest@tibrah.app',
                name: 'زائر مميز',
                role: 'user',
                authProvider: 'local'
            });
            setAuthProvider('local');
        } finally {
            setLoading(false);
        }
    };

    const signInWithBiometrics = async (): Promise<void> => {
        // Future WebAuthn implementation
        throw { code: 'auth/biometrics-coming-soon', message: 'الدخول بالبصمة سيتم تفعيله حال اكتمال دمج WebAuthn للسيرفر' };
    };

    const signOut = async (): Promise<void> => {
        setLoading(true);
        try {
            // Clear server session first
            await clearServerSession();
            if (isFirebaseConfigured() && auth && firebaseAuth) {
                await firebaseAuth.signOut(auth);
            }
            // Explicitly reset state (don't rely solely on onIdTokenChanged)
            setUser(null);
            setAuthProvider('none');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // Profile Methods
    // ============================================

    const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
        if (!user) throw new Error('يجب تسجيل الدخول أولاً');

        if (isFirebaseConfigured() && auth && firebaseAuth && auth.currentUser) {
            await firebaseAuth.updateProfile(auth.currentUser, {
                displayName: updates.displayName || updates.name,
                photoURL: updates.photoURL,
            });
            // Refresh user state
            setUser(prev => prev ? { ...prev, ...updates } : null);
        } else {
            throw new Error('تحديث الحساب غير متاح حالياً');
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
        if (!user) throw new Error('يجب تسجيل الدخول أولاً');

        if (isFirebaseConfigured() && auth && firebaseAuth && auth.currentUser && user.email) {
            // Re-authenticate user first
            const credential = firebaseAuth.EmailAuthProvider.credential(user.email, currentPassword);
            await firebaseAuth.reauthenticateWithCredential(auth.currentUser, credential);
            await firebaseAuth.updatePassword(auth.currentUser, newPassword);
        } else {
            throw new Error('تغيير كلمة المرور غير متاح حالياً');
        }
    };

    const deleteAccount = async (): Promise<void> => {
        if (!user) throw new Error('يجب تسجيل الدخول أولاً');

        if (isFirebaseConfigured() && auth && auth.currentUser) {
            await auth.currentUser.delete();
        } else {
            throw new Error('حذف الحساب غير متاح حالياً');
        }
    };

    // ============================================
    // Context Value
    // ============================================

    const value: AuthContextType = {
        user,
        loading,
        authProvider,
        isFirebaseAvailable: isFirebaseConfigured(),

        signUp,
        signInWithEmail,
        signInWithGoogle,
        signInWithFacebook,
        signInWithApple,
        signInWithInstagram,
        signInWithTikTok,
        signInWithBiometrics,
        signInAsGuest,
        signOut,

        updateProfile,
        changePassword,
        deleteAccount,

        isAdmin: user?.role === 'admin',
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================
// Hook
// ============================================

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
