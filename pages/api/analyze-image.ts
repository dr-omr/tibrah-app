import { NextApiRequest, NextApiResponse } from "next";
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';
import { verifyApiSession } from '@/lib/verifySession';
import { genAI } from '@/lib/ai';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Align with Vercel's limit
        },
    },
};

const LAB_PROMPT = `
أنت "طبيب طِبرَا" 🩺 - خبير في قراءة التحاليل الطبية والأشعة.
مهمتك: تحليل الصورة المرفقة بذكاء، واستخراج أهم المعلومات منها.

القواعد:
1. حدد نوع المستند (فحوصات دم، أشعة، وصفة طبية، أو "ليس مستنداً طبياً").
2. إذا كان فحوصات دم: استخرج القيم غير الطبيعية (Abnormal) واشرح معناها ببساطة.
3. إذا كان دواء: اذكر استخدامه وطريقة أخذه العامة.
4. اللهجة: استخدم لهجة يمنية بيضاء ومطمئنة ("يا غالي"، "الأمور طيبة").
5. تحذير هام: دائماً اختم بـ "هذا رأي استرشادي، ولا يغني عن زيارة الطبيب".

تنسيق الإجابة:
- 📋 ملخص: (جملتين)
- 🔍 أهم الملاحظات: (نقاط)
- 💡 نصيحة: (نصيحة صحية بسيطة بناءً على النتيجة)
`;

const FACE_PROMPT = `
أنت مساعد ملاحظات عافية غير تشخيصي.
مهمتك: وصف ملاحظات ظاهرة عامة فقط من صورة الوجه أو اللسان مثل جودة الإضاءة، وضوح الصورة، الجفاف الظاهري، الإرهاق العام، أو الحاجة لتحسين ظروف التصوير.

القواعد:
1. لا تستنتج أمراضاً، ولا تنسب المظهر إلى الكبد أو الكلى أو الدم أو الحديد أو الهرمونات أو أي عضو داخلي.
2. لا تستخدم عبارات تشخيصية مثل "تشخيص الوجه" أو "تشخيص اللسان" أو "يكشف مرضاً".
3. لا تقترح علاجاً أو منتجاً أو إيقاف دواء بناءً على الصورة.
4. إذا ظهرت علامة مقلقة بوضوح، وجّه المستخدم لمراجعة مختص بدلاً من تفسيرها.
5. ابدأ الرد بهذا التحذير نصاً: "تحليل الصورة ليس تشخيصًا طبيًا ولا يكشف أمراض الأعضاء."
6. تنسيق الإجابة:
   - ملاحظة ظاهرة عامة:
   - ما لا يمكن استنتاجه من الصورة:
   - خطوة آمنة:

ملاحظة: إذا لم يكن هناك وجه أو لسان واضح، قل "يرجى التقاط صورة واضحة في إضاءة جيدة".
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Rate limiting — 10 image analyses per minute per IP
    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, 10, 60 * 1000);
    if (limited) {
        return res.status(429).json({
            error: 'Too many requests',
            message: '⚠️ طلبات كثيرة لتحليل الصور، يرجى المحاولة بعد دقيقة',
            success: false,
        });
    }

    // 🔒 Authentication required — medical image analysis must be protected
    const session = await verifyApiSession(req);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized', message: 'يرجى تسجيل الدخول أولاً', success: false });
    }

    try {
        const { imageBase64, mimeType, mode } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: "Image data is required" });
        }

        if (!genAI) {
            return res.status(503).json({ error: "AI service not configured", success: false });
        }

        // Select prompt based on mode
        const prompt = mode === 'face' ? FACE_PROMPT : LAB_PROMPT;

        // Use gemini-2.5-flash for speed and vision capabilities
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Prepare image part
        const imagePart = {
            inlineData: {
                data: imageBase64.split(',')[1] || imageBase64, // Remove header if present
                mimeType: mimeType || "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        const text = response.text();

        return res.status(200).json({ text });

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Gemini Vision Error:", errMsg);

        let errorMessage = "فشل تحليل الصورة، يرجى المحاولة مرة أخرى.";
        if (errMsg.includes("413") || errMsg.includes("too large")) {
            errorMessage = "حجم الصورة كبير جداً. يرجى استخدام صورة أصغر.";
        } else if (errMsg.includes("API_KEY")) {
            errorMessage = "خطأ في إعدادات النظام (API Key).";
        }

        return res.status(500).json({
            error: "Failed to analyze image",
            details: errorMessage,
            raw: process.env.NODE_ENV === 'development' ? errMsg : undefined
        });
    }
}
