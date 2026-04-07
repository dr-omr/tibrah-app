import type { NextApiRequest, NextApiResponse } from 'next';
import { jwtVerify } from 'jose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ valid: false, error: 'Invalid ID' });
    }

    try {
        const secret = new TextEncoder().encode(process.env.COOKIE_SECRET || 'a_very_long_and_secure_secret_key_for_development');
        
        // Decode and verify expiration strictly
        const { payload } = await jwtVerify(id, secret);
        
        const targetId = payload.id;
        const guardianId = payload.guardianId;

        // Fetch user data via admin logic to bypass client auth
        // Because this is an API route, we run in Node context
        // Real-app: fetch from Firestore Admin
        
        // Mock data for the targetId profile
        const emergencyData = {
            name: 'سجل طبي للطوارئ',
            age: 'مجهول',
            blood_type: 'O+',
            allergies: ['البنسلين'],
            chronic_conditions: ['الربو'],
            current_medications: [
                { name: 'Ventolin HFA', dosage: '2 puffs', timing: 'عند الحاجة' }
            ],
            emergency_contact: '050xxxxxxx'
        };

        return res.status(200).json({
            valid: true,
            profile: emergencyData,
            guardianId
        });

    } catch (err: any) {
        console.error('[Share JWT Error]', err.message);
        return res.status(401).json({
            valid: false,
            profile: null,
            error: err.message
        });
    }
}
