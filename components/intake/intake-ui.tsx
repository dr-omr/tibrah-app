// components/intake/intake-ui.tsx
// ════════════════════════════════════════════════════════
// Shared UI components for Clinical Intake
// ════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Brain, Check, ArrowLeft, AlertTriangle, Info, Activity,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { StepId, TriageLevel, AssessmentData } from './intake-data';
import { getResultConfig } from './intake-data';

/* ─── StepDots ───────────────────────────────── */
export function StepDots({ current }: { current: StepId }) {
  const activeSteps: StepId[] = ['complaint', 'severity', 'modifiers', 'history'];
  const idx = activeSteps.indexOf(current);
  if (idx === -1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 py-3">
      {activeSteps.map((s, i) => (
        <motion.div key={s}
          animate={{ width: i === idx ? 22 : 7, opacity: i <= idx ? 1 : 0.35 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="h-[5px] rounded-full"
          style={{ background: i <= idx ? '#0d9488' : '#e2e8f0' }} />
      ))}
    </div>
  );
}

/* ─── SeverityMeter ──────────────────────────── */
export function SeverityMeter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const levels = [
    { range: [1, 3], label: 'خفيف', color: '#10b981', emoji: '🟢' },
    { range: [4, 6], label: 'متوسط', color: '#f59e0b', emoji: '🟡' },
    { range: [7, 8], label: 'شديد', color: '#f97316', emoji: '🟠' },
    { range: [9, 10], label: 'حرج', color: '#ef4444', emoji: '🔴' },
  ];
  const currentLevel = levels.find(l => value >= l.range[0] && value <= l.range[1]) || levels[0];

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5 justify-between">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
          const level = levels.find(l => n >= l.range[0] && n <= l.range[1])!;
          const isActive = n <= value;
          return (
            <motion.button key={n} onClick={() => { haptic.selection(); onChange(n); }} whileTap={{ scale: 0.85 }}
              className="flex-1 rounded-lg transition-all"
              style={{ height: 36 + (n * 3), backgroundColor: isActive ? level.color : '#e2e8f0', opacity: isActive ? 1 : 0.35 }} />
          );
        })}
      </div>
      <motion.div key={value} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between px-1">
        <span className="text-slate-400 text-[11px] font-bold">١</span>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ backgroundColor: `${currentLevel.color}15` }}>
          <span className="text-[20px]">{currentLevel.emoji}</span>
          <div>
            <span className="text-[15px] font-black" style={{ color: currentLevel.color }}>{value}/١٠</span>
            <span className="text-[11px] font-bold mr-1.5" style={{ color: currentLevel.color }}>{currentLevel.label}</span>
          </div>
        </div>
        <span className="text-slate-400 text-[11px] font-bold">١٠</span>
      </motion.div>
    </div>
  );
}

/* ─── AnalyzingScreen ────────────────────────── */
export function AnalyzingScreen() {
  const steps = ['تحليل الأعراض الرئيسية', 'مقارنة الحدة والمدة', 'فحص الأعراض التحذيرية', 'احتساب مستوى الأولوية', 'توليد التوصية المخصصة'];
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => { setActiveStep(s => s < steps.length - 1 ? s + 1 : s); }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center py-12 px-6 text-center">
      <div className="relative mb-8">
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-[-16px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.3) 0%, transparent 70%)' }} />
        <div className="w-24 h-24 rounded-full flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #0d9488, #6366f1)' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white/80" />
          <Brain className="w-10 h-10 text-white relative z-10" />
        </div>
      </div>
      <h2 className="text-[20px] font-black text-slate-800 dark:text-white mb-2">ذكاء طِبرَا يحلل حالتك</h2>
      <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-8 font-medium">وفق أحدث معايير الطب الوظيفي</p>
      <div className="w-full max-w-xs space-y-2.5">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: i <= activeStep ? 1 : 0.3, x: 0 }}
            transition={{ delay: i * 0.1 }} className="flex items-center gap-3 text-right">
            <motion.div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: i < activeStep ? '#0d9488' : i === activeStep ? '#6366f1' : '#e2e8f0' }}>
              {i < activeStep ? <Check className="w-3 h-3 text-white" />
                : i === activeStep ? <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                : <div className="w-2 h-2 bg-slate-300 rounded-full" />}
            </motion.div>
            <span className={`text-[12.5px] font-bold ${i <= activeStep ? 'text-slate-700 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'}`}>{s}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── ResultCard ─────────────────────────────── */
export function ResultCard({ level, data }: { level: TriageLevel; data: AssessmentData }) {
  const c = getResultConfig(level);
  const Icon = c.icon;
  const PrimaryIcon = c.primaryAction.icon;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
      <div className="rounded-[28px] overflow-hidden mb-4" style={{ background: c.bg, border: `1.5px solid ${c.border}` }}>
        <div className={`h-1.5 bg-gradient-to-r ${c.gradient}`} />
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${c.iconColor}18` }}>
              <Icon className="w-6 h-6" style={{ color: c.iconColor }} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: c.badgeBg }}>{c.badge}</span>
              <p className="text-[8.5px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest">نتيجة التقييم السريري</p>
            </div>
          </div>
          <h2 className="text-[17px] font-black text-slate-800 dark:text-white leading-snug mb-2">{c.title}</h2>
          <p className="text-[12.5px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{c.subtitle}</p>
        </div>
        <div className="mx-4 mb-4 p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700/40">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">ملخص التقييم</p>
          <div className="space-y-1.5">
            {[
              { l: 'الشكوى الرئيسية', v: data.complaintLabel },
              { l: 'حدة الأعراض', v: `${data.severity}/١٠` },
              { l: 'مدة الأعراض', v: data.duration === 'hours' ? 'ساعات' : data.duration === 'days' ? 'أيام' : 'أسابيع أو أكثر' },
            ].map(row => (
              <div key={row.l} className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">{row.l}</span>
                <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">{row.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-2.5">
        <Link href={c.primaryAction.href}>
          <motion.div whileTap={{ scale: 0.97 }}
            className={`w-full h-[52px] rounded-2xl bg-gradient-to-l ${c.gradient} flex items-center justify-between px-5 shadow-lg cursor-pointer`}
            style={{ boxShadow: `0 8px 24px ${c.iconColor}30` }}>
            <div className="flex items-center gap-2">
              <PrimaryIcon className="w-5 h-5 text-white" />
              <span className="text-[14px] font-black text-white">{c.primaryAction.label}</span>
            </div>
            <ArrowLeft className="w-4 h-4 text-white/80" />
          </motion.div>
        </Link>
        {c.secondaryAction && (
          <Link href={c.secondaryAction.href}>
            <div className="w-full h-[44px] rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 text-[12.5px] font-bold">
              <c.secondaryAction.icon className="w-4 h-4" />{c.secondaryAction.label}
            </div>
          </Link>
        )}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 mt-2">
          <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10.5px] text-slate-400 font-medium leading-relaxed">هذا التقييم استرشادي ولا يغني عن التشخيص الطبي المتخصص. في الحالات الطارئة توجه للطوارئ فوراً.</p>
        </div>
      </div>
    </motion.div>
  );
}
