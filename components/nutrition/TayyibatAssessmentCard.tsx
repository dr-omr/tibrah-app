// components/nutrition/TayyibatAssessmentCard.tsx
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat Assessment Step Card
// ════════════════════════════════════════════════════════════════════════
//
// Renders the Tayyibat gate questions + conditional deep flow
// inside the assessment engine's step system.
//
// Flow:
//   1. Show gate questions (mandatory)
//   2. Evaluate shouldTriggerDeepFlow()
//   3. If triggered → show deep questions one by one
//   4. If not → skip to submit
// ════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ChevronLeft, Check, AlertTriangle } from 'lucide-react';

import {
    TAYYIBAT_GATE_QUESTIONS,
    TAYYIBAT_DEEP_QUESTIONS,
    shouldTriggerDeepFlow,
    type TayyibatQuestion,
    type TayyibatKnowledgeLevel,
    type TayyibatAdherenceLevel,
} from '@/lib/nutrition/tayyibat-assessment-flow';
import { haptic } from '@/lib/HapticFeedback';

/* ── Design Tokens (Water Glass) ── */
const W = {
    glass:       'rgba(255,255,255,0.58)',
    glassHigh:   'rgba(255,255,255,0.72)',
    glassBorder: 'rgba(255,255,255,0.85)',
    glassShadow: '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.92)',
    teal:        '#0891B2',
    textPrimary: '#0C4A6E',
    textSub:     '#0369A1',
    textMuted:   '#7DD3FC',
    green:       '#059669',
    greenLight:  'rgba(5,150,105,0.10)',
    greenBorder: 'rgba(5,150,105,0.25)',
    sheen:       'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
};

interface Props {
    pathwayId: string;
    clinicalAnswers: Record<string, unknown>;
    onComplete: (answers: {
        gateAnswers: Record<string, string>;
        deepAnswers: Record<string, string>;
        deepTriggered: boolean;
    }) => void;
}

