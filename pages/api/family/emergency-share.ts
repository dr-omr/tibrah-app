import { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';
import { verifyApiSession } from '@/lib/verifySession';
import { db } from '@/lib/db';
import { SignJWT } from 'jose';

function getJwtSecret(): Uint8Array | null {
    const secret = process.env.COOKIE_SECRET;
    if (!secret || secret.length < 32) return null;
    return new TextEncoder().encode(secret);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip = getClientIp(req);
    const limit = await checkRateLimit(`share_${ip}`, 10, 60 * 60 * 1000);
    if (limit.limited) {
        return res.status(429).json({ error: 'Too many link generations. Try again later.' });
    }

    try {
        const jwtSecret = getJwtSecret();
        if (!jwtSecret) {
            return res.status(503).json({ error: 'Emergency sharing is not configured' });
        }

        const session = await verifyApiSession(req);
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { targetId } = req.body;
        
        let shareDocId = targetId;
        // Verify relationship. If sharing parent's own profile, targetId == session.uid or targetId == undefined
        if (!targetId || targetId === session.uid) {
            shareDocId = session.uid;
        } else {
            // Find targetId in the user's family tree to verify permission
            const userRef = await db.entities.User.get(session.uid);
            if (!userRef || !userRef.family_members?.find((m: any) => m.id === targetId)) {
                return res.status(403).json({ error: 'لا تملك الصلاحية لمشاركة السجل الطبي لهذا الفرد.' });
            }
        }

        // Generate a cryptographically secure short-lived token (24h)
        const token = await new SignJWT({ 
            id: shareDocId, 
            type: 'emergency_share',
            guardianId: session.uid
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h') // strict 24 expiry
            .sign(jwtSecret);

        // Return a URL pointing to the app's sharing landing page
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const emergencyUrl = `${baseUrl}/share/${token}`;

        return res.status(200).json({ 
            success: true, 
            url: emergencyUrl,
            expiresIn: '24 hours'
        });

    } catch (error: any) {
        console.error('[Emergency Share API Error]:', error);
        return res.status(500).json({ error: 'Network Error' });
    }
}
