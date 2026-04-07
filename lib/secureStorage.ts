/**
 * Secure Storage — Encrypted localStorage wrapper
 * Encrypts sensitive health data before storing in localStorage
 * Uses AES-GCM via Web Crypto API for strong encryption
 * 
 * Security improvements:
 * - AES key is non-extractable CryptoKey stored in IndexedDB (not localStorage)
 * - All encryption/decryption operations are fully awaited
 * - Decryption failures return null instead of raw ciphertext
 * - Backward compatibility with legacy data (read-only, auto-migrates)
 */

const AES_KEY_DB_NAME = 'tibrah_keystore';
const AES_KEY_STORE = 'keys';
const AES_KEY_ID = 'master_v3';
const LEGACY_KEY_NAME = 'tibrah_ek';
const LEGACY_KEY_NAME_V2 = 'tibrah_ek_v2';

// ═══════════════════════════════════════════════════════════════
// AES-GCM Encryption via Web Crypto API + IndexedDB Key Storage
// ═══════════════════════════════════════════════════════════════

/** Check if Web Crypto AES-GCM is available */
function isAESAvailable(): boolean {
    return (
        typeof window !== 'undefined' &&
        typeof window.crypto !== 'undefined' &&
        typeof window.crypto.subtle !== 'undefined'
    );
}

/** AES-GCM key cache — avoids repeated IndexedDB reads */
let cachedKey: CryptoKey | null = null;

/**
 * Open the IndexedDB key store
 */
function openKeyStore(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(AES_KEY_DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(AES_KEY_STORE)) {
                db.createObjectStore(AES_KEY_STORE, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Store a CryptoKey in IndexedDB
 */
async function storeKeyInDB(key: CryptoKey): Promise<void> {
    const db = await openKeyStore();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(AES_KEY_STORE, 'readwrite');
        tx.objectStore(AES_KEY_STORE).put({ id: AES_KEY_ID, key });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}

/**
 * Load a CryptoKey from IndexedDB
 */
async function loadKeyFromDB(): Promise<CryptoKey | null> {
    try {
        const db = await openKeyStore();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(AES_KEY_STORE, 'readonly');
            const req = tx.objectStore(AES_KEY_STORE).get(AES_KEY_ID);
            req.onsuccess = () => {
                db.close();
                resolve(req.result ? req.result.key : null);
            };
            req.onerror = () => { db.close(); reject(req.error); };
        });
    } catch {
        return null;
    }
}

/**
 * Migrate legacy key from localStorage to IndexedDB (one-time)
 * Old keys were stored as base64 in localStorage — import them into a proper CryptoKey
 */
async function migrateLegacyKey(): Promise<CryptoKey | null> {
    const storedKeyB64 = localStorage.getItem(LEGACY_KEY_NAME_V2) || localStorage.getItem(LEGACY_KEY_NAME);
    if (!storedKeyB64) return null;

    try {
        const rawKey = Uint8Array.from(atob(storedKeyB64), c => c.charCodeAt(0));
        // Import as non-extractable so it can't be read back
        const key = await window.crypto.subtle.importKey(
            'raw',
            rawKey,
            { name: 'AES-GCM' },
            false, // non-extractable
            ['encrypt', 'decrypt']
        );
        // Store in IndexedDB
        await storeKeyInDB(key);
        // Remove from localStorage (the insecure location)
        localStorage.removeItem(LEGACY_KEY_NAME_V2);
        localStorage.removeItem(LEGACY_KEY_NAME);
        console.log('[SecureStorage] Migrated encryption key from localStorage to IndexedDB');
        return key;
    } catch (e) {
        console.warn('[SecureStorage] Failed to migrate legacy key:', e);
        return null;
    }
}

/**
 * Get or generate an AES-GCM CryptoKey
 * Key is stored as non-extractable CryptoKey in IndexedDB (not localStorage)
 * Cached in memory for performance
 */
async function getAESKey(): Promise<CryptoKey> {
    if (cachedKey) return cachedKey;

    if (typeof window === 'undefined') {
        throw new Error('AES not available in SSR');
    }

    // 1. Try loading from IndexedDB
    const dbKey = await loadKeyFromDB();
    if (dbKey) {
        cachedKey = dbKey;
        return cachedKey;
    }

    // 2. Try migrating from legacy localStorage key
    const migratedKey = await migrateLegacyKey();
    if (migratedKey) {
        cachedKey = migratedKey;
        return cachedKey;
    }

    // 3. Generate a brand new non-extractable key
    cachedKey = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false, // non-extractable — cannot be read back from CryptoKey
        ['encrypt', 'decrypt']
    );

    // Store in IndexedDB
    await storeKeyInDB(cachedKey);

    return cachedKey;
}

/**
 * Encrypt data using AES-GCM
 * Format: base64(iv:ciphertext) — 12-byte IV prepended to ciphertext
 */
async function encryptAES(data: string): Promise<string> {
    const key = await getAESKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);

    const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
    );

    // Combine IV + ciphertext into one buffer
    const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data using AES-GCM
 * Expects format: base64(iv:ciphertext)
 * Returns null if decryption fails (instead of raw ciphertext)
 */
