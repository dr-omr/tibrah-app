// components/health-engine/steps/StepResult.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH — Result Screen (Phase 1 refactor)
//
// Responsibility: thin UI wrapper only.
// - Calls finalizeAssessmentResult() ONCE on mount.
// - On success → redirects to /assessment-result.
// - On failure → shows a clear Arabic fallback (not silent crash).
// - Fires analytics once on mount via refs.
// ════════════════════════════════════════════════════════════════
'use client';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/router';

import { finalizeAssessmentResult } from '@/lib/assessment/finalize-assessment-result';
import { detectContradictions } from '@/lib/contradiction-engine';
import { auditReasoningOutput, buildReasoningMetrics, dispatchReasoningMetrics } from '@/lib/reasoning-audit';
import { trackEvent } from '@/lib/analytics';
import { haptic } from '@/lib/HapticFeedback';

import type { EngineAnswers } from '../types';



/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════ */
export function StepResult({
    answers,
    onRestart,
}: {
    answers: EngineAnswers;
    onRestart: () => void;
}) {
    const router = useRouter();

    type SaveState = 'pending' | 'saving' | 'redirecting' | 'failed' | 'partial';
    const [saveState, setSaveState]   = useState<SaveState>('pending');
    const [errorMsg,  setErrorMsg]    = useState<string | null>(null);
    const analyticsGuard              = useRef(false);
    const finalized                   = useRef(false); // run once guard

    /* ── Single-run finalization on mount ── */
    useEffect(() => {
        if (finalized.current) return;
        finalized.current = true;
        setSaveState('saving');

        let result: ReturnType<typeof finalizeAssessmentResult>;
        try {
            result = finalizeAssessmentResult(answers);
        } catch (e) {
            setSaveState('failed');
            setErrorMsg(String(e));
            trackEvent('result_save_failed', { reason: String(e) });
            return;
        }

        if (result.status === 'failed') {
            setSaveState('failed');
            setErrorMsg(result.errorMessage ?? 'Unknown error');
            trackEvent('result_save_failed', { reason: result.errorMessage ?? 'unknown' });
            return;
        }

        if (result.status === 'partial') {
            // Engines succeeded but localStorage failed. Still show result.
            setSaveState('partial');
            setErrorMsg(result.errorMessage);
            trackEvent('result_save_partial', { reason: result.errorMessage ?? 'unknown' });
        }

        const { vm, triageResult, routing, sessionId } = result;

        // ── Analytics (once) ───────────────────────────────────
        if (!analyticsGuard.current) {
            analyticsGuard.current = true;
            try {
                trackEvent('assessment_completed', {
                    primary_domain:    routing.primary_domain,
                    secondary_domain:  routing.secondary_domain,
                    triage_level:      triageResult.level,
                    triage_score:      String(triageResult.score),
                    escalation_needed: String(routing.escalation_needed),
                    session_id:        sessionId ?? 'no_session',
                });
                trackEvent('result_saved', {
                    session_id:    sessionId ?? 'no_session',
                    save_status:   result.status,
                });
                trackEvent('confidence_shown', {
                    score: String(routing.confidenceScore),
                    band:  routing.confidence,
                });

                if (routing.escalation_needed) {
                    trackEvent('booking_suggested', {
                        triage_level: triageResult.level,
                        severity:     String(answers.severity),
                        duration:     answers.duration,
                    });
                }

                // Observability metrics
                const contradictions = detectContradictions(answers, triageResult);
                const auditResults   = auditReasoningOutput(answers, triageResult, routing, contradictions);
                const metrics        = buildReasoningMetrics(answers, triageResult, routing, contradictions, auditResults);
                dispatchReasoningMetrics(metrics, (event, props) => {
                    trackEvent(event, props as Record<string, string>);
                });

                // Tayyibat analytics
                if (vm.tayyibatVerdict) {
                    trackEvent('tayyibat_modifier_applied', {
                        pattern:        vm.tayyibatVerdict.primaryPattern ?? 'none',
                        safety_gated:   String(vm.tayyibatVerdict.safetyGated),
                        confidence:     String(vm.tayyibatVerdict.confidenceScore),
                        meal_logs:      String(vm.tayyibatVerdict.mealLogCountUsed),
                    });
                    if (vm.tayyibatVerdict.safetyGated) {
                        trackEvent('tayyibat_red_flag_detected', { pathway: answers.pathwayId });
                    }
                }

                // Confetti for manageable/review
                setTimeout(() => {
                    haptic.trigger('heavy');
                    if (triageResult.level === 'manageable' || triageResult.level === 'review') {
                        confetti({
                            particleCount: 80, spread: 88, origin: { y: 0.3 },
                            colors: ['#22D3EE', '#FFFFFF', '#818CF8', '#34D399', '#38BDF8'],
                            ticks: 180,
                        });
                    }
                }, 300);

            } catch {
                // Analytics must never crash the UI
            }
        }

        // ── Redirect to persistent result page ─────────────────
        if (result.status === 'success' && sessionId) {
            setSaveState('redirecting');
            router.replace(`/assessment-result?id=${sessionId}&animate=1`);
            trackEvent('result_restore_success', { session_id: sessionId });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ══════════════════════════════════════════════════════
       FALLBACK UI — shown only on save failure
       ══════════════════════════════════════════════════════ */
    if (saveState === 'failed') {
        return (
            <div dir="rtl" style={{ minHeight: '100svh', background: '#F2F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{
                    background: 'rgba(255,255,255,0.85)',
                    borderRadius: 28,
                    padding: 32,
                    maxWidth: 340,
                    textAlign: 'center',
                    border: '1.5px solid rgba(220,38,38,0.20)',
                    boxShadow: '0 12px 40px rgba(220,38,38,0.08)',
                }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
                    <h2 style={{ fontSize: 18, fontWeight: 900, color: '#7F1D1D', marginBottom: 10 }}>
                        تعذّر حفظ النتيجة
                    </h2>
                    <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65, marginBottom: 24 }}>
                        حدث خطأ أثناء معالجة نتيجتك. يرجى إعادة المحاولة.
                    </p>
                    <button
                        onClick={onRestart}
                        style={{
                            width: '100%', padding: '14px 20px', borderRadius: 18, border: 'none',
                            background: 'linear-gradient(135deg, #0891B2, #22D3EE)',
                            color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                            boxShadow: '0 6px 20px rgba(8,145,178,0.30)',
                        }}
                    >
                        أعد التقييم
                    </button>
                    {errorMsg && process.env.NODE_ENV === 'development' && (
                        <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 12, textAlign: 'left', direction: 'ltr' }}>
                            {errorMsg}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    /* ══════════════════════════════════════════════════════
       SAVING / REDIRECTING SPINNER
       ══════════════════════════════════════════════════════ */
    return (
        <div dir="rtl" style={{ minHeight: '100svh', background: '#F2F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                style={{ textAlign: 'center' }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
                        border: '3.5px solid rgba(8,145,178,0.15)',
                        borderTopColor: '#0891B2',
                    }}
                />
                <p style={{ fontSize: 15, fontWeight: 800, color: '#0C4A6E' }}>
                    {saveState === 'redirecting' ? 'جارٍ الانتقال لنتيجتك…' : 'جارٍ تحليل بياناتك…'}
                </p>
            </motion.div>
        </div>
    );
}
