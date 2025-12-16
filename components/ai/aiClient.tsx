import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const AI_ENABLED = !!API_KEY;

const YEMENI_SYSTEM_PROMPT = `
أنت "مساعد طِبرَا الذكي" 🌿 - مساعد صحي ودود يعمل بنهج الطب الوظيفي.
شخصيتك مستوحاة من اللطف والدفء اليمني الأصيل.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ مهمتك الرئيسية: مساعدة المستخدمين صحياً + تسويق د. عمر العماد
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 قواعد الذهب (الأهم):

1️⃣ تسويق د. عمر العماد بذكاء:
   - عند أي سؤال صحي معقد: "يا غالي، هذا سؤال ممتاز! والله الدكتور عمر العماد هو اللي بيفيدك... متخصص في الطب الوظيفي ويعالج السبب الجذري مش بس الأعراض"
   - عند سؤال "من هو الدكتور؟": مدح حماسي + ذكر إنجازاته (300+ مريض، نسبة نجاح 87%)
   - دائماً اقترح حجز الجلسة التشخيصية بـ25 ر.س فقط!

2️⃣ اللهجة اليمنية الدافئة:
   - استخدم: "يا غالي"، "يا خبير"، "حياك الله"، "ما عليك"، "أبشر"، "والله عاد"، "ما شاء الله"
   - تجنب الفصحى الجامدة - كن كأنك صديق يمني يهتم بصحة صاحبه
   - استخدم الإيموجي بشكل معتدل 🌿💪

3️⃣ الحلول العملية المحلية:
   - اقترح أشياء متوفرة في اليمن: الحلبة، العسل، الحبة السوداء، الزنجبيل
   - نصائح بسيطة: المشي، النوم المبكر، الماء الدافئ
   - لا تقترح مكملات غالية أو غير متوفرة

4️⃣ الأمان والمسؤولية:
   - أنت لست طبيباً - لا تشخص ولا تصف أدوية أبداً
   - دائماً قل: "هذا رأي تثقيفي، والدكتور عمر هو اللي يقدر يشخصك بالضبط"
   - حالات الطوارئ: وجههم فوراً للمستشفى

5️⃣ أسلوب الرد:
   - ابدأ بترحيب دافئ أو تعاطف
   - اعطِ معلومة مفيدة قصيرة
   - اختم بتشجيع أو دعوة للحجز

مثال على الرد المثالي:
"يا غالي حياك الله! 🌿
هذا اللي تحكي عنه شكله من أعراض القولون العصبي...
جرب تشرب ماء دافئ مع ليمون على الريق، وامشِ 20 دقيقة يومياً.
بس والله ما أقدر أجزم لك من هنا - الدكتور عمر العماد هو اللي بيشخصك من الآخر.
الجلسة التشخيصية عنده بـ25 ر.س بس، وبتريح بالك! 💪"
`;

const DISCLAIMER = "هذا محتوى توعوي/تثقيفي، ولا يغني عن استشارة الطبيب أو المختص.";

// Fallback responses
const FALLBACK_SUGGESTIONS = [
    {
        focus_text: "يومك عافية يا بطل! 🌿 ركز اليوم على راحة بالك وتغذيتك.",
        suggestions: [
            "اشرب كاسة ماء دافئ مع ليمون على الريق",
            "حاول تتمشى 20 دقيقة في الهواء الطلق",
            "تنفس بعمق كلما حسيت بتوتر"
        ]
    },
    {
        focus_text: "صباح الشفاء يا غالي! ☀️ اليوم خلي جسمك يستريح.",
        suggestions: [
            "ابدأ يومك بكاسة ماء فاتر على الريق",
            "تناول فطور خفيف صحي (بيض مسلوق + خضار)",
            "خذ قسط كافي من النوم الليلة"
        ]
    },
    {
        focus_text: "والله ما شاء الله عليك! 💪 كل يوم جديد فرصة للتحسن.",
        suggestions: [
            "اشرب الحلبة - المعجزة اليمنية للهضم",
            "قلل السكر والخبز الأبيض اليوم",
            "خذ 10 دقائق للتأمل أو الاسترخاء"
        ]
    }
];

const FALLBACK_CHAT_RESPONSES = [
    "يا غالي حياك الله! 🌿 أنا مساعد طِبرَا الذكي، موجود لمساعدتك في أي سؤال صحي. كيف أخدمك اليوم؟",
    "أهلاً وسهلاً يا خبير! 💚 سعيد إنك تواصلت معنا. اسألني أي شي عن صحتك وأنا حاضر أفيدك.",
    "مرحباً يا غالي! 🌟 أنا هنا عشان أساعدك. قولي شو اللي يشغل بالك وأنا معاك."
];

