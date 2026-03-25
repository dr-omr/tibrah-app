/**
 * Secure Storage — Encrypted localStorage wrapper
 * Encrypts sensitive health data before storing in localStorage
 * Uses AES-GCM via Web Crypto API for strong encryption
 * Maintains backward compatibility with legacy XOR-encrypted data
 */

const ENCRYPTION_KEY_NAME = 'tibrah_ek_v2';
const LEGACY_KEY_NAME = 'tibrah_ek';
const AES_KEY_DB = 'tibrah_keystore';

// ═══════════════════════════════════════════════════════════════
// AES-GCM Encryption (Primary) via Web Crypto API
// ═══════════════════════════════════════════════════════════════

/** Check if Web Crypto AES-GCM is available */
function isAESAvailable(): boolean {
    return (
        typeof window !== 'undefined' &&
        typeof window.crypto !== 'undefined' &&
        typeof window.crypto.subtle !== 'undefined'
    );
}

/** AES-GCM key cache — avoids repeated key generation */
let cachedKey: CryptoKey | null = null;

/**
 * Get or generate an AES-GCM CryptoKey
 * The raw key material is stored in localStorage (base64-encoded)
 * The CryptoKey is cached in memory for performance
 */
async function getAESKey(): Promise<CryptoKey> {
    if (cachedKey) return cachedKey;

    if (typeof window === 'undefined') {
        throw new Error('AES not available in SSR');
    }

    // Try to load existing key material
    const storedKeyB64 = localStorage.getItem(ENCRYPTION_KEY_NAME);

    if (storedKeyB64) {
        // Import existing key
        const rawKey = Uint8Array.from(atob(storedKeyB64), c => c.charCodeAt(0));
        cachedKey = await window.crypto.subtle.importKey(
            'raw',
            rawKey,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
        return cachedKey;
    }

    // Generate new 256-bit AES key
    cachedKey = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // Export and store the raw key material
    const rawKey = await window.crypto.subtle.exportKey('raw', cachedKey);
    const keyB64 = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
    localStorage.setItem(ENCRYPTION_KEY_NAME, keyB64);

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
 */
async function decryptAES(data: string): Promise<string> {
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
}

// ═══════════════════════════════════════════════════════════════
// Legacy XOR Encryption (Backward Compatibility)
// ═══════════════════════════════════════════════════════════════

function getLegacyKey(): string {
    if (typeof window === 'undefined') return 'ssr-fallback';
    return sessionStorage.getItem(LEGACY_KEY_NAME) || '';
}

function xorCipher(data: string, key: string): string {
    if (!key) return data;
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

function decryptLegacy(data: string): string | null {
    try {
        const key = getLegacyKey();
        if (!key) return null;
        const decoded = decodeURIComponent(escape(atob(data)));
        return xorCipher(decoded, key);
    } catch {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// Synchronous fallback for non-async contexts
// ═══════════════════════════════════════════════════════════════

/** Simple XOR encrypt (used only as fallback when AES is unavailable) */
function encryptSync(data: string): string {
    try {
        if (typeof window === 'undefined') return data;
        let key = localStorage.getItem(LEGACY_KEY_NAME);
        if (!key) {
            const array = new Uint8Array(32);
            window.crypto.getRandomValues(array);
            key = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
            localStorage.setItem(LEGACY_KEY_NAME, key);
        }
        const encrypted = xorCipher(data, key);
        return btoa(unescape(encodeURIComponent(encrypted)));
    } catch {
        return data;
    }
}

function decryptSync(data: string): string {
    try {
        if (typeof window === 'undefined') return data;
        const key = localStorage.getItem(LEGACY_KEY_NAME) || getLegacyKey();
        if (!key) return data;
        const decoded = decodeURIComponent(escape(atob(data)));
        return xorCipher(decoded, key);
    } catch {
        return data;
    }
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API — Drop-in replacement for localStorage with encryption
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
 * Uses AES-GCM when available, falls back to XOR
 */
export function secureSet(key: string, value: string): void {
    if (typeof window === 'undefined') return;

    try {
        if (SENSITIVE_KEYS.has(key)) {
            if (isAESAvailable()) {
                // Fire-and-forget AES encryption
                encryptAES(value)
                    .then(encrypted => {
                        localStorage.setItem(key, encrypted);
                        localStorage.setItem(`${key}_enc`, 'aes');
                    })
                    .catch(() => {
                        // Fallback to sync XOR encryption
                        localStorage.setItem(key, encryptSync(value));
                        localStorage.setItem(`${key}_enc`, '1');
                    });
            } else {
                localStorage.setItem(key, encryptSync(value));
                localStorage.setItem(`${key}_enc`, '1');
            }
        } else {
            localStorage.setItem(key, value);
        }
    } catch (e) {
        console.warn(`[SecureStorage] Failed to set ${key}:`, e);
    }
}

/**
 * Get item from localStorage — decrypts if key is sensitive
 * Handles both AES-GCM and legacy XOR-encrypted data
 */
export function secureGet(key: string): string | null {
    if (typeof window === 'undefined') return null;

    try {
        const value = localStorage.getItem(key);
        if (!value) return null;

        const encFlag = localStorage.getItem(`${key}_enc`);

        if (SENSITIVE_KEYS.has(key) && encFlag) {
            if (encFlag === 'aes') {
                // AES-encrypted — we need async decryption
                // For synchronous API compatibility, try sync XOR first
                // The async migration will happen in the background
                try {
                    // Attempt to return from a cached plaintext version
                    const cachedPlain = sessionStorage.getItem(`${key}_plain`);
                    if (cachedPlain) return cachedPlain;

                    // Start async decryption and cache result
                    if (isAESAvailable()) {
                        decryptAES(value)
                            .then(plain => {
                                sessionStorage.setItem(`${key}_plain`, plain);
                            })
                            .catch(() => { /* silently fail */ });
                    }

                    // Try legacy decrypt as fallback
                    const legacy = decryptSync(value);
                    if (legacy && legacy !== value) return legacy;
                    return value;
                } catch {
                    return value;
                }
            } else if (encFlag === '1') {
                // Legacy XOR encrypted
                return decryptSync(value);
            }
        }

        return value;
    } catch (e) {
        console.warn(`[SecureStorage] Failed to get ${key}:`, e);
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
export function secureSetJSON<T>(key: string, data: T): void {
    secureSet(key, JSON.stringify(data));
}

/**
 * Get JSON data securely
 */
export function secureGetJSON<T>(key: string, fallback: T): T {
    const raw = secureGet(key);
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
export function exportAllHealthData(): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    for (const key of SENSITIVE_KEYS) {
        const raw = secureGet(key);
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
    remove: secureRemove,
    setJSON: secureSetJSON,
    getJSON: secureGetJSON,
    clearAllHealthData,
    exportAllHealthData,
};
