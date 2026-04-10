// components/health-engine/steps/StepPathway.tsx
// THIE v4 — M3 Navigation list / Selection list
// Reference: Google One, Google Health Studies, Microsoft To Do

'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronLeft } from 'lucide-react';
import { PATHWAYS } from '../constants';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

export function StepPathway({ selectedId, onSelect, onNext }: {
    selectedId: string; onSelect: (id: string) => void; onNext: () => void;
}) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const chosen = PATHWAYS.find(p => p.id === selectedId);

    return (
        <div className="px-4" dir="rtl">
            {/* M3 Section header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className="mb-6">
                {/* M3 Assist chip for step indicator */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
                    style={{ background: '#f0fdfa', border: '1px solid rgba(13,148,136,0.18)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span className="m3-label-sm text-teal-700" style={{ textTransform: 'none', fontSize: 10 }}>الخطوة ١ من ٤</span>
                </div>

                <h2 className="m3-headline-md text-slate-900 mb-2">
                    ما أكثر شيء
                    <br />
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #0d9488, #6366f1)' }}>
                        يزعجك الآن؟
                    </span>
                </h2>
                <p className="m3-body-md text-slate-400">اختر الأقرب — يمكن التوسع لاحقاً</p>
            </motion.div>

            {/*
             * M3 Selection list
             * Each item = M3 List Item with:
             *   - Leading icon container (tonal)
             *   - Headline + Supporting text
             *   - Trailing: check icon + expand
             *   - State layer on tap
             */}
            <div className="space-y-[10px]">
                {PATHWAYS.map((p, i) => {
                    const isSel = p.id === selectedId;
                    const isExp = expanded === p.id;

                    return (
                        <motion.div key={p.id}
                            initial={{ opacity: 0, y: 18, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: i * 0.04, type: 'spring', stiffness: 320, damping: 30 }}>

                            <div
                                className="rounded-[20px] overflow-hidden m3-state"
                                style={{
                                    /*
                                     * M3 Surface container with elevation:
                                     * Selected = Surface Container High (tinted with primary)
                                     * Default  = Surface Container (white + subtle elevation)
                                     */
                                    background: isSel
                                        ? `linear-gradient(135deg, ${p.color}0f, ${p.color}07)`
                                        : '#ffffff',
                                    border: `1.5px solid ${isSel ? p.color + '45' : 'rgba(0,0,0,0.07)'}`,
                                    boxShadow: isSel
                                        ? `0 2px 12px ${p.color}18, 0 1px 4px rgba(0,0,0,0.06)`
                                        : '0 1px 3px rgba(0,0,0,0.05), 0 1px 1px rgba(0,0,0,0.04)',
                                    transition: 'all 200ms cubic-bezier(0.05,0.7,0.1,1)',
                                }}>

                                {/* Main tap zone */}
                                <button
                                    className="w-full flex items-center gap-3.5 px-4 py-3.5 text-right cursor-pointer"
                                    onClick={() => { haptic.impact(); onSelect(p.id); setExpanded(null); }}>
                                    {/*
                                     * M3 Leading container — "tonal" icon
                                     * Size: 48x48 (M3 medium icon button)
                                     */}
                                    <motion.div
                                        animate={isSel ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background: isSel ? p.color + '1a' : '#f8fafc',
                                            border: `1px solid ${isSel ? p.color + '28' : 'rgba(0,0,0,0.06)'}`,
                                        }}>
                                        <span className="text-[24px] leading-none">{p.emoji}</span>
                                    </motion.div>

                                    {/* M3 List item text */}
                                    <div className="flex-1 min-w-0 text-right">
                                        <p className="m3-title-md text-slate-900">{p.label}</p>
                                        <p className="m3-body-md text-slate-400 mt-0.5 truncate">{p.description}</p>
                                    </div>

                                    {/* M3 Trailing icons */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* M3 Check icon — animated in/out */}
                                        <AnimatePresence>
                                            {isSel && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                                                    className="w-6 h-6 rounded-full flex items-center justify-center"
                                                    style={{ background: p.color }}>
                                                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Expand button — M3 Icon button */}
                                        <motion.button
                                            whileTap={{ scale: 0.8 }}
                                            className="w-8 h-8 rounded-full flex items-center justify-center m3-state"
                                            style={{ background: 'rgba(0,0,0,0.04)', color: '#94a3b8' }}
                                            onClick={e => {
                                                e.stopPropagation();
                                                haptic.selection();
                                                setExpanded(isExp ? null : p.id);
                                            }}>
                                            <motion.div
                                                animate={{ rotate: isExp ? 180 : 0 }}
                                                transition={{ duration: 0.2, ease: [0.05, 0.7, 0.1, 1] }}>
                                                <ChevronDown className="w-4 h-4" />
                                            </motion.div>
                                        </motion.button>
                                    </div>
                                </button>

                                {/* M3 Expandable detail — "revealed" content */}
                                <AnimatePresence>
                                    {isExp && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.22, ease: [0.05, 0.7, 0.1, 1] }}
                                            className="overflow-hidden">
                                            <div className="px-4 pb-4"
                                                style={{ borderTop: `1px solid ${p.color}15` }}>
                                                <p className="m3-label-sm text-slate-400 mt-3 mb-2"
                                                    style={{ textTransform: 'none', fontSize: 10 }}>
                                                    يشمل هذا المسار:
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {p.clinicalQuestions.map(q => (
                                                        <span key={q.id}
                                                            className="text-[10px] font-semibold px-2.5 py-1 rounded-xl"
                                                            style={{ background: p.color + '0f', color: p.color }}>
                                                            {q.text.length > 24 ? q.text.slice(0, 24) + '…' : q.text}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* M3 State layer bottom indicator when selected */}
                                {isSel && (
                                    <div className="h-[3px]"
                                        style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}44)` }} />
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <BottomCTA
                label={selectedId ? `متابعة — ${chosen?.label}` : 'اختر أولاً'}
                onPress={onNext}
                disabled={!selectedId}
                variant="teal"
            />
        </div>
    );
}
