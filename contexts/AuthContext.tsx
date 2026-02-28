/**
 * Unified Authentication Context
 * Supports both Local Auth and Firebase Auth
 * Automatically falls back to Local Auth if Firebase is not configured
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { localAuth, LocalUser } from '../lib/localAuth';

// Try to import Firebase (may fail if not configured)
let firebaseAuth: typeof import('firebase/auth') | null = null;
let auth: import('firebase/auth').Auth | null = null;
let googleProvider: import('firebase/auth').GoogleAuthProvider | null = null;

try {
    // Dynamic import to prevent build errors if Firebase is not configured
    const firebase = require('../lib/firebase');
    auth = firebase.auth;
    googleProvider = firebase.googleProvider;
    firebaseAuth = require('firebase/auth');
} catch (e) {
    console.log('🔄 Firebase not configured, using Local Auth only');
}

// Configurable admin emails (from env or default)
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'dr.omar@tibrah.com')
    .split(',')
    .map(e => e.trim().toLowerCase());

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
}

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    authProvider: 'local' | 'firebase' | 'none';

    // Auth methods
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
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

    // Sync auth cookie for middleware route protection
    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (user) {
            const cookieData = JSON.stringify({ email: user.email, role: user.role });
            document.cookie = `tibrah_auth=${encodeURIComponent(cookieData)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        } else if (!loading) {
            // Clear cookie on logout (only after initial load)
            document.cookie = 'tibrah_auth=; path=/; max-age=0';
        }
    }, [user, loading]);

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

    // Convert LocalUser to UserProfile
    const localUserToProfile = (localUser: LocalUser): UserProfile => ({
        id: localUser.id,
        email: localUser.email,
        name: localUser.name,
        displayName: localUser.displayName,
        photoURL: localUser.photoURL,
        phone: localUser.phone,
        role: localUser.role,
        createdAt: localUser.createdAt,
        lastLoginAt: localUser.lastLoginAt,
        isVerified: localUser.isVerified,
        authProvider: 'local',
    });

    // Convert Firebase User to UserProfile
    const firebaseUserToProfile = (firebaseUser: import('firebase/auth').User): UserProfile => ({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'مستخدم',
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        role: ADMIN_EMAILS.includes((firebaseUser.email || '').toLowerCase()) ? 'admin' : 'user',
        authProvider: 'firebase',
    });

    // Initialize auth listener
    useEffect(() => {
        let unsubscribeLocal: (() => void) | null = null;
        let unsubscribeFirebase: (() => void) | null = null;

        const setupAuth = async () => {
            // Try Firebase first if configured
            if (isFirebaseConfigured() && auth && firebaseAuth) {
                console.log('🔥 Using Firebase Auth');
                setAuthProvider('firebase');

                unsubscribeFirebase = firebaseAuth.onAuthStateChanged(auth, (firebaseUser) => {
                    if (firebaseUser) {
                        setUser(firebaseUserToProfile(firebaseUser));
                    } else {
                        setUser(null);
                    }
                    setLoading(false);
                });
            } else {
                // Use Local Auth
                console.log('💾 Using Local Auth');
                setAuthProvider('local');

                unsubscribeLocal = localAuth.onAuthStateChanged((localUser) => {
                    if (localUser) {
                        setUser(localUserToProfile(localUser));
                    } else {
                        setUser(null);
                    }
                    setLoading(false);
                });
            }
        };

        setupAuth();

        return () => {
            if (unsubscribeLocal) unsubscribeLocal();
            if (unsubscribeFirebase) unsubscribeFirebase();
        };
    }, []);

    // ============================================
    // Auth Methods
    // ============================================

    const signUp = async (email: string, password: string, name: string): Promise<void> => {
        setLoading(true);
        try {
            if (authProvider === 'firebase' && auth && firebaseAuth) {
                // Firebase signup
                const credential = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
                if (credential.user) {
                    await firebaseAuth.updateProfile(credential.user, { displayName: name });
                }
            } else {
                // Local signup
                await localAuth.signUp(email, password, name);
            }
        } finally {
            setLoading(false);
        }
    };

    const signInWithEmail = async (email: string, password: string): Promise<void> => {
        setLoading(true);
        try {
            if (authProvider === 'firebase' && auth && firebaseAuth) {
                // Firebase signin
                await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
            } else {
                // Local signin
                await localAuth.signInWithEmail(email, password);
            }
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async (): Promise<void> => {
        setLoading(true);
        try {
            if (authProvider === 'firebase' && auth && firebaseAuth && googleProvider) {
                // Firebase Google signin
                await firebaseAuth.signInWithPopup(auth, googleProvider);
            } else {
                // Local Google signin (simulation)
                await localAuth.signInWithGoogle();
            }
        } finally {
            setLoading(false);
        }
    };

    const signOut = async (): Promise<void> => {
        setLoading(true);
        try {
            if (authProvider === 'firebase' && auth && firebaseAuth) {
                await firebaseAuth.signOut(auth);
            } else {
                await localAuth.signOut();
            }
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // Profile Methods
    // ============================================

    const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
        if (!user) throw new Error('يجب تسجيل الدخول أولاً');

        if (authProvider === 'firebase' && auth && firebaseAuth && auth.currentUser) {
            await firebaseAuth.updateProfile(auth.currentUser, {
                displayName: updates.displayName || updates.name,
                photoURL: updates.photoURL,
            });
            // Refresh user state
            setUser(prev => prev ? { ...prev, ...updates } : null);
        } else {
            const updatedUser = await localAuth.updateProfile(updates);
            setUser(localUserToProfile(updatedUser));
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
        if (!user) throw new Error('يجب تسجيل الدخول أولاً');

        if (authProvider === 'firebase') {
            throw new Error('تغيير كلمة المرور غير متاح حالياً لحسابات Firebase');
        } else {
            await localAuth.changePassword(currentPassword, newPassword);
        }
    };

    const deleteAccount = async (): Promise<void> => {
        if (!user) throw new Error('يجب تسجيل الدخول أولاً');

        if (authProvider === 'firebase' && auth && auth.currentUser) {
            await auth.currentUser.delete();
        } else {
            await localAuth.deleteAccount();
        }
    };

    // ============================================
    // Context Value
    // ============================================

    const value: AuthContextType = {
        user,
        loading,
        authProvider,

        signUp,
        signInWithEmail,
        signInWithGoogle,
        signOut,

        updateProfile,
        changePassword,
        deleteAccount,

        isAdmin: user?.role === 'admin' || ADMIN_EMAILS.includes((user?.email || '').toLowerCase()),
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
