/**
 * Error Monitoring — Lightweight error tracking for Tibrah
 * Captures, deduplicates, and stores errors for debugging
 * Can be extended to send to external services (Sentry, LogRocket)
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface ErrorEntry {
    id: string;
    message: string;
    stack?: string;
    source: 'runtime' | 'network' | 'ui' | 'api' | 'unhandled';
    severity: 'low' | 'medium' | 'high' | 'critical';
    url?: string;
    timestamp: number;
    count: number; // deduplication counter
    metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// ERROR STORE (in-memory + localStorage)
// ═══════════════════════════════════════════════════════════════

const MAX_ERRORS = 50;
const STORAGE_KEY = 'tibrah_error_log';

let errorStore: ErrorEntry[] = [];
let initialized = false;

function loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            errorStore = JSON.parse(stored);
        }
    } catch {
        errorStore = [];
    }
}

function saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
        // Keep only recent errors
        const trimmed = errorStore.slice(-MAX_ERRORS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
        // Storage full — clear old errors
        errorStore = errorStore.slice(-10);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(errorStore));
        } catch { /* ignore */ }
    }
}

function generateId(message: string, source: string): string {
    // Simple hash for deduplication
    let hash = 0;
    const str = `${source}:${message}`;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return `err_${Math.abs(hash).toString(36)}`;
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

/**
 * Track an error
 */
export function trackError(
    error: Error | string,
    options: {
        source?: ErrorEntry['source'];
        severity?: ErrorEntry['severity'];
        metadata?: Record<string, unknown>;
    } = {}
): void {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'object' ? error.stack : undefined;
    const source = options.source || 'runtime';
    const severity = options.severity || 'medium';

    const id = generateId(message, source);

    // Deduplicate — increment count if same error
    const existing = errorStore.find(e => e.id === id);
    if (existing) {
        existing.count++;
        existing.timestamp = Date.now();
        if (options.metadata) {
            existing.metadata = { ...existing.metadata, ...options.metadata };
        }
    } else {
        errorStore.push({
            id,
            message,
            stack,
            source,
            severity,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            timestamp: Date.now(),
            count: 1,
            metadata: options.metadata,
        });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.error(`[ErrorMonitor] [${severity.toUpperCase()}] [${source}]`, message);
    }

    saveToStorage();
}

/**
 * Track an API error
 */
export function trackApiError(endpoint: string, status: number, message: string): void {
    trackError(message, {
        source: 'api',
        severity: status >= 500 ? 'high' : 'medium',
        metadata: { endpoint, status },
    });
}

/**
 * Track a network error
 */
export function trackNetworkError(url: string, error: string): void {
    trackError(error, {
        source: 'network',
        severity: 'medium',
        metadata: { url },
    });
}

/**
 * Get all tracked errors (for admin dashboard)
 */
export function getErrors(): ErrorEntry[] {
    loadFromStorage();
    return [...errorStore].sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get error summary (for quick dashboard view)
 */
export function getErrorSummary(): {
    total: number;
    critical: number;
    recent24h: number;
    topErrors: { message: string; count: number; severity: string }[];
} {
    loadFromStorage();
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    return {
        total: errorStore.length,
        critical: errorStore.filter(e => e.severity === 'critical').length,
        recent24h: errorStore.filter(e => now - e.timestamp < DAY).length,
        topErrors: errorStore
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(e => ({ message: e.message, count: e.count, severity: e.severity })),
    };
}

/**
 * Clear all errors
 */
export function clearErrors(): void {
    errorStore = [];
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
}

/**
 * Initialize global error handlers
 * Call this once in _app.tsx
 */
export function initErrorMonitoring(): void {
    if (typeof window === 'undefined' || initialized) return;
    initialized = true;

    loadFromStorage();

    // Catch unhandled errors
    window.addEventListener('error', (event) => {
        trackError(event.error || event.message, {
            source: 'unhandled',
            severity: 'critical',
            metadata: {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            },
        });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const message = event.reason?.message || event.reason?.toString() || 'Unhandled Promise Rejection';
        trackError(message, {
            source: 'unhandled',
            severity: 'high',
            metadata: { reason: event.reason?.toString() },
        });
    });

    console.log('🛡️ [ErrorMonitor] Initialized');
}

export default {
    track: trackError,
    trackApi: trackApiError,
    trackNetwork: trackNetworkError,
    getErrors,
    getSummary: getErrorSummary,
    clear: clearErrors,
    init: initErrorMonitoring,
};
