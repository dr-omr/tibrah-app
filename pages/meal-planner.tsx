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
    Target, Calendar, Utensils, ChefHat, TrendingUp, Sparkles, Loader2, Brain
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
                const firebaseFoods = await db.foods.list();
                if (firebaseFoods.length > 0) {
                    setCustomFoods(firebaseFoods as unknown as FoodItem[]);
                }
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
                    <div className="flex gap-2">
                        <motion.button
                            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
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
                            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowSettingsSheet(true)}
                        >
                            <Target className="w-5 h-5 text-white" />
                        </motion.button>
                    </div>
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

            {/* Daily Summary */}
            <DailySummary dailyTotals={dailyTotals} goals={healthProfile.goals} />

            {/* Tabs */}
            <div className="px-4 pt-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <motion.button
                                key={tab.id}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
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

            {/* AI Meal Plan Sheet */}
            <Sheet open={showAiPlanSheet} onOpenChange={setShowAiPlanSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-right flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-500" />
                            خطة وجبات ذكية
                        </SheetTitle>
                    </SheetHeader>
                    {aiMealPlan && (
                        <div className="space-y-4 mt-4 pb-8" dir="rtl">
                            {aiMealPlan.daily_calories && (
                                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                                    <span className="text-sm text-emerald-700 font-bold">
                                        🔥 السعرات المقترحة: {aiMealPlan.daily_calories} سعرة
                                    </span>
                                </div>
                            )}
                            {aiMealPlan.meals?.map((meal: any, i: number) => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-slate-800">{meal.name}</h4>
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">
                                            {meal.time} • {meal.calories} سعرة
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {meal.foods?.map((food: string, j: number) => (
                                            <span key={j} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{food}</span>
                                        ))}
                                    </div>
                                    {meal.benefits && (
                                        <p className="text-xs text-slate-500">💚 {meal.benefits}</p>
                                    )}
                                </div>
                            ))}
                            {aiMealPlan.snacks?.length > 0 && (
                                <div className="bg-amber-50 rounded-xl p-3">
                                    <p className="text-xs font-bold text-amber-700 mb-1">🍎 وجبات خفيفة:</p>
                                    {aiMealPlan.snacks.map((s: any, i: number) => (
                                        <p key={i} className="text-xs text-amber-600">• {s.name} ({s.time}): {s.foods?.join('، ')}</p>
                                    ))}
                                </div>
                            )}
                            {aiMealPlan.tips?.length > 0 && (
                                <div className="bg-blue-50 rounded-xl p-3">
                                    <p className="text-xs font-bold text-blue-700 mb-1">💡 نصائح:</p>
                                    {aiMealPlan.tips.map((t: string, i: number) => (
                                        <p key={i} className="text-xs text-blue-600">• {t}</p>
                                    ))}
                                </div>
                            )}
                            {aiMealPlan.hydration_plan && (
                                <p className="text-xs text-cyan-600 text-center">💧 {aiMealPlan.hydration_plan}</p>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
