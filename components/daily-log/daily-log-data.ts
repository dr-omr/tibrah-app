// components/daily-log/daily-log-data.ts
// ════════════════════════════════════════════════════════
// Types, constants, and step configuration for Daily Log
// ════════════════════════════════════════════════════════

/* ─── Types ──────────────────────────────────── */
export type StepType = 'welcome' | 'pain' | 'energy' | 'sleep' | 'mood' | 'symptoms' | 'water' | 'meds' | 'analyzing' | 'result';

export const STEPS_ORDERED: StepType[] = ['pain', 'energy', 'sleep', 'mood', 'symptoms', 'water', 'meds'];
export const TOTAL_STEPS = STEPS_ORDERED.length;

export const SPRING: any = { type: 'spring', stiffness: 320, damping: 26, mass: 0.8 };

/* ─── Pain Descriptor ────────────────────────── */
export function getPainDesc(v: number) {
  if (v === 0) return { text: 'لا يوجد ألم', color: '#10b981' };
  if (v <= 3) return { text: 'ألم خفيف', color: '#f59e0b' };
  if (v <= 6) return { text: 'ألم متوسط', color: '#f97316' };
  if (v <= 8) return { text: 'ألم شديد', color: '#ef4444' };
  return { text: 'ألم لا يحتمل', color: '#dc2626' };
}

/* ─── Symptoms Catalog ───────────────────────── */
export const SYMPTOMS_LIST = [
  { id: 'headache', label: 'صداع', emoji: '🧠' },
  { id: 'fatigue', label: 'إرهاق', emoji: '😴' },
  { id: 'nausea', label: 'غثيان', emoji: '🤢' },
  { id: 'dizzy', label: 'دوخة', emoji: '💫' },
  { id: 'back', label: 'ظهر', emoji: '🦴' },
  { id: 'stomach', label: 'معدة', emoji: '🌿' },
  { id: 'chest', label: 'صدر', emoji: '💗' },
  { id: 'anxiety', label: 'قلق', emoji: '💭' },
  { id: 'bloating', label: 'انتفاخ', emoji: '🫁' },
  { id: 'none', label: 'لا شيء', emoji: '✨' },
];

/* ─── Mood Options ───────────────────────────── */
export const MOOD_OPTIONS = [
  { val: 1, emoji: '😞', label: 'سيء جداً', color: '#ef4444' },
  { val: 2, emoji: '😔', label: 'محبط', color: '#f97316' },
  { val: 3, emoji: '😐', label: 'عادي', color: '#f59e0b' },
  { val: 4, emoji: '🙂', label: 'جيد', color: '#10b981' },
  { val: 5, emoji: '😄', label: 'ممتاز', color: '#0d9488' },
];

/* ─── Quick Meds List ────────────────────────── */
export const QUICK_MEDS = ['فيتامين د', 'مغنيسيوم', 'أوميغا-3', 'ب١٢', 'الحديد', 'بروبيوتيك'];