export function TayyibatAssessmentCard({ pathwayId, clinicalAnswers, onComplete }: Props) {
    const [phase, setPhase]        = useState<'gate' | 'deep' | 'done'>('gate');
    const [gateIdx, setGateIdx]    = useState(0);
    const [deepIdx, setDeepIdx]    = useState(0);
    const [gateAnswers, setGateAnswers]  = useState<Record<string, string>>({});
    const [deepAnswers, setDeepAnswers]  = useState<Record<string, string>>({});
    const [textInput, setTextInput]      = useState('');

    // Current question
    const currentQuestion = useMemo((): TayyibatQuestion | null => {
        if (phase === 'gate') return TAYYIBAT_GATE_QUESTIONS[gateIdx] ?? null;
        if (phase === 'deep') return TAYYIBAT_DEEP_QUESTIONS[deepIdx] ?? null;
        return null;
    }, [phase, gateIdx, deepIdx]);

    // Total progress
    const totalGate = TAYYIBAT_GATE_QUESTIONS.length;
    const totalDeep = TAYYIBAT_DEEP_QUESTIONS.length;

    const handleOptionSelect = useCallback((questionId: string, optionId: string) => {
        haptic.selection();

        if (phase === 'gate') {
            const updated = { ...gateAnswers, [questionId]: optionId };
            setGateAnswers(updated);

            // Auto-advance after short delay
            setTimeout(() => {
                if (gateIdx < totalGate - 1) {
                    setGateIdx(gateIdx + 1);
                } else {
                    // Gate complete — check if deep flow needed
                    const knowledge = (updated['tay_know'] || 'dont_know') as TayyibatKnowledgeLevel;
                    const adherence = (updated['tay_level'] || 'unknown') as TayyibatAdherenceLevel;
                    const needsDeep = shouldTriggerDeepFlow(knowledge, adherence, pathwayId, clinicalAnswers);

                    if (needsDeep) {
                        setPhase('deep');
                    } else {
                        onComplete({ gateAnswers: updated, deepAnswers: {}, deepTriggered: false });
                    }
                }
            }, 350);
        } else if (phase === 'deep') {
            const updated = { ...deepAnswers, [questionId]: optionId };
            setDeepAnswers(updated);
            setTimeout(() => advanceDeep(updated), 350);
        }
    }, [phase, gateIdx, gateAnswers, deepAnswers, pathwayId, clinicalAnswers, onComplete, totalGate]);

    const handleTextSubmit = useCallback(() => {
        if (!currentQuestion || !textInput.trim()) return;
        haptic.selection();

        if (phase === 'deep') {
            const updated = { ...deepAnswers, [currentQuestion.id]: textInput.trim() };
            setDeepAnswers(updated);
            setTextInput('');
            advanceDeep(updated);
        }
    }, [phase, currentQuestion, textInput, deepAnswers]);

    const advanceDeep = useCallback((updated: Record<string, string>) => {
        if (deepIdx < totalDeep - 1) {
            setDeepIdx(deepIdx + 1);
        } else {
            onComplete({ gateAnswers, deepAnswers: updated, deepTriggered: true });
        }
    }, [deepIdx, totalDeep, gateAnswers, onComplete]);

    // Progress calculation
    const progressPercent = useMemo(() => {
        if (phase === 'gate') return ((gateIdx) / (totalGate + (phase === 'gate' ? 0 : totalDeep))) * 100;
        if (phase === 'deep') return ((totalGate + deepIdx) / (totalGate + totalDeep)) * 100;
        return 100;
    }, [phase, gateIdx, deepIdx, totalGate, totalDeep]);

    if (!currentQuestion) return null;

    return (
        <div className="px-4 pt-6 pb-20" style={{ direction: 'rtl' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6"
            >
                <div style={{
                    width: 44, height: 44, borderRadius: 16,
                    background: 'linear-gradient(145deg, rgba(5,150,105,0.12), rgba(34,211,153,0.08))',
                    border: '1px solid rgba(5,150,105,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Leaf style={{ width: 22, height: 22, color: W.green }} />
                </div>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 900, color: W.textPrimary, lineHeight: 1.2 }}>
                        نظام الطيبات
                    </h2>
                    <p style={{ fontSize: 11, fontWeight: 600, color: W.textMuted }}>
                        {phase === 'gate' ? 'أسئلة تمهيدية' : 'تفاصيل الالتزام الغذائي'}
                    </p>
                </div>
            </motion.div>

            {/* Progress bar */}
            <div className="mb-8" style={{
                height: 4, borderRadius: 2,
                background: 'rgba(8,145,178,0.08)',
                overflow: 'hidden',
            }}>
                <motion.div
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{
                        height: '100%', borderRadius: 2,
                        background: `linear-gradient(90deg, ${W.green}, ${W.teal})`,
                    }}
                />
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                    {/* Question text */}
                    <motion.div
                        className="rounded-[24px] p-5 mb-4"
                        style={{
                            background: W.glassHigh,
                            border: `1px solid ${W.glassBorder}`,
                            boxShadow: W.glassShadow,
                            position: 'relative', overflow: 'hidden',
                        }}
                    >
                        <div style={{ position: 'absolute', inset: 0, background: W.sheen, pointerEvents: 'none' }} />
                        <p style={{
                            fontSize: 16, fontWeight: 800, color: W.textPrimary,
                            lineHeight: 1.7, position: 'relative', zIndex: 1,
                        }}>
                            {currentQuestion.text}
                        </p>
                        {currentQuestion.hint && (
                            <p style={{
                                fontSize: 11, fontWeight: 500, color: W.textMuted,
                                marginTop: 8, lineHeight: 1.6, position: 'relative', zIndex: 1,
                            }}>
                                {currentQuestion.hint}
                            </p>
                        )}
                    </motion.div>

                    {/* Options (single select) */}
                    {currentQuestion.type === 'single' && currentQuestion.options && (
                        <div className="space-y-2.5">
                            {currentQuestion.options.map((opt, i) => {
                                const isSelected = (phase === 'gate' ? gateAnswers : deepAnswers)[currentQuestion!.id] === opt.id;
                                return (
                                    <motion.button
                                        key={opt.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleOptionSelect(currentQuestion!.id, opt.id)}
                                        className="w-full rounded-[20px] px-5 py-4 flex items-center gap-3.5 text-right"
                                        style={{
                                            background: isSelected
                                                ? 'linear-gradient(145deg, rgba(5,150,105,0.12), rgba(34,211,153,0.08))'
                                                : W.glass,
                                            border: `1.5px solid ${isSelected ? W.greenBorder : W.glassBorder}`,
                                            boxShadow: isSelected
                                                ? '0 4px 16px rgba(5,150,105,0.12)'
                                                : '0 2px 8px rgba(0,0,0,0.02)',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {opt.emoji && <span style={{ fontSize: 20 }}>{opt.emoji}</span>}
                                        <span style={{
                                            fontSize: 14, fontWeight: 700,
                                            color: isSelected ? W.green : W.textSub,
                                            flex: 1,
                                        }}>
                                            {opt.label}
                                        </span>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                style={{
                                                    width: 22, height: 22, borderRadius: '50%',
                                                    background: W.greenLight,
                                                    border: `1.5px solid ${W.greenBorder}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >
                                                <Check style={{ width: 12, height: 12, color: W.green }} />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}

                    {/* Text input */}
                    {currentQuestion.type === 'text' && (
                        <div className="space-y-3">
                            <textarea
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                                placeholder={currentQuestion.hint || 'اكتب هنا...'}
                                rows={3}
                                className="w-full rounded-[18px] p-4 resize-none"
                                style={{
                                    background: W.glass,
                                    border: `1.5px solid ${W.glassBorder}`,
                                    fontSize: 14, fontWeight: 600, color: W.textPrimary,
                                    outline: 'none', direction: 'rtl',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                }}
                            />
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleTextSubmit}
                                disabled={!textInput.trim()}
                                className="w-full rounded-[20px] py-4 flex items-center justify-center gap-2"
                                style={{
                                    background: textInput.trim()
                                        ? 'linear-gradient(145deg, rgba(5,150,105,0.15), rgba(34,211,153,0.10))'
                                        : 'rgba(200,200,200,0.15)',
                                    border: `1.5px solid ${textInput.trim() ? W.greenBorder : 'rgba(200,200,200,0.3)'}`,
                                    opacity: textInput.trim() ? 1 : 0.5,
                                }}
                            >
                                <span style={{ fontSize: 14, fontWeight: 800, color: textInput.trim() ? W.green : W.textMuted }}>
                                    التالي
                                </span>
                                <ChevronLeft style={{ width: 16, height: 16, color: textInput.trim() ? W.green : W.textMuted }} />
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Phase indicator */}
            <div className="mt-6 flex items-center justify-center gap-2">
                <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: phase === 'gate' ? W.green : 'rgba(8,145,178,0.15)',
                }} />
                <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: phase === 'deep' ? W.green : 'rgba(8,145,178,0.15)',
                }} />
            </div>
        </div>
    );
}
