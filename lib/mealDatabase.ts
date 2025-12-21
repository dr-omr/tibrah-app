// lib/mealDatabase.ts
// Comprehensive Arabic Food & Nutrition Database

export interface NutritionInfo {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol: number;
}

export interface HealthCondition {
    id: string;
    name: string;
    nameAr: string;
    restrictions: string[];
    recommendations: string[];
}

export interface FoodItem {
    id: string;
    name: string;
    nameAr: string;
    category: string;
    categoryAr: string;
    servingSize: number;
    servingUnit: string;
    nutrition: NutritionInfo;
    glycemicIndex?: number;
    allergens: string[];
    tags: string[];
    imageUrl?: string;
    healthConditions: {
        diabetes: 'safe' | 'caution' | 'avoid';
        hypertension: 'safe' | 'caution' | 'avoid';
        ibs: 'safe' | 'caution' | 'avoid';
        celiac: 'safe' | 'caution' | 'avoid';
        lactoseIntolerance: 'safe' | 'caution' | 'avoid';
    };
}

export interface Recipe {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    ingredients: { foodId: string; amount: number; unit: string }[];
    instructions: string[];
    instructionsAr: string[];
    totalNutrition: NutritionInfo;
    tags: string[];
    imageUrl?: string;
}

export interface MealPlan {
    id: string;
    date: string;
    meals: {
        breakfast: { recipeId?: string; foods: { foodId: string; amount: number }[] };
        lunch: { recipeId?: string; foods: { foodId: string; amount: number }[] };
        dinner: { recipeId?: string; foods: { foodId: string; amount: number }[] };
        snacks: { foodId: string; amount: number }[];
    };
    totalNutrition: NutritionInfo;
    notes?: string;
}

// Health Conditions Database
export const healthConditions: HealthCondition[] = [
    {
        id: 'diabetes',
        name: 'Diabetes',
        nameAr: 'السكري',
        restrictions: ['سكر', 'حلويات', 'عصائر محلاة', 'أرز أبيض', 'خبز أبيض'],
        recommendations: ['خضروات ورقية', 'بروتين', 'حبوب كاملة', 'مكسرات', 'بقوليات']
    },
    {
        id: 'hypertension',
        name: 'Hypertension',
        nameAr: 'ضغط الدم',
        restrictions: ['ملح', 'مخللات', 'لحوم مصنعة', 'أطعمة معلبة'],
        recommendations: ['موز', 'سبانخ', 'شوفان', 'سمك', 'ثوم']
    },
    {
        id: 'ibs',
        name: 'IBS',
        nameAr: 'القولون العصبي',
        restrictions: ['بقوليات', 'ملفوف', 'بصل', 'ثوم', 'قمح', 'لاكتوز'],
        recommendations: ['موز', 'أرز', 'دجاج', 'بيض', 'زنجبيل']
    },
    {
        id: 'celiac',
        name: 'Celiac Disease',
        nameAr: 'حساسية الغلوتين',
        restrictions: ['قمح', 'شعير', 'شوفان عادي', 'خبز', 'مكرونة'],
        recommendations: ['أرز', 'ذرة', 'بطاطس', 'كينوا', 'خضروات']
    },
    {
        id: 'lactoseIntolerance',
        name: 'Lactose Intolerance',
        nameAr: 'حساسية اللاكتوز',
        restrictions: ['حليب', 'جبن', 'زبادي عادي', 'آيس كريم', 'كريمة'],
        recommendations: ['حليب اللوز', 'حليب جوز الهند', 'زبادي نباتي']
    }
];

