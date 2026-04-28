// lib/content/jasadi-content.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Jasadi (Physical) Tool Content
// ════════════════════════════════════════════════════════════════════════

import type {
    ToolContent,
    ProtocolContent, PracticeContent, TestContent,
    WorkshopContent, TrackerContent,
    ProtocolDay, ProtocolTask, PracticeStep,
    TestQuestion, TestResult,
    WorkshopSection, TrackerField,
} from './tool-content-types';

export const JASADI_CONTENT: Record<string, ToolContent> = {
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
                    // Tayyibat policy: plain yogurt = forbidden dairy (Casein A1). Use cooked cheese or natural butter.
                    { id: 'd3t1', text: 'أضف جبناً مطبوخاً (شيدر/جودا) أو زبدة بلدي مع الفطور — دهون سهلة الهضم بدون تخمر', durationMinutes: 0, emoji: '🧀' },
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

    'jasadi_energy_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'استعادة الطاقة من الجذر: نوم + تغذية + حركة + تنفس',
        howItWorks: 'كل يوم يُعالج جانباً واحداً من معادلة الطاقة. لا تغيير جذري — تراكم ذكي.',
        completionMessage: 'أسبوع من إعادة بناء طاقتك — لاحظ الفرق في أيام الالتزام.',
        days: [
            { day: 1, title: 'تدقيق الطاقة', subtitle: 'اكتشف أين تضيع طاقتك', tasks: [
                { id: 'en1t1', text: 'سجّل مستوى طاقتك 3 مرات: صباح، ظهر، مساء (1-10)', durationMinutes: 2, emoji: '📊' },
                { id: 'en1t2', text: 'اكتب ما أرهقك اليوم وما أنعشك', durationMinutes: 5, emoji: '📝' },
                { id: 'en1t3', text: 'نم قبل الساعة 11 مساءً', durationMinutes: 0, emoji: '🌙' },
            ]},
            { day: 2, title: 'ترطيب وتغذية', subtitle: 'الطاقة تبدأ مما تأكل وتشرب', tasks: [
                { id: 'en2t1', text: 'اشرب 2 لتر ماء على الأقل', durationMinutes: 0, emoji: '💧' },
                { id: 'en2t2', text: 'تناول بروتين في الفطور (بيض، فول، لبنة)', durationMinutes: 0, emoji: '🍳' },
                { id: 'en2t3', text: 'قلّل السكر المُضاف اليوم', durationMinutes: 0, emoji: '🚫' },
            ]},
            { day: 3, title: 'حركة مُنشّطة', subtitle: 'الحركة أقوى منبه طبيعي', tasks: [
                { id: 'en3t1', text: 'مشي 20 دقيقة في الهواء الطلق', durationMinutes: 20, emoji: '🚶' },
                { id: 'en3t2', text: 'تمدد 5 دقائق عند الاستيقاظ', durationMinutes: 5, emoji: '🤸' },
                { id: 'en3t3', text: 'تنفس عميق 5 دقائق بعد الظهر', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 4, title: 'نوم عميق', subtitle: 'النوم مصنع الطاقة', tasks: [
                { id: 'en4t1', text: 'لا شاشات ساعة قبل النوم', durationMinutes: 0, emoji: '📵' },
                { id: 'en4t2', text: 'غرفة باردة ومظلمة', durationMinutes: 0, emoji: '🌑' },
                { id: 'en4t3', text: 'تمرين استرخاء عضلي قبل النوم', durationMinutes: 10, emoji: '🧘' },
            ]},
            { day: 5, title: 'تقليل المستنزفات', subtitle: 'أزل ما يسرق طاقتك', tasks: [
                { id: 'en5t1', text: 'حدد 3 أشياء تستنزف طاقتك: أشخاص، أخبار، عادات', durationMinutes: 5, emoji: '🔍' },
                { id: 'en5t2', text: 'قلّل واحداً منها اليوم', durationMinutes: 0, emoji: '✂️' },
                { id: 'en5t3', text: 'خذ استراحة 10 دقائق كل 90 دقيقة عمل', durationMinutes: 0, emoji: '⏰' },
            ]},
            { day: 6, title: 'ضوء وإيقاع', subtitle: 'نظّم ساعتك البيولوجية', tasks: [
                { id: 'en6t1', text: 'تعرّض للشمس أول 15 دقيقة من الصباح', durationMinutes: 15, emoji: '☀️' },
                { id: 'en6t2', text: 'وجبات في أوقات منتظمة', durationMinutes: 0, emoji: '🍽️' },
                { id: 'en6t3', text: 'مشي + تنفس واعٍ', durationMinutes: 15, emoji: '🫁' },
            ]},
            { day: 7, title: 'التقييم', subtitle: 'قارن بيومك الأول', tasks: [
                { id: 'en7t1', text: 'سجّل طاقتك اليوم 3 مرات وقارن بيوم 1', durationMinutes: 5, emoji: '📊' },
                { id: 'en7t2', text: 'ما الذي نجح أكثر؟ اجعله عادة دائمة', durationMinutes: 5, emoji: '⭐' },
                { id: 'en7t3', text: 'اشكر جسمك على أسبوع من الالتزام', durationMinutes: 0, emoji: '🙏' },
            ]},
        ],
    },

    'jasadi_hormonal_protocol': {
        type: 'protocol',
        totalDays: 14,
        goal: 'إعادة التوازن الهرموني عبر النوم والتغذية والحركة',
        howItWorks: 'أسبوعان: الأول لتثبيت الأساسيات، الثاني لتعميق التأثير.',
        completionMessage: 'أسبوعان من إعادة البرمجة الهرمونية — التغيير يبدأ من هنا.',
        days: [
            { day: 1, title: 'النوم أولاً', subtitle: 'الهرمونات تُصنع في النوم', tasks: [
                { id: 'h1t1', text: 'نم قبل 11 مساءً — هذا غير قابل للتفاوض', durationMinutes: 0, emoji: '🌙' },
                { id: 'h1t2', text: 'لا كافيين بعد الظهر', durationMinutes: 0, emoji: '☕' },
                { id: 'h1t3', text: 'غرفة مظلمة وباردة', durationMinutes: 0, emoji: '🌑' },
            ]},
            { day: 2, title: 'دهون صحية', subtitle: 'الهرمونات تُبنى من الدهون', tasks: [
                { id: 'h2t1', text: 'أضف أفوكادو أو زيت زيتون لوجبة', durationMinutes: 0, emoji: '🥑' },
                { id: 'h2t2', text: 'تناول مكسرات نيئة كسناك', durationMinutes: 0, emoji: '🥜' },
                { id: 'h2t3', text: 'تنفس 4-6-8 قبل النوم', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 3, title: 'حركة هادئة', subtitle: 'الرياضة العنيفة ترفع الكورتيزول', tasks: [
                { id: 'h3t1', text: 'يوغا أو مشي هادئ 20 دقيقة', durationMinutes: 20, emoji: '🧘' },
                { id: 'h3t2', text: 'تمدد 5 دقائق صباحاً', durationMinutes: 5, emoji: '🤸' },
                { id: 'h3t3', text: 'لا تمرين عنيف اليوم', durationMinutes: 0, emoji: '🚫' },
            ]},
            { day: 4, title: 'تقليل السكر', subtitle: 'السكر يُعطّل الأنسولين والهرمونات', tasks: [
                { id: 'h4t1', text: 'لا عصائر أو مشروبات محلاة اليوم', durationMinutes: 0, emoji: '🚫' },
                { id: 'h4t2', text: 'استبدل الحلو بفاكهة طازجة', durationMinutes: 0, emoji: '🍎' },
                { id: 'h4t3', text: 'سجّل كيف تشعر بدون السكر', durationMinutes: 2, emoji: '📝' },
            ]},
            { day: 5, title: 'ضوء الشمس', subtitle: 'الضوء ينظّم الميلاتونين والسيروتونين', tasks: [
                { id: 'h5t1', text: '15 دقيقة شمس أول الصباح', durationMinutes: 15, emoji: '☀️' },
                { id: 'h5t2', text: 'تقليل الشاشات مساءً', durationMinutes: 0, emoji: '📵' },
                { id: 'h5t3', text: 'تنفس مع الشمس: 5 أنفاس عميقة في الضوء', durationMinutes: 3, emoji: '🫁' },
            ]},
            { day: 6, title: 'التوتر العدو الأول', subtitle: 'كورتيزول مرتفع = هرمونات مختلة', tasks: [
                { id: 'h6t1', text: 'جلسة تأمل 10 دقائق', durationMinutes: 10, emoji: '🧘' },
                { id: 'h6t2', text: 'حدد مصدر توتر واحد وقلّل تعرضك له', durationMinutes: 0, emoji: '🎯' },
                { id: 'h6t3', text: 'مشي في الطبيعة إن أمكن', durationMinutes: 15, emoji: '🌿' },
            ]},
            { day: 7, title: 'مراجعة الأسبوع الأول', subtitle: 'ما تغيّر؟', tasks: [
                { id: 'h7t1', text: 'سجّل طاقتك ومزاجك مقارنة بيوم 1', durationMinutes: 5, emoji: '📊' },
                { id: 'h7t2', text: 'ما الذي نجح أكثر؟ ضاعفه', durationMinutes: 5, emoji: '⭐' },
                { id: 'h7t3', text: 'استمر في الالتزام — الأسبوع الثاني أعمق', durationMinutes: 0, emoji: '💪' },
            ]},
            { day: 8, title: 'بروتين كافٍ', subtitle: 'البروتين مادة بناء الهرمونات', tasks: [
                { id: 'h8t1', text: '30 غرام بروتين في كل وجبة رئيسية', durationMinutes: 0, emoji: '🍗' },
                { id: 'h8t2', text: 'بيض كامل في الفطور', durationMinutes: 0, emoji: '🍳' },
                { id: 'h8t3', text: 'تنفس عميق 5 دقائق', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 9, title: 'ألياف وأمعاء', subtitle: 'الأمعاء تستقلب الهرمونات', tasks: [
                { id: 'h9t1', text: 'خضار في كل وجبة (جزر، كوسا، بطاطس)', durationMinutes: 0, emoji: '🥕' },
                // Tayyibat: plain yogurt = forbidden dairy group. Use natural vinegar + herbs for gut microbiome support.
                { id: 'h9t2', text: 'ملعقة خل قصب طبيعي مع الغداء وأعشاب هاضمة (ينسون، حلبة) — دعم ميكروبيوم بدون ألبان', durationMinutes: 0, emoji: '🌿' },
                { id: 'h9t3', text: 'اشرب 2 لتر ماء', durationMinutes: 0, emoji: '💧' },
            ]},
            { day: 10, title: 'نوم عميق مرة أخرى', subtitle: 'ثبّت العادة', tasks: [
                { id: 'h10t1', text: 'نفس ميعاد النوم — كل يوم', durationMinutes: 0, emoji: '⏰' },
                { id: 'h10t2', text: 'روتين مساء: شاي أعشاب + كتاب', durationMinutes: 15, emoji: '📖' },
                { id: 'h10t3', text: 'لا أكل بعد 8 مساءً', durationMinutes: 0, emoji: '🍽️' },
            ]},
            { day: 11, title: 'حركة منتظمة', subtitle: 'الانتظام أهم من الشدة', tasks: [
                { id: 'h11t1', text: 'مشي 30 دقيقة', durationMinutes: 30, emoji: '🚶' },
                { id: 'h11t2', text: 'تمارين مقاومة خفيفة 10 دقائق', durationMinutes: 10, emoji: '💪' },
                { id: 'h11t3', text: 'تمدد مسائي', durationMinutes: 5, emoji: '🤸' },
            ]},
            { day: 12, title: 'مكملات ذكية', subtitle: 'ما تحتاجه فعلاً', tasks: [
                { id: 'h12t1', text: 'فيتامين D إذا كنت لا تتعرض للشمس', durationMinutes: 0, emoji: '☀️' },
                { id: 'h12t2', text: 'مغنيسيوم قبل النوم', durationMinutes: 0, emoji: '💊' },
                { id: 'h12t3', text: 'سجّل أي تحسن في النوم أو الطاقة', durationMinutes: 2, emoji: '📝' },
            ]},
            { day: 13, title: 'التوازن اليومي', subtitle: 'دمج كل ما تعلمته', tasks: [
                { id: 'h13t1', text: 'يوم نموذجي: شمس + بروتين + حركة + نوم', durationMinutes: 0, emoji: '🌟' },
                { id: 'h13t2', text: 'تأمل 10 دقائق', durationMinutes: 10, emoji: '🧘' },
                { id: 'h13t3', text: 'لاحظ كيف يحس جسمك مقارنة ببداية البروتوكول', durationMinutes: 0, emoji: '🔍' },
            ]},
            { day: 14, title: 'التقييم النهائي', subtitle: 'أسبوعان من التغيير', tasks: [
                { id: 'h14t1', text: 'قارن طاقتك اليوم بيوم 1 (1-10)', durationMinutes: 5, emoji: '📊' },
                { id: 'h14t2', text: 'إذا لم تتحسن: احجز تحاليل TSH, فيريتين, B12, D', durationMinutes: 0, emoji: '🔬' },
                { id: 'h14t3', text: 'اجعل أفضل 3 عادات دائمة', durationMinutes: 5, emoji: '⭐' },
            ]},
        ],
    },

    'jasadi_inflammatory_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'تقييم مؤشرات الالتهاب الصامت في جسمك',
        intro: 'الالتهاب المزمن لا يظهر كحمّى — يظهر كتعب، ألم مفاصل، ضبابية ذهنية. هذا الاختبار يكشف مستواه.',
        questions: [
            { id: 'inf1', text: 'هل تعاني من آلام مفاصل أو عضلات متكررة بدون إصابة واضحة؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'يومياً تقريباً' }] },
            { id: 'inf2', text: 'هل تشعر بتعب مزمن لا يتحسن بالنوم؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً' }] },
            { id: 'inf3', text: 'هل تعاني من مشاكل جلدية متكررة (حب شباب، أكزيما، طفح)؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'نادراً' }, { value: 2, label: 'كل بضعة أسابيع' }, { value: 3, label: 'مستمرة' }] },
            { id: 'inf4', text: 'هل تتناول أطعمة مصنّعة أو سكريات بانتظام؟', options: [{ value: 0, label: 'نادراً' }, { value: 1, label: '1-2 مرة أسبوعياً' }, { value: 2, label: '3-5 مرات أسبوعياً' }, { value: 3, label: 'يومياً' }] },
            { id: 'inf5', text: 'هل تُصاب بالعدوى بسهولة (نزلات برد متكررة)؟', options: [{ value: 0, label: 'لا — مناعتي قوية' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'نعم — جهازي المناعي ضعيف' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'التهاب منخفض', message: 'مؤشرات الالتهاب خفيفة — نمط حياتك في المسار الصحيح.', nextStep: 'استمر في نظام مضاد للالتهاب كوقاية.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'التهاب صامت متوسط', message: 'هناك مؤشرات على التهاب مزمن خفيف يؤثر على طاقتك ومناعتك.', nextStep: 'ابدأ بروتوكول مضاد الالتهاب 7 أيام.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'التهاب مزمن مرتفع', message: 'مؤشرات الالتهاب مرتفعة — تحتاج تدخل غذائي وتحاليل.', nextStep: 'ابدأ البروتوكول + تحليل CRP وسرعة الترسيب.' },
        ],
    },

    'jasadi_inflammatory_practice': {
        type: 'practice',
        durationMinutes: 5,
        goal: 'تمرين تنفس مضاد للالتهاب يُفعّل العصب الحائر',
        intro: 'العصب الحائر (Vagus) هو المفتاح — تنشيطه يُخفض الالتهاب مباشرة.',
        steps: [
            { index: 1, instruction: 'اجلس بظهر مستقيم — ضع يدك على صدرك', durationSeconds: 10 },
            { index: 2, instruction: 'تنفس ببطء من الأنف: عدّ 4', durationSeconds: 4 },
            { index: 3, instruction: 'احبس: عدّ 7', durationSeconds: 7 },
            { index: 4, instruction: 'أخرج من الفم ببطء مع صوت \"هووو\": عدّ 8', durationSeconds: 8 },
            { index: 5, instruction: 'كرّر 6 مرات — ركّز على إرخاء البطن', durationSeconds: 90 },
            { index: 6, instruction: 'ضع يدك على رقبتك (العصب الحائر) وتنفس بعمق 3 مرات', durationSeconds: 30 },
        ],
        closingNote: 'تنفس 4-7-8 يُفعّل الجهاز العصبي اللاودّي ويُخفض مؤشرات الالتهاب فعلياً.',
        repeatSuggestion: 'صباحاً ومساءً — خاصة بعد الأكل وقبل النوم',
    },

    'jasadi_inflammatory_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'خفض مؤشرات الالتهاب عبر التغذية والتنفس والحركة',
        howItWorks: '7 أيام: تنظيف غذائي + تنشيط العصب الحائر + حركة مضادة للالتهاب.',
        completionMessage: 'أسبوع مضاد للالتهاب — جسمك بدأ يشفي نفسه.',
        days: [
            { day: 1, title: 'تنظيف المحفزات', subtitle: 'أزل أكبر مصادر الالتهاب', tasks: [
                { id: 'i1t1', text: 'لا سكر مُضاف اليوم', durationMinutes: 0, emoji: '🚫' },
                { id: 'i1t2', text: 'لا أطعمة مصنّعة أو مقلية', durationMinutes: 0, emoji: '🍟' },
                { id: 'i1t3', text: 'اشرب 2 لتر ماء + شاي أخضر', durationMinutes: 0, emoji: '🍵' },
            ]},
            { day: 2, title: 'أطعمة مضادة للالتهاب', subtitle: 'أضف ما يشفي', tasks: [
                { id: 'i2t1', text: 'كركم مع فلفل أسود في وجبة واحدة', durationMinutes: 0, emoji: '🟡' },
                { id: 'i2t2', text: 'سلمون أو سمك دهني أو أوميغا 3', durationMinutes: 0, emoji: '🐟' },
                // Tayyibat: leafy greens (broccoli, spinach) restricted during gut healing phase — colonic irritation.
                // Use Tayyibat-allowed colored vegetables: carrots, zucchini, bell peppers (non-leafy).
                { id: 'i2t3', text: 'خضار ملونة: جزر، كوسا، فلفل ألوان — (الخضار الورقية تعود بعد تعافي القولون)', durationMinutes: 0, emoji: '🥕' },
            ]},
            { day: 3, title: 'تنفس العصب الحائر', subtitle: 'أطفئ الالتهاب من الداخل', tasks: [
                { id: 'i3t1', text: 'تنفس 4-7-8 صباحاً ومساءً (6 دورات)', durationMinutes: 10, emoji: '🫁' },
                { id: 'i3t2', text: 'غرغرة بماء 30 ثانية (تُنشّط العصب الحائر)', durationMinutes: 1, emoji: '💧' },
                { id: 'i3t3', text: 'مشي هادئ 15 دقيقة', durationMinutes: 15, emoji: '🚶' },
            ]},
            { day: 4, title: 'نوم مضاد للالتهاب', subtitle: 'النوم يُصلح الالتهاب', tasks: [
                { id: 'i4t1', text: '7-8 ساعات نوم — لا تفاوض', durationMinutes: 0, emoji: '🌙' },
                { id: 'i4t2', text: 'لا شاشات ساعة قبل النوم', durationMinutes: 0, emoji: '📵' },
                { id: 'i4t3', text: 'مغنيسيوم أو شاي بابونج قبل النوم', durationMinutes: 0, emoji: '🍵' },
            ]},
            { day: 5, title: 'حركة لطيفة', subtitle: 'الحركة المعتدلة = مضاد التهاب طبيعي', tasks: [
                { id: 'i5t1', text: 'يوغا أو سباحة خفيفة 20 دقيقة', durationMinutes: 20, emoji: '🧘' },
                { id: 'i5t2', text: 'لا تمارين عالية الشدة اليوم', durationMinutes: 0, emoji: '🚫' },
                { id: 'i5t3', text: 'تمدد عميق 5 دقائق', durationMinutes: 5, emoji: '🤸' },
            ]},
            { day: 6, title: 'إدارة التوتر', subtitle: 'التوتر = أقوى محفز للالتهاب', tasks: [
                { id: 'i6t1', text: 'تأمل 10 دقائق', durationMinutes: 10, emoji: '🧘' },
                { id: 'i6t2', text: 'قلّل أخبار / سوشيال ميديا اليوم', durationMinutes: 0, emoji: '📱' },
                { id: 'i6t3', text: 'اقضِ وقتاً في الطبيعة أو الهدوء', durationMinutes: 15, emoji: '🌿' },
            ]},
            { day: 7, title: 'التقييم', subtitle: 'لاحظ التغيير', tasks: [
                { id: 'i7t1', text: 'هل قلّ الألم أو التعب مقارنة بيوم 1؟', durationMinutes: 5, emoji: '📊' },
                { id: 'i7t2', text: 'ما الطعام الذي أحسست بفرق بدونه؟', durationMinutes: 5, emoji: '🔍' },
                { id: 'i7t3', text: 'اجعل أفضل 3 عادات دائمة', durationMinutes: 0, emoji: '⭐' },
            ]},
        ],
    },

    'jasadi_inflammatory_workshop': {
        type: 'workshop',
        durationMinutes: 8,
        goal: 'فهم الالتهاب الصامت وتأثيره على كل شيء',
        intro: 'الالتهاب المزمن ليس عدوى — هو جهازك المناعي في حالة استنفار مستمرة.',
        sections: [
            { title: 'ما هو الالتهاب الصامت؟', emoji: '🔥', body: 'الالتهاب الحاد مفيد — يشفي الجروح ويقاوم العدوى. لكن الالتهاب المزمن مختلف: الجهاز المناعي يبقى في حالة تأهب بدون عدو حقيقي. يُهاجم أنسجتك ويُسبب تعب مزمن، ألم مفاصل، ضبابية ذهنية، ومشاكل جلدية.' },
            { title: 'المحفزات الخمسة', emoji: '⚡', body: '1) السكر والأطعمة المصنّعة. 2) التوتر المزمن (يرفع الكورتيزول → يرفع الالتهاب). 3) قلة النوم. 4) قلة الحركة أو الحركة المفرطة. 5) السموم البيئية (دخان، مبيدات، بلاستيك). إزالة محفز واحد يُحدث فرقاً كبيراً.' },
            // Tayyibat: leafy greens restricted in healing phase. Use Tayyibat-allowed anti-inflammatory sources.
            { title: 'الغذاء كدواء', emoji: '🥗', body: 'أقوى مضادات الالتهاب بمبادئ الطيبات: الكركم مع فلفل أسود، السمك البحري المشوي (أوميغا 3)، زيت الزيتون، الفراولة والعنب (Resveratrol). الخضار الورقية تعود تدريجياً بعد تعافي الجهاز الهضمي — هذه ليست دايت بل وقود نظيف.' },
        ],
        keyTakeaways: [
            'الالتهاب المزمن وراء معظم الأمراض المزمنة',
            'الطعام إما يُشعل أو يُطفئ الالتهاب — أنت تختار',
            'تنشيط العصب الحائر يُخفض الالتهاب مباشرة',
        ],
        closingAction: 'اليوم: استبدل طعاماً مُصنّعاً واحداً بطعام طبيعي مضاد للالتهاب.',
    },

    'jasadi_inflammatory_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'تتبع أعراض الالتهاب يومياً لاكتشاف المحفزات',
        intro: 'سجّل يومياً — بعد أسبوع ستعرف ما يُشعل الالتهاب وما يُطفئه.',
        insight: 'ابحث عن الأنماط: هل الأعراض تزيد بعد أطعمة معينة أو أيام توتر؟',
        fields: [
            { id: 'pain_level', label: 'ألم المفاصل/العضلات', emoji: '🦴', type: 'scale', min: 0, max: 10 },
            { id: 'fatigue', label: 'مستوى التعب', emoji: '🔋', type: 'scale', min: 0, max: 10 },
            { id: 'skin_status', label: 'حالة الجلد', emoji: '✨', type: 'choice', options: ['طبيعي', 'احمرار خفيف', 'طفح', 'حب شباب', 'جفاف', 'أخرى'] },
            { id: 'diet_quality', label: 'جودة الأكل اليوم', emoji: '🥗', type: 'choice', options: ['مضاد للالتهاب', 'معتدل', 'كثير مصنّع', 'كثير سكر'] },
            { id: 'note', label: 'ملاحظة', emoji: '📝', type: 'text' },
        ],
    },

    'jasadi_nutrition_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'اكتشاف النواقص الغذائية الأكثر احتمالاً',
        intro: 'النواقص الغذائية شائعة جداً وأعراضها تُقلّد أمراضاً كثيرة. هذا الاختبار يُساعدك تحديد الأكثر احتمالاً.',
        questions: [
            { id: 'nt1', text: 'هل تشعر بتعب مستمر حتى بعد نوم كافٍ؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' }, { value: 3, label: 'دائماً' }] },
            { id: 'nt2', text: 'هل تعاني من تساقط شعر أو أظافر هشة؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'قليلاً' }, { value: 2, label: 'ملحوظ' }, { value: 3, label: 'شديد' }] },
            { id: 'nt3', text: 'هل تتعرض للشمس بانتظام (30 دقيقة يومياً)؟', options: [{ value: 0, label: 'نعم يومياً' }, { value: 1, label: 'بضع مرات أسبوعياً' }, { value: 2, label: 'نادراً' }, { value: 3, label: 'لا تقريباً' }] },
            { id: 'nt4', text: 'هل تتناول لحوم حمراء أو خضار ورقية بانتظام؟', options: [{ value: 0, label: 'يومياً' }, { value: 1, label: 'بضع مرات أسبوعياً' }, { value: 2, label: 'نادراً' }, { value: 3, label: 'لا تقريباً — نباتي أو قليل التنوع' }] },
            { id: 'nt5', text: 'هل تعاني من تشنجات عضلية أو خدران أو وخز؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'نادراً' }, { value: 2, label: 'أحياناً' }, { value: 3, label: 'كثيراً أو يومياً' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'تغذية جيدة', message: 'لا مؤشرات قوية على نقص — ولكن التحاليل الدورية مهمة.', nextStep: 'حافظ على التنوع الغذائي وتعرّض للشمس.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'نواقص محتملة', message: 'هناك مؤشرات على نقص واحد أو أكثر — الأكثر شيوعاً: D, B12, حديد.', nextStep: 'ابدأ بتحسين التغذية + احجز تحاليل أساسية.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'نواقص مرجّحة', message: 'الأعراض تُشير لنقص يحتاج تدخل — لا تعتمد على التغذية فقط.', nextStep: 'احجز تحاليل: فيريتين, B12, D, مغنيسيوم. ناقش النتائج مع طبيبك.' },
        ],
    },

    'jasadi_nutrition_practice': {
        type: 'practice',
        durationMinutes: 5,
        goal: 'مراجعة سريعة لوجباتك اليومية لاكتشاف الفجوات',
        intro: 'لا تحتاج أن تعدّ السعرات — تحتاج أن تلاحظ ما ينقص.',
        steps: [
            { index: 1, instruction: 'اكتب ما أكلته اليوم: فطور، غداء، عشاء، سناكات', durationSeconds: 60 },
            { index: 2, instruction: 'هل أكلت بروتيناً في كل وجبة رئيسية؟', durationSeconds: 15 },
            { index: 3, instruction: 'هل أكلت خضاراً أو فاكهة 3 مرات على الأقل؟', durationSeconds: 15 },
            { index: 4, instruction: 'كم كوب ماء شربت؟ (الهدف: 8)', durationSeconds: 10 },
            { index: 5, instruction: 'ما الفجوة الأبرز؟ اكتبها كهدف للغد', durationSeconds: 20 },
        ],
        closingNote: 'الوعي بنمطك الغذائي هو أول خطوة — التغيير يأتي من الملاحظة.',
        repeatSuggestion: 'كل مساء قبل النوم — 5 دقائق فقط',
    },

    'jasadi_nutrition_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'سد الفجوات الغذائية الأساسية في أسبوع',
        howItWorks: 'كل يوم يُركّز على عنصر غذائي واحد: ماء، بروتين، حديد، D, B12, مغنيسيوم, أوميغا 3.',
        completionMessage: 'أسبوع من التغذية الذكية — جسمك يشكرك.',
        days: [
            { day: 1, title: 'ترطيب', subtitle: 'الماء أساس كل شيء', tasks: [
                { id: 'n1t1', text: 'اشرب 8 أكواب ماء اليوم', durationMinutes: 0, emoji: '💧' },
                { id: 'n1t2', text: 'ابدأ يومك بكوب ماء دافئ مع ليمون', durationMinutes: 0, emoji: '🍋' },
                { id: 'n1t3', text: 'لا مشروبات غازية اليوم', durationMinutes: 0, emoji: '🚫' },
            ]},
            { day: 2, title: 'بروتين كافٍ', subtitle: 'بناء وإصلاح', tasks: [
                { id: 'n2t1', text: 'بروتين في الفطور: بيض أو فول أو لبنة', durationMinutes: 0, emoji: '🍳' },
                { id: 'n2t2', text: '30 غرام بروتين في كل وجبة رئيسية', durationMinutes: 0, emoji: '🍗' },
                // Tayyibat: yogurt = forbidden dairy. Use cooked cheese as protein snack.
                { id: 'n2t3', text: 'سناك بروتيني: مكسرات أو جبن مطبوخ — سهل الهضم بدون تخمر', durationMinutes: 0, emoji: '🧀' },
            ]},
            { day: 3, title: 'حديد وفيريتين', subtitle: 'مخزون الطاقة', tasks: [
                // Tayyibat: spinach = leafy greens (restricted in healing phase). Use lamb or sea fish for iron.
                { id: 'n3t1', text: 'لحم غنم أو سمك بحري مشوي مع ليمون — حديد حيوي (heme iron) بدون ألياف خشنة', durationMinutes: 0, emoji: '🐑' },
                { id: 'n3t2', text: 'لا شاي أو قهوة مع الأكل (ينقص الامتصاص)', durationMinutes: 0, emoji: '🚫' },
                { id: 'n3t3', text: 'فيتامين C مع الوجبة (ليمون أو فلفل)', durationMinutes: 0, emoji: '🍊' },
            ]},
            { day: 4, title: 'فيتامين D', subtitle: 'فيتامين الشمس', tasks: [
                { id: 'n4t1', text: '15 دقيقة ضوء شمس مباشر', durationMinutes: 15, emoji: '☀️' },
                { id: 'n4t2', text: 'سمك دهني أو صفار بيض في وجبة', durationMinutes: 0, emoji: '🐟' },
                { id: 'n4t3', text: 'إذا كنت لا تتعرض للشمس: فكّر في مكمل D3', durationMinutes: 0, emoji: '💊' },
            ]},
            { day: 5, title: 'B12 والأعصاب', subtitle: 'طاقة وصفاء ذهني', tasks: [
                { id: 'n5t1', text: 'بيض أو لحوم أو حليب أو أجبان', durationMinutes: 0, emoji: '🥚' },
                { id: 'n5t2', text: 'إذا نباتي: B12 كمكمل ضروري', durationMinutes: 0, emoji: '💊' },
                { id: 'n5t3', text: 'لاحظ طاقتك وصفاءك الذهني اليوم', durationMinutes: 2, emoji: '🧠' },
            ]},
            { day: 6, title: 'مغنيسيوم', subtitle: 'معدن الهدوء', tasks: [
                // Tayyibat: leafy greens restricted in healing phase. Use nuts + dark chocolate + boiled/mashed potatoes.
                { id: 'n6t1', text: 'مكسرات + شوكولاتة داكنة (70%) + بطاطس مسلوقة — مغنيسيوم وبوتاسيوم بدون ألياف خشنة', durationMinutes: 0, emoji: '🥜' },
                { id: 'n6t2', text: 'مغنيسيوم قبل النوم إذا متوفر', durationMinutes: 0, emoji: '💊' },
                { id: 'n6t3', text: 'لاحظ جودة نومك الليلة', durationMinutes: 0, emoji: '🌙' },
            ]},
            { day: 7, title: 'التقييم', subtitle: 'ما تعلمته هذا الأسبوع', tasks: [
                { id: 'n7t1', text: 'ما الفجوة الغذائية الأكبر عندك؟', durationMinutes: 5, emoji: '🔍' },
                { id: 'n7t2', text: 'هل لاحظت فرقاً في الطاقة أو المزاج؟', durationMinutes: 5, emoji: '📊' },
                { id: 'n7t3', text: 'احجز تحاليل إذا لم تكن أجريتها مؤخراً', durationMinutes: 0, emoji: '🔬' },
            ]},
        ],
    },

    'jasadi_nutrition_workshop': {
        type: 'workshop',
        durationMinutes: 10,
        goal: 'فهم النواقص الغذائية الأكثر شيوعاً وأعراضها الخفية',
        intro: 'النقص لا يعني أنك لا تأكل كفاية — يعني أن جسمك لا يحصل على ما يحتاجه.',
        sections: [
            { title: 'الخمسة الكبار', emoji: '🔬', body: 'أكثر النواقص شيوعاً: فيتامين D (90% من الناس)، الحديد/فيريتين (خاصة النساء)، B12 (خاصة النباتيين)، المغنيسيوم (معدن الهدوء)، أوميغا 3 (مضاد الالتهاب). كل واحد منها يُسبب أعراضاً تُقلّد أمراضاً.' },
            { title: 'الأعراض الخادعة', emoji: '🎭', body: 'نقص D = تعب + ألم عضلات + اكتئاب. نقص حديد = دوار + ضيق تنفس + شحوب. نقص B12 = وخز + نسيان + ضبابية. نقص مغنيسيوم = أرق + تشنجات + قلق. كثير من الناس يذهبون لأطباء متعددين وكل ما يحتاجونه هو تحليل بسيط.' },
            { title: 'الحل العملي', emoji: '💡', body: 'أولاً: تحاليل أساسية (فيريتين ≠ حديد الدم). ثانياً: تنوع غذائي حقيقي. ثالثاً: مكملات ذكية حسب النتائج — ليس عشوائياً. التحاليل أرخص من العلاج العشوائي.' },
        ],
        keyTakeaways: [
            'النقص الغذائي يُقلّد القلق والاكتئاب والتعب المزمن',
            'فيريتين تحت 30 = تعب حتى لو الحديد \"طبيعي\"',
            'التحاليل الدورية أرخص وأسرع من التخمين',
        ],
        closingAction: 'اليوم: احجز تحليل فيريتين + B12 + Vitamin D. هذه الثلاثة تكشف 80% من النواقص.',
    },

    'jasadi_nutrition_tracker': {
        type: 'tracker',
        durationMinutes: 3,
        goal: 'تتبع تنوعك الغذائي ومكملاتك يومياً',
        intro: 'الهدف ليس العدّ — الهدف هو التنوع والانتظام.',
        insight: 'بعد أسبوع ستعرف ما ينقص في نمطك الغذائي بالذات.',
        fields: [
            { id: 'protein', label: 'هل أكلت بروتيناً في كل وجبة؟', emoji: '🍗', type: 'boolean' },
            { id: 'veggies', label: 'كم حصة خضار/فاكهة أكلت؟', emoji: '🥗', type: 'scale', min: 0, max: 7 },
            { id: 'water', label: 'أكواب الماء اليوم', emoji: '💧', type: 'scale', min: 0, max: 12 },
            { id: 'supplements', label: 'هل أخذت مكملاتك؟', emoji: '💊', type: 'choice', options: ['لا مكملات', 'نعم كلها', 'بعضها', 'نسيت'] },
            { id: 'note', label: 'ملاحظة', emoji: '📝', type: 'text' },
        ],
    },

    'jasadi_pain_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'تحديد نمط ألمك: التهابي، عصبي، عضلي، أو توتري',
        intro: 'ليس كل ألم متشابه — معرفة النمط تُحدد العلاج الأنسب.',
        questions: [
            { id: 'pt1', text: 'أين يتركز ألمك الأساسي؟', options: [{ value: 0, label: 'لا ألم حالياً' }, { value: 1, label: 'رقبة وكتف' }, { value: 2, label: 'أسفل الظهر' }, { value: 3, label: 'أماكن متعددة ومتغيرة' }] },
            { id: 'pt2', text: 'متى يشتد الألم؟', options: [{ value: 0, label: 'نادراً يشتد' }, { value: 1, label: 'بعد الجلوس الطويل' }, { value: 2, label: 'في التوتر' }, { value: 3, label: 'مستمر بلا نمط واضح' }] },
            { id: 'pt3', text: 'هل الألم يتحسن بالحركة؟', options: [{ value: 0, label: 'نعم — واضح' }, { value: 1, label: 'قليلاً' }, { value: 2, label: 'لا فرق' }, { value: 3, label: 'يزيد بالحركة' }] },
            { id: 'pt4', text: 'هل هناك وخز أو خدران مع الألم؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'أحياناً خفيف' }, { value: 2, label: 'نعم — في أماكن محددة' }, { value: 3, label: 'نعم — مستمر ومزعج' }] },
            { id: 'pt5', text: 'هل لاحظت ارتباطاً بين ألمك ومزاجك أو توترك؟', options: [{ value: 0, label: 'لا علاقة' }, { value: 1, label: 'ربما أحياناً' }, { value: 2, label: 'نعم — واضح' }, { value: 3, label: 'نعم — الألم يظهر مع كل توتر' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'ألم عابر', message: 'الألم خفيف ومؤقت — الحركة والتمدد كافيان.', nextStep: 'استمر في الحركة والتمدد اليومي.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'ألم عضلي/توتري', message: 'الألم مرتبط بنمط الحياة والتوتر — قابل للتحسن.', nextStep: 'ابدأ بروتوكول تخفيف الألم 7 أيام.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'ألم مزمن يحتاج تقييم', message: 'الألم مستمر ومتعدد — يحتاج فحص عضوي + نهج شامل.', nextStep: 'ابدأ البروتوكول + راجع طبيب عظام أو علاج طبيعي.' },
        ],
    },

    'jasadi_pain_practice': {
        type: 'practice',
        durationMinutes: 8,
        goal: 'تمارين تمدد وتنفس لتخفيف الألم العضلي',
        intro: 'أغلب آلام الرقبة والظهر والكتف سببها توتر وجلوس — هذا التمرين يُعالج الجذر.',
        steps: [
            { index: 1, instruction: 'قف أو اجلس — حرّك رقبتك ببطء: يمين، يسار، أمام، خلف', durationSeconds: 30 },
            { index: 2, instruction: 'ارفع كتفيك للأذنين — شدّ 5 ثوانٍ — أرخِ بقوة', durationSeconds: 20 },
            { index: 3, instruction: 'مدّ ذراعيك فوق رأسك — تمدد كأنك تحاول الوصول للسقف', durationSeconds: 20 },
            { index: 4, instruction: 'انحنِ ببطء للأمام — اترك ذراعيك تتدلى — ابقَ 15 ثانية', durationSeconds: 15 },
            { index: 5, instruction: 'استلقِ وارفع ركبتيك للصدر — حرّكهما يمين ويسار', durationSeconds: 30 },
            { index: 6, instruction: 'تنفس عميق: تخيّل الهواء يذهب لمنطقة الألم', durationSeconds: 60 },
            { index: 7, instruction: 'تنفس 3 مرات ببطء — ثم عد لوضعك', durationSeconds: 20 },
        ],
        closingNote: 'الحركة اللطيفة أفضل من السكون — حتى لو شعرت بتيبّس.',
        repeatSuggestion: 'كل ساعتين من الجلوس + صباحاً ومساءً',
    },

    'jasadi_pain_protocol': {
        type: 'protocol',
        totalDays: 7,
        goal: 'تخفيف الألم المزمن بالحركة والتنفس والتغذية المضادة للالتهاب',
        howItWorks: '7 أيام: حركة + تنفس + تغذية + وعي بالتوتر.',
        completionMessage: 'أسبوع من العلاج الشامل — جسمك بدأ يتحرر من دائرة الألم.',
        days: [
            { day: 1, title: 'حركة لطيفة', subtitle: 'ابدأ بكسر السكون', tasks: [
                { id: 'p1t1', text: 'مشي 15 دقيقة خفيف', durationMinutes: 15, emoji: '🚶' },
                { id: 'p1t2', text: 'تمدد 5 دقائق للرقبة والكتف', durationMinutes: 5, emoji: '🤸' },
                { id: 'p1t3', text: 'تنفس عميق 5 دقائق نحو منطقة الألم', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 2, title: 'الوعي بالألم', subtitle: 'لاحظ متى يزيد ومتى يخف', tasks: [
                { id: 'p2t1', text: 'سجّل شدة الألم 3 مرات اليوم (1-10)', durationMinutes: 2, emoji: '📊' },
                { id: 'p2t2', text: 'ما المحفزات؟ جلوس؟ توتر؟ طعام؟', durationMinutes: 3, emoji: '🔍' },
                { id: 'p2t3', text: 'مسح جسدي 5 دقائق', durationMinutes: 5, emoji: '🧘' },
            ]},
            { day: 3, title: 'مضاد الالتهاب', subtitle: 'الطعام يُقلل الألم', tasks: [
                { id: 'p3t1', text: 'كركم + زنجبيل في وجبة أو مشروب', durationMinutes: 0, emoji: '🟡' },
                { id: 'p3t2', text: 'أوميغا 3: سمك دهني أو مكمل', durationMinutes: 0, emoji: '🐟' },
                { id: 'p3t3', text: 'لا أطعمة مصنّعة اليوم', durationMinutes: 0, emoji: '🚫' },
            ]},
            { day: 4, title: 'حرارة وبرودة', subtitle: 'علاج طبيعي بسيط', tasks: [
                { id: 'p4t1', text: 'كمادة دافئة على منطقة الألم 15 دقيقة', durationMinutes: 15, emoji: '🔥' },
                { id: 'p4t2', text: 'تمدد بعد الكمادة (العضلة ترتخي)', durationMinutes: 5, emoji: '🤸' },
                { id: 'p4t3', text: 'تنفس عميق 5 دقائق', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 5, title: 'توتر = ألم', subtitle: 'العقل يُضخّم الألم', tasks: [
                { id: 'p5t1', text: 'تأمل 10 دقائق — ركّز على الأحاسيس بدون حكم', durationMinutes: 10, emoji: '🧘' },
                { id: 'p5t2', text: 'اكتب: ما يُقلقني وقد يُسبب ألمي؟', durationMinutes: 5, emoji: '📝' },
                { id: 'p5t3', text: 'تنفس 4-7-8 عشر مرات', durationMinutes: 5, emoji: '🫁' },
            ]},
            { day: 6, title: 'تقوية', subtitle: 'العضلات القوية = ألم أقل', tasks: [
                { id: 'p6t1', text: 'تمارين بلانك 30 ثانية × 3', durationMinutes: 3, emoji: '💪' },
                { id: 'p6t2', text: 'تمارين الجسر (Bridge) 10 مرات × 3', durationMinutes: 5, emoji: '🦴' },
                { id: 'p6t3', text: 'مشي 20 دقيقة', durationMinutes: 20, emoji: '🚶' },
            ]},
            { day: 7, title: 'التقييم', subtitle: 'ما تغيّر؟', tasks: [
                { id: 'p7t1', text: 'قارن ألمك اليوم بيوم 1', durationMinutes: 5, emoji: '📊' },
                { id: 'p7t2', text: 'ما الذي ساعد أكثر؟ حركة؟ تنفس؟ تغذية؟', durationMinutes: 5, emoji: '⭐' },
                { id: 'p7t3', text: 'إذا لم يتحسن: احجز علاج طبيعي', durationMinutes: 0, emoji: '🏥' },
            ]},
        ],
    },

    'jasadi_pain_workshop': {
        type: 'workshop',
        durationMinutes: 8,
        goal: 'فهم الألم المزمن: لماذا يستمر وكيف يتحسن',
        intro: 'الألم المزمن ليس فقط مشكلة في العضل أو العظم — هو نظام إنذار مُعطّل.',
        sections: [
            { title: 'الألم المزمن ≠ ضرر مستمر', emoji: '🧠', body: 'بحسب علم الألم الحديث: الألم الذي يستمر أكثر من 3 أشهر غالباً لم يعد يعكس ضرراً حقيقياً. الجهاز العصبي أصبح \"حساساً جداً\" ويُرسل إشارات ألم لتحفيزات عادية. هذا لا يعني أن ألمك غير حقيقي — يعني أن الحل يشمل الجهاز العصبي وليس فقط العضو.' },
            { title: 'التوتر والألم: حلقة مفرغة', emoji: '🔄', body: 'التوتر يرفع الكورتيزول → يزيد الالتهاب → يزيد الألم → يزيد التوتر. كسر هذه الدائرة يحتاج: تنفس + حركة + وعي. 40% من مرضى الألم المزمن يتحسنون بتعلم إدارة التوتر فقط.' },
            { title: 'الحركة هي الدواء', emoji: '🤸', body: 'أكبر خطأ: الراحة التامة. الحركة اللطيفة والتدريجية تُعيد تدريب الجهاز العصبي وتُخفض حساسية الألم. ابدأ صغيراً: مشي 5 دقائق → 10 → 15 → 20. الانتظام أهم من الشدة.' },
        ],
        keyTakeaways: [
            'الألم المزمن غالباً جهاز عصبي حساس لا ضرر مستمر',
            'التوتر يُضخّم الألم — التنفس يُهدئه',
            'الحركة التدريجية أفضل علاج — ليس الراحة',
        ],
        closingAction: 'اليوم: امشِ 10 دقائق وتنفس بعمق 5 مرات — ولاحظ هل خفّ الألم.',
    },

    'jasadi_pain_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'تتبع الألم يومياً لاكتشاف الأنماط والمحفزات',
        intro: 'سجّل كل يوم — ابحث عن: ما يُحسّن وما يُسوّئ.',
        insight: 'بعد أسبوع ستعرف: هل ألمك مرتبط بالتوتر أم الجلوس أم الطعام أم النوم؟',
        fields: [
            { id: 'pain_level', label: 'شدة الألم الآن', emoji: '🦴', type: 'scale', min: 0, max: 10 },
            { id: 'pain_location', label: 'أين الألم؟', emoji: '📍', type: 'choice', options: ['رقبة', 'كتف', 'ظهر علوي', 'أسفل الظهر', 'مفاصل', 'عضلات', 'رأس', 'متعدد'] },
            { id: 'trigger', label: 'ما المحفز اليوم؟', emoji: '⚡', type: 'choice', options: ['جلوس طويل', 'توتر', 'مجهود', 'نوم سيء', 'طقس', 'لا أعرف'] },
            { id: 'moved', label: 'هل تحركت/تمددت اليوم؟', emoji: '🤸', type: 'boolean' },
            { id: 'note', label: 'ملاحظة', emoji: '📝', type: 'text' },
        ],
    },

    'jasadi_skin_test': {
        type: 'test',
        totalQuestions: 5,
        goal: 'تحديد السبب الجذري لمشكلتك الجلدية أو تساقط الشعر',
        intro: 'البشرة والشعر مرآة الداخل — المشكلة نادراً ما تكون سطحية فقط.',
        questions: [
            { id: 'sk1', text: 'ما أبرز مشكلة تواجهها؟', options: [{ value: 0, label: 'لا مشاكل' }, { value: 1, label: 'جفاف بشرة' }, { value: 2, label: 'حب شباب أو طفح' }, { value: 3, label: 'تساقط شعر واضح' }] },
            { id: 'sk2', text: 'هل لاحظت ارتباطاً بين مشكلتك الجلدية والتوتر؟', options: [{ value: 0, label: 'لا' }, { value: 1, label: 'ربما' }, { value: 2, label: 'نعم — تزيد مع التوتر' }, { value: 3, label: 'نعم — واضح جداً' }] },
            { id: 'sk3', text: 'هل تتناول كفاية من البروتين والزنك والحديد؟', options: [{ value: 0, label: 'نعم — متنوع' }, { value: 1, label: 'أظن ذلك' }, { value: 2, label: 'لست متأكداً' }, { value: 3, label: 'لا — غذائي محدود' }] },
            { id: 'sk4', text: 'هل لديك اضطراب هرموني أو دورة غير منتظمة؟', options: [{ value: 0, label: 'لا / لا ينطبق' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'نعم — مشخّص' }, { value: 3, label: 'شديد أو غير مُعالج' }] },
            { id: 'sk5', text: 'هل جرّبت علاجات جلدية بدون تحسن؟', options: [{ value: 0, label: 'لم أحتج' }, { value: 1, label: 'علاج واحد نجح' }, { value: 2, label: 'عدة علاجات ولم تنجح كلياً' }, { value: 3, label: 'كثير ولا شيء يعمل' }] },
        ],
        results: [
            { minScore: 0, maxScore: 4, level: 'low', title: 'بشرة/شعر صحي', message: 'لا مؤشرات قوية على مشكلة داخلية.', nextStep: 'حافظ على التغذية والترطيب والحماية من الشمس.' },
            { minScore: 5, maxScore: 9, level: 'moderate', title: 'مشكلة جلدية متوسطة', message: 'التغذية أو التوتر أو الهرمونات قد تلعب دوراً.', nextStep: 'ابدأ بروتوكول البشرة والشعر 14 يوماً.' },
            { minScore: 10, maxScore: 15, level: 'high', title: 'مشكلة جلدية تحتاج تقييم', message: 'المشكلة عميقة — تحتاج تحاليل وتقييم طبي.', nextStep: 'ابدأ البروتوكول + تحاليل: فيريتين، زنك، TSH، D.' },
        ],
    },

    'jasadi_skin_practice': {
        type: 'practice',
        durationMinutes: 5,
        goal: 'مراجعة روتينك اليومي للعناية بالبشرة والشعر',
        intro: 'أغلب المشاكل الجلدية تتحسن بتغييرات بسيطة في الروتين.',
        steps: [
            { index: 1, instruction: 'اغسل وجهك بماء فاتر — لا ساخن (يُجفف البشرة)', durationSeconds: 30 },
            { index: 2, instruction: 'رطّب بشرتك فوراً بعد الغسل', durationSeconds: 20 },
            { index: 3, instruction: 'واقي شمس إذا ستخرج — حتى في الغيم', durationSeconds: 10 },
            { index: 4, instruction: 'اشرب كوب ماء — الترطيب يبدأ من الداخل', durationSeconds: 10 },
            { index: 5, instruction: 'اكتب: ما أكلته اليوم وهل ظهر تفاعل جلدي؟', durationSeconds: 30 },
        ],
        closingNote: 'البشرة تعكس ما تأكل وتشرب وتشعر — العناية الخارجية وحدها لا تكفي.',
        repeatSuggestion: 'صباحاً ومساءً — نفس الروتين كل يوم',
    },

    'jasadi_skin_protocol': {
        type: 'protocol',
        totalDays: 14,
        goal: 'تحسين البشرة والشعر من الداخل عبر التغذية والعناية',
        howItWorks: 'أسبوعان: الأول لتنظيف المحفزات، الثاني لبناء من الداخل.',
        completionMessage: 'أسبوعان من العناية الشاملة — البشرة تحتاج 28 يوماً لتجديد نفسها.',
        days: [
            { day: 1, title: 'تنظيف', subtitle: 'أزل ما يُهيج', tasks: [
                { id: 'sk1t1', text: 'لا منتجات قاسية على بشرتك اليوم', durationMinutes: 0, emoji: '🧴' },
                { id: 'sk1t2', text: 'اغسل وجهك مرتين فقط بغسول لطيف', durationMinutes: 0, emoji: '💧' },
                { id: 'sk1t3', text: 'غيّر غطاء الوسادة', durationMinutes: 0, emoji: '🛏️' },
            ]},
            { day: 2, title: 'ترطيب', subtitle: 'من الداخل والخارج', tasks: [
                { id: 'sk2t1', text: '8 أكواب ماء اليوم', durationMinutes: 0, emoji: '💧' },
                { id: 'sk2t2', text: 'رطّب بشرتك بعد كل غسلة', durationMinutes: 0, emoji: '🧴' },
                { id: 'sk2t3', text: 'أفوكادو أو زيت زيتون في وجبة', durationMinutes: 0, emoji: '🥑' },
            ]},
            { day: 3, title: 'حديد وزنك', subtitle: 'معادن البشرة والشعر', tasks: [
                // Tayyibat: lentils = legumes (forbidden), spinach = leafy greens (restricted phase 1).
                // Use lamb or sea fish — explicitly Tayyibat-allowed heme iron sources.
                { id: 'sk3t1', text: 'لحم غنم أو سمك بحري — حديد حيوي (heme iron) سهل الامتصاص بدون بقوليات', durationMinutes: 0, emoji: '🐑' },
                { id: 'sk3t2', text: 'بذور يقطين (غنية بالزنك)', durationMinutes: 0, emoji: '🌰' },
                { id: 'sk3t3', text: 'فيتامين C مع الوجبة', durationMinutes: 0, emoji: '🍊' },
            ]},
            { day: 4, title: 'تقليل السكر', subtitle: 'السكر يُسرّع شيخوخة البشرة', tasks: [
                { id: 'sk4t1', text: 'لا حلويات أو مشروبات محلاة اليوم', durationMinutes: 0, emoji: '🚫' },
                { id: 'sk4t2', text: 'استبدل بفاكهة طازجة', durationMinutes: 0, emoji: '🍎' },
                { id: 'sk4t3', text: 'لاحظ بشرتك — هل بدأت تصفو؟', durationMinutes: 0, emoji: '🔍' },
            ]},
            { day: 5, title: 'نوم تجديدي', subtitle: 'البشرة تتجدد في النوم', tasks: [
                { id: 'sk5t1', text: 'نم 7-8 ساعات', durationMinutes: 0, emoji: '🌙' },
                { id: 'sk5t2', text: 'نظّف بشرتك قبل النوم — لا تنام بالمكياج', durationMinutes: 0, emoji: '✨' },
                { id: 'sk5t3', text: 'ظلام كامل في الغرفة', durationMinutes: 0, emoji: '🌑' },
            ]},
            { day: 6, title: 'حماية من الشمس', subtitle: 'الشمس صديق وعدو', tasks: [
                { id: 'sk6t1', text: 'واقي شمس SPF 30+ قبل الخروج', durationMinutes: 0, emoji: '☀️' },
                { id: 'sk6t2', text: '15 دقيقة شمس للفيتامين D (بدون واقي)', durationMinutes: 15, emoji: '🌅' },
                { id: 'sk6t3', text: 'ترطيب بعد التعرض للشمس', durationMinutes: 0, emoji: '🧴' },
            ]},
            { day: 7, title: 'مراجعة الأسبوع 1', subtitle: 'ما تغيّر؟', tasks: [
                { id: 'sk7t1', text: 'صوّر بشرتك وقارن بيوم 1', durationMinutes: 2, emoji: '📷' },
                { id: 'sk7t2', text: 'ما الذي ساعد أكثر؟', durationMinutes: 3, emoji: '⭐' },
                { id: 'sk7t3', text: 'استمر في الأسبوع الثاني', durationMinutes: 0, emoji: '💪' },
            ]},
            { day: 8, title: 'بيوتين', subtitle: 'فيتامين الشعر', tasks: [
                { id: 'sk8t1', text: 'بيض + مكسرات + أفوكادو (مصادر بيوتين)', durationMinutes: 0, emoji: '🥚' },
                { id: 'sk8t2', text: 'مكمل بيوتين إذا متوفر', durationMinutes: 0, emoji: '💊' },
                { id: 'sk8t3', text: 'لا تسريحات مشدودة للشعر', durationMinutes: 0, emoji: '💇' },
            ]},
            { day: 9, title: 'أوميغا 3', subtitle: 'دهون صحية للبشرة', tasks: [
                { id: 'sk9t1', text: 'سمك دهني أو مكسرات الجوز', durationMinutes: 0, emoji: '🐟' },
                { id: 'sk9t2', text: 'بذور الكتان أو الشيا في السلطة', durationMinutes: 0, emoji: '🌱' },
                { id: 'sk9t3', text: 'ترطيب مسائي عميق', durationMinutes: 0, emoji: '🧴' },
            ]},
            { day: 10, title: 'أمعاء صحية', subtitle: 'الأمعاء ← البشرة', tasks: [
                // Tayyibat: yogurt = forbidden dairy. Use natural vinegar (explicitly allowed) for gut support.
                { id: 'sk10t1', text: 'خل قصب طبيعي (ملعقة مع الغداء) أو زنجبيل وكركم — دعم ميكروبيوم بدون ألبان', durationMinutes: 0, emoji: '🌿' },
                { id: 'sk10t2', text: 'ألياف: خضار + فاكهة + حبوب كاملة', durationMinutes: 0, emoji: '🥦' },
                { id: 'sk10t3', text: 'لا أطعمة مصنّعة', durationMinutes: 0, emoji: '🚫' },
            ]},
            { day: 11, title: 'إدارة التوتر', subtitle: 'التوتر = حب شباب + تساقط شعر', tasks: [
                { id: 'sk11t1', text: 'تأمل أو تنفس عميق 10 دقائق', durationMinutes: 10, emoji: '🧘' },
                { id: 'sk11t2', text: 'نشاط ممتع لك: رسم، قراءة، موسيقى', durationMinutes: 15, emoji: '🎨' },
                { id: 'sk11t3', text: 'لاحظ هل بشرتك أهدأ اليوم', durationMinutes: 0, emoji: '🔍' },
            ]},
            { day: 12, title: 'حركة ودورة دموية', subtitle: 'الدم ينقل المغذيات للبشرة', tasks: [
                { id: 'sk12t1', text: 'مشي سريع أو تمرين 20 دقيقة', durationMinutes: 20, emoji: '🏃' },
                { id: 'sk12t2', text: 'اغسل وجهك بعد التمرين', durationMinutes: 0, emoji: '💧' },
                { id: 'sk12t3', text: 'رطّب فوراً', durationMinutes: 0, emoji: '🧴' },
            ]},
            { day: 13, title: 'روتين شامل', subtitle: 'دمج كل العادات', tasks: [
                { id: 'sk13t1', text: 'يوم نموذجي: ماء + تغذية + نوم + عناية', durationMinutes: 0, emoji: '🌟' },
                { id: 'sk13t2', text: 'صوّر بشرتك وقارن ببداية البروتوكول', durationMinutes: 2, emoji: '📷' },
                { id: 'sk13t3', text: 'ما الروتين المناسب لك؟ اكتبه', durationMinutes: 5, emoji: '📝' },
            ]},
            { day: 14, title: 'التقييم النهائي', subtitle: 'أسبوعان من التحول', tasks: [
                { id: 'sk14t1', text: 'قارن حالة بشرتك/شعرك ببداية البروتوكول', durationMinutes: 5, emoji: '📊' },
                { id: 'sk14t2', text: 'إذا لم يتحسن: تحاليل فيريتين + زنك + TSH + D', durationMinutes: 0, emoji: '🔬' },
                { id: 'sk14t3', text: 'اجعل أفضل 5 عادات دائمة', durationMinutes: 5, emoji: '⭐' },
            ]},
        ],
    },

    'jasadi_skin_workshop': {
        type: 'workshop',
        durationMinutes: 6,
        goal: 'فهم العلاقة بين صحتك الداخلية وبشرتك وشعرك',
        intro: 'البشرة ليست طبقة معزولة — هي مرآة لكل ما يحدث داخلك.',
        sections: [
            { title: 'الجلد يتحدث', emoji: '🔗', body: 'حب الشباب في الذقن = هرمونات. جفاف مستمر = نقص دهون صحية أو ترطيب. تساقط الشعر = فيريتين منخفض أو توتر مزمن. أكزيما = جهاز مناعي مُتحسّس أو خلل في الأمعاء. الجلد يُخبرك بما يحتاجه جسمك.' },
            { title: 'الأمعاء ← البشرة', emoji: '🦠', body: 'الميكروبيوم (بكتيريا الأمعاء) يؤثر مباشرة على البشرة عبر \"محور الأمعاء-الجلد\". خلل البكتيريا → التهاب → مشاكل جلدية. الأطعمة المخمّرة والألياف تُحسّن البكتيريا → تُحسّن البشرة.' },
            { title: 'ما لا يُخبرك به طبيب الجلد', emoji: '💡', body: 'المشكلة ليست دائماً خارجية. قبل الكريمات: تحقق من التغذية (فيريتين، زنك، D)، التوتر (الكورتيزول)، والهرمونات (TSH). 60% من مشاكل البشرة المزمنة تتحسن بتغيير نمط الحياة قبل الأدوية.' },
        ],
        keyTakeaways: [
            'البشرة والشعر مرآة الصحة الداخلية — لا تعالج القشرة فقط',
            'صحة الأمعاء تنعكس مباشرة على البشرة',
            'التحاليل الأساسية (فيريتين، زنك، D, TSH) تكشف 70% من الأسباب',
        ],
        closingAction: 'اليوم: اشرب 2 لتر ماء وأضف خضاراً ملونة لوجبتك. البشرة تشكرك من الداخل.',
    },

    'jasadi_skin_tracker': {
        type: 'tracker',
        durationMinutes: 2,
        goal: 'تتبع حالة بشرتك وشعرك يومياً وربطها بنمط حياتك',
        intro: 'سجّل يومياً — الأنماط تظهر بعد أسبوعين.',
        insight: 'ابحث عن: هل تتحسن بشرتك في أيام الأكل الصحي؟ النوم الكافي؟ قلة التوتر؟',
        fields: [
            { id: 'skin_state', label: 'حالة بشرتك اليوم', emoji: '✨', type: 'choice', options: ['ممتازة', 'عادية', 'جافة', 'دهنية', 'حبوب', 'احمرار', 'أخرى'] },
            { id: 'hair_state', label: 'حالة شعرك اليوم', emoji: '💇', type: 'choice', options: ['عادي', 'تساقط خفيف', 'تساقط ملحوظ', 'جفاف', 'دهني'] },
            { id: 'water_intake', label: 'أكواب الماء اليوم', emoji: '💧', type: 'scale', min: 0, max: 12 },
            { id: 'stress', label: 'مستوى التوتر', emoji: '🧠', type: 'scale', min: 1, max: 10 },
            { id: 'note', label: 'ملاحظة', emoji: '📝', type: 'text' },
        ],
    },

};
