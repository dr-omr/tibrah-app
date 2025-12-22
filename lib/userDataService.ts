/**
 * User Data Service
 * Stores and retrieves user-specific data in Firestore
 * Falls back to localStorage for guests
 */

import { db as firestoreDb } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

// Storage key prefix for localStorage fallback
const LOCAL_PREFIX = 'tibrah_user_';

/**
 * Check if Firestore is available
 */
const isFirestoreReady = (): boolean => {
    return !!firestoreDb;
};

/**
 * Get user-specific data from Firestore or localStorage
 * @param userId - User ID (null for guests)
 * @param key - Data key (e.g., 'waterGoal', 'weightProfile')
 * @param defaultValue - Default value if not found
 */
export async function getUserData<T>(
    userId: string | null,
    key: string,
    defaultValue: T
): Promise<T> {
    // If logged in and Firestore available, use Firestore
    if (userId && isFirestoreReady() && firestoreDb) {
        try {
            const docRef = doc(firestoreDb, 'users', userId, 'data', key);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data().value as T;
            }
        } catch (error) {
            console.warn(`[UserData] Firestore read failed for ${key}:`, error);
        }
    }

    // Fallback to localStorage (for guests or if Firestore fails)
    if (typeof window !== 'undefined') {
        try {
            const storageKey = userId ? `${LOCAL_PREFIX}${userId}_${key}` : `${LOCAL_PREFIX}guest_${key}`;
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                return JSON.parse(saved) as T;
            }
        } catch {
            // Ignore parse errors
        }
    }

    return defaultValue;
}

/**
 * Save user-specific data to Firestore and localStorage
 * @param userId - User ID (null for guests)
 * @param key - Data key
 * @param value - Data value
 */
export async function setUserData<T>(
    userId: string | null,
    key: string,
    value: T
): Promise<void> {
    const timestamp = new Date().toISOString();

    // If logged in and Firestore available, save to Firestore
    if (userId && isFirestoreReady() && firestoreDb) {
        try {
            const docRef = doc(firestoreDb, 'users', userId, 'data', key);
            await setDoc(docRef, {
                value,
                updatedAt: timestamp,
                key
            });
        } catch (error) {
            console.error(`[UserData] Firestore write failed for ${key}:`, error);
        }
    }

    // Always save to localStorage as backup/offline support
    if (typeof window !== 'undefined') {
        try {
            const storageKey = userId ? `${LOCAL_PREFIX}${userId}_${key}` : `${LOCAL_PREFIX}guest_${key}`;
            localStorage.setItem(storageKey, JSON.stringify(value));
        } catch {
            // Ignore storage errors
        }
    }
}

/**
 * Delete user-specific data
 */
export async function deleteUserData(
    userId: string | null,
    key: string
): Promise<void> {
    if (userId && isFirestoreReady() && firestoreDb) {
        try {
            const docRef = doc(firestoreDb, 'users', userId, 'data', key);
            await deleteDoc(docRef);
        } catch (error) {
            console.error(`[UserData] Firestore delete failed for ${key}:`, error);
        }
    }

    if (typeof window !== 'undefined') {
        const storageKey = userId ? `${LOCAL_PREFIX}${userId}_${key}` : `${LOCAL_PREFIX}guest_${key}`;
        localStorage.removeItem(storageKey);
    }
}

/**
 * Get all user data keys
 */
export async function getAllUserDataKeys(userId: string | null): Promise<string[]> {
    const keys: string[] = [];

    if (userId && isFirestoreReady() && firestoreDb) {
        try {
            const collectionRef = collection(firestoreDb, 'users', userId, 'data');
            const snapshot = await getDocs(collectionRef);
            snapshot.forEach(doc => keys.push(doc.id));
        } catch (error) {
            console.warn('[UserData] Failed to get keys:', error);
        }
    }

    return keys;
}

/**
 * Migrate localStorage data to Firestore when user logs in
 */
export async function migrateGuestDataToUser(userId: string): Promise<void> {
    if (typeof window === 'undefined' || !isFirestoreReady() || !firestoreDb) return;

    try {
        const guestPrefix = `${LOCAL_PREFIX}guest_`;
        const keysToMigrate: string[] = [];

        // Find all guest data keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(guestPrefix)) {
                keysToMigrate.push(key);
            }
        }

        // Migrate each key
        for (const storageKey of keysToMigrate) {
            const dataKey = storageKey.replace(guestPrefix, '');
            const value = localStorage.getItem(storageKey);

            if (value) {
                try {
                    const parsed = JSON.parse(value);
                    await setUserData(userId, dataKey, parsed);
                    localStorage.removeItem(storageKey);
                } catch {
                    // Skip invalid data
                }
            }
        }

        console.log(`[UserData] Migrated ${keysToMigrate.length} items from guest to user ${userId}`);
    } catch (error) {
        console.error('[UserData] Migration failed:', error);
    }
}

// React hook for user data
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * React hook for user-specific data
 */
export function useUserData<T>(key: string, defaultValue: T) {
    const { user } = useAuth();
    const userId = user?.id || null;

    const [data, setData] = useState<T>(defaultValue);
    const [loading, setLoading] = useState(true);

    // Load data on mount
    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            setLoading(true);
            const value = await getUserData(userId, key, defaultValue);
            if (mounted) {
                setData(value);
                setLoading(false);
            }
        };

        loadData();

        return () => { mounted = false; };
    }, [userId, key]);

    // Save function
    const saveData = useCallback(async (newValue: T) => {
        setData(newValue);
        await setUserData(userId, key, newValue);
    }, [userId, key]);

    return { data, setData: saveData, loading };
}

export default {
    get: getUserData,
    set: setUserData,
    delete: deleteUserData,
    getAllKeys: getAllUserDataKeys,
    migrateGuestData: migrateGuestDataToUser,
    useUserData
};
