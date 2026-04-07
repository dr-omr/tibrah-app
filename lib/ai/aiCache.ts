import localForage from 'localforage';

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    version: string;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_VERSION = "v1";

// Initialize the store
const aiStore = localForage.createInstance({
    name: 'Tibrah_AI',
    storeName: 'ai_responses'
});

export async function getCachedAiResponse<T>(cacheKey: string): Promise<T | null> {
    try {
        const entry = await aiStore.getItem<CacheEntry<T>>(cacheKey);
        
        if (!entry) return null;
        
        // Invalidate if version mismatch or TTL expired
        if (entry.version !== CACHE_VERSION || (Date.now() - entry.timestamp > CACHE_TTL_MS)) {
            await aiStore.removeItem(cacheKey);
            return null;
        }

        return entry.data;
    } catch (e) {
        console.warn('AI Cache read failed:', e);
        return null;
    }
}

export async function setCachedAiResponse<T>(cacheKey: string, data: T): Promise<void> {
    try {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            version: CACHE_VERSION
        };
        await aiStore.setItem(cacheKey, entry);
    } catch (e) {
        console.warn('AI Cache write failed:', e);
    }
}

/**
 * Wraps an AI function call with the caching layer.
 * @param cacheKey Unique string representing the prompt/context
 * @param fetcher The function that calls the actual AI provider
 * @param forceRefresh Ignore cache if true
 */
export async function withAiCache<T>(
    cacheKey: string, 
    fetcher: () => Promise<T>, 
    forceRefresh = false
): Promise<T> {
    if (!forceRefresh) {
        const cached = await getCachedAiResponse<T>(cacheKey);
        if (cached) {
            console.log(`[AI Cache Hit] ${cacheKey}`);
            return cached;
        }
    }

    console.log(`[AI Cache Miss] ${cacheKey} - Fetching from provider...`);
    const data = await fetcher();
    
    // Non-blocking write
    setCachedAiResponse(cacheKey, data).catch(() => {});
    
    return data;
}
