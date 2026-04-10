// components/health-engine/steps/StepRedFlags.tsx
// THIE v4 — M3 Warning List + Emergency full-screen dialog
// Reference: Material Design 3 Dialogs + Warning states

'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, ShieldCheck, ChevronLeft } from 'lucide-react';
import { PATHWAYS } from '../constants';
import { haptic } from '@/lib/HapticFeedback';
import type { RedFlag } from '../types';

interface Props {
    pathwayId: string; selectedFlags: string[];
    onToggleFlag: (id: string, flag: RedFlag) => void;
    emergencyMessage: string; onClearEmergency: () => void; onNext: () => void;
}

/* Pulsing rings — M3 "attention" pattern */
function PulseRings({ color }: { color: string }) {
    return <>
        {[0, 1, 2].map(i => (
            <motion.div key={i}
                className="absolute inset-0 rounded-full border"
                style={{ borderColor: color }}
                animate={{ scale: 1.4 + i * 0.35, opacity: 0 }}
                initial={{ scale: 1, opacity: 0.5 }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
            />
        ))}
    </>;
}

/* M3 Full-screen dialog for emergency */
function EmergencyScreen({ message, onClear }: { message: string; onClear: () => void }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col items-center justify-center px-5 pb-10 pt-20"
            style={{ background: '#FEF2F2' }}>
            {/* M3 Error container card */}
            <motion.div
                initial={{ scale: 0.88, y: 24 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="w-full max-w-sm rounded-[28px] overflow-hidden"
                style={{
                    background: 'linear-gradient(145deg, #b91c1c, #dc2626)',
                    boxShadow: '0 16px 48px rgba(220,38,38,0.38)',
                }}>
                <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
                <div className="p-7 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-5">
                        <PulseRings color="rgba(255,150,150,0.45)" />
                        <div className="w-full h-full rounded-full flex items-center justify-center relative z-10"
                            style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                            <AlertTriangle className="w-9 h-9 text-white" />
                        </div>
                    </div>
                    <h2 className="m3-headline-sm text-white mb-2">تنبيه طبي عاجل</h2>
                    <p className="m3-body-lg text-white/70 leading-relaxed mb-7">{message}</p>
                    {/* M3 Filled Button */}
                    <a href="tel:911" onClick={() => haptic.trigger('heavy')}
                        className="flex items-center justify-center gap-3 bg-white font-black py-4 rounded-[20px] w-full mb-3 m3-state"
                        style={{ color: '#b91c1c', fontSize: 15, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
                        <Phone className="w-5 h-5" />
                        اتصل بالإسعاف فوراً
                    </a>
                    {/* M3 Text button */}
                    <button onClick={onClear} className="m3-state py-2 px-4 rounded-xl"
                        style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                        لست متأكداً — استمر بالتحليل
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export function StepRedFlags({ pathwayId, selectedFlags, onToggleFlag, emergencyMessage, onClearEmergency, onNext }: Props) {
    const pathway = PATHWAYS.find(p => p.id === pathwayId);
    const flags   = pathway?.redFlags ?? [];

    if (emergencyMessage) return <EmergencyScreen message={emergencyMessage} onClear={onClearEmergency} />;

    /* No flags for this pathway — safe screen */
    if (flags.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                    className="relative mb-5">
                    <PulseRings color="rgba(13,148,136,0.25)" />
                    <div className="w-20 h-20 rounded-[24px] flex items-center justify-center relative z-10"
                        style={{ background: 'linear-gradient(135deg,#059669,#0d9488)', boxShadow: '0 8px 28px rgba(13,148,136,0.28)' }}>
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h2 className="m3-headline-sm text-slate-900 mb-1">أنت في وضع آمن</h2>
                    <p className="m3-body-lg text-slate-400 mb-8">لا توجد أعراض طارئة لهذا المسار</p>
                    <motion.button whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        onClick={onNext}
                        className="flex items-center gap-2.5 px-8 h-14 rounded-[20px] font-black text-white m3-state"
                        style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)', boxShadow: '0 6px 20px rgba(13,148,136,0.28)', fontSize: 15 }}>
                        متابعة
                        <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="px-4" dir="rtl">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className="mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
                    style={{ background: '#fff8ed', border: '1px solid #fde68a' }}>
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span className="m3-label-sm text-amber-700" style={{ textTransform: 'none', fontSize: 10 }}>
                        الخطوة ٢ من ٤
                    </span>
                </div>
                <h2 className="m3-headline-md text-slate-900">فحص السلامة</h2>
                <p className="m3-body-md text-slate-400 mt-1">أسئلة للتأكد من حالتك الآن</p>
            </motion.div>

            {/* M3 Warning banner — Tertiary container */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
                className="flex items-start gap-3 rounded-[18px] p-4 mb-5"
                style={{ background: '#fff8ed', border: '1.5px solid #fde68a' }}>
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(217,119,6,0.15)' }}>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="m3-body-md text-amber-800/80 leading-relaxed">
                    إذا كنت تعاني من أي مما يلي الآن، سنوجّهك فوراً للخطوة الصحيحة.
                </p>
            </motion.div>

            {/* M3 Selection list — flags */}
            <div className="space-y-2.5 mb-4">
                {flags.map((flag, i) => {
                    const sel  = selectedFlags.includes(flag.id);
                    const isEm = flag.level === 'emergency';
                    const clr  = isEm ? '#b91c1c' : '#b45309';
                    const bg   = sel ? (isEm ? '#fef2f2' : '#fff8ed') : '#ffffff';
                    const brd  = sel ? (isEm ? '#fca5a5' : '#fde68a') : 'rgba(0,0,0,0.08)';

                    return (
                        <motion.button key={flag.id}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.055, type: 'spring', stiffness: 320, damping: 30 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { haptic.impact(); onToggleFlag(flag.id, flag); }}
                            className="w-full text-right rounded-[18px] flex items-start gap-3 p-4 m3-state transition-all"
                            style={{
                                background: bg,
                                border: `1.5px solid ${brd}`,
                                boxShadow: sel ? '0 2px 10px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)',
                                transition: 'all 180ms cubic-bezier(0.05,0.7,0.1,1)',
                            }}>
                            {/* M3 Checkbox */}
                            <motion.div
                                animate={sel ? { scale: [1.2, 1] } : { scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                                className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5"
                                style={{
                                    background: sel ? clr : 'transparent',
                                    border: `2px solid ${sel ? clr : 'rgba(0,0,0,0.2)'}`,
                                }}>
                                {sel && <span className="text-white text-[10px] font-black leading-none">✓</span>}
                            </motion.div>

                            <div className="flex-1 min-w-0">
                                <p className="m3-body-lg text-slate-800 font-semibold leading-snug mb-1.5">{flag.text}</p>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                        background: isEm ? '#fee2e2' : '#fef3c7',
                                        color: isEm ? '#b91c1c' : '#92400e',
                                    }}>
                                    {isEm ? '🔴 علامة طارئة' : '🟡 عاجل'}
                                </span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* M3 Positive bypass — Tonal button */}
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                whileTap={{ scale: 0.97 }} onClick={() => { haptic.selection(); onNext(); }}
                className="w-full flex items-center gap-3 rounded-[18px] p-4 text-right m3-state"
                style={{ background: '#f0fdfa', border: '1.5px solid #99f6e4' }}>
                <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <div className="flex-1">
                    <p className="m3-title-md text-teal-800">لا، لا أعاني من أي منها</p>
                    <p className="m3-body-md text-teal-600/70 mt-0.5">متابعة لوصف الحالة بالتفصيل</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-teal-500" />
            </motion.button>

            {/* Bottom CTA when flags selected */}
            <AnimatePresence>
                {selectedFlags.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                        className="fixed bottom-0 inset-x-0 px-4"
                        style={{
                            paddingBottom: 'max(env(safe-area-inset-bottom), 20px)',
                            paddingTop: 16,
                            background: 'linear-gradient(to top, #F7FAFA 60%, rgba(247,250,250,0) 100%)',
                        }}>
                        <motion.button whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                            onClick={onNext}
                            className="w-full h-14 rounded-[28px] flex items-center justify-between px-6 font-black text-white m3-state"
                            style={{
                                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                boxShadow: '0 4px 20px rgba(220,38,38,0.30)',
                                fontSize: 15,
                            }}>
                            <span>متابعة ({selectedFlags.length} علامة)</span>
                            <ChevronLeft className="w-5 h-5 opacity-75" />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
