// pages/symptom-checker.tsx
// THIE v5 — Orchestrator — No red flags step (clinic, not emergency)

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { haptic } from '@/lib/HapticFeedback';

import { EngineHeader } from '@/components/health-engine/ui/EngineHeader';
import { StepWelcome } from '@/components/health-engine/steps/StepWelcome';
import { StepPathway } from '@/components/health-engine/steps/StepPathway';
import { StepClinical } from '@/components/health-engine/steps/StepClinical';
import { StepEmotional } from '@/components/health-engine/steps/StepEmotional';
import { StepAnalyzing } from '@/components/health-engine/steps/StepAnalyzing';
import { StepResult } from '@/components/health-engine/steps/StepResult';

import { DEFAULT_ANSWERS } from '@/components/health-engine/constants';
import type { StepId, EngineAnswers, AnswerValue } from '@/components/health-engine/types';

// ✅ Red flags step REMOVED — this is a clinic, not emergency services
const STEP_ORDER: StepId[] = ['welcome', 'pathway', 'clinical', 'emotional', 'analyzing', 'result'];

// Apple HIG page transition — positional spring
const pageVariants = {
    enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
};
const pageTransition = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number] };

export default function SymptomCheckerPage() {
    const router = useRouter();
    const [step, setStep]       = useState<StepId>('welcome');
    const [answers, setAnswers] = useState<EngineAnswers>(DEFAULT_ANSWERS);
    const [direction, setDir]   = useState(1);

    useEffect(() => {
        try {
            const d = localStorage.getItem('thie_draft');
            if (d) { const p = JSON.parse(d) as EngineAnswers; setAnswers(p); if (p.pathwayId) setStep('pathway'); }
        } catch { }
    }, []);

    useEffect(() => {
        if (!['welcome', 'analyzing', 'result'].includes(step)) {
            try { localStorage.setItem('thie_draft', JSON.stringify(answers)); } catch { }
        }
    }, [answers, step]);

    const goTo = useCallback((s: StepId, dir = 1) => {
        setDir(dir); haptic.selection(); setStep(s);
    }, []);

    const goBack = useCallback(() => {
        const idx = STEP_ORDER.indexOf(step);
        if (idx > 0) goTo(STEP_ORDER[idx - 1], -1); else router.back();
    }, [step, goTo, router]);

    const setAnswer     = (qId: string, v: AnswerValue) => setAnswers(a => ({ ...a, clinicalAnswers: { ...a.clinicalAnswers, [qId]: v } }));
    const toggleEmot    = (id: string) => setAnswers(a => {
        if (id === 'none') return { ...a, emotionalContext: ['none'] };
        const w = a.emotionalContext.filter(x => x !== 'none');
        return { ...a, emotionalContext: w.includes(id) ? w.filter(x => x !== id) : [...w, id] };
    });

    const handleSubmit = async () => {
        goTo('analyzing');
        await new Promise(r => setTimeout(r, 4600));
        try { localStorage.removeItem('thie_draft'); } catch { }
        goTo('result');
    };

    const restart = () => {
        setAnswers(DEFAULT_ANSWERS);
        try { localStorage.removeItem('thie_draft'); } catch { }
        goTo('welcome');
    };

    const canGoBack = !['welcome', 'analyzing', 'result'].includes(step);

    return (
        <div className="thie-page" dir="rtl" style={{ background: '#F2F5F7', minHeight: '100svh', overflow: 'hidden' }}>
            <Head>
                <title>تقييم صحتك — طِبرَا</title>
                <meta name="description" content="تحليل سريري متكامل بثلاثة أبعاد" />
                <meta name="theme-color" content="#F2F5F7" />
            </Head>

            {step !== 'welcome' && (
                <EngineHeader step={step} onBack={goBack} canGoBack={canGoBack} />
            )}

            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={step}
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={pageTransition}
                    className="thie-content relative z-10">

                    {step === 'welcome'   && <StepWelcome onStart={() => goTo('pathway')} />}
                    {step === 'pathway'   && <StepPathway selectedId={answers.pathwayId}
                        onSelect={id => setAnswers(a => ({ ...a, pathwayId: id }))}
                        onNext={() => goTo('clinical')} />}
                    {step === 'clinical'  && <StepClinical
                        pathwayId={answers.pathwayId} severity={answers.severity}
                        duration={answers.duration} clinicalAnswers={answers.clinicalAnswers}
                        onSeverity={v => setAnswers(a => ({ ...a, severity: v }))}
                        onDuration={v => setAnswers(a => ({ ...a, duration: v }))}
                        onAnswer={setAnswer} onNext={() => goTo('emotional')} />}
                    {step === 'emotional' && <StepEmotional
                        selected={answers.emotionalContext} note={answers.emotionalNote}
                        onToggle={toggleEmot}
                        onNote={v => setAnswers(a => ({ ...a, emotionalNote: v }))}
                        onSubmit={handleSubmit} />}
                    {step === 'analyzing' && <StepAnalyzing />}
                    {step === 'result'    && <StepResult answers={answers} onRestart={restart} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
