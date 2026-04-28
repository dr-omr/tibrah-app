// lib/tayyibat/science-cards.ts — المحتوى العلمي التفصيلي
import type { ScienceCard } from './types';

export const SCIENCE_CARDS: ScienceCard[] = [
    { id:'gut_brain', question:'كيف يُؤثر الغذاء على المزاج؟', readingTime:3,
      shortAnswer:'٩٠٪ من السيروتونين يُنتج في أمعائك — ليس دماغك.',
      deepDive:'محور الأمعاء-الدماغ (Gut-Brain Axis) هو شبكة اتصال ثنائية الاتجاه تمر عبر العصب المبهم (٨٠٪ من الإشارات تصعد من الأمعاء للدماغ). الخلايا Enterochromaffin في جدار الأمعاء هي المصنع الرئيسي للسيروتونين. ما تأكله يُحدد تكوين هذه البيئة.',
      mechanism:'الغذاء الالتهابي → Dysbiosis → إنتاج Kynurenic Acid بدلاً من السيروتونين → اكتئاب وقلق. الغذاء النظيف → Lactobacillus rhamnosus → L-DOPA + GABA + 5-HTP → مزاج متوازن.',
      evidence:'Sonnenburg Lab (Cell 2021, n=36): الغذاء المتنوع يرفع ميكروبيوم التنوع ٢٥٪ ويُخفض ١٩ علامة التهاب خلال ١٠ أسابيع.',
      relatedPathways:['anxiety','sleep','digestion'] },

    { id:'inflammation_silent', question:'ما هو الالتهاب الصامت وكيف تعرف أنك مصاب؟', readingTime:4,
      shortAnswer:'التهاب لا يُؤلم لكنه يُدمر ببطء — مثل جمر تحت الرماد.',
      deepDive:'Chronic Low-Grade Inflammation هو ارتفاع مستمر خفيف في IL-6 وTNF-α وhs-CRP دون سبب مرضي واضح. الجسم في "وضع قتال" دائم. يُسبب: إرهاق مزمن، ضبابية ذهنية، اكتئاب خفيف، بطء شفاء، شيخوخة مبكرة.',
      mechanism:'الغذاء الالتهابي → NF-κB مُنشَّط → IL-6 وTNF-α وIL-1β → تلف أغشية الخلايا → Mitochondrial dysfunction → كل الطاقة تذهب لمكافحة الالتهاب بدل الوظائف الحيوية.',
      evidence:'Meta-analysis 15 RCT: النظام المتوسطي (الأقرب للطيبات) يُخفض hs-CRP بمتوسط ٣٣٪ خلال ١٢ أسبوع. PREDIMED 2018: تخفيض أحداث قلبية ٣٠٪.',
      relatedPathways:['pain','fatigue','immune','hormonal'] },

    { id:'omega_ratio', question:'لماذا نسبة أوميغا ٦ إلى ٣ خطيرة جداً؟', readingTime:3,
      shortAnswer:'أجدادنا كانوا على نسبة ٤:١. نحن الآن على ٢٠:١ — وهذا يُشعل حرباً داخلية.',
      deepDive:'أوميغا ٦ وأوميغا ٣ يتنافسان على نفس الإنزيم (Delta-6-desaturase). عند هيمنة ٦: AA (Arachidonic Acid) يُحوَّل لـ PGE2 وLTB4 = الالتهاب. عند توازن مع ٣: EPA يُحوَّل لـ Resolvins وProtectins = إنهاء الالتهاب.',
      mechanism:'كل ملعقة زيت ذرة/كانولا = ٧ جم أوميغا ٦. كل ١٠٠ جم سلمون = ٢.٥ جم EPA+DHA. لتغيير النسبة: حذف الزيوت النباتية المكررة + إضافة أوميغا ٣ حيواني يومياً.',
      evidence:'Simopoulos 2011 (Exp Biol Med): النسبة المثالية ٤:١ ترتبط بانخفاض الوفيات الكلية. نسبة ٢٠:١ تُضاعف مخاطر الأمراض المزمنة.',
      relatedPathways:['pain','immune','fatigue','anxiety'] },

    { id:'insulin_energy', question:'لماذا تشعر بالإرهاق بعد الأكل؟', readingTime:3,
      shortAnswer:'ليس طبيعياً. الأكل يجب أن يُعطيك طاقة — لا يسرقها.',
      deepDive:'Post-Prandial Somnolence (هبوط بعد الأكل) يحدث عندما يرتفع الأنسولين بسرعة استجابةً للكربوهيدرات المكررة. الأنسولين يُزيح Tryptophan (التريبتوفان) من الدم → يعبر BBB → سيروتونين ثم ميلاتونين مبكر.',
      mechanism:'الكربوهيدرات المكررة (GI عالٍ) → ارتفاع سكر سريع → Insulin spike → Reactive hypoglycemia → غيبوبة غذائية. البروتين + الدهون + الكربوهيدرات المعقدة: ارتفاع تدريجي + Orexin-A مرتفع = يقظة.',
      evidence:'مشي ١٥ دقيقة بعد الأكل يُفعّل GLUT-4 في العضلات ويُخفض سكر الدم بنسبة ١٣٪ (BMJ 2022).',
      relatedPathways:['fatigue','hormonal','sleep'] },

    { id:'microbiome_diversity', question:'ما هو التنوع الميكروبي ولماذا هو مفتاح كل شيء؟', readingTime:4,
      shortAnswer:'الميكروبيوم = العضو المنسي. يُنتج الفيتامينات والهرمونات والناقلات العصبية.',
      deepDive:'الجسم البشري يحمل ٣٨ تريليون بكتيريا (أكثر من خلاياه). هذه البكتيريا تُنتج: ٩٠٪ من السيروتونين، ٥٠٪ من الدوبامين، فيتامين K2، بيوتيرات (غذاء خلايا القولون)، SCFAs (تُنظّم سكر الدم والالتهاب). التنوع = الصحة، Dysbiosis = المرض.',
      mechanism:'الألياف التخمرية (FOS وXOS وArabinoxylan) تُغذّي Lactobacillus وBifidobacterium → تُنتج SCFAs → تُغذّي خلايا القولون → تُغلق Tight Junctions → لا Leaky Gut.',
      evidence:'Sonnenburg 2021 (Cell): ٣٠ نوع نباتي/أسبوع مقابل ١٥ = ميكروبيوم أغنى ٢٥٪ وأقل التهاباً.',
      relatedPathways:['digestion','immune','anxiety','fatigue'] },

    { id:'mitochondria_food', question:'كيف يُحدد الغذاء إنتاج طاقتك الخلوية؟', readingTime:4,
      shortAnswer:'الميتوكوندريا تختار وقودها — وهي تكره السكر والزيوت المكررة.',
      deepDive:'الميتوكوندريا تُنتج ٩٥٪ من ATP الخلوي عبر سلسلة نقل الإلكترون. تحتاج: CoQ10 وB2 وB3 وMagnesium وIron وCopper. السكر المفرط يُنتج Reactive Oxygen Species (ROS) تُلحق ضرراً بغشاء الميتوكوندريا → كفاءة أقل → تعب أعمق.',
      mechanism:'Ketone Bodies (من الدهون الصحية والصيام) يُعطي ميتوكوندريا وقوداً أنظف بـ ٢٥٪ أكفأ من الجلوكوز. لذلك: الفطور بالبروتين والدهون (بيض + أفوكادو) = طاقة مستدامة. الفطور بالكروسان = احتراق سريع وانهيار.',
      evidence:'NEJM 2019 (Intermittent Fasting): تحسين Mitochondrial Biogenesis مع التغذية المحسوبة.',
      relatedPathways:['fatigue','hormonal'] },
];

export function getScienceCardById(id: string): ScienceCard | undefined {
    return SCIENCE_CARDS.find(c => c.id === id);
}

export function getScienceCardsForPathway(pathway: string): ScienceCard[] {
    return SCIENCE_CARDS.filter(c =>
        c.relatedPathways.includes(pathway as ScienceCard['relatedPathways'][number])
    );
}

export function getAllScienceCards(): ScienceCard[] {
    return SCIENCE_CARDS;
}
