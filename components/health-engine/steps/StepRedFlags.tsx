'use client';
// StepRedFlags — Full Native Glass Redesign

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Check, ArrowLeft } from 'lucide-react';
import { PATHWAYS } from '../constants';
import { haptic } from '@/lib/HapticFeedback';
import type { RedFlag } from '../types';

interface Props {
    pathwayId: string;
    selectedFlags: string[];
    onToggleFlag: (id: string, flag: RedFlag) => void;
    emergencyMessage: string;
    onClearEmergency: () => void;
    onNoFlags: () => void;
    onEmergencyContinue: () => void;
    onNext: () => void;
}

const C = {
    ink:  '#073B52',
    sub:  '#0F6F8F',
};

/* Safe-screen when pathway has no flags */
function SafeScreen({ onNext }: { onNext: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center" dir="rtl">
            <motion.div
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                className="mb-6"
            >
                <div className="mx-auto flex items-center justify-center rounded-[30px]"
                    style={{ width: 80, height: 80, background: 'linear-gradient(135deg,rgba(5,150,105,0.15),rgba(13,148,136,0.10))', border: '1.5px solid rgba(5,150,105,0.28)', backdropFilter: 'blur(18px)' }}>
                    <ShieldCheck style={{ width: 36, height: 36, color: '#059669' }} />
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 style={{ fontSize: 22, fontWeight: 950, color: C.ink, marginBottom: 6 }}>أنت في وضع آمن</h2>
                <p style={{ fontSize: 12.5, color: C.sub, fontWeight: 650, lineHeight: 1.7, marginBottom: 28 }}>لا توجد أعراض طارئة لهذا المسار</p>
                <motion.button
                    whileTap={{ scale: 0.97, y: 1 }}
                    onClick={() => { haptic.impact(); onNext(); }}
                    className="flex items-center gap-2.5 px-8 rounded-[22px] overflow-hidden relative"
                    style={{
                        height: 54, background: 'linear-gradient(150deg,rgba(255,255,255,0.90) 0%,rgba(186,230,253,0.72) 40%,rgba(8,145,178,0.58) 100%)',
                        border: '1.5px solid rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)',
                        boxShadow: '0 10px 28px rgba(8,145,178,0.22), inset 0 1.5px 0 rgba(255,255,255,0.95)',
                        fontSize: 15, fontWeight: 900, color: C.ink,
                    }}
                >
                    متابعة
                    <ArrowLeft style={{ width: 16, height: 16 }} />
                </motion.button>
            </motion.div>
        </div>
    );
}

/* Flag row item */
function FlagRow({ flag, selected, index, onToggle }: {
    flag: RedFlag; selected: boolean; index: number; onToggle: () => void;
}) {
    const isEm = flag.level === 'emergency';
    const accent = isEm ? '#DC2626' : '#D97706';

    return (
        <motion.button
            type="button"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 320, damping: 28 }}
            whileTap={{ scale: 0.975, y: 1 }}
            onClick={() => { haptic.impact(); onToggle(); }}
            className="w-full text-right relative overflow-hidden"
            style={{
                borderRadius: 20,
                padding: '12px 14px',
                background: selected
                    ? `linear-gradient(150deg, rgba(255,255,255,0.94) 0%, ${accent}08 100%)`
                    : 'rgba(255,255,255,0.54)',
                border: `1.5px solid ${selected ? `${accent}22` : 'rgba(255,255,255,0.90)'}`,
                backdropFilter: 'blur(18px) saturate(140%)',
                boxShadow: selected
                    ? `0 8px 20px ${accent}10, inset 0 1.5px 0 rgba(255,255,255,0.96)`
                    : 'inset 0 1px 0 rgba(255,255,255,0.88)',
                transition: 'background 200ms, border-color 200ms, box-shadow 200ms',
            }}
            aria-pressed={selected}
        >
            {/* top accent strip */}
            {selected && (
                <motion.div
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    className="absolute top-0 left-[15%] right-[15%] h-[2px] rounded-b-full pointer-events-none"
                    style={{ background: `linear-gradient(90deg,transparent,${accent}88,transparent)`, transformOrigin: 'center' }}
                />
            )}
            <div className="relative z-10 flex items-center gap-3">
                {/* level badge orb */}
                <div className="shrink-0 flex items-center justify-center rounded-[14px]"
                    style={{ width: 36, height: 36, background: `${accent}0E`, border: `1px solid ${accent}20` }}>
                    <span style={{ fontSize: 16 }}>{isEm ? '🔴' : '🟡'}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <span style={{ fontSize: 13.5, fontWeight: selected ? 900 : 720, color: selected ? C.ink : C.sub, display: 'block', lineHeight: 1.4 }}>
                        {flag.text}
                    </span>
                    <span className="rounded-full px-2 py-0.5 mt-1 inline-block"
                        style={{ fontSize: 9.5, fontWeight: 900, background: `${accent}0D`, color: accent, border: `1px solid ${accent}1A` }}>
                        {isEm ? 'علامة طارئة' : 'عاجل'}
                    </span>
                </div>
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 600, damping: 22 }}
                            className="shrink-0 flex items-center justify-center rounded-full"
                            style={{ width: 24, height: 24, background: accent, boxShadow: `0 4px 10px ${accent}40` }}
                        >
                            <Check style={{ width: 12, height: 12, color: '#fff', strokeWidth: 3 }} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
}

