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
    console.log(`[API] Request received: ${req.method} ${req.url}`);

    if (req.method !== "POST") {
        console.log(`[API] Method not allowed: ${req.method}`);
        return res.status(405).json({ error: "Method not allowed" });
    }



    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        console.log("🤖 Groq Request:", message?.substring(0, 30) + "...");

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: message }
            ],
            model: "llama3-8b-8192",
            temperature: 0.7,
            max_tokens: 1024,
        });

        const text = completion.choices[0]?.message?.content || "عذراً، لم أستطع الرد. جرب مرة ثانية.";

        console.log("✅ Groq Response Success");
        return res.status(200).json({ text });

    } catch (error: any) {
        console.error("❌ GROQ ERROR:", error);
        return res.status(500).json({
            error: "AI Service Error",
            details: error.message
        });
    }
}
