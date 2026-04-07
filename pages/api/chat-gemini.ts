/**
 * Tibrah AI Assistant - Gemini Pro API
 * Enhanced AI with health context and conversation memory
 */

import { NextApiRequest, NextApiResponse } from "next";
import { checkRateLimit, getClientIp, sanitizeString } from '@/lib/apiMiddleware';
import { verifyApiSession } from '@/lib/verifySession';
import { genAI, getGroqClient, isGroqConfigured } from '@/lib/ai';

// System Prompt for Tibrah AI (Enhanced v2)
const TIBRAH_SYSTEM_PROMPT = `أنت "مساعد طِبرَا الذكي" 🌿 - طبيب وظيفي افتراضي ودود ومتخصص.
أنت تعمل ضمن تطبيق "طِبرَا" التابع لـ د. عمر العماد — أخصائي الطب الوظيفي.

🎭 شخصيتك:
- تتحدث بلهجة عربية دافئة ولطيفة مع لمسة يمنية
- تنادي المستخدم بـ "يا غالي" أو "يا عزيزي" أو "حبيبي"
- تستخدم إيموجي بشكل معتدل ومناسب
- ردودك واضحة ومنظمة (3-6 جمل) مع نقاط مرقمة عند الحاجة
- لديك حس دفء وتعاطف حقيقي مع المريض

🎯 تخصصاتك:
1. الطب الوظيفي - تعالج الأسباب الجذرية لا الأعراض فقط
2. التغذية العلاجية - الغذاء هو أول دواء
3. نمط الحياة الصحي - النوم، الحركة، إدارة التوتر
4. الطب التكاملي - الحكمة التقليدية مع العلم الحديث
5. صحة الأمعاء والميكروبيوم - محور الصحة
6. التوازن الهرموني - الغدة الدرقية والكظرية
7. المكملات الغذائية - فيتامينات ومعادن أساسية
8. الصحة النفسية والعلاقة بالجسد - الطب الشعوري

✅ قواعدك:
- قدم نصائح عملية يمكن تطبيقها فوراً
- اقترح العلاجات الطبيعية: العسل اليمني، الحبة السوداء، الحلبة، الكركم
- شجع على حجز جلسة تشخيصية مع د. عمر العماد (25 ر.س فقط) عند الحاجة
- أنت مساعد ذكي، لست بديلاً عن الطبيب — وضح ذلك
- اربط بين الأعراض والأسباب الجذرية المحتملة
- اقترح فحوصات مناسبة عند الضرورة

⛔ ممنوعات وإرشادات السلامة الطبية (App Store Guidelines):
- ⚠️ لا تقم بتشخيص أمراض خطيرة أبداً.
- ⚠️ لا تصف أدوية كيميائية أو جرعات محددة بتاتاً.
- ⚠️ في حالات الطوارئ (ألم صدر، نزيف، أفكار انتحارية) - وجه المريض فوراً لزيارة المستشفى أو طلب الإسعاف.
- ⚠️ يجب أن تذكر من حين لآخر (خاصة عند التوصيات الطبية) العبارة التالية: "هذه المعلومات للتوعية الصحية، ويجب استشارة طبيبك المعالج أو د. عمر العماد قبل تطبيقها".
- لا تعطي معلومات مضللة أو وعود بشفاء قاطع (Absolute Cures).`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Handle preflight
    if (req.method === "OPTIONS") {
        res.setHeader("Allow", "POST");
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Rate limiting — 30 requests per minute per IP
    const clientIp = getClientIp(req);
    const { limited } = await checkRateLimit(clientIp, 30, 60 * 1000); // 30 requests / minute
    if (limited) {
        return res.status(429).json({ error: "Too many requests", text: "⚠️ طلبات كثيرة، يرجى المحاولة بعد دقيقة", success: false });
    }

    // 🔒 Authentication required
    const session = await verifyApiSession(req);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized', text: 'يرجى تسجيل الدخول أولاً', success: false });
    }

    const { message, healthContext, history, aiMemoryContext } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
    }

    // Input validation: limit message length
    const sanitizedMessage = message.slice(0, 2000);

    console.log("🤖 [Tibrah AI] Incoming request:", sanitizedMessage.substring(0, 50));

    // Build context-aware prompt
    let contextPrompt = TIBRAH_SYSTEM_PROMPT;

    // Inject long-term AI health memory (conditions, medications, goals, etc.)
    if (aiMemoryContext && typeof aiMemoryContext === 'string') {
        contextPrompt += "\n" + aiMemoryContext.substring(0, 1000);
    }

    if (healthContext) {
        contextPrompt += "\n\n📋 بيانات المستخدم الصحية:";
        if (healthContext.name) contextPrompt += `\n- الاسم: ${healthContext.name}`;
        if (healthContext.waterToday) contextPrompt += `\n- شرب الماء اليوم: ${healthContext.waterToday} مل`;
        if (healthContext.sleepHours) contextPrompt += `\n- ساعات النوم: ${healthContext.sleepHours} ساعات`;
        if (healthContext.mood) contextPrompt += `\n- الحالة المزاجية: ${healthContext.mood}/10`;
        if (healthContext.weight) contextPrompt += `\n- الوزن: ${healthContext.weight} كجم`;
        if (healthContext.fastingHours) contextPrompt += `\n- ساعات الصيام: ${healthContext.fastingHours}`;
    }

    // Build conversation history for context memory (last 10 messages)
    const conversationHistory: { role: string; parts: { text: string }[] }[] = [];
    if (history && Array.isArray(history)) {
        const recentHistory = history.slice(-10);
        for (const msg of recentHistory) {
            conversationHistory.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        }
    }

    // 🥇 Try Gemini FIRST (upgraded to 2.0 Flash)
    if (genAI) {
        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: contextPrompt,
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 1500,
                    topP: 0.9,
                }
            });

            // Start chat with history for conversation memory
            const chat = model.startChat({
                history: conversationHistory,
            });

            const result = await chat.sendMessage(sanitizedMessage);

            const response = result.response;
            const text = response.text();

            if (text) {
                // Generate quick reply suggestions based on context
                const suggestions = generateSuggestions(message, text);
                return res.status(200).json({
                    text,
                    source: "gemini-2.5",
                    success: true,
                    suggestions
                });
            }
        } catch (geminiError: unknown) {
            console.error("❌ [Tibrah AI] Gemini FAILED:", geminiError instanceof Error ? geminiError.message : geminiError);
        }
    } else {
        console.log("⚠️ [Tibrah AI] No Gemini API key!");
    }

    // 🥈 Fallback to Groq
    if (isGroqConfigured) {
        try {
            console.log("🔄 [Tibrah AI] Trying Groq fallback...");

            const groq = await getGroqClient();
            if (!groq) throw new Error('Groq client not available');

            const groqMessages: { role: "system" | "user" | "assistant", content: string }[] = [
                { role: "system", content: contextPrompt }
            ];

            if (history && Array.isArray(history)) {
                const recentHistory = history.slice(-10);
                for (const msg of recentHistory) {
                    groqMessages.push({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.content
                    });
                }
            }

            // BUG-5 FIX: Always add current user message — history is past context only
            groqMessages.push({ role: "user", content: sanitizedMessage });

            const completion = await groq.chat.completions.create({
                messages: groqMessages,
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 1500,
            });

            const text = completion.choices[0]?.message?.content;

            if (text) {
                console.log("✅ [Tibrah AI] Groq SUCCESS!");
                const suggestions = generateSuggestions(message, text);
                return res.status(200).json({
                    text,
                    source: "groq",
                    success: true,
                    suggestions
                });
            }
        } catch (groqError: unknown) {
            console.error("❌ [Tibrah AI] Groq FAILED:", groqError instanceof Error ? groqError.message : groqError);
        }
    } else {
        console.log("⚠️ [Tibrah AI] No Groq API key!");
    }

    // 🥉 NO FAKE RESPONSES - Return clear error!
    console.error("💔 [Tibrah AI] All AI sources failed!");

    return res.status(503).json({
        error: "AI service unavailable",
        text: `⚠️ تعذر الاتصال بالذكاء الاصطناعي

**الحلول:**
1. تحقق من اتصالك بالإنترنت
2. أعد المحاولة بعد دقيقة
3. تواصل معنا على واتساب للمساعدة`,
        success: false
    });
}

