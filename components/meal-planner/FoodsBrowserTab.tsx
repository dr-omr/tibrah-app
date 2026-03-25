// components/meal-planner/FoodsBrowserTab.tsx
// Premium foods browser with search-first layout and enhanced food cards

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, AlertTriangle, X, Flame, Check } from 'lucide-react';
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
            {/* Search Bar — premium with glass effect */}
            <div className="relative">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <Input
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="ابحث عن طعام..."
                    className="pr-11 h-12 rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-card focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                />
                {searchQuery && (
                    <motion.button
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                        whileTap={{ scale: 0.85 }}
                        onClick={() => onSearchChange('')}
                    >
                        <X className="w-3.5 h-3.5 text-slate-500" />
                    </motion.button>
                )}
            </div>

            {/* Category Chips — enhanced with selected checkmark */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                        <motion.button
                            key={cat.id}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap text-sm font-medium border transition-all ${isSelected
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                }`}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onCategoryChange(cat.id)}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                        </motion.button>
                    );
                })}
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between px-0.5">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {filteredFoods.length} طعام متاح
                </p>
            </div>

            {/* Food Cards — enhanced with macro micro-bars */}
            <div className="grid grid-cols-1 gap-2.5">
                {filteredFoods.map((food, index) => {
                    const safety = getFoodSafety(food);
                    const maxCal = 500;
                    const calPercent = Math.min((food.nutrition.calories / maxCal) * 100, 100);

                    return (
                        <motion.div
                            key={food.id}
                            className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card border border-slate-100 dark:border-slate-700 ${safety.status === 'avoid' ? 'opacity-40' : ''}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.03, 0.3) }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onFoodClick(food)}
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
                                    {categories.find(c => c.id === food.category)?.icon || '🍽️'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-800 dark:text-white text-[14px] truncate">{food.nameAr}</h4>
                                        {safety.status === 'caution' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                                        {safety.status === 'avoid' && <X className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{food.servingSize} {food.servingUnit}</p>

                                    {/* Macro row with mini bars */}
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1">
                                            <div className="w-1 h-3 rounded-full bg-amber-400" />
                                            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">{food.nutrition.calories}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-1 h-3 rounded-full bg-red-400" />
                                            <span className="text-[11px] text-red-500 dark:text-red-400">{food.nutrition.protein}غ</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-1 h-3 rounded-full bg-purple-400" />
                                            <span className="text-[11px] text-purple-500 dark:text-purple-400">{food.nutrition.carbs}غ</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-1 h-3 rounded-full bg-blue-400" />
                                            <span className="text-[11px] text-blue-500 dark:text-blue-400">{food.nutrition.fat}غ</span>
                                        </div>
                                    </div>
                                </div>
                                <motion.button
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm flex-shrink-0"
                                    whileTap={{ scale: 0.85 }}
                                    onClick={(e) => { e.stopPropagation(); onQuickAdd(food.id, food.servingSize, 'snack'); }}
                                >
                                    <Plus className="w-5 h-5 text-white" />
                                </motion.button>
                            </div>
                        </motion.div>
                    );
                })}

                {filteredFoods.length === 0 && (
                    <div className="text-center py-12">
                        <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">لا توجد أطعمة تطابق بحثك</p>
                        <p className="text-xs text-slate-400 mt-1">جرّب كلمات بحث مختلفة</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
