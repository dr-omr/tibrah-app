// components/medical-history/medical-history-ui.tsx
// ════════════════════════════════════════════════════════
// Shared UI primitives for Medical History flow
// ════════════════════════════════════════════════════════

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { SECTIONS } from './medical-history-types';

/* ─── Chip ───────────────────────────────────── */
export function Chip({ label, selected, color = '#0d9488', onToggle }: {
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

/* ─── SectionCard ────────────────────────────── */
export function SectionCard({ children, title, icon: Icon, color }: {
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

/* ─── FieldLabel ────────────────────────────── */
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400 mb-2">{children}</p>;
}

/* ─── TextInput ─────────────────────────────── */
export function TextInput({ value, onChange, placeholder, multiline }: {
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

/* ─── SelectRow ─────────────────────────────── */
export function SelectRow({ value, onChange, options, label }: {
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

/* ─── ProgressHeader ────────────────────────── */
export function ProgressHeader({ current, total, sectionLabel, color, onSectionClick }:
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

/* ─── SectionOverlay ────────────────────────── */
export function SectionOverlay({ current, completed, onSelect, onClose }:
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
