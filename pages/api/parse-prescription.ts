import { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';
import { verifyApiSession } from '@/lib/verifySession';
import { genAI } from '@/lib/ai';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limiting — 10 requests per minute
    const clientIp = getClientIp(req);
    const { limited } = await checkRateLimit(clientIp, 10, 60 * 1000);
    if (limited) {
        return res.status(429).json({ error: 'Too many requests', message: '⚠️ طلبات كثيرة لتفسير الوصفات، يرجى المحاولة بعد دقيقة' });
    }

    // 🔒 Authentication required
    const session = await verifyApiSession(req);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized', message: 'يرجى تسجيل الدخول أولاً' });
    }

    // Fail fast if AI service is not configured
    if (!genAI) {
        return res.status(503).json({ error: 'AI service not configured' });
    }
    try {
        const { imageBase64, mimeType } = req.body;

        if (!imageBase64 || !mimeType) {
            return res.status(400).json({ error: 'Missing image or mimeType' });
        }

        // Using gemini-2.5-flash (unified across all API routes)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
        You are an expert pharmacist and medical assistant built for the "Tibrah" health app.
        Please analyze this prescription image and extract the following information carefully in JSON format.
        Return ONLY valid JSON.
        
        Extract a list of medications. For each medication provide:
        - name: The name of the medication.
        - dosage: The dosage amount (e.g., "500mg").
        - frequency: How often to take it (e.g., "Twice a day", "Every 8 hours", "مرتين يوميا").
        - instructions: Any special instructions (e.g., "After meals", "Before bed", "بعد الأكل").
        
        Try to formulate the return in Arabic if the prescription contains Arabic. 
        If it's in English, you can keep the names in English but translate instructions to Arabic.
        
        Example Output Format:
        {
          "medications": [
             {
                "name": "Panadol Extract",
                "dosage": "500 mg",
                "frequency": "كل 8 ساعات",
                "instructions": "بعد الأكل عند اللزوم"
             }
          ]
        }
        `;

        const imagePart = {
            inlineData: {
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
                mimeType,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // Clean up markdown code blocks if the AI added them
        let cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const parsedData = JSON.parse(cleanJson);
            return res.status(200).json(parsedData);
        } catch (parseError) {
            console.error('Failed to parse AI JSON:', cleanJson);
            return res.status(500).json({ error: 'Failed to process AI response into JSON' });
        }

    } catch (error: any) {
        console.error('Prescription parser error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
