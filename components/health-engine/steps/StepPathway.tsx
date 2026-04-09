// components/health-engine/steps/StepPathway.tsx
// THIE v2 — "Symptom Oracle" — Holographic 3D category selection
// Inspired by: Apple Vision Pro apps + medical holography

'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { PATHWAYS } from '../constants';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

// Holographic card shimmer
function HoloShimmer({ color }: { color: string }) {
    return (
        <motion.div
            className="absolute inset-0 rounded-[22px] pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>
            {/* Diagonal shimmer sweep */}
            <motion.div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(125deg, transparent 30%, ${color}18 50%, transparent 70%)`,
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
            />
            {/* Edge glow */}
            <div className="absolute inset-px rounded-[21px]"
                style={{ background: `linear-gradient(145deg, ${color}20 0%, transparent 50%)` }} />
        </motion.div>
    );
}

// Active pathway expanded detail
function PathwayDetail({ pathway }: { pathway: typeof PATHWAYS[0] }) {
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden">
            <div className="pt-3 border-t mt-3"
                style={{ borderColor: `${pathway.color}20` }}>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
                    ما يشمله هذا القسم
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {pathway.clinicalQuestions.map(q => (
                        <span key={q.id}
                            className="text-[9.5px] font-bold px-2 py-0.5 rounded-lg"
                            style={{ background: `${pathway.color}12`, color: pathway.color }}>
                            {q.text.length > 20 ? q.text.slice(0, 20) + '…' : q.text}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

export function StepPathway({
    selectedId, onSelect, onNext,
}: { selectedId: string; onSelect: (id: string) => void; onNext: () => void }) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const chosen = PATHWAYS.find(p => p.id === selectedId);

    const handleSelect = (id: string) => {
        haptic.impact();
        onSelect(id);
        setExpanded(null);
    };

    return (
        <div className="px-4 pb-36 pt-20" dir="rtl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="pt-3 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                    style={{ background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.2)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    <span className="text-[9px] font-black text-teal-400 tracking-widest uppercase">
                        الخطوة ١ من ٤
                    </span>
                </div>
                <h2 className="text-[28px] font-black text-white leading-tight tracking-tight">
                    ما أكثر شيء
                    <br />
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #0d9488, #a78bfa)' }}>
                        يزعجك الآن؟
                    </span>
                </h2>
                <p className="text-[12px] text-slate-500 mt-2 font-medium">
                    اختر الأقرب — يمكنك التوسع بالتفاصيل لاحقاً
                </p>
            </motion.div>

            {/* Pathways list — premium cards */}
            <div className="space-y-3">
                {PATHWAYS.map((p, i) => {
                    const isSelected = p.id === selectedId;
                    const isExpanded = expanded === p.id;

                    return (
                        <motion.div key={p.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.045, type: 'spring', stiffness: 320, damping: 30 }}>
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect(p.id)}
                                className="relative rounded-[22px] overflow-hidden cursor-pointer"
                                style={{
                                    background: isSelected
                                        ? `linear-gradient(135deg, ${p.gradient[0]}CC, ${p.gradient[1]}99)`
                                        : 'rgba(15,23,42,0.7)',
                                    border: `1.5px solid ${isSelected ? p.color : 'rgba(255,255,255,0.06)'}`,
                                    boxShadow: isSelected
                                        ? `0 8px 40px ${p.color}35, inset 0 1px 0 rgba(255,255,255,0.1)`
                                        : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                                    backdropFilter: 'blur(12px)',
                                }}>
                                {/* Shimmer on selected */}
                                {isSelected && <HoloShimmer color={p.color} />}

                                {/* Content row */}
                                <div className="flex items-center gap-4 p-4 relative z-10">
                                    {/* Emoji container */}
                                    <motion.div
                                        animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background: isSelected
                                                ? 'rgba(255,255,255,0.15)'
                                                : `${p.color}12`,
                                            border: `1px solid ${isSelected ? 'rgba(255,255,255,0.2)' : p.color + '25'}`,
                                            boxShadow: isSelected ? `0 4px 16px ${p.color}40` : 'none',
                                        }}>
                                        <span className="text-[24px] leading-none">{p.emoji}</span>
                                    </motion.div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-black text-white">{p.label}</p>
                                        <p className="text-[11px] mt-0.5 truncate"
                                            style={{ color: isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' }}>
                                            {p.description}
                                        </p>
                                    </div>

                                    {/* Right side */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                                style={{ background: p.color, boxShadow: `0 0 12px ${p.color}60` }}>
                                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                            </motion.div>
                                        )}
                                        <motion.button
                                            whileTap={{ scale: 0.85 }}
                                            onClick={e => { e.stopPropagation(); haptic.selection(); setExpanded(isExpanded ? null : p.id); }}
                                            className="w-6 h-6 rounded-full flex items-center justify-center"
                                            style={{ background: 'rgba(255,255,255,0.06)' }}>
                                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                <ChevronDown className="w-3 h-3 text-slate-500" />
                                            </motion.div>
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Expanded detail */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <div className="px-4 pb-4 relative z-10">
                                            <PathwayDetail pathway={p} />
                                        </div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            <BottomCTA
                label={selectedId ? `متابعة — ${chosen?.label}` : 'اختر شكواك أولاً'}
                onPress={onNext}
                disabled={!selectedId}
                variant="teal"
            />
        </div>
    );
}
