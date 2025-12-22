// pages/meal-planner.tsx
// Premium Meal Planning System with Touch Interactions

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import {
    Utensils, Search, Plus, X, ChevronLeft, ChevronRight,
    Flame, Beef, Wheat, Droplets, Heart, AlertTriangle,
    Check, Clock, Scale, Activity, Sparkles, Coffee,
    Sun, Moon as MoonIcon, Salad, Apple, Cookie, Filter,
    Calendar, Trash2, Edit3, Info, Zap, Target, TrendingUp,
    ChefHat, BookOpen, Share2, Download, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
    foodDatabase, categories, searchFoods,
    calculateTotalNutrition, healthConditions, getSafeFoodsForCondition,
    FoodItem, NutritionInfo, MealPlan, recipeDatabase, Recipe
} from '@/lib/mealDatabase';

// Types
interface DailyGoals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface MealEntry {
    id: string;
    foodId: string;
    amount: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface UserHealthProfile {
    conditions: string[];
    allergies: string[];
    goals: DailyGoals;
}

// Meal Type Config
const mealTypes = [
    { id: 'breakfast', name: 'الفطور', icon: Coffee, time: '٧:٠٠ - ٩:٠٠', color: '#F59E0B', bg: 'bg-amber-50' },
    { id: 'lunch', name: 'الغداء', icon: Sun, time: '١٢:٠٠ - ٢:٠٠', color: '#2D9B83', bg: 'bg-emerald-50' },
    { id: 'dinner', name: 'العشاء', icon: MoonIcon, time: '٧:٠٠ - ٩:٠٠', color: '#8B5CF6', bg: 'bg-violet-50' },
    { id: 'snack', name: 'وجبة خفيفة', icon: Apple, time: 'أي وقت', color: '#EC4899', bg: 'bg-pink-50' },
];

// Default Goals
const defaultGoals: DailyGoals = {
    calories: 2000,
    protein: 60,
    carbs: 250,
    fat: 65
};

export default function MealPlanner() {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'plan' | 'foods' | 'recipes' | 'analytics'>('plan');
    const [showAddFoodSheet, setShowAddFoodSheet] = useState(false);
    const [showFoodDetailSheet, setShowFoodDetailSheet] = useState(false);
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showSettingsSheet, setShowSettingsSheet] = useState(false);

    // Load saved meals
    const { data: savedMeals = [] } = useQuery<MealEntry[]>({
        queryKey: ['mealEntries', format(selectedDate, 'yyyy-MM-dd')],
        queryFn: () => {
            if (typeof window !== 'undefined') {
                const key = `meals_${format(selectedDate, 'yyyy-MM-dd')}`;
                const saved = localStorage.getItem(key);
                return saved ? JSON.parse(saved) : [];
            }
            return [];
        }
    });

