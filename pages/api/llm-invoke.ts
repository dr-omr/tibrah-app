import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextApiRequest, NextApiResponse } from "next";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { prompt, response_json_schema } = req.body;

        // 🥇 Try Gemini first
        if (GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 1500,
                        responseMimeType: "application/json",
                    }
                });

                const systemMessage = `You must respond with valid JSON only. Follow this schema strictly: ${JSON.stringify(response_json_schema)}`;
                const result = await model.generateContent(`${systemMessage}\n\n${prompt}`);
                const content = result.response.text();
                const jsonResponse = JSON.parse(content);

                return res.status(200).json(jsonResponse);
            } catch (geminiError: any) {
                console.error("[InvokeLLM] Gemini failed:", geminiError.message);
            }
        }

        // 🥈 Fallback to Groq
        if (process.env.GROQ_API_KEY) {
            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const systemMessage = `You are a helpful AI assistant. You must respond with valid JSON only. Follow this schema strictly: ${JSON.stringify(response_json_schema)}`;

                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemMessage },
                        { role: "user", content: prompt }
                    ],
                    model: "llama3-8b-8192",
                    temperature: 0.1,
                    response_format: { type: "json_object" }
                });

                const content = completion.choices[0]?.message?.content || "{}";
                const jsonResponse = JSON.parse(content);
                return res.status(200).json(jsonResponse);
            } catch (groqError: any) {
                console.error("[InvokeLLM] Groq failed:", groqError.message);
            }
        }

        // 🥉 Fallback response
        console.warn("[InvokeLLM] All AI services failed, using fallback.");
        return res.status(200).json(getFallbackResponse(prompt, response_json_schema));

    } catch (error) {
        console.error("[InvokeLLM] Error:", error);
        return res.status(200).json(getFallbackResponse(req.body.prompt, req.body.response_json_schema));
    }
}

function getFallbackResponse(prompt: string, schema: any) {
    const p = (prompt || '').toLowerCase();

    if (schema?.properties?.recommended_program_id) {
        if (p.includes('تخسيس') || p.includes('وزن') || p.includes('دهون')) {
            return {
                recommended_program_id: "21_days",
                match_percentage: 95,
                reason: "بناءً على أهدافك في إنقاص الوزن، برنامج الـ 21 يوم هو الأنسب.",
                custom_plan: {
                    diet_focus: "الصيام المتقطع مع التركيز على الألياف",
                    exercise_type: "كارديو صباحي + مقاومة خفيفة",
                    golden_advice: "اشرب كوبين ماء قبل كل وجبة لتفعيل الأيض."
                }
            };
        }
        return {
            recommended_program_id: "3_months",
            match_percentage: 92,
            reason: "لتحقيق نتائج مستدامة، برنامج الـ 3 أشهر هو الخيار الأمثل.",
            custom_plan: {
                diet_focus: "توازن الماكرو",
                exercise_type: "دمج بين القوة والمرونة",
                golden_advice: "الاستمرارية أهم من الكثافة."
            }
        };
    }

    return { ai_response: "تعذر الاتصال بالذكاء الاصطناعي", note: "يرجى المحاولة لاحقاً" };
}
