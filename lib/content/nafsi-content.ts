// lib/content/nafsi-content.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Nafsi (Psychological) Tool Content
// ════════════════════════════════════════════════════════════════════════

import type {
    ToolContent,
    ProtocolContent, PracticeContent, TestContent,
    WorkshopContent, TrackerContent,
    ProtocolDay, ProtocolTask, PracticeStep,
    TestQuestion, TestResult,
    WorkshopSection, TrackerField,
} from './tool-content-types';

export const NAFSI_CONTENT: Record<string, ToolContent> = {
    'nafsi_anxiety_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'خفض مستوى القلق المزمن وإعادة الجهاز العصبي للتوازن',
        howItWorks: 'كل يوم: تنفس + تأمل + حركة + نقطة واحدة من التعلم.',
        completionMessage: 'أسبوع من العمل على جهازك العصبي — هذا استثمار في صحتك الحقيقية.',
        days: [
            {
                day: 1, title: 'الإشارة الأولى', subtitle: 'ابدأ بمجرد الملاحظة',
                tasks: [
                    { id: 'a1t1', text: 'عندما تشعر بقلق — لاحظه فقط: "أنا قلق الآن"', durationMinutes: 0, emoji: '👁️' },
                    { id: 'a1t2', text: 'تمرين 4-4-6 مرتين اليوم (صباح ومساء)', durationMinutes: 10, emoji: '🫁' },
                    { id: 'a1t3', text: 'احذف إشعاراً واحداً من هاتفك اليوم', durationMinutes: 0, emoji: '📵' },
                ],
            },
            {
                day: 2, title: 'تهدئة الجسم', subtitle: 'القلق في الجسم — هنا نبدأ',
                tasks: [
                    { id: 'a2t1', text: 'مسح جسدي 5 دقائق: أين تشعر بالتوتر؟', durationMinutes: 5, emoji: '🧘' },
                    { id: 'a2t2', text: 'إرخاء عضلي تدريجي: شدّ وأرخِ كل عضلة', durationMinutes: 10, emoji: '💪' },
                    { id: 'a2t3', text: 'مشي هادئ 15 دقيقة', durationMinutes: 15, emoji: '🚶' },
                ],
            },
            {
                day: 3, title: 'الأفكار المحفّزة', subtitle: 'ما الأفكار التي تُشعل قلقك؟',
                tasks: [
                    { id: 'a3t1', text: 'اكتب 3 أفكار قلق تتكرر عليك', durationMinutes: 5, emoji: '📝' },
                    { id: 'a3t2', text: 'لكل فكرة: هل هذا حقيقي الآن أم توقع مستقبلي؟', durationMinutes: 5, emoji: '🔍' },
                    { id: 'a3t3', text: 'تنفس 4-4-6 عشر مرات', durationMinutes: 5, emoji: '🫁' },
                ],
            },
            { day: 4, title: 'التأريض', subtitle: 'اجلب نفسك للحاضر', tasks: [{ id: 'a4t1', text: 'تمرين ٥-٤-٣-٢-١: ٥ أشياء تراها، ٤ تسمعها، ٣ تلمسها', durationMinutes: 5, emoji: '🌍' }, { id: 'a4t2', text: 'أمسك شيئاً بارداً: كوب ماء أو مكعب ثلج', durationMinutes: 0, emoji: '🧊' }, { id: 'a4t3', text: 'تنفس مع الانتباه للشم: روائح من حولك', durationMinutes: 5, emoji: '👃' }] },
            { day: 5, title: 'اليقين والسيطرة', subtitle: 'القلق يكره الغموض — نتعامل معه', tasks: [{ id: 'a5t1', text: 'ما الذي يمكنك التحكم فيه اليوم؟ اكتب ثلاثة', durationMinutes: 5, emoji: '✅' }, { id: 'a5t2', text: 'ما الذي لا تستطيع التحكم فيه؟ ضعه في «صندوق الله»', durationMinutes: 0, emoji: '📦' }, { id: 'a5t3', text: 'تنفس + تأمل 10 دقائق', durationMinutes: 10, emoji: '🧘' }] },
            { day: 6, title: 'الروتين والاستقرار', subtitle: 'الانتظام أكبر علاج للقلق', tasks: [{ id: 'a6t1', text: 'نم وصحَّ في نفس الوقت', durationMinutes: 0, emoji: '⏰' }, { id: 'a6t2', text: 'تناول 3 وجبات في أوقات منتظمة', durationMinutes: 0, emoji: '🍽️' }, { id: 'a6t3', text: 'تمرين تنفس قبل أي موقف مُحفّز للقلق', durationMinutes: 5, emoji: '🫁' }] },
            { day: 7, title: 'التقييم والمضيّ', subtitle: 'ما تغيّر هذا الأسبوع؟', tasks: [{ id: 'a7t1', text: 'قارن مستوى قلقك اليوم بالأسبوع الماضي (١-١٠)', durationMinutes: 0, emoji: '📊' }, { id: 'a7t2', text: 'أي أداة نجحت معك أكثر؟ احتفظ بها', durationMinutes: 0, emoji: '⭐' }, { id: 'a7t3', text: 'تنفس واشكر نفسك على الالتزام', durationMinutes: 5, emoji: '🙏' }] },
        ],
    },

    'nafsi_anxiety_practice': {
        type: 'practice',
        durationMinutes: 8,
        goal: 'تهدئة الجهاز العصبي بتنفس ومسح جسدي مدمج',
        intro: 'القلق يُسكن في الجسم قبل الرأس. هذا التمرين يُحرره من مكانه.',
        steps: [
            { index: 1, instruction: 'اجلس أو استلقِ — ضع يدك على صدرك', durationSeconds: 10 },
            { index: 2, instruction: 'تنفّس ببطء: 4 داخل، 4 حبس، 6 خروج — كرّر 3 مرات', durationSeconds: 42 },
            { index: 3, instruction: 'ابدأ من قدميك — أين تشعر بالتوتر في جسمك؟', durationSeconds: 20 },
            { index: 4, instruction: 'انتقل لساقيك — بطنك — صدرك — كتفيك — وجهك', durationSeconds: 60 },
            { index: 5, instruction: 'لكل منطقة متوترة: شدّها 5 ثوانٍ ثم أرخِها', durationSeconds: 60 },
            { index: 6, instruction: 'تنفّس 3 مرات عميقة مع الإحساس بالثقل والراحة', durationSeconds: 42 },
        ],
        closingNote: 'كلما مارست هذا أكثر، كلما أصبح جسمك أسرع في الاستجابة للتهدئة.',
        repeatSuggestion: 'صباحاً ومساءً — وعند أي لحظة قلق مفاجئة',
    },

    'nafsi_anxiety_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'متابعة مستوى القلق صباحاً ومساءً لرصد التحسن التدريجي',
        intro: 'الرصد المنتظم يُريك التحسن حتى لو كان بطيئاً.',
        insight: 'ابحث عن الأيام التي كان فيها القلق أخف — ماذا كنت تفعل بشكل مختلف؟',
        fields: [
            { id: 'morning_anxiety', label: 'قلق الصباح', emoji: '🌅', type: 'scale', min: 0, max: 10 },
            { id: 'evening_anxiety', label: 'قلق المساء', emoji: '🌙', type: 'scale', min: 0, max: 10 },
            { id: 'trigger', label: 'أبرز محفز اليوم', emoji: '⚡', type: 'choice', options: ['لا يوجد', 'عمل', 'علاقات', 'صحة', 'مال', 'مستقبل', 'أخرى'] },
            { id: 'coping', label: 'هل استخدمت أداة للتعامل مع القلق؟', emoji: '🛠️', type: 'choice', options: ['نعم — تنفس', 'نعم — تأمل', 'نعم — حركة', 'لا'] },
        ],
    },

    'nafsi_anxiety_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'قياس مستوى فرط استثارة الجهاز العصبي الآن',
        intro: 'هذا الاختبار يقيس درجة استثارة جهازك العصبي — هل هو في وضع "تأهب مستمر"؟',
        questions: [
            {
                id: 'aq1', text: 'كم مرة تشعر بقلق بدون سبب واضح خلال الأسبوع؟',
                options: [{ value: 0, label: 'نادراً أو أبداً' }, { value: 1, label: 'مرة أو مرتين' }, { value: 2, label: '3-4 مرات' }, { value: 3, label: 'يومياً تقريباً' }],
            },
            {
                id: 'aq2', text: 'هل تجد صعوبة في الاسترخاء حتى في أوقات الراحة؟',
                options: [{ value: 0, label: 'لا — استرخي بسهولة' }, { value: 1, label: 'أحياناً قليلاً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً — لا أستطيع' }],
            },
            {
                id: 'aq3', text: 'هل تعاني من أعراض جسدية عند القلق؟',
                options: [{ value: 0, label: 'لا أعراض جسدية' }, { value: 1, label: 'أحياناً توتر بسيط' }, { value: 2, label: 'ضربات قلب أو ضيق تنفس' }, { value: 3, label: 'أعراض شديدة — شبه نوبة' }],
            },
            {
                id: 'aq4', text: 'كيف يؤثر القلق على نومك؟',
                options: [{ value: 0, label: 'لا تأثير' }, { value: 1, label: 'أحياناً أصحو بأفكار' }, { value: 2, label: 'صعوبة في النوم بسببه' }, { value: 3, label: 'نوم سيء باستمرار' }],
            },
            {
                id: 'aq5', text: 'هل يؤثر القلق على علاقاتك أو عملك؟',
                options: [{ value: 0, label: 'لا تأثير واضح' }, { value: 1, label: 'قليلاً أحياناً' }, { value: 2, label: 'كثيراً — أتجنب مواقف' }, { value: 3, label: 'يُعطّل حياتي بوضوح' }],
            },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'استثارة منخفضة', message: 'جهازك العصبي مستقر نسبياً. بعض التقنيات البسيطة ستُثبّته أكثر.', nextStep: 'تمرين التنفس يومياً يكفي كوقاية ودعم.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'استثارة متوسطة', message: 'جهازك العصبي في حالة تأهب أعلى من المعتاد. هذا يستنزف طاقتك.', nextStep: 'ابدأ بروتوكول القلق 7 أيام مع تسجيل يومي.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'استثارة مرتفعة', message: 'جهازك العصبي في وضع "خطر مستمر". هذا يؤثر على صحتك الجسدية والنفسية.', nextStep: 'ابدأ البروتوكول فوراً + فكّر في جلسة مع متخصص قريباً.' },
        ],
    },

    'nafsi_anxiety_workshop': {
        type: 'workshop',
        durationMinutes: 8,
        goal: 'فهم كيف يضخّم التوتر الأعراض ويُديم الحلقة',
        intro: 'القلق المزمن ليس ضعفاً — هو جهاز إنذار معطوب يحتاج إعادة ضبط، لا إسكاتاً.',
        sections: [
            {
                title: 'الجهاز العصبي الودّي', emoji: '⚡',
                body: 'عندما يُدرك دماغك خطراً، يُشغّل الجهاز العصبي الودّي (fight-or-flight). يرتفع الأدرينالين، يتسارع القلب، يتوقف الهضم. هذا مفيد في الخطر الحقيقي — لكن في القلق المزمن يظل مُشغَّلاً دون توقف.',
            },
            {
                title: 'حلقة التوتر والأعراض', emoji: '🔄',
                body: 'القلق → أعراض جسدية (توتر، ضيق) → تفسير الأعراض كتهديد → مزيد من القلق. هذه الحلقة تُغذّي نفسها. الخروج منها يتطلب كسرها من أي نقطة: إما عبر الجسم (تنفس) أو العقل (إعادة التفسير).',
            },
            {
                title: 'العصب المبهم — مفتاح الهدوء', emoji: '🧘',
                body: 'العصب المبهم هو "كابح" الجهاز العصبي. التنفس البطيء العميق يُنشّطه مباشرة. لهذا التنفس ٤-٤-٦ ليس مجرد تقنية — هو تحفيز عصبي فيزيولوجي مثبت علمياً لخفض الاستثارة خلال دقائق.',
            },
        ],
        keyTakeaways: [
            'القلق ليس عدوك — هو نظام إنذار تعلّم العمل بشكل خاطئ',
            'التنفس البطيء هو الطريق الأسرع لهدوء الجهاز العصبي',
            'الحلقة تنكسر من أي نقطة — الجسم أو العقل أو السلوك',
        ],
        closingAction: 'ابدأ اليوم: تنفس 4-4-6 لمدة 5 دقائق وانتبه لتغيّر شعورك بعدها.',
    },

    'nafsi_psychosomatic_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'تحديد نمط العلاقة بين مشاعرك وأعراضك الجسدية',
        intro: 'الأعراض الجسدية بدون سبب عضوي واضح غالباً لها جذر نفسي. هذا الاختبار يُساعدك فهم هذا الارتباط.',
        questions: [
            { id: 'pq1', text: 'هل تلاحظ أن أعراضك الجسدية تزداد في أوقات الضغط؟', options: [{ value: 0, label: 'لا علاقة واضحة' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً تزداد مع الضغط' }] },
            { id: 'pq2', text: 'هل راجعت أطباء للأعراض ولم يجدوا سبباً عضوياً واضحاً؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'مرة واحدة' }, { value: 2, label: 'أكثر من مرة' }, { value: 3, label: 'عدة أطباء ولا تشخيص واضح' }] },
            { id: 'pq3', text: 'في أين "يسكن" توترك في جسمك عادةً؟', options: [{ value: 0, label: 'لا أشعر بتوتر جسدي' }, { value: 1, label: 'ألم بسيط أحياناً' }, { value: 2, label: 'في منطقة محددة دائماً' }, { value: 3, label: 'في عدة مناطق متغيرة' }] },
            { id: 'pq4', text: 'هل الأعراض تتحسن عندما تكون في بيئة هادئة ومريحة؟', options: [{ value: 0, label: 'لا — مستمرة' }, { value: 1, label: 'أحياناً قليلاً' }, { value: 2, label: 'نعم — تتحسن وضوحاً' }, { value: 3, label: 'نعم — تختفي تماماً في الراحة' }] },
            { id: 'pq5', text: 'هل عندك مشاعر أو تجارب لم تعالجها بعد؟', options: [{ value: 0, label: 'لا — أعالج مشاعري جيداً' }, { value: 1, label: 'ربما قليلاً' }, { value: 2, label: 'نعم — أشياء محددة' }, { value: 3, label: 'نعم — الكثير' }] },
        ],
        results: [
            { minScore: 0, maxScore: 5, level: 'low', title: 'ارتباط نفسجسدي خفيف', message: 'قد يكون هناك بعض التأثير النفسي لكنه ليس الجذر الرئيسي.', nextStep: 'استمر في تقنيات الوعي الجسدي كوقاية.' },
            { minScore: 6, maxScore: 10, level: 'moderate', title: 'ارتباط نفسجسدي واضح', message: 'الأعراض مرتبطة بالحالة النفسية — الوعي الجسدي سيساعد كثيراً.', nextStep: 'ابدأ بروتوكول فك الارتباط النفسجسدي.' },
            { minScore: 11, maxScore: 15, level: 'high', title: 'أعراض نفسجسدية مزمنة', message: 'الجسم يحمل مشاعر غير معالجة — هذا شائع وقابل للتحسن.', nextStep: 'ابدأ البروتوكول + فكّر في جلسة مع معالج متخصص في العلاج الجسدي.' },
        ],
    },

    'nafsi_psychosomatic_practice': {
        type: 'practice',
        durationMinutes: 8,
        goal: 'تقنية المسح الجسدي — الاستماع للجسد بوعي كامل',
        intro: 'المسح الجسدي يكشف أين التوتر مخزّن ويبدأ عملية التحرر منه.',
        steps: [
            { index: 1, instruction: 'اجلس براحة — أغمض عينيك أو خفّف النظر', durationSeconds: 15 },
            { index: 2, instruction: 'ابدأ من قدميك: ماذا تشعر؟ برود؟ دفء؟ توتر؟ ألم؟', durationSeconds: 30 },
            { index: 3, instruction: 'انتقل ببطء للساقين والبطن — لاحظ بدون تغيير أو حكم', durationSeconds: 30 },
            { index: 4, instruction: 'الصدر والكتفان — هل هناك ضيق أو ثقل؟ سمّه فقط', durationSeconds: 30 },
            { index: 5, instruction: 'الرقبة والرأس — أي جزء يحمل أكثر توتر؟', durationSeconds: 20 },
            { index: 6, instruction: 'تنفس نحو المنطقة الأكثر توتراً — تخيّل التنفس يُذيبها', durationSeconds: 60 },
            { index: 7, instruction: 'تنفس عميق 3 مرات — ثم افتح عينيك ببطء', durationSeconds: 20 },
        ],
        closingNote: 'الجسم يعرف ما تحمله. الاستماع له هو الخطوة الأولى في العلاج.',
        repeatSuggestion: 'مرتين يومياً — صباحاً وقبل النوم — لأفضل نتيجة',
    },

    'nafsi_psychosomatic_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'فصل الأعراض الجسدية عن الحالة النفسية عبر الوعي الجسدي التدريجي',
        howItWorks: 'أسبوع: استماع + تسمية + تنفس + كتابة + حركة = تحرير تدريجي للمشاعر المخزّنة.',
        completionMessage: 'أسبوع من الاستماع لجسدك — الجسم بدأ يتكلم بلغة مفهومة.',
        days: [
            { day: 1, title: 'الاستماع الأول', subtitle: 'ماذا يقول جسمك الآن؟', tasks: [
                { id: 'ps1t1', text: 'مسح جسدي 8 دقائق — سجّل أين التوتر والألم', durationMinutes: 8, emoji: '🧘' },
                { id: 'ps1t2', text: 'اكتب: ما الأعراض الجسدية التي تُزعجك أكثر؟', durationMinutes: 5, emoji: '📝' },
                { id: 'ps1t3', text: 'تنفس عميق 4-4-6 عشر مرات', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 2, title: 'الربط الأول', subtitle: 'ما المشاعر المرافقة للأعراض؟', tasks: [
                { id: 'ps2t1', text: 'سجّل: عند ظهور العرض — ما الشعور السائد؟', durationMinutes: 5, emoji: '🔗' },
                { id: 'ps2t2', text: 'تمرين عجلة المشاعر — سمّ ما تشعر بدقة', durationMinutes: 5, emoji: '🎡' },
                { id: 'ps2t3', text: 'مشي هادئ 15 دقيقة', durationMinutes: 15, emoji: '🚶' },
            ]},
            { day: 3, title: 'التنفس العلاجي', subtitle: 'تُنفس نحو مكان الألم', tasks: [
                { id: 'ps3t1', text: 'حدد منطقة الألم/التوتر', durationMinutes: 2, emoji: '📍' },
                { id: 'ps3t2', text: 'تنفس 10 مرات بتصوّر الهواء يصل لها ويُليّنها', durationMinutes: 5, emoji: '🫁' },
                { id: 'ps3t3', text: 'إرخاء عضلي تدريجي 10 دقائق', durationMinutes: 10, emoji: '💪' },
            ]},
            { day: 4, title: 'الكتابة العلاجية', subtitle: 'أعطِ المشاعر كلمات', tasks: [
                { id: 'ps4t1', text: 'اكتب: «هذا الألم في جسدي يحمل مشاعر...»', durationMinutes: 10, emoji: '✍️' },
                { id: 'ps4t2', text: 'لا تُعدّل — اكتب بحرية كاملة', durationMinutes: 0, emoji: '📝' },
                { id: 'ps4t3', text: 'تنفس 5 دقائق بعد الكتابة', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 5, title: 'الحركة التعبيرية', subtitle: 'حرّك ما يؤلم', tasks: [
                { id: 'ps5t1', text: 'تمدد لطيف للمناطق المشدودة 10 دقائق', durationMinutes: 10, emoji: '🤸' },
                { id: 'ps5t2', text: 'مشي في الطبيعة 20 دقيقة', durationMinutes: 20, emoji: '🌳' },
                { id: 'ps5t3', text: 'مسح جسدي قصير بعد الحركة — لاحظ التغيير', durationMinutes: 5, emoji: '🧘' },
            ]},
            { day: 6, title: 'الرسالة من الجسد', subtitle: 'ماذا يحاول جسمك أن يقول؟', tasks: [
                { id: 'ps6t1', text: 'اكتب رسالة «من» منطقة الألم إليك', durationMinutes: 10, emoji: '📨' },
                { id: 'ps6t2', text: 'ماذا يحتاج هذا الجزء منك؟ (راحة؟ تعبير؟ انتباه؟)', durationMinutes: 5, emoji: '🔍' },
                { id: 'ps6t3', text: 'أعطِه ما يحتاج — حتى رمزياً', durationMinutes: 5, emoji: '🤲' },
            ]},
            { day: 7, title: 'التقييم والخريطة', subtitle: 'ما الذي اكتشفته؟', tasks: [
                { id: 'ps7t1', text: 'قارن الأعراض الجسدية يوم 1 ويوم 7', durationMinutes: 3, emoji: '📊' },
                { id: 'ps7t2', text: 'اكتب خريطتك: شعور ← مكان في الجسد ← ما يُساعد', durationMinutes: 10, emoji: '🗺️' },
                { id: 'ps7t3', text: 'إذا الأعراض استمرت: فكّر في معالج جسدي-نفسي', durationMinutes: 0, emoji: '🏥' },
            ]},
        ],
    },

    'nafsi_psychosomatic_workshop': {
        type: 'workshop',
        durationMinutes: 10,
        goal: 'فهم كيف تُخزّن الأحداث العاطفية في الجسد كأعراض',
        intro: 'العلم الحديث يُثبت: الجسد لا ينفصل عن المشاعر — هو سجل كل ما مررت به.',
        sections: [
            { title: 'الجسد لا ينسى', emoji: '🧠', body: 'بحسب أبحاث Bessel van der Kolk وغيره — الصدمات والمشاعر غير المعالجة تُخزَّن حرفياً في الأنسجة والعضلات. هذا يُفسّر لماذا بعض الأعراض الجسدية (صداع، آلام عضلية، غثيان) تظهر بدون سبب عضوي واضح.' },
            { title: 'العلاقة بين المشاعر والأجهزة', emoji: '🔗', body: 'التوتر والحزن → ضيق صدر وصعوبة تنفس. القلق والخوف → اضطراب هضمي. الغضب المكتوم → صداع وتوتر رقبة. المشاعر تبحث عن منفذ — إذا لم تُعالَج أذهنياً تجد طريقها عبر الجسد.' },
            { title: 'الشفاء عبر الجسد', emoji: '🌱', body: 'الأساليب الجسدية كالمسح الجسدي والتنفس العميق والحركة تُساعد في "تحرير" المشاعر المخزّنة. هذا ليس سحراً — هو فسيولوجيا: الحركة والتنفس يُنشّطان الجهاز العصبي الودّي ويُطلقان المشاعر بأمان.' },
        ],
        keyTakeaways: [
            'الأعراض النفسجسدية حقيقية وليست "وهماً في الرأس"',
            'الوعي الجسدي وحده يساعد — لا تحتاج أن "تفهم" كل شيء',
            'الجسد يتحدث — الأعراض هي رسائل وليست أعداء',
        ],
        closingAction: 'اليوم: اكتب ثلاثة أسطر عن أكثر شعور يُسبب لك عرضاً جسدياً.',
    },

    'nafsi_psychosomatic_tracker': {
        type: 'tracker',
        durationMinutes: 3,
        goal: 'ربط يومي: ما مشاعرك ← ما أعراضك — لاكتشاف الأنماط',
        intro: 'هذا السجل يُساعدك ترى الارتباط بوضوح بعد أيام قليلة.',
        insight: 'حين ترى الارتباط بعينيك، يبدأ العرض يفقد قوته — الوعي يُضعف الأعراض النفسجسدية.',
        fields: [
            { id: 'tension_level', label: 'مستوى التوتر الجسدي الآن', emoji: '🧠', type: 'scale', min: 1, max: 10 },
            { id: 'symptom_today', label: 'ما الأعراض الجسدية اليوم؟', emoji: '🔍', type: 'choice', options: ['لا أعراض', 'صداع', 'آلام عضلية', 'ضيق صدر', 'غثيان', 'إجهاق', 'آلام بطن', 'أخرى'] },
            { id: 'emotion_today', label: 'ما المشاعر السائدة اليوم؟', emoji: '❤️', type: 'choice', options: ['هادئ', 'قلق', 'حزين', 'غاضب', 'مرهق', 'سعيد', 'مرتبك', 'أخرى'] },
            { id: 'link_noticed', label: 'هل لاحظت ارتباطاً بين مشاعرك وأعراضك اليوم؟', emoji: '🔗', type: 'boolean' },
            { id: 'note', label: 'ملاحظة (اختياري)', emoji: '📝', type: 'text' },
        ],
    },

    'nafsi_suppress_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'تقييم مستوى كبت المشاعر والضغط المزمن',
        intro: 'كبت المشاعر يُخزّنها في الجسم — هذا الاختبار يكشف مدى ذلك.',
        questions: [
            { id: 'su1', text: 'هل تجد صعوبة في التعبير عن مشاعرك الحقيقية؟', options: [{ value: 0, label: 'لا — أعبّر بحرية' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً — أكبت كل شيء' }] },
            { id: 'su2', text: 'هل تشعر بتوتر جسدي مستمر (رقبة، فك، كتف)؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً' }] },
            { id: 'su3', text: 'هل تجد نفسك \"تتماسك\" أمام الناس ثم تنهار وحدك؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'نادراً' }, { value: 2, label: 'أحياناً' }, { value: 3, label: 'هذا نمطي الدائم' }] },
            { id: 'su4', text: 'هل الضغط في حياتك (عمل، علاقات، مسؤوليات) مستمر بلا راحة؟', options: [{ value: 0, label: 'لا — عندي توازن' }, { value: 1, label: 'ضغط خفيف' }, { value: 2, label: 'ضغط مستمر' }, { value: 3, label: 'مُنهك — لا أستطيع الراحة' }] },
            { id: 'su5', text: 'هل تشعر بالذنب عندما تأخذ وقتاً لنفسك؟', options: [{ value: 0, label: 'لا — أعتني بنفسي' }, { value: 1, label: 'قليلاً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً — الآخرون أولاً' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'تعبير عاطفي صحي', message: 'تعبيرك عن مشاعرك جيد — استمر في الوعي الذاتي.', nextStep: 'مارس الكتابة العلاجية كوقاية.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'كبت عاطفي متوسط', message: 'هناك مشاعر مكتومة تؤثر على جسمك — الوعي هو أول الحل.', nextStep: 'ابدأ بروتوكول التعبير 7 أيام.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'كبت عاطفي مزمن', message: 'المشاعر المخزّنة تُسبب أعراضاً جسدية حقيقية — تحتاج تحريرها.', nextStep: 'ابدأ البروتوكول + فكّر في معالج نفسي.' },
        ],
    },

    'nafsi_suppress_practice': {
        type: 'practice',
        durationMinutes: 10,
        goal: 'كتابة علاجية: تفريغ المشاعر المكبوتة على الورق',
        intro: 'الكتابة العلاجية تُحرر ما تكبته — لا تحتاج أن تكون كاتباً.',
        steps: [
            { index: 1, instruction: 'خذ ورقة وقلم أو افتح تطبيق ملاحظات', durationSeconds: 15 },
            { index: 2, instruction: 'اكتب: \"ما لم أقله لأحد هذا الأسبوع هو...\"', durationSeconds: 120 },
            { index: 3, instruction: 'لا تُعدّل ولا تحكم — فقط اكتب ما يأتي', durationSeconds: 60 },
            { index: 4, instruction: 'اكتب: \"الشعور الذي أكبته أكثر هو...\"', durationSeconds: 90 },
            { index: 5, instruction: 'اقرأ ما كتبته — تنفس 3 مرات عميقة', durationSeconds: 30 },
            { index: 6, instruction: 'إذا أردت: مزّق الورقة. التحرير ليس في الاحتفاظ.', durationSeconds: 15 },
        ],
        closingNote: 'الكتابة تُحرر الضغط المخزّن — حتى لو لم يقرأها أحد.',
        repeatSuggestion: 'كل مساء — 10 دقائق كتابة حرة بدون حكم',
    },

    'nafsi_suppress_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'فتح قنوات التعبير العاطفي المغلقة تدريجياً',
        howItWorks: 'كل يوم: كتابة + تنفس + حركة تعبيرية — فتح تدريجي.',
        completionMessage: 'أسبوع من فتح ما أغلقته — هذه شجاعة حقيقية.',
        days: [
            { day: 1, title: 'الأذن الأولى', subtitle: 'استمع لنفسك — من دون حكم', tasks: [
                { id: 'sp1t1', text: 'اكتب: ما الشعور السائد عندي الآن؟ سمّه.', durationMinutes: 5, emoji: '📝' },
                { id: 'sp1t2', text: 'تنفس 4-4-6 خمس مرات', durationMinutes: 5, emoji: '🫁' },
                { id: 'sp1t3', text: 'لاحظ أين في جسمك يسكن هذا الشعور', durationMinutes: 3, emoji: '👁️' },
            ]},
            { day: 2, title: 'التعبير الآمن', subtitle: 'اكتب ما لا تقوله', tasks: [
                { id: 'sp2t1', text: 'كتابة علاجية حرة 10 دقائق', durationMinutes: 10, emoji: '✍️' },
                { id: 'sp2t2', text: 'مشي 15 دقيقة مع التفكير فيما كتبته', durationMinutes: 15, emoji: '🚶' },
                { id: 'sp2t3', text: 'تنفس عميق قبل النوم', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 3, title: 'الجسد يتحدث', subtitle: 'حرّك ما تكبته', tasks: [
                { id: 'sp3t1', text: 'رقص حر أو حركة عشوائية 5 دقائق — وحدك', durationMinutes: 5, emoji: '💃' },
                { id: 'sp3t2', text: 'اصرخ في وسادة إن احتجت — أطلق الطاقة', durationMinutes: 2, emoji: '😤' },
                { id: 'sp3t3', text: 'تأمل مسح جسدي 5 دقائق', durationMinutes: 5, emoji: '🧘' },
            ]},
            { day: 4, title: 'القول الصغير', subtitle: 'عبّر عن شيء صغير لشخص', tasks: [
                { id: 'sp4t1', text: 'أخبر شخصاً واحداً كيف تشعر — صادقاً', durationMinutes: 5, emoji: '💬' },
                { id: 'sp4t2', text: 'سجّل كيف شعرت بعد التعبير', durationMinutes: 3, emoji: '📝' },
                { id: 'sp4t3', text: 'تنفس عميق 5 دقائق', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 5, title: 'الحدود', subtitle: 'قول \"لا\" شكل من التعبير', tasks: [
                { id: 'sp5t1', text: 'قل \"لا\" لشيء واحد اليوم — بلطف', durationMinutes: 0, emoji: '🛑' },
                { id: 'sp5t2', text: 'اكتب: ما الذي أحتاجه ولا أطلبه؟', durationMinutes: 5, emoji: '📝' },
                { id: 'sp5t3', text: 'مشي + تنفس 15 دقيقة', durationMinutes: 15, emoji: '🚶' },
            ]},
            { day: 6, title: 'المشاعر والجسم', subtitle: 'ربط ما تشعر بما يؤلمك', tasks: [
                { id: 'sp6t1', text: 'اكتب: ما الأعراض الجسدية التي تزيد مع الكبت؟', durationMinutes: 5, emoji: '🔗' },
                { id: 'sp6t2', text: 'تنفس نحو منطقة الألم/التوتر في جسمك', durationMinutes: 5, emoji: '🫁' },
                { id: 'sp6t3', text: 'تأمل 10 دقائق', durationMinutes: 10, emoji: '🧘' },
            ]},
            { day: 7, title: 'التقييم', subtitle: 'ما تغيّر هذا الأسبوع؟', tasks: [
                { id: 'sp7t1', text: 'هل أصبح التعبير أسهل؟ سجّل (1-10)', durationMinutes: 3, emoji: '📊' },
                { id: 'sp7t2', text: 'هل خفّت الأعراض الجسدية؟', durationMinutes: 3, emoji: '🔍' },
                { id: 'sp7t3', text: 'ما الأداة التي ساعدتك أكثر؟ احتفظ بها', durationMinutes: 3, emoji: '⭐' },
            ]},
        ],
    },

    'nafsi_suppress_workshop': {
        type: 'workshop',
        durationMinutes: 10,
        goal: 'فهم كيف يتحول الكبت العاطفي إلى أعراض جسدية',
        intro: 'المشاعر المكبوتة لا تختفي — تبحث عن منفذ آخر: جسمك.',
        sections: [
            { title: 'لماذا نكبت؟', emoji: '🔇', body: 'منذ الطفولة تعلّمنا: \"لا تبكِ\"، \"كن قوياً\"، \"لا تُزعج\". هذه الرسائل تُبرمجنا لإغلاق المشاعر. المشكلة: الجسم لا يملك هذا الزر. المشاعر المكتومة تتحول لتوتر عضلي، ألم مزمن، ضيق صدر، ومشاكل هضمية.' },
            { title: 'خريطة الكبت الجسدية', emoji: '🗺️', body: 'الغضب المكبوت → فك مشدود، رقبة متصلبة، صداع. الحزن المكبوت → ضيق صدر، تنفس سطحي. القلق المكبوت → بطن مضطرب، غثيان. كل شعور له \"عنوان\" في الجسم — تعلّم خريطتك الشخصية.' },
            { title: 'البديل: التعبير الذكي', emoji: '💡', body: 'التعبير لا يعني الصراخ على الناس. يعني: كتابة علاجية، تنفس واعٍ، حركة تعبيرية، ومشاركة آمنة. حتى 5 دقائق كتابة يومية تُخفض الكورتيزول وتُقلّل الأعراض النفسجسدية بنسبة 23% بحسب الأبحاث.' },
        ],
        keyTakeaways: [
            'الكبت ليس قوة — هو تأجيل للألم',
            'المشاعر المخزّنة تظهر كأعراض جسدية حقيقية',
            'الكتابة العلاجية أداة مثبتة علمياً لتحرير المكبوت',
        ],
        closingAction: 'اليوم: اكتب جملة واحدة عن شعور كبتّه هذا الأسبوع. جملة واحدة تكفي للبداية.',
    },

    'nafsi_suppress_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'تتبع مستوى التعبير العاطفي وأثره على الجسم',
        intro: 'سجّل يومياً — الهدف ربط الكبت بالأعراض.',
        insight: 'ابحث عن: أيام التعبير الحر = أيام أقل أعراضاً جسدية؟',
        fields: [
            { id: 'expression_level', label: 'هل عبّرت عن مشاعرك اليوم؟', emoji: '💬', type: 'scale', min: 0, max: 10 },
            { id: 'body_tension', label: 'مستوى التوتر الجسدي', emoji: '🤕', type: 'scale', min: 0, max: 10 },
            { id: 'suppressed', label: 'ما الشعور الذي كبتّه اليوم؟', emoji: '🔇', type: 'choice', options: ['لم أكبت شيئاً', 'غضب', 'حزن', 'إحباط', 'خوف', 'حاجة لم أطلبها', 'أخرى'] },
            { id: 'note', label: 'ملاحظة', emoji: '📝', type: 'text' },
        ],
    },

    'nafsi_grief_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'تقييم مستوى الحزن غير المعالج والاستنزاف العاطفي',
        intro: 'الحزن ليس ضعفاً — لكن الحزن غير المعالج يُثقل الجسم والعقل.',
        questions: [
            { id: 'gr1', text: 'هل تعرّضت لفقدان أو خسارة مؤلمة لم تهضمها بعد؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'ربما شيء قديم' }, { value: 2, label: 'نعم — شيء محدد' }, { value: 3, label: 'نعم — عدة خسارات' }] },
            { id: 'gr2', text: 'هل تشعر بثقل عاطفي مستمر لا تعرف مصدره؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً — كإنني أحمل وزناً' }] },
            { id: 'gr3', text: 'هل فقدت الاهتمام بأشياء كانت تسعدك؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'قليلاً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'نعم — لا شيء يُفرحني' }] },
            { id: 'gr4', text: 'هل تشعر بالإرهاق العاطفي — كأن طاقتك النفسية نفدت؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'مُنهك عاطفياً' }] },
            { id: 'gr5', text: 'هل تبكي بسهولة أو تشعر بغصة في حلقك كثيراً؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'نادراً' }, { value: 2, label: 'أحياناً' }, { value: 3, label: 'كثيراً أو يومياً' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'حالة عاطفية مستقرة', message: 'لا مؤشرات حزن مُعلّق — استمر في الوعي العاطفي.', nextStep: 'مارس الامتنان والتأمل كوقاية.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'حزن أو استنزاف معتدل', message: 'هناك حمل عاطفي يحتاج اهتماماً — الوعي هو البداية.', nextStep: 'ابدأ بروتوكول الشفاء 14 يوماً.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'حزن عميق يحتاج دعماً', message: 'الثقل العاطفي كبير — تستحق مساعدة متخصصة.', nextStep: 'ابدأ البروتوكول + فكّر في معالج نفسي.' },
        ],
    },

    'nafsi_grief_practice': {
        type: 'practice',
        durationMinutes: 10,
        goal: 'كتابة علاجية مصممة لمعالجة الحزن والفقد',
        intro: 'الكتابة عن الحزن تُساعدك تهضم ما لم تهضمه بعد.',
        steps: [
            { index: 1, instruction: 'اجلس في مكان هادئ — خذ 3 أنفاس عميقة', durationSeconds: 20 },
            { index: 2, instruction: 'اكتب: \"ما أشتاق إليه هو...\"', durationSeconds: 120 },
            { index: 3, instruction: 'اكتب: \"ما لم أقله وأتمنى لو قلته...\"', durationSeconds: 120 },
            { index: 4, instruction: 'اكتب: \"ما تعلمته من هذا الفقد...\"', durationSeconds: 90 },
            { index: 5, instruction: 'تنفس ببطء — اسمح للمشاعر أن تمر', durationSeconds: 30 },
            { index: 6, instruction: 'اكتب جملة واحدة لنفسك: تستحق أن تشفى', durationSeconds: 30 },
        ],
        closingNote: 'الحزن يتحول عندما نُعطيه مساحة بدل أن نكبته.',
        repeatSuggestion: 'مرة أسبوعياً — أو كلما شعرت بثقل عاطفي',
    },

    'nafsi_grief_protocol': {
        type: 'protocol',
        totalDays: 14,
        goal: 'معالجة الحزن والفقدان تدريجياً عبر التأمل والكتابة والحركة',
        howItWorks: 'أسبوعان: الأول للاعتراف، الثاني للشفاء. لا تسرّع — الحزن يحتاج وقته.',
        completionMessage: 'أسبوعان من الشجاعة — الشفاء ليس نسياناً بل تحويل.',
        days: [
            { day: 1, title: 'الاعتراف', subtitle: 'اعترف بما تشعر', tasks: [
                { id: 'g1t1', text: 'اكتب: ما الذي يُحزنني الآن؟ بدون فلاتر', durationMinutes: 10, emoji: '📝' },
                { id: 'g1t2', text: 'تنفس 5 دقائق مع إطلاق المشاعر', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 2, title: 'الذكريات', subtitle: 'اسمح للذكريات الجميلة', tasks: [
                { id: 'g2t1', text: 'اكتب 3 ذكريات جميلة مرتبطة بخسارتك', durationMinutes: 10, emoji: '✨' },
                { id: 'g2t2', text: 'مشي هادئ 15 دقيقة مع التأمل فيها', durationMinutes: 15, emoji: '🚶' },
            ]},
            { day: 3, title: 'الجسد في الحزن', subtitle: 'أين يسكن حزنك؟', tasks: [
                { id: 'g3t1', text: 'مسح جسدي 10 دقائق: أين الثقل؟', durationMinutes: 10, emoji: '🧘' },
                { id: 'g3t2', text: 'تنفس نحو منطقة الثقل', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 4, title: 'الدموع', subtitle: 'البكاء شفاء — ليس ضعفاً', tasks: [
                { id: 'g4t1', text: 'اسمح لنفسك بالبكاء إذا أتت الدموع', durationMinutes: 0, emoji: '💧' },
                { id: 'g4t2', text: 'تأمل 10 دقائق بعدها', durationMinutes: 10, emoji: '🧘' },
            ]},
            { day: 5, title: 'الامتنان', subtitle: 'شكر لما كان', tasks: [
                { id: 'g5t1', text: 'اكتب رسالة امتنان لما فقدته', durationMinutes: 10, emoji: '🙏' },
                { id: 'g5t2', text: 'تنفس عميق 5 دقائق', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 6, title: 'الراحة', subtitle: 'الحزن يحتاج راحة', tasks: [
                { id: 'g6t1', text: 'افعل شيئاً يُريحك: حمام دافئ، شاي، طبيعة', durationMinutes: 20, emoji: '🌿' },
                { id: 'g6t2', text: 'نم باكراً الليلة', durationMinutes: 0, emoji: '🌙' },
            ]},
            { day: 7, title: 'المراجعة', subtitle: 'ما تغيّر هذا الأسبوع؟', tasks: [
                { id: 'g7t1', text: 'هل الثقل خفّ قليلاً؟ سجّل (1-10)', durationMinutes: 5, emoji: '📊' },
                { id: 'g7t2', text: 'ما الأداة التي ساعدتك أكثر؟', durationMinutes: 3, emoji: '⭐' },
            ]},
            { day: 8, title: 'التحول', subtitle: 'الحزن يتحول — لا يختفي', tasks: [
                { id: 'g8t1', text: 'اكتب: كيف غيّرني هذا الفقد؟', durationMinutes: 10, emoji: '📝' },
                { id: 'g8t2', text: 'مشي 20 دقيقة في الطبيعة', durationMinutes: 20, emoji: '🌿' },
            ]},
            { day: 9, title: 'المعنى', subtitle: 'ابحث عن المعنى في الألم', tasks: [
                { id: 'g9t1', text: 'اكتب: ما الذي تعلمته عن نفسي من هذه التجربة؟', durationMinutes: 10, emoji: '📝' },
                { id: 'g9t2', text: 'تأمل 10 دقائق', durationMinutes: 10, emoji: '🧘' },
            ]},
            { day: 10, title: 'الحدود مع الحزن', subtitle: 'وقت للحزن ووقت للحياة', tasks: [
                { id: 'g10t1', text: 'خصص 15 دقيقة \"وقت الحزن\" — خارجها عش يومك', durationMinutes: 15, emoji: '⏰' },
                { id: 'g10t2', text: 'افعل شيئاً ممتعاً بدون ذنب', durationMinutes: 20, emoji: '🎨' },
            ]},
            { day: 11, title: 'الاتصال', subtitle: 'لا تحمل وحدك', tasks: [
                { id: 'g11t1', text: 'تحدث مع شخص تثق به عن مشاعرك', durationMinutes: 15, emoji: '💬' },
                { id: 'g11t2', text: 'تنفس عميق بعد المحادثة', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 12, title: 'الحركة الناعمة', subtitle: 'حرّك ما تخزّنه', tasks: [
                { id: 'g12t1', text: 'يوغا لطيفة أو مشي في الطبيعة 20 دقيقة', durationMinutes: 20, emoji: '🧘' },
                { id: 'g12t2', text: 'تمدد عميق 5 دقائق', durationMinutes: 5, emoji: '🤸' },
            ]},
            { day: 13, title: 'الطقوس', subtitle: 'اصنع طقساً للذكرى', tasks: [
                { id: 'g13t1', text: 'أشعل شمعة أو اكتب رسالة أو زر مكاناً مهماً', durationMinutes: 15, emoji: '🕯️' },
                { id: 'g13t2', text: 'تنفس واشكر — لما كان ولما سيكون', durationMinutes: 5, emoji: '🙏' },
            ]},
            { day: 14, title: 'المضيّ قدماً', subtitle: 'المضيّ ≠ النسيان', tasks: [
                { id: 'g14t1', text: 'اكتب: كيف أريد أن أعيش من هنا؟', durationMinutes: 10, emoji: '📝' },
                { id: 'g14t2', text: 'إذا الثقل لا يزال كبيراً: احجز جلسة مع معالج', durationMinutes: 0, emoji: '🏥' },
                { id: 'g14t3', text: 'اشكر نفسك على أسبوعين من الشجاعة', durationMinutes: 0, emoji: '⭐' },
            ]},
        ],
    },

    'nafsi_grief_workshop': {
        type: 'workshop',
        durationMinutes: 12,
        goal: 'فهم الحزن والفقد وكيف يهضمهما الجسم والعقل',
        intro: 'الحزن ليس مرضاً يُعالج — هو تجربة إنسانية تحتاج مساحة.',
        sections: [
            { title: 'مراحل الحزن ليست خطية', emoji: '🔄', body: 'كولر-روس ذكرت 5 مراحل (إنكار، غضب، مساومة، اكتئاب، قبول) لكن الحقيقة: الحزن لا يسير بترتيب. قد تعود للغضب بعد القبول. هذا طبيعي — الحزن حلزوني لا خطي. لا تضغط على نفسك للوصول لـ\"القبول\" بسرعة.' },
            { title: 'الحزن في الجسم', emoji: '🫀', body: 'الحزن يُغيّر الكيمياء الحيوية فعلياً: يرفع الكورتيزول، يُضعف المناعة، يُبطئ الهضم، ويُسبب ألماً جسدياً حقيقياً (\"القلب المكسور\" ليس مجازاً — متلازمة تاكوتسوبو حقيقية). لهذا الشفاء يشمل الجسم أيضاً.' },
            { title: 'ما يُساعد حقاً', emoji: '💚', body: 'ثلاثة أشياء مثبتة: 1) التعبير — كتابة، كلام، فن. 2) الطقوس — شمعة، رسالة، زيارة. 3) الاتصال — لا تحمل وحدك. الحزن يحتاج شاهداً. إذا لم يكن عندك شخص آمن — المعالج النفسي شاهد متخصص.' },
        ],
        keyTakeaways: [
            'الحزن طبيعي وليس ضعفاً — لكنه يحتاج معالجة لا تجاهلاً',
            'الجسم يحزن أيضاً — الأعراض الجسدية جزء من الحزن',
            'المضيّ قدماً لا يعني النسيان — بل التحول',
        ],
        closingAction: 'اليوم: اكتب رسالة قصيرة لشخص أو شيء فقدته. قل ما لم تقله.',
    },

    'nafsi_grief_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'تتبع الحالة العاطفية والطاقة يومياً خلال فترة الحزن',
        intro: 'التتبع يُريك أن التحسن يحدث — حتى لو لم تشعر به يومياً.',
        insight: 'الأيام ليست متساوية — الحزن يتموج. لاحظ ما يُخفف: حركة؟ كتابة؟ اتصال؟',
        fields: [
            { id: 'emotional_weight', label: 'الثقل العاطفي اليوم', emoji: '💧', type: 'scale', min: 0, max: 10 },
            { id: 'energy', label: 'مستوى الطاقة', emoji: '🔋', type: 'scale', min: 0, max: 10 },
            { id: 'expressed', label: 'هل عبّرت عن مشاعرك اليوم؟', emoji: '💬', type: 'boolean' },
            { id: 'helpful', label: 'ما ساعدك اليوم؟', emoji: '⭐', type: 'choice', options: ['كتابة', 'حركة', 'شخص', 'طبيعة', 'تأمل', 'لا شيء ساعد', 'أخرى'] },
            { id: 'note', label: 'ملاحظة', emoji: '📝', type: 'text' },
        ],
    },

    'nafsi_panic_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'تقييم تكرار وشدة نوبات الهلع',
        intro: 'نوبات الهلع مخيفة لكنها غير خطرة — فهمها يُقلل خوفك منها.',
        questions: [
            { id: 'pa1', text: 'كم مرة تعرّضت لنوبة هلع مفاجئة (خفقان، ضيق تنفس، رعب)؟', options: [{ value: 0, label: 'لم يحدث' }, { value: 1, label: 'مرة أو مرتين' }, { value: 2, label: 'عدة مرات' }, { value: 3, label: 'بشكل متكرر' }] },
            { id: 'pa2', text: 'هل تخاف من حدوث نوبة جديدة؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'قليلاً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'خوف يومي من النوبة القادمة' }] },
            { id: 'pa3', text: 'هل تتجنب أماكن أو مواقف خوفاً من نوبة هلع؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'أتجنب شيئاً واحداً' }, { value: 2, label: 'أتجنب عدة أشياء' }, { value: 3, label: 'حياتي مُقيّدة بسبب التجنب' }] },
            { id: 'pa4', text: 'أثناء النوبة: هل تخاف أنك ستموت أو تفقد السيطرة؟', options: [{ value: 0, label: 'لا ينطبق' }, { value: 1, label: 'خوف خفيف' }, { value: 2, label: 'خوف شديد' }, { value: 3, label: 'رعب كامل' }] },
            { id: 'pa5', text: 'هل النوبات تؤثر على حياتك اليومية (عمل، علاقات، خروج)؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'قليلاً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'تُعطّل حياتي' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'قلق طبيعي', message: 'لا مؤشرات على اضطراب هلع — لكن أدوات التأريض مفيدة للجميع.', nextStep: 'تعلّم تمرين 5-4-3-2-1 كوقاية.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'نوبات هلع متوسطة', message: 'تحدث نوبات وتؤثر على حياتك — قابلة للتحسن بالأدوات.', nextStep: 'ابدأ بروتوكول إدارة الهلع + تعلّم التأريض.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'اضطراب هلع محتمل', message: 'النوبات متكررة وتُقيّد حياتك — تحتاج دعماً متخصصاً.', nextStep: 'ابدأ البروتوكول + احجز مع معالج CBT.' },
        ],
    },

    'nafsi_panic_practice': {
        type: 'practice',
        durationMinutes: 5,
        goal: 'تمرين تأريض 5-4-3-2-1 لإيقاف نوبة الهلع',
        intro: 'هذا التمرين يُعيدك للحاضر ويُوقف حلقة الهلع — احفظه.',
        steps: [
            { index: 1, instruction: 'سمّ 5 أشياء تراها الآن — واحداً واحداً', durationSeconds: 30 },
            { index: 2, instruction: 'سمّ 4 أشياء تلمسها الآن — ركّز على الملمس', durationSeconds: 25 },
            { index: 3, instruction: 'سمّ 3 أشياء تسمعها الآن — أصغِ بتركيز', durationSeconds: 20 },
            { index: 4, instruction: 'سمّ شيئين تشمّهما الآن', durationSeconds: 15 },
            { index: 5, instruction: 'سمّ شيئاً واحداً تتذوقه أو يمكنك تذوقه', durationSeconds: 10 },
            { index: 6, instruction: 'تنفس ببطء: 4 داخل، 4 حبس، 6 خروج — 5 مرات', durationSeconds: 60 },
        ],
        closingNote: 'النوبة تمر — دائماً تمر. جسمك آمن حتى لو لم يشعر بذلك.',
        repeatSuggestion: 'فوراً عند الشعور ببداية نوبة + تمرين يومي وقائي',
    },

    'nafsi_panic_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'إدارة نوبات الهلع وتقليل تكرارها',
        howItWorks: 'أسبوع: فهم النوبة + أدوات فورية + عادات وقائية.',
        completionMessage: 'أسبوع من مواجهة الهلع — أنت أقوى مما تظن.',
        days: [
            { day: 1, title: 'فهم النوبة', subtitle: 'ما يحدث في جسمك', tasks: [
                { id: 'pk1t1', text: 'اقرأ: النوبة = استجابة \"هروب/قتال\" بدون خطر حقيقي', durationMinutes: 5, emoji: '📖' },
                { id: 'pk1t2', text: 'تعلّم تمرين 5-4-3-2-1 واحفظه', durationMinutes: 5, emoji: '🌍' },
                { id: 'pk1t3', text: 'تنفس 4-4-6 عشر مرات', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 2, title: 'التنفس الطارئ', subtitle: 'أقوى أداة ضد الهلع', tasks: [
                { id: 'pk2t1', text: 'تمرّن على تنفس 4-4-6 صباحاً ومساءً', durationMinutes: 10, emoji: '🫁' },
                { id: 'pk2t2', text: 'تنفس في كيس ورقي إذا شعرت بدوار (يعيد CO2)', durationMinutes: 0, emoji: '📦' },
                { id: 'pk2t3', text: 'مشي هادئ 15 دقيقة', durationMinutes: 15, emoji: '🚶' },
            ]},
            { day: 3, title: 'التأريض', subtitle: 'اجلب نفسك للحاضر', tasks: [
                { id: 'pk3t1', text: 'تمرين 5-4-3-2-1 ثلاث مرات اليوم (حتى بدون نوبة)', durationMinutes: 5, emoji: '🌍' },
                { id: 'pk3t2', text: 'أمسك شيئاً بارداً عند الشعور بقلق', durationMinutes: 0, emoji: '🧊' },
                { id: 'pk3t3', text: 'سجّل أي أعراض قلق ظهرت (ومتى اختفت)', durationMinutes: 3, emoji: '📝' },
            ]},
            { day: 4, title: 'مواجهة الخوف', subtitle: 'التجنب يُقوّي الخوف', tasks: [
                { id: 'pk4t1', text: 'اذهب لمكان تجنبته (بشكل تدريجي وآمن)', durationMinutes: 15, emoji: '🦁' },
                { id: 'pk4t2', text: 'استخدم التنفس + التأريض أثناء المواجهة', durationMinutes: 5, emoji: '🫁' },
                { id: 'pk4t3', text: 'سجّل: ماذا حدث فعلاً؟ (vs ما توقعته)', durationMinutes: 3, emoji: '📝' },
            ]},
            { day: 5, title: 'الجسم الآمن', subtitle: 'علّم جسمك أنه بأمان', tasks: [
                { id: 'pk5t1', text: 'تأمل مسح جسدي 10 دقائق', durationMinutes: 10, emoji: '🧘' },
                { id: 'pk5t2', text: 'إرخاء عضلي تدريجي', durationMinutes: 10, emoji: '💪' },
                { id: 'pk5t3', text: 'كرّر لنفسك: \"جسمي آمن — هذا قلق لا خطر\"', durationMinutes: 0, emoji: '💬' },
            ]},
            { day: 6, title: 'العادات الوقائية', subtitle: 'منع النوبات أفضل من علاجها', tasks: [
                { id: 'pk6t1', text: 'قلّل الكافيين (أقوى محفز لنوبات الهلع)', durationMinutes: 0, emoji: '☕' },
                { id: 'pk6t2', text: 'نم 7-8 ساعات', durationMinutes: 0, emoji: '🌙' },
                { id: 'pk6t3', text: 'مشي 20 دقيقة', durationMinutes: 20, emoji: '🚶' },
            ]},
            { day: 7, title: 'التقييم', subtitle: 'ما تغيّر هذا الأسبوع؟', tasks: [
                { id: 'pk7t1', text: 'كم نوبة حدثت هذا الأسبوع vs الأسبوع السابق؟', durationMinutes: 5, emoji: '📊' },
                { id: 'pk7t2', text: 'أي أداة ساعدتك أكثر؟', durationMinutes: 3, emoji: '⭐' },
                { id: 'pk7t3', text: 'إذا لم يتحسن: CBT مع معالج متخصص', durationMinutes: 0, emoji: '🏥' },
            ]},
        ],
    },

    'nafsi_panic_workshop': {
        type: 'workshop',
        durationMinutes: 6,
        goal: 'فهم ما يحدث في جسمك أثناء نوبة الهلع',
        intro: 'النوبة ليست خطراً — هي جسمك في وضع \"هروب\" بدون تهديد حقيقي.',
        sections: [
            { title: 'ماذا يحدث فعلاً؟', emoji: '⚡', body: 'عندما يظن دماغك أن هناك خطراً (حتى لو لا يوجد)، يُطلق أدرينالين ← القلب يخفق ← التنفس يتسارع ← الدم يذهب للعضلات ← تشعر بدوار وخدران وخوف. كل هذا طبيعي — جسمك يُجهّزك للهرب. المشكلة: لا يوجد شيء تهرب منه.' },
            { title: 'لماذا لن تموت', emoji: '💚', body: 'الخفقان ≠ نوبة قلبية (قلبك يعمل أسرع فقط). ضيق التنفس ≠ اختناق (تتنفس أكثر من اللازم لا أقل). الدوار ≠ إغماء (ضغط الدم يرتفع في الهلع لا ينخفض). النوبة تنتهي وحدها خلال 10-20 دقيقة — دائماً.' },
            { title: 'كيف توقفها', emoji: '🛑', body: 'أقوى ثلاثة أشياء: 1) تنفس ببطء (4 داخل، 4 حبس، 6 خروج) — يُبطئ الأدرينالين. 2) تأريض 5-4-3-2-1 — يُعيدك للحاضر. 3) كلّم نفسك: \"هذه نوبة هلع — أعرفها — ستمر\". التقبّل يُسرّع الانتهاء.' },
        ],
        keyTakeaways: [
            'نوبة الهلع مخيفة لكنها غير خطيرة — جسمك في وضع هروب فقط',
            'كل نوبة تنتهي وحدها خلال 20 دقيقة — دائماً',
            'التنفس البطيء + التأريض أقوى أدوات الإيقاف',
        ],
        closingAction: 'اليوم: احفظ تمرين 5-4-3-2-1 — فقط احفظه. هذا سلاحك.',
    },

    'nafsi_panic_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'تسجيل نوبات الهلع ومحفزاتها وشدتها',
        intro: 'سجّل أي نوبة أو قلق شديد — نبحث عن الأنماط والمحفزات.',
        insight: 'بعد أسبوعين: ما الأوقات والمواقف التي تُحفّز النوبات أكثر؟',
        fields: [
            { id: 'panic_today', label: 'هل حدثت نوبة هلع اليوم؟', emoji: '💥', type: 'boolean' },
            { id: 'intensity', label: 'شدة النوبة/القلق', emoji: '🔥', type: 'scale', min: 0, max: 10 },
            { id: 'trigger', label: 'ما المحفز؟', emoji: '⚡', type: 'choice', options: ['لا محفز واضح', 'مكان مزدحم', 'وحدة', 'فكرة صحية', 'كافيين', 'قلة نوم', 'توتر', 'أخرى'] },
            { id: 'coped', label: 'هل استخدمت أداة تهدئة؟', emoji: '🛠️', type: 'choice', options: ['لم أحتج', 'تنفس', 'تأريض', 'كلمت نفسي', 'كلمت شخص', 'لم أستطع'] },
            { id: 'note', label: 'ملاحظة', emoji: '📝', type: 'text' },
        ],
    },

    'nafsi_link_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'اكتشاف أنماط الربط بين مشاعرك وأعراضك الجسدية',
        intro: 'الجسم والمشاعر مترابطان — هذا الاختبار يُوضّح كيف يعمل هذا الارتباط عندك.',
        questions: [
            { id: 'el1', text: 'هل لاحظت أن أعراضاً جسدية تظهر مع مشاعر محددة؟', options: [{ value: 0, label: 'لم ألاحظ' }, { value: 1, label: 'ربما أحياناً' }, { value: 2, label: 'نعم — واضح' }, { value: 3, label: 'نعم — مرتبطان تماماً' }] },
            { id: 'el2', text: 'هل تجد صعوبة في تسمية مشاعرك بدقة؟', options: [{ value: 0, label: 'لا — أعرف مشاعري' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً — مشاعري غامضة' }, { value: 3, label: 'لا أعرف ما أشعر به عادة' }] },
            { id: 'el3', text: 'هل تُعبّر عن مشاعرك بأعراض جسدية بدل الكلام؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'نادراً' }, { value: 2, label: 'أحياناً' }, { value: 3, label: 'غالباً — الجسم يتحدث بدلي' }] },
            { id: 'el4', text: 'هل أعراضك الجسدية تختفي في الإجازات أو الأوقات المريحة؟', options: [{ value: 0, label: 'لا — ثابتة' }, { value: 1, label: 'تخف قليلاً' }, { value: 2, label: 'تتحسن كثيراً' }, { value: 3, label: 'تختفي تماماً' }] },
            { id: 'el5', text: 'هل قيل لك \"لا يوجد سبب عضوي\" لأعراضك أكثر من مرة؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'مرة' }, { value: 2, label: 'أكثر من مرة' }, { value: 3, label: 'كثيراً — محبط' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'ارتباط خفيف', message: 'العلاقة بين مشاعرك وأعراضك خفيفة — الوعي الجسدي مفيد كوقاية.', nextStep: 'تعلّم عجلة المشاعر واستخدمها يومياً.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'ارتباط واضح', message: 'مشاعرك تُترجم لأعراض جسدية — فهم الخريطة يُساعد.', nextStep: 'ابدأ بروتوكول الربط 7 أيام.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'ارتباط عميق', message: 'الجسم يُعبّر عنك — تحتاج بناء جسر بين المشاعر والكلام.', nextStep: 'ابدأ البروتوكول + فكّر في علاج نفسي جسدي.' },
        ],
    },

    'nafsi_link_practice': {
        type: 'practice',
        durationMinutes: 5,
        goal: 'تمرين عجلة المشاعر — تسمية دقيقة لما تشعر',
        intro: 'تسمية المشاعر بدقة تُقلل شدتها — هذا مثبت علمياً (affect labeling).',
        steps: [
            { index: 1, instruction: 'أغمض عينيك — خذ 3 أنفاس عميقة', durationSeconds: 15 },
            { index: 2, instruction: 'اسأل نفسك: ما الشعور السائد الآن؟', durationSeconds: 15 },
            { index: 3, instruction: 'لا تقل \"زين\" أو \"مو زين\" — كن أدق: حزين؟ قلق؟ مُحبط؟ خائف؟ غاضب؟', durationSeconds: 20 },
            { index: 4, instruction: 'أين تشعر بهذا الشعور في جسمك؟ صدر؟ بطن؟ رقبة؟', durationSeconds: 20 },
            { index: 5, instruction: 'سمّ الشعور بصوت عالٍ: \"أنا أشعر بـ...\"', durationSeconds: 10 },
            { index: 6, instruction: 'تنفس 3 مرات عميقة — لاحظ هل خفّ الشعور بعد تسميته', durationSeconds: 20 },
        ],
        closingNote: 'تسمية المشعر تُنقل معالجته من اللوزة الدماغية للقشرة — تُهدئ رد الفعل.',
        repeatSuggestion: '3 مرات يومياً: صباحاً، ظهراً، مساءً. دقيقتان في كل مرة.',
    },

    'nafsi_link_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'بناء خريطة شخصية بين مشاعرك وأعراضك الجسدية',
        howItWorks: 'كل يوم: تسمية + ربط + تنفس + تحرير. بعد 7 أيام سترى الأنماط.',
        completionMessage: 'أسبوع من الربط الواعي — الآن تعرف خريطتك.',
        days: [
            { day: 1, title: 'الملاحظة', subtitle: 'لاحظ بدون تغيير', tasks: [
                { id: 'lk1t1', text: 'سجّل مشاعرك وأعراضك 3 مرات اليوم', durationMinutes: 5, emoji: '📝' },
                { id: 'lk1t2', text: 'لا تحاول تغيير أي شيء — فقط لاحظ', durationMinutes: 0, emoji: '👁️' },
                { id: 'lk1t3', text: 'تنفس عميق 5 دقائق قبل النوم', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 2, title: 'التسمية', subtitle: 'سمّ مشاعرك بدقة', tasks: [
                { id: 'lk2t1', text: 'تمرين عجلة المشاعر 3 مرات اليوم', durationMinutes: 6, emoji: '🎡' },
                { id: 'lk2t2', text: 'اكتب: ما الشعور ← ما العرض الجسدي', durationMinutes: 5, emoji: '🔗' },
                { id: 'lk2t3', text: 'مشي 15 دقيقة', durationMinutes: 15, emoji: '🚶' },
            ]},
            { day: 3, title: 'خريطة الجسد', subtitle: 'ارسم خريطتك', tasks: [
                { id: 'lk3t1', text: 'ارسم جسمك وحدد أين يسكن كل شعور', durationMinutes: 10, emoji: '🗺️' },
                { id: 'lk3t2', text: 'تأمل مسح جسدي 10 دقائق', durationMinutes: 10, emoji: '🧘' },
            ]},
            { day: 4, title: 'الأنماط', subtitle: 'ما يتكرر', tasks: [
                { id: 'lk4t1', text: 'اقرأ ملاحظاتك من الأيام 1-3 — ما الأنماط؟', durationMinutes: 10, emoji: '🔍' },
                { id: 'lk4t2', text: 'اكتب: أكثر 3 ارتباطات مشاعر←أعراض عندي', durationMinutes: 5, emoji: '📝' },
            ]},
            { day: 5, title: 'التنفس العلاجي', subtitle: 'تُنفس نحو الشعور', tasks: [
                { id: 'lk5t1', text: 'عندما تشعر بعرض: سمّ الشعور المرافق', durationMinutes: 0, emoji: '💬' },
                { id: 'lk5t2', text: 'تنفس نحو منطقة العرض في جسمك', durationMinutes: 5, emoji: '🫁' },
                { id: 'lk5t3', text: 'لاحظ: هل خف العرض بعد تسمية الشعور؟', durationMinutes: 0, emoji: '🔍' },
            ]},
            { day: 6, title: 'التعبير', subtitle: 'عبّر عن الشعور بدل الكبت', tasks: [
                { id: 'lk6t1', text: 'كتابة علاجية 10 دقائق عن الشعور الأكثر تكراراً', durationMinutes: 10, emoji: '✍️' },
                { id: 'lk6t2', text: 'حركة تعبيرية: رقص أو تمدد مع الشعور', durationMinutes: 5, emoji: '💃' },
            ]},
            { day: 7, title: 'التقييم', subtitle: 'ما تعلمته عن خريطتك', tasks: [
                { id: 'lk7t1', text: 'اكتب خريطتك النهائية: شعور → عرض → ما يُساعد', durationMinutes: 10, emoji: '🗺️' },
                { id: 'lk7t2', text: 'هل خفّت الأعراض مع الوعي؟', durationMinutes: 3, emoji: '📊' },
                { id: 'lk7t3', text: 'ما الأداة التي ستستمر بها؟', durationMinutes: 2, emoji: '⭐' },
            ]},
        ],
    },

    'nafsi_link_workshop': {
        type: 'workshop',
        durationMinutes: 8,
        goal: 'فهم كيف تترابط المشاعر والأعراض الجسدية',
        intro: 'الجسم لا ينفصل عن المشاعر — هو ترجمة مباشرة لحالتك النفسية.',
        sections: [
            { title: 'لماذا الجسم يتأثر بالمشاعر؟', emoji: '🧠', body: 'الجهاز العصبي اللاإرادي يربط الدماغ بكل عضو. عندما تشعر بخوف — قلبك يخفق وبطنك يتقلب. هذا ليس \"وهماً\" — هو فسيولوجيا حقيقية. اللوزة الدماغية تُطلق هرمونات التوتر التي تؤثر على الهضم والعضلات والقلب والجلد.' },
            { title: 'الخريطة العاطفية للجسم', emoji: '🗺️', body: 'أبحاث جامعة آلتو (فنلندا) أثبتت أن كل شعور له \"خريطة حرارية\" في الجسم: الغضب يُنشّط الرأس واليدين. الخوف يُنشّط الصدر والبطن. الحزن يُقلل نشاط الأطراف. السعادة تُنشّط الجسم كله. معرفة خريطتك تُعطيك بوصلة لمشاعرك.' },
            { title: 'تسمية = تهدئة', emoji: '💬', body: 'البحث في UCLA أثبت: مجرد تسمية الشعور بدقة (affect labeling) يُقلل نشاط اللوزة الدماغية بنسبة 30%. أي أن قول \"أنا قلق\" أهدأ من محاولة عدم القلق. هذا أساس الوعي العاطفي — لا تُقاوم الشعور، سمّه فقط.' },
        ],
        keyTakeaways: [
            'الأعراض الجسدية المرتبطة بالمشاعر حقيقية وليست وهماً',
            'كل شعور له خريطة محددة في الجسم — تعلّم خريطتك',
            'تسمية الشعور وحدها تُقلل شدته بنسبة 30%',
        ],
        closingAction: 'الآن: سمّ ما تشعر به. بصوت عالٍ. جملة واحدة. هذا كافٍ الآن.',
    },

    'nafsi_link_tracker': {
        type: 'tracker',
        durationMinutes: 3,
        goal: 'تسجيل يومي لربط المشاعر بالأعراض الجسدية',
        intro: 'كل يوم: ما شعرت ← ما ظهر في جسدك. بعد أسبوع ستملك خريطتك.',
        insight: 'الهدف ليس إزالة المشاعر — بل فهم لغة جسمك.',
        fields: [
            { id: 'main_emotion', label: 'الشعور السائد اليوم', emoji: '❤️', type: 'choice', options: ['هادئ', 'قلق', 'حزين', 'غاضب', 'خائف', 'محبط', 'سعيد', 'مُرهق', 'أخرى'] },
            { id: 'body_symptom', label: 'أبرز عرض جسدي اليوم', emoji: '🦴', type: 'choice', options: ['لا أعراض', 'صداع', 'ألم بطن', 'ضيق صدر', 'ألم عضلي', 'غثيان', 'دوار', 'خدران', 'أخرى'] },
            { id: 'connection_noticed', label: 'هل لاحظت ارتباطاً؟', emoji: '🔗', type: 'boolean' },
            { id: 'named_feeling', label: 'هل سمّيت مشاعرك اليوم بصوت عالٍ؟', emoji: '💬', type: 'boolean' },
            { id: 'note', label: 'ملاحظة', emoji: '📝', type: 'text' },
        ],
    },

};
