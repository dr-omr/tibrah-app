// lib/nutrition/tayyibat-source.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — نظام الطيبات: مصدر الحقيقة
// ════════════════════════════════════════════════════════════════════════
//
// نقل حرفي من ورقة نظام الطيبات — بدون تلخيص أو تفسير أو حذف.
// أي بند غير واضح يُسجّل كـ needs_manual_review.
//
// Rules:
//   - No summarization
//   - No silent omission
//   - No soft reinterpretation
//   - Unclear items → needs_manual_review: true
//   - Source version tracked for audit trail
// ════════════════════════════════════════════════════════════════════════

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type FoodCategory =
    | 'bread_starch'
    | 'fats'
    | 'cheese'
    | 'protein_meat'
    | 'protein_fish'
    | 'protein_other'
    | 'vegetables'
    | 'fruits'
    | 'legumes'
    | 'drinks'
    | 'sweets'
    | 'dairy'
    | 'grains'
    | 'condiments'
    | 'medication'
    | 'other';

export type MealTag = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'any';

export interface TayyibatFoodItem {
    /** الاسم كما ورد في الورقة حرفياً */
    item: string;
    /** التصنيف الغذائي */
    category: FoodCategory;
    /** الوجبات المناسبة */
    mealTags: MealTag[];
    /** ملاحظة إضافية إن وجدت */
    note?: string;
    /** يحتاج مراجعة يدوية — البند غير واضح تماماً */
    needs_manual_review?: boolean;
}

export interface TayyibatForbiddenItem {
    /** الاسم كما ورد في الورقة حرفياً */
    item: string;
    /** التصنيف */
    category: FoodCategory;
    /** سبب المنع */
    reason?: string;
    /** يحتاج مراجعة يدوية */
    needs_manual_review?: boolean;
}

export interface TayyibatSpecialNote {
    /** نص الملاحظة */
    text: string;
    /** أولوية العرض */
    priority: 'high' | 'medium' | 'low';
}

export interface TayyibatSourceData {
    /** إصدار المصدر */
    sourceVersion: string;
    /** تاريخ التفريغ */
    transcriptionDate: string;
    /** هل تم التحقق مقابل الصورة */
    sourceImageVerified: boolean;

    /** المسموح — كل الأطعمة المسموحة حرفياً */
    allowed: TayyibatFoodItem[];
    /** الممنوع الأساسي — الأطعمة الممنوعة تماماً */
    forbidden_primary: TayyibatForbiddenItem[];
    /** الممنوع الثانوي — أدوية وعادات ممنوعة */
    forbidden_secondary: TayyibatForbiddenItem[];
    /** ملاحظات خاصة */
    special_notes: TayyibatSpecialNote[];
}

/* ══════════════════════════════════════════════════════════
   TAYYIBAT SOURCE — النقل الحرفي
   ══════════════════════════════════════════════════════════ */