export function StepRedFlags({ pathwayId, selectedFlags, onToggleFlag, emergencyMessage, onClearEmergency, onNoFlags, onEmergencyContinue, onNext }: Props) {
    const pathway = PATHWAYS.find(p => p.id === pathwayId);
    const flags   = pathway?.redFlags ?? [];
    const [confirmClear, setConfirmClear] = useState(false);

    if (flags.length === 0) return <SafeScreen onNext={onNext} />;

    return (
        <div className="px-4" dir="rtl" style={{ paddingBottom: 200 }}>
            {/* Compact header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 28 }} className="mb-5">
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-3"
                    style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.16)', backdropFilter: 'blur(12px)' }}>
                    <AlertTriangle style={{ width: 11, height: 11, color: '#DC2626' }} />
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#DC2626', letterSpacing: '0.06em' }}>أسئلة السلامة أولاً</span>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 950, color: C.ink, letterSpacing: '-0.015em', lineHeight: 1.2, marginBottom: 6 }}>
                    هل تُلاحظ أياً من هذه؟
                </h2>
                <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, fontWeight: 600 }}>
                    وجود علامة يغيّر ترتيب التعامل — لا يعني تشخيصاً.
                </p>
            </motion.div>

            {/* Emergency alert */}
            <AnimatePresence>
                {emergencyMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        className="mb-4 rounded-[18px] p-3 flex items-start gap-2.5"
                        style={{ background: 'linear-gradient(150deg,rgba(254,242,242,0.94),rgba(255,255,255,0.80))', border: '1.5px solid rgba(220,38,38,0.18)', backdropFilter: 'blur(18px)', boxShadow: '0 8px 24px rgba(220,38,38,0.08)' }}
                    >
                        <AlertTriangle style={{ width: 14, height: 14, color: '#DC2626', flexShrink: 0, marginTop: 1 }} />
                        <div className="flex-1">
                            <p style={{ fontSize: 11.5, fontWeight: 900, color: '#991B1B', marginBottom: 3 }}>سنقدّم توجيه السلامة في النتيجة</p>
                            <p style={{ fontSize: 10.5, lineHeight: 1.6, color: '#7F1D1D', fontWeight: 700 }}>{emergencyMessage}</p>
                            <button type="button" onClick={() => { haptic.selection(); onClearEmergency(); }}
                                className="mt-2 rounded-full px-2.5 py-1"
                                style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(220,38,38,0.16)', color: '#991B1B', fontSize: 10, fontWeight: 900 }}>
                                تعديل الاختيار
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Flag rows */}
            <div className="grid gap-2 mb-4">
                {flags.map((flag, i) => (
                    <FlagRow
                        key={flag.id}
                        flag={flag}
                        selected={selectedFlags.includes(flag.id)}
                        index={i}
                        onToggle={() => onToggleFlag(flag.id, flag)}
                    />
                ))}
            </div>

            {/* No-flags bypass */}
            <motion.button
                type="button"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                whileTap={{ scale: 0.97, y: 1 }}
                onClick={() => { haptic.selection(); selectedFlags.length > 0 ? setConfirmClear(true) : onNoFlags(); }}
                className="w-full flex items-center gap-3 rounded-[18px] p-3.5 text-right"
                style={{
                    background: 'rgba(5,150,105,0.07)',
                    border: '1.5px solid rgba(5,150,105,0.18)',
                    backdropFilter: 'blur(14px)',
                }}
            >
                <ShieldCheck style={{ width: 20, height: 20, color: '#059669', flexShrink: 0 }} />
                <div className="flex-1">
                    <p style={{ fontSize: 13, fontWeight: 900, color: '#065F46' }}>
                        {selectedFlags.length > 0 ? 'إلغاء العلامات والمتابعة' : 'لا، لا أعاني من أي منها'}
                    </p>
                    <p style={{ fontSize: 10.5, color: '#0D9488', fontWeight: 650, marginTop: 2 }}>
                        متابعة لوصف الحالة بالتفصيل
                    </p>
                </div>
                <ArrowLeft style={{ width: 15, height: 15, color: '#0D9488', flexShrink: 0 }} />
            </motion.button>

            {/* Confirm clear */}
            <AnimatePresence>
                {confirmClear && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        className="mt-3 rounded-[18px] p-4"
                        style={{ background: 'rgba(255,252,245,0.95)', border: '1.5px solid rgba(217,119,6,0.22)', backdropFilter: 'blur(16px)' }}
                    >
                        <p style={{ fontSize: 12, fontWeight: 900, color: '#92400E', marginBottom: 5 }}>
                            سيُمسح اختيارك — هل أنت متأكد؟
                        </p>
                        <p style={{ fontSize: 10.5, lineHeight: 1.6, color: '#78350F', fontWeight: 650, marginBottom: 12 }}>
                            اخترت {selectedFlags.length} علامة. إذا تأكدت من عدم وجودها، سنتابع بدون تصنيف أولوية.
                        </p>
                        <div className="flex gap-2">
                            <button type="button"
                                onClick={() => { setConfirmClear(false); haptic.impact(); onNoFlags(); }}
                                className="flex-1 rounded-full py-2.5"
                                style={{ background: 'rgba(8,145,178,0.85)', color: '#fff', fontSize: 11.5, fontWeight: 900 }}>
                                نعم، لا توجد علامات خطر
                            </button>
                            <button type="button"
                                onClick={() => { setConfirmClear(false); haptic.selection(); }}
                                className="flex-1 rounded-full py-2.5"
                                style={{ background: 'rgba(255,255,255,0.80)', border: '1px solid rgba(217,119,6,0.18)', color: '#92400E', fontSize: 11.5, fontWeight: 900 }}>
                                إلغاء
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CTA for when flags selected */}
            <AnimatePresence>
                {selectedFlags.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                        className="fixed inset-x-0 px-4"
                        style={{
                            bottom: 64,
                            paddingBottom: 10, paddingTop: 12,
                            background: 'linear-gradient(to top,rgba(235,246,250,0.96) 0%,rgba(235,246,250,0.88) 55%,rgba(235,246,250,0) 100%)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <motion.button
                            whileTap={{ scale: 0.974, y: 1 }}
                            transition={{ type: 'spring', stiffness: 440, damping: 28 }}
                            onClick={() => { haptic.impact(); emergencyMessage ? onEmergencyContinue() : onNext(); }}
                            className="w-full relative overflow-hidden flex items-center justify-between"
                            style={{
                                height: 54, borderRadius: 26,
                                background: 'linear-gradient(150deg,rgba(255,255,255,0.82) 0%,rgba(254,202,202,0.72) 40%,rgba(220,38,38,0.55) 100%)',
                                border: '1.5px solid rgba(255,255,255,0.92)',
                                backdropFilter: 'blur(28px) saturate(155%)',
                                boxShadow: '0 10px 32px rgba(220,38,38,0.18), inset 0 1.5px 0 rgba(255,255,255,0.94)',
                                paddingLeft: 22, paddingRight: 18,
                            }}
                        >
                            <div className="absolute inset-x-0 top-0 h-[55%] rounded-t-[25px] pointer-events-none"
                                style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.68) 0%,transparent 100%)' }} />
                            <span style={{ fontSize: 15.5, fontWeight: 900, color: '#7F1D1D', position: 'relative', zIndex: 1 }}>
                                {emergencyMessage ? 'عرض توجيه السلامة' : `متابعة — ${selectedFlags.length} علامة مختارة`}
                            </span>
                            <div style={{ width: 34, height: 34, borderRadius: 99, background: 'rgba(255,255,255,0.40)', border: '1px solid rgba(255,255,255,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                                <ArrowLeft style={{ width: 15, height: 15, color: '#991B1B' }} />
                            </div>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
