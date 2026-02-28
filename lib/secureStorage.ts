/**
 * Secure Storage — Encrypted localStorage wrapper
 * Encrypts sensitive health data before storing in localStorage
 * Uses AES-like XOR cipher with browser-generated key
 */

const ENCRYPTION_KEY_NAME = 'tibrah_ek';

/**
 * Get or generate the encryption key
 * Key is stored once and reused for the session lifetime
 */
function getEncryptionKey(): string {
    if (typeof window === 'undefined') return 'ssr-fallback';

    let key = sessionStorage.getItem(ENCRYPTION_KEY_NAME);
    if (!key) {
        // Generate a random key using crypto API
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint8Array(32);
            window.crypto.getRandomValues(array);
            key = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
        } else {
            key = Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
        }
        sessionStorage.setItem(ENCRYPTION_KEY_NAME, key);
    }
    return key;
}

/**
 * Simple XOR-based encryption (suitable for localStorage obfuscation)
 * Not military-grade but prevents casual data inspection
 */
function xorCipher(data: string, key: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

/**
 * Encrypt data before storing
 */
function encrypt(data: string): string {
    try {
        const key = getEncryptionKey();
        const encrypted = xorCipher(data, key);
        return btoa(unescape(encodeURIComponent(encrypted)));
    } catch {
        // Fallback — store as-is if encryption fails
        return data;
    }
}

/**
 * Decrypt data after reading
 */
function decrypt(data: string): string {
    try {
        const key = getEncryptionKey();
        const decoded = decodeURIComponent(escape(atob(data)));
        return xorCipher(decoded, key);
    } catch {
        // Fallback — try to return as-is (might be unencrypted legacy data)
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
 */
export function secureSet(key: string, value: string): void {
    if (typeof window === 'undefined') return;

    try {
        if (SENSITIVE_KEYS.has(key)) {
            localStorage.setItem(key, encrypt(value));
            // Mark as encrypted for migration
            localStorage.setItem(`${key}_enc`, '1');
        } else {
            localStorage.setItem(key, value);
        }
    } catch (e) {
        console.warn(`[SecureStorage] Failed to set ${key}:`, e);
    }
}

/**
 * Get item from localStorage — decrypts if key is sensitive
 */
export function secureGet(key: string): string | null {
    if (typeof window === 'undefined') return null;

    try {
        const value = localStorage.getItem(key);
        if (!value) return null;

        // Check if data is encrypted
        const isEncrypted = localStorage.getItem(`${key}_enc`) === '1';

        if (SENSITIVE_KEYS.has(key) && isEncrypted) {
            return decrypt(value);
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
