// Mock node-mocks-http safely
import { createRequest, createResponse } from 'node-mocks-http';
import { verifyApiSession } from '@/lib/verifySession';

// We mock firebase-admin for testing verifySession
jest.mock('firebase-admin', () => {
    return {
        apps: ['mock-app'],
        auth: () => ({
            verifySessionCookie: jest.fn((cookie: string) => {
                if (cookie === 'valid-tibrah-cookie') {
                    return Promise.resolve({ uid: 'user_123', email: 'test@example.com', role: 'user' });
                }
                if (cookie === 'admin-tibrah-cookie') {
                    return Promise.resolve({ uid: 'admin_123', email: 'admin@example.com', role: 'admin' });
                }
                return Promise.reject(new Error('Invalid cookie'));
            })
        })
    };
});

describe('verifyApiSession security middleware', () => {
    it('rejects requests with no cookies', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/test',
            headers: {}
        });

        const session = await verifyApiSession(req as any);
        expect(session).toBeNull();
    });

    it('rejects requests with an invalid cookie', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/test',
            headers: {
                cookie: 'tibrah_auth=invalid-cookie;'
            }
        });

        const session = await verifyApiSession(req as any);
        expect(session).toBeNull();
    });

    it('resolves valid user sessions correctly', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/test',
            headers: {
                cookie: 'tibrah_auth=valid-tibrah-cookie;'
            }
        });

        const session = await verifyApiSession(req as any);
        expect(session).not.toBeNull();
        expect(session?.uid).toBe('user_123');
        expect(session?.role).toBe('user');
    });

    it('resolves valid admin sessions correctly', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/test',
            headers: {
                cookie: 'tibrah_auth=admin-tibrah-cookie;'
            }
        });

        const session = await verifyApiSession(req as any);
        expect(session).not.toBeNull();
        expect(session?.uid).toBe('admin_123');
        expect(session?.role).toBe('admin');
    });
});
