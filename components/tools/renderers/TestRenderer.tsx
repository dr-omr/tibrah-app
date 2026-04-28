// components/tools/renderers/TestRenderer.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Test Renderer (quiz questions → scored result)
// ════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import type { TestContent } from '@/lib/tool-content-map';

export function TestRenderer({
    content, color, onComplete,
}: { content: TestContent; color: string; onComplete: () => void }) {
    const [qIdx, setQIdx]       = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [result, setResult]   = useState<typeof content.results[0] | null>(null);

    const currentQ = content.questions[qIdx];
    const isLast   = qIdx === content.questions.length - 1;
    const selected = answers[currentQ?.id];

    const handleSelect = (val: number) => {
        haptic.tap();
        setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
    };

    const handleNext = () => {
        haptic.tap();
        if (result) { onComplete(); return; }
        if (isLast) {
            const total = Object.values(answers).reduce((s, v) => s + v, 0);
            const r = content.results.find(r => total >= r.minScore && total <= r.maxScore)
                ?? content.results[content.results.length - 1];
            setResult(r);
        } else {
            setQIdx(i => i + 1);
        }
    };

    if (result) {
        const levelColors = { low: '#00C88C', moderate: '#F59E0B', high: '#EF4444' };
        const bgColors    = { low: 'rgba(0,200,140,0.08)', moderate: 'rgba(245,158,11,0.08)', high: 'rgba(239,68,68,0.08)' };
        const c = levelColors[result.level];
        return (
            <div className="flex flex-col gap-4">
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[22px] p-5" style={{ background: bgColors[result.level], border: `1.5px solid ${c}30` }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: c }}>نتيجتك</p>
                    <p className="text-slate-800 text-[19px] font-black mb-2">{result.title}</p>
                    <p className="text-slate-600 text-[13px] font-medium leading-relaxed mb-3">{result.message}</p>
                    <div className="h-px mb-3" style={{ background: `${c}22` }} />
                    <p className="text-[11px] font-bold" style={{ color: c }}>الخطوة التالية المقترحة:</p>
                    <p className="text-slate-600 text-[12px] font-medium mt-1">{result.nextStep}</p>
                </motion.div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleNext}
                    className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                    style={{ background: `${color}20`, border: `1.5px solid ${color}35` }}>
                    <span className="text-slate-800 font-black text-[14px]">إكمال ✓</span>
                </motion.button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                    {content.questions.map((_, i) => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all"
                            style={{ background: i <= qIdx ? color : `${color}20` }} />
                    ))}
                </div>
                <span className="text-[10px] font-bold text-slate-400">{qIdx + 1}/{content.questions.length}</span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={qIdx}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                    <p className="text-slate-800 text-[17px] font-black leading-snug mb-4">{currentQ.text}</p>
                    <div className="flex flex-col gap-2">
                        {currentQ.options.map(opt => (
                            <motion.button key={opt.value} whileTap={{ scale: 0.97 }}
                                onClick={() => handleSelect(opt.value)}
                                className="px-4 py-3 rounded-[14px] text-right"
                                style={{
                                    background: selected === opt.value ? `${color}18` : 'rgba(0,0,0,0.04)',
                                    border: `1.5px solid ${selected === opt.value ? color : 'rgba(0,0,0,0.08)'}`,
                                }}>
                                <span className="text-slate-700 text-[13px] font-bold">{opt.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            <motion.button whileTap={{ scale: 0.97 }}
                disabled={selected === undefined} onClick={handleNext}
                className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                style={{
                    background: selected !== undefined ? `${color}20` : 'rgba(0,0,0,0.05)',
                    border: `1.5px solid ${selected !== undefined ? color + '35' : 'transparent'}`,
                    opacity: selected !== undefined ? 1 : 0.5,
                }}>
                <span className="text-slate-800 font-black text-[14px]">
                    {isLast ? 'أظهر النتيجة' : 'التالي ←'}
                </span>
            </motion.button>
        </div>
    );
}
