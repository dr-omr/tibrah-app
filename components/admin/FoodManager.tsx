// components/admin/FoodManager.tsx
// ادارة الأطعمة في نظام تخطيط الوجبات

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Plus, Search, Edit3, Trash2, Save, X, Filter,
    Utensils, Apple, Beef, Wheat, Droplets, Heart,
    AlertTriangle, Check, ChevronDown, ChevronUp, Download, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { foodDatabase as defaultFoods } from '@/lib/mealDatabase';

// Types
interface NutritionInfo {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol: number;
}

interface FoodItem {
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
    healthConditions: {
        diabetes: 'safe' | 'caution' | 'avoid';
        hypertension: 'safe' | 'caution' | 'avoid';
        ibs: 'safe' | 'caution' | 'avoid';
        celiac: 'safe' | 'caution' | 'avoid';
        lactoseIntolerance: 'safe' | 'caution' | 'avoid';
    };
}

// Categories
const CATEGORIES = [
    { id: 'all', name: 'الكل', icon: '🍽️' },
    { id: 'grains', name: 'الحبوب والمكرونات', icon: '🌾' },
    { id: 'protein', name: 'البروتين', icon: '🍗' },
    { id: 'legumes', name: 'البقوليات', icon: '🫘' },
    { id: 'vegetables', name: 'الخضروات', icon: '🥬' },
    { id: 'fruits', name: 'الفواكه', icon: '🍎' },
    { id: 'dairy', name: 'الألبان والأجبان', icon: '🥛' },
    { id: 'nuts', name: 'المكسرات', icon: '🥜' },
    { id: 'oils', name: 'الزيوت', icon: '🫒' },
    { id: 'dishes', name: 'أطباق', icon: '🍲' },
    { id: 'salads', name: 'سلطات', icon: '🥗' },
    { id: 'beverages', name: 'المشروبات', icon: '☕' },
];

// Individual food icons
const FOOD_ICONS: Record<string, string> = {
    // Fruits
    'apple': '🍎', 'banana': '🍌', 'dates': '🌴', 'orange': '🍊', 'grapes': '🍇',
    'watermelon': '🍉', 'strawberry': '🍓', 'mango': '🥭', 'pineapple': '🍍',
    'pomegranate': '❤️', 'figs': '🟤', 'guava': '🟢', 'peach': '🍑', 'pear': '🍐',
    'kiwi': '🥝', 'avocado': '🥑', 'melon': '🍈', 'papaya': '🧡', 'lemon': '🍋',
    'cherry': '🍒', 'coconut': '🥥', 'blueberry': '🫐',
    // Vegetables
    'cucumber': '🥒', 'tomato': '🍅', 'spinach': '🥬', 'broccoli': '🥦', 'carrot': '🥕',
    'onion': '🧅', 'bell-pepper': '🫑', 'zucchini': '🥒', 'eggplant': '🍆', 'cabbage': '🥬',
    'lettuce': '🥗', 'green-beans': '🫛', 'peas': '🫛', 'potato': '🥔', 'sweet-potato': '🍠',
    'mushroom': '🍄', 'garlic': '🧄', 'ginger': '🫚', 'parsley': '🌿', 'cauliflower': '🥦',
    'okra': '🟢', 'corn': '🌽', 'pepper': '🌶️', 'chili': '🌶️',
    // Grains & Pasta
    'rice': '🍚', 'bread': '🍞', 'pasta': '🍝', 'oats': '🥣', 'wheat': '🌾',
    'spaghetti': '🍝', 'penne': '🍝', 'fusilli': '🍝', 'macaroni': '🍝', 'lasagna': '🍝',
    'fettuccine': '🍝', 'orzo': '🍝', 'whole-wheat-pasta': '🍝', 'vermicelli': '🍝',
    // Protein
    'chicken': '🍗', 'beef': '🥩', 'fish': '🐟', 'eggs': '🥚', 'shrimp': '🦐',
    'lamb': '🍖', 'tuna': '🐟', 'salmon': '🍣', 'turkey': '🦃',
    // Dairy
    'milk': '🥛', 'yogurt': '🥛', 'cheese-white': '🧀', 'milk-lowfat': '🥛',
    'milk-skimmed': '🥛', 'cream': '🍦', 'cheese-mozzarella': '🧀', 'cheese-cheddar': '🧀',
    'cheese-feta': '🧀', 'cheese-cream': '🧀', 'labneh': '🥛', 'butter': '🧈',
    'greek-yogurt': '🥛', 'cheese-halloumi': '🧀', 'cheese-parmesan': '🧀',
    // Legumes
    'lentils': '🫘', 'chickpeas': '🫘', 'beans': '🫘', 'fava-beans': '🫘',
    'kidney-beans': '🫛', 'black-beans': '🫘', 'mung-beans': '🫘', 'white-beans': '🫘',
    // Nuts
    'almonds': '🌰', 'walnuts': '🌰', 'cashews': '🥜', 'pistachios': '🥜',
    'peanuts': '🥜', 'hazelnuts': '🌰',
    // Oils
    'olive-oil': '🫒', 'sesame-oil': '🫒', 'coconut-oil': '🥥', 'sunflower-oil': '🌻',
    'corn-oil': '🌽', 'flaxseed-oil': '🫒', 'avocado-oil': '🥑', 'ghee': '🧈',
    'black-seed-oil': '🖤', 'castor-oil': '🫒', 'peanut-oil': '🥜',
};

