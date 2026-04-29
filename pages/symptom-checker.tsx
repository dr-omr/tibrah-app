// pages/symptom-checker.tsx
// Tibrah assessment orchestrator — one deterministic clinical care map

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { haptic } from '@/lib/HapticFeedback';
import { restoreSessionForEdit } from '@/lib/assessment-session-store';
import { trackEvent } from '@/lib/analytics';

import { AssessmentGlassShell } from '@/components/health-engine/assessment/AssessmentGlassShell';
import { StepWelcome } from '@/components/health-engine/steps/StepWelcome';
import { StepPathway } from '@/components/health-engine/steps/StepPathway';
import { StepPersonalHistory } from '@/components/health-engine/steps/StepPersonalHistory';
import { StepChiefComplaint } from '@/components/health-engine/steps/StepChiefComplaint';
import { StepHopi } from '@/components/health-engine/steps/StepHopi';
import { StepRedFlags } from '@/components/health-engine/steps/StepRedFlags';
import { StepClinical } from '@/components/health-engine/steps/StepClinical';
import { StepRelatedSymptoms } from '@/components/health-engine/steps/StepRelatedSymptoms';
import { StepLifestyleContext } from '@/components/health-engine/steps/StepLifestyleContext';
import { StepEmotional } from '@/components/health-engine/steps/StepEmotional';
import { StepReview } from '@/components/health-engine/steps/StepReview';
import { StepAnalyzing } from '@/components/health-engine/steps/StepAnalyzing';
import { StepResult } from '@/components/health-engine/steps/StepResult';

import { TayyibatAssessmentCard } from '@/components/nutrition/TayyibatAssessmentCard';

import { DEFAULT_ANSWERS, PATHWAYS } from '@/components/health-engine/constants';
import type { StepId, EngineAnswers, AnswerValue, RedFlag, ChiefComplaintAnswers, HopiAnswers } from '@/components/health-engine/types';
import { buildAdaptiveQuestionPlan } from '@/lib/health-engine/adaptive-question-orchestrator';
import { buildAssessmentReviewSnapshot, GENERAL_UNCERTAIN_PATHWAY_ID, getAssessmentDirectorState } from '@/lib/assessment/assessment-director';


// Visible care-map sequence: background, main complaint, HOPI, safety, context, review, result.
const STEP_ORDER: StepId[] = ['welcome', 'personalHistory', 'chiefComplaint', 'hopi', 'redflags', 'relatedSymptoms', 'lifestyle', 'emotional', 'nutrition', 'review', 'analyzing', 'result'];

function visibleStepOrder(nutritionShown: boolean, emotionalShown: boolean): StepId[] {
    return STEP_ORDER.filter(step => {
        if (step === 'nutrition') return nutritionShown;
        if (step === 'emotional') return emotionalShown;
        return true;
    });
}

// Apple HIG page transition — positional spring
const pageVariants = {
    enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
};
const pageTransition = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number] };

function buildFinalAnswersWithSnapshot(base: EngineAnswers): EngineAnswers {
    const directorState = getAssessmentDirectorState(base, 'review');
    const plan = buildAdaptiveQuestionPlan({
        pathwayId:        base.pathwayId,
        severity:         base.severity,
        duration:         base.duration,
        existingAnswers:  base.clinicalAnswers,
        clinicalAnswers:  base.clinicalAnswers,
        hasRedFlagSignal: base.hasEmergencyFlag || base.redFlags.length > 0,
    });

    return {
        ...base,
        assessmentFlowSnapshot: base.assessmentFlowSnapshot ?? directorState.flowSnapshot,
        assessmentReviewSnapshot: base.assessmentReviewSnapshot ?? buildAssessmentReviewSnapshot({
            ...base,
            assessmentFlowSnapshot: directorState.flowSnapshot,
        }),
        adaptiveQuestionPlanSnapshot: {
            ...plan.snapshot,
            nutritionShown: directorState.shouldShowNutritionLayer,
            safetyPrioritized: directorState.shouldMinimizeBurden,
            deepIntakeShown: directorState.shouldShowDeepQuestions,
            burdenMinimized: directorState.shouldMinimizeBurden,
            reasons:        directorState.flowSnapshot.adaptiveTriggers.length
                ? directorState.flowSnapshot.adaptiveTriggers.map(item => `${item.trigger}: ${item.caused}`)
                : plan.reasons,
            triageRiskHint: plan.triageRiskHint,
        },
    };
}

