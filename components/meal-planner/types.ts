// Shared types for meal planner components
import { FoodItem, NutritionInfo } from '@/lib/mealDatabase';

export interface DailyGoals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface MealEntry {
    id: string;
    foodId: string;
    amount: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface UserHealthProfile {
    conditions: string[];
    allergies: string[];
    goals: DailyGoals;
}

export interface RecipeData {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    image: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: { foodId: string; amount: number; name: string }[];
    instructions: string[];
    tags: string[];
    healthConditions: {
        diabetes: boolean;
        hypertension: boolean;
        ibs: boolean;
    };
}

export const defaultGoals: DailyGoals = {
    calories: 2000,
    protein: 60,
    carbs: 250,
    fat: 65
};
