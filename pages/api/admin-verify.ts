/**
 * Admin Verification API
 * Server-side passcode verification for admin dashboard
 * Uses environment variable — never exposes passcode in client code
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';
import crypto from 'crypto';

// SEC-7 FIX: Timing-safe comparison to prevent timing attacks
function timingSafeCompare(a: string, b: string): boolean {
    // Pad to same length to prevent length-based timing leaks
    const maxLen = Math.max(a.length, b.length);
    const bufA = Buffer.alloc(maxLen, 0);
    const bufB = Buffer.alloc(maxLen, 0);
    Buffer.from(a).copy(bufA);
    Buffer.from(b).copy(bufB);
    return crypto.timingSafeEqual(bufA, bufB) && a.length === b.length;
}

// SEC-3 FIX: Use cryptographically secure random bytes for token generation
function generateToken(): string {
    return crypto.randomBytes(48).toString('base64url');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Strict rate limiting for login — 5 attempts per 15 minutes
    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, 5, 15 * 60 * 1000);
    if (limited) {
        return res.status(429).json({
            error: 'Too many attempts',
            message: '⚠️ تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار 15 دقيقة.',
            success: false,
        });
    }

    try {
        const { passcode } = req.body;

        if (!passcode || typeof passcode !== 'string') {
            return res.status(400).json({ error: 'Passcode is required', success: false });
        }

        // Verify against environment variable
        const validPasscode = process.env.ADMIN_PASSCODE;
        if (!validPasscode) {
            console.error('❌ ADMIN_PASSCODE environment variable is not set');
            return res.status(500).json({
                error: 'Admin access not configured',
                message: 'يرجى إعداد رمز الأدمن في متغيرات البيئة',
                success: false
            });
        }

        // SEC-7 FIX: Timing-safe comparison
        if (!timingSafeCompare(passcode, validPasscode)) {
            console.warn(`⚠️ Failed admin login attempt from IP: ${ip}`);
            return res.status(401).json({
                error: 'Invalid passcode',
                message: 'رمز الدخول غير صحيح',
                success: false,
            });
        }

        // Success — return a secure session token
        const token = process.env.ADMIN_API_SECRET || generateToken();

        console.log(`✅ Admin login successful from IP: ${ip}`);

        // SEC-10 FIX: Set admin token as HttpOnly cookie instead of returning it for localStorage
        const isProduction = process.env.NODE_ENV === 'production';
        const securePart = isProduction ? '; Secure' : '';
        res.setHeader('Set-Cookie', 
            `tibrah_admin=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 8}; SameSite=Lax${securePart}`
        );

        return res.status(200).json({
            success: true,
            message: 'مرحباً دكتور عمر!',
            // Token still returned for backward compatibility but should be phased out
            token,
        });

    } catch (error) {
        console.error('[Admin Verify] Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            success: false,
        });
    }
}
