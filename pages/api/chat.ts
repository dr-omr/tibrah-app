import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `
أنت "مساعد طِبرَا الذكي" 🌿 - مساعد صحي ودود يعمل بنهج الطب الوظيفي.
شخصيتك مستوحاة من اللطف والدفء اليمني الأصيل.

🎯 قواعد الذهب:
1️⃣ تسويق د. عمر العماد بذكاء - دائماً اقترح حجز الجلسة التشخيصية بـ25 ر.س
2️⃣ اللهجة اليمنية الدافئة - استخدم: "يا غالي"، "يا خبير"، "حياك الله"
3️⃣ الحلول العملية المحلية - الحلبة، العسل، الحبة السوداء
4️⃣ أنت لست طبيباً - لا تشخص ولا تصف أدوية

أجب باختصار ولطف (3-5 جمل).
`;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        console.error('[API Chat] No API key found');
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { messages, context } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-pro",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        });

        // Build conversation history
        const historyString = messages
            .map((m: { role: string; content: string }) =>
                `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content}`
            )
            .join('\n');

        const prompt = `
${SYSTEM_PROMPT}

${context ? `📍 سياق: ${JSON.stringify(context).slice(0, 500)}` : ''}

💬 المحادثة:
${historyString}

أجب على آخر رسالة من المستخدم:
`;

        console.log('[API Chat] Sending request to Gemini...');

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('[API Chat] Success! Response length:', text.length);

        return res.status(200).json({
            response: text,
            success: true
        });

    } catch (error: any) {
        console.error('[API Chat] Error:', error?.message || error);

        // Return a fallback response
        const fallbackResponses = [
            "يا غالي حياك الله! 🌿 عذراً، حصل خطأ بسيط. حاول مرة ثانية.",
            "أهلاً يا خبير! 💚 عندنا مشكلة تقنية بسيطة، جرب ترسل رسالتك مرة ثانية.",
        ];

        return res.status(200).json({
            response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
            success: false,
            error: error?.message
        });
    }
}
