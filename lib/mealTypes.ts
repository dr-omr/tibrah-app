// lib/mealTypes.ts
// Type-only exports for the meal planner system
// Import this instead of mealDatabase.ts when you only need types

export interface NutritionInfo {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol: number;
}

export interface HealthCondition {
    id: string;
    name: string;
    nameAr: string;
    restrictions: string[];
    recommendations: string[];
}

export interface FoodItem {
    id: string;
    name: string;
    nameAr: string;
    category: string;
    categoryAr: string;
    servingSize: number;
    servingUnit: string;
    nutrition: NutritionInfo;
    glycemicIndex?: number;
    allergens: string[];
    tags: string[];
    imageUrl?: string;
    healthConditions: {
        diabetes: 'safe' | 'caution' | 'avoid';
        hypertension: 'safe' | 'caution' | 'avoid';
        ibs: 'safe' | 'caution' | 'avoid';
        celiac: 'safe' | 'caution' | 'avoid';
        lactoseIntolerance: 'safe' | 'caution' | 'avoid';
    };
}

export interface Recipe {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    ingredients: { foodId: string; amount: number; unit: string }[];
    instructions: string[];
    instructionsAr: string[];
    totalNutrition: NutritionInfo;
    tags: string[];
    imageUrl?: string;
    category?: string;
}

export interface MealPlan {
    id: string;
    date: string;
    meals: {
        breakfast: { recipeId?: string; foods: { foodId: string; amount: number }[] };
        lunch: { recipeId?: string; foods: { foodId: string; amount: number }[] };
        dinner: { recipeId?: string; foods: { foodId: string; amount: number }[] };
        snacks: { foodId: string; amount: number }[];
    };
    totalNutrition: NutritionInfo;
    notes?: string;
}