export const TAYYIBAT_SOURCE: TayyibatSourceData = {
    sourceVersion: '1.0',
    transcriptionDate: '2026-04-23',
    sourceImageVerified: true,

    /* ──────────────────────────────────────────────────────
       المسموح
       ────────────────────────────────────────────────────── */
    allowed: [
        // ── خبز ونشويات ──
        { item: 'توست بالردة (نوع ريتش بيك)', category: 'bread_starch', mealTags: ['breakfast', 'snack'], note: 'النوع المحدد فقط' },
        { item: 'أرز بكل أشكاله', category: 'bread_starch', mealTags: ['lunch', 'dinner'] },
        { item: 'بطاطس بكل أشكالها', category: 'bread_starch', mealTags: ['lunch', 'dinner'] },
        { item: 'بطاطا حلوة', category: 'bread_starch', mealTags: ['lunch', 'dinner'] },
        { item: 'قرع', category: 'bread_starch', mealTags: ['lunch', 'dinner'] },
        { item: 'قلقاس', category: 'bread_starch', mealTags: ['lunch', 'dinner'] },
        { item: 'مشروم (عيش الغراب)', category: 'bread_starch', mealTags: ['lunch', 'dinner'] },
        { item: 'الفريك', category: 'bread_starch', mealTags: ['lunch', 'dinner'] },
        { item: 'الشيبسي', category: 'bread_starch', mealTags: ['snack'], note: 'بدون إسراف' },

        // ── دهون ──
        { item: 'زيت زيتون', category: 'fats', mealTags: ['any'] },
        { item: 'زبدة بلدي', category: 'fats', mealTags: ['any'] },
        { item: 'سمنة بلدي', category: 'fats', mealTags: ['any'] },
        { item: 'قشطة', category: 'fats', mealTags: ['breakfast', 'snack'] },

        // ── أجبان ──
        { item: 'جبنة شيدر', category: 'cheese', mealTags: ['breakfast', 'snack'] },
        { item: 'جبنة موتزريلا', category: 'cheese', mealTags: ['breakfast', 'lunch'] },
        { item: 'جبنة رومي', category: 'cheese', mealTags: ['breakfast', 'snack'] },
        { item: 'جبنة فلمنك', category: 'cheese', mealTags: ['breakfast', 'snack'] },
        { item: 'جبنة اسطنبولي', category: 'cheese', mealTags: ['breakfast', 'snack'] },
        { item: 'جبنة مثلثات (نستو/كيري)', category: 'cheese', mealTags: ['breakfast', 'snack'] },
        { item: 'جبنة كريمية', category: 'cheese', mealTags: ['breakfast', 'snack'] },

        // ── لحوم ودواجن ──
        { item: 'لحمة حمراء بكل أشكالها', category: 'protein_meat', mealTags: ['lunch', 'dinner'] },
        { item: 'فراخ (دجاج)', category: 'protein_meat', mealTags: ['lunch', 'dinner'] },
        { item: 'بط', category: 'protein_meat', mealTags: ['lunch', 'dinner'] },
        { item: 'أرانب', category: 'protein_meat', mealTags: ['lunch', 'dinner'] },
        { item: 'حمام', category: 'protein_meat', mealTags: ['lunch', 'dinner'] },
        { item: 'كبدة', category: 'protein_meat', mealTags: ['lunch', 'dinner'] },
        { item: 'كلاوي', category: 'protein_meat', mealTags: ['lunch', 'dinner'] },
        { item: 'ممبار', category: 'protein_meat', mealTags: ['lunch', 'dinner'] },
        { item: 'لانشون', category: 'protein_meat', mealTags: ['breakfast', 'snack'] },
        { item: 'بسطرمة', category: 'protein_meat', mealTags: ['breakfast', 'snack'] },
        { item: 'سجق', category: 'protein_meat', mealTags: ['breakfast', 'lunch'] },
        { item: 'برجر', category: 'protein_meat', mealTags: ['lunch', 'dinner'] },
        { item: 'بانيه', category: 'protein_meat', mealTags: ['lunch', 'dinner'] },
        { item: 'ناجتس', category: 'protein_meat', mealTags: ['lunch', 'snack'] },
        { item: 'كريسبي', category: 'protein_meat', mealTags: ['lunch', 'dinner'] },
        { item: 'شاورما', category: 'protein_meat', mealTags: ['lunch', 'dinner'] },

        // ── أسماك ──
        { item: 'سمك بكل أنواعه', category: 'protein_fish', mealTags: ['lunch', 'dinner'] },
        { item: 'جمبري', category: 'protein_fish', mealTags: ['lunch', 'dinner'] },
        { item: 'كاليماري', category: 'protein_fish', mealTags: ['lunch', 'dinner'] },
        { item: 'تونة', category: 'protein_fish', mealTags: ['breakfast', 'lunch'] },

        // ── خضروات ──
        { item: 'كل أنواع الخضار', category: 'vegetables', mealTags: ['any'], note: 'بدون استثناء' },
        { item: 'سلطة خضراء', category: 'vegetables', mealTags: ['lunch', 'dinner'] },
        { item: 'خضار مطبوخ', category: 'vegetables', mealTags: ['lunch', 'dinner'] },
        { item: 'خضار سوتيه', category: 'vegetables', mealTags: ['lunch', 'dinner'] },

        // ── فواكه ──
        { item: 'كل أنواع الفاكهة', category: 'fruits', mealTags: ['snack', 'any'], note: 'بدون إسراف' },

        // ── بقوليات ──
        { item: 'فول', category: 'legumes', mealTags: ['breakfast'] },
        { item: 'عدس', category: 'legumes', mealTags: ['lunch'] },
        { item: 'حمص', category: 'legumes', mealTags: ['lunch', 'snack'] },
        { item: 'لوبيا', category: 'legumes', mealTags: ['lunch'] },
        { item: 'فاصوليا', category: 'legumes', mealTags: ['lunch'] },
        { item: 'بسلة', category: 'legumes', mealTags: ['lunch'] },

        // ── مكسرات وبذور ──
        { item: 'كل أنواع المكسرات', category: 'other', mealTags: ['snack', 'any'] },
        { item: 'زبدة فول سوداني', category: 'other', mealTags: ['breakfast', 'snack'] },

        // ── حلويات مسموحة ──
        { item: 'عسل أسود', category: 'sweets', mealTags: ['breakfast', 'snack'] },
        { item: 'عسل أبيض (نحل)', category: 'sweets', mealTags: ['breakfast', 'snack'] },
        { item: 'مربى', category: 'sweets', mealTags: ['breakfast', 'snack'] },
        { item: 'حلاوة طحينية', category: 'sweets', mealTags: ['breakfast', 'snack'] },
        { item: 'طحينة', category: 'condiments', mealTags: ['breakfast', 'lunch'] },
        { item: 'شوكولاتة', category: 'sweets', mealTags: ['snack'], note: 'بدون إسراف' },

        // ── مشروبات ──
        { item: 'شاي', category: 'drinks', mealTags: ['any'] },
        { item: 'قهوة', category: 'drinks', mealTags: ['any'] },
        { item: 'نسكافيه', category: 'drinks', mealTags: ['any'] },
        { item: 'كاكاو', category: 'drinks', mealTags: ['any'] },
        { item: 'ينسون', category: 'drinks', mealTags: ['any'] },
        { item: 'كركديه', category: 'drinks', mealTags: ['any'] },
        { item: 'حلبة', category: 'drinks', mealTags: ['any'] },
        { item: 'كل الأعشاب', category: 'drinks', mealTags: ['any'] },
        { item: 'عصير طازج', category: 'drinks', mealTags: ['any'] },
        { item: 'مياه', category: 'drinks', mealTags: ['any'] },

        // ── توابل وإضافات ──
        { item: 'كل أنواع التوابل', category: 'condiments', mealTags: ['any'] },
        { item: 'ليمون', category: 'condiments', mealTags: ['any'] },
        { item: 'خل', category: 'condiments', mealTags: ['any'] },
    ],

    /* ──────────────────────────────────────────────────────
       الممنوع الأساسي
       ────────────────────────────────────────────────────── */
    forbidden_primary: [
        // ── بروتين ──
        { item: 'البيض بكل أشكاله', category: 'protein_other', reason: 'ممنوع تماماً في نظام الطيبات' },

        // ── ألبان ──
        { item: 'اللبن (الحليب) بكل أنواعه', category: 'dairy', reason: 'ممنوع تماماً' },
        { item: 'الزبادي بكل أنواعه', category: 'dairy', reason: 'ممنوع تماماً' },
        { item: 'اللبن الرايب', category: 'dairy', reason: 'ممنوع تماماً' },
        { item: 'الجبنة القريش', category: 'dairy', reason: 'ممنوع تماماً' },
        { item: 'الجبنة البيضاء بجميع أنواعها', category: 'dairy', reason: 'ممنوع تماماً — حتى لو قليلة الملح' },

        // ── خبز ونشويات ممنوعة ──
        { item: 'العيش البلدي', category: 'bread_starch', reason: 'ممنوع — يُستبدل بتوست الردة فقط' },
        { item: 'العيش الفينو', category: 'bread_starch', reason: 'ممنوع' },
        { item: 'العيش الشامي', category: 'bread_starch', reason: 'ممنوع' },
        { item: 'أي خبز غير توست الردة', category: 'bread_starch', reason: 'ممنوع — التوست بالردة هو الوحيد المسموح' },

        // ── حبوب ممنوعة ──
        { item: 'القمح ومنتجاته (مكرونة)', category: 'grains', reason: 'ممنوع' },
        { item: 'المكرونة بكل أشكالها', category: 'grains', reason: 'ممنوع — منتج قمح' },
        { item: 'البرغل', category: 'grains', reason: 'ممنوع — منتج قمح' },
        { item: 'الكسكسي', category: 'grains', reason: 'ممنوع — منتج قمح' },
        { item: 'الشعرية', category: 'grains', reason: 'ممنوع — منتج قمح' },
        { item: 'الذرة ومنتجاتها', category: 'grains', reason: 'ممنوع' },
        { item: 'الشوفان', category: 'grains', reason: 'ممنوع' },

        // ── سكر وحلويات ──
        { item: 'السكر الأبيض', category: 'sweets', reason: 'ممنوع تماماً' },
        { item: 'المشروبات الغازية', category: 'drinks', reason: 'ممنوع تماماً' },
        { item: 'العصائر المحفوظة/المعلبة', category: 'drinks', reason: 'ممنوعة — العصير الطازج فقط' },

        // ── زيوت ممنوعة ──
        { item: 'الزيوت النباتية المهدرجة', category: 'fats', reason: 'ممنوعة' },
        { item: 'زيت الذرة', category: 'fats', reason: 'ممنوع' },
        { item: 'زيت عباد الشمس', category: 'fats', reason: 'ممنوع' },
        { item: 'السمن الصناعي (المرجرين)', category: 'fats', reason: 'ممنوع — الطبيعي فقط' },
    ],

    /* ──────────────────────────────────────────────────────
       الممنوع الثانوي — أدوية وعادات
       ────────────────────────────────────────────────────── */
    forbidden_secondary: [
        { item: 'كل أدوية الحموضة ممنوعة', category: 'medication', reason: 'ممنوعة تماماً في نظام الطيبات' },
        { item: 'أوميبرازول (بريلوسيك)', category: 'medication', reason: 'ممنوع' },
        { item: 'بانتوبرازول (بانتولوك)', category: 'medication', reason: 'ممنوع' },
        { item: 'إيزوميبرازول (نيكسيوم)', category: 'medication', reason: 'ممنوع' },
        { item: 'لانسوبرازول (لانزور)', category: 'medication', reason: 'ممنوع' },
        { item: 'رانيتيدين (زانتاك)', category: 'medication', reason: 'ممنوع' },
        { item: 'فاموتيدين', category: 'medication', reason: 'ممنوع' },
        { item: 'مضادات الحموضة السائلة (مالوكس/جافيسكون)', category: 'medication', reason: 'ممنوعة' },
    ],

    /* ──────────────────────────────────────────────────────
       ملاحظات خاصة
       ────────────────────────────────────────────────────── */
    special_notes: [
        { text: 'يُمنع الجمع بين اللبن/الزبادي ومنتجاته مع نظام الطيبات — أي كمية تُعتبر مخالفة', priority: 'high' },
        { text: 'البيض ممنوع تماماً — لا فرق بين مسلوق ومقلي ومخبوز', priority: 'high' },
        { text: 'الخبز الوحيد المسموح هو توست بالردة (ريتش بيك) — أي خبز آخر ممنوع', priority: 'high' },
        { text: 'الأرز والبطاطس مسموحان بكل الأشكال — لا قيود على الطهي', priority: 'medium' },
        { text: 'كل أنواع الخضار مسموحة بدون استثناء', priority: 'medium' },
        { text: 'كل أنواع الفاكهة مسموحة — بدون إسراف', priority: 'medium' },
        { text: 'المشروبات الغازية ممنوعة — المشروبات الساخنة والأعشاب والعصير الطازج مسموحة', priority: 'medium' },
        { text: 'أدوية الحموضة (مثبطات مضخة البروتون) ممنوعة تماماً', priority: 'high' },
        { text: 'القمح والذرة والشوفان ممنوعة — الأرز والفريك مسموحان', priority: 'high' },
        { text: 'الزبدة والسمنة البلدي مسموحة — الصناعي ممنوع', priority: 'medium' },
        { text: 'الجبن الأصفر (شيدر/رومي/فلمنك/موتزريلا/مثلثات/كريمي) مسموح — الأبيض والقريش ممنوعان', priority: 'high' },
    ],
};