function createInitialAnswers(): EngineAnswers {
    return JSON.parse(JSON.stringify(DEFAULT_ANSWERS)) as EngineAnswers;
}

export default function SymptomCheckerPage() {
    const router = useRouter();
    const [step, setStep]       = useState<StepId>('welcome');
    const [answers, setAnswers] = useState<EngineAnswers>(() => createInitialAnswers());
    const [finalAnswers, setFinalAnswers] = useState<EngineAnswers | null>(null);
    const [direction, setDir]   = useState(1);
    const [editSessionId, setEditSessionId] = useState<string | null>(null);
    const [pathwayChangeNotice, setPathwayChangeNotice] = useState<string | null>(null);
    const submitStartedRef = useRef(false);

    const directorState = getAssessmentDirectorState(answers, step);
    const showNutritionStep = directorState.shouldShowNutritionLayer;
    const showEmotionalStep = directorState.shouldShowEmotionalLayer;

    // Check for edit mode via query parameter
    useEffect(() => {
        if (!router.isReady) return;
        const editId = router.query.edit as string | undefined;
        if (editId) {
            const restored = restoreSessionForEdit(editId);
            if (restored) {
                setAnswers(restored);
                setEditSessionId(editId);
                setStep(restored.chiefComplaint?.complaint ? 'hopi' : 'chiefComplaint');
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
            if (d) { const p = JSON.parse(d) as EngineAnswers; setAnswers(p); if (p.chiefComplaint?.complaint || p.pathwayId) setStep(p.chiefComplaint?.complaint ? 'hopi' : 'chiefComplaint'); }
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
        const steps = visibleStepOrder(showNutritionStep, showEmotionalStep);
        const idx = steps.indexOf(step);
        if (idx > 0) goTo(steps[idx - 1], -1); else router.back();
    }, [step, goTo, router, showNutritionStep, showEmotionalStep]);

    const setAnswer     = (qId: string, v: AnswerValue) => {
        setPathwayChangeNotice(null);
        setAnswers(a => ({ ...a, clinicalAnswers: { ...a.clinicalAnswers, [qId]: v } }));
    };

    const handleChiefComplaintChange = useCallback((chiefComplaint: ChiefComplaintAnswers, pathwayId: string) => {
        const userUnsure = chiefComplaint.complaint === 'not_sure' || pathwayId === GENERAL_UNCERTAIN_PATHWAY_ID;
        setPathwayChangeNotice(userUnsure
            ? 'بدأنا من مسار عام لأنك مش متأكد من التصنيف.'
            : 'حدّثنا الأسئلة التالية حسب العرض اللي اخترته.');
        setAnswers(a => {
            const pathwayChanged = a.pathwayId !== pathwayId;
            return {
                ...a,
                pathwayId,
                chiefComplaint,
                redFlags: pathwayChanged ? [] : a.redFlags,
                hasEmergencyFlag: pathwayChanged ? false : a.hasEmergencyFlag,
                emergencyMessage: pathwayChanged ? '' : a.emergencyMessage,
                clinicalAnswers: {
                    ...a.clinicalAnswers,
                    chief_complaint: chiefComplaint.complaintLabel,
                    chief_complaint_id: chiefComplaint.complaint,
                    chief_system: chiefComplaint.systemLabel,
                    chief_system_id: chiefComplaint.system,
                    secondary_complaints: chiefComplaint.secondaryComplaints,
                    assessment_pathway_uncertain: userUnsure ? 'yes' : 'no',
                },
                nutritionAnswers: undefined,
                adaptiveQuestionPlanSnapshot: undefined,
                assessmentFlowSnapshot: undefined,
                assessmentReviewSnapshot: undefined,
            };
        });
    }, []);

    const handleHopiChange = useCallback((hopi: HopiAnswers) => {
        setPathwayChangeNotice(null);
        setAnswers(a => ({
            ...a,
            hopi,
            duration: hopi.onset || a.duration,
            severity: typeof hopi.severity === 'number' ? hopi.severity : a.severity,
            clinicalAnswers: {
                ...a.clinicalAnswers,
                hopi_onset: hopi.onset ?? '',
                hopi_course: hopi.course ?? '',
                hopi_location: hopi.location ?? '',
                hopi_character: hopi.character ?? '',
                hopi_radiation: hopi.radiation ?? '',
                hopi_aggravating: hopi.aggravating,
                hopi_relieving: hopi.relieving,
                hopi_functional_impact: hopi.functionalImpact ?? '',
            },
            adaptiveQuestionPlanSnapshot: undefined,
            assessmentFlowSnapshot: undefined,
            assessmentReviewSnapshot: undefined,
        }));
    }, []);

    const handleLifestyleChange = useCallback((lifestyleContext: Record<string, string | string[]>) => {
        setAnswers(a => ({
            ...a,
            lifestyleContext,
            clinicalAnswers: {
                ...a.clinicalAnswers,
                lifestyle_sleep: lifestyleContext.sleep ?? '',
                lifestyle_stress: lifestyleContext.stress ?? '',
                lifestyle_food: lifestyleContext.food ?? '',
                lifestyle_caffeine: lifestyleContext.caffeine ?? '',
                lifestyle_water: lifestyleContext.water ?? '',
                lifestyle_movement: lifestyleContext.movement ?? '',
            },
            adaptiveQuestionPlanSnapshot: undefined,
            assessmentFlowSnapshot: undefined,
            assessmentReviewSnapshot: undefined,
        }));
    }, []);
    const toggleRedFlag = (flagId: string, flag: RedFlag) => setAnswers(a => {
        const selected = a.redFlags.includes(flagId);
        const nextFlags = selected
            ? a.redFlags.filter(id => id !== flagId)
            : [...a.redFlags, flagId];
        const pathway = PATHWAYS.find(p => p.id === a.pathwayId);
        const selectedFlagObjects = nextFlags
            .map(id => pathway?.redFlags.find(f => f.id === id))
            .filter((f): f is RedFlag => Boolean(f));
        const emergencyFlag = selectedFlagObjects.find(f => f.level === 'emergency');

        return {
            ...a,
            redFlags: nextFlags,
            hasEmergencyFlag: Boolean(emergencyFlag),
            emergencyMessage: emergencyFlag?.actionMessage ?? '',
        };
    });
    const clearEmergencySelection = () => setAnswers(a => {
        const pathway = PATHWAYS.find(p => p.id === a.pathwayId);
        const nonEmergencyFlags = a.redFlags.filter(id =>
            pathway?.redFlags.find(f => f.id === id)?.level !== 'emergency'
        );
        return {
            ...a,
            redFlags: nonEmergencyFlags,
            hasEmergencyFlag: false,
            emergencyMessage: '',
        };
    });
    const clearAllRedFlags = useCallback(() => {
        setAnswers(a => ({
            ...a,
            redFlags: [],
            hasEmergencyFlag: false,
            emergencyMessage: '',
        }));
    }, []);
    const toggleEmot    = (id: string) => setAnswers(a => {
        if (id === 'none') return { ...a, emotionalContext: ['none'] };
        const w = a.emotionalContext.filter(x => x !== 'none');
        return { ...a, emotionalContext: w.includes(id) ? w.filter(x => x !== id) : [...w, id] };
    });

    const handleSubmit = useCallback(async (candidateAnswers?: EngineAnswers) => {
        if (submitStartedRef.current) return;
        submitStartedRef.current = true;

        const finalizedAnswers = buildFinalAnswersWithSnapshot(candidateAnswers ?? answers);
        const snapshot = finalizedAnswers.adaptiveQuestionPlanSnapshot!;
        setFinalAnswers(finalizedAnswers);
        setAnswers(finalizedAnswers);

        // Track adaptive plan analytics once
        trackEvent('adaptive_question_plan_built', {
            pathway:            finalizedAnswers.pathwayId,
            nutrition_shown:    String(snapshot.nutritionShown),
            safety_prioritized: String(snapshot.safetyPrioritized),
            deep_intake_shown:  String(snapshot.deepIntakeShown),
            burden_minimized:   String(snapshot.burdenMinimized),
            triage_hint:        snapshot.triageRiskHint,
        });
        if (!snapshot.nutritionShown) {
            trackEvent('adaptive_section_skipped', {
                stage:   'nutrition_tayyibat',
                pathway: finalizedAnswers.pathwayId,
                reason:  snapshot.foodSignalFound ? 'emergency_triage' : 'no_food_signal',
            });
        }
        goTo('analyzing');
        await new Promise(r => setTimeout(r, 4600));
        try { localStorage.removeItem('thie_draft'); } catch { }
        goTo('result');
    }, [answers, goTo]);

    const handleNutritionComplete = (nutritionData: {
        gateAnswers: Record<string, string>;
        deepAnswers: Record<string, string>;
        deepTriggered: boolean;
    }) => {
        const answersWithNutrition = { ...answers, nutritionAnswers: nutritionData };
        setAnswers(answersWithNutrition);
        goTo('review');
    };

    const handleEmotionalSubmit = useCallback(() => {
        if (showNutritionStep) {
            goTo('nutrition');
            return;
        }
        setAnswers(a => ({ ...a, nutritionAnswers: undefined }));
        goTo('review');
    }, [goTo, showNutritionStep]);

    const handleLifestyleNext = useCallback(() => {
        if (showEmotionalStep) {
            goTo('emotional');
            return;
        }
        if (showNutritionStep) {
            goTo('nutrition');
            return;
        }
        setAnswers(a => ({ ...a, nutritionAnswers: undefined }));
        goTo('review');
    }, [goTo, showEmotionalStep, showNutritionStep]);

    const handleClinicalNext = handleLifestyleNext;

    useEffect(() => {
        if (step === 'nutrition' && !showNutritionStep) {
            setAnswers(a => ({ ...a, nutritionAnswers: undefined }));
            goTo('review');
        }
    }, [goTo, step, showNutritionStep]);

    useEffect(() => {
        if (step === 'emotional' && !showEmotionalStep) {
            if (showNutritionStep) goTo('nutrition');
            else goTo('review');
        }
    }, [goTo, step, showEmotionalStep, showNutritionStep]);

    const restart = () => {
        submitStartedRef.current = false;
        setFinalAnswers(null);
        setAnswers(createInitialAnswers());
        setEditSessionId(null);
        try { localStorage.removeItem('thie_draft'); } catch { }
        // Clear edit query parameter if present
        if (router.query.edit) {
            router.replace('/symptom-checker', undefined, { shallow: true });
        }
        goTo('welcome');
    };

    const adaptivePlan = {
        snapshot: {
            foodSignalFound: directorState.flowSnapshot.adaptiveTriggers.some(item => item.trigger.includes('غذاء') || item.trigger.includes('هضم') || item.caused.includes('الغذاء')),
            safetyPrioritized: directorState.shouldMinimizeBurden,
            deepIntakeShown: directorState.shouldShowDeepQuestions,
        },
        reasons: directorState.flowSnapshot.adaptiveTriggers.map(item => item.trigger),
    };

    // Build adaptive message for current step
    const adaptiveMessage: string | null = (() => {
        if (pathwayChangeNotice) return pathwayChangeNotice;
        const firstTrigger = directorState.flowSnapshot.adaptiveTriggers[0];
        if ((step === 'clinical' || step === 'nutrition') && firstTrigger)
            return `أضفنا أو عدّلنا هذا الجزء لأن: ${firstTrigger.trigger}. ${firstTrigger.caused}`;
        if (step === 'nutrition' && adaptivePlan.snapshot.foodSignalFound)
            return 'أضفنا هذه الأسئلة لأن إجاباتك تشير إلى احتمال ارتباط الأعراض بالغذاء أو النوم أو الضغط.';
        if (step === 'nutrition' && adaptivePlan.snapshot.safetyPrioritized)
            return 'اختصرنا الأسئلة لأن إجاباتك تحتاج توجيه سلامة أولاً.';
        if (step === 'clinical' && adaptivePlan.snapshot.deepIntakeShown)
            return `أضفنا هذه الأسئلة لأنك ذكرت: ${adaptivePlan.reasons.slice(0, 2).join('، ') || 'إشارات تحتاج تفصيلاً أكثر'}.`;
        if (step === 'review' && directorState.missingImportantData.length > 0)
            return 'تمام، سنبقي الدقة مبدئية ونقترح ما يمكن إضافته لاحقاً.';
        return null;
    })();

    const canGoBack = !['welcome', 'analyzing', 'result'].includes(step);

    return (
        <>
            <Head>
                <title>تقييم حالتك — طِبرا</title>
                <meta name="description" content="تقييم صحي ذكي يرتب الأعراض، الشدة، المدة، الروتين، والأكل في ملخص واضح وخطوة عملية." />
                <meta name="theme-color" content="#F8FDFF" />
            </Head>

            <AssessmentGlassShell
                stepId={step}
                nutritionShown={showNutritionStep}
                emotionalShown={showEmotionalStep}
                onBack={canGoBack ? goBack : undefined}
                adaptiveMessage={adaptiveMessage}
                directorState={directorState}
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
                        {step === 'welcome' && <StepWelcome onStart={() => goTo('personalHistory')} />}
                        {step === 'personalHistory' && <StepPersonalHistory
                            value={answers.personalHistory}
                            onChange={personalHistory => setAnswers(a => ({
                                ...a,
                                personalHistory,
                                assessmentFlowSnapshot: undefined,
                                assessmentReviewSnapshot: undefined,
                            }))}
                            onSkip={() => goTo('chiefComplaint')}
                            onNext={() => goTo('chiefComplaint')}
                        />}
                        {step === 'chiefComplaint' && <StepChiefComplaint
                            value={answers.chiefComplaint}
                            onChange={handleChiefComplaintChange}
                            onNext={() => goTo('hopi')}
                        />}
                        {step === 'hopi' && <StepHopi
                            value={answers.hopi}
                            complaint={answers.chiefComplaint}
                            onChange={handleHopiChange}
                            onNext={() => goTo('redflags')}
                        />}
                        {step === 'pathway'   && <StepPathway selectedId={answers.pathwayId}
                            onSelect={id => {
                                setPathwayChangeNotice('حدّثنا الأسئلة التالية بناءً على المسار الجديد.');
                                setAnswers(a => a.pathwayId === id
                                    ? a
                                    : {
                                    ...a,
                                    pathwayId: id,
                                    redFlags: [],
                                    hasEmergencyFlag: false,
                                    emergencyMessage: '',
                                    clinicalAnswers: {
                                        ...a.clinicalAnswers,
                                        assessment_previous_pathway: a.pathwayId,
                                        assessment_pathway_changed: 'yes',
                                        assessment_pathway_uncertain: 'no',
                                    },
                                    nutritionAnswers: undefined,
                                    adaptiveQuestionPlanSnapshot: undefined,
                                    assessmentFlowSnapshot: undefined,
                                    assessmentReviewSnapshot: undefined,
                                });
                            }}
                            onUnsure={() => {
                                setPathwayChangeNotice('بدأنا بمسار عام لأنك لم تكن متأكدًا من التصنيف.');
                                setAnswers(a => ({
                                    ...a,
                                    pathwayId: GENERAL_UNCERTAIN_PATHWAY_ID,
                                    redFlags: [],
                                    hasEmergencyFlag: false,
                                    emergencyMessage: '',
                                    clinicalAnswers: {
                                        ...a.clinicalAnswers,
                                        assessment_pathway_uncertain: 'yes',
                                    },
                                    nutritionAnswers: undefined,
                                    adaptiveQuestionPlanSnapshot: undefined,
                                    assessmentFlowSnapshot: undefined,
                                    assessmentReviewSnapshot: undefined,
                                }));
                            }}
                            onNext={() => goTo('redflags')} />}
                        {step === 'redflags' && <StepRedFlags
                            pathwayId={answers.pathwayId}
                            selectedFlags={answers.redFlags}
                            emergencyMessage={answers.emergencyMessage}
                            onToggleFlag={toggleRedFlag}
                            onClearEmergency={clearEmergencySelection}
                            onNoFlags={() => {
                                clearAllRedFlags();
                                goTo('relatedSymptoms');
                            }}
                            onEmergencyContinue={() => void handleSubmit(answers)}
                            onNext={() => {
                                if (answers.hasEmergencyFlag) {
                                    void handleSubmit(answers);
                                    return;
                                }
                                goTo('relatedSymptoms');
                            }} />}
                        {step === 'clinical'  && <StepClinical
                            pathwayId={answers.pathwayId} severity={answers.severity}
                            duration={answers.duration} clinicalAnswers={answers.clinicalAnswers}
                            shouldShowDeepQuestions={directorState.shouldShowDeepQuestions}
                            shouldShowFoodQuestions={directorState.shouldShowNutritionLayer}
                            adaptiveTriggers={directorState.flowSnapshot.adaptiveTriggers}
                            questionImpactMap={directorState.flowSnapshot.questionImpactMap}
                            onSeverity={v => setAnswers(a => ({ ...a, severity: v }))}
                            onDuration={v => setAnswers(a => ({ ...a, duration: v }))}
                            onAnswer={setAnswer} onNext={handleClinicalNext} />}
                        {step === 'relatedSymptoms' && <StepRelatedSymptoms
                            complaint={answers.chiefComplaint}
                            selected={answers.relatedSymptoms ?? []}
                            onChange={relatedSymptoms => setAnswers(a => ({
                                ...a,
                                relatedSymptoms,
                                clinicalAnswers: {
                                    ...a.clinicalAnswers,
                                    related_symptoms: relatedSymptoms,
                                },
                                assessmentFlowSnapshot: undefined,
                                assessmentReviewSnapshot: undefined,
                            }))}
                            onNext={() => goTo('lifestyle')}
                        />}
                        {step === 'lifestyle' && <StepLifestyleContext
                            value={answers.lifestyleContext}
                            onChange={handleLifestyleChange}
                            onNext={handleLifestyleNext}
                        />}
                        {step === 'emotional' && <StepEmotional
                            selected={answers.emotionalContext} note={answers.emotionalNote}
                            onToggle={toggleEmot}
                            onNote={v => setAnswers(a => ({ ...a, emotionalNote: v }))}
                            onSubmit={handleEmotionalSubmit} />}
                        {step === 'nutrition' && showNutritionStep && (
                            <TayyibatAssessmentCard
                                pathwayId={answers.pathwayId}
                                clinicalAnswers={answers.clinicalAnswers}
                                onComplete={handleNutritionComplete} />
                        )}
                        {step === 'review' && <StepReview
                            answers={answers}
                            directorState={directorState}
                            onEditPathway={() => goTo('chiefComplaint', -1)}
                            onEditClinical={() => goTo('hopi', -1)}
                            onEditEmotional={() => goTo('emotional', -1)}
                            onEditNutrition={() => goTo('nutrition', -1)}
                            onAnalyze={() => {
                                const flowSnapshot = getAssessmentDirectorState(answers, 'review').flowSnapshot;
                                const reviewedAnswers = {
                                    ...answers,
                                    assessmentFlowSnapshot: flowSnapshot,
                                    assessmentReviewSnapshot: buildAssessmentReviewSnapshot({
                                        ...answers,
                                        assessmentFlowSnapshot: flowSnapshot,
                                    }),
                                };
                                setAnswers(reviewedAnswers);
                                void handleSubmit(reviewedAnswers);
                            }}
                        />}
                        {step === 'analyzing' && <StepAnalyzing />}
                        {step === 'result'    && <StepResult answers={finalAnswers ?? answers} onRestart={restart} />}
                    </motion.div>
                </AnimatePresence>
            </AssessmentGlassShell>
        </>
    );
}
