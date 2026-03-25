import { BookOpen, Users, Star, CheckCircle } from 'lucide-react';

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    duration_hours: number;
    lessons_count: number;
    enrolled_count: number;
    rating: number;
    is_free: boolean;
    price: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    reviews_count: number;
    status: 'published' | 'draft';
}

export const categories = [
    { id: 'all', label: 'الكل', icon: '🔹' },
    { id: 'functional_medicine', label: 'الطب الوظيفي', icon: '🌿' },
    { id: 'nutrition', label: 'التغذية العلاجية', icon: '🍎' },
    { id: 'lifestyle', label: 'نمط الحياة', icon: '🧘‍♂️' }
];

export const levelLabels: Record<string, string> = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم'
};

export const levelColors: Record<string, string> = {
    beginner: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    intermediate: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    advanced: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
};

export const statsConfig = [
    { key: 'courses', icon: BookOpen, color: 'text-amber-500', label: 'دورة' },
    { key: 'students', icon: Users, color: 'text-blue-500', label: 'طالب' },
    { key: 'rating', icon: Star, color: 'text-amber-400', label: 'تقييم', fill: true },
    { key: 'free', icon: CheckCircle, color: 'text-emerald-500', label: 'مجانية' },
];
