// Entities/DailyLog.ts
// TypeScript interface for DailyLog entity

export interface DailyLog {
    id?: string;
    date: string;
    user_id?: string;

    // Mood & Energy
    mood?: number; // 1-5 scale
    energy_level?: number; // 1-5 scale
    stress_level?: number; // 1-5 scale

    // Sleep
    sleep_hours?: number;
    sleep_quality?: number; // 1-5 scale

    // Nutrition
    water_glasses?: number;
    meals_count?: number;
    healthy_meals?: boolean;

    // Activity
    exercise_minutes?: number;
    steps?: number;

    // Symptoms
    symptoms?: string[];
    symptoms_notes?: string;

    // Medications
    medications_taken?: boolean;

    // Notes
    notes?: string;
    gratitude?: string;

    // Timestamps
    created_at?: string;
    updated_at?: string;
}

export default DailyLog;
