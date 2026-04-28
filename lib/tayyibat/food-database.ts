// lib/tayyibat/food-database.ts — قاعدة بيانات الأطعمة الكاملة
// كل طعام مُحدَّد بـ ١٢ بُعد سريري
import type { FoodItem } from './types';

export const FOOD_DATABASE: FoodItem[] = [
    // ══ PROTEINS ══
    { id:'egg_whole', name:'بيضة كاملة', nameEn:'Whole Egg', emoji:'🥚', group:'protein', status:'allowed',
      mealSlots:['breakfast','lunch','any'], inflammationImpact:'anti', microbiomeImpact:'neutral', hormonalImpact:'supportive',
      keyNutrients:['كولين','لوتين','فيتامين د','B12','أوميغا ٣ (صفار)'],
      clinicalBenefit:'كولين ضروري لإنتاج أسيتيل كولين (ذاكرة). الصفار = مواد خام لكل الهرمونات. أغنى مصدر غذائي متكامل.',
      relevantPathways:['fatigue','hormonal','sleep'], preparationTip:'مسلوق ناعم أو مطبوخ بزيت زيتون لا بزبدة مكررة',
      scientificRef:'Am J Clinical Nutrition 2018', priority:5 },

    { id:'chicken_breast', name:'صدر دجاج طازج', nameEn:'Chicken Breast', emoji:'🍗', group:'protein', status:'allowed',
      mealSlots:['lunch','dinner'], inflammationImpact:'neutral', microbiomeImpact:'neutral', hormonalImpact:'supportive',
      keyNutrients:['ليوسين','تريبتوفان','B3','فوسفور','سيلينيوم'],
      clinicalBenefit:'تريبتوفان → سيروتونين + ميلاتونين. ليوسين ينشّط mTOR لبناء العضلات. منخفض الدهون المشبعة.',
      relevantPathways:['fatigue','sleep','hormonal'], preparationTip:'مشوي أو مطهو على البخار — لا مقلي',
      alternativeTo:'اللحوم المصنعة والنقانق', scientificRef:'Nutrients 2019', priority:4 },

    { id:'salmon', name:'سمك السلمون', nameEn:'Salmon', emoji:'🐟', group:'protein', status:'allowed',
      mealSlots:['lunch','dinner'], inflammationImpact:'anti', microbiomeImpact:'beneficial', hormonalImpact:'supportive',
      keyNutrients:['EPA','DHA','أستاكسانثين','فيتامين د','B12','سيلينيوم'],
      clinicalBenefit:'EPA يُنتج Resolvins (منهيات الالتهاب). DHA = ٦٠٪ من دهون الدماغ. أقوى مصدر طبيعي لأوميغا ٣.',
      relevantPathways:['pain','immune','fatigue','anxiety'], preparationTip:'مشوي أو بالبخار — لا مقلي لتجنب أكسدة الأوميغا ٣',
      scientificRef:'NEJM VITAL 2022', priority:5 },

    { id:'sardine', name:'سردين طازج أو معلب بزيت زيتون', nameEn:'Sardines', emoji:'🐠', group:'protein', status:'allowed',
      mealSlots:['lunch','dinner','snack'], inflammationImpact:'anti', microbiomeImpact:'beneficial', hormonalImpact:'supportive',
      keyNutrients:['أوميغا ٣','كالسيوم (مع العظام)','فيتامين د','كوك١٠','B12'],
      clinicalBenefit:'CoQ10 يدعم الميتوكوندريا. كالسيوم من العظام أكثر امتصاصاً من المكملات. رخيص وفعّال.',
      relevantPathways:['pain','fatigue','immune'], priority:4 },

    { id:'beef_grass_fed', name:'لحم بقري طازج (مراعي)', nameEn:'Grass-fed Beef', emoji:'🥩', group:'protein', status:'allowed',
      mealSlots:['lunch','dinner'], inflammationImpact:'neutral', microbiomeImpact:'neutral', hormonalImpact:'supportive',
      keyNutrients:['حديد هيم','زنك','كرياتين طبيعي','CLA','B12','كارنيتين'],
      clinicalBenefit:'حديد هيم امتصاص ٢٥٪ مقابل ٣٪ للحديد النباتي. زنك يدعم الدرقية وT cells. كرياتين طبيعي للطاقة الذهنية.',
      avoidReason: undefined,
      relevantPathways:['fatigue','immune','hormonal'], preparationTip:'مشوي أو مطبوخ — الطهي الزائد يُقلل الزنك والحديد',
      scientificRef:'Meat Science 2020', priority:4 },

    { id:'liver', name:'كبدة بقري أو دجاج', nameEn:'Liver', emoji:'🫀', group:'protein', status:'allowed',
      mealSlots:['lunch'], inflammationImpact:'anti', microbiomeImpact:'neutral', hormonalImpact:'supportive',
      keyNutrients:['B12 (أعلى مصدر)','حديد','فيتامين أ','CoQ10','فولات','نحاس'],
      clinicalBenefit:'ملعقة كبدة تُغطي ١٠٠٪ من B12 اليومي. Retinol (فيتامين أ نشط) لا يحتاج تحويلاً. أكثر طعام كثافة غذائية.',
      relevantPathways:['fatigue','immune'], preparationTip:'مرة/أسبوع كافية. لا تزيد على ١٠٠ جم/جلسة (فيتامين أ مرتفع)',
      scientificRef:'Nutrients 2021', priority:5 },

    // ══ FATS ══
    { id:'olive_oil_evoo', name:'زيت زيتون بكر ممتاز', nameEn:'Extra Virgin Olive Oil', emoji:'🫒', group:'fat', status:'allowed',
      mealSlots:['any'], inflammationImpact:'anti', microbiomeImpact:'beneficial', hormonalImpact:'supportive',
      keyNutrients:['أوليوكانثال','أوميغا ٩','فيتامين ك','بوليفينول','توكوفيرول'],
      clinicalBenefit:'أوليوكانثال يُثبط COX-1 وCOX-2 كالإيبوبروفين (بدون آثار جانبية). بوليفينول يدعم الميكروبيوم. قلب مدروس.',
      relevantPathways:['pain','immune','fatigue','all'], preparationTip:'أضفه بعد الطهي أو على البارد — الحرارة الزائدة تُفقده فوائده',
      scientificRef:'PREDIMED NEJM 2018', priority:5 },

    { id:'avocado', name:'أفوكادو', nameEn:'Avocado', emoji:'🥑', group:'fat', status:'allowed',
      mealSlots:['breakfast','lunch','snack'], inflammationImpact:'anti', microbiomeImpact:'beneficial', hormonalImpact:'supportive',
      keyNutrients:['أوميغا ٩','بوتاسيوم (أكثر من موز)','مغنيسيوم','فيتامين ك','لوتين','ألياف'],
      clinicalBenefit:'بوتاسيوم يُنظّم ضغط الدم. الدهون تُحسّن امتصاص فيتامين أ/د/ك/ه. يُخفض LDL مع رفع HDL.',
      relevantPathways:['hormonal','fatigue','sleep'], priority:5 },

    { id:'walnuts', name:'جوز', nameEn:'Walnuts', emoji:'🫘', group:'fat', status:'allowed',
      mealSlots:['snack','any'], inflammationImpact:'anti', microbiomeImpact:'beneficial', hormonalImpact:'supportive',
      keyNutrients:['ALA (أوميغا ٣ نباتي)','إيلاجيتانين','مغنيسيوم','ميلاتونين طبيعي','L-arginine'],
      clinicalBenefit:'يحتوي ميلاتونين طبيعياً (الوحيد تقريباً بين المكسرات). L-arginine يُنتج NO (توسع وعائي). أفضل مكسرة للدماغ.',
      relevantPathways:['sleep','fatigue','immune'], preparationTip:'٢٨ جم / يوم (٧ حبات كاملة) = الجرعة المثالية',
      priority:5 },

    { id:'almonds', name:'لوز خام', nameEn:'Raw Almonds', emoji:'🥜', group:'fat', status:'allowed',
      mealSlots:['snack','any'], inflammationImpact:'anti', microbiomeImpact:'beneficial', hormonalImpact:'neutral',
      keyNutrients:['فيتامين ه','مغنيسيوم','B2','مانجانيز','ألياف prebiotics'],
      clinicalBenefit:'فيتامين ه أقوى مضاد أكسدة لأغشية الخلايا. الألياف تُغذّي Bifidobacterium. يُبطئ امتصاص السكر.',
      relevantPathways:['immune','fatigue'], preparationTip:'خام أو منقوع ليلة — ينشّط الإنزيمات ويُقلل Phytic Acid',
      priority:4 },

    // ══ VEGETABLES ══
    { id:'broccoli', name:'بروكلي', nameEn:'Broccoli', emoji:'🥦', group:'vegetable', status:'allowed',
      mealSlots:['lunch','dinner'], inflammationImpact:'anti', microbiomeImpact:'beneficial', hormonalImpact:'supportive',
      keyNutrients:['سولفورافين','DIM','فيتامين C','فيتامين ك','Quercetin','ألياف'],
      clinicalBenefit:'سولفورافين يُنشّط NRF2 (درع مضاد الأكسدة). DIM يُحسّن استقلاب الإستروجين (مهم جداً لـ PCOS وEstrogen Dom). فيتامين C ضعف البرتقال.',
      relevantPathways:['hormonal','immune','pain'], preparationTip:'بخار ٣–٥ دقائق فقط — الطهي الزائد يُدمر السولفورافين',
      scientificRef:'Cancer Prevention Research 2018', priority:5 },

    { id:'spinach', name:'سبانخ طازجة', nameEn:'Spinach', emoji:'🌿', group:'vegetable', status:'allowed',
      mealSlots:['any'], inflammationImpact:'anti', microbiomeImpact:'beneficial', hormonalImpact:'supportive',
      keyNutrients:['حديد غير هيم','فولات','مغنيسيوم','نيترات طبيعي','لوتين','زياكسانثين'],
      clinicalBenefit:'نيترات يتحول لـ NO (توسع وعائي + طاقة عضلية). فولات للميثيل. مغنيسيوم مُتاح فعلاً في الشكل المطبوخ.',
      relevantPathways:['fatigue','hormonal'], preparationTip:'طازجة في سلطة أو مطهوة بالزيتون — مع فيتامين C لتعزيز امتصاص الحديد',
      priority:5 },

    { id:'garlic', name:'ثوم طازج', nameEn:'Raw Garlic', emoji:'🧄', group:'herb', status:'allowed',
      mealSlots:['any'], inflammationImpact:'anti', microbiomeImpact:'beneficial', hormonalImpact:'supportive',
      keyNutrients:['أليسين','الليوم','فروكتوأوليجوساكاريد (FOS)','سيلينيوم','فيتامين B6'],
      clinicalBenefit:'FOS هو بريبيوتيك قوي يُغذّي Lactobacillus. أليسين مضاد حيوي طبيعي. يُخفض ضغط الدم ٨–١١ نقطة (meta-analysis).',
      relevantPathways:['immune','digestion','pain'], preparationTip:'اقطعه واتركه ١٠ دقائق قبل الطهي — ينشّط Alliinase لإنتاج أليسين',
      scientificRef:'Journal Nutrition 2020', priority:5 },

    { id:'sweet_potato', name:'بطاطا حلوة', nameEn:'Sweet Potato', emoji:'🍠', group:'carb', status:'allowed',
      mealSlots:['lunch','dinner'], inflammationImpact:'anti', microbiomeImpact:'beneficial', hormonalImpact:'neutral',
      keyNutrients:['بيتا كاروتين','بوتاسيوم','مانجانيز','ألياف','فيتامين ب٦'],
      clinicalBenefit:'بيتا كاروتين → فيتامين أ (مشروط). GI = ٤٤ (منخفض) مقارنة بالبطاطس البيضاء (٨٥). يُغذّي Gut Microbiome.',
      relevantPathways:['fatigue','immune'], preparationTip:'مسلوقة أو مخبوزة. GI يرتفع مع الطهي الزائد',
      priority:3 },

    // ══ FORBIDDEN (primary) ══
    { id:'white_sugar', name:'سكر أبيض مكرر', nameEn:'Refined White Sugar', emoji:'⛔', group:'carb', status:'forbidden_primary',
      mealSlots:[], inflammationImpact:'highly_pro', microbiomeImpact:'harmful', hormonalImpact:'disruptive',
      keyNutrients:[],
      clinicalBenefit:'',
      avoidReason:'يُبطل وظيفة Neutrophils (مناعة) ٤–٦ ساعات بعد كل جرعة. يُغذّي Candida والبكتيريا الضارة. يُسبب ارتفاع Insulin → ثم هبوط طاقة.',
      relevantPathways:['immune','fatigue','hormonal','digestion'], priority:5 },

    { id:'seed_oils', name:'زيوت البذور المكررة', nameEn:'Refined Seed Oils', emoji:'⛔', group:'fat', status:'forbidden_primary',
      mealSlots:[], inflammationImpact:'highly_pro', microbiomeImpact:'harmful', hormonalImpact:'disruptive',
      keyNutrients:[],
      clinicalBenefit:'',
      avoidReason:'زيت الذرة والكانولا والعباد = ٧٠٪+ أوميغا ٦ → يُحوّل AA إلى PGE2 و LTB4 (التهاب). نسبة أوميغا٦:٣ يجب < ٤:١ — هذه الزيوت ترفعها لـ ٢٠:١.',
      relevantPathways:['pain','immune','fatigue'], alternativeTo:'زيت الزيتون البكر', priority:5 },

    { id:'processed_flour', name:'دقيق أبيض مكرر وجميع منتجاته', nameEn:'Refined White Flour', emoji:'⛔', group:'grain', status:'forbidden_primary',
      mealSlots:[], inflammationImpact:'highly_pro', microbiomeImpact:'harmful', hormonalImpact:'disruptive',
      keyNutrients:[],
      clinicalBenefit:'',
      avoidReason:'GI=٧٠–٨٥ يُسبب ارتفاعاً سريعاً للإنسولين. Gluten يُحفز Zonulin (يُفتح التقاطعات المحكمة للأمعاء = Leaky Gut). يُغذّي Dysbiosis.',
      relevantPathways:['digestion','immune','hormonal'], alternativeTo:'حبوب كاملة أو بطاطا حلوة', priority:5 },

    { id:'processed_dairy', name:'ألبان ومنتجات مصنّعة', nameEn:'Processed Dairy', emoji:'⛔', group:'dairy', status:'forbidden_primary',
      mealSlots:[], inflammationImpact:'pro', microbiomeImpact:'harmful', hormonalImpact:'disruptive',
      keyNutrients:[],
      clinicalBenefit:'',
      avoidReason:'Casein A1 يُنتج BCM-7 (أوبيويد خفيف) → يُثير الجهاز المناعي. الهرمونات الصناعية في الألبان المصنعة تُؤثر على المحور الهرموني.',
      relevantPathways:['digestion','immune','hormonal'], alternativeTo:'لبن ماعز أو جبن طازج محدود', priority:4 },

    { id:'fast_food', name:'الوجبات السريعة', nameEn:'Fast Food', emoji:'⛔', group:'protein', status:'forbidden_primary',
      mealSlots:[], inflammationImpact:'highly_pro', microbiomeImpact:'harmful', hormonalImpact:'disruptive',
      keyNutrients:[],
      clinicalBenefit:'',
      avoidReason:'AGEs (Advanced Glycation End products) من القلي بحرارة عالية = التهاب مزمن. Trans fats خفية. ملح صوديوم مفرط. Emulsifiers (Carboxymethylcellulose) تُدمر الغشاء المخاطي.',
      relevantPathways:['all'], priority:5 },

    { id:'soft_drinks', name:'المشروبات الغازية والعصائر المصنعة', nameEn:'Soft Drinks & Processed Juices', emoji:'⛔', group:'drink', status:'forbidden_primary',
      mealSlots:[], inflammationImpact:'highly_pro', microbiomeImpact:'harmful', hormonalImpact:'disruptive',
      keyNutrients:[],
      clinicalBenefit:'',
      avoidReason:'فركتوز مكرر (HFCS) يُستقلب مباشرة في الكبد → دهون كبدية. يُرفع Uric Acid → التهاب ونقرس. Phosphoric Acid يُزيح الكالسيوم من العظام.',
      relevantPathways:['all'], alternativeTo:'ماء فوار طبيعي + ليمون', priority:5 },

    { id:'artificial_sweeteners', name:'المحليات الصناعية', nameEn:'Artificial Sweeteners', emoji:'⛔', group:'drink', status:'forbidden_primary',
      mealSlots:[], inflammationImpact:'pro', microbiomeImpact:'harmful', hormonalImpact:'disruptive',
      keyNutrients:[],
      clinicalBenefit:'',
      avoidReason:'Aspartame يُنتج Methanol + Phenylalanine (ينافس تريبتوفان على BBB → يُقلل السيروتونين). Sucralose يقتل Lactobacillus مباشرة (In vitro). تُربك محور GLP-1.',
      relevantPathways:['digestion','anxiety','sleep'], alternativeTo:'عسل النحل الخام (محدود)', priority:4 },

    { id:'processed_meats', name:'اللحوم المصنعة (نقانق، بسطرمة، هوت دوج)', nameEn:'Processed Meats', emoji:'⛔', group:'protein', status:'forbidden_primary',
      mealSlots:[], inflammationImpact:'highly_pro', microbiomeImpact:'harmful', hormonalImpact:'disruptive',
      keyNutrients:[],
      clinicalBenefit:'',
      avoidReason:'Nitrosamines (من نيترات التحفظ) مرتبطة بسرطان القولون (WHO Class 1 Carcinogen). TMAO من الكارنيتين المُستقلب ببكتيريا الغذاء الصناعي → تصلب شرايين.',
      relevantPathways:['immune','pain'], alternativeTo:'لحم طازج مطبوخ في البيت', priority:5 },

    // ══ CONDITIONAL ══
    { id:'raw_honey', name:'عسل نحل خام', nameEn:'Raw Honey', emoji:'🍯', group:'carb', status:'conditional',
      mealSlots:['breakfast','any'], inflammationImpact:'anti', microbiomeImpact:'beneficial', hormonalImpact:'neutral',
      keyNutrients:['إنزيمات','بروبوليس','فلافونويدات','H2O2 (مضاد جراثيم)'],
      clinicalBenefit:'بروبوليس مضاد حيوي طبيعي. يُحسّن نوم إذا أُخذ مساءً (يُطلق جليكوجين يُثبت سكر الدم الليلي).',
      conditionalNote:'مسموح بـ ١ ملعقة صغيرة / يوم فقط. خام غير مبستر. ممنوع للمصابين بالسكري النشط.',
      relevantPathways:['sleep','immune'], priority:3 },

    { id:'dark_chocolate', name:'شوكولاتة داكنة ٨٥٪+', nameEn:'Dark Chocolate 85%+', emoji:'🍫', group:'fat', status:'conditional',
      mealSlots:['snack'], inflammationImpact:'anti', microbiomeImpact:'beneficial', hormonalImpact:'neutral',
      keyNutrients:['فلافانول الكاكاو','مغنيسيوم','سيروتونين أولي','تيوبرومين'],
      clinicalBenefit:'فلافانول يُحسّن تدفق الدم الدماغي (ذاكرة وتركيز). مغنيسيوم للنوم. تيوبرومين مُنشّط خفيف بدون جيتر.',
      conditionalNote:'٢٠ جم / يوم فقط. ٨٥٪ كاكاو أو أكثر. لا يُؤخذ مساءً (كافيين خفيف).',
      relevantPathways:['fatigue','anxiety'], priority:2 },
];

export function getFoodById(id: string): FoodItem | undefined {
    return FOOD_DATABASE.find(f => f.id === id);
}

export function getFoodsByGroup(group: FoodItem['group']): FoodItem[] {
    return FOOD_DATABASE.filter(f => f.group === group);
}

export function getAllowedFoods(): FoodItem[] {
    return FOOD_DATABASE.filter(f => f.status === 'allowed' || f.status === 'conditional');
}

export function getForbiddenFoods(): FoodItem[] {
    return FOOD_DATABASE.filter(f => f.status === 'forbidden_primary' || f.status === 'forbidden_secondary');
}

export function getFoodsForPathway(pathway: FoodItem['relevantPathways'][number]): FoodItem[] {
    return FOOD_DATABASE.filter(f =>
        f.relevantPathways.includes(pathway) || f.relevantPathways.includes('all')
    );
}

export function getTopAllowedByPriority(n = 10): FoodItem[] {
    return getAllowedFoods().sort((a, b) => b.priority - a.priority).slice(0, n);
}

export function getTopForbiddenByImpact(): FoodItem[] {
    return getForbiddenFoods().filter(f => f.inflammationImpact === 'highly_pro').sort((a,b) => b.priority - a.priority);
}