// Arabic Food Database (Offline)
export const foodDatabase: FoodItem[] = [
    // === الحبوب والنشويات ===
    {
        id: 'rice-white',
        name: 'White Rice',
        nameAr: 'أرز أبيض',
        category: 'grains',
        categoryAr: 'الحبوب',
        servingSize: 150,
        servingUnit: 'غرام',
        nutrition: { calories: 206, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, sugar: 0, sodium: 1, cholesterol: 0 },
        glycemicIndex: 73,
        allergens: [],
        tags: ['نشويات', 'طاقة'],
        healthConditions: { diabetes: 'caution', hypertension: 'safe', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'rice-brown',
        name: 'Brown Rice',
        nameAr: 'أرز بني',
        category: 'grains',
        categoryAr: 'الحبوب',
        servingSize: 150,
        servingUnit: 'غرام',
        nutrition: { calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, sugar: 0, sodium: 10, cholesterol: 0 },
        glycemicIndex: 50,
        allergens: [],
        tags: ['حبوب كاملة', 'صحي'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'bread-white',
        name: 'White Bread',
        nameAr: 'خبز أبيض',
        category: 'grains',
        categoryAr: 'الحبوب',
        servingSize: 30,
        servingUnit: 'غرام',
        nutrition: { calories: 79, protein: 2.7, carbs: 15, fat: 1, fiber: 0.6, sugar: 1.5, sodium: 147, cholesterol: 0 },
        glycemicIndex: 75,
        allergens: ['gluten'],
        tags: ['نشويات'],
        healthConditions: { diabetes: 'avoid', hypertension: 'caution', ibs: 'caution', celiac: 'avoid', lactoseIntolerance: 'safe' }
    },
    {
        id: 'bread-whole',
        name: 'Whole Wheat Bread',
        nameAr: 'خبز أسمر',
        category: 'grains',
        categoryAr: 'الحبوب',
        servingSize: 30,
        servingUnit: 'غرام',
        nutrition: { calories: 69, protein: 3.6, carbs: 12, fat: 1.1, fiber: 1.9, sugar: 1.4, sodium: 130, cholesterol: 0 },
        glycemicIndex: 51,
        allergens: ['gluten'],
        tags: ['حبوب كاملة'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'caution', celiac: 'avoid', lactoseIntolerance: 'safe' }
    },
    {
        id: 'oats',
        name: 'Oats',
        nameAr: 'شوفان',
        category: 'grains',
        categoryAr: 'الحبوب',
        servingSize: 40,
        servingUnit: 'غرام',
        nutrition: { calories: 150, protein: 5, carbs: 27, fat: 2.5, fiber: 4, sugar: 1, sodium: 0, cholesterol: 0 },
        glycemicIndex: 55,
        allergens: ['gluten'],
        tags: ['حبوب كاملة', 'فطور'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'caution', celiac: 'caution', lactoseIntolerance: 'safe' }
    },
    // === البروتينات ===
    {
        id: 'chicken-breast',
        name: 'Chicken Breast',
        nameAr: 'صدر دجاج',
        category: 'protein',
        categoryAr: 'البروتين',
        servingSize: 100,
        servingUnit: 'غرام',
        nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, cholesterol: 85 },
        allergens: [],
        tags: ['بروتين', 'قليل الدهون'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'beef',
        name: 'Beef',
        nameAr: 'لحم بقر',
        category: 'protein',
        categoryAr: 'البروتين',
        servingSize: 100,
        servingUnit: 'غرام',
        nutrition: { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 72, cholesterol: 90 },
        allergens: [],
        tags: ['بروتين', 'حديد'],
        healthConditions: { diabetes: 'safe', hypertension: 'caution', ibs: 'caution', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'lamb',
        name: 'Lamb',
        nameAr: 'لحم ضأن',
        category: 'protein',
        categoryAr: 'البروتين',
        servingSize: 100,
        servingUnit: 'غرام',
        nutrition: { calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0, sugar: 0, sodium: 72, cholesterol: 97 },
        allergens: [],
        tags: ['بروتين', 'حديد'],
        healthConditions: { diabetes: 'safe', hypertension: 'caution', ibs: 'caution', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'fish-salmon',
        name: 'Salmon',
        nameAr: 'سلمون',
        category: 'protein',
        categoryAr: 'البروتين',
        servingSize: 100,
        servingUnit: 'غرام',
        nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59, cholesterol: 55 },
        allergens: ['fish'],
        tags: ['بروتين', 'أوميغا 3'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'eggs',
        name: 'Eggs',
        nameAr: 'بيض',
        category: 'protein',
        categoryAr: 'البروتين',
        servingSize: 50,
        servingUnit: 'غرام (1 بيضة)',
        nutrition: { calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, sugar: 0.6, sodium: 62, cholesterol: 186 },
        allergens: ['eggs'],
        tags: ['بروتين', 'فطور'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'lentils',
        name: 'Lentils',
        nameAr: 'عدس',
        category: 'legumes',
        categoryAr: 'البقوليات',
        servingSize: 100,
        servingUnit: 'غرام',
        nutrition: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, sugar: 2, sodium: 2, cholesterol: 0 },
        glycemicIndex: 32,
        allergens: [],
        tags: ['بروتين نباتي', 'ألياف'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'avoid', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'chickpeas',
        name: 'Chickpeas',
        nameAr: 'حمص',
        category: 'legumes',
        categoryAr: 'البقوليات',
        servingSize: 100,
        servingUnit: 'غرام',
        nutrition: { calories: 164, protein: 9, carbs: 27, fat: 2.6, fiber: 8, sugar: 5, sodium: 7, cholesterol: 0 },
        glycemicIndex: 28,
        allergens: [],
        tags: ['بروتين نباتي', 'ألياف'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'avoid', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    // === الخضروات ===
    {
        id: 'cucumber',
        name: 'Cucumber',
        nameAr: 'خيار',
        category: 'vegetables',
        categoryAr: 'الخضروات',
        servingSize: 100,
        servingUnit: 'غرام',
        nutrition: { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, sugar: 1.7, sodium: 2, cholesterol: 0 },
        glycemicIndex: 15,
        allergens: [],
        tags: ['قليل السعرات', 'منعش'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'tomato',
        name: 'Tomato',
        nameAr: 'طماطم',
        category: 'vegetables',
        categoryAr: 'الخضروات',
        servingSize: 100,
        servingUnit: 'غرام',
        nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5, cholesterol: 0 },
        glycemicIndex: 15,
        allergens: [],
        tags: ['مضاد أكسدة', 'ليكوبين'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'caution', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'spinach',
        name: 'Spinach',
        nameAr: 'سبانخ',
        category: 'vegetables',
        categoryAr: 'الخضروات',
        servingSize: 100,
        servingUnit: 'غرام',
        nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79, cholesterol: 0 },
        glycemicIndex: 15,
        allergens: [],
        tags: ['حديد', 'خضار ورقية'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'broccoli',
        name: 'Broccoli',
        nameAr: 'بروكولي',
        category: 'vegetables',
        categoryAr: 'الخضروات',
        servingSize: 100,
        servingUnit: 'غرام',
        nutrition: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33, cholesterol: 0 },
        glycemicIndex: 10,
        allergens: [],
        tags: ['مضاد أكسدة', 'فيتامين C'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'caution', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'carrot',
        name: 'Carrot',
        nameAr: 'جزر',
        category: 'vegetables',
        categoryAr: 'الخضروات',
        servingSize: 100,
        servingUnit: 'غرام',
        nutrition: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69, cholesterol: 0 },
        glycemicIndex: 35,
        allergens: [],
        tags: ['فيتامين A', 'بيتا كاروتين'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    // === الفواكه ===
    {
        id: 'apple',
        name: 'Apple',
        nameAr: 'تفاح',
        category: 'fruits',
        categoryAr: 'الفواكه',
        servingSize: 150,
        servingUnit: 'غرام',
        nutrition: { calories: 78, protein: 0.4, carbs: 21, fat: 0.3, fiber: 3.6, sugar: 15, sodium: 2, cholesterol: 0 },
        glycemicIndex: 36,
        allergens: [],
        tags: ['ألياف', 'وجبة خفيفة'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'caution', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'banana',
        name: 'Banana',
        nameAr: 'موز',
        category: 'fruits',
        categoryAr: 'الفواكه',
        servingSize: 120,
        servingUnit: 'غرام',
        nutrition: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14, sodium: 1, cholesterol: 0 },
        glycemicIndex: 51,
        allergens: [],
        tags: ['بوتاسيوم', 'طاقة'],
        healthConditions: { diabetes: 'caution', hypertension: 'safe', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'dates',
        name: 'Dates',
        nameAr: 'تمر',
        category: 'fruits',
        categoryAr: 'الفواكه',
        servingSize: 30,
        servingUnit: 'غرام (3 حبات)',
        nutrition: { calories: 83, protein: 0.6, carbs: 22, fat: 0, fiber: 2, sugar: 19, sodium: 1, cholesterol: 0 },
        glycemicIndex: 42,
        allergens: [],
        tags: ['طاقة سريعة', 'عربي'],
        healthConditions: { diabetes: 'caution', hypertension: 'safe', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    // === الألبان ===
    {
        id: 'milk',
        name: 'Milk',
        nameAr: 'حليب كامل',
        category: 'dairy',
        categoryAr: 'الألبان',
        servingSize: 240,
        servingUnit: 'مل',
        nutrition: { calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0, sugar: 12, sodium: 105, cholesterol: 24 },
        allergens: ['milk'],
        tags: ['كالسيوم', 'بروتين'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'caution', celiac: 'safe', lactoseIntolerance: 'avoid' }
    },
    {
        id: 'yogurt',
        name: 'Yogurt',
        nameAr: 'زبادي',
        category: 'dairy',
        categoryAr: 'الألبان',
        servingSize: 150,
        servingUnit: 'غرام',
        nutrition: { calories: 100, protein: 6, carbs: 8, fat: 5, fiber: 0, sugar: 8, sodium: 70, cholesterol: 15 },
        allergens: ['milk'],
        tags: ['بروبيوتيك', 'كالسيوم'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'caution', celiac: 'safe', lactoseIntolerance: 'caution' }
    },
    {
        id: 'cheese-white',
        name: 'White Cheese',
        nameAr: 'جبنة بيضاء',
        category: 'dairy',
        categoryAr: 'الألبان',
        servingSize: 30,
        servingUnit: 'غرام',
        nutrition: { calories: 75, protein: 5, carbs: 1, fat: 6, fiber: 0, sugar: 0.5, sodium: 320, cholesterol: 20 },
        allergens: ['milk'],
        tags: ['كالسيوم', 'بروتين'],
        healthConditions: { diabetes: 'safe', hypertension: 'avoid', ibs: 'caution', celiac: 'safe', lactoseIntolerance: 'caution' }
    },
    // === المكسرات والبذور ===
    {
        id: 'almonds',
        name: 'Almonds',
        nameAr: 'لوز',
        category: 'nuts',
        categoryAr: 'المكسرات',
        servingSize: 28,
        servingUnit: 'غرام',
        nutrition: { calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, sugar: 1, sodium: 0, cholesterol: 0 },
        glycemicIndex: 0,
        allergens: ['tree nuts'],
        tags: ['دهون صحية', 'فيتامين E'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'caution', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'walnuts',
        name: 'Walnuts',
        nameAr: 'جوز',
        category: 'nuts',
        categoryAr: 'المكسرات',
        servingSize: 28,
        servingUnit: 'غرام',
        nutrition: { calories: 185, protein: 4, carbs: 4, fat: 18, fiber: 2, sugar: 1, sodium: 0, cholesterol: 0 },
        glycemicIndex: 0,
        allergens: ['tree nuts'],
        tags: ['أوميغا 3', 'دماغ'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    // === الأطباق العربية ===
    {
        id: 'hummus',
        name: 'Hummus',
        nameAr: 'حمص بطحينة',
        category: 'dishes',
        categoryAr: 'أطباق',
        servingSize: 100,
        servingUnit: 'غرام',
        nutrition: { calories: 166, protein: 8, carbs: 14, fat: 10, fiber: 6, sugar: 0, sodium: 379, cholesterol: 0 },
        glycemicIndex: 6,
        allergens: ['sesame'],
        tags: ['مقبلات', 'بروتين نباتي'],
        healthConditions: { diabetes: 'safe', hypertension: 'caution', ibs: 'avoid', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'falafel',
        name: 'Falafel',
        nameAr: 'فلافل',
        category: 'dishes',
        categoryAr: 'أطباق',
        servingSize: 100,
        servingUnit: 'غرام (4 حبات)',
        nutrition: { calories: 333, protein: 13, carbs: 32, fat: 18, fiber: 5, sugar: 2, sodium: 585, cholesterol: 0 },
        glycemicIndex: 40,
        allergens: [],
        tags: ['نباتي', 'بروتين'],
        healthConditions: { diabetes: 'caution', hypertension: 'caution', ibs: 'avoid', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'kabsa',
        name: 'Kabsa',
        nameAr: 'كبسة',
        category: 'dishes',
        categoryAr: 'أطباق',
        servingSize: 350,
        servingUnit: 'غرام',
        nutrition: { calories: 580, protein: 35, carbs: 65, fat: 18, fiber: 3, sugar: 4, sodium: 890, cholesterol: 95 },
        glycemicIndex: 65,
        allergens: [],
        tags: ['طبق رئيسي', 'سعودي'],
        healthConditions: { diabetes: 'caution', hypertension: 'caution', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'mandi',
        name: 'Mandi',
        nameAr: 'مندي',
        category: 'dishes',
        categoryAr: 'أطباق',
        servingSize: 350,
        servingUnit: 'غرام',
        nutrition: { calories: 550, protein: 32, carbs: 60, fat: 16, fiber: 2, sugar: 3, sodium: 780, cholesterol: 90 },
        glycemicIndex: 60,
        allergens: [],
        tags: ['طبق رئيسي', 'يمني'],
        healthConditions: { diabetes: 'caution', hypertension: 'caution', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'tabbouleh',
        name: 'Tabbouleh',
        nameAr: 'تبولة',
        category: 'salads',
        categoryAr: 'سلطات',
        servingSize: 150,
        servingUnit: 'غرام',
        nutrition: { calories: 90, protein: 3, carbs: 15, fat: 3, fiber: 4, sugar: 2, sodium: 120, cholesterol: 0 },
        glycemicIndex: 25,
        allergens: ['gluten'],
        tags: ['سلطة', 'صحي'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'caution', celiac: 'avoid', lactoseIntolerance: 'safe' }
    },
    {
        id: 'fattoush',
        name: 'Fattoush',
        nameAr: 'فتوش',
        category: 'salads',
        categoryAr: 'سلطات',
        servingSize: 150,
        servingUnit: 'غرام',
        nutrition: { calories: 110, protein: 2, carbs: 18, fat: 4, fiber: 3, sugar: 4, sodium: 200, cholesterol: 0 },
        glycemicIndex: 30,
        allergens: ['gluten'],
        tags: ['سلطة', 'لبناني'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'caution', celiac: 'caution', lactoseIntolerance: 'safe' }
    },
    // === المشروبات ===
    {
        id: 'green-tea',
        name: 'Green Tea',
        nameAr: 'شاي أخضر',
        category: 'beverages',
        categoryAr: 'المشروبات',
        servingSize: 240,
        servingUnit: 'مل',
        nutrition: { calories: 2, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 2, cholesterol: 0 },
        allergens: [],
        tags: ['مضاد أكسدة', 'صحي'],
        healthConditions: { diabetes: 'safe', hypertension: 'safe', ibs: 'safe', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'arabic-coffee',
        name: 'Arabic Coffee',
        nameAr: 'قهوة عربية',
        category: 'beverages',
        categoryAr: 'المشروبات',
        servingSize: 60,
        servingUnit: 'مل',
        nutrition: { calories: 5, protein: 0.2, carbs: 1, fat: 0, fiber: 0, sugar: 0, sodium: 2, cholesterol: 0 },
        allergens: [],
        tags: ['تقليدي', 'عربي'],
        healthConditions: { diabetes: 'safe', hypertension: 'caution', ibs: 'caution', celiac: 'safe', lactoseIntolerance: 'safe' }
    },
    {
        id: 'freshOrangeJuice',
        name: 'Fresh Orange Juice',
        nameAr: 'عصير برتقال طازج',
        category: 'beverages',
        categoryAr: 'المشروبات',
        servingSize: 240,
        servingUnit: 'مل',
        nutrition: { calories: 112, protein: 2, carbs: 26, fat: 0.5, fiber: 0.5, sugar: 21, sodium: 2, cholesterol: 0 },
        glycemicIndex: 50,
        allergens: [],
        tags: ['فيتامين C', 'طازج'],
        healthConditions: { diabetes: 'caution', hypertension: 'safe', ibs: 'caution', celiac: 'safe', lactoseIntolerance: 'safe' }
    }
];

// Helper Functions
export const getFoodById = (id: string): FoodItem | undefined => {
    return foodDatabase.find(f => f.id === id);
};

export const getFoodsByCategory = (category: string): FoodItem[] => {
    return foodDatabase.filter(f => f.category === category);
};

export const searchFoods = (query: string): FoodItem[] => {
    const q = query.toLowerCase();
    return foodDatabase.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.nameAr.includes(query) ||
        f.tags.some(t => t.includes(query))
    );
};

export const getSafeFoodsForCondition = (conditionId: string): FoodItem[] => {
    return foodDatabase.filter(f => {
        const status = f.healthConditions[conditionId as keyof typeof f.healthConditions];
        return status === 'safe';
    });
};

export const calculateTotalNutrition = (items: { foodId: string; amount: number }[]): NutritionInfo => {
    const total: NutritionInfo = {
        calories: 0, protein: 0, carbs: 0, fat: 0,
        fiber: 0, sugar: 0, sodium: 0, cholesterol: 0
    };

    items.forEach(item => {
        const food = getFoodById(item.foodId);
        if (food) {
            const multiplier = item.amount / food.servingSize;
            total.calories += food.nutrition.calories * multiplier;
            total.protein += food.nutrition.protein * multiplier;
            total.carbs += food.nutrition.carbs * multiplier;
            total.fat += food.nutrition.fat * multiplier;
            total.fiber += food.nutrition.fiber * multiplier;
            total.sugar += food.nutrition.sugar * multiplier;
            total.sodium += food.nutrition.sodium * multiplier;
            total.cholesterol += food.nutrition.cholesterol * multiplier;
        }
    });

    // Round values
    Object.keys(total).forEach(key => {
        total[key as keyof NutritionInfo] = Math.round(total[key as keyof NutritionInfo] * 10) / 10;
    });

    return total;
};

export const categories = [
    { id: 'all', name: 'الكل', icon: '🍽️' },
    { id: 'grains', name: 'الحبوب', icon: '🌾' },
    { id: 'protein', name: 'البروتين', icon: '🍗' },
    { id: 'legumes', name: 'البقوليات', icon: '🫘' },
    { id: 'vegetables', name: 'الخضروات', icon: '🥬' },
    { id: 'fruits', name: 'الفواكه', icon: '🍎' },
    { id: 'dairy', name: 'الألبان', icon: '🥛' },
    { id: 'nuts', name: 'المكسرات', icon: '🥜' },
    { id: 'dishes', name: 'أطباق', icon: '🍲' },
    { id: 'salads', name: 'سلطات', icon: '🥗' },
    { id: 'beverages', name: 'المشروبات', icon: '☕' },
];
