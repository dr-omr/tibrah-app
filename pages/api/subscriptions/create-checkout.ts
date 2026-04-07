import { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';
import { verifyApiSession } from '@/lib/verifySession';
import db from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const clientIp = getClientIp(req);
    const { limited } = await checkRateLimit(clientIp, 10, 60 * 1000);
    if (limited) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    // 🔒 Verify session
    const session = await verifyApiSession(req);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { planId, cycle, paymentMethod } = req.body;

    if (!planId || !cycle || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Simulated plans metadata
    const PLANS = {
        'advanced': { price: cycle === 'yearly' ? 1490 : 149, name: 'Advanced Care' },
        'vip': { price: cycle === 'yearly' ? 4990 : 499, name: 'VIP Holistic Care' }
    };

    const targetPlan = PLANS[planId as keyof typeof PLANS];
    if (!targetPlan) {
        return res.status(400).json({ error: 'Invalid plan selected' });
    }

    try {
        // --- 🏦 PAYMENT GATEWAY MOCK (Moyasar / Tabby) ---
        // In a production environment, you would call:
        // const response = await fetch('https://api.moyasar.com/v1/payments', { ... })
        console.log(`[PAYMENT GATEWAY] Processing payment of ${targetPlan.price} SAR via ${paymentMethod} for user ${session.uid}`);
        
        // Let's pretend the payment was successful immediately for demonstration
        const mockTransactionId = `txn_${Math.random().toString(36).substring(2, 11)}`;

        // Update the user's profile in Firestore
        await db.entities.User.update(session.uid, {
            loyalty_tier: planId === 'vip' ? 'platinum' : 'gold',
            settings: {
                subscription: {
                    active: true,
                    plan: planId,
                    cycle: cycle,
                    expiresAt: cycle === 'yearly' 
                        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    transactionId: mockTransactionId
                }
            }
        });

        // 🎯 Award Premium Bonus Points via Gamification Engine!
        // We will do this later if needed.

        return res.status(200).json({
            success: true,
            transactionId: mockTransactionId,
            message: 'Payment processed successfully',
            redirectUrl: '/my-care?status=upgraded'
        });

    } catch (e: any) {
        console.error('Checkout error:', e);
        return res.status(500).json({ error: 'Failed to process checkout: ' + e.message });
    }
}
