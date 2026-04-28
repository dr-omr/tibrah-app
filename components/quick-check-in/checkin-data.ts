// components/quick-check-in/checkin-data.ts
// ════════════════════════════════════════════════════════
// Types, scales, and constants for Quick Check-In
// ════════════════════════════════════════════════════════

/* ─── Types ──────────────────────────────────── */
export interface CheckInData {
  energy: number;
  sleep: number;
  stress: number;
  mood: number;
  waterGlasses: number;
  physicalSymptoms: string;
  emotionalContext: string;
}

export type StepId = 'vitals' | 'symptoms' | 'emotional' | 'analyzing' | 'result';

export const EMPTY_CHECKIN: CheckInData = {
  energy: 3, sleep: 3, stress: 3, mood: 3,
  waterGlasses: 0, physicalSymptoms: '', emotionalContext: '',
};

/* ─── Emoji Scales ───────────────────────────── */
export const SCALES: Record<string, { emoji: string; label: string; color: string }[]> = {
  energy: [
    { emoji: '🪫', label: 'منهك', color: '#ef4444' },
    { emoji: '😔', label: 'ضعيف', color: '#f97316' },
    { emoji: '🙂', label: 'مقبول', color: '#eab308' },
    { emoji: '💪', label: 'جيد', color: '#22c55e' },
    { emoji: '🚀', label: 'ممتاز', color: '#10b981' },
  ],
  sleep: [
    { emoji: '😵', label: 'سيئ جداً', color: '#ef4444' },
    { emoji: '🥱', label: 'سيئ', color: '#f97316' },
    { emoji: '😴', label: 'مقبول', color: '#eab308' },
    { emoji: '😌', label: 'جيد', color: '#22c55e' },
    { emoji: '🌟', label: 'ممتاز', color: '#10b981' },
  ],
  stress: [
    { emoji: '🧘', label: 'هادئ', color: '#10b981' },
    { emoji: '😐', label: 'طبيعي', color: '#22c55e' },
    { emoji: '😟', label: 'قليل', color: '#eab308' },
    { emoji: '😰', label: 'مرتفع', color: '#f97316' },
    { emoji: '🤯', label: 'شديد', color: '#ef4444' },
  ],
  mood: [
    { emoji: '😢', label: 'حزين', color: '#ef4444' },
    { emoji: '😞', label: 'متعكر', color: '#f97316' },
    { emoji: '😐', label: 'عادي', color: '#eab308' },
    { emoji: '😊', label: 'بخير', color: '#22c55e' },
    { emoji: '😄', label: 'بشوش', color: '#10b981' },
  ],
};

/* ─── Symptom/Emotional Chips ────────────────── */
export const PHYSICAL_SYMPTOMS_CHIPS = ['صداع', 'إرهاق', 'ألم في الظهر', 'آلام في المعدة', 'ألم في المفاصل', 'دوخة', 'لا أعراض'];
export const EMOTIONAL_CHIPS = ['ضغط العمل', 'قلق مستمر', 'مشاكل عائلية', 'وحدة', 'إرهاق عاطفي', 'أمور مالية', 'لا شيء'];
