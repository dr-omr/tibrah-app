import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });

import { createMocks } from 'node-mocks-http';
import sessionHandler from '@/pages/api/auth/session';

// Setup Mock Environment Variables
process.env.SESSION_SECRET = 'a_very_secure_super_long_secret_key_that_is_32_bytes!';
process.env.ADMIN_EMAILS = 'admin@tibrah.com';

// Mock jose JWT Signer
jest.mock('jose', () => ({
    SignJWT: jest.fn().mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        setIssuer: jest.fn().mockReturnThis(),
        setSubject: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue('mocked_jwt_token_string'),
    })),
}));

// Mock Firebase Admin
jest.mock('@/lib/firebaseAdmin', () => ({
    getAdminAuth: jest.fn(() => ({
        verifyIdToken: jest.fn().mockImplementation(async (token) => {
            if (token === 'valid_mock_token') {
                return { uid: 'user_123', email: 'test@tibrah.com' };
            }
            if (token === 'admin_mock_token') {
                return { uid: 'admin_123', email: 'admin@tibrah.com' };
            }
            throw new Error('Firebase: Invalid token');
        }),
    })),
}));

describe('/api/auth/session API Endpoint', () => {

    it('rejects GET requests', async () => {
        const { req, res } = createMocks({ method: 'GET' });
        await sessionHandler(req as any, res as any);
        expect(res._getStatusCode()).toBe(405);
    });

    it('rejects POST without idToken', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {}
        });
        await sessionHandler(req as any, res as any);
        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toHaveProperty('error', 'Missing idToken');
    });

    it('accepts valid idToken and sets HttpOnly cookie for regular user', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: { idToken: 'valid_mock_token' }
        });
        await sessionHandler(req as any, res as any);
        
        expect(res._getStatusCode()).toBe(200);
        const setCookieHeaders = res.getHeader('Set-Cookie');
        expect(setCookieHeaders).toBeDefined();
        
        // Assert Set-Cookie contains HttpOnly, Max-Age
        const cookieStr = Array.isArray(setCookieHeaders) ? setCookieHeaders.join(';') : (setCookieHeaders as string);
        expect(cookieStr).toContain('HttpOnly');
        expect(cookieStr).toContain('Max-Age');
        expect(cookieStr).toContain('tibrah_session=mocked_jwt_token_string');
    });

    it('handles invalid invalid idToken securely', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: { idToken: 'expired_or_fake_token' },
        });

        await sessionHandler(req as any, res as any);
        expect(res._getStatusCode()).toBe(401);
        expect(JSON.parse(res._getData())).toHaveProperty('error', 'Invalid or expired token');
    });
});