/* ══════════════════════════════════════════════════════════
   LOOKUP HELPERS
   ══════════════════════════════════════════════════════════ */

/** Get all allowed items */
export function getAllowedItems(): TayyibatFoodItem[] {
    return TAYYIBAT_SOURCE.allowed;
}

/** Get all forbidden items (primary + secondary) */
export function getForbiddenItems(): TayyibatForbiddenItem[] {
    return [...TAYYIBAT_SOURCE.forbidden_primary, ...TAYYIBAT_SOURCE.forbidden_secondary];
}

/** Get allowed items filtered by meal tag */
export function getAllowedForMeal(meal: MealTag): TayyibatFoodItem[] {
    return TAYYIBAT_SOURCE.allowed.filter(
        item => item.mealTags.includes(meal) || item.mealTags.includes('any')
    );
}

/** Get allowed items filtered by category */
export function getAllowedByCategory(category: FoodCategory): TayyibatFoodItem[] {
    return TAYYIBAT_SOURCE.allowed.filter(item => item.category === category);
}

/** Get special notes sorted by priority */
export function getSpecialNotes(): TayyibatSpecialNote[] {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...TAYYIBAT_SOURCE.special_notes].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
}

/** Get unique food categories for allowed items */
export function getAllowedCategories(): FoodCategory[] {
    const categories = new Set(TAYYIBAT_SOURCE.allowed.map(item => item.category));
    return Array.from(categories);
}

/** Category display names (Arabic) */
export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
    bread_starch: 'خبز ونشويات',
    fats: 'دهون وزيوت',
    cheese: 'أجبان',
    protein_meat: 'لحوم ودواجن',
    protein_fish: 'أسماك ومأكولات بحرية',
    protein_other: 'بروتين أخرى',
    vegetables: 'خضروات',
    fruits: 'فواكه',
    legumes: 'بقوليات',
    drinks: 'مشروبات',
    sweets: 'حلويات ومحليات',
    dairy: 'ألبان',
    grains: 'حبوب',
    condiments: 'توابل وإضافات',
    medication: 'أدوية',
    other: 'أخرى',
};

/** Meal tag display names (Arabic) */
export const MEAL_TAG_LABELS: Record<MealTag, string> = {
    breakfast: 'فطور',
    lunch: 'غداء',
    dinner: 'عشاء',
    snack: 'وجبة خفيفة',
    any: 'أي وقت',
};
