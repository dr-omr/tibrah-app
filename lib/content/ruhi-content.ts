// lib/content/ruhi-content.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Ruhi (Serenity) Tool Content
// ════════════════════════════════════════════════════════════════════════

import type {
    ToolContent,
    ProtocolContent, PracticeContent, TestContent,
    WorkshopContent, TrackerContent,
    ProtocolDay, ProtocolTask, PracticeStep,
    TestQuestion, TestResult,
    WorkshopSection, TrackerField,
} from './tool-content-types';

export const RUHI_CONTENT: Record<string, ToolContent> = {
    'ruhi_rhythm_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'إعادة بناء إيقاع يومي منتظم ومتوازن',
        howItWorks: 'نوم + ضوء + وجبات + حركة في مواعيد ثابتة تُعيد برمجة ساعتك البيولوجية.',
        completionMessage: 'أسبوع من الانتظام! الإيقاع يحتاج 3 أسابيع ليستقر — أنت في منتصف الطريق.',
        days: [
            { day: 1, title: 'الأساس: ميعاد النوم', subtitle: 'النوم في نفس الوقت هو قرار الأسبوع', tasks: [{ id: 'r1t1', text: 'حدد ميعاد نوم واستيقاظ ثابت', durationMinutes: 0, emoji: '⏰' }, { id: 'r1t2', text: 'أغلق الشاشات 30 دقيقة قبل النوم', durationMinutes: 0, emoji: '📵' }, { id: 'r1t3', text: 'استيقظ بنفس الوقت حتى في عطلة نهاية الأسبوع', durationMinutes: 0, emoji: '☀️' }] },
            { day: 2, title: 'الضوء والظلام', subtitle: 'الإضاءة هي المتحكم الأول في الإيقاع', tasks: [{ id: 'r2t1', text: 'ضوء طبيعي أول 30 دقيقة من الصباح', durationMinutes: 30, emoji: '☀️' }, { id: 'r2t2', text: 'إضاءة خافتة بعد الساعة 9 مساءً', durationMinutes: 0, emoji: '🌙' }, { id: 'r2t3', text: 'تجنّب الشاشة المضيئة في الظلام', durationMinutes: 0, emoji: '📵' }] },
            { day: 3, title: 'وجبات منتظمة', subtitle: 'الطعام في مواعيد ثابتة = إشارة للساعة البيولوجية', tasks: [{ id: 'r3t1', text: 'إفطار في نفس الوقت كل يوم', durationMinutes: 0, emoji: '🌅' }, { id: 'r3t2', text: 'لا أكل بعد الساعة 8 مساءً', durationMinutes: 0, emoji: '⏰' }, { id: 'r3t3', text: 'وجبة خفيفة العشاء — لا دسمة', durationMinutes: 0, emoji: '🥗' }] },
            { day: 4, title: 'الحركة المنتظمة', subtitle: 'الجسم المتحرك ينتظم أسرع', tasks: [{ id: 'r4t1', text: 'حدد وقتاً يومياً للحركة (صباح أو عصر)', durationMinutes: 0, emoji: '🚶' }, { id: 'r4t2', text: 'مشي أو تمرين خفيف 20-30 دقيقة', durationMinutes: 25, emoji: '🏃' }, { id: 'r4t3', text: 'لا رياضة شديدة بعد الساعة 7 مساءً', durationMinutes: 0, emoji: '⏰' }] },
            { day: 5, title: 'بروتوكول المساء', subtitle: 'انتهِ ببطء — لا تنقطع فجأة', tasks: [{ id: 'r5t1', text: 'روتين ثابت آخر ساعة: قراءة، استرخاء، دعاء', durationMinutes: 0, emoji: '📖' }, { id: 'r5t2', text: 'اكتب 3 أشياء أنجزتها اليوم', durationMinutes: 5, emoji: '✍️' }, { id: 'r5t3', text: 'تنفس 4-4-6 ثلاث دقائق', durationMinutes: 3, emoji: '🫁' }] },
            { day: 6, title: 'الرقمي والإيقاع', subtitle: 'الفوضى الرقمية تُدمر الإيقاع', tasks: [{ id: 'r6t1', text: 'أوقات محددة للأخبار والسوشيال (لا كل وقت)', durationMinutes: 0, emoji: '📱' }, { id: 'r6t2', text: 'لا هاتف في غرفة النوم (أو بعيداً عن السرير)', durationMinutes: 0, emoji: '📵' }, { id: 'r6t3', text: 'أوقات «انفصال رقمي» يومية', durationMinutes: 0, emoji: '🌿' }] },
            { day: 7, title: 'تقييم الإيقاع', subtitle: 'ما الذي تغيّر؟', tasks: [{ id: 'r7t1', text: 'قيّم: كيف إيقاعك اليوم مقارنة بالأسبوع الماضي؟', durationMinutes: 0, emoji: '📊' }, { id: 'r7t2', text: 'اختر 3 عادات ستستمر بها في الأسبوع القادم', durationMinutes: 0, emoji: '⭐' }, { id: 'r7t3', text: 'ضع تذكيراً أسبوعياً لمراجعة إيقاعك', durationMinutes: 0, emoji: '🔔' }] },
        ],
    },

    'ruhi_rhythm_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'تقييم مستوى انتظام إيقاعك اليومي',
        intro: 'الإيقاع اليومي المنتظم هو أساس الصحة — النوم والأكل والحركة والضوء في مواعيد منتظمة.',
        questions: [
            { id: 'rq1', text: 'هل تنام وتستيقظ في نفس المواعيد (±1 ساعة) يومياً؟', options: [{ value: 0, label: 'نعم دائماً تقريباً' }, { value: 1, label: 'معظم الأيام' }, { value: 2, label: 'أحياناً فقط' }, { value: 3, label: 'لا — متغير جداً' }] },
            { id: 'rq2', text: 'هل تأكل وجباتك في أوقات منتظمة يومياً؟', options: [{ value: 0, label: 'نعم منتظم' }, { value: 1, label: 'معظم الأوقات' }, { value: 2, label: 'أحياناً' }, { value: 3, label: 'لا — أوقات عشوائية' }] },
            { id: 'rq3', text: 'هل تتعرض للضوء الطبيعي في الصباح بانتظام؟', options: [{ value: 0, label: 'نعم — أول شيء صباحاً' }, { value: 1, label: 'في الغالب' }, { value: 2, label: 'نادراً' }, { value: 3, label: 'لا تقريباً' }] },
            { id: 'rq4', text: 'هل لديك روتين ثابت قبل النوم؟', options: [{ value: 0, label: 'نعم — محدد وثابت' }, { value: 1, label: 'في الغالب' }, { value: 2, label: 'أحياناً' }, { value: 3, label: 'لا — أنام عشوائياً' }] },
            { id: 'rq5', text: 'كيف يؤثر اضطراب إيقاعك على يومك؟', options: [{ value: 0, label: 'لا تأثير — إيقاعي منتظم' }, { value: 1, label: 'تأثير خفيف' }, { value: 2, label: 'يؤثر على طاقتي ومزاجي' }, { value: 3, label: 'يُعطّل يومي بوضوح' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'إيقاع منتظم', message: 'إيقاعك جيد — الحفاظ عليه هو المهمة الأساسية.', nextStep: 'أضف ضوء الشمس الصباحي كعادة ثابتة.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'إيقاع متذبذب', message: 'الانتظام متقطع — تحتاج بناء روتين أقوى.', nextStep: 'ابدأ بروتوكول إعادة الإيقاع 7 أيام.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'اضطراب إيقاع واضح', message: 'إيقاعك مختل بشكل واضح — هذا يؤثر على كل شيء: النوم، الطاقة، المزاج.', nextStep: 'ابدأ البروتوكول مباشرة + ميعاد استيقاظ ثابت الغداً.' },
        ],
    },

    'ruhi_rhythm_practice': {
        type: 'practice',
        durationMinutes: 5,
        goal: 'روتين الصباح المُعيد للإيقاع — في 5 دقائق فقط',
        intro: 'الساعات الأولى من الصباح تُبرمج باقي اليوم بيولوجياً.',
        steps: [
            { index: 1, instruction: 'استيقظ في نفس الموعد — لا تضغط "تأجيل"', durationSeconds: 10 },
            { index: 2, instruction: 'افتح النافذة أو اخرج — الضوء الطبيعي أول شيء', durationSeconds: 30 },
            { index: 3, instruction: 'اشرب كوب ماء كامل — قبل أي شيء آخر', durationSeconds: 15 },
            { index: 4, instruction: 'حرّك جسمك: مشي في المكان أو تمدد خفيف 2 دقيقة', durationSeconds: 120 },
            { index: 5, instruction: 'تنفس واعٍ 3 مرات عميقة — أعلن أن اليوم بدأ', durationSeconds: 20 },
        ],
        closingNote: 'هذا الروتين يُطلق إشارات بيولوجية تُنظّم الكورتيزول، الميلاتونين، والدورة اليومية كلها.',
        repeatSuggestion: 'كل يوم — بلا استثناء حتى عطلة نهاية الأسبوع — لمدة أسبوعين',
    },

    'ruhi_rhythm_workshop': {
        type: 'workshop',
        durationMinutes: 8,
        goal: 'فهم الإيقاع البيولوجي وكيف يتحكم في صحتك',
        intro: 'الساعة البيولوجية ليست مجازاً — هي جهاز فيزيائي حقيقي يُحدد متى تنام، متى تصحو، متى يعمل جهازك المناعي.',
        sections: [
            { title: 'الإيقاع اليوماوي Circadian', emoji: '☀️', body: 'كل خلية في جسمك تعمل على دورة 24 ساعة تقريباً. الضوء هو المُنظّم الأساسي — الضوء الطبيعي صباحاً يُثبّت الدورة، الظلام مساءً يُطلق الميلاتونين. أي خلل في هذه الإشارات يُعطّل كل شيء: نوم، طاقة، مناعة، مزاج.' },
            { title: 'ما يُدمّر الإيقاع', emoji: '📱', body: 'أخطر مُدمّرات الإيقاع: الضوء الأزرق ليلاً، الأوقات العشوائية للنوم والأكل، القيلولة الطويلة، والعمل في الليل. الحياة الحديثة تحارب الساعة البيولوجية — وهذا يفسّر ارتفاع اضطرابات النوم والاكتئاب الموسمي.' },
            { title: 'ثلاثة مفاتيح للإصلاح', emoji: '🔑', body: 'ثلاثة تغييرات فقط تُعيد الإيقاع خلال أسبوعين: 1) استيقظ في نفس الوقت يومياً حتى في العطلة. 2) ضوء طبيعي أول 30 دقيقة من الصباح. 3) لا شاشات ساعة قبل النوم. هذه الثلاثة وحدها تُغيّر كيفية عمل ساعتك البيولوجية.' },
        ],
        keyTakeaways: [
            'الانتظام في مواعيد النوم أهم من عدد ساعات النوم',
            'الضوء الصباحي هو المُبرمج الرئيسي للساعة البيولوجية',
            'حتى عطلة نهاية الأسبوع — حافظ على ميعاد الاستيقاظ',
        ],
        closingAction: 'غداً: استيقظ في نفس الوقت المعتاد واخرج للضوء أول 10 دقائق. جرّب فقط.',
    },

    'ruhi_rhythm_tracker': {
        type: 'tracker',
        durationMinutes: 1,
        goal: 'تتبع انتظام الإيقاع اليومي: نوم، استيقاظ، ضوء',
        intro: 'سجّل كل يوم — نبحث عن نمط الانتظام الذي يُبني الإيقاع.',
        insight: 'بعد 5 أيام من التتبع ستبدأ ترى: أيام الانتظام = أيام أحسن طاقةً ومزاجاً.',
        fields: [
            { id: 'sleep_time',   label: 'ميعاد النوم الليلة الماضية', emoji: '🌙', type: 'choice', options: ['قبل 10', '10-11', '11-12', '12-1', 'بعد 1', 'غير منتظم'] },
            { id: 'wake_time',    label: 'ميعاد الاستيقاظ', emoji: '☀️', type: 'choice', options: ['5-6 ص', '6-7 ص', '7-8 ص', '8-9 ص', 'بعد 9', 'غير منتظم'] },
            { id: 'rhythm_score', label: 'مستوى انتظام يومك عموماً', emoji: '🔄', type: 'scale', min: 1, max: 10 },
            { id: 'sunlight',     label: 'هل تعرّضت للضوء الطبيعي صباحاً؟', emoji: '🌅', type: 'boolean' },
            { id: 'note',         label: 'ملاحظة (اختياري)', emoji: '📝', type: 'text' },
        ],
    },

    /* ─────────────────────────────────────────────────────
       RUHI / PEACE  —  السكينة الداخلية
       ───────────────────────────────────────────────────── */

    'ruhi_peace_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'قياس مستوى السكينة الداخلية وتحديد مصادر الاضطراب',
        intro: 'السكينة ليست غياب المشاكل — هي القدرة على البقاء مستقراً في وسط العواصف.',
        questions: [
            { id: 'peq1', text: 'هل تشعر بهدوء داخلي حقيقي في معظم أوقات يومك؟', options: [{ value: 0, label: 'نعم — أشعر باستقرار عميق' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'نادراً' }, { value: 3, label: 'لا — قلق مستمر داخلي' }] },
            { id: 'peq2', text: 'هل تستطيع إسكات الضوضاء الداخلية والجلوس هادئاً؟', options: [{ value: 0, label: 'نعم — أستمتع بالهدوء' }, { value: 1, label: 'نوعاً ما' }, { value: 2, label: 'صعب — أحتاج تشتيتاً دائماً' }, { value: 3, label: 'لا أستطيع — الصمت يُقلقني' }] },
            { id: 'peq3', text: 'هل الأحداث الخارجية تُزعزع استقرارك الداخلي بسهولة؟', options: [{ value: 0, label: 'لا — أتأثر ثم أعود' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً — أنفعل بشدة' }] },
            { id: 'peq4', text: 'هل تشعر بسلام مع نفسك عموماً؟', options: [{ value: 0, label: 'نعم — رضا عموماً' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'نادراً' }, { value: 3, label: 'لا — صراع داخلي مستمر' }] },
            { id: 'peq5', text: 'هل تستطيع التسامح مع الغموض وعدم اليقين؟', options: [{ value: 0, label: 'نعم — الحياة غير مؤكدة وأقبل ذلك' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'أتعب من الغموض' }, { value: 3, label: 'لا — القلق من المجهول يُرهقني' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'سكينة صحية', message: 'لديك أساس طيب من الاستقرار الداخلي. يمكن تعميقه.', nextStep: 'تمرين الحضور اليومي 5 دقائق كتعزيز.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'سكينة متذبذبة', message: 'سكينتك تتأثر بالظروف الخارجية أكثر من اللازم. يمكن بناء ثبات أعمق.', nextStep: 'ابدأ بروتوكول السكينة الداخلية 7 أيام.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'اضطراب داخلي مزمن', message: 'الصخب الداخلي يُرهقك ويُنهك طاقتك. الهدوء ممكن — قابل للتعلم.', nextStep: 'ابدأ البروتوكول + استكشف الذكر والتأمل وجلسات الهدوء المتخصصة.' },
        ],
    },

    'ruhi_peace_practice': {
        type: 'practice',
        durationMinutes: 7,
        goal: 'تمرين الحضور الكامل في اللحظة — إسكات الضوضاء الداخلية',
        intro: 'السكينة لا تُوجَد في الماضي أو المستقبل — توجد فقط في هذه اللحظة.',
        steps: [
            { index: 1, instruction: 'اجلس بهدوء وأغلق عينيك — لا أجندة لهذه الدقائق', durationSeconds: 10 },
            { index: 2, instruction: 'لاحظ تنفسك فقط: هواء داخل، هواء خارج', durationSeconds: 60 },
            { index: 3, instruction: 'إذا جاء فكر — لاحظه فقط ولا تتبعه، كغيمة تمر', durationSeconds: 60 },
            { index: 4, instruction: 'أصغِ للأصوات حولك — سماعة واعية لا حاكمة', durationSeconds: 30 },
            { index: 5, instruction: 'انتبه للشعور الجسدي: ظهرك بالكرسي، يداك على ركبتيك', durationSeconds: 30 },
            { index: 6, instruction: 'تنفّس من البطن ببطء 5 مرات — ثم افتح عينيك بهدوء', durationSeconds: 30 },
        ],
        closingNote: 'السكينة مهارة — تبنى بالتكرار. 7 دقائق يومياً تُغيّر الكيمياء الداخلية.',
        repeatSuggestion: 'صباحاً قبل اليوم — أو مساءً كإغلاق ليوم كامل',
    },

    'ruhi_peace_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'بناء قاعدة من السكينة الداخلية عبر الحضور والذكر والتقبّل',
        howItWorks: 'أسبوع: حضور + ذكر + قبول + إسقاط + صلة بالله = سكينة متراكمة.',
        completionMessage: 'أسبوع من البناء الداخلي — السكينة لا تُوهب بل تُزرع.',
        days: [
            { day: 1, title: 'الحضور في اللحظة', subtitle: 'أنت هنا الآن', tasks: [{ id: 'pe1t1', text: 'تمرين الحضور 7 دقائق (الخطوات أعلاه)', durationMinutes: 7, emoji: '🧘' }, { id: 'pe1t2', text: 'خلال اليوم: 3 مرات توقف لثانية وقل «أنا هنا الآن»', durationMinutes: 0, emoji: '🌿' }, { id: 'pe1t3', text: 'لاحظ: متى تشعر بأكبر قدر من السكينة خلال اليوم؟', durationMinutes: 0, emoji: '🔍' }] },
            { day: 2, title: 'قوة الذكر', subtitle: 'الذكر مهدّئ عصبي حقيقي', tasks: [{ id: 'pe2t1', text: '100 تسبيحة صباحاً — سبحان الله وبحمده', durationMinutes: 5, emoji: '📿' }, { id: 'pe2t2', text: 'ذكر مستمر خلال المشي أو الانتظار', durationMinutes: 0, emoji: '🚶' }, { id: 'pe2t3', text: '100 تسبيحة مساءً قبل النوم', durationMinutes: 5, emoji: '🌙' }] },
            { day: 3, title: 'قبول ما لا يُغيَّر', subtitle: 'الصراع مع الواقع هو مصدر الشقاء', tasks: [{ id: 'pe3t1', text: 'اكتب: ما الشيء الذي تقاومه ولا تستطيع تغييره؟', durationMinutes: 5, emoji: '📝' }, { id: 'pe3t2', text: 'مارس القبول: «هذا ما هو. ما الخطوة التالية؟»', durationMinutes: 0, emoji: '✅' }, { id: 'pe3t3', text: 'الفرق: القبول ≠ الرضا بالظلم — هو وقف استنزاف الطاقة في المقاومة', durationMinutes: 0, emoji: '🔍' }] },
            { day: 4, title: 'إسقاط الأثقال', subtitle: 'ما الذي تحمله زيادة؟', tasks: [{ id: 'pe4t1', text: 'اكتب ثلاثة أعباء داخلية تحملها: ذنوب، مخاوف، توقعات تعبك', durationMinutes: 5, emoji: '🎒' }, { id: 'pe4t2', text: 'ضع كلاً منها في يد الله — دعاء واعٍ بتسليم', durationMinutes: 5, emoji: '🤲' }, { id: 'pe4t3', text: 'تمرين الحضور 5 دقائق بعد الإسقاط', durationMinutes: 5, emoji: '🧘' }] },
            { day: 5, title: 'الصلة بالله', subtitle: 'المصدر الأعمق للسكينة', tasks: [{ id: 'pe5t1', text: 'صلاة واحدة على الأقل بخشوع حقيقي — لا ميكانيكية', durationMinutes: 5, emoji: '🕌' }, { id: 'pe5t2', text: 'جلس بعد الصلاة 5 دقائق في صمت واعٍ', durationMinutes: 5, emoji: '🌿' }, { id: 'pe5t3', text: 'اقرأ آيات من القرآن وتأمّل معناها', durationMinutes: 10, emoji: '📖' }] },
            { day: 6, title: 'الطبيعة والسكينة', subtitle: 'الطبيعة تُعيد الإنسان لأصله', tasks: [{ id: 'pe6t1', text: 'اقضِ 20 دقيقة في الهواء الطلق بلا هاتف', durationMinutes: 20, emoji: '🌳' }, { id: 'pe6t2', text: 'لاحظ: السماء، الأشجار، الهواء — بعيون واعية', durationMinutes: 0, emoji: '👁️' }, { id: 'pe6t3', text: 'تنفس بعمق وقل شكراً لكل ما تراه', durationMinutes: 3, emoji: '🙏' }] },
            { day: 7, title: 'التقييم والاستمرار', subtitle: 'كيف سكينتك الآن؟', tasks: [{ id: 'pe7t1', text: 'قيّم سكينتك الداخلية يوم 1 ويوم 7 (1-10)', durationMinutes: 2, emoji: '📊' }, { id: 'pe7t2', text: 'ما الأداة التي أثّرت أكثر؟ اجعلها عادة يومية', durationMinutes: 2, emoji: '⭐' }, { id: 'pe7t3', text: 'السكينة لا تنتهي هنا — هي طريق مستمر', durationMinutes: 0, emoji: '🌊' }] },
        ],
    },

    'ruhi_peace_workshop': {
        type: 'workshop',
        durationMinutes: 8,
        goal: 'فهم ما هي السكينة الحقيقية وكيف تُبنى ويُحافظ عليها',
        intro: 'السكينة ليست حالة تُصل إليها مرة وتبقى — هي ممارسة يومية.',
        sections: [
            { title: 'ما السكينة وما ليست كذلك', emoji: '🕊️', body: 'السكينة ليست: الابتعاد عن الدنيا، غياب الألم، أو تجنب المشاكل. السكينة هي: القدرة على البقاء مستقراً وسط ما يحدث. شخص يمر بمحنة ويبقى مستقراً داخلياً — هذا أعلى درجات السكينة.' },
            { title: 'علم الهدوء الداخلي', emoji: '🧠', body: 'الجهاز العصبي اللاودّي هو «وضع الراحة» في الجسم. الذكر، التنفس البطيء، الطبيعة، والحضور في اللحظة — كلها تُنشّطه وتُخفض الكورتيزول. السكينة ليست مجرد شعور — لها أساس فيزيولوجي قابل للقياس.' },
            { title: 'الهدوء في القرآن - وجهة النظر الإسلامية', emoji: '📖', body: 'في القرآن: «ألا بذكر الله تطمئن القلوب». الذكر هو التقنية الأعمق للسكينة — ليس لأنه «دين» فقط بل لأنه يُنظّم الجهاز العصبي فعلياً. الصلة بالله تُعطي الإنسان مرجعاً ثابتاً في عالم متغير.' },
        ],
        keyTakeaways: [
            'السكينة مهارة تُبنى — ليست هبة تأتي صدفةً',
            'الذكر والتنفس والطبيعة أدوات سكينة بيولوجية ببُعد روحي',
            'أعمق سكينة تأتي من التسليم الحقيقي لله لا من إخفاء المشاعر',
        ],
        closingAction: 'اليوم: 5 دقائق صمت واعٍ — لا هاتف، لا موسيقى، فقط أنت وتنفسك.',
    },

    'ruhi_peace_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'رصد مستوى السكينة يومياً وتتبع ما يرفعها وما يُزعزعها',
        intro: 'سجّل بصدق — السكينة لها أنماط يمكن فهمها.',
        insight: 'بعد أسبوع ستعرف: هل يزعزع سكينتك الناس؟ الأخبار؟ القلق؟ العمل؟',
        fields: [
            { id: 'peace_level',    label: 'مستوى السكينة الداخلية اليوم', emoji: '🕊️', type: 'scale', min: 1, max: 10 },
            { id: 'dhikr_done',     label: 'هل مارست الذكر أو الحضور اليوم؟', emoji: '📿', type: 'boolean' },
            { id: 'peace_disruptor', label: 'أكثر ما زعزع سكينتك', emoji: '⚡', type: 'choice', options: ['لا شيء', 'خبر سيء', 'شخص معين', 'قلق من المستقبل', 'عمل/ضغط', 'سوشيال ميديا', 'أخرى'] },
            { id: 'recovery',       label: 'هل عدت للهدوء؟', emoji: '🔄', type: 'choice', options: ['لم أفقده', 'نعم — استعدته', 'جزئياً', 'لا — بقيت مضطرباً'] },
            { id: 'note',           label: 'ملاحظة', emoji: '📝', type: 'text' },
        ],
    },

    /* ─────────────────────────────────────────────────────
       RUHI / MEANING  —  المعنى والهدف
       ───────────────────────────────────────────────────── */

    'ruhi_meaning_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'قياس مستوى الشعور بالمعنى والهدف في حياتك',
        intro: 'الإنسان يمكنه تحمّل أي كيف إذا عرف لماذا — الشعور بالمعنى هو أقوى وقود للحياة.',
        questions: [
            { id: 'mnq1', text: 'هل تشعر أن حياتك لها معنى وهدف واضح؟', options: [{ value: 0, label: 'نعم — واضح وقوي' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'نادراً' }, { value: 3, label: 'لا — أشعر بالفراغ' }] },
            { id: 'mnq2', text: 'هل تستيقظ صباحاً وعندك ما تنتظره أو تسعى إليه؟', options: [{ value: 0, label: 'نعم — متحمس عموماً' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'نادراً' }, { value: 3, label: 'لا — أيامي متشابهة وفارغة' }] },
            { id: 'mnq3', text: 'هل تشعر أن ما تفعله يُساهم في شيء أكبر منك؟', options: [{ value: 0, label: 'نعم — مساهمتي واضحة لي' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'نادراً' }, { value: 3, label: 'لا — أشعر بالعبثية' }] },
            { id: 'mnq4', text: 'هل تعرف قيمك الأساسية وتعيش وفقها؟', options: [{ value: 0, label: 'نعم — واضحة لي وأعيشها' }, { value: 1, label: 'بعضها واضح' }, { value: 2, label: 'غير واضحة' }, { value: 3, label: 'لا — حياتي لا تعكس ما أؤمن به' }] },
            { id: 'mnq5', text: 'هل الملل أو الشعور بالفراغ يُزعجك كثيراً؟', options: [{ value: 0, label: 'نادراً — لدي ما يشغلني بعمق' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً — فراغ داخلي مستمر' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'معنى قوي', message: 'تشعر بهدف واضح — هذا أقوى واقٍ نفسي.', nextStep: 'عمّق صلتك بمعناك وشاركه مع من حولك.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'معنى متذبذب', message: 'تشعر بالمعنى أحياناً لكنه ليس ثابتاً — يمكن تعميقه.', nextStep: 'ابدأ بروتوكول اكتشاف المعنى 7 أيام.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'فراغ وجودي', message: 'الشعور بعدم المعنى يُؤثر بشكل عميق على طاقتك وصحتك. يمكن إيجاد المعنى — يحتاج استكشافاً.', nextStep: 'ابدأ البروتوكول + فكّر في جلسات Logotherapy أو استشارة روحية.' },
        ],
    },

    'ruhi_meaning_practice': {
        type: 'practice',
        durationMinutes: 10,
        goal: 'تمرين اكتشاف المعنى الشخصي عبر أسئلة عميقة',
        intro: 'المعنى لا يُوجد في كتب فلسفية — هو في إجاباتك على أسئلة حقيقية.',
        steps: [
            { index: 1, instruction: 'اكتب إجابة على: ما الذي يُشعرك بالحياة أكثر؟', durationSeconds: 60 },
            { index: 2, instruction: 'اكتب: ما الذي تفعله ويُحدث فرقاً للآخرين؟', durationSeconds: 60 },
            { index: 3, instruction: 'اكتب: في أي لحظات نسيت الوقت لانشغالك بشيء تحبه؟', durationSeconds: 60 },
            { index: 4, instruction: 'اقرأ ما كتبت — ابحث عن موضوع مشترك', durationSeconds: 30 },
            { index: 5, instruction: 'أكمل الجملة: «معناي هو أن أكون / أفعل / أُساهم في...»', durationSeconds: 30 },
            { index: 6, instruction: 'اكتب خطوة واحدة صغيرة نحو هذا المعنى اليوم', durationSeconds: 20 },
        ],
        closingNote: 'المعنى ليس شيئاً تجده — هو شيء تختاره وتبنيه يومياً بأفعال صغيرة.',
        repeatSuggestion: 'أسبوعياً — وفي أوقات التشكيك في المسار',
    },

    'ruhi_meaning_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'اكتشاف وتعميق الشعور بالمعنى الشخصي',
        howItWorks: 'أسبوع: استكشاف + تجربة + ربط + فعل = معنى حيّ.',
        completionMessage: 'أسبوع من البحث عن المعنى — اكتشفت شيئاً عن نفسك لم تكن تعرفه.',
        days: [
            { day: 1, title: 'ما الذي يهمك؟', subtitle: 'القيم هي بوصلة المعنى', tasks: [{ id: 'mn1t1', text: 'اكتب قائمة بـ 10 أشياء تهمك في الحياة', durationMinutes: 5, emoji: '📝' }, { id: 'mn1t2', text: 'اختر الـ 3 الأهم — هؤلاء قيمك الجوهرية', durationMinutes: 3, emoji: '🎯' }, { id: 'mn1t3', text: 'اسأل: هل حياتك اليومية تعكس هذه القيم؟', durationMinutes: 0, emoji: '🔍' }] },
            { day: 2, title: 'اللحظات ذات المعنى', subtitle: 'ما الذي عشته بعمق؟', tasks: [{ id: 'mn2t1', text: 'اكتب 3 لحظات في حياتك شعرت فيها بمعنى حقيقي', durationMinutes: 10, emoji: '✍️' }, { id: 'mn2t2', text: 'ما المشترك بين هذه اللحظات؟', durationMinutes: 5, emoji: '🔍' }, { id: 'mn2t3', text: 'كيف تُعيد خلق هذا النوع من اللحظات؟', durationMinutes: 3, emoji: '💡' }] },
            { day: 3, title: 'المساهمة والأثر', subtitle: 'المعنى يتضاعف حين نُعطي', tasks: [{ id: 'mn3t1', text: 'افعل شيئاً واحداً ينفع شخصاً آخر اليوم', durationMinutes: 0, emoji: '🤝' }, { id: 'mn3t2', text: 'لاحظ كيف تشعر بعده', durationMinutes: 2, emoji: '🔍' }, { id: 'mn3t3', text: 'اكتب: كيف يمكنني الإسهام بشكل منتظم؟', durationMinutes: 5, emoji: '📝' }] },
            { day: 4, title: 'الربط بالمطلق', subtitle: 'المعنى يتعمق حين يتصل بالله', tasks: [{ id: 'mn4t1', text: 'تأمل: كيف عملك / حياتك / علاقاتك خدمة لله؟', durationMinutes: 5, emoji: '🤲' }, { id: 'mn4t2', text: 'اقرأ آية عن الغاية والخلق وتأمّل فيها', durationMinutes: 5, emoji: '📖' }, { id: 'mn4t3', text: 'اكتب نيّة يومية: «اليوم أعمل وأعيش لـ...»', durationMinutes: 2, emoji: '✍️' }] },
            { day: 5, title: 'الهواية والشغف', subtitle: 'ما الذي تفعله بلا مقابل لأنه يُسعدك؟', tasks: [{ id: 'mn5t1', text: 'خصّص ساعة لهواية أو نشاط تحبه', durationMinutes: 60, emoji: '🎨' }, { id: 'mn5t2', text: 'لاحظ: هل نسيت الوقت؟ هل شعرت بالحياة؟', durationMinutes: 0, emoji: '🌟' }, { id: 'mn5t3', text: 'هذا الشعور هو مؤشر على بُعد من معناك', durationMinutes: 0, emoji: '🔍' }] },
            { day: 6, title: 'الرسالة الشخصية', subtitle: 'صياغة معناك بجملة', tasks: [{ id: 'mn6t1', text: 'اكتب: «أنا هنا لـ...» — مهما كانت بسيطة', durationMinutes: 5, emoji: '✍️' }, { id: 'mn6t2', text: 'هل هذه الجملة تمثّلك؟ عدّلها حتى تشعر بصحتها', durationMinutes: 5, emoji: '🔧' }, { id: 'mn6t3', text: 'اجعلها خلفية هاتفك أو علّقها أمامك', durationMinutes: 0, emoji: '📌' }] },
            { day: 7, title: 'التقييم والبقاء', subtitle: 'كيف تُبقي المعنى حياً؟', tasks: [{ id: 'mn7t1', text: 'قيّم شعورك بالمعنى يوم 1 ومقارنةً بيوم 7', durationMinutes: 2, emoji: '📊' }, { id: 'mn7t2', text: 'ما الشيء الواحد الأكثر تأثيراً هذا الأسبوع؟', durationMinutes: 0, emoji: '⭐' }, { id: 'mn7t3', text: 'خصّص 10 دقائق أسبوعياً لمراجعة رسالتك الشخصية', durationMinutes: 0, emoji: '🔄' }] },
        ],
    },

    'ruhi_meaning_workshop': {
        type: 'workshop',
        durationMinutes: 10,
        goal: 'فهم علم المعنى وكيف يُبنى في حياجنا اليومية',
        intro: 'الإنسان يمكنه العيش بدون سعادة — لكن لا يستطيع العيش بدون معنى.',
        sections: [
            { title: 'Logotherapy وعلم المعنى', emoji: '🔬', body: 'فيكتور فرانكل، الطبيب الذي نجا من معسكرات الاعتقال، اكتشف أن من يملك «لماذا» يستطيع تحمّل أي «كيف». علم Logotherapy يقول: المعنى موجود في كل موقف — حتى في المعاناة — لكنه يحتاج أن يُكتشف.' },
            { title: 'ثلاثة مصادر للمعنى', emoji: '🌊', body: 'فرانكل حدد ثلاثة مصادر: 1) الإبداع والعطاء — ما تُقدمه للعالم. 2) الاختبار والتجربة — اللحظات الجميلة التي تعيشها. 3) الموقف — كيف تواجه ما لا تختاره. أحياناً المعنى يأتي فقط من كيفية تعاملنا مع ما لا نختاره.' },
            { title: 'المعنى في الإسلام', emoji: '🌙', body: 'الإسلام يُعطي المسلم إجابة جاهزة على سؤال المعنى: «وما خلقت الجن والإنس إلا ليعبدون». كل عمل يوميّ يصبح عبادة بالنية. هذا يُحوّل المأكل والعمل والعلاقات إلى أفعال ذات معنى وأثر أخروي.' },
        ],
        keyTakeaways: [
            'المعنى لا يُوجَد — يُبنى ويُختار يومياً',
            'حتى المعاناة يمكن أن تكون ذات معنى إذا أُحسن التعامل معها',
            'الإسلام يُعطي إطاراً عميقاً للمعنى يتجاوز الأهداف الدنيوية',
        ],
        closingAction: 'اليوم: اكتب جملة واحدة تصف لماذا أنت هنا — حتى لو بسيطة.',
    },

    'ruhi_meaning_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'تتبع الشعور بالمعنى يومياً وتحديد ما يُغذّيه أو يُفرّغه',
        intro: 'سجّل يومياً — المعنى يرتفع وينخفض. الوعي به هو الخطوة الأولى.',
        insight: 'بعد أسبوع ستعرف: أي الأنشطة تُشعرك بالمعنى أكثر؟',
        fields: [
            { id: 'meaning_level', label: 'مستوى الشعور بالمعنى اليوم', emoji: '🌟', type: 'scale', min: 1, max: 10 },
            { id: 'meaningful_act', label: 'هل فعلت شيئاً ذا معنى اليوم؟', emoji: '✅', type: 'boolean' },
            { id: 'source',        label: 'مصدر المعنى اليوم', emoji: '💡', type: 'choice', options: ['لا يوجد', 'عمل/إنجاز', 'علاقة/اتصال', 'عبادة/ذكر', 'إبداع', 'مساعدة الآخرين', 'أخرى'] },
            { id: 'empty_feel',    label: 'هل شعرت بفراغ أو عبثية اليوم؟', emoji: '🌫️', type: 'boolean' },
            { id: 'note',          label: 'ملاحظة', emoji: '📝', type: 'text' },
        ],
    },

    /* ─────────────────────────────────────────────────────
       RUHI / DEPLETION  —  الاستنزاف الروحي
       ───────────────────────────────────────────────────── */

    'ruhi_depletion_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'قياس مستوى الاستنزاف الروحي والداخلي',
        intro: 'الاستنزاف الروحي مختلف عن التعب الجسدي — هو شعور بالجفاف الداخلي وانقطاع الصلة.',
        questions: [
            { id: 'deq1', text: 'هل تشعر بجفاف داخلي — كأنك فارغ روحياً؟', options: [{ value: 0, label: 'لا — ممتلئ روحياً' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً — جفاف مستمر' }] },
            { id: 'deq2', text: 'هل فقدت الشغف بأشياء كنت تحبها؟', options: [{ value: 0, label: 'لا — شغفي حيّ' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'نعم — كل شيء بات بلا طعم' }] },
            { id: 'deq3', text: 'هل أصبحت أقل تعاطفاً أو أكثر برودة مع الآخرين؟', options: [{ value: 0, label: 'لا — تعاطفي طبيعي' }, { value: 1, label: 'تناقص قليلاً' }, { value: 2, label: 'تناقص بشكل واضح' }, { value: 3, label: 'نعم — لا أشعر بالكثير' }] },
            { id: 'deq4', text: 'هل تشعر بأن صلتك بالله أو الروحانية ضعفت؟', options: [{ value: 0, label: 'لا — صلتي قوية' }, { value: 1, label: 'قليلاً' }, { value: 2, label: 'بشكل ملحوظ' }, { value: 3, label: 'نعم — قُطعت تقريباً' }] },
            { id: 'deq5', text: 'هل تؤدي واجباتك وعباداتك بشكل ميكانيكي بلا روح؟', options: [{ value: 0, label: 'لا — أفعلها بوعي وقلب' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً — كل شيء ميكانيكي' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'روح حيّة', message: 'روحك تتغذى جيداً — حافظ على ما تفعله.', nextStep: 'أضف ممارسة تأملية بسيطة كتعميق.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'استنزاف روحي بدأ', message: 'هناك جفاف داخلي يتشكّل — تحتاج تغذية صادقة قبل أن يتعمق.', nextStep: 'ابدأ بروتوكول إعادة الحياة الروحية 7 أيام.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'استنزاف روحي عميق', message: 'الجفاف الداخلي يُؤثر على كل جانب من حياتك. يحتاج اهتماماً متعمّداً.', nextStep: 'ابدأ البروتوكول + فكّر في خلوة، اعتكاف، أو إرشاد روحي.' },
        ],
    },

    'ruhi_depletion_practice': {
        type: 'practice',
        durationMinutes: 8,
        goal: 'تمرين إعادة التواصل الروحي — ملء ما يفرغ',
        intro: 'الجفاف الروحي يحتاج ماءً — المياه الروحية هي الذكر والتأمل والصلة الحقيقية.',
        steps: [
            { index: 1, instruction: 'اجلس بهدوء وأغلق عينيك', durationSeconds: 10 },
            { index: 2, instruction: 'اسأل نفسك: ما الذي يُفرّغني روحياً؟ (لا تُجيب — فقط لاحظ)', durationSeconds: 30 },
            { index: 3, instruction: 'قل من قلبك: «يا الله، أنا بحاجة لك» — ثلاث مرات', durationSeconds: 20 },
            { index: 4, instruction: 'اقرأ تحديداً: «ألا بذكر الله تطمئن القلوب» وتأمّل', durationSeconds: 30 },
            { index: 5, instruction: 'سبّح 33 مرة: سبحان الله — 33: الحمد لله — 34: الله أكبر', durationSeconds: 120 },
            { index: 6, instruction: 'قبل أن تفتح عينيك: اشكر الله على 3 أشياء صغيرة', durationSeconds: 30 },
        ],
        closingNote: 'الروح كالجسم — تحتاج غذاءً يومياً. إهمالها يؤدي لجفاف حقيقي.',
        repeatSuggestion: 'يومياً — خاصة في الأوقات التي تشعر فيها بالجفاف والفراغ',
    },

    'ruhi_depletion_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'إعادة إحياء الروح وملء ما أُفرّغ عبر أسبوع من التغذية الروحية المكثّفة',
        howItWorks: 'أسبوع مكثّف: صلة + ذكر + طبيعة + إسقاط + شكر + خلوة = إعادة إحياء.',
        completionMessage: 'أسبوع من التغذية الروحية — الروح تعود للحياة بالتراكم.',
        days: [
            { day: 1, title: 'إدارة المستنزفات', subtitle: 'وقف النزيف أولاً', tasks: [{ id: 'dep1t1', text: 'حدد 3 أشياء تستنزف روحك أكثر (علاقات؟ محتوى؟ عمل؟)', durationMinutes: 5, emoji: '🔍' }, { id: 'dep1t2', text: 'قلّل أو أوقف واحداً منها لهذا الأسبوع', durationMinutes: 0, emoji: '✂️' }, { id: 'dep1t3', text: 'تمرين إعادة التواصل (أعلاه)', durationMinutes: 8, emoji: '🌿' }] },
            { day: 2, title: 'صلاة بروح', subtitle: 'كل صلاة فرصة للتجدد', tasks: [{ id: 'dep2t1', text: 'صلّ صلاة واحدة على الأقل بخشوع كامل — لا عجلة', durationMinutes: 10, emoji: '🕌' }, { id: 'dep2t2', text: 'قبل الصلاة: توضأ ببطء وتأمّل في كل خطوة', durationMinutes: 5, emoji: '💧' }, { id: 'dep2t3', text: 'اجلس بعد الصلاة 5 دقائق في صمت واعٍ', durationMinutes: 5, emoji: '🧘' }] },
            { day: 3, title: 'قراءة القرآن', subtitle: 'الغذاء الروحي الأعمق', tasks: [{ id: 'dep3t1', text: 'اقرأ ربع حزب على الأقل مع الفهم', durationMinutes: 10, emoji: '📖' }, { id: 'dep3t2', text: 'توقف عند آية تلمس قلبك وأعد قراءتها', durationMinutes: 0, emoji: '💛' }, { id: 'dep3t3', text: 'اكتب الآية وضعها في مكان تراه', durationMinutes: 2, emoji: '📌' }] },
            { day: 4, title: 'الطبيعة والصمت', subtitle: 'الجفاف الروحي يُعالج بالصمت الطبيعي', tasks: [{ id: 'dep4t1', text: '30 دقيقة في الطبيعة بلا هاتف', durationMinutes: 30, emoji: '🌳' }, { id: 'dep4t2', text: 'تأمل: السماء، الأشجار، الريح — كيف تشعر؟', durationMinutes: 0, emoji: '🌿' }, { id: 'dep4t3', text: 'اكتب ثلاثة أشياء تشكر الله عليها الآن', durationMinutes: 2, emoji: '🙏' }] },
            { day: 5, title: 'العطاء الروحي', subtitle: 'الروح حين تُعطي — تُملأ', tasks: [{ id: 'dep5t1', text: 'افعل شيئاً لشخص لا يتوقعه منك', durationMinutes: 0, emoji: '🤝' }, { id: 'dep5t2', text: 'ادعُ لشخص تحبه بما تتمنى لنفسك', durationMinutes: 2, emoji: '🤲' }, { id: 'dep5t3', text: 'صلّ ركعتين شكر لله', durationMinutes: 5, emoji: '🕌' }] },
            { day: 6, title: 'خلوة قصيرة', subtitle: 'انفصل لتلتقط أنفاسك الروحية', tasks: [{ id: 'dep6t1', text: 'ساعة كاملة بلا هاتف أو شاشات', durationMinutes: 60, emoji: '📵' }, { id: 'dep6t2', text: 'في هذه الساعة: ذكر، قرآن، تأمل — بحرية', durationMinutes: 0, emoji: '🌟' }, { id: 'dep6t3', text: 'لاحظ: كيف تشعر في نهاية الخلوة؟', durationMinutes: 0, emoji: '🔍' }] },
            { day: 7, title: 'التقييم والبقاء حياً', subtitle: 'ما الذي أعاد إحياءك أكثر؟', tasks: [{ id: 'dep7t1', text: 'قارن شعورك الروحي يوم 1 ويوم 7', durationMinutes: 2, emoji: '📊' }, { id: 'dep7t2', text: 'اختر الممارسة الأكثر تأثيراً واجعلها يومية', durationMinutes: 2, emoji: '⭐' }, { id: 'dep7t3', text: 'الروح لا تُملأ مرة واحدة — تحتاج تغذية مستمرة', durationMinutes: 0, emoji: '🌱' }] },
        ],
    },

    'ruhi_depletion_workshop': {
        type: 'workshop',
        durationMinutes: 8,
        goal: 'فهم الاستنزاف الروحي وكيف يحدث وما الذي يُعيد الحياة للروح',
        intro: 'الروح لها احتياجات — تجاهلها لا يجعلها تختفي، يجعلها تصرخ بطرق أخرى.',
        sections: [
            { title: 'ما هو الاستنزاف الروحي؟', emoji: '🕯️', body: 'الاستنزاف الروحي هو نتيجة حياة طويلة بدون تغذية روحية كافية. الشعور بالجفاف، فقدان الشغف، برودة العاطفة، والانفصال عن الله والناس والحياة. يختلف عن الاكتئاب لكنه قد يُمهّد له إذا استمر.' },
            { title: 'مصادر الاستنزاف', emoji: '🔋', body: 'أبرز مصادر الاستنزاف الروحي: المحتوى الرقمي المفرط والمؤلم، العلاقات السامة، العمل الروتيني بلا معنى، غياب العبادة الواعية، والإهمال المستمر لنداء الروح. الروح تُعطي وتُعطي حتى تفرغ.' },
            { title: 'أغذية الروح', emoji: '🌿', body: 'الروح تتغذى على: الذكر الحقيقي (لا الميكانيكي)، الصلة الصادقة بالله، الطبيعة، السكوت الواعي، العطاء غير المشروط، قراءة القرآن مع التأمل، والعلاقات الروحية مع الناس الطيبين. هذه أغذية لا بدائل لها.' },
        ],
        keyTakeaways: [
            'الاستنزاف الروحي يحتاج تغذية روحية — لا تأجيل',
            'أعمق علاج: الصلة الصادقة بالله لا الممارسة الميكانيكية',
            'الروح تتجدد بالعطاء والشكر والصمت الواعي',
        ],
        closingAction: 'اليوم: صلّ ركعتين ببطء تام — تأمّل في كل كلمة. مجرد هذا يُغيّر شيئاً.',
    },

    'ruhi_depletion_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'رصد الاستنزاف الروحي يومياً وتتبع ما يُعيدك',
        intro: 'سجّل يومياً — بعد أسبوع ستفهم ما يملأ روحك وما يُفرّغها.',
        insight: 'الأنماط تظهر في 5 أيام — هل النزاعات تستنزفك؟ المحتوى الرقمي؟ غياب العبادة؟',
        fields: [
            { id: 'spiritual_level', label: 'مستوى الامتلاء الروحي اليوم', emoji: '🕯️', type: 'scale', min: 1, max: 10 },
            { id: 'prayer_quality',  label: 'جودة الصلاة اليوم', emoji: '🕌', type: 'choice', options: ['خاشع ومتأمل', 'جيد', 'ميكانيكي', 'صلّيت بعضها', 'لم أصلِّ'] },
            { id: 'dhikr',           label: 'هل مارست الذكر بصدق اليوم؟', emoji: '📿', type: 'boolean' },
            { id: 'drainer',         label: 'ما أشد مستنزف روحي اليوم؟', emoji: '🔋', type: 'choice', options: ['لا يوجد', 'محتوى رقمي', 'علاقة مرهقة', 'ضغط عمل', 'مشكلة عاطفية', 'أخرى'] },
            { id: 'note',            label: 'ملاحظة', emoji: '📝', type: 'text' },
        ],
    },

    /* ─────────────────────────────────────────────────────
       RUHI / DISCONNECT  —  الانفصال الداخلي
       ───────────────────────────────────────────────────── */

    'ruhi_disconnect_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'قياس مستوى الانفصال الداخلي عن الذات والآخرين والحياة',
        intro: 'الانفصال الداخلي هو الشعور بأنك تعيش على السطح — تؤدي الحياة بلا حضور حقيقي.',
        questions: [
            { id: 'dcq1', text: 'هل تشعر أحياناً أنك تُراقب حياتك من خارجها لا تعيشها؟', options: [{ value: 0, label: 'لا — أنا حاضر في حياتي' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً — غريب عن نفسي' }] },
            { id: 'dcq2', text: 'هل تجد صعوبة في الشعور بالقرب الحقيقي من أشخاص تحبهم؟', options: [{ value: 0, label: 'لا — قريب ومتصل' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً — أشعر بعزلة حتى وسط الناس' }] },
            { id: 'dcq3', text: 'هل مشاعرك بدت مُخدّرة أو بطيئة مؤخراً؟', options: [{ value: 0, label: 'لا — مشاعري حيّة' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'نعم — مشاعر مُخدّرة' }] },
            { id: 'dcq4', text: 'هل تستخدم النشاط المفرط (شاشات، عمل، انتاج) لتجنب الجلوس مع نفسك؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'نعم — لا أستطيع الجلوس وحدي' }] },
            { id: 'dcq5', text: 'هل تشعر بانفصال عن قيمك — تفعل ما لا يُعبّر عنك حقاً؟', options: [{ value: 0, label: 'لا — أعيش ما أؤمن به' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً — حياتي لا تمثّلني' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'تواصل داخلي صحي', message: 'أنت حاضر في حياتك وعلاقاتك. هذا ثمين.', nextStep: 'تمرين الحضور اليومي ليبقى كذلك.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'انفصال متوسط', message: 'تشعر بانفصال متزايد — الحضور يتضاءل. يمكن استعادته.', nextStep: 'ابدأ بروتوكول إعادة التواصل الداخلي 5 أيام.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'انفصال عميق', message: 'الشعور بالانفصال يُؤثر بشكل واضح على علاقاتك وجودة حياتك.', nextStep: 'ابدأ البروتوكول + استشارة معالج نفسي متخصص في التواصل الداخلي.' },
        ],
    },

    'ruhi_disconnect_practice': {
        type: 'practice',
        durationMinutes: 8,
        goal: 'تمرين إعادة التواصل مع الذات — العودة للمركز',
        intro: 'الانفصال يحدث تدريجياً ببطء — العودة أيضاً تحتاج لحظات متعمّدة.',
        steps: [
            { index: 1, instruction: 'ضع يدك على قلبك وأغمض عيناك', durationSeconds: 10 },
            { index: 2, instruction: 'اسأل: كيف أشعر الآن؟ لا تُجيب من رأسك — استمع للجسد', durationSeconds: 30 },
            { index: 3, instruction: 'إذا كان الشعور غامضاً — سمّه: «أشعر بـ...»', durationSeconds: 20 },
            { index: 4, instruction: 'تنفّس للشعور — لا تهرب منه', durationSeconds: 30 },
            { index: 5, instruction: 'اسأل: ما الذي تحتاجه روحي الآن؟', durationSeconds: 20 },
            { index: 6, instruction: 'أعط نفسك شيئاً صغيراً منه — الآن', durationSeconds: 15 },
        ],
        closingNote: 'التواصل مع النفس مهارة مثل أي مهارة — تُبنى بالممارسة الصادقة.',
        repeatSuggestion: 'يومياً وخاصة حين تشعر بالبُعد عن نفسك',
    },

    'ruhi_disconnect_protocol': {
        type: 'protocol',
        totalDays: 5,
        goal: 'إعادة بناء التواصل الداخلي عبر الحضور والمشاعر والعلاقات',
        howItWorks: '5 أيام: استماع للمشاعر + حضور + صلة بالآخرين + قيم + تواصل مع الله.',
        completionMessage: 'خمسة أيام من العودة — أنت أكثر حضوراً مما كنت.',
        days: [
            { day: 1, title: 'الاستماع للمشاعر', subtitle: 'لا تتجاوزها — استمع لها', tasks: [{ id: 'dc1t1', text: 'ثلاث مرات اليوم: توقف وسجّل ما تشعر به بدقة', durationMinutes: 3, emoji: '📝' }, { id: 'dc1t2', text: 'لا تُقيّم المشاعر — فقط ألاحظها', durationMinutes: 0, emoji: '👁️' }, { id: 'dc1t3', text: 'تمرين إعادة التواصل (أعلاه)', durationMinutes: 8, emoji: '🤲' }] },
            { day: 2, title: 'الحضور في الجسد', subtitle: 'الانفصال يبدأ بالفصل عن الجسد', tasks: [{ id: 'dc2t1', text: 'مشي ببطء 15 دقيقة — انتبه لكل خطوة', durationMinutes: 15, emoji: '🚶' }, { id: 'dc2t2', text: 'وجبة بلا شاشة — ذق كل لقمة بوعي', durationMinutes: 0, emoji: '🍽️' }, { id: 'dc2t3', text: 'تمدد جسدي بطيء 5 دقائق مع تأمل', durationMinutes: 5, emoji: '🤸' }] },
            { day: 3, title: 'الصلة بشخص', subtitle: 'العلاقة الحقيقية تعيدك لنفسك', tasks: [{ id: 'dc3t1', text: 'اتصل بشخص قريب وتحدث بصدق عن كيف تشعر', durationMinutes: 15, emoji: '📞' }, { id: 'dc3t2', text: 'استمع لهم بحضور كامل — لا تفكر في ردك', durationMinutes: 0, emoji: '👂' }, { id: 'dc3t3', text: 'لاحظ: هل شعرت بدفء أو اتصال بعد المحادثة؟', durationMinutes: 0, emoji: '🔍' }] },
            { day: 4, title: 'العودة للقيم', subtitle: 'الانفصال عن القيم = انفصال عن النفس', tasks: [{ id: 'dc4t1', text: 'اكتب: ما أهم 3 قيم تُعرّف بها نفسك؟', durationMinutes: 5, emoji: '📝' }, { id: 'dc4t2', text: 'هل اليوم عشت وفقها؟ أين؟ أين لا؟', durationMinutes: 5, emoji: '🔍' }, { id: 'dc4t3', text: 'قرار: فعل واحد يوافق قيمك الأساسية غداً', durationMinutes: 0, emoji: '✅' }] },
            { day: 5, title: 'الصلة بالله', subtitle: 'أعمق تواصل', tasks: [{ id: 'dc5t1', text: 'خصّص 20 دقيقة للتواصل الصادق مع الله', durationMinutes: 20, emoji: '🤲' }, { id: 'dc5t2', text: 'تكلّم معه كما تتكلم مع أقرب الناس — بلا رسمية', durationMinutes: 0, emoji: '💬' }, { id: 'dc5t3', text: 'قيّم شعورك بالتواصل الداخلي يوم 1 ويوم 5', durationMinutes: 2, emoji: '📊' }] },
        ],
    },

    'ruhi_disconnect_workshop': {
        type: 'workshop',
        durationMinutes: 8,
        goal: 'فهم ظاهرة الانفصال الداخلي وجذورها وكيفية الشفاء منها',
        intro: 'الانفصال الداخلي وباء هادئ في العصر الرقمي — يعيش معنا ونتجاهله.',
        sections: [
            { title: 'ما هو الانفصال الداخلي؟', emoji: '🌫️', body: 'الانفصال الداخلي هو حالة العيش على السطح — أداء الحياة بلا حضور حقيقي. تأكل لكن لا تذوق، تسمع لكن لا تُصغي، تكون مع أشخاص لكن تشعر بوحدة. يحدث حين يُفصل الإنسان عن مشاعره لفترة طويلة.' },
            { title: 'لماذا يحدث؟', emoji: '📱', body: 'الحياة الرقمية تُعلّمنا العيش في الرأس لا في الجسد. التشتت المستمر، الإشعارات، التعدد في المهام — كلها تُبعدنا عن اللحظة الحاضرة. أضف إليها: قمع المشاعر، صدمات غير مُعالجة، وبيئات تُكافئ الأداء لا الوجود.' },
            { title: 'العودة تدريجية', emoji: '🌱', body: 'الانفصال يُعالج بالحضور التدريجي: استمع لجسدك، تواصل مع مشاعرك بصدق، أنشئ علاقات حقيقية، وعد للصلة بالله. ليس بالتحليل — بالتجربة المعيشة. كل لحظة حضور كاملة هي خطوة في الاتجاه الصحيح.' },
        ],
        keyTakeaways: [
            'الانفصال الداخلي شائع ويمكن علاجه بالحضور المتعمّد',
            'المشاعر ليست مشكلة — هي نوافذ للتواصل مع الداخل',
            'أعمق علاج للانفصال: الصلة الصادقة بالله والتواصل الحقيقي مع الناس',
        ],
        closingAction: 'اليوم: دقيقتان من الصمت الكامل مع يدك على قلبك — استمع.',
    },

    'ruhi_disconnect_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'رصد مستوى التواصل الداخلي يومياً',
        intro: 'سجّل يومياً — وعي الانفصال هو أول خطوة للعودة.',
        insight: 'بعد أسبوع ستعرف: ما الأوقات والمواقف التي تُشعرك بأكثر توصيل أو انفصال.',
        fields: [
            { id: 'connection_level', label: 'مستوى التواصل مع ذاتك اليوم', emoji: '🌊', type: 'scale', min: 1, max: 10 },
            { id: 'presence',         label: 'هل كنت حاضراً في لحظات مهمة اليوم؟', emoji: '👁️', type: 'choice', options: ['نعم — حضور كامل', 'جزئياً', 'لا — كنت غائباً ذهنياً', 'لم أنتبه'] },
            { id: 'emotion_aware',    label: 'هل أدركت مشاعرك وسمّيتها اليوم؟', emoji: '💛', type: 'boolean' },
            { id: 'connection_act',   label: 'هل تواصلت بصدق مع شخص اليوم؟', emoji: '🤝', type: 'boolean' },
            { id: 'note',             label: 'ملاحظة', emoji: '📝', type: 'text' },
        ],
    },

    /* ─────────────────────────────────────────────────────
       RUHI / ENV  —  البيئة والروح
       ───────────────────────────────────────────────────── */

    'ruhi_env_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'قياس تأثير البيئة المحيطة على صحتك الروحية والنفسية',
        intro: 'لا يعيش أحد في فراغ — بيئتك المادية والاجتماعية والرقمية تُشكّل روحك بشكل مباشر.',
        questions: [
            { id: 'evq1', text: 'هل بيئتك المادية (منزل، مكتب) تُشعرك بالراحة والهدوء؟', options: [{ value: 0, label: 'نعم — فضاءاتي تُريحني' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'نادراً' }, { value: 3, label: 'لا — محيطي يُرهقني' }] },
            { id: 'evq2', text: 'هل علاقاتك الاجتماعية تُغذّيك أم تستنزفك في الغالب؟', options: [{ value: 0, label: 'تُغذّيني — علاقات داعمة' }, { value: 1, label: 'مزيج متوازن' }, { value: 2, label: 'تستنزفني أكثر من تُمدّني' }, { value: 3, label: 'تستنزفني بشكل واضح' }] },
            { id: 'evq3', text: 'هل محتواك الرقمي المعتاد يُثريك أم يُثقّلك؟', options: [{ value: 0, label: 'يُثريني عموماً' }, { value: 1, label: 'مزيج' }, { value: 2, label: 'أكثره يُثقّلني' }, { value: 3, label: 'يُسبّب لي قلقاً وضيقاً' }] },
            { id: 'evq4', text: 'هل البيئة التي تعمل فيها تسمح لروحك بالتنفس؟', options: [{ value: 0, label: 'نعم — صحية وداعمة' }, { value: 1, label: 'لا بأس' }, { value: 2, label: 'مُرهقة أحياناً' }, { value: 3, label: 'لا — ضغوط مستمرة' }] },
            { id: 'evq5', text: 'هل تقضي وقتاً في الطبيعة أو أماكن تُهدّئ روحك؟', options: [{ value: 0, label: 'نعم — بانتظام' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'نادراً' }, { value: 3, label: 'لا تقريباً' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'بيئة داعمة للروح', message: 'محيطك يدعم صحتك الروحية — أعطه الاهتمام الذي يستحق.', nextStep: 'وسّع ما يعمل: المزيد من الطبيعة والعلاقات المُغذّية.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'بيئة مختلطة', message: 'بعض عناصر بيئتك تستنزفك. يمكن تحسين التصميم البيئي.', nextStep: 'ابدأ بروتوكول تصميم البيئة الداعمة 5 أيام.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'بيئة مُرهقة للروح', message: 'بيئتك تُثقل روحك بشكل واضح. التغيير البيئي ضروري لا اختياري.', nextStep: 'ابدأ البروتوكول + احجز وقتاً في الطبيعة هذا الأسبوع.' },
        ],
    },

    'ruhi_env_practice': {
        type: 'practice',
        durationMinutes: 5,
        goal: 'تمرين «تنظيف البيئة» - تصميم فضاء داعم للروح في 5 دقائق',
        intro: 'البيئة المحيطة تُصدر إشارات للدماغ — فضاء منظم هادئ يُصدر إشارات أمان.',
        steps: [
            { index: 1, instruction: 'انظر حول مكانك الآن — ما الذي يُشتّت أو يُثقل؟', durationSeconds: 15 },
            { index: 2, instruction: 'نظّف سطحاً واحداً أو مكاناً صغيراً', durationSeconds: 60 },
            { index: 3, instruction: 'أدخل عنصراً طبيعياً: ضوء طبيعي، نبتة، هواء', durationSeconds: 20 },
            { index: 4, instruction: 'أبعد ما يُشتّت عن متناول يدك (هاتف، شاشات)', durationSeconds: 15 },
            { index: 5, instruction: 'اجلس في الفضاء المُنقَّح لدقيقة — لاحظ الفرق', durationSeconds: 60 },
        ],
        closingNote: 'الفوضى الخارجية تُنشئ فوضى داخلية. 5 دقائق تنظيم = عقل أرحب.',
        repeatSuggestion: 'كل صباح كجزء من روتين الاستعداد ليوم صافٍ',
    },

    'ruhi_env_protocol': {
        type: 'protocol',
        totalDays: 5,
        goal: 'تصميم بيئة داعمة للروح في 5 أيام',
        howItWorks: '5 أيام: المادية + الرقمية + الاجتماعية + الطبيعية + المنزلية.',
        completionMessage: 'خمسة أيام من التصميم البيئي — محيطك أصبح حليفاً لا عدواً.',
        days: [
            { day: 1, title: 'البيئة المادية', subtitle: 'الفضاء يُديرك أو تُديره أنت', tasks: [{ id: 'ev1t1', text: 'رتّب مكان نومك تماماً: نظافة، هدوء، خفة', durationMinutes: 15, emoji: '🛏️' }, { id: 'ev1t2', text: 'أضف شيئاً يُريحك: شمعة، نبتة، لوحة بسيطة', durationMinutes: 5, emoji: '🌿' }, { id: 'ev1t3', text: 'أزل ما يُسبب ضجة بصرية من أمام عينيك', durationMinutes: 5, emoji: '🧹' }] },
            { day: 2, title: 'البيئة الرقمية', subtitle: 'ما تُغذّي عقلك يُغذّي روحك', tasks: [{ id: 'ev2t1', text: 'راجع من تتابع: ازل 5 حسابات تُثقلك أو تُقلقك', durationMinutes: 10, emoji: '📱' }, { id: 'ev2t2', text: 'اشترك في أو أضف محتوى مُلهماً أو علمياً', durationMinutes: 5, emoji: '📚' }, { id: 'ev2t3', text: 'فعّل «وقت هادئ» في هاتفك من 9م حتى 7ص', durationMinutes: 2, emoji: '🔕' }] },
            { day: 3, title: 'البيئة الاجتماعية', subtitle: 'من مَن تُحاط يُحدد صحتك', tasks: [{ id: 'ev3t1', text: 'حدد: من يمنحك طاقة؟ من يستنزفها؟', durationMinutes: 5, emoji: '👥' }, { id: 'ev3t2', text: 'تواصل مع شخص مُغذٍّ روحياً اليوم', durationMinutes: 0, emoji: '📞' }, { id: 'ev3t3', text: 'قلّل وقت التعرض لمصدر استنزاف اجتماعي واحد', durationMinutes: 0, emoji: '🔇' }] },
            { day: 4, title: 'الطبيعة والمساحة', subtitle: 'الطبيعة تُصلح ما أفسدته البيئة الاصطناعية', tasks: [{ id: 'ev4t1', text: '30 دقيقة في الهواء الطلق بلا هاتف', durationMinutes: 30, emoji: '🌳' }, { id: 'ev4t2', text: 'لاحظ: أشجار، سماء، ريح — بعيون طفولية', durationMinutes: 0, emoji: '🌿' }, { id: 'ev4t3', text: 'كيف تأثّرت روحك بعد هذه الـ 30 دقيقة؟', durationMinutes: 2, emoji: '📊' }] },
            { day: 5, title: 'التقييم والتصميم المستقبلي', subtitle: 'ما بيئتك المثالية؟', tasks: [{ id: 'ev5t1', text: 'قيّم تأثير كل تغيير بيئي من أيام 1-4', durationMinutes: 5, emoji: '📊' }, { id: 'ev5t2', text: 'اختر 3 تغييرات ستحمي المحيط الصحّي دائماً', durationMinutes: 5, emoji: '⭐' }, { id: 'ev5t3', text: 'أنت بانٍ لبيئتك — ليس ضحية لها', durationMinutes: 0, emoji: '🏗️' }] },
        ],
    },

    'ruhi_env_workshop': {
        type: 'workshop',
        durationMinutes: 8,
        goal: 'فهم كيف تُؤثّر البيئة على روحك وكيف تُصمّم بيئة داعمة',
        intro: 'نحن نُؤثّر في محيطنا — لكن المحيط يُؤثّر فينا بشكل أكبر مما ندرك.',
        sections: [
            { title: 'علم البيئة والصحة', emoji: '🌍', body: 'الأبحاث تُثبت: الفوضى البصرية ترفع الكورتيزول، الطبيعة تخفضه. الضوضاء تُنهك الجهاز العصبي، الصمت يُجدّده. الفضاء المنظّم الهادئ يُطلق مواد كيميائية تُعزّز التركيز والسكينة. بيئتك ليست ديكوراً — هي دواء.' },
            { title: 'الضوضاء الرقمية وسرقة الروح', emoji: '📱', body: 'المحتوى الرقمي السلبي — أخبار سيئة، نقاشات سُمية، مقارنات غير صحية — يُسمّم الروح ببطء. ما تستهلكه يومياً يُعيد برمجة نظرتَك للعالم والناس ولنفسك. «أنت ما تستهلك» ينطبق على الغذاء والمحتوى معاً.' },
            { title: 'تصميم البيئة الروحية', emoji: '🏡', body: 'يمكن تصميم بيئة تدفع للسكينة والتركيز: نافذة مفتوحة على الطبيعة، مكتب نظيف، ضوء طبيعي، غرفة نوم بلا هاتف، علاقات مُختارة لا موروثة. التغيير البيئي الصغير يُحدث تحولاً كبيراً في الروح.' },
        ],
        keyTakeaways: [
            'بيئتك تُصدر إشارات مستمرة لدماغك وروحك — اختر إشاراتها',
            'الضوضاء الرقمية تستنزف الروح بطريقة مخفية ومتراكمة',
            'تصميم بيئة داعمة ليس رفاهية — هو ضرورة للصحة الروحية',
        ],
        closingAction: 'اليوم: نظّف مكاناً واحداً وأعد فتح نافذة. فقط هذا يكفي.',
    },

    'ruhi_env_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'رصد تأثير البيئة على روحك يومياً',
        intro: 'سجّل يومياً — البيئة تُؤثّر أكثر مما تتوقع وقياسها يُكشف ذلك.',
        insight: 'بعد أسبوع ستعرف: أي البيئات ترفع روحك وأيها يُخفضها.',
        fields: [
            { id: 'env_quality',  label: 'جودة بيئتك اليوم عموماً', emoji: '🌍', type: 'scale', min: 1, max: 10 },
            { id: 'nature_time',  label: 'هل قضيت وقتاً في الطبيعة اليوم؟', emoji: '🌿', type: 'choice', options: ['نعم 30+ دقيقة', 'نعم أقل من 30', 'لا'] },
            { id: 'digital_diet', label: 'جودة محتواك الرقمي اليوم', emoji: '📱', type: 'choice', options: ['مُلهم', 'محايد', 'ثقيل كره', 'سمي/مُقلق'] },
            { id: 'social_env',   label: 'تأثير التفاعلات الاجتماعية اليوم', emoji: '👥', type: 'choice', options: ['مُغذّية', 'محايدة', 'مُستنزفة', 'لم أتفاعل كثيراً'] },
            { id: 'note',         label: 'ملاحظة', emoji: '📝', type: 'text' },
        ],
    },

};
