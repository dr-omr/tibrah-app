import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/lib/apiMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') { res.status(405).end(); return; }

    try {
        const { errors } = req.body;
        
        if (!errors || !Array.isArray(errors)) {
            res.status(400).json({ success: false, error: 'Invalid payload' });
            return;
        }

        // Ideally, here you would push these errors to Firebase Crashlytics,
        // DataDog, Sentry, or save them directly to a dedicated Firestore collection
        // e.g. await db.collection('telemetry_errors').add({ ... })
        
        // For now, if NODE_ENV is development, we just print them to the terminal cleanly
        if (process.env.NODE_ENV === 'development') {
            const criticalCounts = errors.filter(e => e.severity === 'critical').length;
            console.log(`[TELEMETRY] Received ${errors.length} errors from client (${criticalCounts} critical).`);
        }

        res.status(200).json({ success: true, logged: errors.length });
        return;
    } catch (e) {
        res.status(500).json({ success: false, error: 'Failed to log telemetry' });
        return;
    }
}

export default withMiddleware(handler, {
    methods: ['POST'],
    // 20 requests per hour limit per IP to prevent spamming
    rateLimit: { max: 20, windowMs: 60 * 60 * 1000 } 
});
