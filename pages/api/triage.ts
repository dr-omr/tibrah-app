import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || 'MISSING_KEY',
});

const SYSTEM_PROMPT = `أنت المساعد الذكي "طِبرَا" (Tibrah AI)، رفيق صحي استباقي ومتعاطف داخل تطبيق طِبرَا الطبي.
مهمتك:
1. الرد بتعاطف واحترافية باللغة العربية.
2. توجيه المستخدم للاستفادة من ميزات التطبيق بروابط مباشرة.
3. الإجابة يجب أن تكون موجزة جداً (بحد أقصى 3 جمل).

الميزات المتاحة وروابطها الدقيقة (استخدم صيغة الماركدون للروابط [اسم الميزة](الرابط)):
- لحجز استشارة طبية أو حجز طبيب: [حجز موعد](/book-appointment)
- لقراءة وتحليل وصفة طبية (روشتة) بالذكاء الاصطناعي: [الصيدلية الذكية](/smart-pharmacy)
- للمساعدة على النوم، الاسترخاء والصوتيات العلاجية: [التعافي والتأمل](/meditation)
- لتسجيل الحالة المزاجية أو الصحية اليومية: [التسجيل اليومي](/record-health)
- لتحليل الأعراض الطبية تفصيلياً: [تحليل الأعراض](/symptom-analysis)

لا تقدم تشخيصاً طبياً نهائياً، بل انصح دائماً بحجز موعد طبي إذا كانت الحالة تستدعي ذلك.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Rate limiting — 20 requests per minute
    const clientIp = getClientIp(req);
    const { limited } = checkRateLimit(clientIp, 20, 60 * 1000);
    if (limited) {
        return res.status(429).json({ error: 'Too many requests', message: '⚠️ طلبات كثيرة، يرجى المحاولة بعد دقيقة' });
    }

    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'بدون رسائل صالحة' });
        }

        const formattedMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map((m: any) => ({
                role: m.role,
                content: m.content
            }))
        ];

        const completion = await groq.chat.completions.create({
            messages: formattedMessages,
            model: "llama3-8b-8192", // Fast and capable for short triage
            temperature: 0.5,
            max_tokens: 300,
        });

        const reply = completion.choices[0]?.message?.content || 'عذراً، لم أتمكن من الرد.';
        
        return res.status(200).json({ reply });
    } catch (error: any) {
        console.error('Triage AI Error:', error);
        
        // Mock fallback for development if keys are not configured or limit reached
        if (error.message?.includes('401') || process.env.GROQ_API_KEY === undefined) {
            return res.status(200).json({ 
                reply: 'مرحباً، يبدو أن هناك مشكلة في إعدادات الاتصال بالذكاء الاصطناعي (API Key). جرب [حجز موعد](/book-appointment) أو استخدام [الصيدلية الذكية](/smart-pharmacy) من القائمة بدلاً من ذلك.' 
            });
        }

        return res.status(500).json({ error: 'حدث خطأ داخلي في الخادم' });
    }
}
