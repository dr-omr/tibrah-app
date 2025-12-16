'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber?: string;
    createdAt?: string;
    role?: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            if (user) {
                // Create profile from user data (works offline too)
                const profileFromUser: UserProfile = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    createdAt: new Date().toISOString(),
                    role: 'user'
                };

                // Try to get/save profile in Firestore (optional - works without it)
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        setUserProfile(userSnap.data() as UserProfile);
                    } else {
                        // Create new user profile
                        await setDoc(userRef, profileFromUser);
                        setUserProfile(profileFromUser);
                    }
                } catch (firestoreError) {
                    console.warn('⚠️ Firestore not available, using local profile:', firestoreError);
                    // Use profile from Firebase Auth (works without Firestore)
                    setUserProfile(profileFromUser);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            console.log('🔐 Attempting Google Sign-in...');
            console.log('📧 Auth Domain:', auth.app.options.authDomain);
            const result = await signInWithPopup(auth, googleProvider);
            console.log('✅ Google Sign-in successful:', result.user.email);
        } catch (error: unknown) {
            const firebaseError = error as { code?: string; message?: string };
            console.error('❌ Google Sign-in Error Details:', {
                code: firebaseError.code,
                message: firebaseError.message,
                fullError: error
            });

            // Provide helpful messages based on error code
            if (firebaseError.code === 'auth/configuration-not-found') {
                console.error('💡 FIX: Enable Google Sign-in in Firebase Console → Authentication → Sign-in method → Google');
            } else if (firebaseError.code === 'auth/unauthorized-domain') {
                console.error('💡 FIX: Add localhost to Authorized Domains in Firebase Console → Authentication → Settings');
            } else if (firebaseError.code === 'auth/popup-blocked') {
                console.error('💡 FIX: Allow popups for this site in your browser');
            } else if (firebaseError.code === 'auth/operation-not-allowed') {
                console.error('💡 FIX: Google Sign-in is not enabled. Go to Firebase Console → Authentication → Sign-in method → Enable Google');
            }

            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Sign in with email/password
    const signInWithEmail = async (email: string, password: string) => {
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Email sign in error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Sign up with email/password
    const signUpWithEmail = async (email: string, password: string, name: string) => {
        try {
            setLoading(true);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName: name });
        } catch (error) {
            console.error('Email sign up error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    const isAdmin = userProfile?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user,
            userProfile,
            loading,
            signInWithGoogle,
            signInWithEmail,
            signUpWithEmail,
            signOut,
            isAdmin
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
