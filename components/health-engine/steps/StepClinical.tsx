// components/health-engine/steps/StepClinical.tsx
// THIE v4 — M3 Filled Cards + state layers
// Reference: Google Health Studies, Pixel Checkup

'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { PATHWAYS, DURATION_OPTIONS } from '../constants';
import { OptionChip } from '../ui/OptionChip';
import { SeveritySlider } from '../ui/SeveritySlider';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';
import type { AnswerValue } from '../types';

/* M3 Filled Card with collapsible body */
function M3Card({ title, accent = '#0d9488', defaultOpen = true, children, badge }: {
    title: string; accent?: string; defaultOpen?: boolean;
    children: React.ReactNode; badge?: string;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="rounded-[20px] overflow-hidden mb-3"
            style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.07)',
                /* M3 Elevation 1 */
                boxShadow: '0px 1px 2px rgba(0,0,0,0.10), 0px 1px 3px 1px rgba(0,0,0,0.07)',
            }}>
            <button
                onClick={() => { setOpen(o => !o); haptic.selection(); }}
                className="w-full flex items-center px-4 py-3.5 text-right m3-state">
                {/* Accent bar — M3 Left indicator for sections */}
                <div className="w-[3px] rounded-full h-7 ml-3 flex-shrink-0"
                    style={{ background: open ? accent : 'rgba(0,0,0,0.12)' }} />

                <div className="flex-1">
                    <p className="m3-title-md text-slate-900 text-right">{title}</p>
                </div>

                {badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mx-2 flex-shrink-0"
                        style={{ background: accent + '18', color: accent }}>
                        {badge}
                    </span>
                )}

                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2, ease: [0.05, 0.7, 0.1, 1] }}>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </motion.div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.05, 0.7, 0.1, 1] }}
                        className="overflow-hidden">
                        <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            <div className="pt-3">{children}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* M3 Duration chip — 2×2 grid */
function DurationChip({ label, sub, active, color, onClick }: {
    label: string; sub: string; active: boolean; color: string; onClick: () => void;
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            onClick={onClick}
            className="flex-1 rounded-[16px] p-3.5 text-right m3-state"
            style={{
                background: active ? color + '12' : '#f8fafc',
                border: `1.5px solid ${active ? color + '50' : 'rgba(0,0,0,0.07)'}`,
                boxShadow: active ? `0 2px 10px ${color}18` : '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 180ms cubic-bezier(0.05,0.7,0.1,1)',
            }}>
            <div className="flex items-center gap-1.5 mb-0.5">
                <Clock className="w-3 h-3 flex-shrink-0" style={{ color: active ? color : '#94a3b8' }} />
                <span className="m3-title-md" style={{ color: active ? color : '#475569' }}>{label}</span>
            </div>
            <p className="m3-body-md text-slate-400 mt-0.5">{sub}</p>
        </motion.button>
    );
}

