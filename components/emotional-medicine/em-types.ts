/**
 * em-types.ts — Types for الطب الشعوري system
 * Psychosomatic Medicine Data Model
 */

export type OrganSystem =
    | 'nervous'   // الجهاز العصبي
    | 'digestive' // الجهاز الهضمي
    | 'cardiac'   // القلب والأوعية
    | 'respiratory' // الجهاز التنفسي
    | 'musculo'   // العضلات والعظام
    | 'skin'      // الجلد
    | 'immune'    // المناعة
    | 'endocrine' // الغدد الصماء
    | 'urinary'   // الجهاز البولي
    | 'reproductive'; // الجهاز التناسلي

export interface HealingStep {
    step: number;
    icon: string;
    title: string;
    description: string;
    duration?: string;
}

export interface EmotionalCondition {
    id: string;
    symptom: string;              // الأعراض الجسدية
    targetOrgan: string;          // العضو المصاب
    organSystem: OrganSystem;     // جهاز الجسم
    emotionalConflict: string;    // الصراع الشعوري الجذر
    biologicalPurpose: string;    // الغرض البيولوجي للعرض
    triggerEmotions: string[];    // المشاعر المحركة
    affectedChakra?: string;      // الطاقة المرتبطة
    healingSteps: HealingStep[];  // بروتوكول الشفاء
    healingAffirmation: string;   // التأكيد الشفائي
    affirmationEn: string;        // التأكيد بالإنجليزية
    breathingTech?: string;       // تقنية التنفس المناسبة
    relatedConditions?: string[]; // حالات مرتبطة
    severity: 'mild' | 'moderate' | 'severe';
    prevalence: number;           // شيوع الحالة 1-10
    color: string;                // لون الكارت
}

export interface MoodEntry {
    date: string;
    mood: 1 | 2 | 3 | 4 | 5;
    physicalSymptom?: string;
    note?: string;
    emotionLabel: string;
}

export interface HealingSession {
    conditionId: string;
    startedAt: string;
    currentStep: number;
    completedSteps: number[];
    notes: string;
}

export const ORGAN_SYSTEM_LABELS: Record<OrganSystem, { ar: string; emoji: string; color: string }> = {
    nervous:      { ar: 'الجهاز العصبي',       emoji: '🧠', color: '#7C3AED' },
    digestive:    { ar: 'الجهاز الهضمي',       emoji: '🫃', color: '#EA580C' },
    cardiac:      { ar: 'القلب والأوعية',      emoji: '❤️', color: '#E11D48' },
    respiratory:  { ar: 'الجهاز التنفسي',     emoji: '🫁', color: '#0891B2' },
    musculo:      { ar: 'العضلات والمفاصل',    emoji: '💪', color: '#059669' },
    skin:         { ar: 'الجلد',               emoji: '🌿', color: '#D97706' },
    immune:       { ar: 'المناعة',             emoji: '🛡️', color: '#4F46E5' },
    endocrine:    { ar: 'الغدد الصماء',        emoji: '⚗️', color: '#9333EA' },
    urinary:      { ar: 'الجهاز البولي',       emoji: '💧', color: '#0D9488' },
    reproductive: { ar: 'الجهاز التناسلي',     emoji: '🌸', color: '#EC4899' },
};
