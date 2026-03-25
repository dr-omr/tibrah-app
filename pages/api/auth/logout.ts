/**
 * POST /api/auth/logout
 * 
 * Clears the server-set session cookie.
 * Called by AuthContext on sign out.
 */

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const securePart = isProduction ? '; Secure' : '';

    // Clear both session and legacy cookies
    res.setHeader('Set-Cookie', [
        `tibrah_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${securePart}`,
        `tibrah_auth=; Path=/; Max-Age=0; SameSite=Lax${securePart}`,
    ]);

    return res.status(200).json({ ok: true });
}
