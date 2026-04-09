// pages/symptom-checker.tsx
// THIE — Tibrah Health Intelligence Engine — Main Orchestrator
// Unified, world-class health assessment replacing all scattered systems

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { haptic } from '@/lib/HapticFeedback';

// Engine layers
import { CosmicBackground } from '@/components/health-engine/ui/CosmicBackground';
import { EngineHeader } from '@/components/health-engine/ui/EngineHeader';
import { StepWelcome } from '@/components/health-engine/steps/StepWelcome';
import { StepPathway } from '@/components/health-engine/steps/StepPathway';
import { StepRedFlags } from '@/components/health-engine/steps/StepRedFlags';
import { StepClinical } from '@/components/health-engine/steps/StepClinical';
import { StepEmotional } from '@/components/health-engine/steps/StepEmotional';
import { StepAnalyzing } from '@/components/health-engine/steps/StepAnalyzing';
import { StepResult } from '@/components/health-engine/steps/StepResult';

import { DEFAULT_ANSWERS, PATHWAYS } from '@/components/health-engine/constants';
import type { StepId, EngineAnswers, RedFlag, AnswerValue } from '@/components/health-engine/types';

/* ── Step order for back navigation ── */
const STEP_ORDER: StepId[] = ['welcome', 'pathway', 'redflags', 'clinical', 'emotional', 'analyzing', 'result'];

/* ── Slide variants ── */
const variants = {
    enter: { opacity: 0, x: -24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 24 },
};

export default function SymptomCheckerPage() {
    const router = useRouter();
    const [step, setStep] = useState<StepId>('welcome');
    const [answers, setAnswers] = useState<EngineAnswers>(DEFAULT_ANSWERS);
    const [direction, setDirection] = useState(1);

    // Load draft from localStorage
    useEffect(() => {
        try {
            const draft = localStorage.getItem('thie_draft');
            if (draft) {
                const parsed = JSON.parse(draft) as EngineAnswers;
                setAnswers(parsed);
                if (parsed.pathwayId) setStep('pathway');
            }
        } catch { }
    }, []);

    // Save draft
    useEffect(() => {
        if (step !== 'welcome' && step !== 'analyzing' && step !== 'result') {
            try {
                localStorage.setItem('thie_draft', JSON.stringify(answers));
            } catch { }
        }
    }, [answers, step]);

    /* ── Navigation helpers ── */
    const goTo = useCallback((s: StepId, dir = 1) => {
        setDirection(dir);
        haptic.selection();
        setStep(s);
    }, []);

    const goBack = useCallback(() => {
        const idx = STEP_ORDER.indexOf(step);
        if (idx > 0) goTo(STEP_ORDER[idx - 1], -1);
        else router.back();
    }, [step, goTo, router]);

    const canGoBack = step !== 'welcome' && step !== 'analyzing' && step !== 'result';

    /* ── Answer updaters ── */
    const setPathway = (id: string) => setAnswers(a => ({ ...a, pathwayId: id }));

    const toggleFlag = (_id: string, flag: RedFlag) => {
        setAnswers(a => {
            const newFlags = a.redFlags.includes(flag.id)
                ? a.redFlags.filter(f => f !== flag.id)
                : [...a.redFlags, flag.id];

            const isEmergency = flag.level === 'emergency' && !a.redFlags.includes(flag.id);
            return {
                ...a,
                redFlags: newFlags,
                hasEmergencyFlag: isEmergency || a.hasEmergencyFlag,
                emergencyMessage: isEmergency ? flag.actionMessage : a.emergencyMessage,
            };
        });
    };

    const clearEmergency = () => setAnswers(a => ({
        ...a, hasEmergencyFlag: false, emergencyMessage: '', redFlags: [],
    }));

    const setAnswer = (qId: string, value: AnswerValue) =>
        setAnswers(a => ({ ...a, clinicalAnswers: { ...a.clinicalAnswers, [qId]: value } }));

    const toggleEmotional = (id: string) => {
        setAnswers(a => {
            if (id === 'none') return { ...a, emotionalContext: ['none'] };
            const without = a.emotionalContext.filter(x => x !== 'none');
            const next = without.includes(id) ? without.filter(x => x !== id) : [...without, id];
            return { ...a, emotionalContext: next };
        });
    };

    /* ── Submit → analyzing → result ── */
    const handleSubmit = async () => {
        goTo('analyzing');
        // Analysis screens runs its own timer (≈4 sec)
        await new Promise(r => setTimeout(r, 4200));
        // Clear draft
        try { localStorage.removeItem('thie_draft'); } catch { }
        goTo('result');
    };

    /* ── Red flags auto-skip ── */
    const handleRedFlagsNext = () => {
        const pathway = PATHWAYS.find(p => p.id === answers.pathwayId);
        if (!pathway || pathway.redFlags.length === 0 || answers.hasEmergencyFlag) {
            goTo('clinical');
            return;
        }
        goTo('clinical');
    };

    const restart = () => {
        setAnswers(DEFAULT_ANSWERS);
        try { localStorage.removeItem('thie_draft'); } catch { }
        goTo('welcome');
    };

    return (
        <div className="min-h-screen overflow-hidden relative" dir="rtl"
            style={{ background: '#020617', paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <Head>
                <title>مدقق الأعراض — طِبرَا</title>
                <meta name="description" content="تحليل سريري ذكي يجمع الطب الوظيفي مع السياق العاطفي" />
            </Head>

            {/* Cosmic ambiance */}
            <CosmicBackground />

            {/* Header (visible on most steps) */}
            {step !== 'welcome' && (
                <EngineHeader step={step} onBack={goBack} canGoBack={canGoBack} />
            )}

            {/* ── Step Renderer ── */}
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={step}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="relative z-10 min-h-screen">

                    {step === 'welcome' && (
                        <StepWelcome onStart={() => goTo('pathway')} />
                    )}

                    {step === 'pathway' && (
                        <StepPathway
                            selectedId={answers.pathwayId}
                            onSelect={setPathway}
                            onNext={() => goTo('redflags')}
                        />
                    )}

                    {step === 'redflags' && (
                        <StepRedFlags
                            pathwayId={answers.pathwayId}
                            selectedFlags={answers.redFlags}
                            onToggleFlag={toggleFlag}
                            emergencyMessage={answers.emergencyMessage}
                            onClearEmergency={clearEmergency}
                            onNext={handleRedFlagsNext}
                        />
                    )}

                    {step === 'clinical' && (
                        <StepClinical
                            pathwayId={answers.pathwayId}
                            severity={answers.severity}
                            duration={answers.duration}
                            clinicalAnswers={answers.clinicalAnswers}
                            onSeverity={v => setAnswers(a => ({ ...a, severity: v }))}
                            onDuration={v => setAnswers(a => ({ ...a, duration: v }))}
                            onAnswer={setAnswer}
                            onNext={() => goTo('emotional')}
                        />
                    )}

                    {step === 'emotional' && (
                        <StepEmotional
                            selected={answers.emotionalContext}
                            note={answers.emotionalNote}
                            onToggle={toggleEmotional}
                            onNote={v => setAnswers(a => ({ ...a, emotionalNote: v }))}
                            onSubmit={handleSubmit}
                        />
                    )}

                    {step === 'analyzing' && (
                        <StepAnalyzing />
                    )}

                    {step === 'result' && (
                        <StepResult answers={answers} onRestart={restart} />
                    )}

                </motion.div>
            </AnimatePresence>
        </div>
    );
}
