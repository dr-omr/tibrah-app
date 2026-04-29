import type { NextApiRequest, NextApiResponse } from 'next';
import { jwtVerify } from 'jose';

function getShareSecret(): Uint8Array | null {
    const secret = process.env.COOKIE_SECRET;
    if (!secret || secret.length < 32) return null;
    return new TextEncoder().encode(secret);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ valid: false, error: 'Invalid ID' });
    }

    try {
        const secret = getShareSecret();
        if (!secret) {
            return res.status(503).json({ valid: false, profile: null, error: 'Share access is not configured' });
        }
        
        // Decode and verify expiration strictly
        const { payload } = await jwtVerify(id, secret);
        
        const targetId = payload.id;
        const guardianId = payload.guardianId;
        const type = payload.type;

        if (type !== 'emergency_share' || typeof targetId !== 'string' || typeof guardianId !== 'string') {
            return res.status(401).json({ valid: false, profile: null, error: 'Invalid share token' });
        }

        return res.status(404).json({ valid: false, profile: null, guardianId, error: 'Emergency record not found' });

    } catch (err: any) {
        console.error('[Share JWT Error]', err instanceof Error ? err.message : 'invalid token');
        return res.status(401).json({
            valid: false,
            profile: null,
            error: 'Invalid or expired share link'
        });
    }
}
