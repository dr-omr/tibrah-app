import { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';
import { verifyApiSession } from '@/lib/verifySession';
import { getGroqClient, isGroqConfigured } from '@/lib/ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const clientIp = getClientIp(req);
    const { limited } = await checkRateLimit(clientIp, 10, 60 * 1000);
    if (limited) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    const session = await verifyApiSession(req);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!isGroqConfigured) {
        return res.status(503).json({ error: 'Symptom Triage AI service unavailable' });
    }

    try {
        const { symptoms, duration, severity, location, age, gender } = req.body;

        if (!symptoms) {
            return res.status(400).json({ error: 'Symptoms are required' });
        }

        const groq = await getGroqClient();
        if (!groq) throw new Error('Groq client initialization failed');

        const prompt = `You are a medical triage assistant. Analyze these symptoms:
Symptoms: ${symptoms}
Duration: ${duration || 'unspecified'}
Severity: ${severity || 'unspecified'}/10
Location: ${location || 'unspecified'}
Patient: ${age || '?'} yrs, ${gender || '?'}

IMPORTANT: Respond strictly with a JSON object. No markdown, no explanations outside the JSON.
Analyze the symptoms and return a JSON object with:
{
    "urgency": "routine | near_review | urgent_sameday | emergency",
    "likely_conditions": ["condition 1", "condition 2"],
    "actions": ["action 1", "action 2"],
    "emergency_contacts": true if emergency else false,
    "disclaimer": "Always consult a doctor..."
}`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            max_tokens: 1000,
            response_format: { type: "json_object" }
        });

        const text = completion.choices[0]?.message?.content;
        if (!text) throw new Error('Empty response from AI');

        const result = JSON.parse(text);
        return res.status(200).json(result);

    } catch (e: any) {
        console.error('Symptom triage error:', e);
        return res.status(500).json({ error: e.message });
    }
}