    // Load user health profile
    const { data: healthProfile = { conditions: [], allergies: [], goals: defaultGoals } } = useQuery<UserHealthProfile>({
        queryKey: ['healthProfile'],
        queryFn: () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('mealPlannerProfile');
                return saved ? JSON.parse(saved) : { conditions: [], allergies: [], goals: defaultGoals };
            }
            return { conditions: [], allergies: [], goals: defaultGoals };
        }
    });

    // Calculate daily totals
    const dailyTotals = useMemo(() => {
        const items = savedMeals.map(m => ({ foodId: m.foodId, amount: m.amount }));
        return calculateTotalNutrition(items);
    }, [savedMeals]);

    // State for custom foods/recipes from Firebase
    const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
    const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);

    // Load custom foods/recipes from Firebase on mount
    useEffect(() => {
        const loadCustomData = async () => {
            try {
                const { db } = await import('@/lib/db');

                // Load custom foods
                const firebaseFoods = await db.foods.list();
                if (firebaseFoods.length > 0) {
                    setCustomFoods(firebaseFoods as unknown as FoodItem[]);
                }

                // Load custom recipes
                const firebaseRecipes = await db.recipes.list();
                if (firebaseRecipes.length > 0) {
                    setCustomRecipes(firebaseRecipes as unknown as Recipe[]);
                }
            } catch (e) {
                console.error('Failed to load from Firebase:', e);
            }
        };

        loadCustomData();
    }, []);

    // Combine default + custom foods
    const allFoods = useMemo(() => {
        return [...foodDatabase, ...customFoods];
    }, [customFoods]);

    // Combine default + custom recipes
    const allRecipes = useMemo(() => {
        return [...recipeDatabase, ...customRecipes];
    }, [customRecipes]);

    // Filter foods based on search and category
    const filteredFoods = useMemo(() => {
        let foods = allFoods;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            foods = foods.filter(f =>
                f.nameAr.includes(searchQuery) ||
                f.name.toLowerCase().includes(query)
            );
        }

        if (selectedCategory !== 'all') {
            foods = foods.filter(f => f.category === selectedCategory);
        }

        // Filter out unsafe foods for user's conditions
        if (healthProfile.conditions.length > 0) {
            foods = foods.filter(food => {
                return healthProfile.conditions.every(condition => {
                    const status = food.healthConditions[condition as keyof typeof food.healthConditions];
                    return status !== 'avoid';
                });
            });
        }

        return foods;
    }, [searchQuery, selectedCategory, healthProfile.conditions, allFoods]);

    // Local getFoodById that includes custom foods from admin
    const getFood = useCallback((id: string): FoodItem | undefined => {
        return allFoods.find(f => f.id === id);
    }, [allFoods]);

    // Get week dates
    const weekDates = useMemo(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 6 }); // Saturday
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [selectedDate]);

    // Add meal entry
    const addMeal = useCallback((foodId: string, amount: number, mealType: string) => {
        const entry: MealEntry = {
            id: Date.now().toString(),
            foodId,
            amount,
            mealType: mealType as MealEntry['mealType']
        };

        const key = `meals_${format(selectedDate, 'yyyy-MM-dd')}`;
        const current = savedMeals;
        const updated = [...current, entry];

        if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(updated));
        }

        queryClient.invalidateQueries({ queryKey: ['mealEntries'] });
        toast.success('تمت إضافة الوجبة');
        setShowAddFoodSheet(false);
    }, [savedMeals, selectedDate, queryClient]);

    // Remove meal entry
    const removeMeal = useCallback((mealId: string) => {
        const key = `meals_${format(selectedDate, 'yyyy-MM-dd')}`;
        const updated = savedMeals.filter(m => m.id !== mealId);

        if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(updated));
        }

        queryClient.invalidateQueries({ queryKey: ['mealEntries'] });
        toast.success('تم حذف الوجبة');
    }, [savedMeals, selectedDate, queryClient]);

    // Get meals by type
    const getMealsByType = (type: string) => {
        return savedMeals.filter(m => m.mealType === type);
    };

    // Calculate nutrition for meal type
    const getMealTypeNutrition = (type: string) => {
        const meals = getMealsByType(type);
        const items = meals.map(m => ({ foodId: m.foodId, amount: m.amount }));
        return calculateTotalNutrition(items);
    };

    // Check food safety for user's conditions
    const getFoodSafety = (food: FoodItem): { status: 'safe' | 'caution' | 'avoid'; warnings: string[] } => {
        const warnings: string[] = [];
        let worstStatus: 'safe' | 'caution' | 'avoid' = 'safe';

        healthProfile.conditions.forEach(condition => {
            const status = food.healthConditions[condition as keyof typeof food.healthConditions];
            const conditionName = healthConditions.find(c => c.id === condition)?.nameAr || condition;

            if (status === 'avoid') {
                worstStatus = 'avoid';
                warnings.push(`⛔ غير مناسب لـ${conditionName}`);
            } else if (status === 'caution' && worstStatus !== 'avoid') {
                worstStatus = 'caution';
                warnings.push(`⚠️ احذر - ${conditionName}`);
            }
        });

        return { status: worstStatus, warnings };
    };

    // Progress percentage
    const getProgress = (current: number, goal: number) => Math.min((current / goal) * 100, 100);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            {/* Header */}
            <motion.div
                className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white px-6 py-6 rounded-b-[2rem]"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold">تخطيط الوجبات 🥗</h1>
                        <p className="text-white/70 text-sm">خطة غذائية مخصصة</p>
                    </div>
                    <motion.button
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowSettingsSheet(true)}
                    >
                        <Target className="w-5 h-5 text-white" />
                    </motion.button>
                </div>

                {/* Week Calendar */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                    {weekDates.map((date, index) => (
                        <motion.button
                            key={index}
                            className={`flex-shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-center transition-all ${isSameDay(date, selectedDate)
                                ? 'bg-white text-emerald-600'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedDate(date)}
                        >
                            <span className="text-[10px] font-medium opacity-70">
                                {format(date, 'EEE', { locale: ar })}
                            </span>
                            <span className="text-lg font-bold">{format(date, 'd')}</span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Daily Summary Cards */}
            <div className="px-4 -mt-4 relative z-10">
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    {/* Macros Progress */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {[
                            { key: 'calories', label: 'سعرات', icon: Flame, value: dailyTotals.calories, goal: healthProfile.goals.calories, color: '#F59E0B', unit: '' },
                            { key: 'protein', label: 'بروتين', icon: Beef, value: dailyTotals.protein, goal: healthProfile.goals.protein, color: '#EF4444', unit: 'غ' },
                            { key: 'carbs', label: 'كربوهيدرات', icon: Wheat, value: dailyTotals.carbs, goal: healthProfile.goals.carbs, color: '#8B5CF6', unit: 'غ' },
                            { key: 'fat', label: 'دهون', icon: Droplets, value: dailyTotals.fat, goal: healthProfile.goals.fat, color: '#3B82F6', unit: 'غ' },
                        ].map((item, index) => {
                            const Icon = item.icon;
                            const progress = getProgress(item.value, item.goal);
                            return (
                                <motion.div
                                    key={item.key}
                                    className="text-center"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <motion.div
                                        className="relative w-14 h-14 mx-auto mb-2"
                                        whileTap={{ rotate: 10 }}
                                    >
                                        <svg className="w-14 h-14 transform -rotate-90">
                                            <circle cx="28" cy="28" r="24" strokeWidth="4" fill="none" stroke="#E5E7EB" />
                                            <circle
                                                cx="28" cy="28" r="24" strokeWidth="4" fill="none"
                                                stroke={item.color}
                                                strokeLinecap="round"
                                                strokeDasharray={`${progress * 1.5} 150`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Icon className="w-5 h-5" style={{ color: item.color }} />
                                        </div>
                                    </motion.div>
                                    <div className="text-sm font-bold text-slate-800 dark:text-white">
                                        {Math.round(item.value)}{item.unit}
                                    </div>
                                    <div className="text-[10px] text-slate-400">/ {item.goal}{item.unit}</div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Calorie Progress Bar */}
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${getProgress(dailyTotals.calories, healthProfile.goals.calories)}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                    </div>
                    <p className="text-center text-sm text-slate-500 mt-2">
                        {Math.round(healthProfile.goals.calories - dailyTotals.calories)} سعرة متبقية
                    </p>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="px-4 pt-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {[
                        { id: 'plan', label: 'الخطة', icon: Calendar },
                        { id: 'foods', label: 'الأطعمة', icon: Utensils },
                        { id: 'recipes', label: 'الوصفات', icon: ChefHat },
                        { id: 'analytics', label: 'التحليل', icon: TrendingUp },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <motion.button
                                key={tab.id}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(tab.id as any)}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-4 space-y-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'plan' && (
                        <motion.div
                            key="plan"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {mealTypes.map((meal, index) => {
                                const Icon = meal.icon;
                                const mealItems = getMealsByType(meal.id);
                                const nutrition = getMealTypeNutrition(meal.id);

                                return (
                                    <motion.div
                                        key={meal.id}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        {/* Meal Header */}
                                        <div className={`${meal.bg} px-4 py-3 flex items-center justify-between`}>
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center"
                                                    whileTap={{ rotate: 10, scale: 0.9 }}
                                                >
                                                    <Icon className="w-5 h-5" style={{ color: meal.color }} />
                                                </motion.div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{meal.name}</h3>
                                                    <p className="text-xs text-slate-500">{meal.time}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-white/80 text-slate-700 border-0 text-xs">
                                                    {Math.round(nutrition.calories)} سعرة
                                                </Badge>
                                                <motion.button
                                                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
                                                    whileTap={{ scale: 0.85 }}
                                                    onClick={() => {
                                                        setSelectedMealType(meal.id);
                                                        setShowAddFoodSheet(true);
                                                    }}
                                                >
                                                    <Plus className="w-4 h-4" style={{ color: meal.color }} />
                                                </motion.button>
                                            </div>
                                        </div>

                                        {/* Meal Items */}
                                        <div className="p-3">
                                            {mealItems.length > 0 ? (
                                                <div className="space-y-2">
                                                    {mealItems.map((item, idx) => {
                                                        const food = getFood(item.foodId);
                                                        if (!food) return null;
                                                        const safety = getFoodSafety(food);
                                                        const multiplier = item.amount / food.servingSize;

                                                        return (
                                                            <motion.div
                                                                key={item.id}
                                                                className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded-xl p-3"
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-2xl">{categories.find(c => c.id === food.category)?.icon || '🍽️'}</div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium text-slate-800 dark:text-white">{food.nameAr}</span>
                                                                            {safety.status === 'caution' && (
                                                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                                            )}
                                                                        </div>
                                                                        <span className="text-xs text-slate-400">{item.amount} {food.servingUnit}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-bold" style={{ color: meal.color }}>
                                                                        {Math.round(food.nutrition.calories * multiplier)}
                                                                    </span>
                                                                    <motion.button
                                                                        className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center"
                                                                        whileTap={{ scale: 0.8 }}
                                                                        onClick={() => removeMeal(item.id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                                    </motion.button>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <motion.button
                                                    className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl text-slate-400 flex flex-col items-center gap-2"
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        setSelectedMealType(meal.id);
                                                        setShowAddFoodSheet(true);
                                                    }}
                                                >
                                                    <Plus className="w-6 h-6" />
                                                    <span className="text-sm">أضف {meal.name}</span>
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {activeTab === 'foods' && (
                        <motion.div
                            key="foods"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="ابحث عن طعام..."
                                    className="pr-10 h-12 rounded-xl"
                                />
                            </div>

                            {/* Categories */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {categories.map((cat) => (
                                    <motion.button
                                        key={cat.id}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap ${selectedCategory === cat.id
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-white dark:bg-slate-800 text-slate-600'
                                            }`}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedCategory(cat.id)}
                                    >
                                        <span>{cat.icon}</span>
                                        <span className="text-sm">{cat.name}</span>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Food List */}
                            <div className="grid grid-cols-1 gap-3">
                                {filteredFoods.map((food, index) => {
                                    const safety = getFoodSafety(food);
                                    return (
                                        <motion.div
                                            key={food.id}
                                            className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm ${safety.status === 'avoid' ? 'opacity-50' : ''
                                                }`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setSelectedFood(food);
                                                setShowFoodDetailSheet(true);
                                            }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-3xl">
                                                    {categories.find(c => c.id === food.category)?.icon || '🍽️'}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-800 dark:text-white">{food.nameAr}</h4>
                                                        {safety.status === 'caution' && (
                                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                        )}
                                                        {safety.status === 'avoid' && (
                                                            <X className="w-4 h-4 text-red-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-400">{food.servingSize} {food.servingUnit}</p>
                                                    <div className="flex gap-3 mt-2">
                                                        <span className="text-xs text-amber-600">{food.nutrition.calories} سعرة</span>
                                                        <span className="text-xs text-red-500">{food.nutrition.protein}غ بروتين</span>
                                                        <span className="text-xs text-purple-500">{food.nutrition.carbs}غ كربو</span>
                                                    </div>
                                                </div>
                                                <motion.button
                                                    className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"
                                                    whileTap={{ scale: 0.85 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedMealType('snack');
                                                        addMeal(food.id, food.servingSize, 'snack');
                                                    }}
                                                >
                                                    <Plus className="w-5 h-5 text-emerald-600" />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {/* Weekly Summary */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    ملخص اليوم
                                </h3>

                                <div className="space-y-4">
                                    {[
                                        { label: 'السعرات الحرارية', value: dailyTotals.calories, goal: healthProfile.goals.calories, color: '#F59E0B' },
                                        { label: 'البروتين', value: dailyTotals.protein, goal: healthProfile.goals.protein, color: '#EF4444', unit: 'غ' },
                                        { label: 'الكربوهيدرات', value: dailyTotals.carbs, goal: healthProfile.goals.carbs, color: '#8B5CF6', unit: 'غ' },
                                        { label: 'الدهون', value: dailyTotals.fat, goal: healthProfile.goals.fat, color: '#3B82F6', unit: 'غ' },
                                        { label: 'الألياف', value: dailyTotals.fiber, goal: 25, color: '#22C55E', unit: 'غ' },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                                                <span className="font-bold" style={{ color: item.color }}>
                                                    {Math.round(item.value)}{item.unit} / {item.goal}{item.unit}
                                                </span>
                                            </div>
                                            <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${getProgress(item.value, item.goal)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Health Alerts */}
                            {healthProfile.conditions.length > 0 && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4">
                                    <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                                        <Heart className="w-5 h-5" />
                                        تقرير الحالة الصحية
                                    </h3>
                                    <div className="space-y-2">
                                        {healthProfile.conditions.map(condId => {
                                            const condition = healthConditions.find(c => c.id === condId);
                                            if (!condition) return null;
                                            return (
                                                <div key={condId} className="bg-white dark:bg-slate-800 rounded-xl p-3">
                                                    <div className="font-medium text-slate-800 dark:text-white mb-1">{condition.nameAr}</div>
                                                    <p className="text-xs text-slate-500">
                                                        ✓ ينصح: {condition.recommendations.slice(0, 3).join('، ')}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Nutrition Tips */}
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white">
                                <h3 className="font-bold mb-2 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    نصيحة اليوم
                                </h3>
                                <p className="text-sm text-white/90">
                                    {dailyTotals.protein < healthProfile.goals.protein * 0.5
                                        ? 'تحتاج لزيادة البروتين! جرب إضافة صدر دجاج أو بيض للوجبة القادمة.'
                                        : dailyTotals.fiber < 15
                                            ? 'أضف المزيد من الألياف لتحسين الهضم - جرب الشوفان أو الخضروات الورقية.'
                                            : 'أحسنت! تتبع تقدمك مستمر بشكل ممتاز 🎉'}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'recipes' && (
                        <RecipesSection
                            healthProfile={healthProfile}
                            onAddRecipe={(recipeId) => {
                                // Add all recipe ingredients to meal
                                const recipe = recipesDatabase.find(r => r.id === recipeId);
                                if (recipe) {
                                    recipe.ingredients.forEach(ing => {
                                        addMeal(ing.foodId, ing.amount, 'lunch');
                                    });
                                }
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Add Food Sheet */}
            <Sheet open={showAddFoodSheet} onOpenChange={setShowAddFoodSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-right">إضافة طعام لـ{mealTypes.find(m => m.id === selectedMealType)?.name}</SheetTitle>
                    </SheetHeader>
                    <AddFoodForm
                        foods={filteredFoods}
                        onAdd={(foodId, amount) => addMeal(foodId, amount, selectedMealType)}
                        categories={categories}
                        getFoodSafety={getFoodSafety}
                    />
                </SheetContent>
            </Sheet>

            {/* Food Detail Sheet */}
            <Sheet open={showFoodDetailSheet} onOpenChange={setShowFoodDetailSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
                    {selectedFood && (
                        <FoodDetailView
                            food={selectedFood}
                            safety={getFoodSafety(selectedFood)}
                            onAddToMeal={(amount) => {
                                addMeal(selectedFood.id, amount, 'snack');
                                setShowFoodDetailSheet(false);
                            }}
                        />
                    )}
                </SheetContent>
            </Sheet>

            {/* Settings Sheet */}
            <Sheet open={showSettingsSheet} onOpenChange={setShowSettingsSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-right">الأهداف والحالة الصحية</SheetTitle>
                    </SheetHeader>
                    <HealthSettingsForm
                        profile={healthProfile}
                        conditions={healthConditions}
                        onSave={(newProfile) => {
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('mealPlannerProfile', JSON.stringify(newProfile));
                            }
                            queryClient.invalidateQueries({ queryKey: ['healthProfile'] });
                            setShowSettingsSheet(false);
                            toast.success('تم حفظ الإعدادات');
                        }}
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
}

// Add Food Form Component
function AddFoodForm({
    foods,
    onAdd,
    categories,
    getFoodSafety
}: {
    foods: FoodItem[];
    onAdd: (foodId: string, amount: number) => void;
    categories: { id: string; name: string; icon: string }[];
    getFoodSafety: (food: FoodItem) => { status: string; warnings: string[] };
}) {
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('all');
    const [selectedAmount, setSelectedAmount] = useState(100);

    const filtered = foods.filter(f => {
        const matchesSearch = f.nameAr.includes(search) || f.name.toLowerCase().includes(search.toLowerCase());
        const matchesCat = selectedCat === 'all' || f.category === selectedCat;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="py-4 space-y-4">
            <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن طعام..."
                className="h-12 rounded-xl"
            />

            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.slice(0, 6).map((cat) => (
                    <motion.button
                        key={cat.id}
                        className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm whitespace-nowrap ${selectedCat === cat.id ? 'bg-emerald-500 text-white' : 'bg-slate-100'
                            }`}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCat(cat.id)}
                    >
                        {cat.icon} {cat.name}
                    </motion.button>
                ))}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filtered.slice(0, 20).map((food) => {
                    const safety = getFoodSafety(food);
                    return (
                        <motion.div
                            key={food.id}
                            className={`flex items-center justify-between bg-slate-50 rounded-xl p-3 ${safety.status === 'avoid' ? 'opacity-50' : ''}`}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{categories.find(c => c.id === food.category)?.icon}</span>
                                <div>
                                    <div className="font-medium">{food.nameAr}</div>
                                    <div className="text-xs text-slate-400">{food.nutrition.calories} سعرة / {food.servingSize}{food.servingUnit}</div>
                                </div>
                            </div>
                            <motion.button
                                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onAdd(food.id, food.servingSize)}
                            >
                                أضف
                            </motion.button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// Food Detail View Component
function FoodDetailView({
    food,
    safety,
    onAddToMeal
}: {
    food: FoodItem;
    safety: { status: string; warnings: string[] };
    onAddToMeal: (amount: number) => void;
}) {
    const [amount, setAmount] = useState(food.servingSize);
    const multiplier = amount / food.servingSize;

    return (
        <div className="py-4 space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="text-6xl mb-2">{categories.find(c => c.id === food.category)?.icon}</div>
                <h2 className="text-2xl font-bold text-slate-800">{food.nameAr}</h2>
                <p className="text-slate-500">{food.name}</p>
            </div>

            {/* Safety Warnings */}
            {safety.warnings.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-3 space-y-1">
                    {safety.warnings.map((w, i) => (
                        <p key={i} className="text-sm text-amber-700">{w}</p>
                    ))}
                </div>
            )}

            {/* Amount Selector */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الكمية ({food.servingUnit})</label>
                <div className="flex items-center gap-3">
                    <motion.button
                        className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setAmount(Math.max(10, amount - 25))}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </motion.button>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="text-center text-xl font-bold h-12 rounded-xl"
                    />
                    <motion.button
                        className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setAmount(amount + 25)}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                </div>
            </div>

            {/* Nutrition Info */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'سعرات', value: food.nutrition.calories * multiplier, color: '#F59E0B' },
                    { label: 'بروتين', value: food.nutrition.protein * multiplier, unit: 'غ', color: '#EF4444' },
                    { label: 'كربو', value: food.nutrition.carbs * multiplier, unit: 'غ', color: '#8B5CF6' },
                    { label: 'دهون', value: food.nutrition.fat * multiplier, unit: 'غ', color: '#3B82F6' },
                ].map((item) => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold" style={{ color: item.color }}>
                            {Math.round(item.value)}{item.unit}
                        </div>
                        <div className="text-xs text-slate-500">{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
                {food.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
            </div>

            {/* Add Button */}
            <motion.button
                className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl"
                whileTap={{ scale: 0.98 }}
                onClick={() => onAddToMeal(amount)}
            >
                <Plus className="w-5 h-5 inline mr-2" />
                أضف للوجبات
            </motion.button>
        </div>
    );
}

// Health Settings Form
function HealthSettingsForm({
    profile,
    conditions,
    onSave
}: {
    profile: UserHealthProfile;
    conditions: { id: string; nameAr: string }[];
    onSave: (profile: UserHealthProfile) => void;
}) {
    const [goals, setGoals] = useState(profile.goals);
    const [selectedConditions, setSelectedConditions] = useState<string[]>(profile.conditions);

    const toggleCondition = (id: string) => {
        setSelectedConditions(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    return (
        <div className="py-4 space-y-6">
            {/* Daily Goals */}
            <div>
                <h3 className="font-bold text-slate-800 mb-3">الأهداف اليومية</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { key: 'calories', label: 'السعرات', icon: Flame },
                        { key: 'protein', label: 'البروتين (غ)', icon: Beef },
                        { key: 'carbs', label: 'الكربو (غ)', icon: Wheat },
                        { key: 'fat', label: 'الدهون (غ)', icon: Droplets },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.key}>
                                <label className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                                    <Icon className="w-3 h-3" />
                                    {item.label}
                                </label>
                                <Input
                                    type="number"
                                    value={goals[item.key as keyof DailyGoals]}
                                    onChange={(e) => setGoals({ ...goals, [item.key]: Number(e.target.value) })}
                                    className="h-10 rounded-xl"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Health Conditions */}
            <div>
                <h3 className="font-bold text-slate-800 mb-3">الحالات الصحية</h3>
                <p className="text-sm text-slate-500 mb-3">سنقوم بتصفية الأطعمة غير المناسبة</p>
                <div className="space-y-2">
                    {conditions.map((condition) => (
                        <motion.button
                            key={condition.id}
                            className={`w-full flex items-center justify-between p-3 rounded-xl ${selectedConditions.includes(condition.id)
                                ? 'bg-emerald-100 border-2 border-emerald-500'
                                : 'bg-slate-50 border-2 border-transparent'
                                }`}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleCondition(condition.id)}
                        >
                            <span className="font-medium">{condition.nameAr}</span>
                            {selectedConditions.includes(condition.id) && (
                                <Check className="w-5 h-5 text-emerald-600" />
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <motion.button
                className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl"
                whileTap={{ scale: 0.98 }}
                onClick={() => onSave({ ...profile, goals, conditions: selectedConditions })}
            >
                حفظ الإعدادات
            </motion.button>
        </div>
    );
}

// ============================================
// RECIPES DATABASE
// ============================================

interface RecipeData {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    image: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: { foodId: string; amount: number; name: string }[];
    instructions: string[];
    tags: string[];
    healthConditions: {
        diabetes: boolean;
        hypertension: boolean;
        ibs: boolean;
    };
}

const recipesDatabase: RecipeData[] = [
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


// ============================================
// RECIPES SECTION COMPONENT
// ============================================

function RecipesSection({
    healthProfile,
    onAddRecipe
}: {
    healthProfile: UserHealthProfile;
    onAddRecipe: (recipeId: string) => void;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null);
    const [showRecipeDetail, setShowRecipeDetail] = useState(false);
    const [filterTag, setFilterTag] = useState<string>('all');

    // Filter recipes based on health conditions and search
    const filteredRecipes = useMemo(() => {
        return recipesDatabase.filter(recipe => {
            // Check health conditions
            const isHealthSafe = healthProfile.conditions.every(condition => {
                if (condition === 'diabetes') return recipe.healthConditions.diabetes;
                if (condition === 'hypertension') return recipe.healthConditions.hypertension;
                if (condition === 'ibs') return recipe.healthConditions.ibs;
                return true;
            });

            // Check search
            const matchesSearch = searchQuery === '' ||
                recipe.nameAr.includes(searchQuery) ||
                recipe.name.toLowerCase().includes(searchQuery.toLowerCase());

            // Check tag filter
            const matchesTag = filterTag === 'all' || recipe.tags.includes(filterTag);

            return isHealthSafe && matchesSearch && matchesTag;
        });
    }, [healthProfile.conditions, searchQuery, filterTag]);

    const allTags = ['all', 'سكري', 'ضغط الدم', 'قولون', 'يمني', 'خليجي', 'سعودي', 'مصري', 'لبناني', 'فطور', 'نباتي', 'عالي البروتين'];


    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'easy': return 'bg-green-100 text-green-700';
            case 'medium': return 'bg-amber-100 text-amber-700';
            case 'hard': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getDifficultyLabel = (diff: string) => {
        switch (diff) {
            case 'easy': return 'سهل';
            case 'medium': return 'متوسط';
            case 'hard': return 'صعب';
            default: return diff;
        }
    };

    return (
        <motion.div
            key="recipes"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
        >
            {/* Search */}
            <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن وصفة..."
                    className="pr-10 h-12 rounded-xl"
                />
            </div>

            {/* Tags Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {allTags.map((tag) => (
                    <motion.button
                        key={tag}
                        className={`px-3 py-2 rounded-xl text-sm whitespace-nowrap ${filterTag === tag
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600'
                            }`}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilterTag(tag)}
                    >
                        {tag === 'all' ? '🍽️ الكل' : tag}
                    </motion.button>
                ))}
            </div>

            {/* Recipes Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredRecipes.map((recipe, index) => (
                    <motion.div
                        key={recipe.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setSelectedRecipe(recipe);
                            setShowRecipeDetail(true);
                        }}
                    >
                        <div className="flex">
                            {/* Image */}
                            <div className="w-28 h-28 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-5xl">
                                {recipe.image}
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white">{recipe.nameAr}</h3>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{recipe.description}</p>
                                    </div>
                                    <Badge className={`${getDifficultyColor(recipe.difficulty)} border-0 text-[10px]`}>
                                        {getDifficultyLabel(recipe.difficulty)}
                                    </Badge>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-3 mt-3">
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        {recipe.prepTime + recipe.cookTime} د
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-amber-600">
                                        <Flame className="w-3 h-3" />
                                        {recipe.calories}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-red-500">
                                        <Beef className="w-3 h-3" />
                                        {recipe.protein}غ
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex gap-1 mt-2">
                                    {recipe.tags.slice(0, 2).map((tag) => (
                                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredRecipes.length === 0 && (
                    <div className="text-center py-10">
                        <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">لا توجد وصفات تطابق بحثك</p>
                    </div>
                )}
            </div>

            {/* Recipe Detail Sheet */}
            <Sheet open={showRecipeDetail} onOpenChange={setShowRecipeDetail}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
                    {selectedRecipe && (
                        <div className="py-4 space-y-6">
                            {/* Header */}
                            <div className="text-center">
                                <div className="text-6xl mb-3">{selectedRecipe.image}</div>
                                <h2 className="text-2xl font-bold text-slate-800">{selectedRecipe.nameAr}</h2>
                                <p className="text-slate-500 text-sm mt-1">{selectedRecipe.description}</p>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-4 gap-2">
                                <div className="bg-amber-50 rounded-xl p-3 text-center">
                                    <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                    <div className="font-bold text-amber-700">{selectedRecipe.calories}</div>
                                    <div className="text-[10px] text-amber-600">سعرة</div>
                                </div>
                                <div className="bg-red-50 rounded-xl p-3 text-center">
                                    <Beef className="w-5 h-5 text-red-500 mx-auto mb-1" />
                                    <div className="font-bold text-red-700">{selectedRecipe.protein}غ</div>
                                    <div className="text-[10px] text-red-600">بروتين</div>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-3 text-center">
                                    <Wheat className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                                    <div className="font-bold text-purple-700">{selectedRecipe.carbs}غ</div>
                                    <div className="text-[10px] text-purple-600">كربو</div>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-3 text-center">
                                    <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                    <div className="font-bold text-blue-700">{selectedRecipe.prepTime + selectedRecipe.cookTime}</div>
                                    <div className="text-[10px] text-blue-600">دقيقة</div>
                                </div>
                            </div>

                            {/* Ingredients */}
                            <div>
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-emerald-500" />
                                    المكونات
                                </h3>
                                <div className="space-y-2">
                                    {selectedRecipe.ingredients.map((ing, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                                            <span className="font-medium text-slate-700 dark:text-white">{ing.name}</span>
                                            <span className="text-sm text-slate-500">{ing.amount} غرام</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div>
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-emerald-500" />
                                    طريقة التحضير
                                </h3>
                                <div className="space-y-3">
                                    {selectedRecipe.instructions.map((step, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-bold text-emerald-600">{idx + 1}</span>
                                            </div>
                                            <p className="text-slate-600 pt-0.5">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Add to Meal Button */}
                            <motion.button
                                className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2"
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    onAddRecipe(selectedRecipe.id);
                                    setShowRecipeDetail(false);
                                    toast.success('تمت إضافة الوصفة للوجبات!');
                                }}
                            >
                                <Plus className="w-5 h-5" />
                                أضف للوجبات اليوم
                            </motion.button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </motion.div>
    );
}

