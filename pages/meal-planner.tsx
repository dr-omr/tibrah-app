// pages/meal-planner.tsx
// Premium Meal Planning System — refactored with sub-components

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import {
    Target, Calendar, Utensils, ChefHat, TrendingUp, Sparkles, Loader2, Brain, ArrowRight
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
    foodDatabase, categories, searchFoods,
    calculateTotalNutrition, healthConditions, getSafeFoodsForCondition,
    FoodItem, NutritionInfo, MealPlan, recipeDatabase, Recipe,
    preloadMealData
} from '@/lib/mealDatabase';
import { recipesDatabase } from '@/data/recipesData';
import { MealEntry, UserHealthProfile, DailyGoals, defaultGoals } from '@/components/meal-planner/types';
import { aiClient } from '@/components/ai/aiClient';

// Dynamic imports for code splitting
const AddFoodForm = dynamic(() => import('@/components/meal-planner/AddFoodForm'), { ssr: false });
const FoodDetailView = dynamic(() => import('@/components/meal-planner/FoodDetailView'), { ssr: false });
const HealthSettingsForm = dynamic(() => import('@/components/meal-planner/HealthSettingsForm'), { ssr: false });
const RecipesSection = dynamic(() => import('@/components/meal-planner/RecipesSection'), { ssr: false });
const DailySummary = dynamic(() => import('@/components/meal-planner/DailySummary'), { ssr: false });
const MealPlanTab = dynamic(() => import('@/components/meal-planner/MealPlanTab'), { ssr: false });
const FoodsBrowserTab = dynamic(() => import('@/components/meal-planner/FoodsBrowserTab'), { ssr: false });
const AnalyticsTab = dynamic(() => import('@/components/meal-planner/AnalyticsTab'), { ssr: false });

