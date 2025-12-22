// components/admin/RecipeManager.tsx
// ادارة الوصفات في نظام تخطيط الوجبات

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Plus, Search, Edit3, Trash2, Save, X, ChevronDown, ChevronUp,
    Clock, Users, ChefHat, Image as ImageIcon, ListOrdered, Utensils
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { foodDatabase, recipeDatabase as defaultRecipes } from '@/lib/mealDatabase';

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

interface Recipe {
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
    category?: string;
}

const DIFFICULTY_OPTIONS = [
    { id: 'easy', name: 'سهل', icon: '🟢' },
    { id: 'medium', name: 'متوسط', icon: '🟡' },
    { id: 'hard', name: 'صعب', icon: '🔴' },
];

const RECIPE_CATEGORIES = [
    { id: 'all', name: 'الكل', icon: '🍽️' },
    { id: 'breakfast', name: 'فطور', icon: '🍳' },
    { id: 'lunch', name: 'غداء', icon: '🍲' },
    { id: 'dinner', name: 'عشاء', icon: '🥘' },
    { id: 'snacks', name: 'وجبات خفيفة', icon: '🥪' },
    { id: 'desserts', name: 'حلويات', icon: '🍰' },
    { id: 'drinks', name: 'مشروبات', icon: '🥤' },
    { id: 'salads', name: 'سلطات', icon: '🥗' },
    { id: 'soups', name: 'شوربات', icon: '🍜' },
];

const EMPTY_RECIPE: Omit<Recipe, 'id'> = {
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: 'easy',
    ingredients: [],
    instructions: [],
    instructionsAr: [],
    totalNutrition: {
        calories: 0, protein: 0, carbs: 0, fat: 0,
        fiber: 0, sugar: 0, sodium: 0, cholesterol: 0
    },
    tags: [],
    imageUrl: '',
    category: 'lunch'
};

