// components/meal-planner/FoodDetailView.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FoodItem, categories } from '@/lib/mealDatabase';

interface FoodDetailViewProps {
    food: FoodItem;
    safety: { status: string; warnings: string[] };
    onAddToMeal: (amount: number) => void;
}

export default function FoodDetailView({ food, safety, onAddToMeal }: FoodDetailViewProps) {
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
