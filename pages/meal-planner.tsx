// pages/meal-planner.tsx
// ════════════════════════════════════════════════════════
// Premium Meal Planning System — Orchestrator
// ════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/components/notification-engine';
import dynamic from 'next/dynamic';
import {
    Target, Calendar, Utensils, ChefHat, TrendingUp, Sparkles, Loader2,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
    foodDatabase, categories, calculateTotalNutrition, healthConditions,
    FoodItem, Recipe, preloadMealData,
} from '@/lib/mealDatabase';
import { recipesDatabase } from '@/data/recipesData';
import { MealEntry, UserHealthProfile, defaultGoals } from '@/components/meal-planner/types';
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
const AiPlanSheet = dynamic(() => import('@/components/meal-planner/AiPlanSheet'), { ssr: false });

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

    const { data: savedMeals = [] } = useQuery<MealEntry[]>({
        queryKey: ['mealEntries', format(selectedDate, 'yyyy-MM-dd')],
        queryFn: () => {
            if (typeof window !== 'undefined') { const key = `meals_${format(selectedDate, 'yyyy-MM-dd')}`; const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : []; }
            return [];
        },
    });

    const { data: healthProfile = { conditions: [], allergies: [], goals: defaultGoals } } = useQuery<UserHealthProfile>({
        queryKey: ['healthProfile'],
        queryFn: () => {
            if (typeof window !== 'undefined') { const saved = localStorage.getItem('mealPlannerProfile'); return saved ? JSON.parse(saved) : { conditions: [], allergies: [], goals: defaultGoals }; }
            return { conditions: [], allergies: [], goals: defaultGoals };
        },
    });

    const dailyTotals = useMemo(() => calculateTotalNutrition(savedMeals.map(m => ({ foodId: m.foodId, amount: m.amount }))), [savedMeals]);

    const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
    const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        preloadMealData();
        const loadCustomData = async () => {
            try {
                const { db } = await import('@/lib/db');
                const firebaseFoods = await db.entities.Food.list();
                if (firebaseFoods.length > 0) setCustomFoods(firebaseFoods as unknown as FoodItem[]);
                const firebaseRecipes = await db.entities.Recipe.list();
                if (firebaseRecipes.length > 0) setCustomRecipes(firebaseRecipes as unknown as Recipe[]);
            } catch (e) { console.error('Failed to load from Firebase:', e); }
        };
        loadCustomData();
    }, []);

    const allFoods = useMemo(() => [...foodDatabase, ...customFoods], [customFoods]);

    const filteredFoods = useMemo(() => {
        let foods = allFoods;
        if (searchQuery) { const query = searchQuery.toLowerCase(); foods = foods.filter(f => f.nameAr.includes(searchQuery) || f.name.toLowerCase().includes(query)); }
        if (selectedCategory !== 'all') foods = foods.filter(f => f.category === selectedCategory);
        if (healthProfile.conditions.length > 0) foods = foods.filter(food => healthProfile.conditions.every(condition => { const status = food.healthConditions[condition as keyof typeof food.healthConditions]; return status !== 'avoid'; }));
        return foods;
    }, [searchQuery, selectedCategory, healthProfile.conditions, allFoods]);

    const getFood = useCallback((id: string) => allFoods.find(f => f.id === id), [allFoods]);
    const weekDates = useMemo(() => { const start = startOfWeek(selectedDate, { weekStartsOn: 6 }); return Array.from({ length: 7 }, (_, i) => addDays(start, i)); }, [selectedDate]);
    const dateHasMeals = useCallback((date: Date) => { if (typeof window === 'undefined') return false; const key = `meals_${format(date, 'yyyy-MM-dd')}`; const saved = localStorage.getItem(key); if (!saved) return false; try { return JSON.parse(saved).length > 0; } catch { return false; } }, []);

    const addMeal = useCallback((foodId: string, amount: number, mealType: string) => {
        const entry: MealEntry = { id: Date.now().toString(), foodId, amount, mealType: mealType as MealEntry['mealType'] };
        const key = `meals_${format(selectedDate, 'yyyy-MM-dd')}`;
        if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify([...savedMeals, entry]));
        queryClient.invalidateQueries({ queryKey: ['mealEntries'] });
        toast.success('تمت إضافة الوجبة'); setShowAddFoodSheet(false);
    }, [savedMeals, selectedDate, queryClient]);

    const removeMeal = useCallback((mealId: string) => {
        const key = `meals_${format(selectedDate, 'yyyy-MM-dd')}`;
        if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(savedMeals.filter(m => m.id !== mealId)));
        queryClient.invalidateQueries({ queryKey: ['mealEntries'] }); toast.success('تم حذف الوجبة');
    }, [savedMeals, selectedDate, queryClient]);

    const getMealTypeNutrition = useCallback((type: string) => calculateTotalNutrition(savedMeals.filter(m => m.mealType === type).map(m => ({ foodId: m.foodId, amount: m.amount }))), [savedMeals]);

    const getFoodSafety = useCallback((food: FoodItem) => {
        const warnings: string[] = []; let worstStatus: 'safe' | 'caution' | 'avoid' = 'safe';
        healthProfile.conditions.forEach(condition => {
            const status = food.healthConditions[condition as keyof typeof food.healthConditions];
            const conditionName = healthConditions.find(c => c.id === condition)?.nameAr || condition;
            if (status === 'avoid') { worstStatus = 'avoid'; warnings.push(`⛔ غير مناسب لـ${conditionName}`); }
            else if (status === 'caution' && worstStatus !== 'avoid') { worstStatus = 'caution'; warnings.push(`⚠️ احذر - ${conditionName}`); }
        });
        return { status: worstStatus, warnings };
    }, [healthProfile.conditions]);

    const tabs = [
        { id: 'plan' as const, label: 'الخطة', icon: Calendar },
        { id: 'foods' as const, label: 'الأطعمة', icon: Utensils },
        { id: 'recipes' as const, label: 'الوصفات', icon: ChefHat },
        { id: 'analytics' as const, label: 'التحليل', icon: TrendingUp },
    ];

    const generateAiMealPlan = useCallback(async () => {
        setAiMealLoading(true);
        try {
            const result = await aiClient.planMeals({ conditions: healthProfile.conditions, allergies: healthProfile.allergies, calorie_goal: healthProfile.goals.calories, protein_goal: healthProfile.goals.protein }, { region: 'يمن', style: 'صحي وطبيعي' });
            setAiMealPlan(result); setShowAiPlanSheet(true);
        } catch { toast.error('تعذر إنشاء خطة الوجبات'); }
        finally { setAiMealLoading(false); }
    }, [healthProfile]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            {/* Header */}
            <motion.div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white overflow-hidden"
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-12 -left-12 w-40 h-40 border-[2px] border-white/10 rounded-full" />
                    <div className="absolute top-8 -right-8 w-24 h-24 border-[2px] border-white/10 rounded-full" />
                    <div className="absolute -bottom-10 left-1/3 w-32 h-32 border-[2px] border-white/10 rounded-full" />
                </div>
                <div className="relative px-5 pt-5 pb-4">
                    <div className="flex items-center justify-between mb-5">
                        <div><h1 className="text-[22px] font-extrabold tracking-tight">تخطيط الوجبات</h1><p className="text-white/60 text-sm mt-0.5">{format(selectedDate, 'EEEE، d MMMM', { locale: ar })}</p></div>
                        <div className="flex gap-2">
                            <motion.button className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10" whileTap={{ scale: 0.9 }} onClick={generateAiMealPlan} disabled={aiMealLoading}>
                                {aiMealLoading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Sparkles className="w-5 h-5 text-white" />}
                            </motion.button>
                            <motion.button className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10" whileTap={{ scale: 0.9 }} onClick={() => setShowSettingsSheet(true)}>
                                <Target className="w-5 h-5 text-white" />
                            </motion.button>
                        </div>
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                        {weekDates.map((date, index) => {
                            const isSelected = isSameDay(date, selectedDate); const hasMeals = dateHasMeals(date);
                            return (
                                <motion.button key={index} className={`flex-shrink-0 w-[13%] min-w-[46px] h-[72px] rounded-2xl flex flex-col items-center justify-center transition-all relative ${isSelected ? 'bg-white text-emerald-600 shadow-lg shadow-emerald-900/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                    whileTap={{ scale: 0.9 }} onClick={() => setSelectedDate(date)}>
                                    <span className={`text-[11px] font-semibold ${isSelected ? 'text-emerald-500' : 'opacity-60'}`}>{format(date, 'EEE', { locale: ar })}</span>
                                    <span className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-emerald-600' : ''}`}>{format(date, 'd')}</span>
                                    {hasMeals && <div className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-white/80'}`} />}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
                <div className="h-5 bg-slate-50 dark:bg-slate-900 rounded-t-[1.5rem]" />
            </motion.div>

            <DailySummary dailyTotals={dailyTotals} goals={healthProfile.goals} />

            {/* Tab Bar */}
            <div className="px-4 pt-5 pb-1 sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-card border border-slate-100 dark:border-slate-700">
                    {tabs.map(tab => { const Icon = tab.icon; const isActive = activeTab === tab.id; return (
                        <motion.button key={tab.id} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm transition-all relative ${isActive ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                            whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(tab.id)}><Icon className="w-4 h-4" /><span className="text-[13px]">{tab.label}</span></motion.button>
                    ); })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 pt-4 space-y-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'plan' && <MealPlanTab savedMeals={savedMeals} getFood={getFood} getMealTypeNutrition={getMealTypeNutrition} getFoodSafety={getFoodSafety} removeMeal={removeMeal} onAddMeal={mealType => { setSelectedMealType(mealType); setShowAddFoodSheet(true); }} />}
                    {activeTab === 'foods' && <FoodsBrowserTab filteredFoods={filteredFoods} searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} getFoodSafety={getFoodSafety} onFoodClick={food => { setSelectedFood(food); setShowFoodDetailSheet(true); }} onQuickAdd={addMeal} />}
                    {activeTab === 'analytics' && <AnalyticsTab dailyTotals={dailyTotals} goals={healthProfile.goals} conditions={healthProfile.conditions} />}
                    {activeTab === 'recipes' && <RecipesSection healthProfile={healthProfile} onAddRecipe={recipeId => { const recipe = recipesDatabase.find(r => r.id === recipeId); if (recipe) recipe.ingredients.forEach(ing => addMeal(ing.foodId, ing.amount, 'lunch')); }} />}
                </AnimatePresence>
            </div>

            {/* Sheets */}
            <Sheet open={showAddFoodSheet} onOpenChange={setShowAddFoodSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
                    <SheetHeader><SheetTitle className="text-right">إضافة طعام لـ{mealTypes.find(m => m.id === selectedMealType)?.name}</SheetTitle></SheetHeader>
                    <AddFoodForm foods={filteredFoods} onAdd={(foodId, amount) => addMeal(foodId, amount, selectedMealType)} categories={categories} getFoodSafety={getFoodSafety} />
                </SheetContent>
            </Sheet>

            <Sheet open={showFoodDetailSheet} onOpenChange={setShowFoodDetailSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
                    {selectedFood && <FoodDetailView food={selectedFood} safety={getFoodSafety(selectedFood)} onAddToMeal={amount => { addMeal(selectedFood.id, amount, 'snack'); setShowFoodDetailSheet(false); }} />}
                </SheetContent>
            </Sheet>

            <Sheet open={showSettingsSheet} onOpenChange={setShowSettingsSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
                    <SheetHeader><SheetTitle className="text-right">الأهداف والحالة الصحية</SheetTitle></SheetHeader>
                    <HealthSettingsForm profile={healthProfile} conditions={healthConditions} onSave={newProfile => {
                        if (typeof window !== 'undefined') localStorage.setItem('mealPlannerProfile', JSON.stringify(newProfile));
                        queryClient.invalidateQueries({ queryKey: ['healthProfile'] }); setShowSettingsSheet(false); toast.success('تم حفظ الإعدادات');
                    }} />
                </SheetContent>
            </Sheet>

            <AiPlanSheet open={showAiPlanSheet} onOpenChange={setShowAiPlanSheet} aiMealPlan={aiMealPlan} />
        </div>
    );
}
