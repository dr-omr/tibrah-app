// components/intake/intake-data.ts
// ════════════════════════════════════════════════════════
// Types, complaint data, and red flags for Clinical Intake
// ════════════════════════════════════════════════════════

import {
  Activity, AlertTriangle, Brain, Heart, Shield, Stethoscope,
  Thermometer, User, Zap, Droplets, Moon, HeartPulse,
  CheckCircle, Phone, Calendar, MessageCircle,
} from 'lucide-react';
import { createPageUrl } from '@/utils';

const EMERGENCY_PHONE = process.env.NEXT_PUBLIC_EMERGENCY_PHONE?.trim();
const EMERGENCY_HREF = EMERGENCY_PHONE ? `tel:${EMERGENCY_PHONE}` : '#';

/* ─── Types ──────────────────────────────────── */
export type TriageLevel = 'emergency' | 'needs_doctor' | 'suitable_for_review' | 'manageable';
export type StepId = 'welcome' | 'complaint' | 'severity' | 'modifiers' | 'history' | 'analyzing' | 'result';

export interface AssessmentData {
  complaint: string;
  complaintLabel: string;
  severity: number;
  duration: string;
  redFlags: string[];
  hasRedFlags: boolean;
  chronicConditions: string[];
  medications: string;
  additionalNotes: string;
}

export const EMPTY_ASSESSMENT: AssessmentData = {
  complaint: '', complaintLabel: '', severity: 5, duration: 'days',
  redFlags: [], hasRedFlags: false, chronicConditions: [],
  medications: '', additionalNotes: '',
};

/* ─── Complaint Catalog ──────────────────────── */
export const COMPLAINTS = [
  { id: 'fatigue',    label: 'تعب وإرهاق مزمن',        icon: Zap,         color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { id: 'headache',   label: 'صداع أو شقيقة',           icon: Brain,       color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  { id: 'digestion',  label: 'مشاكل هضمية',             icon: Activity,    color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  { id: 'sleep',      label: 'اضطرابات النوم',          icon: Moon,        color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  { id: 'joint_pain', label: 'آلام المفاصل والعضلات',   icon: HeartPulse,  color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  { id: 'hormonal',   label: 'اضطرابات هرمونية',        icon: Droplets,    color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
  { id: 'immune',     label: 'ضعف المناعة',             icon: Shield,      color: '#0d9488', bg: 'rgba(13,148,136,0.08)' },
  { id: 'anxiety',    label: 'قلق أو توتر نفسي',        icon: Heart,       color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  { id: 'weight',     label: 'مشاكل الوزن والتمثيل',   icon: Thermometer, color: '#14b8a6', bg: 'rgba(20,184,166,0.08)' },
  { id: 'other',      label: 'أعراض أخرى',             icon: User,        color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
];

export const RED_FLAGS = [
  { id: 'breathing',     label: 'صعوبة شديدة في التنفس أو اختناق' },
  { id: 'chest',         label: 'ألم حاد في الصدر أو الذراع اليسرى' },
  { id: 'consciousness', label: 'فقدان الوعي أو الدوار الشديد جداً' },
  { id: 'paralysis',     label: 'عدم القدرة على الحركة أو ضعف مفاجئ' },
  { id: 'bleeding',      label: 'نزيف حاد لا يتوقف' },
];

export const CHRONIC_CONDITIONS = [
  'السكري', 'ضغط الدم', 'أمراض القلب', 'الغدة الدرقية',
  'الحساسية', 'متلازمة القولون', 'الشقيقة المزمنة', 'لا شيء'
];

export const STEPS: StepId[] = ['welcome', 'complaint', 'severity', 'modifiers', 'history', 'analyzing', 'result'];

/* ─── Triage Logic ───────────────────────────── */
export function computeTriage(d: AssessmentData): TriageLevel {
  if (d.hasRedFlags || d.severity >= 9 || d.complaint === 'chest_pain') return 'emergency';
  if (d.severity >= 7 || d.duration === 'weeks') return 'needs_doctor';
  if (d.severity >= 4 || d.chronicConditions.some(c => c !== 'لا شيء' && c !== '')) return 'suitable_for_review';
  return 'manageable';
}

/* ─── Result Config ──────────────────────────── */
export function getResultConfig(level: TriageLevel) {
  const configs = {
    emergency: {
      gradient: 'from-red-500 to-rose-600', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)',
      iconColor: '#ef4444', icon: AlertTriangle, badge: 'طارئ', badgeBg: '#ef4444',
      title: 'يرجى طلب المساعدة الطبية فوراً',
      subtitle: 'الأعراض التي وصفتها تستدعي تدخلاً طبياً عاجلاً. رجاءً لا تتأخر.',
      primaryAction: { label: EMERGENCY_PHONE ? 'اتصل بالطوارئ' : 'توجه لأقرب طوارئ فوراً', href: EMERGENCY_HREF, icon: Phone },
      secondaryAction: null,
    },
    needs_doctor: {
      gradient: 'from-orange-500 to-amber-500', bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.2)',
      iconColor: '#f97316', icon: Stethoscope, badge: 'يحتاج متابعة طبية', badgeBg: '#f97316',
      title: 'حالتك تستوجب استشارة طبية قريبة',
      subtitle: 'أعراضك مستقرة لكنها تحتاج تقييماً دقيقاً من د. عمر لوضع خطة علاج مناسبة.',
      primaryAction: { label: 'احجز جلسة مع د. عمر', href: createPageUrl('BookAppointment'), icon: Calendar },
      secondaryAction: { label: 'مراجعة ملفي', href: createPageUrl('MyCare'), icon: HeartPulse },
    },
    suitable_for_review: {
      gradient: 'from-indigo-500 to-violet-500', bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.2)',
      iconColor: '#6366f1', icon: Shield, badge: 'مناسب للمراجعة الرقمية', badgeBg: '#6366f1',
      title: 'مؤشراتك معقولة — نوصي بمراجعة رقمية',
      subtitle: 'حالتك لا تستدعي استعجالاً لكن مراجعة د. عمر رقمياً ستوفر لك خطة أوضح.',
      primaryAction: { label: 'طلب مراجعة رقمية', href: createPageUrl('MyCare'), icon: MessageCircle },
      secondaryAction: { label: 'احجز جلسة كاملة', href: createPageUrl('BookAppointment'), icon: Calendar },
    },
    manageable: {
      gradient: 'from-teal-500 to-emerald-500', bg: 'rgba(13,148,136,0.06)', border: 'rgba(13,148,136,0.2)',
      iconColor: '#0d9488', icon: CheckCircle, badge: 'مؤشراتك مطمئنة', badgeBg: '#0d9488',
      title: 'حالتك في النطاق الآمن 🎉',
      subtitle: 'أعراضك قابلة للإدارة. ننصحك بمتابعة يومياتك الصحية وسنرصد أي تغيير.',
      primaryAction: { label: 'تابع رعايتي اليومية', href: createPageUrl('DailyLog'), icon: HeartPulse },
      secondaryAction: { label: 'رحلتي العلاجية', href: createPageUrl('MyCare'), icon: Activity },
    },
  };
  return configs[level];
}
