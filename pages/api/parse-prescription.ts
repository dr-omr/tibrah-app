import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';

// IMPORTANT: Requires process.env.NEXT_PUBLIC_GEMINI_API_KEY or similar
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '');

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
    const { limited } = checkRateLimit(clientIp, 10, 60 * 1000);
    if (limited) {
        return res.status(429).json({ error: 'Too many requests', message: '⚠️ طلبات كثيرة لتفسير الوصفات، يرجى المحاولة بعد دقيقة' });
    }

    try {
        const { imageBase64, mimeType } = req.body;

        if (!imageBase64 || !mimeType) {
            return res.status(400).json({ error: 'Missing image or mimeType' });
        }

        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'API key not configured for AI' });
        }

        // Using gemini-1.5-flash as it's the recommended model for multimodal tasks
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
