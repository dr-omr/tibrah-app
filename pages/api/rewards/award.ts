import { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';
import { verifyApiSession } from '@/lib/verifySession';
import { awardPoints, GamificationAction } from '@/lib/gamification/pointsEngine';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const clientIp = getClientIp(req);
    const { limited } = await checkRateLimit(clientIp, 20, 60 * 1000);
    if (limited) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    // 🔒 Verify session
    const session = await verifyApiSession(req);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action } = req.body;

    if (!action) {
        return res.status(400).json({ error: 'Missing action parameter' });
    }

    try {
        const result = await awardPoints(session.uid, action as GamificationAction);
        
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (e: any) {
        console.error('Gamification award error:', e);
        return res.status(500).json({ error: 'Failed to award points: ' + e.message });
    }
}
