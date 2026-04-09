// components/health-engine/steps/StepClinical.tsx
// THIE v2 — "Clinical Precision" — Biometric data entry with liquid UI

'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { PATHWAYS, DURATION_OPTIONS } from '../constants';
import { OptionChip } from '../ui/OptionChip';
import { SeveritySlider } from '../ui/SeveritySlider';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';
import type { AnswerValue } from '../types';

// ── Liquid glass card ──
function ClinicalCard({
    title, subtitle, children, accentColor = '#0d9488', defaultOpen = true,
}: {
    title: string; subtitle?: string; children: React.ReactNode;
    accentColor?: string; defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[24px] overflow-hidden mb-4"
            style={{
                background: 'rgba(15,23,42,0.65)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
            {/* Card header */}
            <button
                onClick={() => { setOpen(o => !o); haptic.selection(); }}
                className="w-full flex items-center justify-between p-4 text-right">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full" style={{ background: accentColor }} />
                    <div>
                        <p className="text-[13px] font-black text-white">{title}</p>
                        {subtitle && <p className="text-[10px] text-slate-500 font-medium mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                </motion.div>
            </button>

            {/* Divider */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}>
                        <div className="px-4 pb-4">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Duration tile ──
function DurationTile({ label, sub, active, color, onClick }: {
    label: string; sub: string; active: boolean; color: string; onClick: () => void;
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={onClick}
            className="flex-1 rounded-[18px] p-3 text-center transition-all relative overflow-hidden"
            style={{
                background: active ? `${color}18` : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.06)'}`,
                boxShadow: active ? `0 0 20px ${color}25` : 'none',
            }}>
            {active && (
                <motion.div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${color}10, transparent)` }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                />
            )}
            <p className="text-[14px] font-black relative z-10"
                style={{ color: active ? color : 'rgba(255,255,255,0.45)' }}>
                {label}
            </p>
            <p className="text-[9px] mt-0.5 relative z-10"
                style={{ color: active ? `${color}99` : 'rgba(255,255,255,0.2)' }}>
                {sub}
            </p>
        </motion.button>
    );
}

export function StepClinical({
    pathwayId, severity, duration, clinicalAnswers,
    onSeverity, onDuration, onAnswer, onNext,
}: {
    pathwayId: string;
    severity: number;
    duration: string;
    clinicalAnswers: Record<string, AnswerValue>;
    onSeverity: (v: number) => void;
    onDuration: (v: string) => void;
    onAnswer: (qId: string, value: AnswerValue) => void;
    onNext: () => void;
}) {
    const pathway = PATHWAYS.find(p => p.id === pathwayId);
    if (!pathway) return null;

    const handleSingle = (qId: string, opt: string) => {
        haptic.selection();
        onAnswer(qId, clinicalAnswers[qId] === opt ? '' : opt);
    };
    const handleMultiple = (qId: string, opt: string) => {
        haptic.selection();
        const current = (clinicalAnswers[qId] as string[]) ?? [];
        onAnswer(qId, current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt]);
    };

    // Calculate completion
    const filledCount = [
        severity > 0,
        !!duration,
        ...pathway.clinicalQuestions.map(q => {
            const v = clinicalAnswers[q.id];
            return Array.isArray(v) ? v.length > 0 : !!v;
        }),
    ].filter(Boolean).length;
    const total = 2 + pathway.clinicalQuestions.length;
    const pct = Math.round((filledCount / total) * 100);

    return (
        <div className="px-4 pb-40 pt-20" dir="rtl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-3 mb-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                    style={{ background: `${pathway.color}15`, border: `1px solid ${pathway.color}25` }}>
                    <span className="text-[14px]">{pathway.emoji}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest"
                        style={{ color: pathway.color }}>الخطوة ٣ من ٤</span>
                </div>
                <h2 className="text-[26px] font-black text-white leading-tight">صف حالتك</h2>
                <p className="text-[12px] text-slate-500 mt-1">
                    بخصوص <span className="font-bold" style={{ color: pathway.color }}>{pathway.label}</span>
                </p>
            </motion.div>

            {/* Completion ring */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="relative w-9 h-9">
                    <svg viewBox="0 0 36 36" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                        <motion.circle cx="18" cy="18" r="15" fill="none"
                            stroke={pathway.color} strokeWidth="3" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 15}`}
                            animate={{ strokeDashoffset: (1 - pct / 100) * 2 * Math.PI * 15 }}
                            initial={{ strokeDashoffset: 2 * Math.PI * 15 }}
                            transition={{ duration: 0.5 }}
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">
                        {pct}%
                    </span>
                </div>
                <div>
                    <p className="text-[11px] font-black text-white">اكتمال البيانات</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">أكمل كل الحقول لتحليل أدق</p>
                </div>
            </motion.div>

            {/* Severity card */}
            <ClinicalCard title="شدة الأعراض" subtitle="كيف تؤثر على حياتك اليومية؟"
                accentColor="#ef4444" defaultOpen>
                <SeveritySlider value={severity} onChange={onSeverity} />
            </ClinicalCard>

            {/* Duration card */}
            <ClinicalCard title="مدة الأعراض" subtitle="منذ متى تعاني من هذا؟"
                accentColor="#6366f1">
                <div className="flex gap-2">
                    {DURATION_OPTIONS.map(opt => (
                        <DurationTile
                            key={opt.id}
                            label={opt.label}
                            sub={opt.sub}
                            active={duration === opt.id}
                            color={pathway.color}
                            onClick={() => { haptic.selection(); onDuration(opt.id); }}
                        />
                    ))}
                </div>
            </ClinicalCard>

            {/* Clinical questions */}
            {pathway.clinicalQuestions.map((q, qi) => {
                const val = clinicalAnswers[q.id];
                const selectedCount = Array.isArray(val) ? val.length : val ? 1 : 0;
                return (
                    <motion.div key={q.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + qi * 0.05 }}>
                        <ClinicalCard
                            title={q.text}
                            subtitle={q.type === 'multiple' ? 'اختر كل ما ينطبق' : 'اختر الأقرب لحالتك'}
                            accentColor={pathway.color}
                            defaultOpen={qi === 0}>
                            {/* Selected count badge */}
                            {selectedCount > 0 && (
                                <div className="flex items-center gap-1.5 mb-3">
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                                        style={{ background: pathway.color }}>
                                        {selectedCount} محدد
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {q.options?.map(opt => {
                                    const isSelected = Array.isArray(val)
                                        ? val.includes(opt)
                                        : val === opt;
                                    return (
                                        <OptionChip
                                            key={opt}
                                            label={opt}
                                            selected={isSelected}
                                            color={pathway.color}
                                            onToggle={() => q.type === 'multiple'
                                                ? handleMultiple(q.id, opt)
                                                : handleSingle(q.id, opt)}
                                        />
                                    );
                                })}
                            </div>
                        </ClinicalCard>
                    </motion.div>
                );
            })}

            <BottomCTA label="متابعة — البعد العاطفي" onPress={onNext} variant="teal" />
        </div>
    );
}
