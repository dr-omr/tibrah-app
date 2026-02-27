// components/meal-planner/MealPlanTab.tsx
// Meal plan tab showing meals by type with add/remove

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, AlertTriangle, Coffee, Sun, Moon as MoonIcon, Apple } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FoodItem, categories, NutritionInfo } from '@/lib/mealDatabase';
import { MealEntry } from './types';

export const mealTypes = [
    { id: 'breakfast', name: 'الفطور', icon: Coffee, time: '٧:٠٠ - ٩:٠٠', color: '#F59E0B', bg: 'bg-amber-50' },
    { id: 'lunch', name: 'الغداء', icon: Sun, time: '١٢:٠٠ - ٢:٠٠', color: '#2D9B83', bg: 'bg-emerald-50' },
    { id: 'dinner', name: 'العشاء', icon: MoonIcon, time: '٧:٠٠ - ٩:٠٠', color: '#8B5CF6', bg: 'bg-violet-50' },
    { id: 'snack', name: 'وجبة خفيفة', icon: Apple, time: 'أي وقت', color: '#EC4899', bg: 'bg-pink-50' },
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
                        <div className={`${meal.bg} px-4 py-3 flex items-center justify-between`}>
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center"
                                    whileTap={{ rotate: 10, scale: 0.9 }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: meal.color }} />
                                </motion.div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">{meal.name}</h3>
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
                                    onClick={() => onAddMeal(meal.id)}
                                >
                                    <Plus className="w-4 h-4" style={{ color: meal.color }} />
                                </motion.button>
                            </div>
                        </div>

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
                                    onClick={() => onAddMeal(meal.id)}
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
    );
}
