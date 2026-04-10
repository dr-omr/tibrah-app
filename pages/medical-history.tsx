// pages/medical-history.tsx
// Comprehensive Medical History — SOCRATES + Functional Medicine + ROS + Timeline
// World-class clinical history taking system

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Heart, Pill, Users, Activity, Brain, Utensils,
  Moon, Zap, Shield, ChevronLeft, ChevronRight, Check,
  AlertTriangle, Sparkles, Save, ArrowRight, Clock,
  Cigarette, Wine, Dumbbell, Baby, Stethoscope, FileText,
  MapPin, Briefcase, Info, Plus, X, CheckCircle,
  Thermometer, Eye, Ear, Wind, Droplets, Bone, HeartPulse,
  MessageCircle, Share2, Copy, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import SEO from '@/components/common/SEO';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { createPageUrl } from '@/utils';
import Link from 'next/link';
import { toast } from 'sonner';

/* ══════════════════════════════════════════
   SECTION CONFIG — 8 evidence-based sections
   ══════════════════════════════════════════ */
const SECTIONS = [
  { id: 'personal',    label: 'البيانات الشخصية',     icon: User,        color: '#0d9488', desc: 'معلومات أساسية عنك' },
  { id: 'complaint',   label: 'الشكوى الحالية',       icon: Stethoscope, color: '#6366f1', desc: 'SOCRATES — وصف دقيق' },
  { id: 'pmh',         label: 'التاريخ الطبي',        icon: FileText,    color: '#f59e0b', desc: 'أمراض، عمليات، مستشفيات' },
  { id: 'medications', label: 'الأدوية والحساسية',    icon: Pill,        color: '#ef4444', desc: 'ما تتناوله حالياً' },
  { id: 'family',      label: 'التاريخ العائلي',      icon: Users,       color: '#8b5cf6', desc: 'أمراض تسري في العائلة' },
  { id: 'lifestyle',   label: 'النمط الحياتي',        icon: Dumbbell,    color: '#10b981', desc: 'غذاء، نوم، تمرين، إجهاد' },
  { id: 'ros',         label: 'مراجعة الأجهزة',      icon: Activity,    color: '#0ea5e9', desc: 'فحص شامل لكل الأجهزة' },
  { id: 'goals',       label: 'الأهداف والتوقعات',   icon: Sparkles,    color: '#ec4899', desc: 'ما تأمل تحقيقه' },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

/* ══════════════════════════════════════════
   HISTORY DATA SHAPE
   ══════════════════════════════════════════ */
interface MedicalHistory {
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

const EMPTY: MedicalHistory = {
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

/* ══════════════════════════════════════════
   SHARED UI
   ══════════════════════════════════════════ */
function Chip({ label, selected, color = '#0d9488', onToggle }: {
  label: string; selected: boolean; color?: string; onToggle: () => void;
}) {
  return (
    <motion.button whileTap={{ scale: 0.92 }} onClick={() => { haptic.selection(); onToggle(); }}
      className="px-3 py-1.5 rounded-xl border-2 text-[12px] font-bold transition-all"
      style={selected
        ? { borderColor: color, backgroundColor: `${color}18`, color }
        : { borderColor: '#e2e8f0', backgroundColor: '#f8fafc', color: '#64748b' }}>
      {selected && <span className="ml-1">✓</span>}{label}
    </motion.button>
  );
}

function SectionCard({ children, title, icon: Icon, color }: {
  children: React.ReactNode; title: string; icon: any; color: string;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.78)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      border: '1px solid rgba(255,255,255,0.62)',
      boxShadow: '0 0 0 0.5px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
      borderRadius: 22,
      padding: 16,
      marginBottom: 12,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, paddingBottom:12, borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ width:30, height:30, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background:`${color}14`, border:`1px solid ${color}20`, flexShrink:0 }}>
          <Icon style={{ width:15, height:15, color }} />
        </div>
        <span style={{ fontSize:13, fontWeight:800, color:'#1e293b' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400 mb-2">{children}</p>;
}

function TextInput({ value, onChange, placeholder, multiline }: {
  value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  const style: React.CSSProperties = {
    width:'100%', fontSize:13, fontWeight:500, color:'#1e293b',
    background:'rgba(248,250,252,0.9)', borderRadius:14, padding:'10px 14px',
    border:'1px solid rgba(0,0,0,0.08)', outline:'none', resize:'none' as any,
    boxShadow:'inset 0 1px 3px rgba(0,0,0,0.04)',
    transition:'border-color 200ms',
  };
  return multiline
    ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />
    : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />;
}

function SelectRow({ value, onChange, options, label }: {
  value: string; onChange: (v: string) => void; options: string[]; label: string;
}) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <Chip key={o} label={o} selected={value === o} onToggle={() => onChange(value === o ? '' : o)} />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PROGRESS BAR
   ══════════════════════════════════════════ */
function ProgressHeader({ current, total, sectionLabel, color, onSectionClick }:
  { current: number; total: number; sectionLabel: string; color: string; onSectionClick: () => void }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ padding:'10px 16px 12px', background:'rgba(255,255,255,0.82)', backdropFilter:'blur(20px) saturate(160%)', WebkitBackdropFilter:'blur(20px) saturate(160%)', borderBottom:'1px solid rgba(0,0,0,0.07)' }}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={onSectionClick}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
          style={{ backgroundColor: `${color}18`, color }}>
          <span>{current}/{total}</span>
          <span>•</span>
          <span>{sectionLabel}</span>
        </button>
        <span className="text-[11px] font-bold text-slate-400">{pct}% اكتمل</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SECTION NAVIGATOR (overview)
   ══════════════════════════════════════════ */
function SectionOverlay({ current, completed, onSelect, onClose }:
  { current: number; completed: Set<number>; onSelect: (i: number) => void; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end"
      onClick={onClose}>
      <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
        style={{ width:'100%', background:'rgba(255,255,255,0.92)', backdropFilter:'blur(32px) saturate(180%)', WebkitBackdropFilter:'blur(32px) saturate(180%)', borderRadius:'28px 28px 0 0', padding:20, paddingBottom:40, maxHeight:'75vh', overflowY:'auto' as any, boxShadow:'0 -4px 32px rgba(0,0,0,0.10)' }}>
        <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5" />
        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">التنقل بين الأقسام</p>
        <div className="space-y-2">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            const done = completed.has(i);
            const isCurrent = current === i;
            return (
              <motion.button key={s.id} whileTap={{ scale: 0.97 }}
                onClick={() => { onSelect(i); onClose(); }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-right transition-all"
                style={isCurrent
                  ? { backgroundColor: `${s.color}12`, border: `1.5px solid ${s.color}40` }
                  : { backgroundColor: '#f8fafc', border: '1.5px solid transparent' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${s.color}18` }}>
                  {done ? <Check className="w-4 h-4" style={{ color: s.color }} />
                    : <Icon className="w-4 h-4" style={{ color: s.color }} />}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{s.label}</p>
                  <p className="text-[10.5px] text-slate-400 font-medium">{s.desc}</p>
                </div>
                {done && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: s.color }}>مكتمل</span>}
                {isCurrent && <span className="text-[9px] font-bold text-slate-400">حالي</span>}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   SECTION RENDERERS
   ══════════════════════════════════════════ */

// 1. PERSONAL
function PersonalSection({ data, update }: { data: MedicalHistory; update: (k: keyof MedicalHistory, v: any) => void }) {
  return (
    <div className="space-y-0">
      <SectionCard title="المعلومات الأساسية" icon={User} color="#0d9488">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <FieldLabel>سنة الميلاد</FieldLabel>
            <TextInput value={data.birthYear} onChange={v => update('birthYear', v)} placeholder="مثال: 1990" />
          </div>
          <SelectRow value={data.gender} onChange={v => update('gender', v)}
            options={['ذكر', 'أنثى']} label="الجنس" />
        </div>
        <SelectRow value={data.maritalStatus} onChange={v => update('maritalStatus', v)}
          options={['أعزب/عزباء', 'متزوج/ة', 'مطلق/ة', 'أرمل/ة']} label="الحالة الاجتماعية" />
        <div className="mb-4">
          <FieldLabel>المهنة</FieldLabel>
          <TextInput value={data.occupation} onChange={v => update('occupation', v)} placeholder="ما هو عملك؟" />
        </div>
        <SelectRow value={data.children} onChange={v => update('children', v)}
          options={['لا أطفال', '١-٢', '٣-٤', '٥+']} label="الأطفال" />
      </SectionCard>
    </div>
  );
}

// 2. COMPLAINT (SOCRATES)
function ComplaintSection({ data, update }: { data: MedicalHistory; update: (k: keyof MedicalHistory, v: any) => void }) {
  const toggle = (field: 'character' | 'associatedSymptoms' | 'exacerbating' | 'relieving', val: string) => {
    const arr: string[] = data[field] as string[];
    update(field, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };
  return (
    <div>
      {/* S - Site */}
      <SectionCard title="S — موقع الأعراض" icon={MapPin} color="#6366f1">
        <FieldLabel>أين تشعر بالألم أو الانزعاج بالضبط؟</FieldLabel>
        <TextInput value={data.site} onChange={v => update('site', v)} placeholder="مثال: أسفل البطن اليمين، الصدر..." />
      </SectionCard>

      {/* O - Onset */}
      <SectionCard title="O — بداية الأعراض" icon={Clock} color="#6366f1">
        <SelectRow value={data.onset} onChange={v => update('onset', v)}
          options={['فجأة', 'تدريجياً', 'بعد حدث معين']} label="كيف بدأت الأعراض؟" />
        <FieldLabel>متى بدأت (تقريباً)؟</FieldLabel>
        <input type="date" value={data.onsetDate} onChange={e => update('onsetDate', e.target.value)}
          className="w-full text-[13px] bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-indigo-300" />
      </SectionCard>

      {/* C - Character */}
      <SectionCard title="C — طبيعة الألم / الانزعاج" icon={Activity} color="#6366f1">
        <FieldLabel>كيف تصف الألم؟ (اختر كل ما ينطبق)</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {['حارق', 'طاعن', 'ثقيل', 'ضاغط', 'نابض', 'مستمر', 'متقطع', 'خدر', 'وخز', 'شد عضلي'].map(c => (
            <Chip key={c} label={c} selected={data.character.includes(c)} color="#6366f1"
              onToggle={() => toggle('character', c)} />
          ))}
        </div>
      </SectionCard>

      {/* R - Radiation */}
      <SectionCard title="R — الانتشار" icon={ChevronRight} color="#6366f1">
        <FieldLabel>هل ينتشر الألم لمكان آخر؟</FieldLabel>
        <TextInput value={data.radiation} onChange={v => update('radiation', v)}
          placeholder="مثال: ينتشر للظهر / لا ينتشر" />
      </SectionCard>

      {/* A - Associated Symptoms */}
      <SectionCard title="A — أعراض مصاحبة" icon={HeartPulse} color="#6366f1">
        <FieldLabel>هل يصاحب ذلك أي من التالي؟</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {['غثيان', 'قيء', 'إسهال', 'إمساك', 'حمى', 'تعرق', 'ضيق نفس', 'دوخة', 'خفقان', 'فقدان وزن', 'تعب', 'صداع'].map(s => (
            <Chip key={s} label={s} selected={data.associatedSymptoms.includes(s)} color="#6366f1"
              onToggle={() => toggle('associatedSymptoms', s)} />
          ))}
        </div>
      </SectionCard>

      {/* T - Timing */}
      <SectionCard title="T — التوقيت والنمط" icon={Clock} color="#6366f1">
        <SelectRow value={data.timing} onChange={v => update('timing', v)}
          options={['صباحي', 'مسائي', 'ليلي', 'بعد الأكل', 'أثناء الحركة', 'في الراحة', 'طوال اليوم']}
          label="متى تكون الأعراض أشد؟" />
      </SectionCard>

      {/* E - Exacerbating / Relieving */}
      <SectionCard title="E — المحرضات والمخففات" icon={Zap} color="#6366f1">
        <FieldLabel>ما الذي يزيد الأعراض سوءاً؟</FieldLabel>
        <div className="flex flex-wrap gap-2 mb-4">
          {['الحركة', 'الضغط', 'الطعام', 'الإجهاد', 'البرد', 'الحرارة', 'الوقوف الطويل', 'الجلوس الطويل'].map(e => (
            <Chip key={e} label={e} selected={data.exacerbating.includes(e)} color="#ef4444"
              onToggle={() => toggle('exacerbating', e)} />
          ))}
        </div>
        <FieldLabel>ما الذي يخفف الأعراض؟</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {['الراحة', 'الدواء', 'الحرارة', 'البرد', 'الأكل', 'الصيام', 'النوم', 'المشي'].map(r => (
            <Chip key={r} label={r} selected={data.relieving.includes(r)} color="#10b981"
              onToggle={() => toggle('relieving', r)} />
          ))}
        </div>
      </SectionCard>

      {/* S - Severity */}
      <SectionCard title="S — درجة الحدة" icon={Thermometer} color="#6366f1">
        <FieldLabel>كيف تقيّم شدة الألم من ١ إلى ١٠؟</FieldLabel>
        <div className="flex gap-1.5 mb-2">
          {[1,2,3,4,5,6,7,8,9,10].map(n => {
            const col = n <= 3 ? '#10b981' : n <= 6 ? '#f59e0b' : n <= 8 ? '#f97316' : '#ef4444';
            return (
              <motion.button key={n} whileTap={{ scale: 0.85 }}
                onClick={() => { haptic.selection(); update('severity', n); }}
                className="flex-1 py-2.5 rounded-lg text-[11px] font-black transition-all"
                style={data.severity === n
                  ? { backgroundColor: col, color: '#fff' }
                  : { backgroundColor: '#f1f5f9', color: '#94a3b8' }}>
                {n}
              </motion.button>
            );
          })}
        </div>
        <p className="text-center text-[11px] text-slate-400 font-medium">
          {data.severity <= 3 ? '🟢 خفيف' : data.severity <= 6 ? '🟡 متوسط' : data.severity <= 8 ? '🟠 شديد' : '🔴 حرج'}
        </p>
      </SectionCard>
    </div>
  );
}

// 3. PMH
function PMHSection({ data, update }: { data: MedicalHistory; update: (k: keyof MedicalHistory, v: any) => void }) {
  const DISEASES = ['السكري','ضغط الدم','أمراض القلب','الغدة الدرقية','الربو','الحساسية','القولون','الصرع','الاكتئاب','السرطان','الروماتيزم','هشاشة العظام'];
  const toggle = (d: string) => {
    const arr = data.chronicDiseases;
    update('chronicDiseases', arr.includes(d) ? arr.filter(x => x !== d) : [...arr, d]);
  };
  return (
    <div>
      <SectionCard title="الأمراض المزمنة" icon={Activity} color="#f59e0b">
        <FieldLabel>هل تعاني أو عانيت سابقاً من؟ (اختر كل ما ينطبق)</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {DISEASES.map(d => (
            <Chip key={d} label={d} selected={data.chronicDiseases.includes(d)} color="#f59e0b" onToggle={() => toggle(d)} />
          ))}
        </div>
      </SectionCard>
      <SectionCard title="العمليات الجراحية" icon={FileText} color="#f59e0b">
        <TextInput value={data.previousSurgeries} onChange={v => update('previousSurgeries', v)}
          placeholder="اذكر العمليات التي أجريتها مع التاريخ التقريبي..." multiline />
      </SectionCard>
      <SectionCard title="الدخولات المستشفى" icon={Stethoscope} color="#f59e0b">
        <TextInput value={data.hospitalizations} onChange={v => update('hospitalizations', v)}
          placeholder="آخر مرة دخلت فيها المستشفى وسبب الدخول..." multiline />
      </SectionCard>
    </div>
  );
}

// 4. MEDICATIONS
function MedicationsSection({ data, update }: { data: MedicalHistory; update: (k: keyof MedicalHistory, v: any) => void }) {
  const [newMed, setNewMed] = useState({ name: '', dose: '', since: '' });
  const ALLERGIES_LIST = ['البنسيلين','السلفا','الأسبرين','الإيبوبروفين','اللاتكس','المكسرات','المأكولات البحرية','الغلوتين'];
  const toggleAllergy = (a: string) => {
    const arr = data.allergies;
    update('allergies', arr.includes(a) ? arr.filter(x => x !== a) : [...arr, a]);
  };
  const addMed = () => {
    if (!newMed.name) return;
    update('currentMeds', [...data.currentMeds, { ...newMed }]);
    setNewMed({ name: '', dose: '', since: '' });
  };
  return (
    <div>
      <SectionCard title="الأدوية الحالية" icon={Pill} color="#ef4444">
        {data.currentMeds.map((m, i) => (
          <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 mb-2">
            <div className="flex-1">
              <p className="text-[12.5px] font-bold text-slate-700 dark:text-slate-200">{m.name}</p>
              <p className="text-[10.5px] text-slate-400">{m.dose} • منذ {m.since}</p>
            </div>
            <button onClick={() => update('currentMeds', data.currentMeds.filter((_, j) => j !== i))}
              className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
              <X className="w-3 h-3 text-red-400" />
            </button>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <input value={newMed.name} onChange={e => setNewMed(p => ({ ...p, name: e.target.value }))}
            placeholder="اسم الدواء" className="col-span-3 text-[12px] bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5 border border-slate-100 dark:border-slate-700/60 focus:outline-none focus:border-red-300" />
          <input value={newMed.dose} onChange={e => setNewMed(p => ({ ...p, dose: e.target.value }))}
            placeholder="الجرعة" className="text-[12px] bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5 border border-slate-100 dark:border-slate-700/60 focus:outline-none" />
          <input value={newMed.since} onChange={e => setNewMed(p => ({ ...p, since: e.target.value }))}
            placeholder="منذ" className="text-[12px] bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5 border border-slate-100 dark:border-slate-700/60 focus:outline-none" />
          <motion.button whileTap={{ scale: 0.93 }} onClick={addMed}
            className="flex items-center justify-center gap-1 rounded-xl text-[12px] font-bold text-white"
            style={{ backgroundColor: '#ef4444' }}>
            <Plus className="w-3.5 h-3.5" /> إضافة
          </motion.button>
        </div>
        <div className="mt-4">
          <FieldLabel>مكملات غذائية / أعشاب / فيتامينات</FieldLabel>
          <TextInput value={data.supplements} onChange={v => update('supplements', v)} placeholder="مثال: أوميغا 3، فيتامين D..." />
        </div>
      </SectionCard>
      <SectionCard title="الحساسية (Allergies)" icon={AlertTriangle} color="#ef4444">
        <FieldLabel>هل لديك حساسية لأي من التالي؟</FieldLabel>
        <div className="flex flex-wrap gap-2 mb-3">
          {ALLERGIES_LIST.map(a => (
            <Chip key={a} label={a} selected={data.allergies.includes(a)} color="#ef4444" onToggle={() => toggleAllergy(a)} />
          ))}
        </div>
        <FieldLabel>تفاصيل الحساسية وردود الفعل</FieldLabel>
        <TextInput value={data.allergyDetails} onChange={v => update('allergyDetails', v)}
          placeholder="صف ردة فعل الحساسية..." multiline />
      </SectionCard>
    </div>
  );
}

// 5. FAMILY HISTORY
function FamilySection({ data, update }: { data: MedicalHistory; update: (k: keyof MedicalHistory, v: any) => void }) {
  const FAMILY_DISEASES = ['السكري','القلب','السرطان','ضغط الدم','الغدة الدرقية','الاكتئاب','الزهايمر','الجلطة','الروماتيزم'];
  const toggleFamily = (member: string, disease: string) => {
    const current = data.familyDiseases[member] || [];
    const next = current.includes(disease) ? current.filter(x => x !== disease) : [...current, disease];
    update('familyDiseases', { ...data.familyDiseases, [member]: next });
  };
  const COLOR = '#8b5cf6';
  return (
    <div>
      {Object.keys(data.familyDiseases).map(member => (
        <SectionCard key={member} title={`أمراض ال${member}`} icon={Users} color={COLOR}>
          <div className="flex flex-wrap gap-2">
            {FAMILY_DISEASES.map(d => (
              <Chip key={d} label={d} color={COLOR}
                selected={(data.familyDiseases[member] || []).includes(d)}
                onToggle={() => toggleFamily(member, d)} />
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

// 6. LIFESTYLE
function LifestyleSection({ data, update }: { data: MedicalHistory; update: (k: keyof MedicalHistory, v: any) => void }) {
  const COLOR = '#10b981';
  return (
    <div>
      <SectionCard title="النظام الغذائي" icon={Utensils} color={COLOR}>
        <SelectRow value={data.diet} onChange={v => update('diet', v)}
          options={['متنوع', 'نباتي', 'كيتو', 'بحر متوسط', 'متقطع', 'بدون قيود']} label="نوع النظام الغذائي" />
        <SelectRow value={data.mealsPerDay} onChange={v => update('mealsPerDay', v)}
          options={['وجبة واحدة', 'وجبتان', '٣ وجبات', '٤ أو أكثر', 'غير منتظم']} label="عدد الوجبات يومياً" />
        <SelectRow value={data.water} onChange={v => update('water', v)}
          options={['أقل من لتر', '١-١.٥ لتر', '١.٥-٢ لتر', 'أكثر من ٢ لتر']} label="شرب الماء يومياً" />
      </SectionCard>
      <SectionCard title="النوم والراحة" icon={Moon} color={COLOR}>
        <SelectRow value={data.sleepHours} onChange={v => update('sleepHours', v)}
          options={['أقل من ٥ ساعات', '٥-٦', '٦-٧', '٧-٨', 'أكثر من ٨']} label="ساعات النوم" />
        <SelectRow value={data.sleepQuality} onChange={v => update('sleepQuality', v)}
          options={['سيئة', 'متقطعة', 'مقبولة', 'جيدة', 'ممتازة']} label="جودة النوم" />
      </SectionCard>
      <SectionCard title="النشاط البدني" icon={Dumbbell} color={COLOR}>
        <SelectRow value={data.exercise} onChange={v => update('exercise', v)}
          options={['لا أمارس', 'مرة أسبوعياً', '٢-٣ مرات', 'يومياً', 'رياضي محترف']} label="التمرين الرياضي" />
      </SectionCard>
      <SectionCard title="مستوى الإجهاد النفسي" icon={Brain} color={COLOR}>
        <FieldLabel>كيف تقيّم مستوى ضغوطك اليومية؟</FieldLabel>
        <div className="flex gap-1 mb-1">
          {[1,2,3,4,5,6,7,8,9,10].map(n => {
            const col = n <= 3 ? '#10b981' : n <= 6 ? '#f59e0b' : '#ef4444';
            return (
              <motion.button key={n} whileTap={{ scale: 0.85 }}
                onClick={() => { haptic.selection(); update('stressLevel', n); }}
                className="flex-1 py-2 rounded-lg text-[11px] font-black transition-all"
                style={data.stressLevel === n ? { backgroundColor: col, color: '#fff' } : { backgroundColor: '#f1f5f9', color: '#94a3b8' }}>
                {n}
              </motion.button>
            );
          })}
        </div>
        <p className="text-center text-[11px] text-slate-400">
          {data.stressLevel <= 3 ? '🟢 منخفض' : data.stressLevel <= 6 ? '🟡 متوسط' : '🔴 مرتفع'}
        </p>
      </SectionCard>
      <SectionCard title="العادات" icon={Cigarette} color={COLOR}>
        <SelectRow value={data.smoking} onChange={v => update('smoking', v)}
          options={['لا أدخن', 'سابقاً', 'أدخن', 'أرجيلة', 'إلكتروني']} label="التدخين" />
        <SelectRow value={data.alcohol} onChange={v => update('alcohol', v)}
          options={['لا', 'نادراً', 'أحياناً', 'منتظم']} label="الكحول" />
        <SelectRow value={data.caffeine} onChange={v => update('caffeine', v)}
          options={['لا', 'كوب واحد', '٢-٣ أكواب', 'أكثر من ٣']} label="الكافيين يومياً (قهوة/شاي)" />
      </SectionCard>
    </div>
  );
}

// 7. REVIEW OF SYSTEMS (ROS)
function ROSSection({ data, update }: { data: MedicalHistory; update: (k: keyof MedicalHistory, v: any) => void }) {
  const SYSTEMS = [
    { id: 'general',     label: 'عام',               icon: Activity,   color: '#0d9488', symptoms: ['تعب مزمن','فقدان وزن','كسب وزن','حمى','تعرق ليلي','شهية سيئة'] },
    { id: 'cardiac',     label: 'القلب والأوعية',    icon: Heart,      color: '#ef4444', symptoms: ['خفقان','ضيق نفس عند الجهد','ألم صدر','تورم أطراف','دوخة عند الوقوف'] },
    { id: 'respiratory', label: 'الجهاز التنفسي',   icon: Wind,       color: '#0ea5e9', symptoms: ['سعال مزمن','ضيق تنفس','صفير صدري','ألم عند التنفس','كثرة البلغم'] },
    { id: 'gi',          label: 'الجهاز الهضمي',    icon: Activity,   color: '#f59e0b', symptoms: ['حرقة معدة','غثيان','قيء','إسهال','إمساك','انتفاخ','ألم بطن','دم في البراز'] },
    { id: 'neuro',       label: 'الجهاز العصبي',    icon: Brain,      color: '#8b5cf6', symptoms: ['صداع مزمن','شقيقة','دوار','تنميل','ضعف عضلي','مشاكل ذاكرة','نوبات'] },
    { id: 'msk',         label: 'العظام والمفاصل',  icon: Bone,       color: '#6366f1', symptoms: ['آلام مفاصل','تيبس صباحي','آلام عضلية','ضعف عضلي','ألم ظهر','ألم رقبة'] },
    { id: 'endo',        label: 'الغدد الصماء',     icon: Zap,        color: '#ec4899', symptoms: ['عطش زائد','تبول متكرر','تغيرات وزن','تعب شديد','تغيرات مزاج','برودة/حرارة زائدة'] },
    { id: 'skin',        label: 'الجلد',             icon: Shield,     color: '#10b981', symptoms: ['طفح جلدي','حكة','تغير لون الجلد','تساقط شعر','هشاشة أظافر','جفاف'] },
    { id: 'eyes',        label: 'العيون',            icon: Eye,        color: '#14b8a6', symptoms: ['ضعف نظر','ازدواج رؤية','احمرار','ألم عيون','جفاف'] },
    { id: 'psych',       label: 'الصحة النفسية',    icon: Brain,      color: '#a855f7', symptoms: ['اكتئاب','قلق','اضطراب نوم','وسواس','عزلة اجتماعية','توتر مزمن'] },
  ];

  const toggleROS = (systemId: string, symptom: string) => {
    const current = data.rosPositive[systemId] || [];
    const next = current.includes(symptom) ? current.filter(x => x !== symptom) : [...current, symptom];
    update('rosPositive', { ...data.rosPositive, [systemId]: next });
  };

  return (
    <div>
      {SYSTEMS.map(sys => {
        const Icon = sys.icon;
        const selected = data.rosPositive[sys.id] || [];
        const count = selected.length;
        return (
          <SectionCard key={sys.id} title={sys.label} icon={sys.icon} color={sys.color}>
            {count > 0 && (
              <div className="flex items-center gap-1.5 mb-2 p-2 rounded-xl" style={{ backgroundColor: `${sys.color}10` }}>
                <span className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: sys.color }}>
                  {count} أعراض محددة
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {sys.symptoms.map(s => (
                <Chip key={s} label={s} selected={selected.includes(s)} color={sys.color}
                  onToggle={() => toggleROS(sys.id, s)} />
              ))}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}

// 8. GOALS
function GoalsSection({ data, update }: { data: MedicalHistory; update: (k: keyof MedicalHistory, v: any) => void }) {
  const COLOR = '#ec4899';
  const GOAL_OPTIONS = ['إدارة الألم','تحسين الطاقة','إنقاص الوزن','تحسين النوم','توازن الهرمونات','تحسين الهضم','تقليل الدواء','الوقاية','التعافي من مرض مزمن'];
  const toggle = (g: string) => {
    const arr = data.specificGoals;
    update('specificGoals', arr.includes(g) ? arr.filter(x => x !== g) : [...arr, g]);
  };
  return (
    <div>
      <SectionCard title="هدفك الرئيسي" icon={Sparkles} color={COLOR}>
        <FieldLabel>في جملة واحدة — ما الذي تريده أكثر شيء؟</FieldLabel>
        <TextInput value={data.mainGoal} onChange={v => update('mainGoal', v)}
          placeholder="مثال: أريد أن أعود لحياتي الطبيعية دون آلام..." multiline />
      </SectionCard>
      <SectionCard title="الأهداف المحددة" icon={CheckCircle} color={COLOR}>
        <FieldLabel>اختر الأهداف التي تريد تحقيقها</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map(g => (
            <Chip key={g} label={g} selected={data.specificGoals.includes(g)} color={COLOR} onToggle={() => toggle(g)} />
          ))}
        </div>
      </SectionCard>
      <SectionCard title="الإطار الزمني" icon={Clock} color={COLOR}>
        <SelectRow value={data.timeframe} onChange={v => update('timeframe', v)}
          options={['شهر واحد', '٣ أشهر', '٦ أشهر', 'سنة', 'بلا حدود']}
          label="في كم وقت تتوقع تحقيق هدفك؟" />
      </SectionCard>
      <SectionCard title="ملاحظات إضافية" icon={FileText} color={COLOR}>
        <FieldLabel>أي معلومات أخرى تود مشاركتها مع الطبيب</FieldLabel>
        <TextInput value={data.additionalNotes} onChange={v => update('additionalNotes', v)}
          placeholder="مثال: لديّ تحاليل قديمة، أو مررت بتجربة علاجية سابقة..." multiline />
      </SectionCard>
    </div>
  );
}

/* ══════════════════════════════════════════
   SUMMARY GENERATOR
   ══════════════════════════════════════════ */
function generateSummary(h: MedicalHistory): string {
  const lines: string[] = [];
  lines.push('📋 *التاريخ المرضي — طِبرَا*');
  lines.push(`📅 التاريخ: ${new Date().toLocaleDateString('ar-SA')}`);
  lines.push('');

  if (h.birthYear || h.gender || h.occupation) {
    lines.push('👤 *البيانات الشخصية*');
    if (h.birthYear) lines.push(`• المولد: ${h.birthYear}`);
    if (h.gender) lines.push(`• الجنس: ${h.gender}`);
    if (h.maritalStatus) lines.push(`• الحالة: ${h.maritalStatus}`);
    if (h.occupation) lines.push(`• المهنة: ${h.occupation}`);
    lines.push('');
  }

  if (h.site || h.character.length || h.severity) {
    lines.push('🩺 *الشكوى الحالية (SOCRATES)*');
    if (h.site) lines.push(`• الموقع: ${h.site}`);
    if (h.onset) lines.push(`• البداية: ${h.onset}${h.onsetDate ? ' (' + h.onsetDate + ')' : ''}`);
    if (h.character.length) lines.push(`• الطبيعة: ${h.character.join('، ')}`);
    if (h.radiation) lines.push(`• الانتشار: ${h.radiation}`);
    if (h.associatedSymptoms.length) lines.push(`• أعراض مصاحبة: ${h.associatedSymptoms.join('، ')}`);
    if (h.timing) lines.push(`• التوقيت: ${h.timing}`);
    if (h.exacerbating.length) lines.push(`• محرضات: ${h.exacerbating.join('، ')}`);
    if (h.relieving.length) lines.push(`• مخففات: ${h.relieving.join('، ')}`);
    lines.push(`• الحدة: ${h.severity}/10`);
    lines.push('');
  }

  if (h.chronicDiseases.length || h.previousSurgeries) {
    lines.push('📁 *التاريخ الطبي*');
    if (h.chronicDiseases.length) lines.push(`• أمراض مزمنة: ${h.chronicDiseases.join('، ')}`);
    if (h.previousSurgeries) lines.push(`• عمليات: ${h.previousSurgeries}`);
    if (h.hospitalizations) lines.push(`• مستشفيات: ${h.hospitalizations}`);
    lines.push('');
  }

  if (h.currentMeds.length || h.allergies.length) {
    lines.push('💊 *الأدوية والحساسية*');
    h.currentMeds.forEach(m => lines.push(`• ${m.name} ${m.dose} (منذ ${m.since})`));
    if (h.supplements) lines.push(`• مكملات: ${h.supplements}`);
    if (h.allergies.length) lines.push(`• حساسية: ${h.allergies.join('، ')}`);
    lines.push('');
  }

  const famLines = Object.entries(h.familyDiseases).filter(([, v]) => v.length > 0);
  if (famLines.length) {
    lines.push('👨‍👩‍👧 *التاريخ العائلي*');
    famLines.forEach(([member, diseases]) => lines.push(`• ال${member}: ${diseases.join('، ')}`) );
    lines.push('');
  }

  if (h.diet || h.exercise || h.sleepHours) {
    lines.push('🌿 *النمط الحياتي*');
    if (h.diet) lines.push(`• النظام الغذائي: ${h.diet}`);
    if (h.exercise) lines.push(`• التمرين: ${h.exercise}`);
    if (h.sleepHours) lines.push(`• النوم: ${h.sleepHours} — ${h.sleepQuality}`);
    if (h.smoking && h.smoking !== 'لا أدخن') lines.push(`• التدخين: ${h.smoking}`);
    lines.push(`• مستوى التوتر: ${h.stressLevel}/10`);
    lines.push('');
  }

  const rosLines = Object.entries(h.rosPositive).filter(([, v]) => v.length > 0);
  if (rosLines.length) {
    lines.push('🔍 *مراجعة الأجهزة (الأعراض الإيجابية)*');
    rosLines.forEach(([sys, syms]) => lines.push(`• ${sys}: ${syms.join('، ')}`) );
    lines.push('');
  }

  if (h.mainGoal || h.specificGoals.length) {
    lines.push('🎯 *الأهداف*');
    if (h.mainGoal) lines.push(`• الهدف الرئيسي: ${h.mainGoal}`);
    if (h.specificGoals.length) lines.push(`• أهداف: ${h.specificGoals.join('، ')}`);
    if (h.timeframe) lines.push(`• الإطار: ${h.timeframe}`);
    lines.push('');
  }

  if (h.additionalNotes) {
    lines.push('📝 *ملاحظات إضافية*');
    lines.push(h.additionalNotes);
    lines.push('');
  }

  lines.push('—');
  lines.push('أُرسل عبر تطبيق طِبرَا الصحي');
  return lines.join('\n');
}

/* ══════════════════════════════════════════
   COMPLETION SCREEN
   ══════════════════════════════════════════ */
const DOCTOR_WHATSAPP = '967771447111';

function CompletionScreen({ history, onBack }: { history: MedicalHistory; onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(false);

  const summary = generateSummary(history);
  const waText = encodeURIComponent(summary);
  const waUrl = `https://wa.me/${DOCTOR_WHATSAPP}?text=${waText}`;

  // Auto-fetch AI analysis on mount
  useEffect(() => {
    const fetchAI = async () => {
      setAiLoading(true);
      setAiError(false);
      try {
        const prompt = `أنت محلل طبي وظيفي. قدّم تحليلاً سريرياً موجزاً ودقيقاً لهذا التاريخ المرضي بأسلوب دافئ ومهني.

التاريخ المرضي الكامل:
${summary}

أريد منك:
1. 🔍 الأنماط الصحية الملحوظة (2-3 نقاط)
2. 🌱 الأسباب الجذرية المحتملة (2 نقاط)
3. ✅ أولويات الإجراء الفوري (3 نقاط عملية)
4. 🩺 الفحوصات المقترحة إن لزم (نقطة واحدة)

كن موجزاً ومحدداً. لا تتجاوز 200 كلمة. استخدم لغة عربية واضحة.'`;

        const res = await fetch('/api/chat-gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt }),
        });

        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (data.text) {
          setAiAnalysis(data.text);
        } else {
          setAiError(true);
        }
      } catch {
        setAiError(true);
      } finally {
        setAiLoading(false);
      }
    };
    fetchAI();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      haptic.success();
    } catch {
      haptic.error();
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تاريخي المرضي — طِبرَا',
          text: summary,
        });
        haptic.impact();
      } catch { }
    } else {
      handleCopy();
    }
  };

  const sections = SECTIONS.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="px-4 pb-28 max-w-md mx-auto pt-6"
    >
      {/* Success badge */}
      <div className="flex flex-col items-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
          className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-4 relative"
          style={{ background: 'linear-gradient(135deg, #0d9488, #6366f1)' }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute inset-0 rounded-[28px]"
            style={{ background: 'linear-gradient(135deg, #0d9488, #6366f1)', filter: 'blur(12px)' }}
          />
          <CheckCircle className="w-10 h-10 text-white relative z-10" />
        </motion.div>
        <h1 className="text-[22px] font-black text-slate-800 dark:text-white text-center">تاريخك المرضي مكتمل</h1>
        <p className="text-[12.5px] text-slate-500 dark:text-slate-400 font-medium text-center mt-1">
          {sections} أقسام مكتملة — تم الحفظ في ملفك الطبي
        </p>
      </div>

      {/* ── AI ANALYSIS CARD ── */}
      <div className="mb-5">
        <div className="rounded-[22px] overflow-hidden border shadow-sm"
          style={{ borderColor: aiLoading ? '#e2e8f0' : aiError ? '#fecaca' : 'rgba(99,102,241,0.2)',
                   backgroundColor: aiLoading ? '#f8fafc' : aiError ? '#fff5f5' : 'rgba(99,102,241,0.04)' }}>

          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b"
            style={{ borderColor: aiLoading ? '#f1f5f9' : aiError ? '#fecaca' : 'rgba(99,102,241,0.12)' }}>
            <motion.div
              animate={aiLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={aiLoading ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: aiError ? '#fee2e2' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Sparkles className="w-4 h-4" style={{ color: aiError ? '#ef4444' : '#fff' }} />
            </motion.div>
            <div>
              <p className="text-[12.5px] font-black text-slate-700 dark:text-slate-200">تحليل ذكاء طِبرَا الاصطناعي</p>
              <p className="text-[10px] font-bold text-slate-400">
                {aiLoading ? 'يحلل تاريخك المرضي...' : aiError ? 'تعذّر التحليل' : 'تحليل وظيفي مخصص'}
              </p>
            </div>
            {!aiLoading && !aiError && (
              <span className="mr-auto text-[9px] font-extrabold px-2 py-1 rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>AI</span>
            )}
          </div>

          {/* Body */}
          <div className="px-4 py-4">
            {aiLoading ? (
              <div className="space-y-2.5">
                {[80, 65, 90, 55, 75].map((w, i) => (
                  <motion.div key={i}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
                    className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"
                    style={{ width: `${w}%` }} />
                ))}
                <p className="text-center text-[11px] text-slate-400 font-medium pt-1">جاري التحليل العميق...</p>
              </div>
            ) : aiError ? (
              <p className="text-[12px] text-red-400 font-medium text-center py-2">
                ⚠️ تعذّر التحليل — تحقق من الاتصال
              </p>
            ) : (
              <p className="text-[12px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                {aiAnalysis}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'الأقسام', value: `${sections}`, icon: '📋' },
          { label: 'محفوظ آمن', value: '✓', icon: '🔒' },
          { label: 'جاهز للطبيب', value: '✓', icon: '👨‍⚕️' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60 text-center">
            <p className="text-[18px] mb-0.5">{s.icon}</p>
            <p className="text-[14px] font-black text-slate-700 dark:text-slate-200">{s.value}</p>
            <p className="text-[9.5px] font-bold text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sharing section */}
      <div className="bg-white dark:bg-slate-800/60 rounded-[22px] border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden mb-4">
        <div className="px-4 pt-4 pb-3 border-b border-slate-50 dark:border-slate-700/40">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">إرسال ومشاركة</p>
          <p className="text-[12px] text-slate-500 font-medium mt-0.5">أرسل تاريخك للطبيب أو احتفظ بنسخة</p>
        </div>

        {/* WhatsApp — Primary */}
        <a href={waUrl} target="_blank" rel="noopener noreferrer">
          <motion.div whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
            style={{ backgroundColor: 'rgba(37,211,102,0.06)' }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}>
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-black text-slate-700 dark:text-slate-200">أرسل للطبيب عبر واتساب</p>
              <p className="text-[10.5px] text-slate-400 font-medium">يفتح واتساب مباشرة مع الملخص كاملاً</p>
            </div>
            <ExternalLink className="w-4 h-4 text-green-400" />
          </motion.div>
        </a>

        <div className="h-[1px] bg-slate-50 dark:bg-slate-700/40 mx-4" />

        {/* Native Share */}
        <motion.div whileTap={{ scale: 0.97 }}
          onClick={handleNativeShare}
          className="flex items-center gap-3 px-4 py-3.5 cursor-pointer">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[13.5px] font-black text-slate-700 dark:text-slate-200">مشاركة (إنستغرام، تيليغرام...)</p>
            <p className="text-[10.5px] text-slate-400 font-medium">يفتح قائمة التطبيقات على جهازك</p>
          </div>
          <Share2 className="w-4 h-4 text-indigo-400" />
        </motion.div>

        <div className="h-[1px] bg-slate-50 dark:bg-slate-700/40 mx-4" />

        {/* Copy */}
        <motion.div whileTap={{ scale: 0.97 }}
          onClick={handleCopy}
          className="flex items-center gap-3 px-4 py-3.5 cursor-pointer">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: copied ? 'rgba(13,148,136,0.15)' : '#f1f5f9' }}>
            {copied
              ? <Check className="w-5 h-5 text-teal-500" />
              : <Copy className="w-5 h-5 text-slate-400" />}
          </div>
          <div className="flex-1">
            <p className="text-[13.5px] font-black text-slate-700 dark:text-slate-200">
              {copied ? 'تم النسخ ✓' : 'نسخ النص للحافظة'}
            </p>
            <p className="text-[10.5px] text-slate-400 font-medium">الصقه في أي تطبيق تريده</p>
          </div>
        </motion.div>
      </div>

      {/* Preview box */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/60 mb-5">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">معاينة الملخص</p>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed" style={{ whiteSpace: 'pre-line', maxHeight: 160, overflow: 'hidden' }}>
          {summary.slice(0, 280)}{summary.length > 280 ? '...' : ''}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-2.5">
        <Link href="/my-care">
          <motion.div whileTap={{ scale: 0.97 }}
            className="w-full h-[50px] rounded-2xl flex items-center justify-between px-5 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 6px 20px rgba(13,148,136,0.25)' }}>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-white" />
              <span className="text-[13.5px] font-black text-white">انتقل لرعايتي</span>
            </div>
            <ArrowRight className="w-4 h-4 text-white/70 rotate-180" />
          </motion.div>
        </Link>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
          className="w-full h-[42px] rounded-xl border border-slate-100 dark:border-slate-700/60 text-[12.5px] font-bold text-slate-500 dark:text-slate-400">
          تعديل التاريخ المرضي
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════ */
export default function MedicalHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [history, setHistory] = useState<MedicalHistory>(EMPTY);

  // Load draft
  useEffect(() => {
    try {
      const d = localStorage.getItem('tibrah_medical_history');
      if (d) setHistory(JSON.parse(d));
    } catch {}
  }, []);

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem('tibrah_medical_history', JSON.stringify(history));
    }, 800);
    return () => clearTimeout(t);
  }, [history]);

  const update = useCallback((k: keyof MedicalHistory, v: any) => {
    setHistory(h => ({ ...h, [k]: v }));
  }, []);

  const markCompleted = (idx: number) => setCompleted(s => { const n = new Set(s); n.add(idx); return n; });

  const goNext = () => {
    markCompleted(currentSection);
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(c => c + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.id) {
        await db.entities.DailyLog.createForUser(user.id, {
          date: new Date().toISOString().split('T')[0],
          notes: generateSummary(history).slice(0, 500),
        });
      }
      // Mark all sections complete
      const allIdx = new Set(SECTIONS.map((_, i) => i));
      setCompleted(allIdx);
      localStorage.removeItem('tibrah_medical_history');
      toast.success('تم حفظ تاريخك المرضي بالكامل ✓');
      haptic.success();
      setShowCompletion(true);
    } catch (e) {
      toast.error('خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // Quick section save (save icon button)
  const handleQuickSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('tibrah_medical_history', JSON.stringify(history));
      markCompleted(currentSection);
      setSaved(true);
      toast.success('تم حفظ هذا القسم ✓');
      haptic.impact();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const sec = SECTIONS[currentSection];
  const SecIcon = sec.icon;

  const renderSection = () => {
    switch (sec.id) {
      case 'personal':    return <PersonalSection data={history} update={update} />;
      case 'complaint':   return <ComplaintSection data={history} update={update} />;
      case 'pmh':         return <PMHSection data={history} update={update} />;
      case 'medications': return <MedicationsSection data={history} update={update} />;
      case 'family':      return <FamilySection data={history} update={update} />;
      case 'lifestyle':   return <LifestyleSection data={history} update={update} />;
      case 'ros':         return <ROSSection data={history} update={update} />;
      case 'goals':       return <GoalsSection data={history} update={update} />;
      default: return null;
    }
  };

  const isLast = currentSection === SECTIONS.length - 1;
  const allDone = completed.size >= SECTIONS.length - 1;

  // Show completion screen
  if (showCompletion) {
    return (
    <div dir="rtl" style={{ minHeight:'100svh', background:'linear-gradient(160deg,#EEF2F5 0%,#F2F5F7 40%,#EBF4F3 100%)', fontFamily:'inherit' }}>
        <SEO title="تاريخك المرضي مكتمل | طِبرَا" />
        {/* Header */}
        <div className="sticky top-0 z-40">
          <div className="flex items-center justify-between h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 shadow-sm border-b border-slate-100 dark:border-slate-800/60">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowCompletion(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </motion.button>
            <span className="text-[13px] font-black text-slate-700 dark:text-slate-200">التاريخ المرضي مكتمل</span>
            <div className="w-8" />
          </div>
        </div>
        <CompletionScreen history={history} onBack={() => setShowCompletion(false)} />
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ minHeight:'100svh', background:'linear-gradient(160deg,#EEF2F5 0%,#F2F5F7 40%,#EBF4F3 100%)', fontFamily:'inherit' }}>
      <SEO title="التاريخ المرضي | طِبرَا" />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-8%] right-[-5%] w-64 h-64 rounded-full"
          style={{ background: `radial-gradient(circle, ${sec.color}22 0%, transparent 70%)`, filter: 'blur(50px)', transition: 'background 0.5s' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4" style={{ background:'rgba(242,245,247,0.88)', backdropFilter:'blur(20px) saturate(160%)', WebkitBackdropFilter:'blur(20px) saturate(160%)', borderBottom:'0.5px solid rgba(0,0,0,0.08)' }}>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => currentSection > 0 ? setCurrentSection(c => c - 1) : router.back()}
            style={{ width:36, height:36, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.72)', backdropFilter:'blur(12px)', border:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <ArrowRight className="w-4 h-4 text-slate-600" />
          </motion.button>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `${sec.color}20` }}>
              <SecIcon className="w-3 h-3" style={{ color: sec.color }} />
            </div>
            <span className="text-[13px] font-black text-slate-700 dark:text-slate-200">{sec.label}</span>
          </div>

          <div className="flex items-center gap-2">
            {saved && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-teal-50">
                <Check className="w-3.5 h-3.5 text-teal-500" />
              </motion.div>
            )}
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowOverlay(true)}
              style={{ width:36, height:36, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.72)', backdropFilter:'blur(12px)', border:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <span className="text-[11px] font-black text-slate-500">{currentSection + 1}/{SECTIONS.length}</span>
            </motion.button>
          </div>
        </div>
        <ProgressHeader current={currentSection + 1} total={SECTIONS.length}
          sectionLabel={sec.label} color={sec.color}
          onSectionClick={() => setShowOverlay(true)} />
      </div>

      {/* Section label */}
      <div className="px-4 pt-5 pb-2 max-w-md mx-auto">
        <motion.div key={sec.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${sec.color}20` }}>
              <SecIcon className="w-3.5 h-3.5" style={{ color: sec.color }} />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: sec.color }}>
              القسم {currentSection + 1} من {SECTIONS.length}
            </span>
          </div>
          <h1 className="text-[20px] font-black text-slate-800 dark:text-white">{sec.label}</h1>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">{sec.desc}</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 pb-36 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={sec.id}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}>
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:30, padding:'12px 16px', paddingBottom:'max(env(safe-area-inset-bottom),24px)', background:'linear-gradient(to top, rgba(242,245,247,1) 60%, rgba(242,245,247,0) 100%)' }}>
        <div className="flex gap-2.5">
          {/* Save draft */}
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleQuickSave} disabled={saving}
          style={{ width:48, height:48, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.82)', backdropFilter:'blur(12px)', border:'1px solid rgba(0,0,0,0.08)', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', flexShrink:0 }}>
            {saving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-teal-500" />
              : saved ? <Check className="w-4 h-4 text-teal-500" /> : <Save className="w-4 h-4 text-slate-500" />}
          </motion.button>

          {/* Next / Finish */}
          <motion.button whileTap={{ scale: 0.97 }} onClick={isLast ? handleSave : goNext}
            className="flex-1 h-12 rounded-2xl text-white text-[14px] font-black flex items-center justify-between px-5 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${sec.color}, ${sec.color}cc)`, boxShadow: `0 6px 20px ${sec.color}35` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0" />
            <span>{isLast ? (allDone ? 'حفظ التاريخ المرضي كاملاً ✓' : 'حفظ وإنهاء') : 'التالي'}</span>
            {!isLast && <ChevronLeft className="w-5 h-5 text-white/80" />}
            {isLast && <CheckCircle className="w-5 h-5 text-white/80" />}
          </motion.button>
        </div>

        {/* Section dots */}
        <div className="flex gap-1 justify-center mt-3">
          {SECTIONS.map((_, i) => (
            <motion.div key={i} animate={{ width: i === currentSection ? 20 : 6, opacity: i <= currentSection ? 1 : 0.3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => setCurrentSection(i)}
              className="h-1.5 rounded-full cursor-pointer"
              style={{ backgroundColor: i <= currentSection ? sec.color : '#e2e8f0' }} />
          ))}
        </div>
      </div>

      {/* Section overlay */}
      <AnimatePresence>
        {showOverlay && (
          <SectionOverlay current={currentSection} completed={completed}
            onSelect={setCurrentSection} onClose={() => setShowOverlay(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