export function StepClinical({ pathwayId, severity, duration, clinicalAnswers, onSeverity, onDuration, onAnswer, onNext }: {
    pathwayId: string; severity: number; duration: string;
    clinicalAnswers: Record<string, AnswerValue>;
    onSeverity: (v: number) => void; onDuration: (v: string) => void;
    onAnswer: (qId: string, value: AnswerValue) => void; onNext: () => void;
}) {
    const pathway = PATHWAYS.find(p => p.id === pathwayId);
    if (!pathway) return null;

    const tog1 = (qId: string, opt: string) => {
        haptic.selection();
        onAnswer(qId, clinicalAnswers[qId] === opt ? '' : opt);
    };
    const togN = (qId: string, opt: string) => {
        haptic.selection();
        const cur = (clinicalAnswers[qId] as string[]) ?? [];
        onAnswer(qId, cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt]);
    };

    /* Completion progress */
    const filled = [
        severity > 0,
        !!duration,
        ...pathway.clinicalQuestions.map(q => {
            const v = clinicalAnswers[q.id];
            return Array.isArray(v) ? v.length > 0 : !!v;
        }),
    ].filter(Boolean).length;
    const total = 2 + pathway.clinicalQuestions.length;
    const pct   = Math.round((filled / total) * 100);

    return (
        <div className="px-4" dir="rtl">
            {/* M3 Section header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className="mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
                    style={{ background: pathway.color + '12', border: `1px solid ${pathway.color}20` }}>
                    <span className="text-sm">{pathway.emoji}</span>
                    <span className="m3-label-sm" style={{ color: pathway.color, textTransform: 'none', fontSize: 10 }}>
                        الخطوة ٣ من ٤
                    </span>
                </div>
                <h2 className="m3-headline-md text-slate-900">صف حالتك</h2>
                <p className="m3-body-md text-slate-400 mt-1">
                    بخصوص <span className="font-bold" style={{ color: pathway.color }}>{pathway.label}</span>
                </p>
            </motion.div>

            {/* M3 Linear progress card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.06, type: 'spring', stiffness: 280, damping: 26 }}
                className="rounded-[16px] px-4 py-3.5 mb-4 flex items-center gap-3"
                style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.07)',
                }}>
                {/* M3 circular determinate progress */}
                <div className="relative w-10 h-10 flex-shrink-0">
                    <svg viewBox="0 0 40 40" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="3.5" />
                        <motion.circle cx="20" cy="20" r="16" fill="none"
                            stroke={pathway.color} strokeWidth="3.5" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 16}`}
                            animate={{ strokeDashoffset: (1 - pct / 100) * 2 * Math.PI * 16 }}
                            initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                            transition={{ duration: 0.5, ease: [0.05, 0.7, 0.1, 1] }}
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black"
                        style={{ color: pathway.color }}>{pct}%</span>
                </div>
                <div>
                    <p className="m3-title-md text-slate-900">اكتمال البيانات</p>
                    <p className="m3-body-md text-slate-400 mt-0.5">أكمل كل الحقول لتحليل أدق</p>
                </div>
            </motion.div>

            {/* Severity Card */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <M3Card title="شدة الأعراض" accent="#dc2626"
                    badge={severity > 0 ? `${severity}/١٠` : undefined}>
                    <SeveritySlider value={severity} onChange={onSeverity} />
                </M3Card>
            </motion.div>

            {/* Duration Card */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
                <M3Card title="مدة الأعراض" accent="#6366f1"
                    badge={duration ? DURATION_OPTIONS.find(d => d.id === duration)?.label : undefined}>
                    <div className="grid grid-cols-2 gap-2">
                        {DURATION_OPTIONS.map(o => (
                            <DurationChip key={o.id} label={o.label} sub={o.sub}
                                active={duration === o.id} color={pathway.color}
                                onClick={() => { haptic.selection(); onDuration(o.id); }}
                            />
                        ))}
                    </div>
                </M3Card>
            </motion.div>

            {/* Clinical questions */}
            {pathway.clinicalQuestions.map((q, qi) => {
                const val = clinicalAnswers[q.id];
                const cnt = Array.isArray(val) ? val.length : val ? 1 : 0;
                return (
                    <motion.div key={q.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.13 + qi * 0.05 }}>
                        <M3Card title={q.text} accent={pathway.color}
                            badge={cnt > 0 ? `${cnt} محدد` : undefined}
                            defaultOpen={qi === 0}>
                            <div className="flex flex-wrap gap-2">
                                {q.options?.map(opt => {
                                    const isSel = Array.isArray(val) ? val.includes(opt) : val === opt;
                                    return (
                                        <OptionChip key={opt} label={opt} selected={isSel} color={pathway.color}
                                            onToggle={() => q.type === 'multiple' ? togN(q.id, opt) : tog1(q.id, opt)} />
                                    );
                                })}
                            </div>
                        </M3Card>
                    </motion.div>
                );
            })}

            <BottomCTA label="التالي — البعد العاطفي" onPress={onNext} variant="teal" />
        </div>
    );
}
