// components/meal-planner/AddFoodForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { FoodItem } from '@/lib/mealDatabase';

interface AddFoodFormProps {
    foods: FoodItem[];
    onAdd: (foodId: string, amount: number) => void;
    categories: { id: string; name: string; icon: string }[];
    getFoodSafety: (food: FoodItem) => { status: string; warnings: string[] };
}

export default function AddFoodForm({ foods, onAdd, categories, getFoodSafety }: AddFoodFormProps) {
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
