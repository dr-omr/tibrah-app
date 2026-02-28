/**
 * Admin Verification API
 * Server-side passcode verification for admin dashboard
 * Uses environment variable — never exposes passcode in client code
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Strict rate limiting for login — 5 attempts per 15 minutes
    const ip = getClientIp(req);
    const { limited } = checkRateLimit(ip, 5, 15 * 60 * 1000);
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

        if (passcode !== validPasscode) {
            console.warn(`⚠️ Failed admin login attempt from IP: ${ip}`);
            return res.status(401).json({
                error: 'Invalid passcode',
                message: 'رمز الدخول غير صحيح',
                success: false,
            });
        }

        // Success — return a session token
        const token = process.env.ADMIN_API_SECRET || generateToken();

        console.log(`✅ Admin login successful from IP: ${ip}`);

        return res.status(200).json({
            success: true,
            message: 'مرحباً دكتور عمر!',
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

function generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}
