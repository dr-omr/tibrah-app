// data/recipesData.ts
// Recipe database for the meal planner
import { RecipeData } from '@/components/meal-planner/types';

export const recipesDatabase: RecipeData[] = [
    // ===== وصفات السكري (Diabetes-Friendly) =====
    {
        id: 'grilled-chicken-salad', name: 'Grilled Chicken Salad', nameAr: 'سلطة الدجاج المشوي',
        description: 'سلطة صحية ومشبعة مع صدر دجاج مشوي - مناسبة للسكري', image: '🥗',
        prepTime: 15, cookTime: 20, servings: 2, difficulty: 'easy',
        calories: 350, protein: 35, carbs: 15, fat: 18,
        ingredients: [{ foodId: 'chicken-breast', amount: 200, name: 'صدر دجاج' }, { foodId: 'spinach', amount: 100, name: 'سبانخ' }, { foodId: 'cucumber', amount: 100, name: 'خيار' }],
        instructions: ['تتبيل الدجاج بالملح والفلفل', 'شوي الدجاج حتى ينضج', 'تقطيع الخضروات', 'تقديم السلطة'],
        tags: ['صحي', 'سكري', 'عالي البروتين'], healthConditions: { diabetes: true, hypertension: true, ibs: true }
    },
    {
        id: 'egg-shakshuka-low-carb', name: 'Low Carb Shakshuka', nameAr: 'شكشوكة قليلة الكربوهيدرات',
        description: 'شكشوكة صحية بدون خبز - مثالية لمرضى السكري', image: '🍳',
        prepTime: 10, cookTime: 15, servings: 2, difficulty: 'easy',
        calories: 280, protein: 18, carbs: 12, fat: 18,
        ingredients: [{ foodId: 'eggs', amount: 150, name: '3 بيضات' }, { foodId: 'tomato', amount: 200, name: 'طماطم' }],
        instructions: ['طهي الطماطم مع البهارات', 'عمل فجوات للبيض', 'تغطية حتى ينضج البيض'],
        tags: ['فطور', 'سكري', 'كيتو'], healthConditions: { diabetes: true, hypertension: true, ibs: true }
    },
    {
        id: 'grilled-fish-diabetic', name: 'Grilled Fish Lemon', nameAr: 'سمك مشوي بالليمون',
        description: 'سمك مشوي صحي - مناسب للسكري والضغط', image: '🐟',
        prepTime: 15, cookTime: 20, servings: 2, difficulty: 'easy',
        calories: 250, protein: 35, carbs: 5, fat: 10,
        ingredients: [{ foodId: 'fish-salmon', amount: 250, name: 'سمك فيليه' }, { foodId: 'spinach', amount: 100, name: 'سبانخ' }],
        instructions: ['تتبيل السمك بالليمون والثوم', 'شوي السمك في الفرن 20 دقيقة', 'تقديم مع الخضار'],
        tags: ['سكري', 'ضغط الدم', 'أوميغا 3'], healthConditions: { diabetes: true, hypertension: true, ibs: true }
    },
    // ===== وصفات ضغط الدم (Blood Pressure) =====
    {
        id: 'banana-oatmeal', name: 'Potassium Oatmeal', nameAr: 'شوفان بالموز للضغط',
        description: 'فطور غني بالبوتاسيوم لتنظيم ضغط الدم', image: '🥣',
        prepTime: 5, cookTime: 10, servings: 1, difficulty: 'easy',
        calories: 320, protein: 10, carbs: 50, fat: 8,
        ingredients: [{ foodId: 'oats', amount: 50, name: 'شوفان' }, { foodId: 'banana', amount: 100, name: 'موز' }],
        instructions: ['طهي الشوفان مع الماء', 'إضافة الموز المقطع', 'رش الجوز'],
        tags: ['فطور', 'ضغط الدم', 'بوتاسيوم'], healthConditions: { diabetes: false, hypertension: true, ibs: false }
    },
    {
        id: 'spinach-salmon', name: 'Salmon Spinach', nameAr: 'سلمون مع سبانخ',
        description: 'وجبة غنية بأوميغا 3 للقلب', image: '🥬',
        prepTime: 15, cookTime: 20, servings: 2, difficulty: 'medium',
        calories: 380, protein: 35, carbs: 8, fat: 22,
        ingredients: [{ foodId: 'fish-salmon', amount: 200, name: 'سلمون' }, { foodId: 'spinach', amount: 150, name: 'سبانخ' }],
        instructions: ['شوي السلمون مع الأعشاب', 'قلي السبانخ بزيت الزيتون', 'تقديم السلمون فوق السبانخ'],
        tags: ['ضغط الدم', 'أوميغا 3', 'صحي للقلب'], healthConditions: { diabetes: true, hypertension: true, ibs: true }
    },
    // ===== وصفات القولون العصبي (IBS) =====
    {
        id: 'rice-chicken-ibs', name: 'Simple Chicken Rice', nameAr: 'أرز بالدجاج للقولون',
        description: 'وجبة لطيفة على المعدة والقولون', image: '🍚',
        prepTime: 15, cookTime: 30, servings: 2, difficulty: 'easy',
        calories: 400, protein: 30, carbs: 45, fat: 10,
        ingredients: [{ foodId: 'rice-white', amount: 150, name: 'أرز أبيض' }, { foodId: 'chicken-breast', amount: 200, name: 'صدر دجاج' }],
        instructions: ['سلق الدجاج', 'طهي الأرز في مرق الدجاج', 'تقديم الدجاج فوق الأرز'],
        tags: ['قولون', 'لطيف على المعدة'], healthConditions: { diabetes: false, hypertension: true, ibs: true }
    },
    {
        id: 'banana-smoothie-ibs', name: 'Gentle Banana Smoothie', nameAr: 'سموذي الموز للقولون',
        description: 'مشروب مهدئ للقولون العصبي', image: '🍌',
        prepTime: 5, cookTime: 0, servings: 1, difficulty: 'easy',
        calories: 180, protein: 3, carbs: 40, fat: 2,
        ingredients: [{ foodId: 'banana', amount: 150, name: 'موز ناضج' }],
        instructions: ['خلط الموز مع الماء', 'الخلط حتى يصبح ناعماً'],
        tags: ['قولون', 'مشروبات', 'مهدئ'], healthConditions: { diabetes: false, hypertension: true, ibs: true }
    },
    // ===== الأطباق اليمنية =====
    {
        id: 'yemeni-saltah', name: 'Yemeni Saltah', nameAr: 'السلتة اليمنية',
        description: 'الطبق الوطني اليمني - شوربة غنية بالخضار واللحم', image: '🍲',
        prepTime: 30, cookTime: 45, servings: 4, difficulty: 'medium',
        calories: 420, protein: 25, carbs: 35, fat: 20,
        ingredients: [{ foodId: 'lamb', amount: 300, name: 'لحم ضأن' }, { foodId: 'tomato', amount: 150, name: 'طماطم' }],
        instructions: ['طهي اللحم مع البهارات اليمنية', 'إضافة الخضار', 'طهي الحلبة', 'تقديمها ساخنة'],
        tags: ['يمني', 'تقليدي', 'وجبة رئيسية'], healthConditions: { diabetes: false, hypertension: false, ibs: false }
    },
    {
        id: 'yemeni-mandi-light', name: 'Light Yemeni Mandi', nameAr: 'مندي يمني خفيف',
        description: 'مندي صحي بالأرز البني', image: '🍖',
        prepTime: 30, cookTime: 60, servings: 4, difficulty: 'hard',
        calories: 450, protein: 35, carbs: 40, fat: 18,
        ingredients: [{ foodId: 'chicken-breast', amount: 400, name: 'دجاج' }, { foodId: 'rice-brown', amount: 200, name: 'أرز بني' }],
        instructions: ['تتبيل الدجاج ببهارات المندي', 'شوي الدجاج على نار هادئة', 'طهي الأرز البني'],
        tags: ['يمني', 'حبوب كاملة', 'صحي'], healthConditions: { diabetes: true, hypertension: false, ibs: true }
    },
    {
        id: 'yemeni-fahsa', name: 'Yemeni Fahsa', nameAr: 'الفحسة اليمنية',
        description: 'طبق يمني من اللحم المفروم مع الحلبة', image: '🥘',
        prepTime: 20, cookTime: 30, servings: 3, difficulty: 'medium',
        calories: 380, protein: 28, carbs: 15, fat: 24,
        ingredients: [{ foodId: 'lamb', amount: 250, name: 'لحم مفروم' }, { foodId: 'tomato', amount: 100, name: 'طماطم' }],
        instructions: ['طهي اللحم المفروم', 'إضافة الطماطم', 'تحضير الحلبة', 'إضافتها فوق اللحم'],
        tags: ['يمني', 'تقليدي', 'عالي البروتين'], healthConditions: { diabetes: true, hypertension: false, ibs: false }
    },
    {
        id: 'yemeni-aseed', name: 'Yemeni Aseed', nameAr: 'العصيد اليمني',
        description: 'طبق يمني صحي من الدقيق والعسل', image: '🍯',
        prepTime: 10, cookTime: 20, servings: 4, difficulty: 'easy',
        calories: 350, protein: 8, carbs: 55, fat: 12,
        ingredients: [{ foodId: 'bread-whole', amount: 200, name: 'دقيق قمح' }],
        instructions: ['خلط الدقيق مع الماء', 'التحريك على النار', 'صب السمن والعسل'],
        tags: ['يمني', 'تقليدي', 'طاقة'], healthConditions: { diabetes: false, hypertension: true, ibs: false }
    },
    {
        id: 'yemeni-zurbian', name: 'Yemeni Zurbian', nameAr: 'الزربيان اليمني',
        description: 'أرز مبهر مع الزبيب واللحم', image: '🍛',
        prepTime: 25, cookTime: 50, servings: 5, difficulty: 'medium',
        calories: 520, protein: 28, carbs: 58, fat: 20,
        ingredients: [{ foodId: 'lamb', amount: 350, name: 'لحم' }, { foodId: 'rice-white', amount: 300, name: 'أرز' }],
        instructions: ['طهي اللحم مع البهارات', 'إضافة الأرز والزبيب', 'الطهي حتى ينضج'],
        tags: ['يمني', 'أعراس', 'مناسبات'], healthConditions: { diabetes: false, hypertension: false, ibs: true }
    },
    // ===== الأطباق السعودية والخليجية =====
    {
        id: 'saudi-kabsa', name: 'Saudi Kabsa', nameAr: 'الكبسة السعودية',
        description: 'الطبق الوطني السعودي', image: '🍛',
        prepTime: 30, cookTime: 60, servings: 6, difficulty: 'medium',
        calories: 550, protein: 32, carbs: 60, fat: 20,
        ingredients: [{ foodId: 'rice-white', amount: 400, name: 'أرز بسمتي' }, { foodId: 'chicken-breast', amount: 500, name: 'دجاج' }],
        instructions: ['تتبيل الدجاج', 'قلي الدجاج حتى يتحمر', 'وضع الأرز وتركه ينضج'],
        tags: ['سعودي', 'خليجي', 'وجبة رئيسية'], healthConditions: { diabetes: false, hypertension: false, ibs: true }
    },
    {
        id: 'saudi-kabsa-healthy', name: 'Healthy Kabsa', nameAr: 'كبسة صحية',
        description: 'كبسة بالأرز البني - للسكري والضغط', image: '🍛',
        prepTime: 30, cookTime: 50, servings: 4, difficulty: 'medium',
        calories: 420, protein: 35, carbs: 45, fat: 12,
        ingredients: [{ foodId: 'rice-brown', amount: 250, name: 'أرز بني' }, { foodId: 'chicken-breast', amount: 400, name: 'صدر دجاج' }],
        instructions: ['شوي صدر الدجاج', 'طهي الأرز البني', 'تقديم الدجاج فوق الأرز'],
        tags: ['سكري', 'ضغط الدم', 'خليجي صحي'], healthConditions: { diabetes: true, hypertension: true, ibs: true }
    },
    {
        id: 'kuwaiti-machboos', name: 'Kuwaiti Machboos', nameAr: 'المجبوس الكويتي',
        description: 'أرز كويتي مبهر مع اللحم', image: '🍚',
        prepTime: 25, cookTime: 50, servings: 5, difficulty: 'medium',
        calories: 520, protein: 28, carbs: 55, fat: 22,
        ingredients: [{ foodId: 'rice-white', amount: 350, name: 'أرز' }, { foodId: 'lamb', amount: 400, name: 'لحم' }],
        instructions: ['طهي اللحم مع البهارات', 'وضع الأرز والطهي', 'تزيين بالمكسرات'],
        tags: ['كويتي', 'خليجي', 'وجبة رئيسية'], healthConditions: { diabetes: false, hypertension: false, ibs: true }
    },
    {
        id: 'emirati-harees', name: 'Emirati Harees', nameAr: 'الهريس الإماراتي',
        description: 'طبق إماراتي من القمح واللحم', image: '🥣',
        prepTime: 20, cookTime: 120, servings: 6, difficulty: 'hard',
        calories: 380, protein: 22, carbs: 45, fat: 12,
        ingredients: [{ foodId: 'lamb', amount: 400, name: 'لحم ضأن' }],
        instructions: ['نقع القمح ليلة', 'طهي اللحم', 'إضافة القمح', 'خلط المزيج'],
        tags: ['إماراتي', 'رمضان', 'تقليدي'], healthConditions: { diabetes: false, hypertension: false, ibs: false }
    },
    {
        id: 'bahraini-machboos-samak', name: 'Fish Machboos', nameAr: 'مجبوس السمك البحريني',
        description: 'مجبوس بالسمك على الطريقة البحرينية', image: '🐟',
        prepTime: 20, cookTime: 40, servings: 4, difficulty: 'medium',
        calories: 450, protein: 30, carbs: 50, fat: 15,
        ingredients: [{ foodId: 'fish-salmon', amount: 400, name: 'سمك' }, { foodId: 'rice-white', amount: 300, name: 'أرز' }],
        instructions: ['قلي السمك', 'طهي الأرز مع البهارات', 'تقديم السمك فوق الأرز'],
        tags: ['بحريني', 'خليجي', 'بحري'], healthConditions: { diabetes: false, hypertension: false, ibs: true }
    },
    // ===== الأطباق العربية الشعبية =====
    {
        id: 'lentil-soup', name: 'Lentil Soup', nameAr: 'شوربة العدس',
        description: 'شوربة عدس تقليدية غنية بالحديد', image: '🥘',
        prepTime: 10, cookTime: 30, servings: 4, difficulty: 'easy',
        calories: 220, protein: 14, carbs: 35, fat: 4,
        ingredients: [{ foodId: 'lentils', amount: 200, name: 'عدس' }, { foodId: 'carrot', amount: 100, name: 'جزر' }],
        instructions: ['غسل العدس', 'طهي مع الخضار', 'خلط بالخلاط'],
        tags: ['شوربة', 'نباتي', 'صحي'], healthConditions: { diabetes: true, hypertension: true, ibs: false }
    },
    {
        id: 'fattoush-salad', name: 'Fattoush', nameAr: 'سلطة الفتوش',
        description: 'سلطة لبنانية منعشة', image: '🥗',
        prepTime: 15, cookTime: 5, servings: 4, difficulty: 'easy',
        calories: 180, protein: 5, carbs: 22, fat: 9,
        ingredients: [{ foodId: 'cucumber', amount: 150, name: 'خيار' }, { foodId: 'tomato', amount: 150, name: 'طماطم' }],
        instructions: ['تقطيع الخضار', 'تحميص الخبز', 'خلط مع الصلصة'],
        tags: ['سلطة', 'لبناني', 'خفيف'], healthConditions: { diabetes: true, hypertension: true, ibs: false }
    },
    {
        id: 'tabbouleh', name: 'Tabbouleh', nameAr: 'التبولة',
        description: 'سلطة بقدونس لبنانية', image: '🥬',
        prepTime: 20, cookTime: 0, servings: 4, difficulty: 'easy',
        calories: 120, protein: 4, carbs: 18, fat: 5,
        ingredients: [{ foodId: 'tomato', amount: 200, name: 'طماطم' }, { foodId: 'cucumber', amount: 100, name: 'خيار' }],
        instructions: ['فرم البقدونس', 'تقطيع الخضار', 'خلط مع الليمون'],
        tags: ['سلطة', 'لبناني', 'نباتي'], healthConditions: { diabetes: true, hypertension: true, ibs: false }
    },
    {
        id: 'foul-medames', name: 'Foul Medames', nameAr: 'الفول المدمس',
        description: 'فطور مصري غني بالبروتين', image: '🫘',
        prepTime: 10, cookTime: 15, servings: 4, difficulty: 'easy',
        calories: 280, protein: 16, carbs: 40, fat: 8,
        ingredients: [{ foodId: 'lentils', amount: 300, name: 'فول' }],
        instructions: ['تسخين الفول', 'إضافة الثوم والليمون', 'رش زيت الزيتون'],
        tags: ['فطور', 'مصري', 'بروتين نباتي'], healthConditions: { diabetes: true, hypertension: true, ibs: false }
    },
    {
        id: 'grilled-kofta', name: 'Grilled Kofta', nameAr: 'كفتة مشوية',
        description: 'كفتة لحم مشوية صحية', image: '🍢',
        prepTime: 20, cookTime: 15, servings: 4, difficulty: 'easy',
        calories: 320, protein: 28, carbs: 8, fat: 20,
        ingredients: [{ foodId: 'beef', amount: 400, name: 'لحم مفروم' }],
        instructions: ['خلط اللحم مع البهارات', 'تشكيل الكفتة', 'شوي على الفحم'],
        tags: ['شواء', 'عالي البروتين', 'عربي'], healthConditions: { diabetes: true, hypertension: false, ibs: true }
    },
    {
        id: 'chicken-shawarma-bowl', name: 'Shawarma Bowl', nameAr: 'بول شاورما',
        description: 'شاورما دجاج صحية بدون خبز', image: '🥗',
        prepTime: 20, cookTime: 20, servings: 2, difficulty: 'medium',
        calories: 380, protein: 35, carbs: 20, fat: 18,
        ingredients: [{ foodId: 'chicken-breast', amount: 300, name: 'صدر دجاج' }, { foodId: 'tomato', amount: 100, name: 'طماطم' }],
        instructions: ['تتبيل الدجاج', 'شوي وتقطيع', 'تقديم مع السلطة'],
        tags: ['سكري', 'عالي البروتين', 'قليل الكربوهيدرات'], healthConditions: { diabetes: true, hypertension: true, ibs: true }
    },
    {
        id: 'stuffed-vine-leaves', name: 'Stuffed Vine Leaves', nameAr: 'ورق العنب',
        description: 'ورق عنب محشي بالأرز', image: '🥬',
        prepTime: 60, cookTime: 45, servings: 6, difficulty: 'hard',
        calories: 220, protein: 6, carbs: 35, fat: 8,
        ingredients: [{ foodId: 'rice-white', amount: 200, name: 'أرز' }],
        instructions: ['تحضير الحشوة', 'لف ورق العنب', 'الطهي على نار هادئة'],
        tags: ['شامي', 'نباتي', 'تقليدي'], healthConditions: { diabetes: false, hypertension: true, ibs: false }
    },
    {
        id: 'molokhia', name: 'Molokhia', nameAr: 'الملوخية',
        description: 'ملوخية مصرية مع الأرز', image: '🥬',
        prepTime: 15, cookTime: 30, servings: 4, difficulty: 'medium',
        calories: 280, protein: 18, carbs: 25, fat: 12,
        ingredients: [{ foodId: 'chicken-breast', amount: 300, name: 'دجاج' }, { foodId: 'rice-white', amount: 200, name: 'أرز' }],
        instructions: ['سلق الدجاج', 'تحضير الملوخية', 'تقديم مع الأرز'],
        tags: ['مصري', 'تقليدي', 'وجبة رئيسية'], healthConditions: { diabetes: false, hypertension: true, ibs: true }
    },
    {
        id: 'koshari', name: 'Koshari', nameAr: 'الكشري المصري',
        description: 'طبق مصري شعبي من الأرز والمكرونة والعدس', image: '🍝',
        prepTime: 20, cookTime: 40, servings: 6, difficulty: 'medium',
        calories: 450, protein: 15, carbs: 75, fat: 10,
        ingredients: [{ foodId: 'rice-white', amount: 200, name: 'أرز' }, { foodId: 'lentils', amount: 150, name: 'عدس' }],
        instructions: ['طهي الأرز والمكرونة والعدس', 'تحضير صلصة الطماطم', 'قلي البصل', 'تجميع الطبق'],
        tags: ['مصري', 'نباتي', 'شعبي'], healthConditions: { diabetes: false, hypertension: false, ibs: false }
    },
];
