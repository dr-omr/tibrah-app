// lib/tool-content-map.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tool Content Map (محتوى الأدوات المُضمَّن)
// ════════════════════════════════════════════════════════════════════════
//
// كل أداة في domain-routing-map لها محتوى هنا.
// لا API — لا داتابيز — يعمل offline.
// ════════════════════════════════════════════════════════════════════════

import type { ToolType } from '@/components/health-engine/types';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

// --- Protocol ---
export interface ProtocolTask {
    id: string;
    text: string;
    durationMinutes: number;
    emoji: string;
}
export interface ProtocolDay {
    day: number;
    title: string;
    subtitle: string;
    tasks: ProtocolTask[];
}
export interface ProtocolContent {
    type: 'protocol';
    totalDays: 3 | 5 | 7 | 14;
    goal: string;
    howItWorks: string;
    days: ProtocolDay[];
    completionMessage: string;
}

// --- Practice ---
export interface PracticeStep {
    index: number;
    instruction: string;
    durationSeconds?: number;
}
export interface PracticeContent {
    type: 'practice';
    durationMinutes: number;
    goal: string;
    intro: string;
    steps: PracticeStep[];
    closingNote: string;
    repeatSuggestion: string;
}

// --- Test ---
export interface TestQuestion {
    id: string;
    text: string;
    options: { value: number; label: string }[];
}
export interface TestResult {
    minScore: number;
    maxScore: number;
    level: 'low' | 'moderate' | 'high';
    title: string;
    message: string;
    nextStep: string;
}
export interface TestContent {
    type: 'test';
    totalQuestions: number;
    goal: string;
    intro: string;
    questions: TestQuestion[];
    results: TestResult[];
}

// --- Workshop ---
export interface WorkshopSection {
    title: string;
    body: string;
    emoji: string;
}
export interface WorkshopContent {
    type: 'workshop';
    durationMinutes: number;
    goal: string;
    intro: string;
    sections: WorkshopSection[];
    keyTakeaways: string[];
    closingAction: string;
}

// --- Tracker ---
export interface TrackerField {
    id: string;
    label: string;
    emoji: string;
    type: 'scale' | 'boolean' | 'text' | 'choice';
    options?: string[];      // for 'choice'
    min?: number; max?: number; // for 'scale'
}
export interface TrackerContent {
    type: 'tracker';
    durationMinutes: number;
    goal: string;
    intro: string;
    fields: TrackerField[];
    insight: string;
}

export type ToolContent =
    | ProtocolContent
    | PracticeContent
    | TestContent
    | WorkshopContent
    | TrackerContent;

/* ══════════════════════════════════════════════════════════
   CONTENT MAP
   ══════════════════════════════════════════════════════════ */

