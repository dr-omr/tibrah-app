// components/meal-planner/MealPlanTab.tsx
// Premium meal plan tab — timeline-style meal sections with enhanced cards

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, AlertTriangle, Coffee, Sun, Moon as MoonIcon, Apple, Timer, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FoodItem, categories, NutritionInfo } from '@/lib/mealDatabase';
import { MealEntry } from './types';

export const mealTypes = [
    { id: 'breakfast', name: 'الفطور', icon: Coffee, time: '٧:٠٠ - ٩:٠٠', color: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-900/20', borderColor: 'border-amber-400', accentBg: 'bg-amber-400', emoji: '🌅' },
    { id: 'lunch', name: 'الغداء', icon: Sun, time: '١٢:٠٠ - ٢:٠٠', color: '#2D9B83', bg: 'bg-emerald-50 dark:bg-emerald-900/20', borderColor: 'border-emerald-400', accentBg: 'bg-emerald-400', emoji: '☀️' },
    { id: 'dinner', name: 'العشاء', icon: MoonIcon, time: '٧:٠٠ - ٩:٠٠', color: '#8B5CF6', bg: 'bg-violet-50 dark:bg-violet-900/20', borderColor: 'border-violet-400', accentBg: 'bg-violet-400', emoji: '🌙' },
    { id: 'snack', name: 'وجبة خفيفة', icon: Apple, time: 'أي وقت', color: '#EC4899', bg: 'bg-pink-50 dark:bg-pink-900/20', borderColor: 'border-pink-400', accentBg: 'bg-pink-400', emoji: '🍎' },
];

interface MealPlanTabProps {
    savedMeals: MealEntry[];
    getFood: (id: string) => FoodItem | undefined;
    getMealTypeNutrition: (type: string) => NutritionInfo;
    getFoodSafety: (food: FoodItem) => { status: 'safe' | 'caution' | 'avoid'; warnings: string[] };
    removeMeal: (mealId: string) => void;
    onAddMeal: (mealType: string) => void;
}

export default function MealPlanTab({
    savedMeals,
    getFood,
    getMealTypeNutrition,
    getFoodSafety,
    removeMeal,
    onAddMeal,
}: MealPlanTabProps) {
    const getMealsByType = (type: string) => savedMeals.filter(m => m.mealType === type);

    return (
        <motion.div
            key="plan"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-3.5"
        >
            {mealTypes.map((meal, index) => {
                const Icon = meal.icon;
                const mealItems = getMealsByType(meal.id);
                const nutrition = getMealTypeNutrition(meal.id);

                return (
                    <motion.div
                        key={meal.id}
                        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden border-r-[3.5px] ${meal.borderColor}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        {/* Meal Header */}
                        <div className={`${meal.bg} px-4 py-3 flex items-center justify-between`}>
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="w-10 h-10 rounded-xl bg-white/70 dark:bg-white/20 flex items-center justify-center shadow-sm"
                                    whileTap={{ rotate: 10, scale: 0.9 }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: meal.color }} />
                                </motion.div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white text-[15px]">{meal.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Timer className="w-3 h-3 text-slate-400" />
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{meal.time}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                {/* Calorie badge */}
                                <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-700/80 px-2.5 py-1.5 rounded-xl shadow-sm">
                                    <Flame className="w-3 h-3" style={{ color: meal.color }} />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                        {Math.round(nutrition.calories)}
                                    </span>
                                    <span className="text-[10px] text-slate-400">سعرة</span>
                                </div>
                                {/* Add button */}
                                <motion.button
                                    className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                                    style={{ backgroundColor: meal.color }}
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => onAddMeal(meal.id)}
                                >
                                    <Plus className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
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
                                        const itemCalories = Math.round(food.nutrition.calories * multiplier);
                                        const itemProtein = Math.round(food.nutrition.protein * multiplier);
                                        const itemCarbs = Math.round(food.nutrition.carbs * multiplier);

                                        return (
                                            <motion.div
                                                key={item.id}
                                                className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="text-2xl flex-shrink-0">{categories.find(c => c.id === food.category)?.icon || '🍽️'}</div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-slate-800 dark:text-white text-[14px] truncate">{food.nameAr}</span>
                                                            {safety.status === 'caution' && (
                                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[11px] text-slate-400">{item.amount} {food.servingUnit}</span>
                                                            <span className="text-[10px] text-slate-300">•</span>
                                                            {/* Mini macro pills */}
                                                            <span className="text-[10px] font-medium text-red-500/80">{itemProtein}غ بـ</span>
                                                            <span className="text-[10px] font-medium text-purple-500/80">{itemCarbs}غ كـ</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-sm font-bold" style={{ color: meal.color }}>
                                                        {itemCalories}
                                                    </span>
                                                    <motion.button
                                                        className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center"
                                                        whileTap={{ scale: 0.8 }}
                                                        onClick={() => removeMeal(item.id)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <motion.button
                                    className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl flex flex-col items-center gap-2 group"
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onAddMeal(meal.id)}
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-active:bg-slate-200 transition-colors">
                                        <Plus className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <span className="text-sm text-slate-400 font-medium">أضف {meal.name}</span>
                                    <span className="text-[11px] text-slate-300 dark:text-slate-600">
                                        {meal.emoji} ابدأ بإضافة أطعمة لهذه الوجبة
                                    </span>
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
