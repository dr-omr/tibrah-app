/**
 * GET /api/auth/me
 * 
 * Returns the current user's session info from the server-side JWT.
 * Used by the client to determine admin status without exposing admin emails.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyApiSession } from '@/lib/verifySession';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await verifyApiSession(req);
    if (!session) {
        return res.status(200).json({ authenticated: false, isAdmin: false });
    }

    return res.status(200).json({
        authenticated: true,
        uid: session.uid,
        email: session.email,
        isAdmin: session.isAdmin,
    });
}
