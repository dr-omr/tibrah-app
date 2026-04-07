import { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';
import { verifyApiSession } from '@/lib/verifySession';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate Limiting (5 invites per hour)
    const ip = getClientIp(req);
    const limit = await checkRateLimit(`invite_${ip}`, 5, 60 * 60 * 1000);
    if (limit.limited) {
        return res.status(429).json({ error: 'تم تجاوز الحد المسموح للدعوات. حاول مجدداً بعد ساعة.' });
    }

    try {
        const session = await verifyApiSession(req);
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { inviterPhone, targetPhone, relation } = req.body;

        if (!targetPhone) {
            return res.status(400).json({ error: 'رقم هاتف المدعو مطلوب' });
        }

        // Generate an invite code or deeply linked URL
        const inviteCode = Math.random().toString(36).substring(2, 9).toUpperCase();
        const appLink = `https://tibrah.health/invite?code=${inviteCode}`;

        const message = `مرحباً! لقد قام فرد من عائلتك (${relation}) بدعوتك للانضمام إلى منصة طِبرَا لمتابعة صحتكم كعائلة واحدة.
        
حمل التطبيق أو سجل الدخول من هنا:
${appLink}`;

        console.log(`[WhatsApp Sync] Faking message to ${targetPhone}:\n${message}`);

        // We simulate saving the invitation to DB for later matching
        // In real app, we'd add to an `Invitations` collection

        return res.status(200).json({ 
            success: true, 
            message: 'Invitation sent via WhatsApp',
            inviteCode
        });

    } catch (error: any) {
        console.error('[Invite Member API Error]:', error);
        return res.status(500).json({ error: 'Network Error' });
    }
}
