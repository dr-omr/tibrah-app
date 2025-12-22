// React hooks for Firestore cloud sync
import { useState, useEffect, useCallback } from 'react';
import firestoreService, {
    CloudEmotionalDisease,
    CloudProduct,
    CloudService,
    CloudSettings,
    isFirestoreAvailable
} from './firestore';
import { emotionalDiseases } from '@/data/emotionalMedicineData';

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
