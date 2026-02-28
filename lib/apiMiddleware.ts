/**
 * Shared API Middleware for Tibrah
 * Rate limiting, input validation, and error handling utilities
 */

import { NextApiRequest, NextApiResponse } from 'next';

// ═══════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60 * 1000);

export function getClientIp(req: NextApiRequest): string {
    return (
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        'unknown'
    );
}

/**
 * Check if a client IP is rate limited
 * @param ip - Client IP
 * @param maxRequests - Max requests per window (default: 30)
 * @param windowMs - Time window in ms (default: 60s)
 */
export function checkRateLimit(
    ip: string,
    maxRequests: number = 30,
    windowMs: number = 60 * 1000
): { limited: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const key = `rl_${ip}`;
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return { limited: false, remaining: maxRequests - 1, resetIn: windowMs };
    }

    entry.count++;
    const remaining = Math.max(0, maxRequests - entry.count);
    const resetIn = entry.resetTime - now;

    return {
        limited: entry.count > maxRequests,
        remaining,
        resetIn,
    };
}

// ═══════════════════════════════════════════════════════════════
// INPUT VALIDATION
// ═══════════════════════════════════════════════════════════════

export function validateRequired(
    body: Record<string, unknown>,
    fields: string[]
): { valid: boolean; missing: string[] } {
    const missing = fields.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
    return { valid: missing.length === 0, missing };
}

export function sanitizeString(input: unknown, maxLength: number = 5000): string {
    if (typeof input !== 'string') return '';
    // Strip HTML tags to prevent XSS, then trim and truncate
    return input.replace(/<[^>]*>/g, '').trim().slice(0, maxLength);
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════

export function methodNotAllowed(res: NextApiResponse, allowed: string = 'POST') {
    res.setHeader('Allow', allowed);
    return res.status(405).json({ error: 'Method not allowed', success: false });
}

export function rateLimited(res: NextApiResponse) {
    return res.status(429).json({
        error: 'Too many requests',
        message: '⚠️ طلبات كثيرة، يرجى المحاولة بعد دقيقة',
        success: false,
    });
}

export function badRequest(res: NextApiResponse, message: string, details?: unknown) {
    return res.status(400).json({ error: message, details, success: false });
}

export function serverError(res: NextApiResponse, message: string = 'Internal server error') {
    return res.status(500).json({ error: message, success: false });
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE WRAPPER
// ═══════════════════════════════════════════════════════════════

interface MiddlewareOptions {
    methods?: string[];
    rateLimit?: { max: number; windowMs: number };
    requiredFields?: string[];
}

/**
 * Wraps an API handler with standard middleware:
 * - Method validation
 * - Rate limiting
 * - Input validation
 * - Error handling
 */
export function withMiddleware(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
    options: MiddlewareOptions = {}
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        // CORS headers
        const origin = req.headers.origin || '';
        const allowedOrigins = [
            process.env.NEXT_PUBLIC_BASE_URL,
            'https://tibrah.com',
            'https://www.tibrah.com',
        ].filter(Boolean);

        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            res.setHeader('Access-Control-Allow-Origin', origin || '*');
        }
        res.setHeader('Access-Control-Allow-Methods', (options.methods || ['POST']).join(', '));
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '86400');

        // Handle preflight
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Method check
        const allowedMethods = options.methods || ['POST'];
        if (!allowedMethods.includes(req.method || '')) {
            return methodNotAllowed(res, allowedMethods.join(', '));
        }

        // Rate limiting
        if (options.rateLimit) {
            const ip = getClientIp(req);
            const { limited } = checkRateLimit(ip, options.rateLimit.max, options.rateLimit.windowMs);
            if (limited) {
                return rateLimited(res);
            }
        }

        // Required fields validation
        if (options.requiredFields && req.body) {
            const { valid, missing } = validateRequired(req.body, options.requiredFields);
            if (!valid) {
                return badRequest(res, `Missing required fields: ${missing.join(', ')}`);
            }
        }

        // Execute handler with error catching
        try {
            await handler(req, res);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[API Error] ${req.url}:`, message);
            return serverError(res, '⚠️ حدث خطأ في الخادم، يرجى المحاولة مرة أخرى');
        }
    };
}
