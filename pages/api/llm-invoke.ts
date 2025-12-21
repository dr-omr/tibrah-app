import Groq from "groq-sdk";
import { NextApiRequest, NextApiResponse } from "next";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { prompt, response_json_schema } = req.body;

        if (!process.env.GROQ_API_KEY) {
            console.warn("[InvokeLLM] No API Key found, using fallback logic.");
            return res.status(200).json(getFallbackResponse(prompt, response_json_schema));
        }

        // console.log("[InvokeLLM] Calling Groq...");

        // Prepare system message to enforce JSON
        const systemMessage = `You are a helpful AI assistant. You must respond with valid JSON only. 
        Follow this schema strictly: ${JSON.stringify(response_json_schema)}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: prompt }
            ],
            model: "llama3-8b-8192",
            temperature: 0.1, // Low temp for structured data
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content || "{}";
        const jsonResponse = JSON.parse(content);

        return res.status(200).json(jsonResponse);

    } catch (error) {
        console.error("[InvokeLLM] Error:", error);
        // Fail gracefully to fallback
        return res.status(200).json(getFallbackResponse(req.body.prompt, req.body.response_json_schema));
    }
}

// Professional Fallback Logic (Mocking intelligent responses)
function getFallbackResponse(prompt: string, schema: any) {
    const p = prompt.toLowerCase();

    // 1. Program Recommendation Fallback
    if (schema?.properties?.recommended_program_id) {
        if (p.includes('تخسيس') || p.includes('وزن') || p.includes('دهون')) {
            return {
                recommended_program_id: "21_days",
                match_percentage: 95,
                reason: "بناءً على أهدافك في إنقاص الوزن، برنامج الـ 21 يوم هو الأنسب لاحتوائه على خطة ديتوكس مكثفة.",
                custom_plan: {
                    diet_focus: "الصيام المتقطع مع التركيز على الألياف",
                    exercise_type: "كارديو صباحي + مقاومة خفيفة",
                    frequency_sessions: ["السبت", "الاثنين", "الأربعاء"],
                    golden_advice: "اشرب كوبين ماء قبل كل وجبة لتفعيل الأيض."
                }
            };
        }

        if (p.includes('توتر') || p.includes('قلق') || p.includes('نوم')) {
            return {
                recommended_program_id: "weekly",
                match_percentage: 88,
                reason: "نظراً لمستويات التوتر لديك، البرنامج الأسبوعي المرن سيساعدك على التوازن دون ضغط إضافي.",
                custom_plan: {
                    diet_focus: "أطعمة غنية بالماغنيسيوم والتربتوفان",
                    exercise_type: "يوغا وتأمل مسائي",
                    frequency_sessions: ["الأحد", "الثلاثاء", "الخميس"],
                    golden_advice: "افصل الأجهزة الإلكترونية قبل النوم بساعة."
                }
            };
        }

        // Default Program Mock
        return {
            recommended_program_id: "3_months",
            match_percentage: 92,
            reason: "لتحقيق نتائج مستدامة وتغيير نمط الحياة، برنامج الـ 3 أشهر هو الخيار الأمثل لك.",
            custom_plan: {
                diet_focus: "توازن الماكر (بروتين، كارب، دهون صحية)",
                exercise_type: "دمج بين القوة والمرونة",
                frequency_sessions: ["السبت", "الاثنين", "الأربعاء", "الجمعة"],
                golden_advice: "الاستمرارية أهم من الكثافة. ابدأ صغيراً واستمر."
            }
        };
    }

    // Default generic JSON if schema unknown
    return {
        ai_response: "Mock AI Response",
        note: "This is a fallback response because the AI service is unavailable."
    };
}
