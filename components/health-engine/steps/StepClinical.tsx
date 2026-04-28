// components/health-engine/steps/StepClinical.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH v8 — Liquid Glass Water Clinical Step
// مائي زجاجي — بدون أي لون أسود
// ════════════════════════════════════════════════════════════════════
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
import { getDeepQuestionsForPathway } from '@/lib/clinical/deep-intake-questions';
import { getAdaptiveFoodQuestions, hasFoodRelevantSignals } from '@/lib/clinical/tayyibat-adaptive-screening';

/* ══════════════════════════════════════════════════════════════════
   LIGHT WATER GLASS — Premium Medical
   ══════════════════════════════════════════════════════════════════ */
const W = {
    pageBg:      'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)',
    glass:       'rgba(255,255,255,0.60)',
    glassBorder: 'rgba(255,255,255,0.88)',
    glassShadow: '0 6px 24px rgba(8,145,178,0.08), 0 1.5px 6px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.92)',
    sheen:       'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
    teal:        '#0891B2',
    tealDeep:    '#0E7490',
    tealLight:   '#22D3EE',
    textPrimary: '#0C4A6E',
    textSub:     '#0369A1',
    textMuted:   '#7DD3FC',
};

/* ══════════════════════════════════════════════════════ */
/* GLASS CARD — collapsible                               */
/* ══════════════════════════════════════════════════════ */
function WaterCard({ title, accent = W.teal, defaultOpen = true, children, badge }: {
    title: string; accent?: string; defaultOpen?: boolean;
    children: React.ReactNode; badge?: string;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="relative overflow-hidden rounded-[22px] mb-3"
            style={{
                background: W.glass,
                border: `1.5px solid ${W.glassBorder}`,
                backdropFilter: 'blur(26px)',
                boxShadow: W.glassShadow,
            }}>
            {/* Sheen */}
            <div className="absolute inset-x-0 top-0 pointer-events-none"
                style={{ height: '48%', background: W.sheen, borderRadius: '22px 22px 0 0' }} />
            {/* Specular highlight */}
            <div className="absolute top-0 left-0 w-[45%] h-[42%] pointer-events-none"
                style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.50) 0%, transparent 70%)', borderRadius: '20px 0 0 0' }} />
            {/* Accent top strip */}
            <div className="absolute top-0 left-[20%] right-[20%] h-[3px] rounded-b-full"
                style={{ background: `linear-gradient(90deg, ${accent}40, ${accent}, ${accent}40)`, opacity: open ? 1 : 0.3, transition: 'opacity 0.2s' }} />

            {/* Header button */}
            <button
                onClick={() => { setOpen(o => !o); haptic.selection(); }}
                className="w-full flex items-center px-4 py-3.5 text-right"
                style={{ position: 'relative', zIndex: 1 }}>
                {/* Liquid accent bar */}
                <div className="w-[3px] rounded-full h-7 ml-3 flex-shrink-0 relative overflow-hidden"
                    style={{ background: open ? `linear-gradient(to bottom, ${accent}, ${accent}55)` : 'rgba(8,145,178,0.12)' }} />

                <div className="flex-1">
                    <p style={{ fontSize: 14, fontWeight: 800, color: W.textPrimary, textAlign: 'right' }}>{title}</p>
                </div>

                {badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mx-2 flex-shrink-0"
                        style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}22` }}>
                        {badge}
                    </span>
                )}

                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown style={{ width: 16, height: 16, color: W.textMuted }} />
                </motion.div>
            </button>

            {/* Body */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.05, 0.7, 0.1, 1] }}
                        className="overflow-hidden"
                        style={{ position: 'relative', zIndex: 1 }}>
                        <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(8,145,178,0.08)' }}>
                            <div className="pt-3">{children}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* DURATION CHIP — liquid glass                           */
/* ══════════════════════════════════════════════════════ */
function WaterDurationChip({ label, sub, active, color, onClick }: {
    label: string; sub: string; active: boolean; color: string; onClick: () => void;
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            onClick={onClick}
            className="flex-1 relative overflow-hidden rounded-[16px] p-3.5 text-right"
            style={{
                background: active
                    ? `linear-gradient(145deg, rgba(255,255,255,0.88) 0%, ${color}14 100%)`
                    : W.glass,
                border: `1.5px solid ${active ? 'rgba(255,255,255,0.92)' : W.glassBorder}`,
                backdropFilter: 'blur(18px)',
                boxShadow: active ? `0 4px 16px ${color}20, 0 2px 0 rgba(255,255,255,0.95) inset` : W.glassShadow,
                transition: 'all 180ms cubic-bezier(0.05,0.7,0.1,1)',
            }}>
            {active && (
                <>
                    <div className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)' }} />
                    <div className="absolute top-0 left-0 w-[55%] h-[50%]"
                        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.38) 0%, transparent 70%)', borderRadius: 14 }} />
                </>
            )}
            <div className="flex items-center gap-1.5 mb-0.5" style={{ position: 'relative', zIndex: 1 }}>
                <Clock style={{ width: 11, height: 11, flexShrink: 0, color: active ? color : W.textMuted }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: active ? W.textPrimary : W.textSub }}>{label}</span>
            </div>
            <p style={{ fontSize: 10.5, color: W.textMuted, position: 'relative', zIndex: 1, fontWeight: 500 }}>{sub}</p>
        </motion.button>
    );
}

/* ══════════════════════════════════════════════════════ */
/* MAIN                                                   */
/* ══════════════════════════════════════════════════════ */
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

    const deepQs  = getDeepQuestionsForPathway(pathwayId, severity);
    const foodQs  = hasFoodRelevantSignals(pathwayId, severity, clinicalAnswers)
        ? getAdaptiveFoodQuestions(pathwayId, severity, clinicalAnswers, 3)
        : [];

    const filled = [
        severity > 0, !!duration,
        ...pathway.clinicalQuestions.map(q => {
            const v = clinicalAnswers[q.id];
            return Array.isArray(v) ? v.length > 0 : !!v;
        }),
        ...deepQs.map(q => {
            const v = clinicalAnswers[q.id];
            return Array.isArray(v) ? v.length > 0 : !!v;
        }),
    ].filter(Boolean).length;
    const total = 2 + pathway.clinicalQuestions.length + deepQs.length;
    const pct   = Math.round((filled / total) * 100);

    return (
        <div className="relative min-h-screen" dir="rtl"
            style={{ background: W.pageBg }}>

            {/* Ambient water glows */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div style={{ position: 'absolute', top: -80, right: -40, width: 300, height: 300,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${pathway.color}22 0%, transparent 70%)`,
                    filter: 'blur(55px)' }} />
                <div style={{ position: 'absolute', bottom: 100, left: -50, width: 250, height: 250,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 65%)',
                    filter: 'blur(48px)' }} />
            </div>

            <div className="relative z-10 px-4 pt-2 pb-44">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 28 }}
                    className="mb-5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
                        style={{
                            background: `${pathway.color}12`,
                            border: `1px solid ${pathway.color}25`,
                            backdropFilter: 'blur(12px)',
                        }}>
                        <span style={{ fontSize: 13 }}>{pathway.emoji}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, color: pathway.color }}>الخطوة ٣ من ٤</span>
                    </div>
                    <h2 style={{ fontSize: 26, fontWeight: 900, color: W.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 4 }}>
                        صف حالتك
                    </h2>
                    <p style={{ fontSize: 12.5, color: W.textSub, fontWeight: 500 }}>
                        بخصوص <span style={{ fontWeight: 800, color: pathway.color }}>{pathway.label}</span>
                    </p>
                </motion.div>

                {/* Progress glass card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.06, type: 'spring', stiffness: 270, damping: 28 }}
                    className="relative overflow-hidden rounded-[18px] px-4 py-3.5 mb-4 flex items-center gap-3"
                    style={{
                        background: W.glass,
                        border: `1.5px solid ${W.glassBorder}`,
                        backdropFilter: 'blur(24px)',
                        boxShadow: W.glassShadow,
                    }}>
                    <div className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)' }} />

                    {/* Liquid progress ring */}
                    <div className="relative w-11 h-11 flex-shrink-0">
                        <svg viewBox="0 0 44 44" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="22" cy="22" r="17" fill="none" stroke={`${pathway.color}18`} strokeWidth="3.5" />
                            <motion.circle cx="22" cy="22" r="17" fill="none"
                                stroke={pathway.color} strokeWidth="3.5" strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 17}`}
                                animate={{ strokeDashoffset: (1 - pct / 100) * 2 * Math.PI * 17 }}
                                initial={{ strokeDashoffset: 2 * Math.PI * 17 }}
                                transition={{ duration: 0.5, ease: [0.05, 0.7, 0.1, 1] }}
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center"
                            style={{ fontSize: 8.5, fontWeight: 900, color: pathway.color }}>
                            {pct}%
                        </span>
                    </div>
                    <div>
                        <p style={{ fontSize: 13.5, fontWeight: 800, color: W.textPrimary }}>اكتمال البيانات</p>
                        <p style={{ fontSize: 11, fontWeight: 500, color: W.textMuted }}>أكمل كل الحقول لتحليل أدق</p>
                    </div>

                    {/* Water fill bar at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2.5px]"
                        style={{ background: `${pathway.color}12` }}>
                        <motion.div className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${pathway.color}, ${W.tealLight})` }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: [0.05, 0.7, 0.1, 1] }}
                        />
                    </div>
                </motion.div>

                {/* Severity Card */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                    <WaterCard title="شدة الأعراض" accent="#DC2626"
                        badge={severity > 0 ? `${severity}/١٠` : undefined}>
                        <SeveritySlider value={severity} onChange={onSeverity} />
                    </WaterCard>
                </motion.div>

                {/* Duration Card */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
                    <WaterCard title="مدة الأعراض" accent="#818CF8"
                        badge={duration ? DURATION_OPTIONS.find(d => d.id === duration)?.label : undefined}>
                        <div className="grid grid-cols-2 gap-2">
                            {DURATION_OPTIONS.map(o => (
                                <WaterDurationChip key={o.id} label={o.label} sub={o.sub}
                                    active={duration === o.id} color={pathway.color}
                                    onClick={() => { haptic.selection(); onDuration(o.id); }}
                                />
                            ))}
                        </div>
                    </WaterCard>
                </motion.div>

                {/* Clinical questions */}
                {pathway.clinicalQuestions.map((q, qi) => {
                    const val = clinicalAnswers[q.id];
                    const cnt = Array.isArray(val) ? val.length : val ? 1 : 0;
                    return (
                        <motion.div key={q.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 + qi * 0.05 }}>
                            <WaterCard title={q.text} accent={pathway.color}
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
                            </WaterCard>
                        </motion.div>
                    );
                })}
                {/* Deep intake questions */}
                {deepQs.length > 0 && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="my-3 flex items-center gap-2 px-1">
                            <div style={{ flex: 1, height: 1, background: 'rgba(5,150,105,0.12)' }} />
                            <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', letterSpacing: '0.05em' }}>تعميق التحليل</span>
                            <div style={{ flex: 1, height: 1, background: 'rgba(5,150,105,0.12)' }} />
                        </motion.div>
                        {deepQs.map((q, qi) => {
                            const val = clinicalAnswers[q.id];
                            const cnt = Array.isArray(val) ? val.length : val ? 1 : 0;
                            return (
                                <motion.div key={q.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.32 + qi * 0.04 }}>
                                    <WaterCard title={q.text} accent="#059669"
                                        badge={cnt > 0 ? `${cnt} محدد` : undefined}
                                        defaultOpen={qi === 0}>
                                        <div className="flex flex-wrap gap-2">
                                            {q.options.map(opt => {
                                                const isSel = Array.isArray(val) ? val.includes(opt) : val === opt;
                                                return (
                                                    <OptionChip key={opt} label={opt} selected={isSel} color="#059669"
                                                        onToggle={() => q.type === 'multiple' ? togN(q.id, opt) : tog1(q.id, opt)} />
                                                );
                                            })}
                                        </div>
                                    </WaterCard>
                                </motion.div>
                            );
                        })}
                    </>
                )}

                {/* Adaptive Tayyibat food questions — only when food signals exist */}
                {foodQs.length > 0 && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ delay: 0.45 }}
                            className="my-3 flex items-center gap-2 px-1">
                            <div style={{ flex: 1, height: 1, background: 'rgba(5,150,105,0.12)' }} />
                            <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', letterSpacing: '0.05em' }}>🌿 الجانب الغذائي</span>
                            <div style={{ flex: 1, height: 1, background: 'rgba(5,150,105,0.12)' }} />
                        </motion.div>
                        {foodQs.map((q, qi) => {
                            const val = clinicalAnswers[q.id];
                            const selected = typeof val === 'string' ? val : '';
                            return (
                                <motion.div key={q.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.47 + qi * 0.04 }}>
                                    <WaterCard title={q.text} accent="#059669"
                                        badge={selected ? '✓' : undefined}
                                        defaultOpen={qi === 0}>
                                        {q.subtext && (
                                            <p style={{ fontSize: 10, color: W.textMuted, marginBottom: 8 }}>{q.subtext}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {q.options.map(opt => (
                                                <OptionChip key={opt.value}
                                                    label={`${opt.emoji ?? ''} ${opt.label}`.trim()}
                                                    selected={selected === opt.value}
                                                    color="#059669"
                                                    onToggle={() => tog1(q.id, opt.value)} />
                                            ))}
                                        </div>
                                    </WaterCard>
                                </motion.div>
                            );
                        })}
                    </>
                )}
            </div>

            <BottomCTA label="التالي — البعد العاطفي" onPress={onNext} variant="teal" />
        </div>
    );
}
