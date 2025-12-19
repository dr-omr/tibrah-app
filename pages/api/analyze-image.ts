import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextApiRequest, NextApiResponse } from "next";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

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
أنت "خبير الطب الشمولي والتشخيص بالوجه" 🧘‍♂️.
مهمتك: تحليل صورة وجه المستخدم أو لسانه لاستخراج مؤشرات صحية أولية (Face Map / Tongue Diagnosis).

القواعد:
1. ابحث عن علامات: شحوب (نقص حديد)، هالات سوداء (إرهاق كلى/سهر)، اصفرار (كبد)، جفاف بشرة (نقص ماء)، أو طبقة بيضاء على اللسان (مشاكل هضم).
2. لا تشخص أمراض خطيرة، فقط مؤشرات عامة (نقص فيتامينات، إرهاق، توتر).
3. اقترح "حلول طبيعية" فوراً (مثلاً: هالات سوداء -> اقترح النوم وتقليل الكافيين).
4. اللهجة: ودودة، محترمة، ومشجعة.
5. تنسيق الإجابة:
   - 👁️ *الملاحظات الظاهرة*: (مثلاً: بشرة جافة قليلاً تحت العين)
   - 🍂 *المعنى المحتمل*: (نقص ترطيب أو إرهاق)
   - 🌿 *النصيحة الذهبية*: (شرب ماء + منتج مقترح)

ملاحظة: إذا لم يكن هناك وجه واضح، قل "يرجى التقاط صورة واضحة للوجه في إضاءة جيدة".
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { imageBase64, mimeType, mode } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: "Image data is required" });
        }

        // Select prompt based on mode
        const prompt = mode === 'face' ? FACE_PROMPT : LAB_PROMPT;

        // Use standard gemini-1.5-flash for speed and vision capabilities
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    } catch (error: any) {
        console.error("Gemini Vision Error:", error);
        return res.status(500).json({
            error: "Failed to analyze image",
            details: error.message
        });
    }
}
