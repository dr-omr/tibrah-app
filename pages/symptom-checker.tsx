// pages/symptom-checker.tsx
// THIE v5 — Orchestrator — No red flags step (clinic, not emergency)

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { haptic } from '@/lib/HapticFeedback';
import { restoreSessionForEdit, clearEditingState } from '@/lib/assessment-session-store';
import { trackEvent } from '@/lib/analytics';

import { EngineHeader } from '@/components/health-engine/ui/EngineHeader';
import { AssessmentGlassShell } from '@/components/health-engine/assessment/AssessmentGlassShell';
import { StepWelcome } from '@/components/health-engine/steps/StepWelcome';
import { StepPathway } from '@/components/health-engine/steps/StepPathway';
import { StepClinical } from '@/components/health-engine/steps/StepClinical';
import { StepEmotional } from '@/components/health-engine/steps/StepEmotional';
import { StepAnalyzing } from '@/components/health-engine/steps/StepAnalyzing';
import { StepResult } from '@/components/health-engine/steps/StepResult';

import { TayyibatAssessmentCard } from '@/components/nutrition/TayyibatAssessmentCard';

import { DEFAULT_ANSWERS } from '@/components/health-engine/constants';
import type { StepId, EngineAnswers, AnswerValue } from '@/components/health-engine/types';
import { buildAdaptiveQuestionPlan } from '@/lib/health-engine/adaptive-question-orchestrator';


// ✅ Red flags step REMOVED — this is a clinic, not emergency services
// ✅ Nutrition step (Tayyibat) added between emotional and analyzing
const STEP_ORDER: StepId[] = ['welcome', 'pathway', 'clinical', 'emotional', 'nutrition', 'analyzing', 'result'];

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
    const [editSessionId, setEditSessionId] = useState<string | null>(null);

    // Build adaptive plan whenever clinical answers change
    const adaptivePlan = buildAdaptiveQuestionPlan({
        pathwayId:        answers.pathwayId,
        severity:         answers.severity,
        duration:         answers.duration,
        existingAnswers:  answers.clinicalAnswers,
        clinicalAnswers:  answers.clinicalAnswers,
        hasRedFlagSignal: answers.hasEmergencyFlag || answers.redFlags.length > 0,
    });

    // The nutrition step is shown only when the orchestrator says so
    const showNutritionStep = adaptivePlan.decisions.find(d => d.stage === 'nutrition_tayyibat')?.shouldShow ?? false;

    // Check for edit mode via query parameter
    useEffect(() => {
        if (!router.isReady) return;
        const editId = router.query.edit as string | undefined;
        if (editId) {
            const restored = restoreSessionForEdit(editId);
            if (restored) {
                setAnswers(restored);
                setEditSessionId(editId);
                setStep('pathway');
                trackEvent('re_assessment_started', {
                    session_id: editId,
                    from: 'edit_mode',
                });
            }
        }
    }, [router.isReady, router.query.edit]);

    useEffect(() => {
        if (editSessionId) return; // Don't restore draft if in edit mode
        try {
            const d = localStorage.getItem('thie_draft');
            if (d) { const p = JSON.parse(d) as EngineAnswers; setAnswers(p); if (p.pathwayId) setStep('pathway'); }
        } catch { }
    }, [editSessionId]);

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
        // Attach adaptive plan snapshot to answers before saving
        const snapshot = adaptivePlan.snapshot;
        setAnswers(a => ({
            ...a,
            adaptiveQuestionPlanSnapshot: {
                ...snapshot,
                reasons:        adaptivePlan.reasons,
                triageRiskHint: adaptivePlan.triageRiskHint,
            },
        }));
        // Track adaptive plan analytics once
        trackEvent('adaptive_question_plan_built', {
            pathway:            answers.pathwayId,
            nutrition_shown:    String(snapshot.nutritionShown),
            safety_prioritized: String(snapshot.safetyPrioritized),
            deep_intake_shown:  String(snapshot.deepIntakeShown),
            burden_minimized:   String(snapshot.burdenMinimized),
            triage_hint:        adaptivePlan.triageRiskHint,
        });
        if (!snapshot.nutritionShown) {
            trackEvent('adaptive_section_skipped', {
                stage:   'nutrition_tayyibat',
                pathway: answers.pathwayId,
                reason:  snapshot.foodSignalFound ? 'emergency_triage' : 'no_food_signal',
            });
        }
        goTo('analyzing');
        await new Promise(r => setTimeout(r, 4600));
        try { localStorage.removeItem('thie_draft'); } catch { }
        goTo('result');
    };

    const handleNutritionComplete = (nutritionData: {
        gateAnswers: Record<string, string>;
        deepAnswers: Record<string, string>;
        deepTriggered: boolean;
    }) => {
        setAnswers(a => ({ ...a, nutritionAnswers: nutritionData }));
        handleSubmit();
    };

    const restart = () => {
        setAnswers(DEFAULT_ANSWERS);
        setEditSessionId(null);
        try { localStorage.removeItem('thie_draft'); } catch { }
        // Clear edit query parameter if present
        if (router.query.edit) {
            router.replace('/symptom-checker', undefined, { shallow: true });
        }
        goTo('welcome');
    };

    // Build adaptive message for current step
    const adaptiveMessage: string | null = (() => {
        if (step === 'nutrition' && adaptivePlan.snapshot.foodSignalFound)
            return 'أظهرنا أسئلة الغذاء لأن إجاباتك تشير إلى علاقة محتملة بالغذاء أو الإيقاع.';
        if (step === 'nutrition' && adaptivePlan.snapshot.safetyPrioritized)
            return 'اختصرنا الأسئلة لأن إجاباتك تحتاج توجيه سلامة أولاً.';
        if (step === 'clinical' && adaptivePlan.snapshot.deepIntakeShown)
            return 'أضفنا هذه الأسئلة بناءً على المسار الذي اخترته.';
        return null;
    })();

    const canGoBack = !['welcome', 'analyzing', 'result'].includes(step);

    return (
        <>
            <Head>
                <title>تقييم صحتك — طِبرَا</title>
                <meta name="description" content="قراءة أولية تربط الأعراض والشدة والسياق — بإشراف طبي" />
                <meta name="theme-color" content="#E8F8FB" />
            </Head>

            <AssessmentGlassShell
                stepId={step}
                nutritionShown={showNutritionStep}
                onBack={canGoBack ? goBack : undefined}
                adaptiveMessage={adaptiveMessage}
            >
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={pageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={pageTransition}
                        className="flex-1"
                    >
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
                            onSubmit={() => goTo('nutrition')} />}
                        {step === 'nutrition' && showNutritionStep && (
                            <TayyibatAssessmentCard
                                pathwayId={answers.pathwayId}
                                clinicalAnswers={answers.clinicalAnswers}
                                onComplete={handleNutritionComplete} />
                        )}
                        {step === 'nutrition' && !showNutritionStep && (
                            <>{(() => { handleSubmit(); return null; })()}</>
                        )}
                        {step === 'analyzing' && <StepAnalyzing />}
                        {step === 'result'    && <StepResult answers={answers} onRestart={restart} />}
                    </motion.div>
                </AnimatePresence>
            </AssessmentGlassShell>
        </>
    );
}
