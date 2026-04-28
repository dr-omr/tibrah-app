// components/booking/booking-data.ts
// ════════════════════════════════════════════════════════
// Configuration, session catalog, and utilities for Booking
// ════════════════════════════════════════════════════════

/* ─── Doctor Config ──────────────────────────── */
export const DR_PHONE = '967771447111';
export const DR_PHOTO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69287e726ff0e068617e81b7/9185440e5_omar.jpg';
export const DR_IG = 'dr.omr369';
export const DR_TT = 'dr.omr369';

/* ─── Session Catalog ────────────────────────── */
export const SESSIONS = [
  { id: 'consultation', emoji: '🩺', label: 'جلسة تشخيصية شاملة', tagline: 'نكتشف السبب الجذري لمشكلتك', price: '٣٥ ر.س', original: '٣٥٠ ر.س', duration: '٤٥ د', color: '#0d9488', glow: 'rgba(13,148,136,0.22)', badge: 'الأكثر طلباً' },
  { id: 'emotional', emoji: '💛', label: 'الطب الشعوري', tagline: 'الصلة بين مشاعرك وجسمك', price: '٢٥٠ ر.س', original: '', duration: '٤٠ د', color: '#d97706', glow: 'rgba(217,119,6,0.18)', badge: 'جديد' },
  { id: 'frequencies', emoji: '🎵', label: 'جلسة الترددات العلاجية', tagline: 'علاج تكميلي بالموجات الصوتية', price: '٢٠٠ ر.س', original: '', duration: '٣٠ د', color: '#7c3aed', glow: 'rgba(124,58,237,0.18)', badge: '' },
  { id: 'followup', emoji: '💚', label: 'متابعة دورية', tagline: 'تابع تطورك مع الدكتور', price: '١٥٠ ر.س', original: '', duration: '٢٠ د', color: '#059669', glow: 'rgba(5,150,105,0.18)', badge: '' },
];

/* ─── Time Slots ─────────────────────────────── */
export const TIMES: (string | null)[] = [
  '١٠:٠٠ ص','١٠:٣٠ ص','١١:٠٠ ص',null,
  '٠٤:٠٠ م','٠٤:٣٠ م','٠٥:٠٠ م',null,
  '٠٦:٠٠ م','٠٦:٣٠ م','٠٧:٠٠ م',null,
];

/* ─── Available Days ─────────────────────────── */
export function getAvailableDays() {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 1; days.length < 12; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 5 && d.getDay() !== 6) days.push(d);
  }
  return days;
}

/* ─── Spring Presets ─────────────────────────── */
export const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 400, damping: 30 };
export const SPRING_SMOOTH = { type: 'spring' as const, stiffness: 280, damping: 26 };

/* ─── Form Type ──────────────────────────────── */
export interface BookingForm {
  session_type: string;
  date: Date | null;
  time_slot: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  health_concern: string;
}

export const EMPTY_FORM: BookingForm = {
  session_type: '', date: null, time_slot: '',
  patient_name: '', patient_phone: '', patient_email: '', health_concern: '',
};

export const STEP_LABELS = ['الجلسة', 'الموعد', 'بياناتك'];
