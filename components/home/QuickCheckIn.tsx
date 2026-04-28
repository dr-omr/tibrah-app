// components/home/QuickCheckIn.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Proactive Clinical Triage & History System
// Sprint G: Refactored — all steps extracted to quick-checkin/steps/
// ════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { toast } from '@/components/notification-engine';
import { clinicalPathways, findSuggestedCategories, socratesQuestions } from '@/lib/clinicalPathways';
import { getNativeItem, setNativeItem, removeNativeItem } from '@/lib/useCloudSync';

// Extracted types + helpers
import {
    type IntakeStep, type ClinicalData,
    INITIAL_CLINICAL_DATA, TRIAGE_PRIORITY, NONE_OPTION,
    getEmotionalPrompt, getProgressWidth,
} from './quick-checkin/checkin-types';

// Extracted step components
import { WelcomeStep, DemographicsStep, ChiefComplaintStep, PrimarySelectionStep, RoutingValidationStep } from './quick-checkin/steps/IntakeSteps';
import { RedFlagsStep, HPIDynamicStep, SocratesStep, PMHStep, EmotionalStep } from './quick-checkin/steps/ClinicalSteps';
import { ReviewStep, AnalyzingStep, CompleteStep } from './quick-checkin/steps/OutcomeSteps';

export default function QuickCheckIn() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [stepState, setCurrentStepState] = useState<IntakeStep>('welcome');
    const [stepHistory, setStepHistory] = useState<IntakeStep[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isDraftAvailable, setIsDraftAvailable] = useState(false);
    const [clinicalData, setClinicalData] = useState<ClinicalData>(INITIAL_CLINICAL_DATA);
    const [currentDynamicQIndex, setCurrentDynamicQIndex] = useState(0);
    const [currentRedFlagIndex, setCurrentRedFlagIndex] = useState(0);
    const [aiResult, setAiResult] = useState<any>(null);

    const step = stepState;
    const setStep = (newStep: IntakeStep) => {
        setCurrentStepState(prev => {
            if (newStep === 'welcome') { setStepHistory([]); }
            else if (newStep !== prev) { setStepHistory(h => [...h, prev]); }
            return newStep;
        });
    };

    const handleNavigateBack = () => {
        haptic.selection();
        setStepHistory(h => {
            if (h.length === 0) { setCurrentStepState('welcome'); return []; }
            const previous = h[h.length - 1];
            setCurrentStepState(previous);
            return h.slice(0, -1);
        });
    };

    const updateData = (key: keyof ClinicalData, value: any) => {
        setClinicalData(prev => ({ ...prev, [key]: value }));
    };

    const todayKey = new Date().toISOString().split('T')[0];

    // ── Sorted categories / red flags / questions ──
    const sortedCategories = useMemo(() => {
        let cats = [...clinicalData.chiefComplaintCategories];
        if (clinicalData.primaryComplaintId && cats.includes(clinicalData.primaryComplaintId)) {
            cats = [clinicalData.primaryComplaintId, ...cats.filter(c => c !== clinicalData.primaryComplaintId)];
        }
        return cats;
    }, [clinicalData.chiefComplaintCategories, clinicalData.primaryComplaintId]);

    const activeRedFlags = useMemo(() => sortedCategories.flatMap(cat => clinicalPathways[cat]?.redFlags || []), [sortedCategories]);
    const activeQuestions = useMemo(() => sortedCategories.flatMap(cat => clinicalPathways[cat]?.questions || []), [sortedCategories]);

    // ── Generate summary text (kept inline — pure business logic) ──
    const generateSummaryText = (target: 'doctor' | 'patient' | 'whatsapp'): string => {
        const primaryCat = clinicalData.primaryComplaintId ? clinicalPathways[clinicalData.primaryComplaintId]?.label : 'غير محدد';
        const secondaryCats = clinicalData.chiefComplaintCategories.filter(c => c !== clinicalData.primaryComplaintId).map(c => clinicalPathways[c]?.label).join('، ');
        const triageLabelMap = { 'routine': '🟢 روتيني (Routine)', 'near_review': '🟡 تقييم قريب (Near Review)', 'urgent_sameday': '🟠 عاجل (Urgent)', 'emergency': '🔴 طوارئ قصوى (Emergency)' };
        const timestamp = new Date().toLocaleString('ar-SA');
        let msg = '';

        if (target === 'doctor') {
            msg += `*SOAP NOTE / CLINICAL TRIAGE*\nDate: ${timestamp} | Triage: ${triageLabelMap[clinicalData.highestTriageLevel as keyof typeof triageLabelMap]}\n\n`;
            msg += `*PT INFO:* Age: ${clinicalData.demographics.age || 'U/K'} | Gender: ${clinicalData.demographics.gender || 'U/K'} ${clinicalData.demographics.pregnancy === 'pregnant' ? '(Pregnant)' : ''}\n\n`;
            msg += `*S (Subjective):*\n- CC: ${primaryCat}\n`;
            if (secondaryCats) msg += `- Associated: ${secondaryCats}\n`;
            if (clinicalData.openNarrative) msg += `- Narrative: "${clinicalData.openNarrative}"\n`;
            msg += `- SOCRATES: Severity ${clinicalData.socratesAnswers.severity || 5}/10, Onset: ${clinicalData.socratesAnswers.onset || '-'}, Duration: ${clinicalData.socratesAnswers.duration || '-'}, Pattern: ${clinicalData.socratesAnswers.pattern || '-'}\n\n`;
            if (Object.keys(clinicalData.hpiAnswers).length > 0 && !clinicalData.hasUrgentRedFlag) {
                msg += `*HPI Details:*\n`;
                for (const [qId, ans] of Object.entries(clinicalData.hpiAnswers)) {
                    const qText = activeQuestions.find(q => q.id === qId)?.text || qId;
                    msg += `- ${qText}: ${Array.isArray(ans) ? ans.join(', ') : ans}\n`;
                }
                msg += '\n';
            }
            if (clinicalData.redFlagsTriggered.length > 0) {
                msg += `*RED FLAGS:* ${clinicalData.redFlagsTriggered.length} flag(s) triggered!\n`;
                clinicalData.redFlagsTriggered.forEach((rf: any) => { msg += `  -> ${rf.msg}\n`; });
                msg += '\n';
            }
            msg += `*PMH/MEDS/ALLERGIES:*\n- PMH: ${clinicalData.pastMedicalHistory.length > 0 && clinicalData.pastMedicalHistory[0] ? clinicalData.pastMedicalHistory.join(', ') : 'None'}\n- Meds: ${clinicalData.currentMeds || 'None'}\n- Allergies: ${clinicalData.allergies || 'None'}\n\n`;
            msg += `*النموذج التشخيصي الجسدي-الشعوري (Psychosomatic Diagnostic Model):*\n- Stress Level: ${clinicalData.emotionalState.stress}/10\n- Sleep: ${clinicalData.emotionalState.sleep || 'U/K'}\n`;
            if (clinicalData.emotionalState.details) msg += `- Triggers/Notes: ${clinicalData.emotionalState.details}\n`;
            msg += '\n';
            if (clinicalData.additionalNotes) msg += `*Notes:* ${clinicalData.additionalNotes}\n`;
        } else if (target === 'patient') {
            msg += `*ملخص حالتك الصحية الشخصي*\nتاريخ التقييم: ${timestamp}\n\nالشكوى الأساسية التي تعاني منها هي: (${primaryCat}).\n`;
            if (secondaryCats) msg += `الأعراض المصاحبة الإضافية: ${secondaryCats}.\n`;
            msg += `مستوى الألم والإزعاج قيمته ${clinicalData.socratesAnswers.severity || 5} من 10.\n\n`;
            if (clinicalData.highestTriageLevel === 'emergency' || clinicalData.highestTriageLevel === 'urgent_sameday') {
                msg += `⚠️ *تنبيه هام:* بناءً على هذا التقييم، يُرجى مراجعة الطوارئ أو عيادة عاجلة اليوم للاطمئنان وعدم التأخير.\n`;
            } else {
                msg += `✅ تبدو الأعراض مبدئياً روتينية ولا تشير لمخاطر فورية، لكن يُفضل مراجعة طبيبك بانتظام لتقييم أدق.\n`;
            }
        } else {
            msg += `*ملخص الفرز الطبي (Medical Triage Report)*\nوقت التقييم: ${timestamp}\nتصنيف الخطورة: ${triageLabelMap[clinicalData.highestTriageLevel as keyof typeof triageLabelMap]}\n\n`;
            msg += `👩‍⚕️ *الديموغرافيا:* العمر: ${clinicalData.demographics.age || 'غير محدد'} | الجنس: ${clinicalData.demographics.gender || 'غير محدد'} ${clinicalData.demographics.pregnancy === 'pregnant' ? '(🤰 حامل)' : ''}\n\n`;
            msg += `*الشكوى الرئيسية (Primary):* ${primaryCat}\n`;
            if (secondaryCats) msg += `*الأعراض المصاحبة (Secondary):* ${secondaryCats}\n`;
            if (clinicalData.openNarrative) msg += `\n*وصف المريض الحرفي:*\n"${clinicalData.openNarrative}"\n\n`;
            msg += `*الأبعاد السريرية (SOCRATES):*\n- شدتة الأعراض: ${clinicalData.socratesAnswers.severity || 5}/10\n- البداية: ${clinicalData.socratesAnswers.onset || '-'}\n- المدة: ${clinicalData.socratesAnswers.duration || '-'}\n`;
            if (clinicalData.socratesAnswers.pattern) msg += `- التطور: ${clinicalData.socratesAnswers.pattern}\n\n`;
            if (Object.keys(clinicalData.hpiAnswers).length > 0 && !clinicalData.hasUrgentRedFlag) {
                msg += `*تفاصيل الأعراض المرتبطة (HPI):*\n`;
                for (const [qId, ans] of Object.entries(clinicalData.hpiAnswers)) {
                    const qText = activeQuestions.find(q => q.id === qId)?.text || qId;
                    msg += `🔸 ${qText}\n   - ${Array.isArray(ans) ? ans.join('، ') : ans}\n`;
                }
                msg += '\n';
            }
            if (clinicalData.redFlagsTriggered.length > 0) {
                msg += `*⚠️ علامات الخطر والأمان التي تم تأكيدها:*\n`;
                clinicalData.redFlagsTriggered.forEach((rf: any) => { msg += `🚨 ${rf.msg}\n`; });
                msg += '\n';
            }
            msg += `*التاريخ الطبي والأدوية:*\n- الأمراض المزمنة: ${clinicalData.pastMedicalHistory.length > 0 && clinicalData.pastMedicalHistory[0] ? clinicalData.pastMedicalHistory.join('، ') : 'لا يوجد التاريخ'}\n- الأدوية الحالية: ${clinicalData.currentMeds || 'لا يوجد'}\n- حساسية: ${clinicalData.allergies || 'لا يوجد'}\n\n`;
            msg += `*النمط التشخيصي الشعوري والجسدي:*\n- ارتباط الأعراض مع مستوى التوتر والمحفزات: ${clinicalData.emotionalState.stress}/10\n- جودة النوم: ${clinicalData.emotionalState.sleep || 'غير محدد'}\n`;
            if (clinicalData.emotionalState.details) msg += `- عوامل مصاحبة: ${clinicalData.emotionalState.details}\n`;
            msg += `\n`;
            if (clinicalData.additionalNotes) msg += `*ملاحظات إضافية:* ${clinicalData.additionalNotes}\n\n`;
            if (clinicalData.highestTriageLevel === 'emergency') {
                msg += `*-- توصية النظام التلقائية --*\nيرجى التوجيه العاجل للطوارئ (997) لتداعيات تهدد الحياة.\n`;
            } else if (clinicalData.highestTriageLevel === 'urgent_sameday') {
                msg += `*-- توصية النظام التلقائية --*\nيرجى التعامل مع الحالة كعاجلة اليوم.\n`;
            }
        }
        return msg;
    };

    // ── Save mutation ──
    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            const emotionalDiagnosticObj = {
                body_region: 'general',
                physical_complaint: clinicalPathways[data.primaryComplaintId || '']?.label || 'غير محدد',
                emotional_diagnostic_pattern: getEmotionalPrompt(data.primaryComplaintId),
                psychosomatic_dimension: data.emotionalState?.details || '',
                stress_context: `مستوى التوتر: ${data.emotionalState?.stress}/10`,
                behavioral_contributors: data.emotionalState?.behavioral_contributors || [],
                repeated_pattern_flag: data.emotionalState?.repeated_pattern_flag || false,
                clinician_summary: generateSummaryText('doctor'),
                patient_summary: generateSummaryText('patient'),
            };

            const triageRecord = await db.entities.TriageRecord.createForUser(user?.id || '', {
                date: todayKey, user_id: user?.id || 'guest',
                primary_complaint: data.primaryComplaintId || undefined,
                complaint_label: clinicalPathways[data.primaryComplaintId || '']?.label,
                secondary_complaints: data.chiefComplaintCategories.filter((c: string) => c !== data.primaryComplaintId),
                triage_level: data.highestTriageLevel || 'routine',
                severity_score: data.socratesAnswers?.severity || 5,
                red_flags_triggered: data.redFlagsTriggered,
                hpi_answers: data.hpiAnswers, socrates: data.socratesAnswers,
                pmh: data.pastMedicalHistory, medications: data.currentMeds,
                allergies: data.allergies, demographics: data.demographics,
                narrative: data.openNarrative, additional_notes: data.additionalNotes,
                emotional_diagnostic: emotionalDiagnosticObj,
                summary_doctor: generateSummaryText('doctor'),
                summary_patient: generateSummaryText('patient'),
                status: 'pending_review',
            } as any);

            await db.entities.DailyLog.createForUser(user?.id || '', {
                date: todayKey, mood: data.emotionalState?.stress ? (10 - data.emotionalState.stress) : 5,
                stress_level: data.emotionalState?.stress || 5, type: 'clinical_triage',
                duration_minutes: 10, emotional_diagnostic: emotionalDiagnosticObj,
                notes: `الارتباط النفس-جسدي: ${data.emotionalState?.details || 'لا يوجد'}\nTriage: ${data.highestTriageLevel} | CC: ${clinicalPathways[data.primaryComplaintId || '']?.label || 'غير محدد'}`,
            } as any);

            return triageRecord;
        },
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['clinical-triage'] });
            queryClient.invalidateQueries({ queryKey: ['triage-records'] });
            await removeNativeItem('tibrah_triage_draft');
            setStep('complete');
            if (clinicalData.highestTriageLevel === 'routine' || clinicalData.highestTriageLevel === 'near_review') {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 2000);
            }
            haptic.success();
            if (typeof window !== 'undefined') {
                const savedRewards = await getNativeItem('tibrahRewards') || {};
                const newPoints = (savedRewards.points || 0) + 20;
                await setNativeItem('tibrahRewards', { ...savedRewards, points: newPoints });
                db.entities.PointTransaction.createForUser(user?.id || '', {
                    user_id: user?.id || 'guest', amount: 20, reason: 'clinical_triage_complete',
                    balance_after: newPoints, timestamp: new Date().toISOString(),
                }).catch(() => {});
                toast.success('تم إصدار التقرير الطبي 🩺\n🎉 كسبت 20 نقطة مكافأة لاهتمامك بصحتك اليوم!', { duration: 4000 });
            } else {
                toast.success('تم إصدار التقرير الطبي 🩺');
            }
        },
    });

    // ── Draft management ──
    useEffect(() => {
        const checkDraft = async () => {
            const saved = await getNativeItem('tibrah_triage_draft');
            if (saved && typeof saved === 'object' && saved.chiefComplaintCategories) setIsDraftAvailable(true);
        };
        checkDraft();
    }, []);

    useEffect(() => {
        if (step !== 'welcome' && step !== 'analyzing' && step !== 'complete') {
            const timeout = setTimeout(() => { setNativeItem('tibrah_triage_draft', clinicalData); }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [clinicalData, step]);

    const loadDraft = async () => {
        haptic.selection();
        const saved = await getNativeItem('tibrah_triage_draft');
        if (saved) { setClinicalData(saved); setStep('review'); toast.success('تم استعادة الجلسة السابقة المشفرة'); }
    };

    // ── Flow handlers ──
    const handleCCSelection = (catId: string) => {
        haptic.selection();
        setClinicalData(prev => {
            const current = prev.chiefComplaintCategories;
            return { ...prev, chiefComplaintCategories: current.includes(catId) ? current.filter(x => x !== catId) : [...current, catId] };
        });
    };

    const jumpToDynamicOrSocrates = () => {
        if (clinicalData.hasUrgentRedFlag || activeQuestions.length === 0) { setStep('socrates'); }
        else { setCurrentDynamicQIndex(0); setStep('hpi_dynamic'); }
    };

    const setupActivePathwaysAndProceed = () => {
        if (activeRedFlags.length > 0) { setCurrentRedFlagIndex(0); setStep('red_flags'); }
        else { jumpToDynamicOrSocrates(); }
    };

    const proceedFromChiefComplaint = () => {
        haptic.selection();
        if (clinicalData.chiefComplaintCategories.length === 0 && clinicalData.openNarrative.length >= 5) {
            updateData('chiefComplaintCategories', ['other']); updateData('primaryComplaintId', 'other');
        } else if (clinicalData.chiefComplaintCategories.length === 1) {
            updateData('primaryComplaintId', clinicalData.chiefComplaintCategories[0]);
        }
        const suggestions = findSuggestedCategories(clinicalData.openNarrative);
        const missingSuggestions = suggestions.filter(s => !clinicalData.chiefComplaintCategories.includes(s));
        if (missingSuggestions.length > 0 && clinicalData.openNarrative.length > 0) {
            updateData('suggestedCategories', missingSuggestions); setStep('routing_validation');
        } else if (clinicalData.chiefComplaintCategories.length > 1 && !clinicalData.primaryComplaintId) {
            setStep('primary_selection');
        } else { setupActivePathwaysAndProceed(); }
    };

    const handleRoutingDecision = (decision: 'switch' | 'add' | 'ignore') => {
        haptic.selection();
        let finalCategories = [...clinicalData.chiefComplaintCategories];
        let primary = clinicalData.primaryComplaintId || (finalCategories.length ? finalCategories[0] : null);
        const topSuggestion = clinicalData.suggestedCategories[0];
        if (decision === 'switch' && topSuggestion) {
            if (!finalCategories.includes(topSuggestion)) finalCategories.push(topSuggestion);
            primary = topSuggestion;
        } else if (decision === 'add') {
            finalCategories = [...new Set([...finalCategories, ...clinicalData.suggestedCategories])];
        }
        updateData('chiefComplaintCategories', finalCategories);
        updateData('primaryComplaintId', primary);
        if (finalCategories.length > 1 && !primary) { setStep('primary_selection'); }
        else { setTimeout(() => setStep('red_flags'), 50); }
    };

    useEffect(() => {
        if (step === 'red_flags' && activeRedFlags.length === 0) jumpToDynamicOrSocrates();
    }, [step, activeRedFlags.length]);

    const handleRedFlagAnswer = (rf: any, isYes: boolean) => {
        haptic.selection();
        if (isYes) {
            const newLevel = rf.level || 'urgent_sameday';
            const isEscalatedUrgent = newLevel === 'emergency' || newLevel === 'urgent_sameday';
            setClinicalData(prev => {
                const currentObjLevel = TRIAGE_PRIORITY[prev.highestTriageLevel as keyof typeof TRIAGE_PRIORITY] || 1;
                const newObjLevel = TRIAGE_PRIORITY[newLevel as keyof typeof TRIAGE_PRIORITY] || 1;
                const finalLevel = newObjLevel > currentObjLevel ? newLevel : prev.highestTriageLevel;
                return { ...prev, hasUrgentRedFlag: isEscalatedUrgent || prev.hasUrgentRedFlag, highestTriageLevel: finalLevel, redFlagsTriggered: [...prev.redFlagsTriggered, { id: rf.id, msg: rf.actionMessage, level: rf.level }] };
            });
            toast.error(`تصنيف: ${newLevel === 'emergency' ? 'طوارئ قصوى' : 'عاجل'}\n${rf.actionMessage}`, { duration: 5000 });
            setTimeout(() => jumpToDynamicOrSocrates(), 1200);
        } else {
            if (currentRedFlagIndex < activeRedFlags.length - 1) setCurrentRedFlagIndex(prev => prev + 1);
            else jumpToDynamicOrSocrates();
        }
    };

    const toggleHpiMulti = (qId: string, opt: string) => {
        haptic.selection();
        setClinicalData(prev => {
            const current = prev.hpiAnswers[qId] || [];
            if (opt === NONE_OPTION) return { ...prev, hpiAnswers: { ...prev.hpiAnswers, [qId]: current.includes(NONE_OPTION) ? [] : [NONE_OPTION] } };
            const newArray = current.filter((x: string) => x !== opt && x !== NONE_OPTION);
            if (current.includes(opt)) return { ...prev, hpiAnswers: { ...prev.hpiAnswers, [qId]: newArray } };
            return { ...prev, hpiAnswers: { ...prev.hpiAnswers, [qId]: [...newArray, opt] } };
        });
    };

    const performAnalysis = async (data: any) => {
        saveMutation.mutate(data);
        if (data.highestTriageLevel === 'emergency') { setStep('complete'); return; }
        try {
            const res = await fetch('/api/ai-analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'clinical_assessment', data }) });
            const json = await res.json();
            if (json.success && json.data) setAiResult(json.data);
        } catch (e) { console.error(e); }
        setStep('complete');
    };

    const handleExport = (target: 'doctor' | 'patient' | 'whatsapp') => {
        const text = generateSummaryText(target);
        if (target === 'whatsapp') { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
        else { navigator.clipboard.writeText(text); toast.success(`تم النسخ بنجاح!`, { body: target === 'doctor' ? 'تم نسخ التقرير الطبي الموحد (SOAP Note)' : 'تم نسخ الملخص الشخصي المبسط.' }); }
    };

    // ── Shared props ──
    const stepProps = { clinicalData, updateData, setStep, handleNavigateBack, setClinicalData };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className={`flex-1 flex flex-col overflow-y-auto transition-all ${clinicalData.hasUrgentRedFlag ? 'border-t-4 border-rose-500 shadow-rose-500/20' : ''}`} data-accent="medical">

                {clinicalData.hasUrgentRedFlag && step !== 'analyzing' && step !== 'welcome' && step !== 'complete' && step !== 'review' && (
                    <div className="bg-rose-500 text-white text-[11px] font-bold text-center py-2 flex justify-center items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> حالة طارئة: تم تفعيل مسار التوثيق المختصر
                    </div>
                )}

                {step !== 'welcome' && step !== 'analyzing' && step !== 'complete' && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800">
                        <motion.div className={`h-full ${clinicalData.hasUrgentRedFlag ? 'bg-rose-500' : 'bg-gradient-to-r from-teal-400 to-indigo-500'}`}
                            initial={{ width: 0 }} animate={{ width: getProgressWidth(step) }} />
                    </div>
                )}

                <div className="p-5 pt-6 relative z-10 min-h-[250px]">
                    <AnimatePresence mode="wait">
                        {step === 'welcome' && <WelcomeStep {...stepProps} isDraftAvailable={isDraftAvailable} loadDraft={loadDraft} />}
                        {step === 'demographics' && <DemographicsStep {...stepProps} />}
                        {step === 'chief_complaint' && <ChiefComplaintStep {...stepProps} handleCCSelection={handleCCSelection} proceedFromChiefComplaint={proceedFromChiefComplaint} />}
                        {step === 'primary_selection' && <PrimarySelectionStep {...stepProps} />}
                        {step === 'routing_validation' && <RoutingValidationStep {...stepProps} handleRoutingDecision={handleRoutingDecision} />}
                        {step === 'red_flags' && activeRedFlags.length > 0 && <RedFlagsStep {...stepProps} activeRedFlags={activeRedFlags} currentRedFlagIndex={currentRedFlagIndex} setCurrentRedFlagIndex={setCurrentRedFlagIndex as any} handleRedFlagAnswer={handleRedFlagAnswer} />}
                        {step === 'hpi_dynamic' && <HPIDynamicStep {...stepProps} activeQuestions={activeQuestions} currentDynamicQIndex={currentDynamicQIndex} setCurrentDynamicQIndex={setCurrentDynamicQIndex as any} toggleHpiMulti={toggleHpiMulti} />}
                        {step === 'socrates' && <SocratesStep {...stepProps} />}
                        {step === 'pmh' && <PMHStep {...stepProps} />}
                        {step === 'emotional' && <EmotionalStep {...stepProps} />}
                        {step === 'review' && <ReviewStep {...stepProps} performAnalysis={performAnalysis} />}
                        {step === 'analyzing' && <AnalyzingStep clinicalData={clinicalData} />}
                        {step === 'complete' && <CompleteStep {...stepProps} showConfetti={showConfetti} aiResult={aiResult} handleExport={handleExport} activeQuestionsLength={activeQuestions.length} activeRedFlagsLength={activeRedFlags.length} />}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