/**
 * Generate contextual quick reply suggestions
 */
function generateSuggestions(userMessage: string, aiResponse: string): string[] {
    const msg = (userMessage + ' ' + aiResponse).toLowerCase();
    const suggestions: string[] = [];

    if (msg.includes('تغذي') || msg.includes('أكل') || msg.includes('طعام') || msg.includes('وجب')) {
        suggestions.push('🥗 ما هو أفضل نظام غذائي لي؟', '🍯 ما فوائد العسل اليمني؟', '⏰ ما رأيك بالصيام المتقطع؟');
    } else if (msg.includes('نوم') || msg.includes('أرق') || msg.includes('سهر')) {
        suggestions.push('🌙 نصائح لتحسين النوم', '🧘 تمارين استرخاء قبل النوم', '☕ هل الكافيين يؤثر على نومي؟');
    } else if (msg.includes('ألم') || msg.includes('صداع') || msg.includes('وجع')) {
        suggestions.push('💊 علاجات طبيعية للألم', '🏥 متى يجب زيارة الطبيب؟', '📅 أريد حجز جلسة تشخيصية');
    } else if (msg.includes('توتر') || msg.includes('قلق') || msg.includes('ضغط') || msg.includes('نفسي')) {
        suggestions.push('🧘 تقنيات تقليل التوتر', '🌿 أعشاب مهدئة طبيعية', '💪 تمارين تحسين المزاج');
    } else if (msg.includes('وزن') || msg.includes('تخسيس') || msg.includes('سمنة') || msg.includes('دهون')) {
        suggestions.push('⚖️ خطة إنقاص وزن صحية', '🏃 تمارين حرق الدهون', '🥑 أطعمة تسرع الأيض');
    } else if (msg.includes('صيام') || msg.includes('ديتوكس')) {
        suggestions.push('⏰ أفضل جدول للصيام المتقطع', '🥤 ماذا أشرب أثناء الصيام؟', '🍽️ ماذا آكل عند الإفطار؟');
    } else {
        suggestions.push('📋 حلل وضعي الصحي', '🩺 أريد جلسة مع د. عمر', '💊 ما المكملات المناسبة لي؟');
    }

    return suggestions;
}
