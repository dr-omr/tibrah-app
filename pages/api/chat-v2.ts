import Groq from "groq-sdk";
import { NextApiRequest, NextApiResponse } from "next";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `أنت "مساعد طِبرَا الذكي" 🌿 - مساعد صحي ودود يعمل بنهج الطب الوظيفي.
شخصيتك مستوحاة من اللطف والدفء اليمني الأصيل.

🎯 قواعد الذهب:
1️⃣ تسويق د. عمر العماد بذكاء - دائماً اقترح حجز الجلسة التشخيصية بـ25 ر.س
2️⃣ اللهجة اليمنية الدافئة - استخدم: "يا غالي"، "يا خبير"، "حياك الله"
3️⃣ الحلول العملية المحلية - الحلبة، العسل، الحبة السوداء
4️⃣ أنت لست طبيباً - لا تشخص ولا تصف أدوية

أجب باختصار ولطف (3-5 جمل).`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // CORS headers
    // Debugging: Log the method
    // console.log(`[API] Request method: ${req.method}`);

    // Handle Preflight (OPTIONS)
    if (req.method === "OPTIONS") {
        res.setHeader("Allow", "POST");
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        console.log(`[API] Method not allowed: ${req.method}`);
        // DEBUG: Return the method to the user to see what's happening
        return res.status(200).json({
            text: `⚠️ خطأ تقني: وصل الطلب بعنوان "${req.method}" بدلاً من "POST". يرجى المحاولة من متصفح آخر أو تعطيل مانع الإعلانات.`
        });
    }



    try {
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        console.log("🤖 Groq Request:", message?.substring(0, 30) + "...");

        // Dynamic System Prompt Construction
        let dynamicPrompt = SYSTEM_PROMPT;
        if (context) {
            const healthInfo = context.healthProfile ?
                `\n👤 ملف المستخدم الصحي:\n- الحالة: ${context.healthProfile.condition}\n- الحيوية: ${context.healthProfile.vitalityScore}%\n- البرنامج الحالي: ${context.healthProfile.program}` : '';

            dynamicPrompt += `\n${healthInfo}\n\n⚠️ تذكر: استخدم هذه المعلومات لتخصيص نصائحك، لكن لا تشخص الحالة طبياً.`;
        }

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: dynamicPrompt },
                { role: "user", content: message }
            ],
            model: "llama3-8b-8192",
            temperature: 0.7,
            max_tokens: 1024,
        });

        const text = completion.choices[0]?.message?.content || "عذراً، لم أستطع الرد. جرب مرة ثانية.";

        // console.log("✅ Groq Response Success");
        return res.status(200).json({ text });

    } catch (error: any) {
        console.error("❌ GROQ ERROR (Switching to Local Brain):", error);

        // Local Fallback Logic
        try {
            const { getFallbackAdvice, getGeneralResponse } = require('../../lib/localBrain');
            const { message, context } = req.body; // Re-read body

            let fallbackResponse = "";

            // Prioritize Health Context advice if available and relevant specific keywords aren't present
            if (context?.healthProfile && (message.includes('نصيحة') || message.includes('وضع') || message.includes('تحليل'))) {
                const healthCtx = {
                    sleep: context.healthProfile.sleepHours, // Ensure mapping matches frontend
                    water: context.healthProfile.waterGlasses,
                    mood: context.healthProfile.moodScore,
                    stress: context.healthProfile.stressLevel
                };
                fallbackResponse = getFallbackAdvice(healthCtx);
            } else {
                fallbackResponse = getGeneralResponse(message || "");
            }

            return res.status(200).json({
                text: fallbackResponse,
                isLocalFallback: true
            });

        } catch (localError) {
            console.error("❌ FATAL local error:", localError);
            return res.status(200).json({
                text: "حياك الله يا غالي.. يبدو أن هناك مشكلة في الاتصال، لكن تذّكر دائماً: المعدة بيت الداء، والحمية رأس الدواء. طمني كيف صحتك اليوم؟"
            });
        }
    }
}
