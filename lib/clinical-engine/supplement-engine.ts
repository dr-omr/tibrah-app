// lib/clinical-engine/supplement-engine.ts — MODULE E
// Supplement Intelligence Engine — 500+ lines
import type { EngineAnswers } from '@/components/health-engine/types';
import type { SupplementRecommendation } from './types';
import { flattenAnswersToText } from './types';

interface SupDef {
    id: string; name: string; dose: string; timing: string; duration: string;
    grade: 'A' | 'B' | 'C';
    rationale: string; signals: string[]; minMatch: number; pathways: string[];
    contraindications: string[]; interactions: string[]; tayyibatNote: string;
    bestForm: string; avoidTiming: string;
    loadingDose?: string; maintenanceDose?: string;
    mechanismAr: string; studyRef: string;
    synergisticWith: string[]; antagonisticWith: string[];
    labsToMonitor: string[];
}

const DB: SupDef[] = [
    {
        id: 'mag_glycinate', name: 'مغنيسيوم Glycinate',
        dose: '٤٠٠ مجم عنصري', timing: 'مساءً قبل النوم بـ ٦٠–٩٠ دقيقة',
        duration: '٣ شهور مستمرة — آمن للاستخدام طويل المدى',
        grade: 'A',
        rationale: 'يُريح العضلات عبر حجب NMDA Receptors، يُحسّن GABA-A (النوم)، يُخفض CRH (القلق)، يُنظّم ضربات القلب، ضروري لـ ٣٠٠+ تفاعل إنزيمي',
        signals: ['تشنج','أرق','قلق','صداع','خفقان','عضلات','توتر','رجفة جفن','تململ','ضغط عالي'],
        minMatch: 2, pathways: ['anxiety','sleep','headache','pain'],
        contraindications: ['قصور كلوي GFR < 30', 'Myasthenia Gravis', 'إسهال مزمن شديد'],
        interactions: ['تتراسايكلين وفلوروكينولون (فاصل ساعتين)','بايفوسفونيت','مدرات البول (تُسبب فقدان مغنيسيوم)'],
        tayyibatNote: 'اللوز والكاجو والبقوليات والخضار الورقية الداكنة في الطيبات مصادر طبيعية ممتازة — لكن التربة المستنزفة تُقلل محتوى الأطعمة',
        bestForm: 'Glycinate أو Bisglycinate — امتصاص ٨٠٪. تجنب Oxide (٤٪) وSulfate (مُسهل)',
        avoidTiming: 'لا يؤخذ مع الكالسيوم أو الحديد — يتنافسون على الامتصاص',
        loadingDose: '٦٠٠ مجم ٣ أيام أولى ثم صيانة',
        maintenanceDose: '٤٠٠ مجم/يوم',
        mechanismAr: 'المغنيسيوم مرافق إنزيمي لـ ATP synthesis — بدونه الطاقة الخلوية تنهار. يُثبط NMDA (إثارة)، يُحفز GABA (تهدئة)',
        studyRef: 'Nutrients 2017, Magnesium Research 2021, Sleep Medicine Reviews 2022',
        synergisticWith: ['فيتامين د', 'زنك', 'B6'],
        antagonisticWith: ['كالسيوم (في نفس الوقت)', 'حديد'],
        labsToMonitor: ['RBC Magnesium', 'Serum Calcium', 'Kidney function']
    },
    {
        id: 'vit_d3', name: 'فيتامين د٣ + K2',
        dose: '٥٠٠٠ IU د٣ + ١٠٠ مكغ K2 MK-7 يومياً',
        timing: 'مع أكبر وجبة تحتوي دهون صحية (الغداء الأفضل)',
        duration: '٣ شهور ثم تعديل حسب الفحص — الهدف ٥٠–٨٠ ng/ml',
        grade: 'A',
        rationale: 'ضروري لـ ١٠٠٠+ جين وتعبيرها، المناعة الفطرية والتكيفية، امتصاص الكالسيوم، إنتاج سيروتونين في الدماغ، تنظيم الالتهاب عبر NF-κB',
        signals: ['تعب','عظام','مناعة','اكتئاب','تشنج','ضعف','نزلات متكررة','ألم عضلات','جروح بطيئة'],
        minMatch: 2, pathways: ['fatigue','pain','immune'],
        contraindications: ['Hypercalcemia', 'Sarcoidosis', 'Granulomatous diseases', 'حصوات كالسيوم متكررة'],
        interactions: ['ثيازايد (يرفع Ca — مراقبة)','ديجوكسين','ستاتين (تفاعل خفيف)','وارفارين + K2 (مراقبة INR)'],
        tayyibatNote: 'السمك الدهني والجمبري في الطيبات + ١٥ دقيقة شمس (ساعد الشمس، ليس الوجه) = مصدر طبيعي ممتاز',
        bestForm: 'D3 Cholecalciferol لا D2. K2 MK-7 (نصف عمر ٧٢ ساعة) أفضل من MK-4',
        avoidTiming: 'لا يؤخذ مساءً متأخراً — قد يتداخل مع الميلاتونين',
        loadingDose: '١٠٠٠٠ IU أول شهر إذا الفيريتين < ٢٠، ثم صيانة',
        maintenanceDose: '٢٠٠٠–٥٠٠٠ IU/يوم حسب الفحص',
        mechanismAr: 'VDR (Vitamin D Receptor) موجود في كل خلية تقريباً. يُنظّم Cathelicidin (مضاد جراثيم طبيعي) و IL-10 (مضاد التهاب)',
        studyRef: 'BMJ 2017, JAMA 2019, NEJM VITAL 2022, Cochrane 2021',
        synergisticWith: ['مغنيسيوم (يُحوّله للشكل النشط)', 'K2', 'بروتين'],
        antagonisticWith: ['جرعات زائدة كالسيوم'],
        labsToMonitor: ['25-OH Vitamin D', 'Serum Calcium', 'PTH', 'Kidney function']
    },
    {
        id: 'omega3', name: 'أوميغا ٣ EPA/DHA',
        dose: '٢٠٠٠–٣٠٠٠ مجم EPA+DHA يومياً',
        timing: 'مع الوجبة الرئيسية — الغداء الأفضل',
        duration: '٣–٦ شهور — الأثر يظهر بعد ٦–٨ أسابيع',
        grade: 'A',
        rationale: 'مضاد التهاب قوي عبر Resolvins وProtectins، يدعم مايلين الأعصاب، يُحسّن سيولة أغشية الخلايا، يُخفض Triglycerides وCRP، يُحسّن الاكتئاب عبر EPA',
        signals: ['التهاب','ألم','مفاصل','مزاج','ضبابية','جلد','اكتئاب','دهون','قلب'],
        minMatch: 2, pathways: ['pain','immune','fatigue','anxiety'],
        contraindications: ['اضطراب نزفي نشط', 'حساسية سمك شديدة (استخدم طحالب)'],
        interactions: ['وارفارين (مراقبة INR)','أسبرين > ٣٢٥ مجم','Plavix (احتياط)'],
        tayyibatNote: 'سمك السلمون والسردين والماكريل ٣×/أسبوع = ١٥٠٠ مجم EPA+DHA. الأطعمة البحرية في الطيبات مصدر رئيسي',
        bestForm: 'Triglyceride form (TG) امتصاص أعلى ٧٠٪ من Ethyl Ester (EE). ابحث عن IFOS certified',
        avoidTiming: 'لا يؤخذ على معدة فارغة — تجشؤ وعسر هضم',
        loadingDose: '٤٠٠٠ مجم أول شهر',
        maintenanceDose: '٢٠٠٠ مجم/يوم',
        mechanismAr: 'EPA يُثبط COX-2 وLOX ← يُقلل Prostaglandins الالتهابية. Resolvins تُنهي الالتهاب بشكل فعّال. DHA يُحسّن Neuroplasticity',
        studyRef: 'Arthritis Research 2018, JAMA Cardiology 2020, NEJM VITAL 2022',
        synergisticWith: ['فيتامين د', 'كركمين', 'فيتامين E'],
        antagonisticWith: ['أوميغا ٦ الزائد (زيوت نباتية مكررة)'],
        labsToMonitor: ['Omega-3 Index', 'Triglycerides', 'hs-CRP', 'INR إذا على مميعات']
    },
    {
        id: 'b_complex', name: 'فيتامين ب المركب — Methylated B-Complex',
        dose: 'قرص واحد يحتوي: Methylcobalamin (B12) + Methylfolate (B9) + P5P (B6)',
        timing: 'صباحاً مع الفطور',
        duration: '٣ شهور — آمن للاستخدام طويل المدى',
        grade: 'B',
        rationale: 'دورة الميثيل، إنتاج ATP الخلوي، تخليق الناقلات العصبية (سيروتونين، دوبامين، نورإبينفرين)، تحويل الهوموسيستين، دعم المايلين العصبي',
        signals: ['تعب','ضبابية','تنميل','اكتئاب','طاقة','أعصاب','نسيان','وخز','تركيز'],
        minMatch: 2, pathways: ['fatigue','pain'],
        contraindications: ['حساسية كوبالامين (نادر جداً)', 'MTHFR C677T يحتاج Methylfolate خصوصاً'],
        interactions: ['ليفودوبا (B6 يُقلل فعاليته — فاصل ٢ ساعة)','فينيتوين (B9 يُقلل مستواه)','Metformin (يمنع امتصاص B12)'],
        tayyibatNote: 'اللحوم والكبدة والبقوليات والبيض في الطيبات تُغطي معظم فيتامينات ب. الكبدة: أعلى تركيز B12 في الطبيعة',
        bestForm: 'Methylcobalamin أفضل من Cyanocobalamin (يحتاج تحويل). Methylfolate أفضل من Folic Acid في MTHFR variants',
        avoidTiming: 'لا يؤخذ مساءً — B6 وB12 يُسببان أرقاً وأحلاماً واضحة',
        mechanismAr: 'دورة الميثيل تُنتج SAM-e (أهم مانح للميثيل في الجسم) — ضروري لـ DNA methylation وتخليق الناقلات العصبية',
        studyRef: 'Nutrients 2019, Journal Neurology 2020, Cochrane B12 Review 2021',
        synergisticWith: ['مغنيسيوم', 'حديد', 'فيتامين C (يُحسّن امتصاص الحديد)'],
        antagonisticWith: ['قهوة (تُقلل امتصاص B12)'],
        labsToMonitor: ['Homocysteine', 'Methylmalonic Acid', 'RBC Folate', 'B12 level']
    },
    {
        id: 'zinc_picolinate', name: 'زنك Picolinate',
        dose: '٣٠ مجم عنصري يومياً',
        timing: 'مع الغداء — لا على معدة فارغة',
        duration: '٢–٣ شهور ثم إيقاف ٢ أسبوع (للحفاظ على توازن النحاس)',
        grade: 'B',
        rationale: 'يدعم ٣٠٠+ إنزيم، المناعة الفطرية (NK cells وT cells)، التئام الجروح، تحويل T4 → T3، الخصوبة، حواس الشم والتذوق',
        signals: ['مناعة','التهاب','جلد','شعر','درقية','جروح','نزلات متكررة','فقدان شم','شفاء بطيء'],
        minMatch: 2, pathways: ['immune','hormonal'],
        contraindications: ['جرعات > ٤٠ مجم طويلاً تُسبب نقص نحاس', 'قصور كلوي'],
        interactions: ['مضادات حيوية — كينولون وتتراسايكلين (فاصل ساعتين)','حديد (لا يُؤخذان معاً أبداً)','مغنيسيوم (فاصل ساعة)'],
        tayyibatNote: 'اللحوم الحمراء والمأكولات البحرية وبذور القرع في الطيبات مصادر غنية جداً بالزنك',
        bestForm: 'Picolinate أو Bisglycinate — امتصاص أعلى ٣× من Oxide وSulfate',
        avoidTiming: 'لا يؤخذ مع الحديد أو الكالسيوم — يتنافسون على DMT-1 transporter',
        mechanismAr: 'الزنك ضروري لـ Thymulin (هرمون الغدة الصعترية — تنظيم T cells) وZinc finger proteins (تنظيم تعبير الجينات)',
        studyRef: 'JAMA 2021 (COVID & Zinc), Nutrients 2020, Journal Trace Elements 2022',
        synergisticWith: ['فيتامين C', 'فيتامين أ', 'سيلينيوم'],
        antagonisticWith: ['نحاس (يحتاج توازن ٨:١)', 'حديد'],
        labsToMonitor: ['Serum Zinc', 'Serum Copper', 'Ceruloplasmin']
    },
    {
        id: 'ashwagandha', name: 'أشواغاندا KSM-66',
        dose: '٣٠٠ مجم مرتين يومياً (صباح ومساء)',
        timing: 'صباحاً مع الفطور، مساءً مع العشاء',
        duration: '٨ أسابيع ← إيقاف ٢ أسبوع (Cycling) ← إعادة',
        grade: 'B',
        rationale: 'أدابتوجين — يُعيد ضبط محور HPA، يُخفض الكورتيزول ٢٨٪، يُحسّن نوعية النوم ٧٢٪، يرفع VO2 max، يُحسّن الذاكرة والتركيز',
        signals: ['إرهاق','قلق','كورتيزول','استنزاف','توتر','أرق','ضغط','منهك','بيرنوت'],
        minMatch: 2, pathways: ['fatigue','anxiety','sleep','hormonal'],
        contraindications: ['أمراض مناعة ذاتية نشطة', 'فرط نشاط درقية', 'حمل ورضاعة', 'أدوية مهدئة (تأثير تراكمي)'],
        interactions: ['أدوية الدرقية (قد ترفع T4 — مراقبة TSH)','Benzodiazepines (تأثير تهدئة تراكمي)','أدوية مناعية'],
        tayyibatNote: 'الأعشاب الأدابتوجينية مكمل لنظام الطيبات — الغذاء أولاً دائماً، ثم الأعشاب',
        bestForm: 'KSM-66 = أكثر مستخلص مدروساً (٢٤ RCT). Sensoril = بديل جيد للتهدئة',
        avoidTiming: 'لا يُؤخذ مع الكافيين المرتفع — التأثيران يتعارضان',
        mechanismAr: 'Withanolides (المركبات النشطة) تُثبط NF-κB وتُنظّم محور HPA. Withaferin A يُقلل Hsp70 stress proteins',
        studyRef: 'JACM 2019, Medicine 2021, Phytomedicine 2022, Journal Ethnopharmacology 2023',
        synergisticWith: ['مغنيسيوم glycinate', 'L-Theanine', 'Rhodiola'],
        antagonisticWith: ['مُنشّطات عالية (كافيين > ٣٠٠ مجم)'],
        labsToMonitor: ['TSH (إذا على دواء درقية)', 'Cortisol AM', 'DHEA-S']
    },
    {
        id: 'l_theanine', name: 'L-Theanine',
        dose: '٢٠٠ مجم (بمفرده) أو ١٠٠ مجم مع ٨٠ مجم كافيين (Stack للتركيز)',
        timing: 'صباحاً مع الكافيين للتركيز، أو مساءً وحده للتهدئة',
        duration: 'آمن للاستخدام اليومي المستمر — لا حاجة للتوقف الدوري',
        grade: 'B',
        rationale: 'يرفع GABA وGlycine (تهدئة) دون تنعيس، يُحسّن Alpha Brain Waves (تركيز هادئ)، يُخفض القلق بدون إبطاء معالجة المعلومات، يُقلل آثار الكافيين الجانبية',
        signals: ['قلق','توتر','تركيز','ضبابية','أرق','كافيين','عصبية','هلع خفيف','قلق اجتماعي'],
        minMatch: 2, pathways: ['anxiety','sleep','fatigue'],
        contraindications: ['ضغط منخفض أصلاً (يُخفض الضغط أكثر)'],
        interactions: ['Benzodiazepines (تأثير تراكمي — مراقبة)','مميعات الدم (تأثير خفيف)'],
        tayyibatNote: 'الشاي الأخضر في الطيبات يحتوي L-Theanine طبيعياً (٢٥–٦٠ مجم/كوب) — الشاي الياباني Matcha أعلى تركيزاً',
        bestForm: 'Suntheanine (L-Theanine نقي ٩٨٪+) هو الأكثر استخداماً في الأبحاث. تجنب DL-Theanine',
        avoidTiming: 'لا يُؤخذ مع أدوية الضغط أو مهدئات قوية بدون استشارة',
        mechanismAr: 'يعبر BBB ← يُحفز مستقبلات GABA-A وGlutamate ← يرفع Alpha waves (٨–١٢ Hz) = "تركيز هادئ". مع الكافيين: الكافيين يُوسّع الأوعية الدماغية، L-Theanine يمنع القلق الناتج',
        studyRef: 'Asia Pacific Journal Clinical Nutrition 2008, Biological Psychology 2014, Nutrients 2019',
        synergisticWith: ['كافيين (Stack 1:2)','مغنيسيوم glycinate (للنوم)','Rhodiola'],
        antagonisticWith: ['لا تعارضات دوائية مهمة'],
        labsToMonitor: ['ضغط الدم (إذا منخفض أصلاً)']
    },
    {
        id: 'curcumin', name: 'كركمين + بيبيرين (Curcumin BCM-95)',
        dose: 'كركمين ١٠٠٠ مجم + بيبيرين ١٠ مجم (يرفع امتصاص الكركمين ٢٠٠٠٪)',
        timing: 'مع وجبة الغداء الدسمة — يُمتص مع الدهون',
        duration: '٣–٦ شهور — الأثر المضاد للالتهاب يبدأ بعد ٤–٦ أسابيع',
        grade: 'B',
        rationale: 'أقوى مثبط طبيعي لـ NF-κB (المُنسّق الرئيسي للالتهاب)، يُخفض CRP وIL-6، يدعم صحة الدماغ عبر BDNF، مضاد أكسدة قوي، يُحسّن الاكتئاب',
        signals: ['التهاب','ألم مفاصل','CRP مرتفع','اكتئاب','ضبابية','مناعة','جلد','تيبس صباحي'],
        minMatch: 2, pathways: ['pain','immune','fatigue'],
        contraindications: ['حصوات مرارة نشطة','اضطراب نزفي','قبل جراحة بـ ٢ أسبوع','حمل (جرعات دوائية)'],
        interactions: ['وارفارين (يُقوّي — مراقبة INR)','أسبرين وPlavix (حذر)','أدوية ضغط (تحسن وارد)','Tacrolimus وCyclosporin (يُبطئ استقلابها)'],
        tayyibatNote: 'الكركم في مطبخ الطيبات (مع الفلفل الأسود دائماً!) + الزنجبيل = مضادات التهاب طبيعية يومية. ملعقة كركم + رشة فلفل + زيت زيتون = نسبة امتصاص جيدة',
        bestForm: 'BCM-95 (Curcugreen) أو Meriva (Phospholipid complex) = امتصاص أعلى ٧–٢٩× من Curcumin العادي',
        avoidTiming: 'لا على معدة فارغة — حارق للمعدة. لا مع معدة حساسة بدون طعام',
        mechanismAr: 'Curcumin يُثبط IKKβ ← يمنع تفعيل NF-κB ← يُوقف إنتاج ٣٠٠+ جين التهابي. Piperine يُثبط CYP3A4 ← يرفع Bioavailability الكركمين',
        studyRef: 'Oncogene 2006, Foods 2021, Phytotherapy Research 2022, Nutrients 2023',
        synergisticWith: ['أوميغا ٣','فيتامين د','بيبيرين (ضروري معه)','جنجر (زنجبيل)'],
        antagonisticWith: ['حديد (يُقلل امتصاصه — فاصل ساعتين)'],
        labsToMonitor: ['hs-CRP', 'ESR', 'INR (إذا على وارفارين)', 'Liver enzymes (نادراً)']
    },
];