export const TOOL_CONTENT: Record<string, ToolContent> = {

    /* ─────────────────────────────────────────────────────
       JASADI / DIGESTIVE
       ───────────────────────────────────────────────────── */

    'jasadi_digestive_protocol': {
        type: 'protocol',
        totalDays: 3,
        goal: 'تهدئة التهيج الهضمي وتقليل المحفزات خلال ٧٢ ساعة',
        howItWorks: 'ثلاثة أيام متدرجة: تخلص من المحفزات — تهدئة الجهاز الهضمي — إعادة التوازن.',
        completionMessage: 'أكملت البروتوكول! جسدك يشكرك. سجّل الفرق في أعراضك.',
        days: [
            {
                day: 1,
                title: 'يوم التخلص من المحفزات',
                subtitle: 'أزل ما يُهيج معدتك اليوم',
                tasks: [
                    { id: 'd1t1', text: 'تجنّب الكافيين والقهوة طوال اليوم', durationMinutes: 0, emoji: '☕' },
                    { id: 'd1t2', text: 'تناول وجبات صغيرة كل 3-4 ساعات', durationMinutes: 0, emoji: '🍽️' },
                    { id: 'd1t3', text: 'تنفّس عميق 5 دقائق بعد كل وجبة', durationMinutes: 5, emoji: '🫁' },
                    { id: 'd1t4', text: 'اشرب 8 أكواب ماء على الأقل', durationMinutes: 0, emoji: '💧' },
                ],
            },
            {
                day: 2,
                title: 'يوم التهدئة',
                subtitle: 'أسكن الجهاز العصبي — وهو يُسكّن المعدة',
                tasks: [
                    { id: 'd2t1', text: 'مشي خفيف 15 دقيقة بعد الغداء', durationMinutes: 15, emoji: '🚶' },
                    { id: 'd2t2', text: 'وجبة واحدة دافئة: شوربة أو رز مسلوق', durationMinutes: 0, emoji: '🍜' },
                    { id: 'd2t3', text: 'جلسة استرخاء 10 دقائق قبل النوم', durationMinutes: 10, emoji: '🧘' },
                    { id: 'd2t4', text: 'لا أكل بعد الساعة 8 مساءً', durationMinutes: 0, emoji: '⏰' },
                ],
            },
            {
                day: 3,
                title: 'يوم إعادة التوازن',
                subtitle: 'ابدأ تقديم أطعمة مفيدة',
                tasks: [
                    { id: 'd3t1', text: 'أضف الزبادي الطبيعي لوجبة الصباح', durationMinutes: 0, emoji: '🥛' },
                    { id: 'd3t2', text: 'تناول ملعقة زيت زيتون أول الصباح', durationMinutes: 0, emoji: '🫒' },
                    { id: 'd3t3', text: 'سجّل الأعراض: هل تحسّن؟ ما الفرق؟', durationMinutes: 5, emoji: '📊' },
                    { id: 'd3t4', text: 'تنفّس عميق 5 دقائق', durationMinutes: 5, emoji: '🫁' },
                ],
            },
        ],
    },

    'jasadi_digestive_practice': {
        type: 'practice',
        durationMinutes: 5,
        goal: 'تهدئة الجهاز العصبي بعد الأكل لتحسين الهضم',
        intro: 'عندما تأكل وأنت متوتر، جسدك يُشغّل وضع "الخطر" ويُوقف الهضم. هذا التمرين يُعيد الكالم.',
        steps: [
            { index: 1, instruction: 'اجلس باستقامة أو استرح وضع يدك على بطنك', durationSeconds: 10 },
            { index: 2, instruction: 'تنفّس من أنفك ببطء: عدّ 4', durationSeconds: 4 },
            { index: 3, instruction: 'احبس نفسك: عدّ 4', durationSeconds: 4 },
            { index: 4, instruction: 'أخرج الهواء من فمك ببطء: عدّ 6', durationSeconds: 6 },
            { index: 5, instruction: 'كرّر 8 مرات. لاحظ كيف يسترخي بطنك', durationSeconds: 0 },
        ],
        closingNote: 'افعل هذا بعد كل وجبة رئيسية لمدة 3 أيام وستلاحظ فرقاً في أعراضك.',
        repeatSuggestion: 'بعد كل وجبة — خاصة الغداء والعشاء',
    },

    'jasadi_digestive_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'تحديد أبرز المحفزات الهضمية في حياتك',
        intro: 'هذا الاختبار يُساعدك على تحديد ما إذا كانت مشكلتك الهضمية مرتبطة بالطعام أو التوتر أو الإيقاع.',
        questions: [
            {
                id: 'q1',
                text: 'متى تشتد الأعراض الهضمية عادةً؟',
                options: [
                    { value: 0, label: 'بعد الأكل مباشرة' },
                    { value: 1, label: 'في أوقات التوتر' },
                    { value: 2, label: 'في الصباح قبل الأكل' },
                    { value: 3, label: 'بشكل عشوائي لا أعرف سببه' },
                ],
            },
            {
                id: 'q2',
                text: 'هل تشعر بانتفاخ أو ثقل بعد وجبات معينة؟',
                options: [
                    { value: 0, label: 'نادراً أو أبداً' },
                    { value: 1, label: 'أحياناً — أعرف ما يُسببه' },
                    { value: 2, label: 'كثيراً — لكن لا أعرف السبب' },
                    { value: 3, label: 'باستمرار بعد معظم الوجبات' },
                ],
            },
            {
                id: 'q3',
                text: 'كيف يُؤثر التوتر على جهازك الهضمي؟',
                options: [
                    { value: 0, label: 'لا أشعر بفرق' },
                    { value: 1, label: 'قليلاً — بعض الثقل' },
                    { value: 2, label: 'كثيراً — تشنجات أو حرقة' },
                    { value: 3, label: 'علاقة مباشرة وواضحة جداً' },
                ],
            },
            {
                id: 'q4',
                text: 'كم وجبة تتناول يومياً وعلى أي إيقاع؟',
                options: [
                    { value: 0, label: '3 وجبات منتظمة' },
                    { value: 1, label: 'وجبتين أو ٣ بشكل شبه منتظم' },
                    { value: 2, label: 'عشوائي — أحياناً وجبة واحدة كبيرة' },
                    { value: 3, label: 'غير منتظم جداً — أهمل الأكل' },
                ],
            },
            {
                id: 'q5',
                text: 'هل تناولت أدوية للجهاز الهضمي مؤخراً؟',
                options: [
                    { value: 0, label: 'لا، لا أحتاج' },
                    { value: 1, label: 'أحياناً عند الضرورة' },
                    { value: 2, label: 'بانتظام لأن الأعراض متكررة' },
                    { value: 3, label: 'يومياً تقريباً ولا تكفي' },
                ],
            },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'نمط خفيف', message: 'أعراضك محدودة وقد تكون مرتبطة بعادات بسيطة. تعديل صغير في الروتين يكفي.', nextStep: 'ابدأ بتمرين التنفس بعد الأكل يومياً لمدة أسبوع.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'نمط متوسط', message: 'هناك محفزات واضحة. مزيج من التوتر والغذاء يُضخّم أعراضك.', nextStep: 'جرّب بروتوكول المعدة ٧٢ ساعة وسجّل الفرق.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'نمط مزمن', message: 'أعراضك متكررة ومؤثرة. من المهم معالجة الجانبين: الغذائي والعصبي معاً.', nextStep: 'ابدأ البروتوكول + فكر في جلسة متخصصة لفهم الجذر.' },
        ],
    },

    'jasadi_digestive_workshop': {
        type: 'workshop',
        durationMinutes: 6,
        goal: 'فهم العلاقة بين التوتر والجهاز الهضمي',
        intro: 'معدتك ليست مجرد كيس هضم — هي "الدماغ الثاني" للجسم. والتوتر يضربها مباشرة.',
        sections: [
            {
                title: 'الدماغ في البطن',
                emoji: '🧠',
                body: 'يوجد في القناة الهضمية أكثر من 100 مليون خلية عصبية — أكثر من النخاع الشوكي. هذا ما يُسمى "الجهاز العصبي المعوي". وهو يتواصل مباشرة مع دماغك عبر العصب المبهم.',
            },
            {
                title: 'ماذا يحدث عند التوتر؟',
                emoji: '⚡',
                body: 'عندما يشعر جهازك العصبي بخطر، يُحوّل الدم من الجهاز الهضمي للعضلات. هذا يُبطئ الهضم، ويُضخّم الحساسية، ويُطلق الانقباضات العشوائية. كلما استمر التوتر — استمرت الأعراض.',
            },
            {
                title: 'الحلقة المفرغة',
                emoji: '🔄',
                body: 'الأعراض الهضمية بحد ذاتها تُسبب توتراً إضافياً. والتوتر يُزيد الأعراض. الخروج من هذه الحلقة يتطلب كسرها من طرفين: هدوء الجهاز العصبي + تعديل محفزات الطعام.',
            },
        ],
        keyTakeaways: [
            'معدتك تستمع لأفكارك — التوتر يُعطّل هضمك فعلياً',
            'التنفس العميق يُنشّط العصب المبهم ويُهدّئ المعدة',
            'الوجبات المنتظمة الصغيرة أهم من الحمية الصارمة',
        ],
        closingAction: 'ابدأ بتمرين التنفس بعد الأكل اليوم حتى لو مرة واحدة.',
    },

    'jasadi_digestive_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'رصد الأعراض الهضمية يومياً وربطها بالطعام والتوتر',
        intro: 'سجّل بصدق — الهدف اكتشاف النمط لا الحكم على نفسك.',
        insight: 'بعد 3 أيام من التسجيل ستبدأ بملاحظة الأنماط التي لم تكن ترينها من قبل.',
        fields: [
            { id: 'bloating', label: 'مستوى الانتفاخ', emoji: '🫁', type: 'scale', min: 0, max: 5 },
            { id: 'pain', label: 'ألم أو تشنج', emoji: '🔥', type: 'scale', min: 0, max: 5 },
            { id: 'stress', label: 'مستوى التوتر اليوم', emoji: '😰', type: 'scale', min: 0, max: 5 },
            {
                id: 'trigger_food',
                label: 'هل أكلت شيئاً قد يكون محفزاً؟',
                emoji: '🍔',
                type: 'choice',
                options: ['لا', 'ربما', 'نعم — كافيين', 'نعم — دهون', 'نعم — سكر', 'نعم — أخرى'],
            },
            { id: 'note', label: 'ملاحظة سريعة (اختياري)', emoji: '📝', type: 'text' },
        ],
    },

    /* ─────────────────────────────────────────────────────
       JASADI / SLEEP
       ───────────────────────────────────────────────────── */

    'jasadi_sleep_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'إعادة ضبط الساعة البيولوجية واستعادة نوم عميق خلال أسبوع',
        howItWorks: 'أسبوع متدرج: إنشاء إيقاع — تهدئة الجهاز العصبي — تعزيز العادات الجديدة.',
        completionMessage: 'أسبوع كامل! الساعة البيولوجية تستغرق ٢١ يوماً للاستقرار — أنت في الطريق الصحيح.',
        days: [
            {
                day: 1,
                title: 'تحديد ميعاد النوم',
                subtitle: 'اختر توقيتاً ثابتاً والتزم به هذا الأسبوع',
                tasks: [
                    { id: 's1t1', text: 'حدد ساعة نوم ثابتة (مثلاً 11 مساءً)', durationMinutes: 0, emoji: '⏰' },
                    { id: 's1t2', text: 'أغلق الشاشات قبل 30 دقيقة من النوم', durationMinutes: 0, emoji: '📵' },
                    { id: 's1t3', text: 'اقرأ أو استمع لشيء هادئ آخر 20 دقيقة', durationMinutes: 20, emoji: '📖' },
                ],
            },
            {
                day: 2,
                title: 'الضوء الطبيعي',
                subtitle: 'الضوء هو أقوى منظّم للساعة البيولوجية',
                tasks: [
                    { id: 's2t1', text: 'تعرّض لضوء الشمس أول 30 دقيقة من الصباح', durationMinutes: 30, emoji: '☀️' },
                    { id: 's2t2', text: 'تجنّب الضوء القوي بعد الساعة 9 مساءً', durationMinutes: 0, emoji: '🌙' },
                    { id: 's2t3', text: 'التزم بنفس ميعاد النوم', durationMinutes: 0, emoji: '⏰' },
                ],
            },
            {
                day: 3,
                title: 'بروتوكول المساء',
                subtitle: 'أنشئ إشارة «وقت النوم» لدماغك',
                tasks: [
                    { id: 's3t1', text: 'حمام دافئ أو غسل القدمين بالماء الدافئ', durationMinutes: 10, emoji: '🛁' },
                    { id: 's3t2', text: 'تمرين تنفس 4-4-6 لمدة 8 دقائق', durationMinutes: 8, emoji: '🫁' },
                    { id: 's3t3', text: 'غرف نوم باردة ومُظلمة تماماً', durationMinutes: 0, emoji: '🌙' },
                ],
            },
            {
                day: 4,
                title: 'الكافيين والسكر',
                subtitle: 'ما تأكله يُؤثر على نومك بشكل مباشر',
                tasks: [
                    { id: 's4t1', text: 'لا كافيين بعد الساعة 2 ظهراً', durationMinutes: 0, emoji: '☕' },
                    { id: 's4t2', text: 'وجبة عشاء خفيفة لا دسمة', durationMinutes: 0, emoji: '🥗' },
                    { id: 's4t3', text: 'ملعقة عسل في كوب حليب دافئ قبل النوم', durationMinutes: 0, emoji: '🍯' },
                ],
            },
            {
                day: 5,
                title: 'الحركة والتعب الصحي',
                subtitle: 'الجسم المتحرك ينام أفضل',
                tasks: [
                    { id: 's5t1', text: 'مشي 20 دقيقة في الصباح أو العصر', durationMinutes: 20, emoji: '🚶' },
                    { id: 's5t2', text: 'تمدد خفيف 10 دقائق قبل النوم', durationMinutes: 10, emoji: '🤸' },
                    { id: 's5t3', text: 'التزام بميعاد النوم', durationMinutes: 0, emoji: '⏰' },
                ],
            },
            {
                day: 6,
                title: 'القلق وسباق الأفكار',
                subtitle: 'أفرّغ ذهنك قبل النوم',
                tasks: [
                    { id: 's6t1', text: 'اكتب 3 مخاوف + 3 أشياء تشكر عليها', durationMinutes: 10, emoji: '📝' },
                    { id: 's6t2', text: 'لو أتى قلق: سجّله في ورقة وقل «سأفكر غداً»', durationMinutes: 0, emoji: '📋' },
                    { id: 's6t3', text: 'تنفس عميق حتى تنام', durationMinutes: 0, emoji: '🫁' },
                ],
            },
            {
                day: 7,
                title: 'تقييم الأسبوع',
                subtitle: 'ما الذي تغيّر؟',
                tasks: [
                    { id: 's7t1', text: 'سجّل: كيف نمت هذا الأسبوع مقارنة بالسابق؟', durationMinutes: 5, emoji: '📊' },
                    { id: 's7t2', text: 'ما العادة الأكثر تأثيراً؟ استمر بها', durationMinutes: 0, emoji: '⭐' },
                    { id: 's7t3', text: 'هل تحتاج إعادة تقييم؟ أم تكمل بهذا الإيقاع؟', durationMinutes: 0, emoji: '🔄' },
                ],
            },
        ],
    },

    'jasadi_sleep_practice': {
        type: 'practice',
        durationMinutes: 10,
        goal: 'تهدئة الجهاز العصبي قبل النوم لنوم أعمق',
        intro: 'الجسم لا يستطيع النوم وهو في وضع «يقظة». هذا الروتين يُرسل إشارة أمان لجهازك العصبي.',
        steps: [
            { index: 1, instruction: 'أضع أنت ومن بيدك على صدرك. لاحظ ضربات قلبك', durationSeconds: 20 },
            { index: 2, instruction: 'تنفّس بعمق: 4 ثوانٍ داخل، 4 ثانية حبس، 6 ثوانٍ خروج', durationSeconds: 14 },
            { index: 3, instruction: 'كرّر 5 مرات مع التركيز على الزفير البطيء', durationSeconds: 70 },
            { index: 4, instruction: 'أرخِ وجهك — فكّك — كتفيك — يديك — بطنك', durationSeconds: 30 },
            { index: 5, instruction: 'تخيّل مكاناً هادئاً: بحر، جبل، حديقة', durationSeconds: 60 },
            { index: 6, instruction: 'استمر في التنفس البطيء حتى تشعر بالثقل', durationSeconds: 0 },
        ],
        closingNote: 'إذا لم تنم خلال 20 دقيقة، قم واجلس في ضوء خافت حتى تشعر بالنعاس.',
        repeatSuggestion: 'كل ليلة قبل النوم — مع الثبات على ميعاد واحد',
    },

    'jasadi_sleep_tracker': {
        type: 'tracker',
        durationMinutes: 1,
        goal: 'تتبع جودة النوم لاكتشاف النمط وتحسينه',
        intro: 'سجّل كل يوم حتى لو النوم كان سيئاً — البيانات السيئة مفيدة أيضاً.',
        insight: 'بعد أسبوع ستعرف على وجه التحديد ما يُؤثر على نومك.',
        fields: [
            { id: 'sleep_time', label: 'ساعة النوم', emoji: '🌙', type: 'choice', options: ['قبل 10', '10-11', '11-12', '12-1', 'بعد 1'] },
            { id: 'wake_time', label: 'ساعة الاستيقاظ', emoji: '☀️', type: 'choice', options: ['قبل 6', '6-7', '7-8', '8-9', 'بعد 9'] },
            { id: 'quality', label: 'جودة النوم', emoji: '⭐', type: 'scale', min: 1, max: 5 },
            { id: 'interruptions', label: 'هل استيقظت في الليل؟', emoji: '🔔', type: 'choice', options: ['لا', 'مرة', '2-3 مرات', 'كثيراً'] },
            { id: 'feeling', label: 'كيف استيقظت؟', emoji: '😴', type: 'choice', options: ['منتعش', 'مقبول', 'تعبان', 'منهك جداً'] },
        ],
    },

    /* ─────────────────────────────────────────────────────
       NAFSI / ANXIETY_AROUSAL
       ───────────────────────────────────────────────────── */

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

    /* ─────────────────────────────────────────────────────
       FIKRI / OVERTHINKING
       ───────────────────────────────────────────────────── */

    'fikri_overthink_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'كسر دائرة الاجترار الفكري وبناء أدوات إيقافها',
        howItWorks: 'مزيج يومي من CBT + تأمل + كتابة علاجية.',
        completionMessage: 'أسبوع على دائرة الاجترار — كسرتها بوعي.',
        days: [
            { day: 1, title: 'التعرّف على الاجترار', subtitle: 'لا تستطيع إيقاف ما لا تعرفه', tasks: [{ id: 'o1t1', text: 'اكتب أكثر فكرة تتكرر عليك هذا الأسبوع', durationMinutes: 5, emoji: '📝' }, { id: 'o1t2', text: 'لاحظ: متى تأتي هذه الفكرة أكثر؟ (موقف؟ وقت؟)', durationMinutes: 0, emoji: '👁️' }, { id: 'o1t3', text: 'تنفّس 5 مرات عندما تأتي الفكرة القادمة', durationMinutes: 0, emoji: '🫁' }] },
            { day: 2, title: 'تفريغ الدماغ', subtitle: 'أخرج كل شيء للورق', tasks: [{ id: 'o2t1', text: 'اكتب بلا توقف 5 دقائق: كل ما في رأسك', durationMinutes: 5, emoji: '✍️' }, { id: 'o2t2', text: 'اقسم ما كتبته: حقيقي اليوم / توقع مستقبل / ماضٍ', durationMinutes: 5, emoji: '🗂️' }, { id: 'o2t3', text: 'الحقيقي: ما خطوة واحدة تفعلها اليوم؟', durationMinutes: 0, emoji: '✅' }] },
            { day: 3, title: 'إيقاف الفكرة', subtitle: 'يمكن تحويل الانتباه بشكل واعٍ', tasks: [{ id: 'o3t1', text: 'عندما تلاحظ الاجترار: قل بصوت «توقف»', durationMinutes: 0, emoji: '🛑' }, { id: 'o3t2', text: 'تأريض فوري: ٥-٤-٣-٢-١', durationMinutes: 3, emoji: '🌍' }, { id: 'o3t3', text: 'انشغل بشيء يدوي 10 دقائق: طبخ، رسم، ترتيب', durationMinutes: 10, emoji: '🤲' }] },
            { day: 4, title: 'وقت القلق المحدد', subtitle: 'أعطِ القلق وقتاً — لا تتركه يسرق كل وقتك', tasks: [{ id: 'o4t1', text: 'حدد 15 دقيقة يومياً «لوقت القلق» فقط', durationMinutes: 0, emoji: '⏰' }, { id: 'o4t2', text: 'خارج هذا الوقت: لو أتت فكرة — أجّلها لوقت القلق', durationMinutes: 0, emoji: '📅' }, { id: 'o4t3', text: 'في وقت القلق: اكتب، لا تجتر فقط', durationMinutes: 15, emoji: '📝' }] },
            { day: 5, title: 'الاجترار والسيطرة', subtitle: 'الاجترار وهمٌ بالسيطرة', tasks: [{ id: 'o5t1', text: 'اكتب: ما الذي تريد التحكم فيه بالتفكير المتكرر؟', durationMinutes: 5, emoji: '✍️' }, { id: 'o5t2', text: 'اسأل نفسك: هل التفكير المتكرر يُغيّر شيئاً فعلياً؟', durationMinutes: 0, emoji: '🔍' }, { id: 'o5t3', text: 'اكتب: ما خطوة عملية واحدة يمكنني فعلها؟', durationMinutes: 0, emoji: '✅' }] },
            { day: 6, title: 'النوم والاجترار', subtitle: 'الليل هو وقت أشد الاجترار — نتعامل معه', tasks: [{ id: 'o6t1', text: 'قبل النوم: فرّغ ذهنك بالكتابة 5 دقائق', durationMinutes: 5, emoji: '📝' }, { id: 'o6t2', text: 'اكتب 3 أشياء جميلة حدثت اليوم', durationMinutes: 3, emoji: '✨' }, { id: 'o6t3', text: 'تنفس 4-4-6 حتى تنام', durationMinutes: 0, emoji: '🫁' }] },
            { day: 7, title: 'التقييم والاستمرار', subtitle: 'ما الذي تغيّر؟', tasks: [{ id: 'o7t1', text: 'قيّم: كيف أعراض الاجترار مقارنة بالأسبوع الماضي؟', durationMinutes: 0, emoji: '📊' }, { id: 'o7t2', text: 'ما الأداة الأنجح؟ خطط للاستمرار بها', durationMinutes: 0, emoji: '⭐' }, { id: 'o7t3', text: 'هل تحتاج جلسة متخصصة لفهم الجذر أعمق؟', durationMinutes: 0, emoji: '🤝' }] },
        ],
    },

    'fikri_overthink_practice': {
        type: 'practice',
        durationMinutes: 5,
        goal: 'إخراج الأفكار المتراكمة من الرأس للورق لتخفيف الضغط',
        intro: 'الاجترار يحدث لأن دماغك يحاول «معالجة» شيء عالق. الكتابة تُساعده على تحريره.',
        steps: [
            { index: 1, instruction: 'خذ ورقة أو افتح النوتيش — لا قواعد، لا رقابة', durationSeconds: 10 },
            { index: 2, instruction: 'اكتب كل ما في رأسك الآن — بلا توقف، بلا تصحيح', durationSeconds: 180 },
            { index: 3, instruction: 'توقف، تنفّس 3 مرات. اقرأ ما كتبت', durationSeconds: 30 },
            { index: 4, instruction: 'ضع دائرة حول كل شيء لا تستطيع تغييره', durationSeconds: 30 },
            { index: 5, instruction: 'ضع مربعاً حول شيء واحد يمكنك فعله', durationSeconds: 20 },
            { index: 6, instruction: 'افعل ذلك الشيء الواحد أو ضع له موعداً', durationSeconds: 10 },
        ],
        closingNote: 'الاجترار يوهمك أن التفكير الأكثر = حلول أكثر. ليس صحيحاً.',
        repeatSuggestion: 'صباحاً أو قبل النوم — خاصة في أوقات الضغط',
    },

    /* ─────────────────────────────────────────────────────
       RUHI / RHYTHM_DISRUPTION
       ───────────────────────────────────────────────────── */

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

    /* ─────────────────────────────────────────────────────
       JASADI / SLEEP — الأدوات الناقصة (Sprint 4)
       ───────────────────────────────────────────────────── */

    'jasadi_sleep_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'تحديد نمط اضطراب النوم الأساسي وجذره',
        intro: 'هذا الاختبار يُساعدك تحديد نوع مشكلة نومك: صعوبة الدخول، الاستمرار، أو الجودة.',
        questions: [
            {
                id: 'sq1', text: 'كم دقيقة تستغرق عادةً حتى تنام بعد الاستلقاء؟',
                options: [{ value: 0, label: 'أقل من 15 دقيقة' }, { value: 1, label: '15-30 دقيقة' }, { value: 2, label: '30-60 دقيقة' }, { value: 3, label: 'أكثر من ساعة' }],
            },
            {
                id: 'sq2', text: 'هل تستيقظ في منتصف الليل؟',
                options: [{ value: 0, label: 'نادراً أو أبداً' }, { value: 1, label: 'أحياناً مرة' }, { value: 2, label: 'عدة مرات أسبوعياً' }, { value: 3, label: 'تقريباً كل ليلة' }],
            },
            {
                id: 'sq3', text: 'كيف تصف جودة نومك الأسبوع الماضي؟',
                options: [{ value: 0, label: 'ممتازة — استيقاظ منتعش' }, { value: 1, label: 'مقبولة أحياناً' }, { value: 2, label: 'سيئة — تعبان عند الاستيقاظ' }, { value: 3, label: 'سيئة جداً — منهك عند الاستيقاظ' }],
            },
            {
                id: 'sq4', text: 'هل تُستخدم الشاشات قبل النوم؟',
                options: [{ value: 0, label: 'لا، أُغلقها قبل ساعة' }, { value: 1, label: 'أحياناً 30 دقيقة' }, { value: 2, label: 'عادةً حتى لحظة النوم' }, { value: 3, label: 'نعم وفي السرير نفسه' }],
            },
            {
                id: 'sq5', text: 'هل يؤثر سوء النوم على أداءك اليومي؟',
                options: [{ value: 0, label: 'لا — أداؤوي جيد' }, { value: 1, label: 'أحياناً أشعر بالتعب' }, { value: 2, label: 'كثيراً — تركيزي منخفض' }, { value: 3, label: 'دائماً — يؤثر على كل شيء' }],
            },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'نوم جيد نسبياً', message: 'نومك يحتاج تحسينات بسيطة فقط. نمط الشاشات والمواعيد هو المفتاح.', nextStep: 'طبّق روتين المساء لأسبوع وستلاحظ فرقاً ملموساً.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'اضطراب نوم متوسط', message: 'نومك غير منتظم — مزيج من التوتر والعادات يؤثر على إيقاعك.', nextStep: 'ابدأ بروتوكول النوم 7 أيام وسجّل التغييرات يومياً.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'اضطراب نوم مزمن', message: 'إرهاقك المتراكم يؤثر على وظائف يومية. هذا يستحق اهتماماً أعمق.', nextStep: 'ابدأ البروتوكول + فكّر في استشارة متخصص إذا لم يتحسن بعد أسبوع.' },
        ],
    },

    'jasadi_sleep_workshop': {
        type: 'workshop',
        durationMinutes: 8,
        goal: 'فهم علم النوم وسبب انكسار إيقاعك البيولوجي',
        intro: 'النوم ليس مجرد راحة — هو عملية بيولوجية معقدة يتحكم بها الضوء والحرارة والكيمياء.',
        sections: [
            {
                title: 'الساعة البيولوجية', emoji: '⏰',
                body: 'جسمك يعمل على إيقاع يومي مدته 24 ساعة تقريباً يُسمى "الإيقاع اليوماوي". هذا الإيقاع يتحكم في متى تنام، متى تصحو، متى يرتفع جهازك المناعي. أقوى مُنظّم له هو ضوء الشمس في الصباح.',
            },
            {
                title: 'ماذا يفعل الضوء الأزرق؟', emoji: '📱',
                body: 'الشاشات تُصدر ضوءاً أزرق يُخبر دماغك أنه "نهار". يتوقف إنتاج الميلاتونين — هرمون النوم — وتبقى مستيقظاً حتى لو استلقيت في فراشك. 30 دقيقة من الشاشة = 1-2 ساعة تأخر في النوم.',
            },
            {
                title: 'درجة حرارة الجسم والنوم', emoji: '🌡️',
                body: 'جسمك يحتاج أن ينخفض درجة ونصف تقريباً ليدخل في النوم العميق. لهذا الحمام الدافئ قبل النوم يساعد — لأنه يرفع درجة الجلد ثم تنخفض بسرعة بعده، مما يُسرّع الدخول في النوم.',
            },
        ],
        keyTakeaways: [
            'ضوء الشمس صباحاً هو أهم شيء تفعله لإصلاح نومك',
            'الشاشات قبل النوم ليست مجرد تشتيت — هي تمنع هرمون النوم',
            'بيئة النوم (برودة + ظلام) أهم من وقت النوم وحده',
        ],
        closingAction: 'اليوم: اقفل الشاشات عند الساعة 9 مساءً وافتح النافذة لتبريد الغرفة.',
    },

    /* ─────────────────────────────────────────────────────
       NAFSI / ANXIETY — الأدوات الناقصة (Sprint 4)
       ───────────────────────────────────────────────────── */

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

    /* ─────────────────────────────────────────────────────
       JASADI / ENERGY_FATIGUE — كل الأدوات (Sprint 4)
       ───────────────────────────────────────────────────── */

    'jasadi_energy_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'تحديد جذر الإرهاق المزمن: نمط الحياة؟ كظري؟ عصبي؟',
        intro: 'الإرهاق ليس كسلاً — له جذور بيولوجية ونفسية متعددة. هذا الاختبار يُساعدك تضييق السبب.',
        questions: [
            {
                id: 'eq1', text: 'متى تشعر بأشد الإرهاق خلال اليوم؟',
                options: [{ value: 0, label: 'لا إرهاق واضح' }, { value: 1, label: 'بعد الغداء فقط' }, { value: 2, label: 'من الصباح المبكر' }, { value: 3, label: 'طوال اليوم باستمرار' }],
            },
            {
                id: 'eq2', text: 'هل تستيقظ منتعشاً بعد نوم كافٍ؟',
                options: [{ value: 0, label: 'نعم — أستيقظ بطاقة' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'نادراً — دائماً أتعب' }, { value: 3, label: 'لا — الإرهاق من أول النوم' }],
            },
            {
                id: 'eq3', text: 'هل يُصاحب إرهاقك أعراض أخرى؟',
                options: [{ value: 0, label: 'لا' }, { value: 1, label: 'صداع أو ثقل خفيف' }, { value: 2, label: 'آلام عضلية أو مفصلية' }, { value: 3, label: 'ضباب ذهني + آلام + اكتئاب' }],
            },
            {
                id: 'eq4', text: 'كيف إرهاقك مقارنة بالسنوات الماضية؟',
                options: [{ value: 0, label: 'طبيعي — لم يتغير' }, { value: 1, label: 'أسوأ قليلاً' }, { value: 2, label: 'أسوأ بوضوح خلال سنة' }, { value: 3, label: 'تراجع كبير مستمر' }],
            },
            {
                id: 'eq5', text: 'ما مستوى تأثير الإرهاق على إنتاجيتك؟',
                options: [{ value: 0, label: 'لا تأثير' }, { value: 1, label: 'أحياناً أُفضّل الراحة' }, { value: 2, label: 'أُنجز أقل بكثير' }, { value: 3, label: 'لا أستطيع إنجاز مهام أساسية' }],
            },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'إرهاق خفيف موقت', message: 'إرهاقك يبدو مرتبطاً بنمط الحياة — النوم والغذاء والحركة.', nextStep: 'أسبوع من عادات الطاقة الصغيرة كافٍ للفرق.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'إرهاق مزمن متوسط', message: 'إرهاقك متكرر ويؤثر على يومك. قد يكون مرتبطاً بالتوتر أو اضطراب النوم.', nextStep: 'ابدأ بروتوكول الطاقة 7 أيام وتابع مستوياتك.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'إرهاق مزمن عميق', message: 'ما تصفه يحتاج تقييماً طبياً — الإرهاق المزمن الشديد قد يكون له جذر عضوي.', nextStep: 'ابدأ البروتوكول + احجز استشارة مع طبيب لإجراء تحاليل أساسية.' },
        ],
    },

    'jasadi_energy_practice': {
        type: 'practice',
        durationMinutes: 5,
        goal: 'رفع طاقة منتصف اليوم بتمرين تنفس + حركة صغيرة خلال 3 دقائق',
        intro: 'الإرهاق في منتصف اليوم يمكن كسره بـ 3 دقائق فقط — المشكلة أننا لا نتذكر.',
        steps: [
            { index: 1, instruction: 'قف أو اجلس باستقامة — أبعد الجسم عن الشاشة', durationSeconds: 10 },
            { index: 2, instruction: 'تنفّس عميق من الأنف: 4 ثوانٍ داخل — 4 حبس — 6 خروج', durationSeconds: 14 },
            { index: 3, instruction: 'كرّر التنفس 5 مرات مع الانتباه لشعور الأكسجين', durationSeconds: 70 },
            { index: 4, instruction: 'قف — تمدد ذراعيك للأعلى — لف رقبتك ببطء ٣ مرات', durationSeconds: 30 },
            { index: 5, instruction: 'اشرب كوب ماء كامل الآن — بلا استعجال', durationSeconds: 20 },
            { index: 6, instruction: 'امش 60 خطوة — داخل المكان إذا لزم', durationSeconds: 30 },
        ],
        closingNote: 'الماء + التنفس + الحركة الصغيرة = أقوى "قهوة" طبيعية في منتصف اليوم.',
        repeatSuggestion: 'كل يوم 2-3 مرة — خاصة بعد الغداء وبعد الساعة 3',
    },

    'jasadi_energy_workshop': {
        type: 'workshop',
        durationMinutes: 10,
        goal: 'فهم لماذا أنت متعب فعلاً — علمياً وعملياً',
        intro: 'الإرهاق ليس كسلاً. والحل ليس دائماً القهوة أو النوم الأطول. فهم السبب يُغيّر التعامل معه.',
        sections: [
            {
                title: 'أنواع الإرهاق', emoji: '🔋',
                body: 'الإرهاق له مصادر متعددة: إرهاق جسدي (عضلي وهرموني)، إرهاق ذهني (تحميل معلوماتي)، إرهاق عاطفي (استنزاف علاقات وقرارات)، وإرهاق كظري (ناتج عن ضغط مزمن يُنهك الغدة الكظرية). معظم الناس يعانون خليطاً من اثنين أو ثلاثة.',
            },
            {
                title: 'الميتوكوندريا ومصانع الطاقة', emoji: '⚡',
                body: 'الميتوكوندريا هي "محطات الطاقة" في خلاياك. تحتاج أكسجيناً (حركة)، وماءً، ومغنيسيوماً، وزنكاً، وفيتامين B لتعمل. التوتر المزمن يُقلّص كفاءتها. ولهذا الضغط الطويل = إرهاق حقيقي بيولوجياً.',
            },
            {
                title: 'دور الكورتيزول', emoji: '📈',
                body: 'الكورتيزول يُفترض أن يرتفع صباحاً ليُيقظك وينخفض مساءً ليُنيمك. في الضغط المزمن، يبقى مرتفعاً باستمرار — مما يُعطّل النوم، يُضعف التركيز، ويُنهك الطاقة. هذا ما يُسمى "الإرهاق الكظري".',
            },
        ],
        keyTakeaways: [
            'الإرهاق المزمن له جذر بيولوجي — ليس ضعفاً نفسياً',
            'الحركة الصغيرة + الماء + النوم = الثلاثي الأساسي للطاقة',
            'إذا لم يتحسن رغم العادات الجيدة — تحاليل الدم ضرورية',
        ],
        closingAction: 'اليوم: اشرب 2 لتر ماء + امشِ 10 دقائق + نم قبل 11. فقط هذا.',
    },

    'jasadi_energy_tracker': {
        type: 'tracker',
        durationMinutes: 1,
        goal: 'تتبع مستويات الطاقة 3 مرات يومياً لاكتشاف أنماط الانهيار والذروة',
        intro: 'سجّل كل يوم — نبحث عن النمط، لا الكمال.',
        insight: 'بعد 3 أيام ستعرف بالضبط متى تكون طاقتك في الذروة. هذا يُغيّر كيف تُنظّم يومك.',
        fields: [
            { id: 'morning_energy', label: 'طاقة الصباح', emoji: '🌅', type: 'scale', min: 1, max: 10 },
            { id: 'midday_energy',  label: 'طاقة الظهيرة', emoji: '☀️', type: 'scale', min: 1, max: 10 },
            { id: 'evening_energy', label: 'طاقة المساء',   emoji: '🌙', type: 'scale', min: 1, max: 10 },
            {
                id: 'energy_drain',
                label: 'أكثر شيء استنزف طاقتك اليوم',
                emoji: '🔋',
                type: 'choice',
                options: ['لا يوجد', 'عمل/دراسة', 'توتر نفسي', 'اجتماعات', 'قلة نوم', 'قلة طعام', 'أخرى'],
            },
            { id: 'water', label: 'هل شربت ماء كافياً؟', emoji: '💧', type: 'boolean' },
            { id: 'note',  label: 'ملاحظة (اختياري)', emoji: '📝', type: 'text' },
        ],
    },

    /* ─────────────────────────────────────────────────────
       JASADI / HORMONAL — Wave 2 (Sprint 5)
       ───────────────────────────────────────────────────── */

    'jasadi_hormonal_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'رصد الأعراض التي تشير لخلل هرموني محتمل',
        intro: 'الهرمونات تتحكم في الطاقة والمزاج والنوم والوزن. هذا الاختبار يُساعدك تحديد ما إذا كان توازنك الهرموني مختلاً.',
        questions: [
            { id: 'hq1', text: 'هل تعاني من تغيرات مزاجية مفاجئة أو حدة غير مبررة؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'يومياً تقريباً' }] },
            { id: 'hq2', text: 'هل تعاني من زيادة وزن غير مبررة أو صعوبة في الخسارة؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'قليلاً' }, { value: 2, label: 'نعم — رغم المحاولة' }, { value: 3, label: 'مشكلة كبيرة ومستمرة' }] },
            { id: 'hq3', text: 'كيف مستوى طاقتك ومزاجك عموماً؟', options: [{ value: 0, label: 'جيد ومنتظم' }, { value: 1, label: 'متذبذب قليلاً' }, { value: 2, label: 'منخفض في كثير من الأحيان' }, { value: 3, label: 'منخفض باستمرار' }] },
            { id: 'hq4', text: 'هل تعاني من تعب غير مبرر رغم النوم الكافي؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً' }] },
            { id: 'hq5', text: 'هل لاحظت تغيرات في الجلد أو الشعر أو الحرارة؟', options: [{ value: 0, label: 'لا تغييرات' }, { value: 1, label: 'تغييرات خفيفة' }, { value: 2, label: 'ملحوظة ومزعجة' }, { value: 3, label: 'شديدة ومستمرة' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'توازن هرموني جيد', message: 'الأعراض خفيفة — نمط الحياة والنوم والتوتر يمكنهم الحفاظ على التوازن.', nextStep: 'استمر في عادات النوم والحركة وتقليل التوتر.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'بوادر خلل هرموني', message: 'الأعراض تشير لضغط على المحور الهرموني — التوتر والنوم أكثر المؤثرات.', nextStep: 'ابدأ بروتوكول الهرمونات 7 أيام وراقب التغيير.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'خلل هرموني محتمل', message: 'الأعراض متعددة وتؤثر على يومك — يحتاج تقييم أعمق.', nextStep: 'ابدأ البروتوكول + احجز تحاليل: TSH, فيريتين, B12, Vitamin D.' },
        ],
    },

    'jasadi_hormonal_practice': {
        type: 'practice',
        durationMinutes: 8,
        goal: 'دعم التوازن الهرموني بثلاثي: حركة + شمس + تنفس',
        intro: 'ثلاث دقائق من الحركة والتنفس الواعي يُفعّل محور الكورتيزول الصحي.',
        steps: [
            { index: 1, instruction: 'اخرج في الشمس — أو اجلس قرب نافذة مشمسة', durationSeconds: 30 },
            { index: 2, instruction: 'تمدد ببطء: يدان فوق الرأس، ظهر مستقيم — أطلق التوتر', durationSeconds: 20 },
            { index: 3, instruction: 'تنفس 4-6-8: داخل 4 ثوانٍ، حبس 6، خروج 8 — كرّر 5 مرات', durationSeconds: 90 },
            { index: 4, instruction: 'امشِ أو حرّك جسمك بأي شكل لمدة 3 دقائق', durationSeconds: 180 },
            { index: 5, instruction: 'اجلس واشرب ماءً دافئاً — هذا يُهدئ الكورتيزول', durationSeconds: 30 },
        ],
        closingNote: 'الحركة والشمس والتنفس العميق هم أقوى مُعيّدي التوازن الهرموني بدون أدوية.',
        repeatSuggestion: 'كل صباح قبل الشاشات — 8 دقائق فقط تُحدث فرقاً في أسبوعين',
    },

    'jasadi_hormonal_workshop': {
        type: 'workshop',
        durationMinutes: 10,
        goal: 'فهم كيف يُعطّل التوتر المزمن التوازن الهرموني',
        intro: 'الهرمونات ليست مجرد أرقام في تحاليل — هي مواد كيميائية تتحكم في كل شعور تشعره.',
        sections: [
            { title: 'محاور الهرمونات الثلاثة', emoji: '🔄', body: 'الجسم يعمل عبر ثلاثة محاور مترابطة: HPA (الكورتيزول)، HPT (الغدة الدرقية)، HPG (الهرمونات الجنسية). حين يُرهق أحدها بالتوتر — يتأثر الآخران. ولهذا التوتر المزمن يُحدث كل هذه الأعراض المتنوعة.' },
            { title: 'الكورتيزول والهرمونات الأخرى', emoji: '📈', body: 'الكورتيزول في التوتر المزمن يبقى مرتفعاً باستمرار. هذا يُقلّص إنتاج الهرمونات الجنسية، يُبطئ هرمون الغدة الدرقية، ويزيد الدهون البطنية. الجسم "يُضحّي" بالوظائف غير الطارئة دفاعاً عن مواجهة ما يراه تهديداً.' },
            { title: 'العوامل الأربعة المؤثرة', emoji: '🌿', body: 'أربعة عوامل تحرّك الهرمونات أكثر من غيرها: النوم (مصنع الهرمونات)، السكر والكربوهيدرات المكررة (ترفع الأنسولين)، التوتر المستمر (يرفع الكورتيزول)، والتمرين الزائد أو المفقود كلياً (يُعطّل التوازن).' },
        ],
        keyTakeaways: [
            'التوتر المزمن هو أكثر مُعطّل للتوازن الهرموني في حياتنا اليوم',
            'النوم الكافي قبل منتصف الليل هو أفضل علاج هرموني مجاني',
            'تحاليل الدم الدورية ضرورية إذا استمرت الأعراض رغم تحسّن نمط الحياة',
        ],
        closingAction: 'اليوم: نم قبل 11 مساءً أو اقرب وقت ممكن — هذا أقوى دعم هرموني تقدمه لجسمك.',
    },

    'jasadi_hormonal_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'رصد الأعراض الهرمونية يومياً للكشف عن الأنماط',
        intro: 'تتبّع الأعراض يومياً يُساعدك تحديد ما يُحسّن أو يُسوّئ توازنك الهرموني.',
        insight: 'بعد أسبوع ستبدأ ترى الأنماط: هل التوتر سبب؟ النوم؟ الطعام؟',
        fields: [
            { id: 'energy_level', label: 'مستوى طاقتك اليوم', emoji: '⚡', type: 'scale', min: 1, max: 10 },
            { id: 'mood',         label: 'مزاجك العام', emoji: '😊', type: 'scale', min: 1, max: 10 },
            { id: 'sleep_quality', label: 'جودة نومك الليلة الماضية', emoji: '😴', type: 'scale', min: 1, max: 5 },
            { id: 'main_symptom', label: 'أبرز عرض اليوم', emoji: '🔍', type: 'choice', options: ['لا أعراض', 'تعب', 'تقلبات مزاج', 'صداع', 'برود', 'حرارة', 'قلق', 'أخرى'] },
            { id: 'note', label: 'ملاحظة (اختياري)', emoji: '📝', type: 'text' },
        ],
    },

    /* ─────────────────────────────────────────────────────
       NAFSI / PSYCHOSOMATIC — Wave 2 (Sprint 5)
       ───────────────────────────────────────────────────── */

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

    /* ─────────────────────────────────────────────────────
       FIKRI / OVERTHINKING — Wave 2 (Sprint 5)
       ───────────────────────────────────────────────────── */

    'fikri_overthink_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'تحديد نمط ونوع التفكير الزائد المسيطر',
        intro: 'فرط التفكير له أنماط مختلفة — التشخيص الصحيح يُحدد الأسلوب الأنسب للتعامل معه.',
        questions: [
            { id: 'oq1', text: 'هل تُعيد أحداث الماضي مراراً وتكراراً في رأسك؟', options: [{ value: 0, label: 'نادراً' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'يومياً تقريباً' }] },
            { id: 'oq2', text: 'هل تقضي وقتاً طويلاً في القلق على مواقف مستقبلية؟', options: [{ value: 0, label: 'لا تقريباً' }, { value: 1, label: 'قليلاً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'أغلب وقتي' }] },
            { id: 'oq3', text: 'هل صعوبة اتخاذ القرارات تتعبك لأنك تُفكّر كثيراً في كل خيار؟', options: [{ value: 0, label: 'لا — أقرر بسهولة' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً — مؤلم' }] },
            { id: 'oq4', text: 'هل التفكير الزائد يؤثر على نومك؟', options: [{ value: 0, label: 'لا تأثير' }, { value: 1, label: 'أحياناً أفكر قبل النوم' }, { value: 2, label: 'كثيراً — يأخر نومي' }, { value: 3, label: 'دائماً — مشكلة كبيرة' }] },
            { id: 'oq5', text: 'هل الأفكار الدائرية تستنزف طاقتك الذهنية يومياً؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'قليلاً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'حد الإنهاك' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'تفكير واعٍ لا دائري', message: 'أفكارك منظمة نسبياً — بعض التقنيات البسيطة ستُحسّن صفاءك الذهني.', nextStep: 'تمرين المسافة الذهنية يومياً كوقاية كافٍ.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'فرط تفكير متوسط', message: 'الأفكار الدائرية تستنزف وقتاً وطاقة. الوعي بها هو أول الحل.', nextStep: 'ابدأ بروتوكول تهدئة العقل 7 أيام.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'فرط تفكير مزمن', message: 'عقلك نادراً ما يهدأ — هذا يستنزف طاقتك ويؤثر على نومك وقراراتك.', nextStep: 'ابدأ البروتوكول + فكّر في CBT مع معالج متخصص في القلق المعرفي.' },
        ],
    },

    'fikri_overthink_workshop': {
        type: 'workshop',
        durationMinutes: 8,
        goal: 'فهم الفرق بين التفكير المنتج والتفكير الدائري',
        intro: 'فرط التفكير ليس ذكاءً — هو قلق يلبس ثوب التخطيط والتحليل.',
        sections: [
            { title: 'التفكير المنتج مقابل الدائري', emoji: '🔄', body: 'التفكير المنتج يُفضي إلى خيار أو قرار أو فهم جديد. التفكير الدائري يُعيد نفس الأسئلة بلا إجابة — "هل كان يجب؟ ماذا لو؟ كيف لو؟" الفرق ليس في موضوع الفكرة بل في هل تتقدم أم تدور.' },
            { title: 'لماذا لا يهدأ العقل؟', emoji: '⚡', body: 'الدماغ في وضع "خطر افتراضي" — يُولّد سيناريوهات ليحمي نفسه. هذا مفيد في الخطر الحقيقي، لكن في حياتنا الحديثة يُشغَّل لكل شيء. الحل ليس إيقاف التفكير بل تعليم العقل متى يُشغَّل ومتى يستريح.' },
            { title: '"وقت القلق" المحدد', emoji: '⏰', body: 'تقنية مثبتة علمياً: خصّص 15 دقيقة يومياً لـ"تفكير الهموم". خارج هذا الوقت — أي فكرة قلقة → "سأفكر بها في وقت القلق". هذا يُعلّم العقل أن له وقتاً ويُريح بقية اليوم من الأفكار الدائرية.' },
        ],
        keyTakeaways: [
            'فرط التفكير هو خطر افتراضي يُحركه القلق لا الذكاء',
            '"وقت القلق" المحدد أقوى تقنية لكسر دائرة فرط التفكير',
            'الكتابة اليومية تُخرج الأفكار من الرأس إلى الورق — تخف ثقلاً',
        ],
        closingAction: 'اليوم: خصّص 15 دقيقة "وقت قلق" في وقت محدد — وأخّر كل فكرة قلقة لها.',
    },

    'fikri_overthink_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'تتبع الأفكار الدائرية يومياً لاكتشاف المحفزات',
        intro: 'سجّل يومياً — الهدف ليس الكمال بل فهم النمط.',
        insight: 'بعد 3 أيام ستعرف ما الأوقات والمواقف التي تُشعل فرط التفكير أكثر.',
        fields: [
            { id: 'rumination_count', label: 'كم مرة انجرفت في أفكار دائرية اليوم؟', emoji: '🌀', type: 'scale', min: 0, max: 10 },
            { id: 'trigger',          label: 'ما الذي أشعل التفكير الزائد؟', emoji: '⚡', type: 'choice', options: ['لا شيء محدد', 'عمل/دراسة', 'علاقات', 'مستقبل', 'قرار معلّق', 'خبر سمعته', 'أخرى'] },
            { id: 'managed',          label: 'هل استطعت وضع الفكرة جانباً في بعض الأوقات؟', emoji: '✅', type: 'boolean' },
            { id: 'note',             label: 'ملاحظة (اختياري)', emoji: '📝', type: 'text' },
        ],
    },

    /* ─────────────────────────────────────────────────────
       RUHI / RHYTHM_DISRUPTION — Wave 2 (Sprint 5)
       ───────────────────────────────────────────────────── */

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
};

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */

/**
 * Get tool content by tool ID.
 * Returns null if no content is defined yet.
 */
export function getToolContent(toolId: string): ToolContent | null {
    return TOOL_CONTENT[toolId] ?? null;
}

/**
 * Build the tool page URL from tool type and ID.
 * /tools/protocol/jasadi_digestive_protocol
 */
export function getToolPageUrl(type: ToolType, toolId: string): string {
    return `/tools/${type}/${toolId}`;
}

/**
 * Check if a tool has a real page (embedded content) vs. redirect.
 */
export function hasToolPage(toolId: string): boolean {
    return toolId in TOOL_CONTENT;
}
