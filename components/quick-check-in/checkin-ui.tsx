// components/quick-check-in/checkin-ui.tsx
// ════════════════════════════════════════════════════════
// UI components for Quick Check-In
// ════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Droplets, Heart, HeartPulse, Sparkles, Activity,
  ArrowLeft, MessageCircle,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { createPageUrl } from '@/utils';
import { SCALES, type StepId, type CheckInData } from './checkin-data';

/* ─── EmojiScale ─────────────────────────────── */
export function EmojiScale({ field, value, label, icon: Icon, color, onChange }: {
  field: keyof typeof SCALES; value: number; label: string;
  icon: React.FC<{ className?: string }>; color: string; onChange: (v: number) => void;
}) {
  const scale = SCALES[field];
  const selected = scale[value - 1];
  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}><Icon className="w-3.5 h-3.5" /></div>
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{label}</span>
        </div>
        {selected && (
          <motion.span key={value} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${selected.color}18`, color: selected.color }}>{selected.label}</motion.span>
        )}
      </div>
      <div className="flex gap-1.5">
        {scale.map((item, i) => {
          const v = i + 1; const isSelected = value === v;
          return (
            <motion.button key={v} whileTap={{ scale: 0.85 }} onClick={() => { haptic.selection(); uiSounds.select(); onChange(v); }}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all"
              style={isSelected ? { borderColor: item.color, backgroundColor: `${item.color}12` } : { borderColor: 'transparent', backgroundColor: '#f8fafc' }}>
              <span className="text-[22px] leading-none">{item.emoji}</span>
              <span className="text-[8.5px] font-bold" style={{ color: isSelected ? item.color : '#94a3b8' }}>{v}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── WaterTracker ───────────────────────────── */
export function WaterTracker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}>
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">شرب الماء اليوم</span>
        </div>
        <span className="text-[13px] font-black text-blue-600">{value} كأس</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: 8 }, (_, i) => i + 1).map(cup => (
          <motion.button key={cup} whileTap={{ scale: 0.85 }} onClick={() => { haptic.selection(); onChange(cup === value ? 0 : cup); }}
            className="w-[calc(12.5%-4px)] aspect-square rounded-lg flex items-center justify-center transition-all"
            style={cup <= value ? { backgroundColor: 'rgba(59,130,246,0.15)', border: '1.5px solid rgba(59,130,246,0.3)' } : { backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
            <span className="text-[16px]">{cup <= value ? '💧' : '🔘'}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ─── AnalyzingScreen ────────────────────────── */
export function AnalyzingScreen() {
  const messages = ['تحليل مؤشراتك الحيوية...', 'مقارنة بسجلاتك السابقة...', 'استخراج الأنماط الصحية...', 'توليد رؤية مخصصة...'];
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 700); return () => clearInterval(t); }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="relative mb-8">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-8px] rounded-full border-2 border-dashed border-teal-200 dark:border-teal-800" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-500 border-l-indigo-500" />
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.15), rgba(99,102,241,0.15))' }}>
          <Heart className="w-9 h-9 text-teal-600" />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={msgIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className="text-[15px] font-bold text-slate-600 dark:text-slate-300 mb-2">{messages[msgIdx]}</motion.p>
      </AnimatePresence>
      <p className="text-[12px] text-slate-400 font-medium">ذكاء طِبرَا يعمل على تحليلك</p>
    </div>
  );
}

/* ─── ResultScreen ───────────────────────────── */
export function ResultScreen({ data }: { data: CheckInData }) {
  const totalVitals = data.energy + data.sleep + (6 - data.stress) + data.mood;
  const avgScore = Math.round((totalVitals / 16) * 100);
  const getStatus = () => {
    if (avgScore >= 75) return { label: 'ممتاز', color: '#10b981', emoji: '🌟', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' };
    if (avgScore >= 55) return { label: 'جيد', color: '#22c55e', emoji: '✅', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' };
    if (avgScore >= 35) return { label: 'يحتاج انتباه', color: '#f59e0b', emoji: '⚠️', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' };
    return { label: 'يحتاج رعاية', color: '#ef4444', emoji: '❤️‍🩹', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' };
  };
  const status = getStatus();
  const insights = [
    data.sleep <= 2 && { icon: '😴', text: 'نومك يحتاج تحسيناً — جرّب تقنية التنفس قبل النوم' },
    data.stress >= 4 && { icon: '🧠', text: 'مستوى توترك مرتفع — خصّص ١٠ دقائق للتأمل اليوم' },
    data.energy <= 2 && { icon: '⚡', text: 'طاقتك منخفضة — تأكد من وجبة متوازنة وشرب الماء' },
    data.waterGlasses < 4 && { icon: '💧', text: 'شرب الماء أقل من الموصى به (٨ أكواس يومياً)' },
  ].filter(Boolean) as Array<{ icon: string; text: string }>;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="space-y-4">
      <div className="rounded-[24px] overflow-hidden" style={{ backgroundColor: status.bg, border: `1.5px solid ${status.border}` }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">تقييم اليوم</p><h2 className="text-[20px] font-black text-slate-800 dark:text-white">{status.emoji} {status.label}</h2></div>
            <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center" style={{ background: `${status.color}20`, border: `2px solid ${status.color}30` }}>
              <span className="text-[20px] font-black" style={{ color: status.color }}>{avgScore}</span><span className="text-[9px] font-bold text-slate-400">من ١٠٠</span>
            </div>
          </div>
          {[{ l: 'الطاقة', v: data.energy, max: 5, color: '#f59e0b' }, { l: 'النوم', v: data.sleep, max: 5, color: '#6366f1' }, { l: 'التوتر', v: 6 - data.stress, max: 5, color: '#ef4444' }, { l: 'المزاج', v: data.mood, max: 5, color: '#10b981' }].map(bar => (
            <div key={bar.l} className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 w-10">{bar.l}</span>
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(bar.v / bar.max) * 100}%` }} transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full" style={{ backgroundColor: bar.color }} />
              </div>
              <span className="text-[10px] font-black w-4" style={{ color: bar.color }}>{bar.v}</span>
            </div>
          ))}
        </div>
      </div>
      {insights.length > 0 && (
        <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> رؤى ذكاء طِبرَا</p>
          <div className="space-y-2.5">
            {insights.map((ins, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="flex items-start gap-2.5">
                <span className="text-[18px] flex-shrink-0">{ins.icon}</span>
                <p className="text-[12px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{ins.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-2.5">
        <Link href={createPageUrl('MyCare')}>
          <motion.div whileTap={{ scale: 0.97 }} className="w-full h-[50px] rounded-2xl flex items-center justify-between px-5 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 6px 20px rgba(13,148,136,0.25)' }}>
            <div className="flex items-center gap-2"><HeartPulse className="w-4.5 h-4.5 text-white" /><span className="text-[13.5px] font-black text-white">لوحة رعايتي</span></div>
            <ArrowLeft className="w-4 h-4 text-white/80" />
          </motion.div>
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link href={createPageUrl('DailyLog')}><div className="h-[42px] rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer"><Activity className="w-3.5 h-3.5" />سجلاتي اليومية</div></Link>
          <Link href={createPageUrl('BookAppointment')}><div className="h-[42px] rounded-xl border border-teal-100 dark:border-teal-800/30 bg-teal-50/50 dark:bg-teal-900/10 flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-teal-600 dark:text-teal-400 cursor-pointer"><MessageCircle className="w-3.5 h-3.5" />تحدث مع الطبيب</div></Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── StepBar ────────────────────────────────── */
export function StepBar({ step }: { step: StepId }) {
  const steps: StepId[] = ['vitals', 'symptoms', 'emotional'];
  const idx = steps.indexOf(step);
  if (idx === -1) return null;
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {steps.map((s, i) => (
        <motion.div key={s} animate={{ width: i === idx ? 24 : 8, opacity: i <= idx ? 1 : 0.3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="h-[5px] rounded-full bg-teal-500" />
      ))}
    </div>
  );
}