async function decryptAES(data: string): Promise<string | null> {
    try {
        const key = await getAESKey();
        const combined = Uint8Array.from(atob(data), c => c.charCodeAt(0));

        // Extract IV (first 12 bytes) and ciphertext
        const iv = combined.slice(0, 12);
        const ciphertext = combined.slice(12);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// Legacy XOR Encryption (Read-only backward compatibility)
// ═══════════════════════════════════════════════════════════════

function xorCipher(data: string, key: string): string {
    if (!key) return data;
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

function decryptLegacyXOR(data: string): string | null {
    try {
        const key = localStorage.getItem(LEGACY_KEY_NAME) || '';
        if (!key) return null;
        const decoded = decodeURIComponent(escape(atob(data)));
        const result = xorCipher(decoded, key);
        // Basic sanity check — decrypted data should be valid
        try { JSON.parse(result); return result; } catch { /* not JSON, check if string */ }
        if (result && result.length > 0 && result.length < data.length * 3) return result;
        return null;
    } catch {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API — Async-first encrypted storage
// ═══════════════════════════════════════════════════════════════

/** List of localStorage keys that contain sensitive health data */
const SENSITIVE_KEYS = new Set([
    'tibrah_health_memory',
    'tibrah_health_metrics',
    'tibrah_daily_logs',
    'tibrah_sleep_data',
    'tibrah_mood_data',
    'tibrah_fasting_sessions',
    'tibrah_medications',
    'tibrah_weight_logs',
    'tibrah_water_logs',
    'tibrah_symptom_logs',
    'tibrah_medical_file',
    'tibrah_ai_conversations',
]);

/**
 * Set item in localStorage — encrypts if key is sensitive
 * ASYNC: waits for encryption to complete before writing
 */
export async function secureSet(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        if (SENSITIVE_KEYS.has(key) && isAESAvailable()) {
            // Await encryption — no fire-and-forget
            const encrypted = await encryptAES(value);
            localStorage.setItem(key, encrypted);
            localStorage.setItem(`${key}_enc`, 'aes');
        } else {
            localStorage.setItem(key, value);
        }
    } catch (e) {
        console.warn(`[SecureStorage] Failed to set ${key}:`, e);
        // Last resort: store unencrypted but log warning
        try {
            localStorage.setItem(key, value);
            localStorage.removeItem(`${key}_enc`);
        } catch { /* localStorage full or unavailable */ }
    }
}

/**
 * Get item from localStorage — decrypts if key is sensitive
 * ASYNC: properly awaits decryption
 * Returns null if data is corrupted or unreadable (never returns raw ciphertext)
 */
export async function secureGet(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
        const value = localStorage.getItem(key);
        if (!value) return null;

        const encFlag = localStorage.getItem(`${key}_enc`);

        if (SENSITIVE_KEYS.has(key) && encFlag) {
            if (encFlag === 'aes' && isAESAvailable()) {
                // AES decryption — fully awaited
                const decrypted = await decryptAES(value);
                if (decrypted !== null) {
                    return decrypted;
                }
                // Decryption failed — do NOT return raw ciphertext
                console.warn(`[SecureStorage] AES decryption failed for ${key} — data may be corrupted`);
                return null;
            } else if (encFlag === '1') {
                // Legacy XOR encrypted
                const decrypted = decryptLegacyXOR(value);
                if (decrypted !== null) {
                    // Auto-migrate to AES on successful read
                    if (isAESAvailable()) {
                        secureSet(key, decrypted).catch(() => {});
                    }
                    return decrypted;
                }
                return null;
            }
        }

        return value;
    } catch (e) {
        console.warn(`[SecureStorage] Failed to get ${key}:`, e);
        return null;
    }
}

/**
 * Synchronous get — returns cached plaintext or null
 * Use this ONLY where async is impossible (e.g., React state initializers)
 * The async version is always preferred
 */
export function secureGetSync(key: string): string | null {
    if (typeof window === 'undefined') return null;

    try {
        const value = localStorage.getItem(key);
        if (!value) return null;

        const encFlag = localStorage.getItem(`${key}_enc`);

        // For encrypted data, check session cache first
        if (SENSITIVE_KEYS.has(key) && encFlag) {
            const cachedPlain = sessionStorage.getItem(`${key}_plain`);
            if (cachedPlain) return cachedPlain;

            // Can't decrypt synchronously for AES — trigger async and return null
            if (encFlag === 'aes') {
                secureGet(key).then(plain => {
                    if (plain) sessionStorage.setItem(`${key}_plain`, plain);
                }).catch(() => {});
                return null;
            }

            // Legacy XOR can be done synchronously
            if (encFlag === '1') {
                return decryptLegacyXOR(value);
            }
        }

        return value;
    } catch {
        return null;
    }
}

/**
 * Remove item from localStorage
 */
export function secureRemove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_enc`);
    sessionStorage.removeItem(`${key}_plain`);
}

/**
 * Set JSON data securely
 */
export async function secureSetJSON<T>(key: string, data: T): Promise<void> {
    await secureSet(key, JSON.stringify(data));
}

/**
 * Get JSON data securely
 */
export async function secureGetJSON<T>(key: string, fallback: T): Promise<T> {
    const raw = await secureGet(key);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

/**
 * Clear all health data from localStorage (for account deletion / privacy)
 */
export function clearAllHealthData(): void {
    if (typeof window === 'undefined') return;

    for (const key of SENSITIVE_KEYS) {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_enc`);
        sessionStorage.removeItem(`${key}_plain`);
    }

    console.log('[SecureStorage] All health data cleared');
}

/**
 * Export all health data as JSON (for data portability / GDPR)
 */
export async function exportAllHealthData(): Promise<Record<string, unknown>> {
    const data: Record<string, unknown> = {};

    for (const key of SENSITIVE_KEYS) {
        const raw = await secureGet(key);
        if (raw) {
            try {
                data[key] = JSON.parse(raw);
            } catch {
                data[key] = raw;
            }
        }
    }

    return data;
}

export default {
    set: secureSet,
    get: secureGet,
    getSync: secureGetSync,
    remove: secureRemove,
    setJSON: secureSetJSON,
    getJSON: secureGetJSON,
    clearAllHealthData,
    exportAllHealthData,
};
