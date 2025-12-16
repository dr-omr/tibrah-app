// Local product data with product images
// These products display when API returns empty or as fallback

export interface LocalProduct {
    id: string;
    name: string;
    name_en?: string;
    description: string;
    price: number;
    original_price?: number;
    image_url: string;
    category: string;
    featured?: boolean;
    in_stock: boolean;
    rating?: number;
    benefits?: string[];
}

export const localProducts: LocalProduct[] = [
    {
        id: 'dmso-1',
        name: 'DMSO الطبي',
        name_en: 'Medical Grade DMSO',
        description: 'ثنائي ميثيل سلفوكسيد طبي عالي النقاء - يستخدم موضعياً للتخفيف من الألم والالتهابات. مستخلص طبيعي من لب الخشب.',
        price: 150,
        original_price: 180,
        image_url: '/products/dmso.webp',
        category: 'supplements',
        featured: true,
        in_stock: true,
        rating: 4.9,
        benefits: [
            'تخفيف الألم والالتهابات',
            'تحسين امتصاص العلاجات الموضعية',
            'تسريع التئام الجروح'
        ]
    },
    {
        id: 'vit-d3-k2-1',
        name: 'فيتامين D3 + K2',
        name_en: 'Vitamin D3 + K2',
        description: 'تركيبة متوازنة من فيتامين د3 مع ك2 للحصول على أقصى امتصاص وفائدة للعظام والمناعة والصحة العامة.',
        price: 120,
        original_price: 150,
        image_url: '/products/vitd3k2.webp',
        category: 'vitamins',
        featured: true,
        in_stock: true,
        rating: 4.8,
        benefits: [
            'تقوية العظام والأسنان',
            'دعم الجهاز المناعي',
            'تحسين امتصاص الكالسيوم'
        ]
    },
    {
        id: 'magnesium-1',
        name: 'مغنيسيوم سيترات',
        name_en: 'Magnesium Citrate 400mg',
        description: 'مغنيسيوم سيترات عالي الامتصاص - يدعم صحة العضلات والأعصاب والنوم الصحي.',
        price: 95,
        image_url: '/products/magnesium.webp',
        category: 'minerals',
        featured: false,
        in_stock: true,
        rating: 4.7,
        benefits: [
            'استرخاء العضلات',
            'تحسين جودة النوم',
            'دعم صحة القلب'
        ]
    },
    {
        id: 'probiotic-1',
        name: 'بكتيريا نافعة بروبيوتيك',
        name_en: 'Premium Probiotic',
        description: 'مزيج متقدم من البكتيريا النافعة لدعم صحة الجهاز الهضمي والمناعة. يحتوي على 50 مليار وحدة CFU.',
        price: 180,
        original_price: 220,
        image_url: '/products/probiotic.png',
        category: 'gut-health',
        featured: true,
        in_stock: true,
        rating: 4.9,
        benefits: [
            'تحسين الهضم',
            'تقوية المناعة',
            'توازن فلورا الأمعاء'
        ]
    },
    {
        id: 'deodorant-1',
        name: 'مزيل عرق طبيعي UXIRA',
        name_en: 'UXIRA Natural Deodorant',
        description: 'مزيل عرق طبيعي 100% خالي من الألومنيوم والمواد الكيميائية الضارة. فعال لمدة 24 ساعة.',
        price: 85,
        image_url: '/products/deodorant.png',
        category: 'personal-care',
        featured: false,
        in_stock: true,
        rating: 4.6,
        benefits: [
            'خالي من الألومنيوم',
            'حماية طبيعية',
            'مناسب للبشرة الحساسة'
        ]
    }
];

export const productCategories = [
    { id: 'all', name: 'الكل' },
    { id: 'supplements', name: 'مكملات' },
    { id: 'vitamins', name: 'فيتامينات' },
    { id: 'minerals', name: 'معادن' },
    { id: 'gut-health', name: 'صحة الأمعاء' },
    { id: 'personal-care', name: 'العناية الشخصية' }
];
