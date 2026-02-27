// components/meal-planner/FoodsBrowserTab.tsx
// Foods browser with search, categories, and food cards

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, AlertTriangle, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FoodItem, categories } from '@/lib/mealDatabase';

interface FoodsBrowserTabProps {
    filteredFoods: FoodItem[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    getFoodSafety: (food: FoodItem) => { status: 'safe' | 'caution' | 'avoid'; warnings: string[] };
    onFoodClick: (food: FoodItem) => void;
    onQuickAdd: (foodId: string, amount: number, mealType: string) => void;
}

export default function FoodsBrowserTab({
    filteredFoods,
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    getFoodSafety,
    onFoodClick,
    onQuickAdd,
}: FoodsBrowserTabProps) {
    return (
        <motion.div
            key="foods"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
        >
            <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="ابحث عن طعام..."
                    className="pr-10 h-12 rounded-xl"
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                    <motion.button
                        key={cat.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap ${selectedCategory === cat.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600'
                            }`}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCategoryChange(cat.id)}
                    >
                        <span>{cat.icon}</span>
                        <span className="text-sm">{cat.name}</span>
                    </motion.button>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-3">
                {filteredFoods.map((food, index) => {
                    const safety = getFoodSafety(food);
                    return (
                        <motion.div
                            key={food.id}
                            className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm ${safety.status === 'avoid' ? 'opacity-50' : ''}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onFoodClick(food)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">{categories.find(c => c.id === food.category)?.icon || '🍽️'}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-800 dark:text-white">{food.nameAr}</h4>
                                        {safety.status === 'caution' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                                        {safety.status === 'avoid' && <X className="w-4 h-4 text-red-500" />}
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
                                    onClick={(e) => { e.stopPropagation(); onQuickAdd(food.id, food.servingSize, 'snack'); }}
                                >
                                    <Plus className="w-5 h-5 text-emerald-600" />
                                </motion.button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