// Get Gemini model
const getModel = () => {
    if (!genAI) return null;
    return genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
    });
};

export const aiClient = {
    isEnabled: () => AI_ENABLED,

    async generateSuggestions(context: any) {
        if (!AI_ENABLED) {
            const randomIndex = Math.floor(Math.random() * FALLBACK_SUGGESTIONS.length);
            return FALLBACK_SUGGESTIONS[randomIndex];
        }

        try {
            const model = getModel();
            if (!model) throw new Error('Model not initialized');

            const prompt = `
${YEMENI_SYSTEM_PROMPT}

بناءً على بيانات المستخدم:
${JSON.stringify(context)}

قم بتوليد:
1. فقرة "تركيز اليوم" (يمنية محببة ودافئة، جملة أو اثنتين)
2. 2-3 اقتراحات صحية بسيطة وعملية

الرد JSON فقط بدون أي نص إضافي:
{"focus_text": "string", "suggestions": ["string"]}
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error('Invalid JSON response');
        } catch (error) {
            console.error("AI Suggestions Error:", error);
            const randomIndex = Math.floor(Math.random() * FALLBACK_SUGGESTIONS.length);
            return FALLBACK_SUGGESTIONS[randomIndex];
        }
    },

    async summarize(text: string, contextType: string = 'general') {
        if (!AI_ENABLED) {
            return "ما شاء الله، رحلتك العلاجية تسير بخطى ثابتة! 🌟 استمرارك في المتابعة هو نصف العلاج.";
        }

        try {
            const model = getModel();
            if (!model) throw new Error('Model not initialized');

            const prompt = `
${YEMENI_SYSTEM_PROMPT}

قم بتلخيص النص التالي في سياق ${contextType}:
"${text}"

التلخيص يجب أن يكون:
- باللهجة اليمنية الدافئة
- مشجعاً وإيجابياً
- جملتين أو ثلاث فقط
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("AI Summarize Error:", error);
            return "ما شاء الله، رحلتك العلاجية تسير بخطى ثابتة! 🌟 استمرارك في المتابعة هو نصف العلاج.";
        }
    },

    async chat(messages: Array<{ role: string, content: string }>, contextData?: any, knowledgeBase?: any) {
        if (!AI_ENABLED) {
            const randomIndex = Math.floor(Math.random() * FALLBACK_CHAT_RESPONSES.length);
            return FALLBACK_CHAT_RESPONSES[randomIndex];
        }

        try {
            const model = getModel();
            if (!model) throw new Error('Model not initialized');

            // Build chat history
            const recentMessages = Array.isArray(messages) ? messages.slice(-6) : [];
            const contextString = contextData ? JSON.stringify(contextData).slice(0, 1500) : "";
            const kbString = knowledgeBase ? JSON.stringify(knowledgeBase).slice(0, 2000) : "";

            const historyString = recentMessages
                .map(m => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content}`)
                .join('\n');

            const prompt = `
${YEMENI_SYSTEM_PROMPT}

${kbString ? `📚 معلومات مرجعية عن د. عمر والخدمات:
${kbString}` : ''}

${contextString ? `📍 سياق الصفحة الحالية:
${contextString}` : ''}

💬 المحادثة:
${historyString}

⚡ تعليمات الرد:
- أجب باللهجة اليمنية الدافئة
- كن مختصراً ومفيداً (3-5 جمل كحد أقصى)
- إذا كان السؤال صحي: اعطِ نصيحة عامة + اقترح الجلسة التشخيصية
- استخدم الإيموجي باعتدال

أجب على آخر رسالة من المستخدم:
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("AI Chat Error:", error);

            // Try with simpler prompt
            try {
                const model = getModel();
                if (!model) throw error;

                const lastMessage = messages[messages.length - 1]?.content || "";
                const simplePrompt = `أنت مساعد طِبرَا الصحي باللهجة اليمنية. المستخدم يقول: "${lastMessage}". أجب باختصار ولطف.`;

                const result = await model.generateContent(simplePrompt);
                const response = await result.response;
                return response.text();
            } catch (retryError) {
                console.error("AI Chat Retry Error:", retryError);
                const randomIndex = Math.floor(Math.random() * FALLBACK_CHAT_RESPONSES.length);
                return FALLBACK_CHAT_RESPONSES[randomIndex];
            }
        }
    }
};

export const AI_DISCLAIMER = DISCLAIMER;
