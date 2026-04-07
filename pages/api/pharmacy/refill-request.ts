import { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';
import { verifyApiSession } from '@/lib/verifySession';
import db from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const clientIp = getClientIp(req);
    const { limited } = await checkRateLimit(clientIp, 5, 60 * 1000); // 5 requests per minute limit
    if (limited) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    // 🔒 Verify session
    const session = await verifyApiSession(req);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { medicationIds } = req.body;

    try {
        const user = await db.entities.User.get(session.uid);
        if (!user) throw new Error('User not found');

        // Record the refill request on the user profile
        const requestId = `refill_${Math.random().toString(36).substring(2, 9)}`;
        await db.entities.User.update(session.uid, {
            latest_refill_request: {
                id: requestId,
                medicationIds: medicationIds || 'all_current',
                status: 'pending',
                createdAt: new Date().toISOString()
            }
        });

        // WhatsApp Integration Simulation
        // For production, you would call WhatsApp Business API or Twilio here.
        // e.g. await sendWhatsAppMessage(ADMIN_PHONE, `New Refill Request from ${user.name}`);
        const supportPhone = '966550000000'; // Target pharmacy WhatsApp number
        let message = `مرحباً صيدلية طِبرَا،\nأرغب في تجديد وصفتي الطبية التلقائية.\nالاسم: ${user.name || 'عميل'}\nرقم الطلب: ${requestId}`;
        if (medicationIds && medicationIds.length > 0) {
             message += `\nالأدوية المطلوبة:\n- ${medicationIds.join('\n- ')}`;
        }
        
        const whatsappUrl = `https://wa.me/${supportPhone}?text=${encodeURIComponent(message)}`;

        return res.status(200).json({
            success: true,
            requestId,
            whatsappUrl,
            message: 'تم تسجيل طلب إعادة التعبئة بنجاح'
        });

    } catch (e: any) {
        console.error('Refill request error:', e);
        return res.status(500).json({ error: 'Failed to process refill request: ' + e.message });
    }
}
