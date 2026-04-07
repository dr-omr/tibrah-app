import { NextApiRequest, NextApiResponse } from 'next';

// DEMO: Webhook Endpoint for Tibrah Appointments
// In a real-world scenario, you can change 'EXTERNAL_WEBHOOK_URL' to your Zapier, Make, or clinic management system webhook.

const EXTERNAL_WEBHOOK_URL = process.env.EXTERNAL_WEBHOOK_URL || 'https://webhook.site/placeholder-url-for-tibrah';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const appointmentData = req.body;

        // 1. You could log this to a backend DB or logging system here
        console.log('[Webhook Handler] Received new booking:', appointmentData);

        // 2. Forward the payload to an external automation tool (Make/Zapier)
        // Note: For demonstration, we just simulate the fetch if no real internet available.
        /*
        const response = await fetch(EXTERNAL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData),
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fire external webhook: ${response.statusText}`);
        }
        */

        // For this demo, we assume success immediately
        return res.status(200).json({ 
            success: true, 
            message: 'Webhook processed successfully',
            forwarded_to: EXTERNAL_WEBHOOK_URL
        });

    } catch (error: any) {
        console.error('[Webhook Error]', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
