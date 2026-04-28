// components/tools/renderers/PracticeRenderer.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Practice Renderer (step-by-step with timer)
// ════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { PracticeContent } from '@/lib/tool-content-map';

export function PracticeRenderer({
    content, color, onComplete,
}: { content: PracticeContent; color: string; onComplete: () => void }) {
    const [stepIdx, setStepIdx] = useState(0);
    const [timer, setTimer]     = useState<number | null>(null);
    const [atClosing, setAtClosing] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const currentStep = content.steps[stepIdx];
    const isLast      = stepIdx === content.steps.length - 1;

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const dur = currentStep?.durationSeconds ?? 0;
        if (dur > 0) {
            setTimer(dur);
            intervalRef.current = setInterval(() => {
                setTimer(t => {
                    if (t === null || t <= 1) { clearInterval(intervalRef.current!); return 0; }
                    return t - 1;
                });
            }, 1000);
        } else { setTimer(null); }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepIdx]);

    const handleNext = () => {
        haptic.tap();
        if (atClosing) { onComplete(); return; }
        if (isLast) { setAtClosing(true); return; }
        setStepIdx(i => i + 1);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-1">
                {content.steps.map((_, i) => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-400"
                        style={{ background: i <= stepIdx ? color : `${color}20` }} />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {!atClosing ? (
                    <motion.div key={`step-${stepIdx}`}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}
                        className="rounded-[20px] p-5"
                        style={{ background: `${color}09`, border: `1px solid ${color}22` }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color }}>
                            الخطوة {stepIdx + 1} من {content.steps.length}
                        </p>
                        <p className="text-slate-800 text-[17px] font-black leading-snug mb-4">
                            {currentStep.instruction}
                        </p>
                        {timer !== null && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" style={{ color }} />
                                <span className="text-[22px] font-black tabular-nums" style={{ color }}>{timer}ث</span>
                                {timer === 0 && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="text-[11px] font-bold text-slate-400">انتهى الوقت</motion.span>
                                )}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="closing"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-[20px] p-5"
                        style={{ background: 'rgba(0,200,140,0.08)', border: '1px solid rgba(0,200,140,0.22)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-3"
                            style={{ color: 'rgba(0,140,90,0.9)' }}>ملاحظة ختامية</p>
                        <p className="text-slate-800 text-[15px] font-bold leading-relaxed mb-3">
                            {content.closingNote}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">🔄 {content.repeatSuggestion}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleNext}
                className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${color}30, ${color}18)`, border: `1.5px solid ${color}45` }}>
                <span className="text-slate-800 font-black text-[14px]">
                    {atClosing ? 'أكملت التمرين ✓' : isLast ? 'الخطوة الأخيرة ←' : 'التالي ←'}
                </span>
            </motion.button>
        </div>
    );
}