// Import mealTypes for the sheet title
import { mealTypes } from '@/components/meal-planner/MealPlanTab';

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
    const [aiMealPlan, setAiMealPlan] = useState<any>(null);
    const [aiMealLoading, setAiMealLoading] = useState(false);
    const [showAiPlanSheet, setShowAiPlanSheet] = useState(false);

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
        // Preload meal data from JSON
        preloadMealData();

        const loadCustomData = async () => {
            try {
                const { db } = await import('@/lib/db');
                const firebaseFoods = await db.entities.Food.list();
                if (firebaseFoods.length > 0) {
                    setCustomFoods(firebaseFoods as unknown as FoodItem[]);
                }
                const firebaseRecipes = await db.entities.Recipe.list();
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
    const allFoods = useMemo(() => [...foodDatabase, ...customFoods], [customFoods]);

    // Filter foods based on search and category
    const filteredFoods = useMemo(() => {
        let foods = allFoods;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            foods = foods.filter(f => f.nameAr.includes(searchQuery) || f.name.toLowerCase().includes(query));
        }
        if (selectedCategory !== 'all') {
            foods = foods.filter(f => f.category === selectedCategory);
        }
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

    const getFood = useCallback((id: string): FoodItem | undefined => {
        return allFoods.find(f => f.id === id);
    }, [allFoods]);

    const weekDates = useMemo(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 6 });
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [selectedDate]);

    // Check if a date has meals
    const dateHasMeals = useCallback((date: Date): boolean => {
        if (typeof window === 'undefined') return false;
        const key = `meals_${format(date, 'yyyy-MM-dd')}`;
        const saved = localStorage.getItem(key);
        if (!saved) return false;
        try { return JSON.parse(saved).length > 0; } catch { return false; }
    }, []);

    const addMeal = useCallback((foodId: string, amount: number, mealType: string) => {
        const entry: MealEntry = {
            id: Date.now().toString(),
            foodId,
            amount,
            mealType: mealType as MealEntry['mealType']
        };
        const key = `meals_${format(selectedDate, 'yyyy-MM-dd')}`;
        const updated = [...savedMeals, entry];
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(updated));
        }
        queryClient.invalidateQueries({ queryKey: ['mealEntries'] });
        toast.success('تمت إضافة الوجبة');
        setShowAddFoodSheet(false);
    }, [savedMeals, selectedDate, queryClient]);

    const removeMeal = useCallback((mealId: string) => {
        const key = `meals_${format(selectedDate, 'yyyy-MM-dd')}`;
        const updated = savedMeals.filter(m => m.id !== mealId);
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(updated));
        }
        queryClient.invalidateQueries({ queryKey: ['mealEntries'] });
        toast.success('تم حذف الوجبة');
    }, [savedMeals, selectedDate, queryClient]);

    const getMealTypeNutrition = useCallback((type: string) => {
        const meals = savedMeals.filter(m => m.mealType === type);
        return calculateTotalNutrition(meals.map(m => ({ foodId: m.foodId, amount: m.amount })));
    }, [savedMeals]);

    const getFoodSafety = useCallback((food: FoodItem): { status: 'safe' | 'caution' | 'avoid'; warnings: string[] } => {
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
    }, [healthProfile.conditions]);

    const tabs = [
        { id: 'plan' as const, label: 'الخطة', icon: Calendar },
        { id: 'foods' as const, label: 'الأطعمة', icon: Utensils },
        { id: 'recipes' as const, label: 'الوصفات', icon: ChefHat },
        { id: 'analytics' as const, label: 'التحليل', icon: TrendingUp },
    ];

    // AI Meal Plan Generator
    const generateAiMealPlan = useCallback(async () => {
        setAiMealLoading(true);
        try {
            const result = await aiClient.planMeals(
                {
                    conditions: healthProfile.conditions,
                    allergies: healthProfile.allergies,
                    calorie_goal: healthProfile.goals.calories,
                    protein_goal: healthProfile.goals.protein,
                },
                { region: 'يمن', style: 'صحي وطبيعي' }
            );
            setAiMealPlan(result);
            setShowAiPlanSheet(true);
        } catch (err) {
            toast.error('تعذر إنشاء خطة الوجبات');
        } finally {
            setAiMealLoading(false);
        }
    }, [healthProfile]);

    const caloriePercent = Math.min(Math.round((dailyTotals.calories / healthProfile.goals.calories) * 100), 100);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            {/* ─── Premium Header ─── */}
            <motion.div
                className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white overflow-hidden"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Decorative circles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-12 -left-12 w-40 h-40 border-[2px] border-white/10 rounded-full" />
                    <div className="absolute top-8 -right-8 w-24 h-24 border-[2px] border-white/10 rounded-full" />
                    <div className="absolute -bottom-10 left-1/3 w-32 h-32 border-[2px] border-white/10 rounded-full" />
                </div>

                <div className="relative px-5 pt-5 pb-4">
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-[22px] font-extrabold tracking-tight">تخطيط الوجبات</h1>
                            <p className="text-white/60 text-sm mt-0.5">
                                {format(selectedDate, 'EEEE، d MMMM', { locale: ar })}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10"
                                whileTap={{ scale: 0.9 }}
                                onClick={generateAiMealPlan}
                                disabled={aiMealLoading}
                            >
                                {aiMealLoading ? (
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                    <Sparkles className="w-5 h-5 text-white" />
                                )}
                            </motion.button>
                            <motion.button
                                className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowSettingsSheet(true)}
                            >
                                <Target className="w-5 h-5 text-white" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Week Calendar — improved touch targets */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                        {weekDates.map((date, index) => {
                            const isSelected = isSameDay(date, selectedDate);
                            const hasMeals = dateHasMeals(date);
                            return (
                                <motion.button
                                    key={index}
                                    className={`flex-shrink-0 w-[13%] min-w-[46px] h-[72px] rounded-2xl flex flex-col items-center justify-center transition-all relative ${isSelected
                                        ? 'bg-white text-emerald-600 shadow-lg shadow-emerald-900/20'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedDate(date)}
                                >
                                    <span className={`text-[11px] font-semibold ${isSelected ? 'text-emerald-500' : 'opacity-60'}`}>
                                        {format(date, 'EEE', { locale: ar })}
                                    </span>
                                    <span className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-emerald-600' : ''}`}>
                                        {format(date, 'd')}
                                    </span>
                                    {/* Meal indicator dot */}
                                    {hasMeals && (
                                        <div className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-white/80'}`} />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Rounded bottom edge */}
                <div className="h-5 bg-slate-50 dark:bg-slate-900 rounded-t-[1.5rem]" />
            </motion.div>

            {/* ─── Daily Summary ─── */}
            <DailySummary dailyTotals={dailyTotals} goals={healthProfile.goals} />

            {/* ─── Premium Tab Bar ─── */}
            <div className="px-4 pt-5 pb-1 sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-card border border-slate-100 dark:border-slate-700">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <motion.button
                                key={tab.id}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm transition-all relative ${isActive
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-[13px]">{tab.label}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ─── Tab Content ─── */}
            <div className="px-4 pt-4 space-y-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'plan' && (
                        <MealPlanTab
                            savedMeals={savedMeals}
                            getFood={getFood}
                            getMealTypeNutrition={getMealTypeNutrition}
                            getFoodSafety={getFoodSafety}
                            removeMeal={removeMeal}
                            onAddMeal={(mealType) => {
                                setSelectedMealType(mealType);
                                setShowAddFoodSheet(true);
                            }}
                        />
                    )}

                    {activeTab === 'foods' && (
                        <FoodsBrowserTab
                            filteredFoods={filteredFoods}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            getFoodSafety={getFoodSafety}
                            onFoodClick={(food) => { setSelectedFood(food); setShowFoodDetailSheet(true); }}
                            onQuickAdd={addMeal}
                        />
                    )}

                    {activeTab === 'analytics' && (
                        <AnalyticsTab
                            dailyTotals={dailyTotals}
                            goals={healthProfile.goals}
                            conditions={healthProfile.conditions}
                        />
                    )}

                    {activeTab === 'recipes' && (
                        <RecipesSection
                            healthProfile={healthProfile}
                            onAddRecipe={(recipeId) => {
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

            {/* ─── Add Food Sheet ─── */}
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

            {/* ─── Food Detail Sheet ─── */}
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

            {/* ─── Settings Sheet ─── */}
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

            {/* ─── AI Meal Plan Sheet (Therapeutic Kitchen) ─── */}
            <Sheet open={showAiPlanSheet} onOpenChange={setShowAiPlanSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto bg-slate-50 dark:bg-slate-900 border-none p-0">
                    <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 p-5 pt-8">
                        <SheetTitle className="text-right flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-800 dark:text-white leading-tight">الطباخ العلاجي الذكي</h2>
                                    <p className="text-xs text-slate-500 font-medium">خطة مصممة كدواء خصيصاً لحالتك</p>
                                </div>
                            </div>
                        </SheetTitle>
                    </div>

                    {aiMealPlan && (
                        <div className="p-5 pb-12 space-y-5">
                            {/* Calories & Goal */}
                            {aiMealPlan.daily_calories && (
                                <motion.div 
                                    className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-emerald-100 text-xs font-bold mb-1">الهدف السعري العلاجي</p>
                                            <p className="text-3xl font-black">{aiMealPlan.daily_calories} <span className="text-sm font-semibold opacity-80">سعرة</span></p>
                                        </div>
                                        <Target className="w-10 h-10 text-emerald-200/50" />
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/20">
                                        <p className="text-xs font-medium text-emerald-50 flex items-center gap-1.5">
                                            <Brain className="w-4 h-4" /> تم التصميم بناءً على ملفك الطبي الدقيق
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Grocery List (Therapeutic) */}
                            {aiMealPlan.grocery_list && aiMealPlan.grocery_list.length > 0 && (
                                <motion.div 
                                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                                >
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
                                        <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center text-xs">🛒</span>
                                        قائمة التسوق العلاجية
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {aiMealPlan.grocery_list.map((item: string, i: number) => (
                                            <span key={i} className="text-xs font-bold bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-600">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Core Meals */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 px-1">الوجبات المطلوبة</h3>
                                {aiMealPlan.meals?.map((meal: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/50 p-4 shadow-sm transition-colors"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 + 0.2 }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm">
                                                    {meal.name.includes('فطور') ? '🌅' : meal.name.includes('غداء') ? '☀️' : '🌙'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{meal.name}</h4>
                                                    <span className="text-[10px] font-bold text-slate-400">{meal.time}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-bold">
                                                {meal.calories} سعرة
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-3 pl-10">
                                            {meal.foods?.map((food: string, j: number) => (
                                                <div key={j} className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                    {food}
                                                </div>
                                            ))}
                                        </div>

                                        {meal.benefits && (
                                            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-3 border border-emerald-100/50 dark:border-emerald-800/30">
                                                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed flex items-start gap-1.5">
                                                    <span className="text-emerald-500 mt-0.5">⚕️</span>
                                                    {meal.benefits}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {aiMealPlan.hydration_plan && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800/30">
                                        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1.5 flex items-center gap-1">💧 الارتواء</p>
                                        <p className="text-xs font-medium text-blue-600/80 dark:text-blue-300/80 leading-relaxed">{aiMealPlan.hydration_plan}</p>
                                    </div>
                                )}
                                {aiMealPlan.supplements && aiMealPlan.supplements.length > 0 && (
                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-800/30">
                                        <p className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-1.5 flex items-center gap-1">💊 مكملات</p>
                                        <ul className="space-y-1">
                                            {aiMealPlan.supplements.map((s: string, i: number) => (
                                                <li key={i} className="text-xs font-medium text-purple-600/80 dark:text-purple-300/80 leading-relaxed">• {s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {aiMealPlan.tips?.length > 0 && (
                                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-100/50 dark:border-amber-800/20 text-center">
                                    <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
                                        {aiMealPlan.tips[0]}
                                    </p>
                                </div>
                            )}

                            <Button 
                                className="w-full h-12 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold mt-4"
                                onClick={() => setShowAiPlanSheet(false)}
                            >
                                اعتماد هذه الخطة
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
