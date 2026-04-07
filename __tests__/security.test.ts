/**
 * Security Module Tests
 * Tests for apiMiddleware, secureStorage, and errorMonitoring
 */

// ===== apiMiddleware Tests =====
import { checkRateLimit, sanitizeString, validateRequired } from '@/lib/apiMiddleware';

describe('API Middleware', () => {
    describe('checkRateLimit', () => {
        it('allows requests under the limit', async () => {
            const result = await checkRateLimit('test-ip-1', 5, 60000);
            expect(result.limited).toBe(false);
            expect(result.remaining).toBe(4);
        });

        it('blocks requests over the limit', async () => {
            const ip = 'test-ip-2';
            for (let i = 0; i < 3; i++) {
                await checkRateLimit(ip, 3, 60000);
            }

            const result = await checkRateLimit(ip, 3, 60000);
            expect(result.limited).toBe(true);
            expect(result.remaining).toBe(0);
        });

        it('isolates different IPs', async () => {
            const ip1 = 'test-ip-3';
            const ip2 = 'test-ip-4';

            await checkRateLimit(ip1, 1, 60000);
            const result = await checkRateLimit(ip2, 1, 60000);

            expect(result.limited).toBe(false);
        });
    });

    describe('sanitizeString', () => {
        test('should remove HTML tags', () => {
            const result = sanitizeString('<script>alert("xss")</script>Hello');
            expect(result).not.toContain('<script>');
            expect(result).toContain('Hello');
        });

        test('should trim whitespace', () => {
            const result = sanitizeString('  hello world  ');
            expect(result).toBe('hello world');
        });

        test('should truncate to maxLength', () => {
            const result = sanitizeString('a'.repeat(200), 100);
            expect(result.length).toBeLessThanOrEqual(100);
        });

        test('should handle empty strings', () => {
            const result = sanitizeString('');
            expect(result).toBe('');
        });
    });

    describe('validateRequired', () => {
        test('should return true when all fields are present', () => {
            const body = { name: 'Omar', email: 'test@test.com' };
            const result = validateRequired(body, ['name', 'email']);
            expect(result.valid).toBe(true);
        });

        test('should return false when fields are missing', () => {
            const body = { name: 'Omar' };
            const result = validateRequired(body, ['name', 'email']);
            expect(result.valid).toBe(false);
            expect(result.missing).toContain('email');
        });

        test('should handle empty body', () => {
            const result = validateRequired({}, ['name']);
            expect(result.valid).toBe(false);
        });
    });
});

// ===== Error Monitoring Tests =====
import { trackError, getErrors, clearErrors, getErrorSummary } from '@/lib/errorMonitoring';

describe('Error Monitoring', () => {
    beforeEach(() => {
        clearErrors();
    });

    test('should track errors', () => {
        trackError('Test error', { source: 'runtime', severity: 'low' });
        const errors = getErrors();
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toBe('Test error');
    });

    test('should deduplicate same errors', () => {
        trackError('Duplicate error', { source: 'runtime' });
        trackError('Duplicate error', { source: 'runtime' });
        trackError('Duplicate error', { source: 'runtime' });

        const errors = getErrors();
        // Should only have 1 entry with count 3
        const matching = errors.filter(e => e.message === 'Duplicate error');
        expect(matching.length).toBe(1);
        expect(matching[0].count).toBe(3);
    });

    test('should track different errors separately', () => {
        trackError('Error A', { source: 'runtime' });
        trackError('Error B', { source: 'api' });

        const errors = getErrors();
        expect(errors.length).toBeGreaterThanOrEqual(2);
    });

    test('should provide error summary', () => {
        trackError('Critical!', { source: 'unhandled', severity: 'critical' });
        trackError('Minor issue', { source: 'ui', severity: 'low' });

        const summary = getErrorSummary();
        expect(summary.total).toBeGreaterThanOrEqual(2);
        expect(summary.critical).toBeGreaterThanOrEqual(1);
    });

    test('should clear all errors', () => {
        trackError('To be cleared');
        clearErrors();
        const errors = getErrors();
        expect(errors.length).toBe(0);
    });
});

