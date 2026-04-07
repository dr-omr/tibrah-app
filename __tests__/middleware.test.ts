import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import * as jose from 'jose';

// Mock the Next.js NextResponse and its static methods correctly
jest.mock('next/server', () => {
    const originalModule = jest.requireActual('next/server');
    return {
        ...originalModule,
        NextResponse: {
            ...originalModule.NextResponse,
            redirect: jest.fn().mockImplementation((url) => ({
                status: 307,
                headers: new Map(),
                url: url.toString()
            })),
            next: jest.fn().mockImplementation(() => ({
                status: 200,
                headers: new Map()
            }))
        }
    };
});

// Mock jose jwtVerify since it uses Edge runtime Node APIs
jest.mock('jose', () => ({
    jwtVerify: jest.fn()
}));

const mockJwtVerify = jose.jwtVerify as jest.Mock;

describe('Next.js Edge Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockJwtVerify.mockResolvedValue({
            payload: { email: 'user@tibrah.com', isAdmin: false }
        });
    });

    it('bypasses public routes seamlessly', async () => {
        const req = new NextRequest(new URL('http://localhost/login'));
        const response = await middleware(req);
        
        expect(response.status).toBe(200);
        expect(mockJwtVerify).not.toHaveBeenCalled();
    });

    it('rejects access to protected /my-care without a session', async () => {
        const req = new NextRequest(new URL('http://localhost/my-care'));
        // No session cookie set
        
        // Dynamic import Next.js mock to observe redirect
        const { NextResponse } = require('next/server');
        
        const response = await middleware(req);
        
        expect(NextResponse.redirect).toHaveBeenCalled();
        const redirectUrl = NextResponse.redirect.mock.calls[0][0];
        expect(redirectUrl.pathname).toBe('/login');
        expect(redirectUrl.searchParams.get('redirect')).toBe('/my-care');
    });

    it('allows access to protected routes with valid session', async () => {
        const req = new NextRequest(new URL('http://localhost/my-care'));
        req.cookies.set('tibrah_session', 'valid_token_string');

        const { NextResponse } = require('next/server');
        const response = await middleware(req);
        
        expect(mockJwtVerify).toHaveBeenCalledWith(
            'valid_token_string',
            expect.any(Uint8Array)
        );
        expect(NextResponse.next).toHaveBeenCalled();
    });

    it('rejects non-admin from /admin routes', async () => {
        const req = new NextRequest(new URL('http://localhost/admin/dashboard'));
        req.cookies.set('tibrah_session', 'valid_token_string');

        mockJwtVerify.mockResolvedValueOnce({
            payload: { email: 'user@tibrah.com', isAdmin: false }
        });

        const { NextResponse } = require('next/server');
        const response = await middleware(req);

        expect(NextResponse.redirect).toHaveBeenCalled();
        expect(NextResponse.redirect.mock.calls[0][0].pathname).toBe('/');
    });

    it('allows admin to /admin routes', async () => {
        const req = new NextRequest(new URL('http://localhost/admin/dashboard'));
        req.cookies.set('tibrah_session', 'valid_token_string');

        mockJwtVerify.mockResolvedValueOnce({
            payload: { email: 'admin@tibrah.com', isAdmin: true }
        });

        const { NextResponse } = require('next/server');
        const response = await middleware(req);

        expect(NextResponse.next).toHaveBeenCalled();
    });

    it('redirects to index if session fails to verify (tampered jwt)', async () => {
        const req = new NextRequest(new URL('http://localhost/my-care'));
        req.cookies.set('tibrah_session', 'tampered_token_string');

        mockJwtVerify.mockRejectedValueOnce(new Error('Signature verification failed'));

        const { NextResponse } = require('next/server');
        const response = await middleware(req);

        expect(NextResponse.redirect).toHaveBeenCalled();
        expect(NextResponse.redirect.mock.calls[0][0].pathname).toBe('/login');
    });
});
