// lib/tayyibat/assessment-questions.ts
// ══════════════════════════════════════════════════════════
// بنك أسئلة التقييم — وضعان: سريع (٧) وعميق (٢٥)
// ══════════════════════════════════════════════════════════

export type QuestionType = 'single' | 'scale' | 'multi' | 'text';
export type QuestionDomain =
    | 'familiarity' | 'adherence' | 'digestive' | 'energy'
    | 'sugar' | 'inflammation' | 'sleep' | 'rhythm'
    | 'readiness' | 'safety';

export interface AssessmentOption {
    value:  string;
    label:  string;
    emoji?: string;
    riskFlag?: boolean;   // يُفعّل علامة الخطر
}

export interface AssessmentQuestion {
    id:         string;
    domain:     QuestionDomain;
    text:       string;
    subtext?:   string;
    type:       QuestionType;
    options?:   AssessmentOption[];
    scaleMin?:  number;
    scaleMax?:  number;
    scaleMinLabel?: string;
    scaleMaxLabel?: string;
    required:   boolean;
    deepOnly:   boolean;   // true = يظهر في التقييم العميق فقط
    mapsTo:     keyof import('./tayyibat-scoring-engine').TayyibatAnswers | null;
}

// ── الأسئلة الكاملة ──
export const ALL_QUESTIONS: AssessmentQuestion[] = [

    // ══ FAMILIARITY + ADHERENCE (quick + deep) ══
    {
        id: 'q_know', domain: 'familiarity', required: true, deepOnly: false,
        text: 'ما مستوى معرفتك بنظام الطيبات؟',
        subtext: 'كن صريحاً — لا توجد إجابة صحيحة أو خاطئة',
        type: 'single', mapsTo: 'knowledgeLevel',
        options: [
            { value:'expert',  label:'أعرفه جيداً وأفهم أسبابه العلمية',   emoji:'🎓' },
            { value:'basic',   label:'أعرف المبادئ الأساسية (المسموح والممنوع)', emoji:'📖' },
            { value:'little',  label:'سمعت عنه لكن تفاصيله غير واضحة لي', emoji:'🤔' },
            { value:'none',    label:'هذه المرة الأولى أسمع عنه',           emoji:'🌱' },
        ],
    },
    {
        id: 'q_level', domain: 'adherence', required: true, deepOnly: false,
        text: 'ما مستوى التزامك الحالي بنظام الطيبات؟',
        type: 'single', mapsTo: 'currentLevel',
        options: [
            { value:'full',    label:'ملتزم تماماً منذ فترة',       emoji:'🏆' },
            { value:'partial', label:'ملتزم جزئياً — بعض الانتهاكات', emoji:'🔶' },
            { value:'started', label:'بدأت مؤخراً',                  emoji:'🌱' },
            { value:'none',    label:'لم أطبّقه بعد',                emoji:'⭕' },
        ],
    },
    {
        id: 'q_oil', domain: 'adherence', required: true, deepOnly: false,
        text: 'ما نوع الزيت الذي تستخدمه للطهي بشكل رئيسي؟',
        type: 'single', mapsTo: 'oilType',
        options: [
            { value:'olive_only',  label:'زيت زيتون بكر فقط', emoji:'🫒' },
            { value:'mixed',       label:'زيت زيتون مع زيوت أخرى', emoji:'🔶' },
            { value:'seed_oils',   label:'زيت ذرة / كانولا / نباتي', emoji:'⛔' },
            { value:'unknown',     label:'لا أعرف نوعه بالضبط', emoji:'❓' },
        ],
    },
    {
        id: 'q_sugar', domain: 'sugar', required: true, deepOnly: false,
        text: 'كم مرة تتناول السكر الأبيض أو المشروبات المحلّاة؟',
        subtext: 'يشمل: حلويات، عصائر، سكر في الشاي/القهوة، مشروبات غازية',
        type: 'single', mapsTo: 'sugarLevel',
        options: [
            { value:'none',   label:'لا أتناوله تقريباً', emoji:'✅' },
            { value:'rare',   label:'نادراً (مرة أو مرتين أسبوعياً)', emoji:'🔶' },
            { value:'weekly', label:'عدة مرات أسبوعياً', emoji:'⚠️' },
            { value:'daily',  label:'يومياً أو مع معظم الوجبات', emoji:'⛔' },
        ],
    },
    {
        id: 'q_bloating', domain: 'digestive', required: true, deepOnly: false,
        text: 'كم مرة تشعر بالانتفاخ أو الغازات بعد الأكل؟',
        type: 'single', mapsTo: 'bloatingFreq',
        options: [
            { value:'never',     label:'نادراً أو لا', emoji:'✅' },
            { value:'sometimes', label:'أحياناً', emoji:'🔶' },
            { value:'often',     label:'كثيراً', emoji:'⚠️' },
            { value:'always',    label:'دائماً بعد معظم الوجبات', emoji:'⛔' },
        ],
    },
    {
        id: 'q_energy', domain: 'energy', required: true, deepOnly: false,
        text: 'كيف تصف طاقتك بعد وجبة الغداء عادةً؟',
        type: 'single', mapsTo: 'postMealCrash',
        options: [
            { value:'never',     label:'طاقة جيدة — لا هبوط ملحوظ', emoji:'⚡' },
            { value:'sometimes', label:'أحياناً أشعر بنعاس خفيف', emoji:'🔶' },
            { value:'often',     label:'غالباً أحتاج للنوم أو القهوة', emoji:'⚠️' },
            { value:'always',    label:'دائماً أشعر بثقل وكسل بعد الأكل', emoji:'⛔' },
        ],
    },
    {
        id: 'q_sleep', domain: 'sleep', required: true, deepOnly: false,
        text: 'كيف تصف جودة نومك بشكل عام؟',
        type: 'single', mapsTo: 'sleepQuality',
        options: [
            { value:'excellent', label:'ممتاز — أنام وأصحو بطاقة', emoji:'😴' },
            { value:'good',      label:'جيد بشكل عام', emoji:'🙂' },
            { value:'fair',      label:'متقطع أو غير مريح', emoji:'😐' },
            { value:'poor',      label:'ضعيف — أصحو متعباً', emoji:'😩' },
        ],
    },

    // ══ DEEP ONLY QUESTIONS ══
    {
        id: 'q_protein', domain: 'adherence', required: false, deepOnly: true,
        text: 'كم مرة تتناول بروتيناً نظيفاً في اليوم؟',
        subtext: 'لحم طازج، سمك، بيض، دجاج (غير مصنّع)',
        type: 'single', mapsTo: 'proteinFreq',
        options: [
            { value:'every_meal', label:'في كل وجبة رئيسية', emoji:'💪' },
            { value:'twice',      label:'مرتان يومياً', emoji:'✅' },
            { value:'once',       label:'مرة واحدة أو أقل', emoji:'🔶' },
            { value:'rarely',     label:'نادراً', emoji:'⚠️' },
        ],
    },
    {
        id: 'q_veg', domain: 'adherence', required: false, deepOnly: true,
        text: 'كم مرة تتناول خضروات في اليوم؟',
        type: 'single', mapsTo: 'vegetableFreq',
        options: [
            { value:'every_meal', label:'مع كل وجبة تقريباً', emoji:'🥗' },
            { value:'daily',      label:'مرة يومياً', emoji:'✅' },
            { value:'few',        label:'بضع مرات في الأسبوع', emoji:'🔶' },
            { value:'rarely',     label:'نادراً', emoji:'⚠️' },
        ],
    },
    {
        id: 'q_processed', domain: 'adherence', required: false, deepOnly: true,
        text: 'كم مرة تتناول الأطعمة المصنّعة؟',
        subtext: 'وجبات سريعة، نقانق، رقائق، مخبوزات مصنّعة، إلخ',
        type: 'single', mapsTo: 'processedFood',
        options: [
            { value:'never',  label:'لا أكاد أتناولها', emoji:'✅' },
            { value:'rarely', label:'نادراً (أقل من مرة/أسبوع)', emoji:'🔶' },
            { value:'often',  label:'عدة مرات أسبوعياً', emoji:'⚠️' },
            { value:'daily',  label:'يومياً', emoji:'⛔' },
        ],
    },
    {
        id: 'q_timing', domain: 'rhythm', required: false, deepOnly: true,
        text: 'كيف تصف توقيت وجباتك اليومية؟',
        type: 'single', mapsTo: 'mealTiming',
        options: [
            { value:'structured', label:'منتظم — نفس الوقت تقريباً يومياً', emoji:'⏰' },
            { value:'partial',    label:'منتظم أحياناً', emoji:'🔶' },
            { value:'random',     label:'عشوائي حسب الظروف', emoji:'⚠️' },
        ],
    },
    {
        id: 'q_morning', domain: 'energy', required: false, deepOnly: true,
        text: 'كيف تصف طاقتك عند الاستيقاظ؟',
        type: 'single', mapsTo: 'morningFatigue',
        options: [
            { value:'never',     label:'أصحو بطاقة جيدة', emoji:'☀️' },
            { value:'sometimes', label:'أحياناً أصحو متعباً', emoji:'🔶' },
            { value:'often',     label:'غالباً أصحو متعباً وبطيئاً', emoji:'⚠️' },
            { value:'always',    label:'دائماً منهك عند الاستيقاظ', emoji:'😩' },
        ],
    },
    {
        id: 'q_craving', domain: 'sugar', required: false, deepOnly: true,
        text: 'ما مدى رغبتك في السكر أو الحلويات خلال اليوم؟',
        type: 'single', mapsTo: 'sugarCraving',
        options: [
            { value:'none',     label:'لا رغبة تقريباً', emoji:'✅' },
            { value:'mild',     label:'رغبة خفيفة أحياناً', emoji:'🔶' },
            { value:'moderate', label:'رغبة متوسطة يومياً', emoji:'⚠️' },
            { value:'strong',   label:'رغبة شديدة صعبة المقاومة', emoji:'⛔' },
        ],
    },
    {
        id: 'q_afternoon', domain: 'energy', required: false, deepOnly: true,
        text: 'هل تشعر بهبوط طاقة في فترة بعد الظهر؟',
        type: 'single', mapsTo: 'afternoonSlump',
        options: [
            { value:'never',     label:'لا يحدث', emoji:'⚡' },
            { value:'sometimes', label:'أحياناً', emoji:'🔶' },
            { value:'often',     label:'غالباً بين ١٢–٣ ظهراً', emoji:'⚠️' },
            { value:'always',    label:'يومياً دون استثناء', emoji:'⛔' },
        ],
    },
    {
        id: 'q_gas', domain: 'digestive', required: false, deepOnly: true,
        text: 'كم مرة تشعر بالغازات المزعجة؟',
        type: 'single', mapsTo: 'gasFreq',
        options: [
            { value:'never',     label:'نادراً جداً', emoji:'✅' },
            { value:'sometimes', label:'مرة أو مرتين أسبوعياً', emoji:'🔶' },
            { value:'often',     label:'عدة مرات أسبوعياً', emoji:'⚠️' },
            { value:'always',    label:'يومياً', emoji:'⛔' },
        ],
    },
    {
        id: 'q_constipation', domain: 'digestive', required: false, deepOnly: true,
        text: 'كيف تصف انتظام حركة الأمعاء لديك؟',
        type: 'single', mapsTo: 'constipation',
        options: [
            { value:'never',     label:'منتظم يومياً', emoji:'✅' },
            { value:'sometimes', label:'أحياناً مع إمساك خفيف', emoji:'🔶' },
            { value:'often',     label:'إمساك أو تبادل مع إسهال', emoji:'⚠️' },
            { value:'always',    label:'مشكلة مستمرة', emoji:'⛔' },
        ],
    },
    {
        id: 'q_acid', domain: 'digestive', required: false, deepOnly: true,
        text: 'هل تعاني من حموضة المعدة أو الارتجاع؟',
        type: 'single', mapsTo: 'acidReflux',
        options: [
            { value:'never',     label:'لا', emoji:'✅' },
            { value:'sometimes', label:'أحياناً', emoji:'🔶' },
            { value:'often',     label:'أسبوعياً', emoji:'⚠️' },
            { value:'always',    label:'يومياً', emoji:'⛔' },
        ],
    },
    {
        id: 'q_joint', domain: 'inflammation', required: false, deepOnly: true,
        text: 'هل تعاني من آلام في المفاصل أو العضلات بشكل مستمر؟',
        type: 'single', mapsTo: 'jointPain',
        options: [
            { value:'none',     label:'لا', emoji:'✅' },
            { value:'mild',     label:'خفيفة أحياناً', emoji:'🔶' },
            { value:'moderate', label:'متوسطة ومزعجة', emoji:'⚠️' },
            { value:'severe',   label:'شديدة وتؤثر على نشاطي', emoji:'⛔', riskFlag: true },
        ],
    },
    {
        id: 'q_headache', domain: 'inflammation', required: false, deepOnly: true,
        text: 'كم مرة تعاني من الصداع؟',
        type: 'single', mapsTo: 'headacheFreq',
        options: [
            { value:'never',  label:'نادراً', emoji:'✅' },
            { value:'rarely', label:'مرة أو مرتين شهرياً', emoji:'🔶' },
            { value:'weekly', label:'أسبوعياً', emoji:'⚠️' },
            { value:'daily',  label:'يومياً تقريباً', emoji:'⛔', riskFlag: true },
        ],
    },
    {
        id: 'q_skin', domain: 'inflammation', required: false, deepOnly: true,
        text: 'هل تعاني من مشاكل جلدية مستمرة (حبوب، حكة، طفح)؟',
        type: 'single', mapsTo: 'skinIssues',
        options: [
            { value:'none',     label:'لا مشاكل جلدية', emoji:'✅' },
            { value:'mild',     label:'خفيفة وعرضية', emoji:'🔶' },
            { value:'moderate', label:'متكررة ومزعجة', emoji:'⚠️' },
            { value:'severe',   label:'مستمرة وشديدة', emoji:'⛔' },
        ],
    },
    {
        id: 'q_focus', domain: 'sleep', required: false, deepOnly: true,
        text: 'كيف تصف مستوى تركيزك وصفاء ذهنك خلال النهار؟',
        type: 'single', mapsTo: 'focusLevel',
        options: [
            { value:'excellent', label:'ممتاز', emoji:'🧠' },
            { value:'good',      label:'جيد بشكل عام', emoji:'🙂' },
            { value:'fair',      label:'متذبذب', emoji:'😐' },
            { value:'poor',      label:'ضبابية ذهنية واضحة', emoji:'🌫️' },
        ],
    },
    {
        id: 'q_challenge', domain: 'readiness', required: false, deepOnly: true,
        text: 'ما أصعب شيء يمنعك من الالتزام الكامل بنظام الطيبات؟',
        type: 'single', mapsTo: null,
        options: [
            { value:'cravings',  label:'الرغبة في الطعام المحبوب', emoji:'🍫' },
            { value:'social',    label:'الضغط الاجتماعي والمناسبات', emoji:'👥' },
            { value:'time',      label:'ضيق الوقت والتحضير', emoji:'⏰' },
            { value:'cost',      label:'تكلفة الطعام الصحي', emoji:'💰' },
            { value:'habit',     label:'العادة والروتين القديم', emoji:'🔄' },
            { value:'knowledge', label:'لا أعرف بالضبط كيف أبدأ', emoji:'❓' },
        ],
    },
    {
        id: 'q_readiness', domain: 'readiness', required: false, deepOnly: true,
        text: 'على مقياس ١–١٠، كم أنت مستعد للتغيير الغذائي الآن؟',
        type: 'scale', mapsTo: null,
        scaleMin: 1, scaleMax: 10,
        scaleMinLabel: 'غير مستعد', scaleMaxLabel: 'مستعد تماماً',
    },

    // ══ SAFETY QUESTIONS (deep only) ══
    {
        id: 'q_redflags_digestive', domain: 'safety', required: false, deepOnly: true,
        text: 'هل لاحظت أياً من هذه الأعراض مؤخراً؟',
        subtext: 'هذه أسئلة سلامة — إجابتك تؤثر على نوع التوصية',
        type: 'multi', mapsTo: null,
        options: [
            { value:'blood_stool',    label:'دم في البراز',                riskFlag: true },
            { value:'weight_loss',    label:'فقدان وزن غير مبرر',          riskFlag: true },
            { value:'vomiting',       label:'قيء متكرر أو مستمر',          riskFlag: true },
            { value:'severe_pain',    label:'ألم بطني شديد',               riskFlag: true },
            { value:'swallow',        label:'صعوبة في البلع',              riskFlag: true },
            { value:'none_of_above',  label:'لا شيء مما ذُكر', emoji:'✅' },
        ],
    },
    {
        id: 'q_redflags_general', domain: 'safety', required: false, deepOnly: true,
        text: 'هل تعاني من أي من هذه الأعراض؟',
        type: 'multi', mapsTo: null,
        options: [
            { value:'chest_pain',     label:'ألم في الصدر',                riskFlag: true },
            { value:'breathless',     label:'ضيق تنفس غير مبرر',           riskFlag: true },
            { value:'syncope',        label:'دوخة أو إغماء',               riskFlag: true },
            { value:'palpitations',   label:'خفقان شديد ومتكرر',           riskFlag: true },
            { value:'persistent_fever', label:'حمى مستمرة',              riskFlag: true },
            { value:'none_of_above',  label:'لا شيء مما ذُكر', emoji:'✅' },
        ],
    },
];

// ── الأسئلة السريعة (٧) ──
export const QUICK_QUESTIONS = ALL_QUESTIONS.filter(q => !q.deepOnly);

// ── الأسئلة العميقة (٢٥) ──
export const DEEP_QUESTIONS = ALL_QUESTIONS;

// ── أسئلة السلامة ──
export const SAFETY_QUESTIONS = ALL_QUESTIONS.filter(q => q.domain === 'safety');

// ── استخراج إجابات السلامة ──
export function hasRedFlagAnswers(answers: Record<string, string | string[]>): boolean {
    const safetyIds = ['q_redflags_digestive', 'q_redflags_general'];
    for (const id of safetyIds) {
        const val = answers[id];
        if (Array.isArray(val)) {
            const hasFlag = val.some(v => v !== 'none_of_above');
            if (hasFlag) return true;
        }
    }
    return false;
}
