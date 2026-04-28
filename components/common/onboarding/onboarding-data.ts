// components/common/onboarding/onboarding-data.ts
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Onboarding Static Data: interests, goals
// ════════════════════════════════════════════════════════════════════

import {
    Heart, Activity, Brain, Sparkles,
    Shield, Zap, Star,
    Stethoscope, Utensils, Moon, Droplets, Flame,
    Target, Dumbbell, Pill,
} from 'lucide-react';

export interface SelectableItem {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
    emoji: string;
}

export const healthInterests: SelectableItem[] = [
    { id: 'nutrition', label: 'التغذية الصحية', icon: Utensils, color: '#22C55E', emoji: '🥗' },
    { id: 'mental',    label: 'الصحة النفسية',  icon: Brain,    color: '#8B5CF6', emoji: '🧠' },
    { id: 'fitness',   label: 'اللياقة البدنية', icon: Activity, color: '#EF4444', emoji: '💪' },
    { id: 'sleep',     label: 'جودة النوم',      icon: Moon,     color: '#6366F1', emoji: '😴' },
    { id: 'fasting',   label: 'الصيام المتقطع',  icon: Flame,    color: '#F59E0B', emoji: '🔥' },
    { id: 'hydration', label: 'شرب الماء',       icon: Droplets, color: '#0EA5E9', emoji: '💧' },
    { id: 'chronic',   label: 'الأمراض المزمنة', icon: Stethoscope, color: '#EC4899', emoji: '🏥' },
    { id: 'weight',    label: 'إدارة الوزن',     icon: Activity,  color: '#14B8A6', emoji: '⚖️' },
];

export const healthGoals: SelectableItem[] = [
    { id: 'lose_weight',    label: 'إنقاص الوزن',       icon: Target,   color: '#EF4444', emoji: '🎯' },
    { id: 'build_muscle',   label: 'بناء العضلات',       icon: Dumbbell, color: '#8B5CF6', emoji: '💪' },
    { id: 'better_sleep',   label: 'نوم أفضل',          icon: Moon,     color: '#6366F1', emoji: '🌙' },
    { id: 'reduce_stress',  label: 'تقليل التوتر',      icon: Brain,    color: '#EC4899', emoji: '🧘' },
    { id: 'eat_healthy',    label: 'أكل صحي',           icon: Utensils, color: '#22C55E', emoji: '🥗' },
    { id: 'manage_chronic', label: 'إدارة مرض مزمن',     icon: Pill,     color: '#F59E0B', emoji: '💊' },
    { id: 'more_energy',    label: 'طاقة أكثر',         icon: Flame,    color: '#F97316', emoji: '⚡' },
    { id: 'gut_health',     label: 'صحة الأمعاء',       icon: Heart,    color: '#14B8A6', emoji: '🦠' },
];

export const featureHighlights = [
    { icon: Shield, text: 'تتبع صحتك بالذكاء الاصطناعي', color: '#2D9B83' },
    { icon: Zap,    text: 'ترددات علاجية متقدمة',        color: '#8B5CF6' },
    { icon: Star,   text: 'وصفات وخطط غذائية مخصصة',     color: '#F59E0B' },
];

export const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0, scale: 0.9 }),
};
