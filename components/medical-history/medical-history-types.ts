// components/medical-history/medical-history-types.ts
// ════════════════════════════════════════════════════════
// Types, section config, and empty state for Medical History
// ════════════════════════════════════════════════════════

import {
  User, Stethoscope, FileText, Pill, Users, Dumbbell, Activity, Sparkles,
} from 'lucide-react';

/* ─── Section Config ────────────────────────── */
export const SECTIONS = [
  { id: 'personal',    label: 'البيانات الشخصية',     icon: User,        color: '#0d9488', desc: 'معلومات أساسية عنك' },
  { id: 'complaint',   label: 'الشكوى الحالية',       icon: Stethoscope, color: '#6366f1', desc: 'SOCRATES — وصف دقيق' },
  { id: 'pmh',         label: 'التاريخ الطبي',        icon: FileText,    color: '#f59e0b', desc: 'أمراض، عمليات، مستشفيات' },
  { id: 'medications', label: 'الأدوية والحساسية',    icon: Pill,        color: '#ef4444', desc: 'ما تتناوله حالياً' },
  { id: 'family',      label: 'التاريخ العائلي',      icon: Users,       color: '#8b5cf6', desc: 'أمراض تسري في العائلة' },
  { id: 'lifestyle',   label: 'النمط الحياتي',        icon: Dumbbell,    color: '#10b981', desc: 'غذاء، نوم، تمرين، إجهاد' },
  { id: 'ros',         label: 'مراجعة الأجهزة',      icon: Activity,    color: '#0ea5e9', desc: 'فحص شامل لكل الأجهزة' },
  { id: 'goals',       label: 'الأهداف والتوقعات',   icon: Sparkles,    color: '#ec4899', desc: 'ما تأمل تحقيقه' },
] as const;

export type SectionId = typeof SECTIONS[number]['id'];

/* ─── Data Shape ────────────────────────────── */
export interface MedicalHistory {
  // Personal
  birthYear: string; gender: string; nationality: string;
  occupation: string; maritalStatus: string; children: string;
  // Complaint (SOCRATES)
  site: string; onset: string; onsetDate: string; character: string[];
  radiation: string; associatedSymptoms: string[]; timing: string;
  exacerbating: string[]; relieving: string[]; severity: number;
  // PMH
  chronicDiseases: string[]; previousSurgeries: string;
  hospitalizations: string; vaccinations: string;
  // Medications
  currentMeds: Array<{ name: string; dose: string; since: string }>;
  supplements: string; allergies: string[]; allergyDetails: string;
  // Family
  familyDiseases: Record<string, string[]>;
  // Lifestyle
  diet: string; mealsPerDay: string; water: string; exercise: string;
  sleepHours: string; sleepQuality: string; stressLevel: number;
  smoking: string; alcohol: string; caffeine: string;
  // ROS (by system)
  rosPositive: Record<string, string[]>;
  // Goals
  mainGoal: string; specificGoals: string[]; timeframe: string;
  additionalNotes: string;
}

export const EMPTY: MedicalHistory = {
  birthYear: '', gender: '', nationality: '', occupation: '', maritalStatus: '', children: '',
  site: '', onset: '', onsetDate: '', character: [], radiation: '', associatedSymptoms: [],
  timing: '', exacerbating: [], relieving: [], severity: 5,
  chronicDiseases: [], previousSurgeries: '', hospitalizations: '', vaccinations: '',
  currentMeds: [], supplements: '', allergies: [], allergyDetails: '',
  familyDiseases: { أب: [], أم: [], أشقاء: [], أجداد: [] },
  diet: '', mealsPerDay: '', water: '', exercise: '', sleepHours: '', sleepQuality: '',
  stressLevel: 5, smoking: '', alcohol: '', caffeine: '',
  rosPositive: {},
  mainGoal: '', specificGoals: [], timeframe: '', additionalNotes: '',
};
