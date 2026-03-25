// components/meal-planner/RecipesSection.tsx
// Premium recipe discovery with enhanced filters and card structure

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Clock, Flame, Beef, Wheat, Utensils, BookOpen, ChefHat, X, Check, Users } from 'lucide-react';
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

const tagEmojis: Record<string, string> = {
    'سكري': '💊',
    'ضغط الدم': '💉',
    'قولون': '🫁',
    'يمني': '🇾🇪',
    'خليجي': '🌴',
    'سعودي': '🇸🇦',
    'مصري': '🇪🇬',
    'لبناني': '🇱🇧',
    'فطور': '🌅',
    'نباتي': '🥬',
    'عالي البروتين': '💪',
};

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
            case 'easy': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
            case 'medium': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
            case 'hard': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
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
            {/* Search — premium glass style */}
            <div className="relative">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن وصفة..."
                    className="pr-11 h-12 rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-card focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                />
                {searchQuery && (
                    <motion.button
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                        whileTap={{ scale: 0.85 }}
                        onClick={() => setSearchQuery('')}
                    >
                        <X className="w-3.5 h-3.5 text-slate-500" />
                    </motion.button>
                )}
            </div>

            {/* Tags Filter — enhanced with emoji prefixes and checkmark */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {allTags.map((tag) => {
                    const isSelected = filterTag === tag;
                    const emoji = tag === 'all' ? '🍽️' : (tagEmojis[tag] || '');
                    return (
                        <motion.button
                            key={tag}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-all ${isSelected
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                }`}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterTag(tag)}
                        >
                            <span>{emoji}</span>
                            <span>{tag === 'all' ? 'الكل' : tag}</span>
                            {isSelected && tag !== 'all' && <Check className="w-3.5 h-3.5" />}
                        </motion.button>
                    );
                })}
            </div>

            {/* Results count */}
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium px-0.5">
                {filteredRecipes.length} وصفة
            </p>

            {/* Recipes Grid — enhanced with gradient overlays */}
            <div className="grid grid-cols-1 gap-3.5">
                {filteredRecipes.map((recipe, index) => (
                    <motion.div
                        key={recipe.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.05, 0.3) }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setSelectedRecipe(recipe);
                            setShowRecipeDetail(true);
                        }}
                    >
                        <div className="flex">
                            {/* Image area with gradient overlay */}
                            <div className="relative w-28 h-28 bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-100 dark:from-emerald-900/30 dark:to-teal-900/20 flex items-center justify-center text-5xl flex-shrink-0">
                                {recipe.image}
                                {/* Gradient overlay for depth */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/[0.03]" />
                            </div>
                            <div className="flex-1 p-3.5 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-800 dark:text-white text-[14px] truncate">{recipe.nameAr}</h3>
                                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{recipe.description}</p>
                                    </div>
                                    <Badge className={`${getDifficultyColor(recipe.difficulty)} border-0 text-[10px] font-bold px-2 py-0.5 flex-shrink-0`}>
                                        {getDifficultyLabel(recipe.difficulty)}
                                    </Badge>
                                </div>

                                {/* Metadata row */}
                                <div className="flex items-center gap-3 mt-2.5">
                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="font-medium">{recipe.prepTime + recipe.cookTime} د</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                        <Flame className="w-3.5 h-3.5" />
                                        <span className="font-medium">{recipe.calories}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                                        <Beef className="w-3.5 h-3.5" />
                                        <span className="font-medium">{recipe.protein}غ</span>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex gap-1.5 mt-2">
                                    {recipe.tags.slice(0, 3).map((tag) => (
                                        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400">
                                            {tagEmojis[tag] ? `${tagEmojis[tag]} ` : ''}{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredRecipes.length === 0 && (
                    <div className="text-center py-12">
                        <ChefHat className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 font-medium">لا توجد وصفات تطابق بحثك</p>
                        <p className="text-xs text-slate-400 mt-1">جرّب تغيير الفلاتر أو كلمات البحث</p>
                    </div>
                )}
            </div>

            {/* Recipe Detail Sheet — enhanced */}
            <Sheet open={showRecipeDetail} onOpenChange={setShowRecipeDetail}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
                    {selectedRecipe && (
                        <div className="py-4 space-y-6">
                            {/* Hero */}
                            <div className="text-center">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 flex items-center justify-center text-6xl mx-auto mb-3 shadow-sm">
                                    {selectedRecipe.image}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedRecipe.nameAr}</h2>
                                <p className="text-slate-500 text-sm mt-1">{selectedRecipe.description}</p>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <Badge className={`${getDifficultyColor(selectedRecipe.difficulty)} border-0 text-xs`}>
                                        {getDifficultyLabel(selectedRecipe.difficulty)}
                                    </Badge>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {selectedRecipe.servings} أشخاص
                                    </span>
                                </div>
                            </div>

                            {/* Nutrition grid */}
                            <div className="grid grid-cols-4 gap-2">
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3 text-center border border-amber-100 dark:border-amber-800/30">
                                    <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                    <div className="font-bold text-amber-700 dark:text-amber-400">{selectedRecipe.calories}</div>
                                    <div className="text-[10px] text-amber-600 dark:text-amber-400/80 font-medium">سعرة</div>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-3 text-center border border-red-100 dark:border-red-800/30">
                                    <Beef className="w-5 h-5 text-red-500 mx-auto mb-1" />
                                    <div className="font-bold text-red-700 dark:text-red-400">{selectedRecipe.protein}غ</div>
                                    <div className="text-[10px] text-red-600 dark:text-red-400/80 font-medium">بروتين</div>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-3 text-center border border-purple-100 dark:border-purple-800/30">
                                    <Wheat className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                                    <div className="font-bold text-purple-700 dark:text-purple-400">{selectedRecipe.carbs}غ</div>
                                    <div className="text-[10px] text-purple-600 dark:text-purple-400/80 font-medium">كربو</div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 text-center border border-blue-100 dark:border-blue-800/30">
                                    <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                    <div className="font-bold text-blue-700 dark:text-blue-400">{selectedRecipe.prepTime + selectedRecipe.cookTime}</div>
                                    <div className="text-[10px] text-blue-600 dark:text-blue-400/80 font-medium">دقيقة</div>
                                </div>
                            </div>

                            {/* Ingredients */}
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-emerald-500" />
                                    المكونات
                                </h3>
                                <div className="space-y-2">
                                    {selectedRecipe.ingredients.map((ing, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded-xl p-3 border border-slate-100 dark:border-slate-600/50">
                                            <span className="font-medium text-slate-700 dark:text-white text-sm">{ing.name}</span>
                                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{ing.amount} غرام</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-emerald-500" />
                                    طريقة التحضير
                                </h3>
                                <div className="space-y-3">
                                    {selectedRecipe.instructions.map((step, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-700/50">
                                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{idx + 1}</span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 pt-0.5 text-sm leading-relaxed">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Add button */}
                            <motion.button
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
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
