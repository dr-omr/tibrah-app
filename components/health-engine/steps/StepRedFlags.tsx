// components/health-engine/steps/StepRedFlags.tsx
// THIE v2 — "The Guardian" — Biometric scanner + emergency drama

'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, ShieldCheck, ShieldAlert, ChevronLeft } from 'lucide-react';
import { PATHWAYS } from '../constants';
import { haptic } from '@/lib/HapticFeedback';
import type { RedFlag } from '../types';

interface Props {
    pathwayId: string;
    selectedFlags: string[];
    onToggleFlag: (id: string, flag: RedFlag) => void;
    emergencyMessage: string;
    onClearEmergency: () => void;
    onNext: () => void;
}

// ── Scanner pulse animation ──
function ScannerPulse({ color }: { color: string }) {
    return (
        <>
            {[0, 1, 2].map(i => (
                <motion.div key={i}
                    className="absolute inset-0 rounded-full border"
                    style={{ borderColor: color }}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.5 + i * 0.4, opacity: 0 }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.45 }}
                />
            ))}
        </>
    );
}

// ── Emergency fullscreen overlay ──
function EmergencyOverlay({ message, onClear }: { message: string; onClear: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col items-center justify-center px-5 pb-24 pt-24">
            {/* Pulsing red ambient */}
            <motion.div
                className="fixed inset-0 pointer-events-none"
                animate={{ backgroundColor: ['rgba(220,38,38,0)', 'rgba(220,38,38,0.12)', 'rgba(220,38,38,0)'] }}
                transition={{ duration: 1.2, repeat: Infinity }}
            />

            <div className="w-full max-w-sm relative z-10">
                {/* Alert card */}
                <motion.div
                    initial={{ scale: 0.85, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                    className="rounded-[32px] overflow-hidden"
                    style={{
                        background: 'linear-gradient(145deg, #450a0a, #7f1d1d, #dc2626)',
                        boxShadow: '0 24px 80px rgba(220,38,38,0.6)',
                    }}>
                    <div className="h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,100,100,0.5), transparent)' }} />

                    <div className="p-7 text-center">
                        {/* Pulsing icon */}
                        <div className="relative w-24 h-24 mx-auto mb-5">
                            <ScannerPulse color="rgba(255,100,100,0.5)" />
                            <div className="w-full h-full rounded-full flex items-center justify-center relative z-10"
                                style={{ background: 'rgba(220,38,38,0.25)', border: '2px solid rgba(255,255,255,0.25)' }}>
                                <ShieldAlert className="w-10 h-10 text-white" />
                            </div>
                        </div>

                        <h2 className="text-[24px] font-black text-white mb-2">تنبيه طبي عاجل</h2>
                        <p className="text-[13px] text-red-100/75 leading-relaxed mb-7">{message}</p>

                        {/* Emergency call */}
                        <a href="tel:911"
                            onClick={() => haptic.trigger('heavy')}
                            className="flex items-center justify-center gap-3 bg-white text-red-700 font-black text-[15px] py-4 rounded-2xl w-full mb-3"
                            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
                            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center">
                                <Phone className="w-4 h-4 text-white" />
                            </div>
                            اتصل بالإسعاف فوراً
                        </a>

                        <button onClick={onClear}
                            className="text-[10.5px] text-white/30 hover:text-white/60 transition-colors py-2">
                            لست متأكداً — استمر بالتحليل
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export function StepRedFlags({ pathwayId, selectedFlags, onToggleFlag, emergencyMessage, onClearEmergency, onNext }: Props) {
    const pathway = PATHWAYS.find(p => p.id === pathwayId);
    const flags = pathway?.redFlags ?? [];

    if (emergencyMessage) {
        return <EmergencyOverlay message={emergencyMessage} onClear={onClearEmergency} />;
    }

    if (flags.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20 pb-12">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="relative mb-6">
                    <ScannerPulse color="rgba(16,185,129,0.3)" />
                    <div className="w-20 h-20 rounded-[24px] flex items-center justify-center relative z-10"
                        style={{ background: 'linear-gradient(135deg, #059669, #0d9488)', boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}>
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h2 className="text-[22px] font-black text-white mb-2">لا توجد علامات تحذير</h2>
                    <p className="text-[12px] text-slate-500 mb-8">حالتك لا تتضمن أعراضاً حرجة</p>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={onNext}
                        className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white"
                        style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 8px 24px rgba(13,148,136,0.4)' }}>
                        متابعة — وصف الحالة
                        <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="px-4 pb-36 pt-20" dir="rtl">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pt-3 mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                    style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span className="text-[9px] font-black text-amber-400 tracking-widest uppercase">الخطوة ٢ من ٤</span>
                </div>
                <h2 className="text-[26px] font-black text-white leading-tight">فحص العلامات<br />التحذيرية</h2>
                <p className="text-[12px] text-slate-500 mt-1">أسئلة سريعة لضمان سلامتك</p>
            </motion.div>

            {/* Warning banner */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex items-start gap-3 rounded-2xl p-4 mb-5"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(245,158,11,0.15)' }}>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-[11px] text-amber-400/70 font-medium leading-relaxed">
                    هذه الأعراض قد تكون علامات تحذير طبيًا. إذا كنت تعاني من أي منها، وجّهك هذا التحليل فوراً.
                </p>
            </motion.div>

            {/* Flag cards */}
            <div className="space-y-3 mb-4">
                {flags.map((flag, i) => {
                    const isSelected = selectedFlags.includes(flag.id);
                    const isEmergency = flag.level === 'emergency';
                    return (
                        <motion.button
                            key={flag.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 28 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { haptic.impact(); onToggleFlag(flag.id, flag); }}
                            className="w-full text-right rounded-[20px] p-4 flex items-start gap-3 transition-all"
                            style={{
                                background: isSelected
                                    ? (isEmergency ? 'rgba(220,38,38,0.10)' : 'rgba(245,158,11,0.08)')
                                    : 'rgba(255,255,255,0.03)',
                                border: `1.5px solid ${isSelected
                                    ? (isEmergency ? 'rgba(220,38,38,0.35)' : 'rgba(245,158,11,0.3)')
                                    : 'rgba(255,255,255,0.06)'}`,
                                boxShadow: isSelected
                                    ? `0 4px 20px ${isEmergency ? 'rgba(220,38,38,0.15)' : 'rgba(245,158,11,0.10)'}`
                                    : 'none',
                            }}>
                            {/* Checkbox */}
                            <motion.div
                                animate={isSelected ? { scale: [1.3, 1] } : { scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                                className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5"
                                style={{
                                    background: isSelected
                                        ? (isEmergency ? '#dc2626' : '#f59e0b')
                                        : 'transparent',
                                    border: `2px solid ${isSelected
                                        ? (isEmergency ? '#dc2626' : '#f59e0b')
                                        : 'rgba(255,255,255,0.15)'}`,
                                }}>
                                {isSelected && <span className="text-white text-[10px] font-black">✓</span>}
                            </motion.div>

                            <div className="flex-1">
                                <p className="text-[13px] font-bold text-white leading-snug mb-1">{flag.text}</p>
                                <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full"
                                    style={{
                                        background: isEmergency ? 'rgba(220,38,38,0.15)' : 'rgba(245,158,11,0.15)',
                                        color: isEmergency ? '#fca5a5' : '#fcd34d',
                                    }}>
                                    {isEmergency ? '🔴 علامة طارئة' : '🟡 يحتاج متابعة عاجلة'}
                                </span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Safe bypass */}
            <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { haptic.selection(); onNext(); }}
                className="w-full flex items-center gap-3 rounded-[20px] p-4 text-right"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1.5px solid rgba(16,185,129,0.18)' }}>
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                    <p className="text-[13px] font-black text-emerald-400">لا — لا أعاني من أي منها</p>
                    <p className="text-[10px] text-emerald-600/70">متابعة لوصف الحالة التفصيلي</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-emerald-600 mr-auto" />
            </motion.button>

            {/* Continue if flags selected */}
            <AnimatePresence>
                {selectedFlags.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-0 inset-x-0 px-5"
                        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)', background: 'linear-gradient(to top, rgba(2,6,23,1) 60%, transparent)' }}>
                        <motion.button whileTap={{ scale: 0.97 }} onClick={onNext}
                            className="w-full h-[54px] rounded-[18px] flex items-center justify-between px-6 font-black text-white"
                            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', boxShadow: '0 12px 36px rgba(239,68,68,0.4)' }}>
                            <span>متابعة ({selectedFlags.length} علامة محددة)</span>
                            <ChevronLeft className="w-5 h-5 text-white/80" />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
