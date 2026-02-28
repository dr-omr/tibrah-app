// lib/mealDatabase.ts
// Lazy-loaded from /public/data/meal-database.json
// Previously 89 KB embedded in bundle — now loaded on demand

// Re-export types for backward compat
export type { NutritionInfo, HealthCondition, FoodItem, Recipe, MealPlan } from './mealTypes';
import type { HealthCondition, FoodItem, Recipe } from './mealTypes';

// Food categories (static, small — kept inline)
export const categories = [
    { id: 'all', name: 'الكل', icon: '🍽️' },
    { id: 'grains', name: 'الحبوب', icon: '🌾' },
    { id: 'protein', name: 'البروتين', icon: '🥩' },
    { id: 'vegetables', name: 'الخضروات', icon: '🥬' },
    { id: 'fruits', name: 'الفواكه', icon: '🍎' },
    { id: 'dairy', name: 'الألبان', icon: '🥛' },
    { id: 'legumes', name: 'البقوليات', icon: '🫘' },
    { id: 'nuts', name: 'المكسرات', icon: '🥜' },
    { id: 'oils', name: 'الزيوت', icon: '🫒' },
    { id: 'spices', name: 'التوابل', icon: '🧂' },
    { id: 'beverages', name: 'المشروبات', icon: '🥤' },
    { id: 'sweets', name: 'الحلويات', icon: '🍯' },
];

// ============================================
// Cache for loaded data
// ============================================
let _cachedFoods: FoodItem[] | null = null;
let _cachedConditions: HealthCondition[] | null = null;
let _cachedRecipes: Recipe[] | null = null;
let _loadPromise: Promise<void> | null = null;

// ============================================
// Lazy-load function — fetches JSON on first use
// ============================================
async function loadData(): Promise<void> {
    if (_cachedFoods && _cachedConditions && _cachedRecipes) return;
    if (_loadPromise) return _loadPromise;

    _loadPromise = fetch('/data/meal-database.json')
        .then(res => res.json())
        .then(data => {
            _cachedFoods = data.foodDatabase;
            _cachedConditions = data.healthConditions;
            _cachedRecipes = data.recipeDatabase;
        })
        .catch(err => {
            console.error('Failed to load meal database:', err);
            _cachedFoods = [];
            _cachedConditions = [];
            _cachedRecipes = [];
        });

    return _loadPromise;
}

// ============================================
// Async accessors (preferred)
// ============================================

export async function getFoodDatabase(): Promise<FoodItem[]> {
    await loadData();
    return _cachedFoods || [];
}

export async function getHealthConditions(): Promise<HealthCondition[]> {
    await loadData();
    return _cachedConditions || [];
}

export async function getRecipeDatabase(): Promise<Recipe[]> {
    await loadData();
    return _cachedRecipes || [];
}

export async function searchFoodsAsync(query: string): Promise<FoodItem[]> {
    const foods = await getFoodDatabase();
    const q = query.toLowerCase();
    return foods.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.nameAr.includes(query)
    );
}

// ============================================
// Synchronous backward-compatible exports (Proxy-based)
// Components should call preloadMealData() in useEffect
// ============================================

/** @deprecated Use getFoodDatabase() async instead */
export const foodDatabase: FoodItem[] = new Proxy([] as FoodItem[], {
    get(target, prop) {
        if (_cachedFoods) return Reflect.get(_cachedFoods, prop);
        loadData();
        return Reflect.get(target, prop);
    }
});

/** @deprecated Use getHealthConditions() async instead */
export const healthConditions: HealthCondition[] = new Proxy([] as HealthCondition[], {
    get(target, prop) {
        if (_cachedConditions) return Reflect.get(_cachedConditions, prop);
        loadData();
        return Reflect.get(target, prop);
    }
});

/** @deprecated Use getRecipeDatabase() async instead */
export const recipeDatabase: Recipe[] = new Proxy([] as Recipe[], {
    get(target, prop) {
        if (_cachedRecipes) return Reflect.get(_cachedRecipes, prop);
        loadData();
        return Reflect.get(target, prop);
    }
});

/** Preload data — call in useEffect to ensure data is ready */
export const preloadMealData = loadData;

// ============================================
// Utility functions (sync — operate on cached data)
// ============================================

/** Search foods by name (sync, uses cached data) */
export function searchFoods(query: string): FoodItem[] {
    if (!_cachedFoods) return [];
    const q = query.toLowerCase();
    return _cachedFoods.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.nameAr.includes(query)
    );
}

/** Calculate total nutrition from meal items */
export function calculateTotalNutrition(
    items: { foodId: string; amount: number }[]
): import('./mealTypes').NutritionInfo {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 };
    const foods = _cachedFoods || [];

    items.forEach(item => {
        const food = foods.find(f => f.id === item.foodId);
        if (food) {
            const ratio = item.amount / food.servingSize;
            totals.calories += food.nutrition.calories * ratio;
            totals.protein += food.nutrition.protein * ratio;
            totals.carbs += food.nutrition.carbs * ratio;
            totals.fat += food.nutrition.fat * ratio;
            totals.fiber += food.nutrition.fiber * ratio;
            totals.sugar += food.nutrition.sugar * ratio;
            totals.sodium += food.nutrition.sodium * ratio;
            totals.cholesterol += food.nutrition.cholesterol * ratio;
        }
    });

    // Round all values
    Object.keys(totals).forEach(key => {
        totals[key as keyof typeof totals] = Math.round(totals[key as keyof typeof totals] * 10) / 10;
    });

    return totals;
}

/** Get safe foods for a specific health condition */
export function getSafeFoodsForCondition(conditionId: string): FoodItem[] {
    if (!_cachedFoods) return [];
    return _cachedFoods.filter(f => {
        const status = f.healthConditions?.[conditionId as keyof typeof f.healthConditions];
        return status === 'safe';
    });
}
