// components/health-engine/steps/StepEmotional.tsx
// THIE v2 — "The Soul Mirror" — Tibrah's signature emotional dimension
// Aura visualization + emotion-body philosophy cards

'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Heart } from 'lucide-react';
import { EMOTIONAL_CONTEXTS } from '../constants';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

// ── Emotion aura that reacts to selections ──
function EmotionAura({ selected }: { selected: string[] }) {
    const AURA_COLORS: Record<string, string> = {
        work_stress: '#f59e0b',
        family:      '#8b5cf6',
        loneliness:  '#6366f1',
        grief:       '#94a3b8',
        financial:   '#ef4444',
        identity:    '#f97316',
        anger:       '#dc2626',
        fear:        '#7c3aed',
        burnout:     '#64748b',
        none:        '#10b981',
    };

    const activeColors = selected
        .filter(s => s !== 'none')
        .map(s => AURA_COLORS[s] ?? '#6366f1');

    if (activeColors.length === 0) return null;

    return (
        <div className="flex justify-center mb-6 pointer-events-none" aria-hidden>
            <div className="relative w-32 h-32">
                {activeColors.slice(0, 4).map((color, i) => (
                    <motion.div key={`${color}-${i}`}
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                            transform: `rotate(${i * 90}deg) translateX(${i % 2 === 0 ? 12 : -12}px)`,
                            filter: 'blur(20px)',
                        }}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
                        transition={{ duration: 2.5 + i * 0.5, repeat: Infinity }}
                    />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white/40" />
                </div>
            </div>
        </div>
    );
}

// ── Tibrah philosophy pill ──
const PHILOSOPHY_QUOTES = [
    { text: '"كثير من الآلام الجسدية هي رسائل لم تُستمع بعد."', author: 'الطب الوظيفي' },
    { text: '"الجسد يحتفظ بالحساب — مهما حاولنا الإغفال."', author: 'van der Kolk' },
    { text: '"الأمراض المزمنة كثيراً ما تبدأ بصراع عاطفي مكبوت."', author: 'فلسفة طِبرَا' },
];

export function StepEmotional({
    selected, note, onToggle, onNote, onSubmit,
}: {
    selected: string[];
    note: string;
    onToggle: (id: string) => void;
    onNote: (v: string) => void;
    onSubmit: () => void;
}) {
    const hasNone = selected.includes('none');
    const quoteIdx = Math.floor((new Date().getMinutes()) % PHILOSOPHY_QUOTES.length);
    const quote = PHILOSOPHY_QUOTES[quoteIdx];

    return (
        <div className="px-4 pb-40 pt-20" dir="rtl">
            {/* Step badge */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-3 mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <Brain className="w-3 h-3 text-indigo-400" />
                    <span className="text-[9px] font-black text-indigo-400 tracking-widest uppercase">
                        الخطوة ٤ من ٤ · البعد العاطفي
                    </span>
                </div>
                <h2 className="text-[26px] font-black text-white leading-tight tracking-tight">
                    ماذا يحمل
                    <br />
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #6366f1)' }}>
                        قلبك الآن؟
                    </span>
                </h2>
            </motion.div>

            {/* Philosophy card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-[22px] p-4 mb-6 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(13,148,136,0.06) 100%)',
                    border: '1px solid rgba(99,102,241,0.18)',
                }}>
                {/* Quote icon */}
                <div className="absolute top-3 left-4 text-[40px] leading-none text-indigo-900 font-serif"
                    aria-hidden>"</div>
                <div className="flex gap-3 items-start relative z-10">
                    <div className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(99,102,241,0.2)' }}>
                        <Brain className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-[12.5px] font-bold text-white/80 leading-relaxed italic">{quote.text}</p>
                        <p className="text-[9px] text-slate-600 font-bold mt-1.5 uppercase tracking-widest">
                            — {quote.author}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Emotion aura (animated reaction) */}
            <AnimatePresence>
                {selected.length > 0 && !hasNone && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}>
                        <EmotionAura selected={selected} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Prompt */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                ما يشغل بالك الآن؟ (اختر كل ما ينطبق)
            </motion.p>

            {/* Emotion chips — in 2 rows by emotion type */}
            <div className="flex flex-wrap gap-2 mb-5">
                {EMOTIONAL_CONTEXTS.map((ctx, i) => {
                    const isSelected = selected.includes(ctx.id);
                    const isNoneCtx = ctx.id === 'none';
                    const color = isNoneCtx ? '#10b981' : '#6366f1';

                    return (
                        <motion.button
                            key={ctx.id}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.18 + i * 0.04, type: 'spring', stiffness: 350, damping: 28 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { haptic.selection(); onToggle(ctx.id); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl font-bold transition-all"
                            style={{
                                background: isSelected ? `${color}18` : 'rgba(255,255,255,0.04)',
                                border: `1.5px solid ${isSelected ? color : 'rgba(255,255,255,0.07)'}`,
                                boxShadow: isSelected ? `0 0 20px ${color}22` : 'none',
                            }}>
                            <span className="text-[16px] leading-none">{ctx.emoji}</span>
                            <span className="text-[12px]"
                                style={{ color: isSelected ? color : 'rgba(255,255,255,0.45)' }}>
                                {ctx.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Optional note */}
            <AnimatePresence>
                {!hasNone && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.24 }}>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            <Sparkles className="inline w-3 h-3 text-teal-500 ml-1" />
                            شيء للطبيب (اختياري)
                        </p>
                        <div className="rounded-[20px] overflow-hidden"
                            style={{
                                background: 'rgba(15,23,42,0.6)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                            {/* Aurora top line */}
                            <div className="h-px w-full"
                                style={{ background: 'linear-gradient(90deg, #0d9488, #6366f1, #ec4899, transparent)' }} />
                            <textarea
                                value={note}
                                onChange={e => onNote(e.target.value)}
                                placeholder="ما تشعر أنه يؤثر على صحتك..."
                                rows={3}
                                className="w-full px-4 py-3 text-[13px] font-medium resize-none focus:outline-none bg-transparent placeholder-slate-700"
                                style={{ color: 'rgba(255,255,255,0.75)', caretColor: '#0d9488' }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomCTA
                label="تحليل حالتي الآن ✦"
                onPress={onSubmit}
                variant="gradient"
                sublabel="التحليل يشمل الأبعاد الجسدية والعاطفية معاً"
            />
        </div>
    );
}
