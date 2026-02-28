/**
 * Tibrah Centralized Type Definitions
 * All shared entity interfaces and types for the application
 */

// ═══════════════════════════════════════════════════════════════
// BASE TYPES
// ═══════════════════════════════════════════════════════════════

export interface EntityBase {
    id?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

// ═══════════════════════════════════════════════════════════════
// USER & AUTH
// ═══════════════════════════════════════════════════════════════

export interface User extends EntityBase {
    email?: string;
    name?: string;
    displayName?: string;
    photoURL?: string;
    phone?: string;
    role?: 'user' | 'admin';
    settings?: Record<string, unknown>;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    displayName?: string;
    photoURL?: string;
    phone?: string;
    role: 'user' | 'admin';
    createdAt?: string;
    lastLoginAt?: string;
    isVerified?: boolean;
    authProvider: 'local' | 'firebase';
}

// ═══════════════════════════════════════════════════════════════
// HEALTH TRACKING
// ═══════════════════════════════════════════════════════════════

export interface HealthMetric extends EntityBase {
    metric_type: string;
    value: number;
    unit: string;
    recorded_at: string;
    notes?: string;
}

export interface DailyLog extends EntityBase {
    date: string;
    user_id?: string;
    // Mood & Energy
    mood?: number;
    energy_level?: number;
    stress_level?: number;
    // Sleep
    sleep_hours?: number;
    sleep_quality?: number;
    // Nutrition
    water_glasses?: number;
    meals_count?: number;
    healthy_meals?: boolean;
    // Activity
    exercise_minutes?: number;
    steps?: number;
    exercise?: {
        type: string;
        duration_minutes: number;
        calories?: number;
    };
    // Symptoms
    symptoms?: string[];
    symptoms_notes?: string;
    // Medications
    medications_taken?: boolean;
    // Notes
    notes?: string;
    gratitude?: string;
}

export interface FastingSession extends EntityBase {
    start_time: string;
    end_time?: string;
    target_hours: number;
    completed: boolean;
    type?: string;
}

export interface WeightLog extends EntityBase {
    date: string;
    weight: number;
    unit?: string;
    body_fat?: number;
    muscle_mass?: number;
    notes?: string;
}

export interface SleepLog extends EntityBase {
    date: string;
    bedtime?: string;
    wake_time?: string;
    duration_hours?: number;
    quality?: number;
    notes?: string;
}

export interface WaterLog extends EntityBase {
    date: string;
    glasses: number;
    target?: number;
}

export interface SymptomLog extends EntityBase {
    date: string;
    symptoms: string[];
    severity?: number;
    notes?: string;
    body_area?: string;
}

// ═══════════════════════════════════════════════════════════════
// MEDICATIONS
// ═══════════════════════════════════════════════════════════════

export interface Medication extends EntityBase {
    name: string;
    dose?: string;
    frequency?: string;
    times?: string[];
    notes?: string;
    active?: boolean;
}

export interface DoseLog extends EntityBase {
    medication_id?: string;
    medication_name?: string;
    date: string;
    time?: string;
    taken: boolean;
    dose?: string;
}

// ═══════════════════════════════════════════════════════════════
// USER HEALTH & PROGRAMS
// ═══════════════════════════════════════════════════════════════

export interface UserHealth extends EntityBase {
    user_id?: string;
    program_id?: string;
    enrolled_at?: string;
    status?: string;
    progress?: number;
}

export interface HealthProgram extends EntityBase {
    name: string;
    description?: string;
    duration_days?: number;
    category?: string;
    image?: string;
    steps?: string[];
}

// ═══════════════════════════════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════════════════════════════

export interface Appointment extends EntityBase {
    patient_name?: string;
    date: string;
    time: string;
    type?: string;
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    notes?: string;
    phone?: string;
}

// ═══════════════════════════════════════════════════════════════
// E-COMMERCE
// ═══════════════════════════════════════════════════════════════

export interface Product extends EntityBase {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    inStock: boolean;
    featured?: boolean;
}

export interface CartItem extends EntityBase {
    product_id: string;
    quantity: number;
    price: number;
    name?: string;
}

// ═══════════════════════════════════════════════════════════════
// COURSES & EDUCATION
// ═══════════════════════════════════════════════════════════════

export interface Course extends EntityBase {
    title: string;
    description?: string;
    instructor?: string;
    duration_hours?: number;
    price?: number;
    image?: string;
    category?: string;
    lessons_count?: number;
    enrolled_count?: number;
}

export interface Lesson extends EntityBase {
    course_id: string;
    title: string;
    content?: string;
    video_url?: string;
    duration_minutes?: number;
    order: number;
    type?: 'video' | 'reading' | 'quiz';
}

export interface CourseEnrollment extends EntityBase {
    course_id: string;
    user_id: string;
    progress?: number;
    completed?: boolean;
    enrolled_at?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONTENT
// ═══════════════════════════════════════════════════════════════

export interface KnowledgeArticle extends EntityBase {
    title: string;
    content?: string;
    summary?: string;
    category?: string;
    image?: string;
    author?: string;
    published?: boolean;
    tags?: string[];
}

export interface Comment extends EntityBase {
    target_type: string;
    target_id: string;
    content: string;
    rating?: number;
    user_name?: string;
    user_id?: string;
}

// ═══════════════════════════════════════════════════════════════
// MEDICAL
// ═══════════════════════════════════════════════════════════════

export interface LabResult extends EntityBase {
    test_name: string;
    value?: string;
    unit?: string;
    normal_range?: string;
    date: string;
    notes?: string;
}

export interface DiagnosticResult extends EntityBase {
    condition?: string;
    confidence?: number;
    symptoms?: string[];
    recommendations?: string[];
    date: string;
}

export interface DoctorRecommendation extends EntityBase {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    status?: 'pending' | 'completed';
}

// ═══════════════════════════════════════════════════════════════
// FREQUENCIES
// ═══════════════════════════════════════════════════════════════

export interface Frequency extends EntityBase {
    name: string;
    frequency_hz: number;
    description?: string;
    category?: string;
    duration_seconds?: number;
}

export interface RifeFrequency extends EntityBase {
    name: string;
    frequencies: number[];
    condition?: string;
    description?: string;
    category?: string;
}

// ═══════════════════════════════════════════════════════════════
// REMINDERS & NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export interface Reminder extends EntityBase {
    title: string;
    type?: string;
    time: string;
    repeat?: string;
    active?: boolean;
    notes?: string;
}
