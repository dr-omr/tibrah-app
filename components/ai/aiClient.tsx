import { conversationStore } from '@/lib/ConversationStore';

// AI is now server-side only via /api/chat
const isEnabled = (): boolean => {
    // Always enabled - server handles API key check
    return true;
};

// Generate dynamic system prompt with user context
const getSystemPrompt = (userName?: string | null): string => {
    const userGreeting = userName ? `اسم المستخدم هو "${userName}" - استخدم اسمه في المحادثة بشكل طبيعي.` : '';

    return `
أنت "مساعد طِبرَا الذكي" 🌿 - مساعد صحي ودود يعمل بنهج الطب الوظيفي.
شخصيتك مستوحاة من اللطف والدفء اليمني الأصيل.

${userGreeting}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ مهمتك الرئيسية: مساعدة المستخدمين صحياً + تسويق د. عمر العماد
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 قواعد الذهب (الأهم):

1️⃣ تسويق د. عمر العماد بذكاء:
   - عند أي سؤال صحي معقد: "يا غالي، هذا سؤال ممتاز! والله الدكتور عمر العماد هو اللي بيفيدك..."
   - دائماً اقترح حجز الجلسة التشخيصية بـ25 ر.س فقط!

2️⃣ اللهجة اليمنية الدافئة:
   - استخدم: "يا غالي"، "يا خبير"، "حياك الله"، "ما عليك"
   - استخدم الإيموجي بشكل معتدل 🌿💪

3️⃣ الحلول العملية المحلية:
   - اقترح أشياء متوفرة: الحلبة، العسل، الحبة السوداء، الزنجبيل
   - نصائح بسيطة: المشي، النوم المبكر، الماء الدافئ

4️⃣ الأمان والمسؤولية:
   - أنت لست طبيباً - لا تشخص ولا تصف أدوية أبداً
   - دائماً قل: "هذا رأي تثقيفي، والدكتور عمر هو اللي يقدر يشخصك بالضبط"

5️⃣ تذكر المحادثات السابقة:
   - إذا ذكر المستخدم اسمه سابقاً، استخدمه
   - تذكر المواضيع التي ناقشتموها
`;
};

const DISCLAIMER = "هذا محتوى توعوي/تثقيفي، ولا يغني عن استشارة الطبيب أو المختص.";

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
    },
    {
        focus_text: "أهلاً وسهلاً يا خبير! 🌟 صحتك أمانة، اهتم بها.",
        suggestions: [
            "اشرب 8 أكواب ماء على الأقل اليوم",
            "تجنب الأكل الثقيل قبل النوم",
            "مارس تمارين التنفس العميق"
        ]
    }
];

const SMART_FALLBACK_RESPONSES: Record<string, string[]> = {
    'ألم|وجع|يؤلم': [
        "يا غالي، الألم هذا مزعج والله! 🌿 جرب الراحة والماء الدافئ، وإذا استمر أكثر من يومين، الدكتور عمر العماد يقدر يساعدك!",
        "حياك الله يا خبير! 💪 الألم شيء ما لازم تتحمله لحالك. جرب كمادات دافئة، وإذا ما تحسن، تواصل مع الدكتور عمر العماد."
    ],
    'نوم|أرق|أنام': [
        "يا غالي، النوم مهم جداً للشفاء! 😴 جرب تشرب شاي البابونج قبل النوم، وابتعد عن الجوال ساعة قبل ما تنام.",
        "ما عليك يا بطل! 🌙 للنوم الصحي: غرفة مظلمة، بدون شاشات، ونوم بوقت ثابت."
    ],
    'هضم|معدة|بطن|قولون': [
        "يا غالي، مشاكل الهضم منتشرة كثير! 🌿 جرب الحلبة على الريق، وتجنب الأكل الدسم.",
        "أبشر يا خبير! 💪 القولون يحتاج صبر وتغيير نمط الحياة. الماء الدافئ مع الليمون يساعد!"
    ],
    'طاقة|تعب|إرهاق': [
        "يا غالي، التعب له أسباب كثيرة! ☀️ تأكد إنك تشرب ماء كافي، وتنام 7-8 ساعات.",
        "ما عليك يا بطل! 💪 الطاقة تيجي من النوم الجيد، الأكل الصحي، والحركة."
    ],
    'default': [
        "يا غالي حياك الله! 🌿 أنا مساعد طِبرَا الذكي، موجود لمساعدتك في أي سؤال صحي.",
        "أهلاً وسهلاً يا خبير! 💚 سعيد إنك تواصلت معنا. اسألني أي شي عن صحتك.",
        "مرحباً يا غالي! 🌟 أنا هنا عشان أساعدك. قولي شو اللي يشغل بالك.",
        "حياك الله يا بطل! 💪 أنا مساعدك الصحي. إذا عندك أي سؤال، أنا جاهز أفيدك."
    ]
};

export const aiClient = {
    isEnabled,

    async generateSuggestions(context: any) {
        if (!isEnabled()) {
            const randomIndex = Math.floor(Math.random() * FALLBACK_SUGGESTIONS.length);
            return FALLBACK_SUGGESTIONS[randomIndex];
        }

        try {
            const model = getModel();
            if (!model) throw new Error('Model not initialized');

            const prompt = `
${getSystemPrompt()}

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
        if (!isEnabled()) {
            return "ما شاء الله، رحلتك العلاجية تسير بخطى ثابتة! 🌟";
        }

        try {
            const model = getModel();
            if (!model) throw new Error('Model not initialized');

            const prompt = `
${getSystemPrompt()}

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
            return "ما شاء الله، رحلتك العلاجية تسير بخطى ثابتة! 🌟";
        }
    },

    async chat(messages: Array<{ role: string, content: string }>, contextData?: any, knowledgeBase?: any) {
        const getSmartFallback = (userMessage: string): string => {
            for (const [pattern, responses] of Object.entries(SMART_FALLBACK_RESPONSES)) {
                if (pattern === 'default') continue;
                const regex = new RegExp(pattern, 'i');
                if (regex.test(userMessage)) {
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            }
            const defaults = SMART_FALLBACK_RESPONSES['default'];
            return defaults[Math.floor(Math.random() * defaults.length)];
        };

        const lastUserMessage = messages[messages.length - 1]?.content || '';

        conversationStore.startConversation();
        conversationStore.addMessage('user', lastUserMessage);

        try {
            console.log('[AI Client] Sending request to /api/chat...');

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: lastUserMessage
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || `API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.text) {
                console.log('[AI Client] ✅ Got response from API');
                conversationStore.addMessage('assistant', data.text);
                return data.text;
            }

            throw new Error('No text in response');

        } catch (error) {
            console.error('[AI Client] API Error:', error);
            const fallbackResponse = getSmartFallback(lastUserMessage);
            conversationStore.addMessage('assistant', fallbackResponse);
            return fallbackResponse;
        }
    },

    clearConversation() {
        conversationStore.clearCurrentConversation();
    },

    getConversationHistory() {
        return conversationStore.getCurrentConversation();
    }
};

export const AI_DISCLAIMER = DISCLAIMER;