export default function RecipeManager() {
    // State
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showEditor, setShowEditor] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        ingredients: true,
        instructions: false,
        nutrition: false
    });
    const [loading, setLoading] = useState(true);

    // Load recipes from recipeDatabase + Firebase on mount
    React.useEffect(() => {
        const loadRecipes = async () => {
            setLoading(true);

            // Load default recipes from database
            const dbRecipes = defaultRecipes as Recipe[];

            // Load custom recipes from Firebase
            let customRecipes: Recipe[] = [];
            try {
                const { db } = await import('@/lib/db');
                const firebaseRecipes = await db.recipes.list();
                customRecipes = firebaseRecipes as unknown as Recipe[];
            } catch (e) {
                console.error('Failed to load recipes from Firebase:', e);
                // Fallback to localStorage
                const savedCustom = localStorage.getItem('admin_custom_recipes');
                if (savedCustom) {
                    try {
                        customRecipes = JSON.parse(savedCustom);
                    } catch { }
                }
            }

            // Merge: default recipes + custom recipes
            const allRecipes = [...dbRecipes, ...customRecipes];
            setRecipes(allRecipes);
            setLoading(false);
        };

        loadRecipes();
    }, []);

    // Filter recipes
    const filteredRecipes = useMemo(() => {
        return recipes.filter(recipe => {
            const matchesSearch = recipe.nameAr.includes(searchQuery) ||
                recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [recipes, searchQuery, selectedCategory]);

    // Handlers
    const handleAddNew = () => {
        const newRecipe: Recipe = {
            ...EMPTY_RECIPE,
            id: `recipe_${Date.now()}`
        };
        setEditingRecipe(newRecipe);
        setIsNew(true);
        setShowEditor(true);
    };

    const handleEdit = (recipe: Recipe) => {
        setEditingRecipe({ ...recipe });
        setIsNew(false);
        setShowEditor(true);
    };

    const handleDelete = async (id: string) => {
        // Check if default
        if (defaultRecipes.some(r => r.id === id)) {
            toast.error('لا يمكن حذف الوصفات الافتراضية');
            return;
        }

        if (confirm('هل أنت متأكد من حذف هذه الوصفة؟')) {
            const updated = recipes.filter(r => r.id !== id);
            setRecipes(updated);

            // Delete from Firebase
            try {
                const { db } = await import('@/lib/db');
                await db.recipes.delete(id);
            } catch (e) {
                console.error('Firebase delete failed:', e);
            }

            // Sync LocalStorage (backup)
            const custom = updated.filter(r => !defaultRecipes.some(d => d.id === r.id));
            localStorage.setItem('admin_custom_recipes', JSON.stringify(custom));

            toast.success('تم حذف الوصفة');
        }
    };

    const handleSave = async () => {
        if (!editingRecipe) return;

        if (!editingRecipe.nameAr) {
            toast.error('يرجى إدخال اسم الوصفة');
            return;
        }

        let updatedRecipe = { ...editingRecipe };
        let success = false;

        // 1. Firebase Ops
        try {
            const { db } = await import('@/lib/db');
            if (isNew) {
                const { id, ...data } = editingRecipe;
                const created = await db.recipes.create(data as any);
                updatedRecipe = created as unknown as Recipe;
                success = true;
                toast.success('تمت إضافة الوصفة للسحابة ☁️✅');
            } else {
                // Update
                if (defaultRecipes.some(r => r.id === editingRecipe.id)) {
                    toast.error('لا يمكن تعديل الوصفات الافتراضية. أنشئ وصفة جديدة بدلاً من ذلك.');
                    return;
                }
                await db.recipes.update(editingRecipe.id, editingRecipe as any);
                success = true;
                toast.success('تم تحديث الوصفة في السحابة ☁️✅');
            }
        } catch (e) {
            console.error('Firebase op failed', e);
            toast.warning('فشل الحفظ السحابي. تم الحفظ محلياً 💾');
        }

        // 2. State & Cache Update
        let updatedList: Recipe[];
        if (isNew) {
            updatedList = [...recipes, updatedRecipe];
        } else {
            // If failed, keep generic ID or old ID
            updatedList = recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r);
        }

        setRecipes(updatedList);

        // Save cache checking against defaultRecipes
        const custom = updatedList.filter(r => !defaultRecipes.some(d => d.id === r.id));
        localStorage.setItem('admin_custom_recipes', JSON.stringify(custom));

        setShowEditor(false);
        setEditingRecipe(null);
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Add ingredient
    const addIngredient = () => {
        if (!editingRecipe) return;
        setEditingRecipe(prev => prev ? {
            ...prev,
            ingredients: [...prev.ingredients, { foodId: '', amount: 100, unit: 'غرام' }]
        } : null);
    };

    const removeIngredient = (index: number) => {
        if (!editingRecipe) return;
        setEditingRecipe(prev => prev ? {
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        } : null);
    };

    const updateIngredient = (index: number, field: string, value: any) => {
        if (!editingRecipe) return;
        const updated = [...editingRecipe.ingredients];
        updated[index] = { ...updated[index], [field]: value };
        setEditingRecipe(prev => prev ? { ...prev, ingredients: updated } : null);
    };

    // Add instruction
    const addInstruction = () => {
        if (!editingRecipe) return;
        setEditingRecipe(prev => prev ? {
            ...prev,
            instructionsAr: [...prev.instructionsAr, '']
        } : null);
    };

    const removeInstruction = (index: number) => {
        if (!editingRecipe) return;
        setEditingRecipe(prev => prev ? {
            ...prev,
            instructionsAr: prev.instructionsAr.filter((_, i) => i !== index)
        } : null);
    };

    const updateInstruction = (index: number, value: string) => {
        if (!editingRecipe) return;
        const updated = [...editingRecipe.instructionsAr];
        updated[index] = value;
        setEditingRecipe(prev => prev ? { ...prev, instructionsAr: updated } : null);
    };

    const addTag = (tag: string) => {
        if (!editingRecipe || !tag.trim()) return;
        if (!editingRecipe.tags.includes(tag.trim())) {
            setEditingRecipe(prev => prev ? {
                ...prev,
                tags: [...prev.tags, tag.trim()]
            } : null);
        }
    };

    const removeTag = (tag: string) => {
        if (!editingRecipe) return;
        setEditingRecipe(prev => prev ? {
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        } : null);
    };

    // Export custom recipes as code
    const exportRecipes = () => {
        const customRecipes = recipes.filter(r => r.id.startsWith('recipe_'));
        if (customRecipes.length === 0) {
            toast.info('لا توجد وصفات مخصصة للتصدير');
            return;
        }
        const code = JSON.stringify(customRecipes, null, 2);
        navigator.clipboard.writeText(code);
        toast.success(`تم نسخ ${customRecipes.length} وصفة للحافظة! الصقها في mealDatabase.ts`);
    };

    // Section Header
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
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة الوصفات 🍳</h2>
                    <p className="text-slate-500 text-sm">إضافة وتعديل الوصفات مع الصور</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={exportRecipes} variant="outline" className="border-orange-500 text-orange-500">
                        📋 تصدير الوصفات المخصصة
                    </Button>
                    <Button onClick={handleAddNew} className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة وصفة جديدة
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-orange-600">{recipes.length}</div>
                    <div className="text-slate-500 text-sm">إجمالي الوصفات</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-green-600">
                        {recipes.filter(r => r.difficulty === 'easy').length}
                    </div>
                    <div className="text-slate-500 text-sm">وصفات سهلة</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-blue-600">
                        {recipes.filter(r => r.imageUrl).length}
                    </div>
                    <div className="text-slate-500 text-sm">بالصور</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-purple-600">
                        {filteredRecipes.length}
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
                        placeholder="ابحث عن وصفة..."
                        className="pr-10 h-12 rounded-xl"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                >
                    {RECIPE_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Recipes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {filteredRecipes.map((recipe, index) => (
                        <motion.div
                            key={recipe.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.03 }}
                            className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Recipe Image */}
                            <div className="h-40 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 relative">
                                {recipe.imageUrl ? (
                                    <img
                                        src={recipe.imageUrl}
                                        alt={recipe.nameAr}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ChefHat className="w-12 h-12 text-orange-300" />
                                    </div>
                                )}
                                <Badge className={`absolute top-2 right-2 ${recipe.difficulty === 'easy' ? 'bg-green-500' :
                                    recipe.difficulty === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                                    } text-white`}>
                                    {DIFFICULTY_OPTIONS.find(d => d.id === recipe.difficulty)?.name}
                                </Badge>
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-1">{recipe.nameAr}</h3>
                                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{recipe.descriptionAr}</p>

                                <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {recipe.prepTime + recipe.cookTime} د
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {recipe.servings} حصص
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Utensils className="w-3 h-3" />
                                        {recipe.ingredients.length} مكون
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-orange-600">
                                        {recipe.totalNutrition.calories} سعرة
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleEdit(recipe)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Edit3 className="w-4 h-4 text-blue-500" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(recipe.id)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredRecipes.length === 0 && (
                <div className="text-center py-12">
                    <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">لا توجد وصفات - ابدأ بإضافة وصفة جديدة!</p>
                </div>
            )}

            {/* Editor Sheet */}
            <Sheet open={showEditor} onOpenChange={setShowEditor}>
                <SheetContent side="left" className="w-full md:w-[600px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-right">
                            {isNew ? '➕ إضافة وصفة جديدة' : '✏️ تعديل الوصفة'}
                        </SheetTitle>
                    </SheetHeader>

                    {editingRecipe && (
                        <div className="py-6 space-y-4">
                            {/* Basic Info */}
                            <SectionHeader title="المعلومات الأساسية" section="basic" />
                            {expandedSections.basic && (
                                <div className="space-y-4 mb-6">
                                    {/* Image URL */}
                                    <div>
                                        <label className="text-sm text-slate-500 mb-1 block">رابط الصورة</label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={editingRecipe.imageUrl || ''}
                                                onChange={(e) => setEditingRecipe(prev => prev ? {
                                                    ...prev,
                                                    imageUrl: e.target.value
                                                } : null)}
                                                placeholder="https://..."
                                                className="h-10 flex-1"
                                            />
                                            <Button size="sm" variant="outline" className="h-10 px-3">
                                                <ImageIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {editingRecipe.imageUrl && (
                                            <img
                                                src={editingRecipe.imageUrl}
                                                alt="Preview"
                                                className="mt-2 h-24 rounded-lg object-cover"
                                            />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-slate-500 mb-1 block">الاسم بالعربي *</label>
                                            <Input
                                                value={editingRecipe.nameAr}
                                                onChange={(e) => setEditingRecipe(prev => prev ? {
                                                    ...prev,
                                                    nameAr: e.target.value
                                                } : null)}
                                                placeholder="كبسة دجاج"
                                                className="h-10"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 mb-1 block">الاسم بالإنجليزي</label>
                                            <Input
                                                value={editingRecipe.name}
                                                onChange={(e) => setEditingRecipe(prev => prev ? {
                                                    ...prev,
                                                    name: e.target.value
                                                } : null)}
                                                placeholder="Chicken Kabsa"
                                                className="h-10"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-500 mb-1 block">الوصف</label>
                                        <textarea
                                            value={editingRecipe.descriptionAr}
                                            onChange={(e) => setEditingRecipe(prev => prev ? {
                                                ...prev,
                                                descriptionAr: e.target.value
                                            } : null)}
                                            placeholder="وصف قصير للوصفة..."
                                            className="w-full h-20 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-slate-500 mb-1 block">التصنيف</label>
                                            <select
                                                value={editingRecipe.category || 'lunch'}
                                                onChange={(e) => setEditingRecipe(prev => prev ? {
                                                    ...prev,
                                                    category: e.target.value
                                                } : null)}
                                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white"
                                            >
                                                {RECIPE_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.icon} {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 mb-1 block">الصعوبة</label>
                                            <select
                                                value={editingRecipe.difficulty}
                                                onChange={(e) => setEditingRecipe(prev => prev ? {
                                                    ...prev,
                                                    difficulty: e.target.value as 'easy' | 'medium' | 'hard'
                                                } : null)}
                                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white"
                                            >
                                                {DIFFICULTY_OPTIONS.map(opt => (
                                                    <option key={opt.id} value={opt.id}>
                                                        {opt.icon} {opt.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">⏱️ وقت التحضير (دقيقة)</label>
                                            <Input
                                                type="number"
                                                value={editingRecipe.prepTime}
                                                onChange={(e) => setEditingRecipe(prev => prev ? {
                                                    ...prev,
                                                    prepTime: parseInt(e.target.value) || 0
                                                } : null)}
                                                className="h-10"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">🔥 وقت الطبخ (دقيقة)</label>
                                            <Input
                                                type="number"
                                                value={editingRecipe.cookTime}
                                                onChange={(e) => setEditingRecipe(prev => prev ? {
                                                    ...prev,
                                                    cookTime: parseInt(e.target.value) || 0
                                                } : null)}
                                                className="h-10"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">👥 عدد الحصص</label>
                                            <Input
                                                type="number"
                                                value={editingRecipe.servings}
                                                onChange={(e) => setEditingRecipe(prev => prev ? {
                                                    ...prev,
                                                    servings: parseInt(e.target.value) || 1
                                                } : null)}
                                                className="h-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Ingredients */}
                            <SectionHeader title="المكونات" section="ingredients" />
                            {expandedSections.ingredients && (
                                <div className="space-y-3 mb-6">
                                    {editingRecipe.ingredients.map((ing, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <Input
                                                value={ing.foodId}
                                                onChange={(e) => updateIngredient(index, 'foodId', e.target.value)}
                                                placeholder="اسم المكون..."
                                                className="flex-1 h-9 text-sm"
                                            />
                                            <Input
                                                type="number"
                                                value={ing.amount}
                                                onChange={(e) => updateIngredient(index, 'amount', parseInt(e.target.value) || 0)}
                                                placeholder="الكمية"
                                                className="w-20 h-9 text-center"
                                            />
                                            <Input
                                                value={ing.unit}
                                                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                                                placeholder="الوحدة"
                                                className="w-20 h-9"
                                            />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeIngredient(index)}
                                                className="h-9 w-9 p-0 text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={addIngredient}
                                        className="w-full"
                                    >
                                        <Plus className="w-4 h-4 ml-1" />
                                        إضافة مكون
                                    </Button>
                                </div>
                            )}

                            {/* Instructions */}
                            <SectionHeader title="خطوات التحضير" section="instructions" />
                            {expandedSections.instructions && (
                                <div className="space-y-3 mb-6">
                                    {editingRecipe.instructionsAr.map((step, index) => (
                                        <div key={index} className="flex gap-2 items-start">
                                            <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                                                {index + 1}
                                            </span>
                                            <textarea
                                                value={step}
                                                onChange={(e) => updateInstruction(index, e.target.value)}
                                                placeholder={`الخطوة ${index + 1}...`}
                                                className="flex-1 h-16 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 resize-none text-sm"
                                            />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeInstruction(index)}
                                                className="h-8 w-8 p-0 text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={addInstruction}
                                        className="w-full"
                                    >
                                        <ListOrdered className="w-4 h-4 ml-1" />
                                        إضافة خطوة
                                    </Button>
                                </div>
                            )}

                            {/* Nutrition */}
                            <SectionHeader title="القيم الغذائية" section="nutrition" />
                            {expandedSections.nutrition && (
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {[
                                        { key: 'calories', label: 'السعرات', icon: '🔥' },
                                        { key: 'protein', label: 'البروتين', icon: '🥩' },
                                        { key: 'carbs', label: 'الكربوهيدرات', icon: '🍞' },
                                        { key: 'fat', label: 'الدهون', icon: '🧈' },
                                    ].map(item => (
                                        <div key={item.key}>
                                            <label className="text-xs text-slate-500 mb-1 block">
                                                {item.icon} {item.label}
                                            </label>
                                            <Input
                                                type="number"
                                                value={editingRecipe.totalNutrition[item.key as keyof NutritionInfo]}
                                                onChange={(e) => setEditingRecipe(prev => prev ? {
                                                    ...prev,
                                                    totalNutrition: {
                                                        ...prev.totalNutrition,
                                                        [item.key]: parseFloat(e.target.value) || 0
                                                    }
                                                } : null)}
                                                className="h-9"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Tags */}
                            <div>
                                <label className="text-sm text-slate-500 mb-2 block">الوسوم</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {editingRecipe.tags.map(tag => (
                                        <Badge
                                            key={tag}
                                            className="bg-orange-100 text-orange-700 cursor-pointer"
                                            onClick={() => removeTag(tag)}
                                        >
                                            {tag} ×
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        id="new-recipe-tag"
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
                                            const input = document.getElementById('new-recipe-tag') as HTMLInputElement;
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
                                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                                >
                                    <Save className="w-4 h-4 ml-2" />
                                    حفظ الوصفة
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