// Helper function to get food icon
const getFoodIcon = (foodId: string, category: string): string => {
    if (FOOD_ICONS[foodId]) return FOOD_ICONS[foodId];
    return CATEGORIES.find(c => c.id === category)?.icon || '🍽️';
};

const ALLERGENS = ['gluten', 'milk', 'eggs', 'fish', 'tree nuts', 'peanuts', 'sesame', 'soy'];

const HEALTH_STATUS = ['safe', 'caution', 'avoid'] as const;

// Empty food template
const EMPTY_FOOD: Omit<FoodItem, 'id'> = {
    name: '',
    nameAr: '',
    category: 'vegetables',
    categoryAr: 'الخضروات',
    servingSize: 100,
    servingUnit: 'غرام',
    nutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        cholesterol: 0
    },
    glycemicIndex: undefined,
    allergens: [],
    tags: [],
    healthConditions: {
        diabetes: 'safe',
        hypertension: 'safe',
        ibs: 'safe',
        celiac: 'safe',
        lactoseIntolerance: 'safe'
    }
};

interface FoodManagerProps {
    initialFoods?: FoodItem[];
    onSave?: (foods: FoodItem[]) => void;
}

export default function FoodManager({ initialFoods = [], onSave }: FoodManagerProps) {
    // State
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showEditor, setShowEditor] = useState(false);
    const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        nutrition: true,
        health: false,
        allergens: false
    });

    // Load from mealDatabase + Firebase on mount
    React.useEffect(() => {
        const loadFoods = async () => {
            setLoading(true);

            // Load the default database
            const dbFoods = defaultFoods as FoodItem[];

            // Load custom foods from Firebase
            let customFoods: FoodItem[] = [];
            try {
                const { db } = await import('@/lib/db');
                const firebaseFoods = await db.foods.list();
                customFoods = firebaseFoods as unknown as FoodItem[];
            } catch (e) {
                console.error('Failed to load foods from Firebase:', e);
                // Fallback to localStorage
                const savedCustom = localStorage.getItem('admin_custom_foods');
                if (savedCustom) {
                    try {
                        customFoods = JSON.parse(savedCustom);
                    } catch { }
                }
            }

            // Merge: default foods + custom foods
            const allFoods = [...dbFoods, ...customFoods];
            setFoods(allFoods);
            setLoading(false);
        };

        loadFoods();
    }, []);

    // Filter foods
    const filteredFoods = useMemo(() => {
        return foods.filter(food => {
            const matchesSearch = food.nameAr.includes(searchQuery) ||
                food.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [foods, searchQuery, selectedCategory]);

    // Handlers
    const handleAddNew = () => {
        const newFood: FoodItem = {
            ...EMPTY_FOOD,
            id: `custom_${Date.now()}`
        };
        setEditingFood(newFood);
        setIsNew(true);
        setShowEditor(true);
    };

    const handleEdit = (food: FoodItem) => {
        setEditingFood({ ...food });
        setIsNew(false);
        setShowEditor(true);
    };

    const handleDelete = async (id: string) => {
        // Check if default
        if (defaultFoods.some(f => f.id === id)) {
            toast.error('لا يمكن حذف الأطعمة الافتراضية');
            return;
        }

        if (confirm('هل أنت متأكد من حذف هذا الطعام؟')) {
            const updated = foods.filter(f => f.id !== id);
            setFoods(updated);

            // Delete from Firebase
            try {
                const { db } = await import('@/lib/db');
                await db.foods.delete(id);
            } catch (e) {
                console.error('Firebase delete failed:', e);
            }

            // Sync localStorage (backup)
            const custom = updated.filter(f => !defaultFoods.some(d => d.id === f.id));
            localStorage.setItem('admin_custom_foods', JSON.stringify(custom));

            toast.success('تم حذف الطعام');
        }
    };

    const handleSave = async () => {
        if (!editingFood) return;

        if (!editingFood.nameAr || !editingFood.name) {
            toast.error('يرجى إدخال اسم الطعام');
            return;
        }

        let updatedItem = { ...editingFood };
        let operationSuccess = false;

        // 1. Try Firebase Operation
        try {
            const { db } = await import('@/lib/db');

            if (isNew) {
                // Create new
                // Remove the temporary 'custom_' ID to let Firebase generate one
                const { id, ...data } = editingFood;
                const created = await db.foods.create(data as any);
                updatedItem = created as unknown as FoodItem;
                operationSuccess = true;
                toast.success('تمت إضافة الطعام للسحابة ☁️✅');
            } else {
                // Update existing
                // Check if it's a default food (simple ID) or Firebase/Custom food
                // We assume complex IDs are Firebase/Custom. Default IDs are simple (apple, banana)
                const isDefault = !editingFood.id.includes('_') && editingFood.id.length < 15;

                if (isDefault) {
                    toast.error('لا يمكن تعديل الأطعمة الافتراضية في السحابة حالياً. أضف طعاماً جديداً بدلاً من ذلك.');
                    return;
                }

                await db.foods.update(editingFood.id, editingFood as any);
                operationSuccess = true;
                toast.success('تم تحديث الطعام في السحابة ☁️✅');
            }
        } catch (e) {
            console.error('Firebase operation failed:', e);
            toast.warning('فشل الاتصال بالسحابة. تم الحفظ محلياً فقط 💾');
        }

        // 2. Update Local State & LocalStorage (Fallback/Cache)
        let updatedList: FoodItem[];
        if (isNew && operationSuccess) {
            // If new and success, adding with NEW ID
            updatedList = [...foods, updatedItem];
        } else if (isNew && !operationSuccess) {
            // New but failed -> Keep custom_ ID and add
            updatedList = [...foods, updatedItem];
        } else {
            // Update existing
            updatedList = foods.map(f => f.id === updatedItem.id ? updatedItem : f);
        }

        setFoods(updatedList);

        // Always sync custom/firebase items to localStorage as backup
        const customFoods = updatedList.filter(f => f.id.length > 15 || f.id.startsWith('custom_'));
        localStorage.setItem('admin_custom_foods', JSON.stringify(customFoods));

        setShowEditor(false);
        setEditingFood(null);
        onSave?.(updatedList);
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const updateEditingFood = (path: string, value: any) => {
        if (!editingFood) return;

        const keys = path.split('.');
        const updated = { ...editingFood };
        let current: any = updated;

        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;

        setEditingFood(updated);
    };

    const toggleAllergen = (allergen: string) => {
        if (!editingFood) return;
        const allergens = editingFood.allergens.includes(allergen)
            ? editingFood.allergens.filter(a => a !== allergen)
            : [...editingFood.allergens, allergen];
        updateEditingFood('allergens', allergens);
    };

    const addTag = (tag: string) => {
        if (!editingFood || !tag.trim()) return;
        if (!editingFood.tags.includes(tag.trim())) {
            updateEditingFood('tags', [...editingFood.tags, tag.trim()]);
        }
    };

    const removeTag = (tag: string) => {
        if (!editingFood) return;
        updateEditingFood('tags', editingFood.tags.filter(t => t !== tag));
    };

    // Export custom foods as code
    const exportFoods = () => {
        const customFoods = foods.filter(f => f.id.startsWith('custom_'));
        if (customFoods.length === 0) {
            toast.info('لا توجد أطعمة مخصصة للتصدير');
            return;
        }
        const code = JSON.stringify(customFoods, null, 2);
        navigator.clipboard.writeText(code);
        toast.success(`تم نسخ ${customFoods.length} طعام للحافظة! الصقه في mealDatabase.ts`);
    };

    // Section Header Component
    const SectionHeader = ({ title, section }: { title: string; section: keyof typeof expandedSections }) => (
        <button
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg mb-3"
        >
            <span className="font-bold text-slate-700 dark:text-white">{title}</span>
            {expandedSections[section] ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
            ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
            )}
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة الأطعمة 🍽️</h2>
                    <p className="text-slate-500 text-sm">إضافة وتعديل الأطعمة في قاعدة البيانات</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={exportFoods} variant="outline" className="border-blue-500 text-blue-500">
                        📋 تصدير الأطعمة المخصصة
                    </Button>
                    <Button onClick={handleAddNew} className="bg-emerald-500 hover:bg-emerald-600">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة طعام جديد
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-emerald-600">{foods.length}</div>
                    <div className="text-slate-500 text-sm">إجمالي الأطعمة</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-blue-600">
                        {CATEGORIES.length - 1}
                    </div>
                    <div className="text-slate-500 text-sm">التصنيفات</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-amber-600">
                        {foods.filter(f => f.id.startsWith('custom_')).length}
                    </div>
                    <div className="text-slate-500 text-sm">أطعمة مخصصة</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-purple-600">
                        {filteredFoods.length}
                    </div>
                    <div className="text-slate-500 text-sm">نتائج البحث</div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن طعام..."
                        className="pr-10 h-12 rounded-xl"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                >
                    {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Foods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {filteredFoods.map((food, index) => (
                        <motion.div
                            key={food.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.03 }}
                            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {getFoodIcon(food.id, food.category)}
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white">{food.nameAr}</h3>
                                        <p className="text-xs text-slate-400">{food.name}</p>
                                    </div>
                                </div>
                                {food.id.startsWith('custom_') && (
                                    <Badge className="bg-purple-100 text-purple-600 text-xs">مخصص</Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                                    <div className="text-sm font-bold text-amber-600">{food.nutrition.calories}</div>
                                    <div className="text-[10px] text-slate-400">سعرة</div>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                                    <div className="text-sm font-bold text-red-600">{food.nutrition.protein}غ</div>
                                    <div className="text-[10px] text-slate-400">بروتين</div>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                                    <div className="text-sm font-bold text-purple-600">{food.nutrition.carbs}غ</div>
                                    <div className="text-[10px] text-slate-400">كربو</div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                                    <div className="text-sm font-bold text-blue-600">{food.nutrition.fat}غ</div>
                                    <div className="text-[10px] text-slate-400">دهون</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">
                                    {food.servingSize} {food.servingUnit}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEdit(food)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Edit3 className="w-4 h-4 text-blue-500" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(food.id)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredFoods.length === 0 && (
                <div className="text-center py-12">
                    <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">لا توجد أطعمة مطابقة للبحث</p>
                </div>
            )}

            {/* Editor Sheet */}
            <Sheet open={showEditor} onOpenChange={setShowEditor}>
                <SheetContent side="left" className="w-full md:w-[500px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-right">
                            {isNew ? '➕ إضافة طعام جديد' : '✏️ تعديل الطعام'}
                        </SheetTitle>
                    </SheetHeader>

                    {editingFood && (
                        <div className="py-6 space-y-4">
                            {/* Basic Info */}
                            <SectionHeader title="المعلومات الأساسية" section="basic" />
                            {expandedSections.basic && (
                                <div className="space-y-4 mb-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-slate-500 mb-1 block">الاسم بالعربي *</label>
                                            <Input
                                                value={editingFood.nameAr}
                                                onChange={(e) => updateEditingFood('nameAr', e.target.value)}
                                                placeholder="تفاح"
                                                className="h-10"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 mb-1 block">الاسم بالإنجليزي</label>
                                            <Input
                                                value={editingFood.name}
                                                onChange={(e) => updateEditingFood('name', e.target.value)}
                                                placeholder="Apple"
                                                className="h-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-slate-500 mb-1 block">التصنيف</label>
                                            <select
                                                value={editingFood.category}
                                                onChange={(e) => {
                                                    const cat = CATEGORIES.find(c => c.id === e.target.value);
                                                    if (cat) {
                                                        setEditingFood(prev => prev ? {
                                                            ...prev,
                                                            category: e.target.value,
                                                            categoryAr: cat.name
                                                        } : null);
                                                    }
                                                }}
                                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white"
                                            >
                                                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.icon} {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 mb-1 block">حجم الحصة</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={editingFood.servingSize}
                                                    onChange={(e) => setEditingFood(prev => prev ? {
                                                        ...prev,
                                                        servingSize: parseInt(e.target.value) || 0
                                                    } : null)}
                                                    className="h-10 w-24 text-center"
                                                    placeholder="100"
                                                />
                                                <Input
                                                    value={editingFood.servingUnit}
                                                    onChange={(e) => setEditingFood(prev => prev ? {
                                                        ...prev,
                                                        servingUnit: e.target.value
                                                    } : null)}
                                                    placeholder="غرام"
                                                    className="h-10 flex-1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-500 mb-1 block">المؤشر الجلايسيمي (اختياري)</label>
                                        <Input
                                            type="number"
                                            value={editingFood.glycemicIndex || ''}
                                            onChange={(e) => updateEditingFood('glycemicIndex', e.target.value ? parseInt(e.target.value) : undefined)}
                                            placeholder="35"
                                            className="h-10"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Nutrition */}
                            <SectionHeader title="القيم الغذائية" section="nutrition" />
                            {expandedSections.nutrition && (
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {[
                                        { key: 'calories', label: 'السعرات', icon: '🔥' },
                                        { key: 'protein', label: 'البروتين (غ)', icon: '🥩' },
                                        { key: 'carbs', label: 'الكربوهيدرات (غ)', icon: '🍞' },
                                        { key: 'fat', label: 'الدهون (غ)', icon: '🧈' },
                                        { key: 'fiber', label: 'الألياف (غ)', icon: '🌾' },
                                        { key: 'sugar', label: 'السكر (غ)', icon: '🍬' },
                                        { key: 'sodium', label: 'الصوديوم (مغ)', icon: '🧂' },
                                        { key: 'cholesterol', label: 'الكوليسترول (مغ)', icon: '❤️' },
                                    ].map(item => (
                                        <div key={item.key}>
                                            <label className="text-xs text-slate-500 mb-1 block">
                                                {item.icon} {item.label}
                                            </label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={editingFood.nutrition[item.key as keyof NutritionInfo]}
                                                onChange={(e) => updateEditingFood(`nutrition.${item.key}`, parseFloat(e.target.value) || 0)}
                                                className="h-9"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Health Conditions */}
                            <SectionHeader title="الحالات الصحية" section="health" />
                            {expandedSections.health && (
                                <div className="space-y-3 mb-6">
                                    {[
                                        { key: 'diabetes', label: 'السكري', icon: '💉' },
                                        { key: 'hypertension', label: 'ضغط الدم', icon: '❤️' },
                                        { key: 'ibs', label: 'القولون العصبي', icon: '🫃' },
                                        { key: 'celiac', label: 'حساسية الغلوتين', icon: '🌾' },
                                        { key: 'lactoseIntolerance', label: 'حساسية اللاكتوز', icon: '🥛' },
                                    ].map(condition => (
                                        <div key={condition.key} className="flex items-center justify-between">
                                            <span className="text-sm">
                                                {condition.icon} {condition.label}
                                            </span>
                                            <div className="flex gap-1">
                                                {HEALTH_STATUS.map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => updateEditingFood(`healthConditions.${condition.key}`, status)}
                                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${editingFood.healthConditions[condition.key as keyof typeof editingFood.healthConditions] === status
                                                            ? status === 'safe'
                                                                ? 'bg-green-500 text-white'
                                                                : status === 'caution'
                                                                    ? 'bg-amber-500 text-white'
                                                                    : 'bg-red-500 text-white'
                                                            : 'bg-slate-100 text-slate-500'
                                                            }`}
                                                    >
                                                        {status === 'safe' ? 'آمن' : status === 'caution' ? 'احذر' : 'تجنب'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Allergens */}
                            <SectionHeader title="المواد المسببة للحساسية" section="allergens" />
                            {expandedSections.allergens && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {ALLERGENS.map(allergen => (
                                        <button
                                            key={allergen}
                                            onClick={() => toggleAllergen(allergen)}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${editingFood.allergens.includes(allergen)
                                                ? 'bg-red-500 text-white'
                                                : 'bg-slate-100 text-slate-600'
                                                }`}
                                        >
                                            {allergen}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Tags */}
                            <div>
                                <label className="text-sm text-slate-500 mb-2 block">الوسوم</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {editingFood.tags.map(tag => (
                                        <Badge
                                            key={tag}
                                            className="bg-emerald-100 text-emerald-700 cursor-pointer"
                                            onClick={() => removeTag(tag)}
                                        >
                                            {tag} ×
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        id="new-tag"
                                        placeholder="أضف وسم..."
                                        className="h-9 flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                addTag((e.target as HTMLInputElement).value);
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }}
                                    />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            const input = document.getElementById('new-tag') as HTMLInputElement;
                                            addTag(input.value);
                                            input.value = '';
                                        }}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-6">
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                                >
                                    <Save className="w-4 h-4 ml-2" />
                                    حفظ
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowEditor(false)}
                                    className="flex-1"
                                >
                                    <X className="w-4 h-4 ml-2" />
                                    إلغاء
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