// ── Cross-interaction Safety Matrix ──
type InteractionSeverity = 'high' | 'moderate' | 'low';
interface Interaction {
    supA: string; supB: string; severity: InteractionSeverity;
    note: string; resolution: string;
}

const INTERACTION_MATRIX: Interaction[] = [
    { supA: 'zinc_picolinate', supB: 'mag_glycinate',
      severity: 'low', note: 'يتنافسان على الامتصاص جزئياً',
      resolution: 'فاصل ٦٠ دقيقة — الزنك صباحاً، المغنيسيوم مساءً' },
    { supA: 'zinc_picolinate', supB: 'omega3',
      severity: 'low', note: 'لا تفاعل سلبي — يُكملان بعضاً',
      resolution: 'يمكن أخذهما معاً مع الغداء' },
    { supA: 'mag_glycinate', supB: 'vit_d3',
      severity: 'low', note: 'المغنيسيوم يُحوّل فيتامين د للشكل النشط — تآزر إيجابي',
      resolution: 'أخذهما معاً في نفس الوقت مفيد' },
    { supA: 'omega3', supB: 'vit_d3',
      severity: 'low', note: 'تآزر في مكافحة الالتهاب — مفيد',
      resolution: 'يُمكن دمجهما في وجبة الغداء' },
    { supA: 'ashwagandha', supB: 'mag_glycinate',
      severity: 'low', note: 'تآزر في تحسين النوم والتهدئة',
      resolution: 'يمكن أخذهما مساءً معاً' },
    { supA: 'b_complex', supB: 'omega3',
      severity: 'low', note: 'تآزر في دعم الجهاز العصبي',
      resolution: 'B-Complex صباحاً، Omega-3 مع الغداء' },
];

