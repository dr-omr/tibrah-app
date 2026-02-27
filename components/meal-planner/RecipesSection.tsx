// components/meal-planner/RecipesSection.tsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Clock, Flame, Beef, Wheat, Utensils, BookOpen, ChefHat } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { RecipeData, UserHealthProfile } from './types';
import { recipesDatabase } from '@/data/recipesData';

interface RecipesSectionProps {
    healthProfile: UserHealthProfile;
    onAddRecipe: (recipeId: string) => void;
}

export default function RecipesSection({ healthProfile, onAddRecipe }: RecipesSectionProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null);
    const [showRecipeDetail, setShowRecipeDetail] = useState(false);
    const [filterTag, setFilterTag] = useState<string>('all');

    // Filter recipes based on health conditions and search
    const filteredRecipes = useMemo(() => {
        return recipesDatabase.filter(recipe => {
            const isHealthSafe = healthProfile.conditions.every(condition => {
                if (condition === 'diabetes') return recipe.healthConditions.diabetes;
                if (condition === 'hypertension') return recipe.healthConditions.hypertension;
                if (condition === 'ibs') return recipe.healthConditions.ibs;
                return true;
            });
            const matchesSearch = searchQuery === '' ||
                recipe.nameAr.includes(searchQuery) ||
                recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
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
                            <div className="w-28 h-28 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-5xl">
                                {recipe.image}
                            </div>
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
                            <div className="text-center">
                                <div className="text-6xl mb-3">{selectedRecipe.image}</div>
                                <h2 className="text-2xl font-bold text-slate-800">{selectedRecipe.nameAr}</h2>
                                <p className="text-slate-500 text-sm mt-1">{selectedRecipe.description}</p>
                            </div>
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
