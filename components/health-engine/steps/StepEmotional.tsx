// components/health-engine/steps/StepEmotional.tsx
// THIE v4 — M3 Emotional context — warm, human, expressive
// Reference: Microsoft Viva Insights, Google Wellbeing

'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { EMOTIONAL_CONTEXTS } from '../constants';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

const AURA: Record<string, string> = {
    work_stress: '#f59e0b', family: '#8b5cf6', loneliness: '#6366f1',
    grief: '#94a3b8', financial: '#ef4444', identity: '#f97316',
    anger: '#dc2626', fear: '#7c3aed', burnout: '#64748b', none: '#0d9488',
};

const QUOTES = [
    { text: '"كثير من الآلام الجسدية هي رسائل لم تُستمع بعد."', src: 'الطب الوظيفي' },
    { text: '"الجسد يحتفظ بالحساب — مهما حاولنا الإغفال."', src: 'van der Kolk' },
    { text: '"الأمراض المزمنة كثيراً ما تبدأ بصراع عاطفي مكبوت."', src: 'فلسفة طِبرَا' },
];

export function StepEmotional({ selected, note, onToggle, onNote, onSubmit }: {
    selected: string[]; note: string;
    onToggle: (id: string) => void;
    onNote: (v: string) => void;
    onSubmit: () => void;
}) {
    const hasNone = selected.includes('none');
    const quote   = QUOTES[new Date().getMinutes() % QUOTES.length];
    const activeColors = selected.filter(s => s !== 'none').map(s => AURA[s] ?? '#6366f1');

    return (
        <div className="px-4" dir="rtl">
            {/* M3 Section header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className="mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
                    style={{ background: '#eef2ff', border: '1px solid rgba(99,102,241,0.18)' }}>
                    <Brain className="w-3 h-3 text-indigo-500" />
                    <span className="m3-label-sm text-indigo-600"
                        style={{ textTransform: 'none', fontSize: 10 }}>الخطوة ٤ من ٤ · البعد العاطفي</span>
                </div>
                <h2 className="m3-headline-md text-slate-900">
                    ماذا يحمل قلبك
                    <br />
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #6366f1, #0d9488)' }}>
                        الآن؟
                    </span>
                </h2>
            </motion.div>

            {/* M3 Tertiary container — Philosophy quote */}
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 28 }}
                className="rounded-[20px] p-4 mb-5 relative overflow-hidden"
                style={{
                    background: '#f5f3ff',
                    border: '1px solid #ddd6fe',
                    boxShadow: '0 1px 4px rgba(99,102,241,0.08)',
                }}>
                {/* Decorative quote mark */}
                <div className="absolute top-2 left-4 text-[52px] leading-none font-serif select-none"
                    style={{ color: '#ddd6fe' }} aria-hidden>"</div>
                <div className="flex gap-3 items-start relative z-10">
                    <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(99,102,241,0.15)' }}>
                        <Brain className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                        <p className="m3-body-lg text-indigo-900/70 italic leading-relaxed">{quote.text}</p>
                        <p className="m3-label-sm text-indigo-400 mt-2"
                            style={{ textTransform: 'none' }}>— {quote.src}</p>
                    </div>
                </div>
            </motion.div>

            {/* Emotion Aura visualization */}
            <AnimatePresence>
                {activeColors.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 72 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-center overflow-hidden mb-1">
                        <div className="relative w-20 h-14 flex items-center justify-center">
                            {activeColors.slice(0, 4).map((color, i) => (
                                <motion.div key={`${color}-${i}`}
                                    className="absolute rounded-full"
                                    style={{
                                        width: 36, height: 36,
                                        background: color, opacity: 0.15,
                                        filter: 'blur(12px)',
                                        transform: `translate(${(i % 2 === 0 ? 1 : -1) * i * 9}px, ${i > 1 ? 7 : -7}px)`,
                                    }}
                                    animate={{ scale: [1, 1.22, 1] }}
                                    transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
                                />
                            ))}
                            <span className="text-[22px] relative z-10">💜</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* M3 Filter chips group */}
            <p className="m3-label-sm text-slate-400 mb-3" style={{ textTransform: 'none', fontSize: 10 }}>
                ما يشغل بالك الآن؟ اختر كل ما ينطبق
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
                {EMOTIONAL_CONTEXTS.map((ctx, i) => {
                    const isSel   = selected.includes(ctx.id);
                    const isNone  = ctx.id === 'none';
                    const color   = isNone ? '#0d9488' : '#6366f1';
                    const bgSel   = isNone ? '#f0fdfa' : '#eef2ff';
                    const brdrSel = isNone ? '#99f6e4' : '#c7d2fe';

                    return (
                        <motion.button key={ctx.id}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + i * 0.035, type: 'spring', stiffness: 380, damping: 26 }}
                            whileTap={{ scale: 0.91 }}
                            onClick={() => { haptic.selection(); onToggle(ctx.id); }}
                            className="flex items-center gap-1.5 rounded-full m3-state"
                            style={{
                                height: 36,
                                paddingLeft: 14, paddingRight: 14,
                                background: isSel ? bgSel : '#ffffff',
                                border: `1.5px solid ${isSel ? brdrSel : 'rgba(0,0,0,0.12)'}`,
                                boxShadow: isSel
                                    ? `0 0 0 3px ${color}0c, 0 1px 4px rgba(0,0,0,0.06)`
                                    : '0 1px 2px rgba(0,0,0,0.06)',
                                transition: 'all 180ms cubic-bezier(0.05,0.7,0.1,1)',
                            }}>
                            <span className="text-base leading-none">{ctx.emoji}</span>
                            <span className="m3-body-md font-semibold" style={{ color: isSel ? color : '#475569' }}>
                                {ctx.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Optional note — M3 Outlined text field */}
            <AnimatePresence>
                {!hasNone && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.05, 0.7, 0.1, 1] }}>
                        <div className="mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-teal-500" />
                            <p className="m3-label-sm text-slate-400"
                                style={{ textTransform: 'none', fontSize: 10.5 }}>
                                ملاحظة للطبيب (اختياري)
                            </p>
                        </div>
                        {/* M3 Outlined TextField */}
                        <div className="rounded-[16px] overflow-hidden"
                            style={{
                                background: '#ffffff',
                                border: '1.5px solid rgba(0,0,0,0.12)',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            }}>
                            <div className="h-[3px]"
                                style={{ background: 'linear-gradient(90deg, #0d9488, #6366f1, #ec4899)' }} />
                            <textarea
                                value={note}
                                onChange={e => onNote(e.target.value)}
                                placeholder="ما تشعر أنه يؤثر على صحتك..."
                                rows={3}
                                className="w-full px-4 py-3 resize-none focus:outline-none bg-transparent"
                                style={{
                                    fontSize: 13, fontWeight: 500, lineHeight: 1.55,
                                    color: '#1e293b', caretColor: '#0d9488',
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomCTA
                label="تحليل حالتي الآن ✦"
                onPress={onSubmit}
                variant="gradient"
                sublabel="يشمل الأبعاد الجسدية والعاطفية معاً"
            />
        </div>
    );
}
