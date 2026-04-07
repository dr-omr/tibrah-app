// React hooks for Firestore cloud sync and Native storage
import { useState, useEffect, useCallback } from 'react';
import firestoreService, {
    CloudEmotionalDisease,
    CloudProduct,
    CloudService,
    CloudSettings,
    isFirestoreAvailable
} from './firestore';
import { emotionalDiseases, preloadEmotionalData } from '@/data/emotionalMedicineData';

// ═══════════════════════════════════════════════════════════════
// CLOUD SYNC STATUS
// ═══════════════════════════════════════════════════════════════

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface UseSyncResult<T> {
    data: T[];
    isLoading: boolean;
    syncStatus: SyncStatus;
    error: string | null;
    refresh: () => Promise<void>;
    add: (item: Omit<T, 'id'>) => Promise<string | null>;
    update: (id: string, item: Partial<T>) => Promise<boolean>;
    remove: (id: string) => Promise<boolean>;
    syncFromLocal: () => Promise<boolean>;
}

// ═══════════════════════════════════════════════════════════════
// DISEASES HOOK
// ═══════════════════════════════════════════════════════════════

export function useCloudDiseases(): UseSyncResult<CloudEmotionalDisease> {
    const [data, setData] = useState<CloudEmotionalDisease[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    // Initial load with real-time subscription
    useEffect(() => {
        // Preload lazy data first
        preloadEmotionalData();

        if (!isFirestoreAvailable()) {
            setSyncStatus('offline');
            setIsLoading(false);
            // Use local data as fallback
            setData(emotionalDiseases as CloudEmotionalDisease[]);
            return;
        }

        setSyncStatus('syncing');
        const unsubscribe = firestoreService.diseases.subscribe((cloudData) => {
            // If cloud is empty, use local data
            if (cloudData.length === 0) {
                setData(emotionalDiseases as CloudEmotionalDisease[]);
            } else {
                setData(cloudData);
            }
            setSyncStatus('synced');
            setIsLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const refresh = useCallback(async () => {
        if (!isFirestoreAvailable()) return;
        setIsLoading(true);
        setSyncStatus('syncing');
        try {
            const cloudData = await firestoreService.diseases.getAll();
            if (cloudData.length > 0) {
                setData(cloudData);
            }
            setSyncStatus('synced');
        } catch (err) {
            setError('فشل في تحديث البيانات');
            setSyncStatus('error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const add = useCallback(async (item: Omit<CloudEmotionalDisease, 'id'>) => {
        setSyncStatus('syncing');
        const id = await firestoreService.diseases.create(item);
        if (id) {
            setSyncStatus('synced');
        } else {
            setSyncStatus('error');
        }
        return id;
    }, []);

    const update = useCallback(async (id: string, item: Partial<CloudEmotionalDisease>) => {
        setSyncStatus('syncing');
        const success = await firestoreService.diseases.update(id, item);
        setSyncStatus(success ? 'synced' : 'error');
        return success;
    }, []);

    const remove = useCallback(async (id: string) => {
        setSyncStatus('syncing');
        const success = await firestoreService.diseases.delete(id);
        setSyncStatus(success ? 'synced' : 'error');
        return success;
    }, []);

    const syncFromLocal = useCallback(async () => {
        if (!isFirestoreAvailable()) return false;
        setSyncStatus('syncing');
        setIsLoading(true);
        try {
            const success = await firestoreService.diseases.syncFromLocal(
                emotionalDiseases as CloudEmotionalDisease[]
            );
            if (success) {
                setSyncStatus('synced');
                await refresh();
            } else {
                setSyncStatus('error');
            }
            return success;
        } catch (err) {
            setError('فشل في مزامنة البيانات');
            setSyncStatus('error');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [refresh]);

    return { data, isLoading, syncStatus, error, refresh, add, update, remove, syncFromLocal };
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTS HOOK
// ═══════════════════════════════════════════════════════════════

export function useCloudProducts(): UseSyncResult<CloudProduct> {
    const [data, setData] = useState<CloudProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isFirestoreAvailable()) {
            setSyncStatus('offline');
            setIsLoading(false);
            return;
        }

        setSyncStatus('syncing');
        const unsubscribe = firestoreService.products.subscribe((cloudData) => {
            setData(cloudData);
            setSyncStatus('synced');
            setIsLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const refresh = useCallback(async () => {
        if (!isFirestoreAvailable()) return;
        setIsLoading(true);
        const cloudData = await firestoreService.products.getAll();
        setData(cloudData);
        setIsLoading(false);
    }, []);

    const add = useCallback(async (item: Omit<CloudProduct, 'id'>) => {
        return await firestoreService.products.create(item);
    }, []);

    const update = useCallback(async (id: string, item: Partial<CloudProduct>) => {
        return await firestoreService.products.update(id, item);
    }, []);

    const remove = useCallback(async (id: string) => {
        return await firestoreService.products.delete(id);
    }, []);

    const syncFromLocal = useCallback(async () => false, []);

    return { data, isLoading, syncStatus, error, refresh, add, update, remove, syncFromLocal };
}

// ═══════════════════════════════════════════════════════════════
// SERVICES HOOK
// ═══════════════════════════════════════════════════════════════

export function useCloudServices(): UseSyncResult<CloudService> {
    const [data, setData] = useState<CloudService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isFirestoreAvailable()) {
            setSyncStatus('offline');
            setIsLoading(false);
            return;
        }

        setSyncStatus('syncing');
        const unsubscribe = firestoreService.services.subscribe((cloudData) => {
            setData(cloudData);
            setSyncStatus('synced');
            setIsLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const refresh = useCallback(async () => {
        if (!isFirestoreAvailable()) return;
        setIsLoading(true);
        const cloudData = await firestoreService.services.getAll();
        setData(cloudData);
        setIsLoading(false);
    }, []);

    const add = useCallback(async (item: Omit<CloudService, 'id'>) => {
        return await firestoreService.services.create(item);
    }, []);

    const update = useCallback(async (id: string, item: Partial<CloudService>) => {
        return await firestoreService.services.update(id, item);
    }, []);

    const remove = useCallback(async (id: string) => {
        return await firestoreService.services.delete(id);
    }, []);

    const syncFromLocal = useCallback(async () => false, []);

    return { data, isLoading, syncStatus, error, refresh, add, update, remove, syncFromLocal };
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS HOOK
// ═══════════════════════════════════════════════════════════════

export interface UseSettingsResult {
    settings: CloudSettings | null;
    isLoading: boolean;
    syncStatus: SyncStatus;
    updateSettings: (data: Partial<CloudSettings>) => Promise<boolean>;
}

export function useCloudSettings(): UseSettingsResult {
    const [settings, setSettings] = useState<CloudSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

    useEffect(() => {
        if (!isFirestoreAvailable()) {
            setSyncStatus('offline');
            setIsLoading(false);
            return;
        }

        setSyncStatus('syncing');
        const unsubscribe = firestoreService.settings.subscribe((data) => {
            setSettings(data);
            setSyncStatus('synced');
            setIsLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const updateSettings = useCallback(async (data: Partial<CloudSettings>) => {
        setSyncStatus('syncing');
        const success = await firestoreService.settings.update(data);
        setSyncStatus(success ? 'synced' : 'error');
        return success;
    }, []);

    return { settings, isLoading, syncStatus, updateSettings };
}

// ═══════════════════════════════════════════════════════════════
// GENERAL CLOUD SYNC HOOK
// ═══════════════════════════════════════════════════════════════

export interface UseCloudSyncResult {
    status: SyncStatus;
    isOnline: boolean;
}

export function useCloudSync(): UseCloudSyncResult {
    const [status, setStatus] = useState<SyncStatus>(() =>
        isFirestoreAvailable() ? 'idle' : 'offline'
    );
    const [isOnline, setIsOnline] = useState<boolean>(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setStatus(isFirestoreAvailable() ? 'synced' : 'idle');
        };
        const handleOffline = () => {
            setIsOnline(false);
            setStatus('offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        if (!isFirestoreAvailable()) {
            setStatus('offline');
        } else {
            // Simulate a brief syncing state on mount
            setStatus('syncing');
            const timer = setTimeout(() => setStatus('synced'), 1500);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { status, isOnline };
}

// ═══════════════════════════════════════════════════════════════
// NATIVE OFFLINE STORAGE HOOK (Capacitor Preferences)
// ═══════════════════════════════════════════════════════════════

export async function setNativeItem(key: string, value: any): Promise<void> {
    const isCapacitor = typeof window !== 'undefined' && 'Capacitor' in window;
    try {
        const stringValue = JSON.stringify(value);
        if (isCapacitor) {
            const { Preferences } = await import('@capacitor/preferences');
            await Preferences.set({ key, value: stringValue });
        } else {
            localStorage.setItem(key, stringValue);
        }
    } catch (e) {
        console.error('Failed to set native offline item:', e);
    }
}

export async function getNativeItem(key: string): Promise<any | null> {
    const isCapacitor = typeof window !== 'undefined' && 'Capacitor' in window;
    try {
        if (isCapacitor) {
            const { Preferences } = await import('@capacitor/preferences');
            const { value } = await Preferences.get({ key });
            return value ? JSON.parse(value) : null;
        } else {
            const val = localStorage.getItem(key);
            return val ? JSON.parse(val) : null;
        }
    } catch (e) {
        console.error('Failed to get native offline item:', e);
        return null;
    }
}

export async function removeNativeItem(key: string): Promise<void> {
    const isCapacitor = typeof window !== 'undefined' && 'Capacitor' in window;
    try {
        if (isCapacitor) {
            const { Preferences } = await import('@capacitor/preferences');
            await Preferences.remove({ key });
        } else {
            localStorage.removeItem(key);
        }
    } catch (e) {
        console.error('Failed to remove native offline item:', e);
    }
}


// ═══════════════════════════════════════════════════════════════
// SYNC INDICATOR COMPONENT
// ═══════════════════════════════════════════════════════════════

export function getSyncStatusDisplay(status: SyncStatus): {
    text: string;
    color: string;
    icon: string;
} {
    switch (status) {
        case 'syncing':
            return { text: 'جاري المزامنة...', color: 'text-blue-500', icon: '🔄' };
        case 'synced':
            return { text: 'تم الحفظ ☁️', color: 'text-green-500', icon: '✅' };
        case 'error':
            return { text: 'خطأ في المزامنة', color: 'text-red-500', icon: '❌' };
        case 'offline':
            return { text: 'وضع غير متصل', color: 'text-amber-500', icon: '📴' };
        default:
            return { text: '', color: 'text-slate-400', icon: '' };
    }
}