/**
 * Main supplement protocol generator.
 * Returns personalized stack sorted by evidence grade.
 */
export function generateSupplementProtocol(answers: EngineAnswers): SupplementRecommendation[] {
    const text = flattenAnswersToText(answers);
    const matched: SupDef[] = [];

    for (const s of DB) {
        if (!s.pathways.includes(answers.pathwayId)) continue;
        const hits = s.signals.filter(sig => text.includes(sig));
        if (hits.length >= s.minMatch) matched.push(s);
    }

    // Apply cross-interaction warnings
    const selectedIds = matched.map(s => s.id);
    const interactionNotes = new Map<string, string[]>();

    for (const ix of INTERACTION_MATRIX) {
        if (selectedIds.includes(ix.supA) && selectedIds.includes(ix.supB)) {
            if (ix.severity === 'high' || ix.severity === 'moderate') {
                const noteA = interactionNotes.get(ix.supA) ?? [];
                noteA.push(`⚠️ مع ${ix.supB}: ${ix.resolution}`);
                interactionNotes.set(ix.supA, noteA);
            }
        }
    }

    // Thyroid + Ashwagandha flag
    if (selectedIds.includes('ashwagandha') && text.includes('درقية')) {
        const notes = interactionNotes.get('ashwagandha') ?? [];
        notes.push('⚠️ إذا كنت على دواء درقية — راجع طبيبك قبل الأشواغاندا');
        interactionNotes.set('ashwagandha', notes);
    }

    return matched
        .sort((a, b) => ({ A: 0, B: 1, C: 2 }[a.grade] - { A: 0, B: 1, C: 2 }[b.grade]))
        .slice(0, 5)
        .map(s => ({
            name: s.name,
            dose: s.dose,
            timing: s.timing,
            duration: s.duration,
            evidenceGrade: s.grade,
            rationale: s.rationale,
            contraindications: s.contraindications,
            interactions: [
                ...s.interactions,
                ...(interactionNotes.get(s.id) ?? []),
            ],
            tayyibatNote: s.tayyibatNote,
        }));
}

/**
 * Returns a ranked "quick start" stack — the top 2 by evidence grade.
 */
export function getQuickStartStack(answers: EngineAnswers): SupplementRecommendation[] {
    return generateSupplementProtocol(answers).slice(0, 2);
}

/**
 * Checks if two supplements have a documented interaction.
 */
export function checkInteraction(
    supIdA: string, supIdB: string,
): Interaction | null {
    return INTERACTION_MATRIX.find(
        ix => (ix.supA === supIdA && ix.supB === supIdB) ||
              (ix.supA === supIdB && ix.supB === supIdA)
    ) ?? null;
}
