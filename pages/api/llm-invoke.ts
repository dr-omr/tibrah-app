import { NextApiRequest, NextApiResponse } from "next";
import { checkRateLimit, getClientIp, sanitizeString } from '@/lib/apiMiddleware';
import { verifyApiSession } from '@/lib/verifySession';
import { getGeminiModel, getGroqClient, isGeminiConfigured, isGroqConfigured } from '@/lib/ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "OPTIONS") {
        res.setHeader("Allow", "POST");
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Rate limiting — 20 requests per minute
    const ip = getClientIp(req);
    const { limited, resetIn } = await checkRateLimit(ip, 20, 60 * 1000);
    if (limited) {
        return res.status(429).json({
            error: "Too many requests",
            message: "⚠️ طلبات كثيرة، يرجى المحاولة بعد دقيقة",
            success: false,
        });
    }

    // 🔒 Authentication required
    const session = await verifyApiSession(req);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized', success: false });
    }

    try {
        const { prompt, response_json_schema } = req.body;

        // Validate required input
        const sanitizedPrompt = sanitizeString(prompt, 10000);
        if (!sanitizedPrompt) {
            return res.status(400).json({ error: "Prompt is required", success: false });
        }

        // 🥇 Try Gemini first
        if (isGeminiConfigured) {
            try {
                const model = getGeminiModel({
                    temperature: 0.3,
                    maxOutputTokens: 1500,
                    responseMimeType: "application/json",
                });

                if (!model) throw new Error('Gemini model not available');

                const systemMessage = `You must respond with valid JSON only. Follow this schema strictly: ${JSON.stringify(response_json_schema)}`;
                const result = await model.generateContent(`${systemMessage}\n\n${sanitizedPrompt}`);
                const content = result.response.text();
                const jsonResponse = JSON.parse(content);

                return res.status(200).json(jsonResponse);
            } catch (geminiError: unknown) {
                console.error("[InvokeLLM] Gemini failed:", geminiError instanceof Error ? geminiError.message : geminiError);
            }
        }

        // 🥈 Fallback to Groq
        if (isGroqConfigured) {
            try {
                const groq = await getGroqClient();
                if (!groq) throw new Error('Groq client not available');
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
            } catch (groqError: unknown) {
                console.error("[InvokeLLM] Groq failed:", groqError instanceof Error ? groqError.message : groqError);
            }
        }

        // CQ-3 FIX: Return 503 with fallback flag instead of masking failure as 200
        console.warn("[InvokeLLM] All AI services failed, returning 503.");
        return res.status(503).json({ error: 'AI service unavailable', fallback: true, data: getFallbackResponse(prompt, response_json_schema) });

    } catch (error) {
        console.error("[InvokeLLM] Error:", error);
        return res.status(503).json({ error: 'AI service unavailable', fallback: true, data: getFallbackResponse(req.body.prompt, req.body.response_json_schema) });
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