// ===== SecureStorage Tests =====
import { secureSet, secureGet, secureRemove, secureSetJSON, secureGetJSON } from '@/lib/secureStorage';

import { webcrypto } from 'crypto';
import { TextEncoder, TextDecoder } from 'util';

describe('Secure Storage', () => {
    beforeAll(() => {
        // Expose TextEncoder/TextDecoder for jsdom
        if (typeof global.TextEncoder === 'undefined') {
            global.TextEncoder = TextEncoder as any;
            global.TextDecoder = TextDecoder as any;
        }

        // Provide a valid crypto implementation for jsdom so AES encryption activates
        if (typeof window !== 'undefined') {
            Object.defineProperty(window, 'crypto', { value: webcrypto });
        }
        
        // Provide a simple mock for indexedDB which is used for key storage
        if (typeof indexedDB === 'undefined' && typeof window !== 'undefined') {
            const mockIDB = {
                open: () => {
                    const req: any = {};
                    setTimeout(() => {
                        req.result = {
                            objectStoreNames: { contains: () => true },
                            transaction: () => {
                                const tx: any = {
                                    objectStore: () => ({
                                        get: () => {
                                            const r: any = {};
                                            // Return undefined so it generates a real CryptoKey
                                            setTimeout(() => { r.result = undefined; r.onsuccess && r.onsuccess(); }, 0);
                                            return r;
                                        },
                                        put: () => {
                                            const r: any = {};
                                            setTimeout(() => { r.onsuccess && r.onsuccess(); }, 0);
                                            return r;
                                        }
                                    }),
                                    oncomplete: null,
                                    onerror: null
                                };
                                setTimeout(() => { tx.oncomplete && tx.oncomplete(); }, 10);
                                return tx;
                            },
                            close: () => {}
                        };
                        req.onsuccess && req.onsuccess();
                    }, 0);
                    return req;
                }
            };
            Object.defineProperty(window, 'indexedDB', { value: mockIDB });
        }
    });

    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    test('should store and retrieve non-sensitive data as-is', async () => {
        await secureSet('test_key', 'hello');
        const result = await secureGet('test_key');
        expect(result).toBe('hello');
    });

    test('should store and retrieve sensitive health data (encrypted)', async () => {
        await secureSet('tibrah_health_memory', '{"conditions": ["diabetes"]}');
        const result = await secureGet('tibrah_health_memory');
        expect(result).toBe('{"conditions": ["diabetes"]}');
    });

    test('should mark sensitive keys as encrypted', async () => {
        await secureSet('tibrah_health_memory', 'test data');
        expect(localStorage.getItem('tibrah_health_memory_enc')).toBe('aes');
    });

    test('should not mark non-sensitive keys as encrypted', async () => {
        await secureSet('regular_key', 'test data');
        expect(localStorage.getItem('regular_key_enc')).toBeNull();
    });

    test('should remove item and encryption flag', async () => {
        await secureSet('tibrah_health_memory', 'test');
        secureRemove('tibrah_health_memory');
        const result = await secureGet('tibrah_health_memory');
        expect(result).toBeNull();
        expect(localStorage.getItem('tibrah_health_memory_enc')).toBeNull();
    });

    test('should handle JSON data', async () => {
        const data = { weight: 75, mood: 8, sleep: 7 };
        await secureSetJSON('test_json', data);
        const result = await secureGetJSON('test_json', {});
        expect(result).toEqual(data);
    });

    test('should return fallback for missing JSON keys', async () => {
        const result = await secureGetJSON('nonexistent', { default: true });
        expect(result).toEqual({ default: true });
    });

    test('should return null for missing keys', async () => {
        const result = await secureGet('nonexistent_key');
        expect(result).toBeNull();
    });
});
