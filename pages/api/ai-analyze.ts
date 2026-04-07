/**
 * Tibrah AI - Unified Analysis API
 * Handles all AI-powered analysis requests across the app
 * Uses Gemini 2.5 Flash for all operations
 */

import { NextApiRequest, NextApiResponse } from "next";
import { checkRateLimit, getClientIp, sanitizeString } from '@/lib/apiMiddleware';
import { verifyApiSession } from '@/lib/verifySession';
import { getGeminiModel, isGeminiConfigured } from '@/lib/ai';

// Analysis types and their specialized prompts
const ANALYSIS_PROMPTS: Record<string, string> = {

    // ─── التحليل السريري والشعوري ───
    clinical_assessment: `أنت "خبير طِبرَا في الطب الوظيفي والطب الشعوري" 🩺🧘‍♂️.
مهمتك: تحليل التقييم السريري للمريض الذي يربط بين الأعراض الجسدية والحالة الشعورية.

القواعد:
1. حلل الأعراض الجسدية (الشكوى، والتاريخ المرضي).
2. اربط الأعراض بالحالة الشعورية أو الضغط النفسي (Psycho-neuro-immunology).
3. قدم تفسيراً علمياً وعميقاً يجمع بين الطب العضوي والطب الشعوري (Meta-Health).
4. اقترح مسار رعاية دقيق (علاج، مكملات، أو تأمل).
5. اللهجة: احترافية، طبية، وعطوفة جدًا.

أجب بـ JSON:
{
    "clinical_insight": "تحليل طبي دقيق وعلمي للأعراض الجسدية",
    "emotional_insight": "التفسير الشعوري والارتباط الجسدي بالضغط النفسي والصدمات",
    "holistic_advice": ["نصيحة شمولية 1", "نصيحة شمولية 2"],
    "recommended_path": "مسار الرعاية المقترح"
}`,

    // ─── تحليل الأعراض ───
    symptom_analysis: `أنت "طبيب طِبرَا الوظيفي" 🩺 — خبير في الطب الوظيفي والتكاملي.
مهمتك: تحليل الأعراض التي يصفها المستخدم وتقديم رأي استرشادي شامل.

القواعد:
1. حلل الأعراض من منظور الطب الوظيفي (الأسباب الجذرية).
2. اربط بين الأعراض المختلفة لاكتشاف النمط.
3. استخرج "النمط التشخيصي الشعوري" (Psychosomatic pattern) المحكم لهذه الأعراض.
4. اقترح فحوصات مناسبة.
5. قدم نصائح طبيعية فورية.

تنسيق الإجابة بـ JSON:
{
    "severity": "low|medium|high",
    "summary": "ملخص التحليل",
    "emotional_connection": "النمط التشخيصي الشعوري الموازي للأعراض",
    "root_causes": ["السبب 1", "السبب 2"],
    "related_systems": ["الجهاز الهضمي", "الجهاز العصبي"],
    "recommendations": ["نصيحة 1", "نصيحة 2"],
    "tests_suggested": ["فحص 1", "فحص 2"],
    "natural_remedies": ["علاج طبيعي 1", "علاج طبيعي 2"],
    "urgency_note": "ملاحظة عن مدى الاستعجال",
    "disclaimer": "هذا رأي استرشادي ولا يغني عن زيارة الطبيب"
}`,

    // ─── تحليل خريطة الجسد العاطفية ───
    body_map_analysis: `أنت "خبير الطب الشعوري وعلاقة الجسد بالمشاعر" 🧘‍♂️.
مهمتك: تحليل المنطقة المختارة من الجسد وعلاقتها بالمشاعر المكبوتة.

القواعد:
1. اشرح العلاقة بين المنطقة والمشاعر (META-Health).
2. قدم تمارين عملية للتحرر العاطفي.
3. اقترح تأكيدات إيجابية مخصصة.
4. اربط بالعلاجات الطبيعية المناسبة.

أجب بـ JSON:
{
    "emotional_connection": "شرح العلاقة العاطفية",
    "blocked_emotions": ["مشاعر مكبوتة"],
    "healing_exercises": ["تمرين 1", "تمرين 2"],
    "affirmations": ["تأكيد 1", "تأكيد 2"],
    "natural_support": ["دعم طبيعي 1", "دعم طبيعي 2"],
    "lifestyle_tips": ["نصيحة 1", "نصيحة 2"]
}`,

    // ─── تحليل البيانات الصحية ───
    health_data_analysis: `أنت "محلل البيانات الصحية الذكي" في تطبيق طِبرَا 📊.
مهمتك: تحليل البيانات الصحية للمستخدم واستخراج أنماط ورؤى ذكية.

القواعد:
1. حلل الاتجاهات (تحسن/تراجع/ثبات).
2. اكتشف الأنماط المخفية بين البيانات.
3. قدم نصائح مخصصة بناءً على البيانات.
4. حدد مجالات التحسين والإنجازات.

أجب بـ JSON:
{
    "overall_score": 75,
    "status": "good|fair|needs_attention",
    "trends": [{"metric": "النوم", "direction": "improving", "detail": "تحسن بنسبة 15%"}],
    "patterns": ["نمط 1", "نمط 2"],
    "achievements": ["إنجاز 1"],
    "concerns": ["ملاحظة 1"],
    "recommendations": ["نصيحة 1", "نصيحة 2"],
    "weekly_goals": ["هدف 1", "هدف 2"]
}`,

    // ─── تقرير صحي أسبوعي ───
    weekly_report: `أنت "مستشار الصحة الشخصي" في طِبرَا 📋.
مهمتك: إنشاء تقرير صحي أسبوعي شامل ومحفز.

أجب بـ JSON:
{
    "overall_grade": "A|B|C|D",
    "summary": "ملخص الأسبوع",
    "highlights": ["إنجاز 1", "إنجاز 2"],
    "areas_to_improve": ["مجال 1", "مجال 2"],
    "sleep_analysis": "تحليل النوم",
    "nutrition_analysis": "تحليل التغذية",
    "activity_analysis": "تحليل النشاط",
    "mood_analysis": "تحليل المزاج",
    "next_week_plan": ["خطة 1", "خطة 2"],
    "motivation": "رسالة تحفيزية"
}`,

    // ─── تحليل النوم ───
    sleep_analysis: `أنت "خبير النوم والإيقاع الحيوي" في طِبرَا 🌙.
حلل بيانات النوم وقدم رؤى ونصائح مخصصة.

أجب بـ JSON:
{
    "quality_score": 70,
    "pattern": "irregular|consistent|improving",
    "issues": ["مشكلة 1"],
    "root_causes": ["سبب محتمل 1"],
    "tips": ["نصيحة 1", "نصيحة 2"],
    "ideal_schedule": {"bedtime": "10:30 PM", "wakeup": "6:30 AM"},
    "supplements": ["مكمل مقترح 1"]
}`,

    // ─── تحليل المزاج ───
    mood_analysis: `أنت "خبير الصحة النفسية والعاطفية" في طِبرَا 🧠.
حلل بيانات المزاج واكتشف الأنماط وقدم نصائح.

أجب بـ JSON:
{
    "mood_trend": "improving|declining|stable",
    "average_score": 7,
    "triggers_identified": ["محفز 1"],
    "positive_patterns": ["نمط إيجابي 1"],
    "coping_strategies": ["استراتيجية 1", "استراتيجية 2"],
    "exercises": ["تمرين 1"],
    "affirmation": "تأكيد إيجابي مخصص"
}`,

    // ─── تخطيط الوجبات العلاجية ───
    meal_planning: `أنت "خبير التغذية العلاجية" في طِبرَا 🥗.
مهمتك: إنشاء خطة وجبات مخصصة وعلاجية صارمة بناءً على الأمراض المزمنة للمريض (مثل الهاشيموتو، السكري) وحساسية الطعام.

القواعد:
1. راعِ الحالة الصحية والأمراض المزمنة بدقة (أشر لسبب اختيار الوجبة طبياً).
2. استخدم أطعمة طبيعية متوفرة في المنطقة العربية.
3. قدم قائمة تسوق ذكية (Grocery List) بالمكونات العلاجية المطلوبة للأسبوع.

أجب بـ JSON:
{
    "daily_calories": 2000,
    "meals": [
        {"name": "الفطور", "time": "7:00", "foods": ["طعام 1"], "calories": 400, "benefits": "فائدة طبية لعلاج حالة المريض"}
    ],
    "snacks": [{"name": "وجبة خفيفة", "time": "3:00", "foods": ["طعام 1"]}],
    "hydration_plan": "خطة شرب الماء",
    "supplements": ["مكمل مقترح للتعافي"],
    "tips": ["نصيحة طبية 1"],
    "grocery_list": ["ورقيات خضراء", "سلمون بري", "زيت زيتون بكر"]
}`,

    // ─── تحليل الوصفات ───
    recipe_suggestion: `أنت "شيف طِبرَا الصحي" 👨‍🍳.
اقترح وصفات صحية مخصصة بناءً على البيانات الصحية والمكونات المتاحة.

أجب بـ JSON:
{
    "recipes": [
        {
            "name": "اسم الوصفة",
            "category": "فطور|غداء|عشاء|وجبة خفيفة",
            "prep_time": "15 دقيقة",
            "calories": 350,
            "ingredients": ["مكون 1", "مكون 2"],
            "steps": ["خطوة 1", "خطوة 2"],
            "health_benefits": "الفوائد الصحية",
            "suitable_for": ["صيام متقطع", "تخسيس"]
        }
    ]
}`,

    // ─── تحليل الملف الطبي ───
    medical_file_analysis: `أنت "طبيب طِبرَا الوظيفي" 🏥.
حلل بيانات الملف الطبي للمستخدم وقدم رؤية شاملة.

أجب بـ JSON:
{
    "health_overview": "نظرة عامة على الحالة الصحية",
    "risk_factors": ["عامل خطر 1"],
    "chronic_management": ["نصيحة لإدارة المزمن 1"],
    "medication_interactions": ["تفاعل دوائي محتمل"],
    "lifestyle_recommendations": ["نصيحة 1"],
    "tests_due": ["فحص مستحق 1"],
    "positive_indicators": ["مؤشر إيجابي 1"]
}`,

    // ─── توصيات الدورات ───
    course_recommendation: `أنت "مستشار التعلم الصحي" في طِبرَا 📚.
بناءً على بيانات المستخدم الصحية واهتماماته، اقترح الدورات الأنسب.

أجب بـ JSON:
{
    "recommended_courses": [
        {"id": "course_id", "reason": "سبب التوصية", "match_percentage": 95}
    ],
    "learning_path": ["مرحلة 1", "مرحلة 2"],
    "motivation": "رسالة تحفيزية"
}`,

    // ─── توصيات المنتجات ───
    product_recommendation: `أنت "خبير المنتجات الصحية" في طِبرَا 🌿.
بناءً على بيانات المستخدم الصحية، اقترح العلاجات الأنسب من الصيدلية والمكملات.

أجب بـ JSON:
{
    "recommended_products": [
        {"name": "اسم المنتج", "reason": "سبب التوصية", "priority": "high|medium|low"}
    ],
    "usage_instructions": "تعليمات الاستخدام",
    "expected_benefits": ["فائدة متوقعة 1"]
}`,

    // ─── تحليل الصيام ───
    fasting_analysis: `أنت "خبير الصيام المتقطع والديتوكس" في طِبرَا ⏰.
حلل بيانات الصيام وقدم نصائح مخصصة.

أجب بـ JSON:
{
    "fasting_score": 80,
    "pattern_analysis": "تحليل النمط",
    "optimization_tips": ["نصيحة 1"],
    "eating_window_suggestion": "نافذة الأكل المقترحة",
    "break_fast_foods": ["طعام مقترح للإفطار 1"],
    "hydration_during_fast": "نصيحة ترطيب",
    "benefits_achieved": ["فائدة محققة 1"]
}`,

    // ─── نصائح الحجز ───
    appointment_suggestion: `أنت "مساعد حجز المواعيد الذكي" في طِبرَا 📅.
بناءً على الأعراض والحالة الصحية، اقترح نوع الاستشارة الأنسب.

أجب بـ JSON:
{
    "suggested_type": "نوع الاستشارة المقترح",
    "reason": "لماذا هذا النوع",
    "preparation": ["تحضير 1 قبل الموعد"],
    "questions_to_ask": ["سؤال مقترح للطبيب 1"],
    "priority": "urgent|normal|follow_up"
}`
};

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

    // 🔒 Authentication required — medical AI endpoints must be protected
    const session = await verifyApiSession(req);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized', message: 'يرجى تسجيل الدخول أولاً', success: false });
    }

    if (!isGeminiConfigured) {
        return res.status(503).json({ error: "AI service not configured", success: false });
    }

    try {
        const { type, data, context } = req.body;

        // Validate analysis type
        const sanitizedType = sanitizeString(type, 100);
        if (!sanitizedType || !ANALYSIS_PROMPTS[sanitizedType]) {
            return res.status(400).json({
                error: "Invalid analysis type",
                valid_types: Object.keys(ANALYSIS_PROMPTS)
            });
        }

        const systemPrompt = ANALYSIS_PROMPTS[sanitizedType];

        // Build user message with context
        let userMessage = `البيانات للتحليل:\n${JSON.stringify(data, null, 2)}`;
        if (context) {
            userMessage += `\n\nسياق إضافي:\n${JSON.stringify(context, null, 2)}`;
        }

        const model = getGeminiModel({
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 2000,
            responseMimeType: "application/json",
        });

        if (!model) {
            return res.status(503).json({ error: "AI model not available", success: false });
        }

        const result = await model.generateContent(userMessage);
        const text = result.response.text();

        // Parse JSON response
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            // If JSON parsing fails, return raw text
            parsed = { raw_response: text };
        }

        return res.status(200).json({
            success: true,
            type,
            data: parsed,
            source: "gemini-2.5-flash"
        });

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error(`[AI Analyze] Error (${req.body?.type}):`, errMsg);

        if (errMsg.includes("429")) {
            return res.status(429).json({
                error: "Rate limit exceeded",
                success: false,
                message: "⚠️ تم تجاوز الحد المسموح، يرجى المحاولة بعد دقيقة"
            });
        }

        return res.status(500).json({
            error: "Analysis failed",
            success: false,
            message: "⚠️ تعذر إجراء التحليل، يرجى المحاولة مرة أخرى"
        });
    }
}
