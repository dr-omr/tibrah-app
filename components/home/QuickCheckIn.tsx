// components/home/QuickCheckIn.tsx
// Proactive Clinical Triage & History System

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Activity, ArrowLeft, Brain, HeartPulse, ActivitySquare, Zap, Clock, AlertCircle, ShieldAlert, Sparkles, Stethoscope, AlertTriangle, ChevronLeft, ChevronRight, MessageCircle, Thermometer, Wind, PhoneCall, ListChecks, FileText, UserCog, Edit3, Save, RefreshCw
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { toast } from '@/components/notification-engine';
import Link from 'next/link';
import { clinicalPathways, socratesQuestions, findSuggestedCategories, TriageLevel } from '@/lib/clinicalPathways';
import { getRelevantProducts, getComplaintSuggestionMeta } from '@/lib/triageProductMap';
import { localProducts } from '@/lib/products';
import { getNativeItem, setNativeItem, removeNativeItem } from '@/lib/useCloudSync';

// Clinical Flow Steps
type IntakeStep = 'welcome' | 'demographics' | 'chief_complaint' | 'primary_selection' | 'routing_validation' | 'red_flags' | 'hpi_dynamic' | 'socrates' | 'pmh' | 'emotional' | 'review' | 'analyzing' | 'complete';

const TRIAGE_PRIORITY = { emergency: 4, urgent_sameday: 3, near_review: 2, routine: 1 };

// Map icon strings to Lucide components
const IconMap: Record<string, any> = {
    'Brain': Brain,
    'HeartPulse': HeartPulse,
    'Wind': Wind,
    'Thermometer': Thermometer,
    'ActivitySquare': ActivitySquare,
    'Activity': Activity,
    'Zap': Zap,
    'Clock': Clock,
    'AlertCircle': AlertCircle
};

function Confetti({ show }: { show: boolean }) {
    if (!show) return null;
    const particles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 200,
        y: -(Math.random() * 150 + 50),
        rotate: Math.random() * 360,
        color: ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'][i % 6],
        size: 5 + Math.random() * 5,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {particles.map(p => (
                <motion.div
                    key={p.id} className="absolute rounded-sm"
                    style={{ width: p.size, height: p.size, backgroundColor: p.color, left: '50%', top: '50%' }}
                    initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                    animate={{ x: p.x, y: p.y, scale: [0, 1, 0.5], rotate: p.rotate, opacity: [1, 1, 0] }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />
            ))}
        </div>
    );
}

const getEmotionalPrompt = (complaintId: string | null) => {
    switch(complaintId) {
        case 'headache': return 'الأعراض المرتبطة بالرأس غالباً ما تنشط مع زيادة الضغوطات الفكرية، كثرة التفكير الإيقاعي، ومحاولة التحكم المفرط.';
        case 'chest_pain': return 'أعراض الصدر والخفقان قد ترتبط بالتوتر الشديد، الشعور بالتهديد، أو كبت المشاعر وفقدان الأمان الشعوري.';
        case 'respiratory': return 'أعراض الجهاز التنفسي قد تتأثر بضغوطات تمنعك من التعبير عن نفسك بحرية أو الشعور بالاختناق ضمن محيطك.';
        case 'digestion': return 'المشاكل الهضمية غالباً تمثل استجابة جسدية للقلق من المستقبل أو صعوبة تقبل "وهضم" التغييرات والأحداث الجديدة.';
        case 'urinary': return 'أعراض المسالك البولية قد تظهر بالتزامن مع توترات تخص الحدود الشخصية، العلاقات، أو الشعور بالضغط في بيئتك.';
        case 'fatigue': return 'الإرهاق العام قد يعكس استنزافاً للطاقة في صراعات داخلية أو محاولة تحمل أعباء تفوق طاقتك الشعورية.';
        case 'fever': return 'العدوى والحرارة أحياناً تعقب فترات من الانفعال الشديد أو الاحتراق النفسي كمحاولة من الجسد للراحة الإجبارية.';
        default: return 'الكثير من الأعراض الجسدية تظهر أو تتفاقم كاستجابة طبيعية لتراكم التوتر والضغوطات اليومية.';
    }
};

export default function QuickCheckIn() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [stepState, setCurrentStepState] = useState<IntakeStep>('welcome');
    const [stepHistory, setStepHistory] = useState<IntakeStep[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isDraftAvailable, setIsDraftAvailable] = useState(false);

    const step = stepState;
    const setStep = (newStep: IntakeStep) => {
        setCurrentStepState(prev => {
            if (newStep === 'welcome') {
                setStepHistory([]);
            } else if (newStep !== prev) {
                setStepHistory(h => [...h, prev]);
            }
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

    const NONE_OPTION = 'لا، ليست لدي أي من هذه الأعراض المصاحبة';

    // Clinical Data State
    const [clinicalData, setClinicalData] = useState({
        orientation: 'new_issue',
        demographics: { age: '', gender: '', pregnancy: '' },
        chiefComplaintCategories: [] as string[],
        primaryComplaintId: null as string | null,
        suggestedCategories: [] as string[],
        openNarrative: '',
        hasUrgentRedFlag: false,
        highestTriageLevel: 'routine' as TriageLevel | 'routine',
        redFlagsTriggered: [] as { id: string, msg: string, level?: TriageLevel }[],
        hpiAnswers: {} as Record<string, any>,
        socratesAnswers: {} as Record<string, any>,
        pastMedicalHistory: [] as string[],
        currentMeds: '',
        allergies: '',
        additionalNotes: '',
        emotionalState: { 
            stress: 5, 
            sleep: '', 
            details: '',
            behavioral_contributors: [] as string[],
            repeated_pattern_flag: false
        }
    });

    const [currentDynamicQIndex, setCurrentDynamicQIndex] = useState(0);
    const [currentRedFlagIndex, setCurrentRedFlagIndex] = useState(0);

    const todayKey = new Date().toISOString().split('T')[0];

    const [aiResult, setAiResult] = useState<any>(null);
    const performAnalysis = async (data: any) => {
        saveMutation.mutate(data);
        if (data.highestTriageLevel === 'emergency') {
            setStep('complete');
            return;
        }
        try {
            const res = await fetch('/api/ai-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'clinical_assessment', data })
            });
            const json = await res.json();
            if (json.success && json.data) {
                setAiResult(json.data);
            }
        } catch(e) { console.error(e); }
        setStep('complete');
    };

    // Auto-save logic (Native Offline Support)
    useEffect(() => {
        const checkDraft = async () => {
            const saved = await getNativeItem('tibrah_triage_draft');
            if (saved && typeof saved === 'object' && saved.chiefComplaintCategories) {
                setIsDraftAvailable(true);
            }
        };
        checkDraft();
    }, []);

    useEffect(() => {
        if (step !== 'welcome' && step !== 'analyzing' && step !== 'complete') {
            const timeout = setTimeout(() => {
                setNativeItem('tibrah_triage_draft', clinicalData);
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [clinicalData, step]);

    const loadDraft = async () => {
        haptic.selection();
        const saved = await getNativeItem('tibrah_triage_draft');
        if (saved) {
            setClinicalData(saved);
            setStep('review'); 
            toast.success('تم استعادة الجلسة السابقة المشفرة');
        }
    };

    // Priority sorting: Primary complaint always goes first for questions/red flags
    const sortedCategories = useMemo(() => {
        let cats = [...clinicalData.chiefComplaintCategories];
        if (clinicalData.primaryComplaintId && cats.includes(clinicalData.primaryComplaintId)) {
            cats = [clinicalData.primaryComplaintId, ...cats.filter(c => c !== clinicalData.primaryComplaintId)];
        }
        return cats;
    }, [clinicalData.chiefComplaintCategories, clinicalData.primaryComplaintId]);

    const activeRedFlags = useMemo(() => {
        return sortedCategories.flatMap(cat => clinicalPathways[cat]?.redFlags || []);
    }, [sortedCategories]);

    const activeQuestions = useMemo(() => {
        return sortedCategories.flatMap(cat => clinicalPathways[cat]?.questions || []);
    }, [sortedCategories]);

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
                patient_summary: generateSummaryText('patient')
            };

            // 1. Save structured TriageRecord (deep, queryable)
            const triageRecord = await db.entities.TriageRecord.createForUser(user?.id || '', {
                date: todayKey,
                user_id: user?.id || 'guest',
                primary_complaint: data.primaryComplaintId || undefined,
                complaint_label: clinicalPathways[data.primaryComplaintId || '']?.label,
                secondary_complaints: data.chiefComplaintCategories.filter((c: string) => c !== data.primaryComplaintId),
                triage_level: data.highestTriageLevel || 'routine',
                severity_score: data.socratesAnswers?.severity || 5,
                red_flags_triggered: data.redFlagsTriggered,
                hpi_answers: data.hpiAnswers,
                socrates: data.socratesAnswers,
                pmh: data.pastMedicalHistory,
                medications: data.currentMeds,
                allergies: data.allergies,
                demographics: data.demographics,
                narrative: data.openNarrative,
                additional_notes: data.additionalNotes,
                emotional_diagnostic: emotionalDiagnosticObj,
                summary_doctor: generateSummaryText('doctor'),
                summary_patient: generateSummaryText('patient'),
                status: 'pending_review'
            } as any);

            // 2. Also save DailyLog for longitudinal emotional dimension tracking
            await db.entities.DailyLog.createForUser(user?.id || '', {
                date: todayKey,
                mood: data.emotionalState?.stress ? (10 - data.emotionalState.stress) : 5, // Higher stress = lower mood
                stress_level: data.emotionalState?.stress || 5,
                type: 'clinical_triage',
                duration_minutes: 10,
                emotional_diagnostic: emotionalDiagnosticObj,
                notes: `الارتباط النفس-جسدي: ${data.emotionalState?.details || 'لا يوجد'}\nTriage: ${data.highestTriageLevel} | CC: ${clinicalPathways[data.primaryComplaintId || '']?.label || 'غير محدد'}`
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
            
            // Reward points for clinical triage completion
            if (typeof window !== 'undefined') {
                const savedRewards = await getNativeItem('tibrahRewards') || {};
                const newPoints = (savedRewards.points || 0) + 20;
                await setNativeItem('tibrahRewards', { ...savedRewards, points: newPoints });
                
                // Also persist to DB for durability
                db.entities.PointTransaction.createForUser(user?.id || '', {
                    user_id: user?.id || 'guest',
                    amount: 20,
                    reason: 'clinical_triage_complete',
                    balance_after: newPoints,
                    timestamp: new Date().toISOString()
                }).catch(() => {});
                toast.success('تم إصدار التقرير الطبي 🩺\n🎉 كسبت 20 نقطة مكافأة لاهتمامك بصحتك اليوم!', { duration: 4000 });
            } else {
                toast.success('تم إصدار التقرير الطبي 🩺');
            }
        },
    });

    const updateData = (key: keyof typeof clinicalData, value: any) => {
        setClinicalData(prev => ({ ...prev, [key]: value }));
    };

    const handleCCSelection = (catId: string) => {
        haptic.selection();
        setClinicalData(prev => {
            const current = prev.chiefComplaintCategories;
            if (current.includes(catId)) {
                return { ...prev, chiefComplaintCategories: current.filter(x => x !== catId) };
            } else {
                return { ...prev, chiefComplaintCategories: [...current, catId] };
            }
        });
    };

    const jumpToDynamicOrSocrates = () => {
        const qs = activeQuestions;
        if (clinicalData.hasUrgentRedFlag || qs.length === 0) {
            setStep('socrates');
        } else {
            setCurrentDynamicQIndex(0);
            setStep('hpi_dynamic');
        }
    };

    const setupActivePathwaysAndProceed = () => {
        const flags = activeRedFlags;
        if (flags.length > 0) {
            setCurrentRedFlagIndex(0);
            setStep('red_flags');
        } else {
            jumpToDynamicOrSocrates();
        }
    };

    const proceedFromChiefComplaint = () => {
        haptic.selection();

        // Force 'other' if nothing selected but text is typed
        if (clinicalData.chiefComplaintCategories.length === 0 && clinicalData.openNarrative.length >= 5) {
            updateData('chiefComplaintCategories', ['other']);
            updateData('primaryComplaintId', 'other');
        } else if (clinicalData.chiefComplaintCategories.length === 1) {
            updateData('primaryComplaintId', clinicalData.chiefComplaintCategories[0]);
        }

        const suggestions = findSuggestedCategories(clinicalData.openNarrative);
        const missingSuggestions = suggestions.filter(s => !clinicalData.chiefComplaintCategories.includes(s));

        if (missingSuggestions.length > 0 && clinicalData.openNarrative.length > 0) {
            updateData('suggestedCategories', missingSuggestions);
            setStep('routing_validation');
        } else if (clinicalData.chiefComplaintCategories.length > 1 && !clinicalData.primaryComplaintId) {
            setStep('primary_selection');
        } else {
            setupActivePathwaysAndProceed();
        }
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

        if (finalCategories.length > 1 && !primary) {
            setStep('primary_selection');
        } else {
            // Need a tick to let state propagate for useMemo, but in React we can't reliably read immediately.
            // setStep will trigger re-render and then we can evaluate in a useEffect, or just wait slightly.
            setTimeout(() => {
                setStep('red_flags'); // just jump to next logic check
            }, 50);
        }
    };

    // Red flag effect routing trap for delayed state updates
    useEffect(() => {
        if (step === 'red_flags' && activeRedFlags.length === 0) {
            jumpToDynamicOrSocrates();
        }
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

                return {
                    ...prev,
                    hasUrgentRedFlag: isEscalatedUrgent || prev.hasUrgentRedFlag,
                    highestTriageLevel: finalLevel,
                    redFlagsTriggered: [...prev.redFlagsTriggered, { id: rf.id, msg: rf.actionMessage, level: rf.level }]
                };
            });

            const levelName = newLevel === 'emergency' ? 'طوارئ قصوى' : 'عاجل';
            toast.error(`تصنيف: ${levelName}\n${rf.actionMessage}`, { duration: 5000 });

            setTimeout(() => jumpToDynamicOrSocrates(), 1200);

        } else {
            if (currentRedFlagIndex < activeRedFlags.length - 1) {
                setCurrentRedFlagIndex(prev => prev + 1);
            } else {
                jumpToDynamicOrSocrates();
            }
        }
    };

    const toggleHpiMulti = (qId: string, opt: string) => {
        haptic.selection();
        setClinicalData(prev => {
            const current = prev.hpiAnswers[qId] || [];
            if (opt === NONE_OPTION) {
                return { ...prev, hpiAnswers: { ...prev.hpiAnswers, [qId]: current.includes(NONE_OPTION) ? [] : [NONE_OPTION] } };
            }
            const newArray = current.filter((x: string) => x !== opt && x !== NONE_OPTION);
            if (current.includes(opt)) return { ...prev, hpiAnswers: { ...prev.hpiAnswers, [qId]: newArray } };
            return { ...prev, hpiAnswers: { ...prev.hpiAnswers, [qId]: [...newArray, opt] } };
        });
    };

    const generateSummaryText = (target: 'doctor' | 'patient' | 'whatsapp') => {
        const primaryCat = clinicalData.primaryComplaintId ? clinicalPathways[clinicalData.primaryComplaintId]?.label : 'غير محدد';
        const secondaryCats = clinicalData.chiefComplaintCategories.filter(c => c !== clinicalData.primaryComplaintId).map(c => clinicalPathways[c]?.label).join('، ');

        const triageLabelMap = { 
            'routine': '🟢 روتيني (Routine)', 
            'near_review': '🟡 تقييم قريب (Near Review)', 
            'urgent_sameday': '🟠 عاجل (Urgent)', 
            'emergency': '🔴 طوارئ قصوى (Emergency)' 
        };
        
        const timestamp = new Date().toLocaleString('ar-SA');
        let msg = '';

        if (target === 'doctor') {
            msg += `*SOAP NOTE / CLINICAL TRIAGE*\n`;
            msg += `Date: ${timestamp} | Triage: ${triageLabelMap[clinicalData.highestTriageLevel as keyof typeof triageLabelMap]}\n\n`;
            msg += `*PT INFO:* Age: ${clinicalData.demographics.age || 'U/K'} | Gender: ${clinicalData.demographics.gender || 'U/K'} ${clinicalData.demographics.pregnancy === 'pregnant' ? '(Pregnant)' : ''}\n\n`;
            msg += `*S (Subjective):*\n`;
            msg += `- CC: ${primaryCat}\n`;
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
            msg += `*PMH/MEDS/ALLERGIES:*\n`;
            msg += `- PMH: ${clinicalData.pastMedicalHistory.length > 0 && clinicalData.pastMedicalHistory[0] ? clinicalData.pastMedicalHistory.join(', ') : 'None'}\n`;
            msg += `- Meds: ${clinicalData.currentMeds || 'None'}\n`;
            msg += `- Allergies: ${clinicalData.allergies || 'None'}\n\n`;
            
            // Psychosomatic Context for Doctor
            msg += `*النموذج التشخيصي الجسدي-الشعوري (Psychosomatic Diagnostic Model):*\n`;
            msg += `- Stress Level: ${clinicalData.emotionalState.stress}/10\n`;
            msg += `- Sleep: ${clinicalData.emotionalState.sleep || 'U/K'}\n`;
            if (clinicalData.emotionalState.details) msg += `- Triggers/Notes: ${clinicalData.emotionalState.details}\n`;
            msg += '\n';

            if (clinicalData.additionalNotes) msg += `*Notes:* ${clinicalData.additionalNotes}\n`;

        } else if (target === 'patient') {
            msg += `*ملخص حالتك الصحية الشخصي*\n`;
            msg += `تاريخ التقييم: ${timestamp}\n\n`;
            msg += `الشكوى الأساسية التي تعاني منها هي: (${primaryCat}).\n`;
            if (secondaryCats) msg += `الأعراض المصاحبة الإضافية: ${secondaryCats}.\n`;
            msg += `مستوى الألم والإزعاج قيمته ${clinicalData.socratesAnswers.severity || 5} من 10.\n\n`;
            if (clinicalData.highestTriageLevel === 'emergency' || clinicalData.highestTriageLevel === 'urgent_sameday') {
                msg += `⚠️ *تنبيه هام:* بناءً على هذا التقييم، يُرجى مراجعة الطوارئ أو عيادة عاجلة اليوم للاطمئنان وعدم التأخير.\n`;
            } else {
                msg += `✅ تبدو الأعراض مبدئياً روتينية ولا تشير لمخاطر فورية، لكن يُفضل مراجعة طبيبك بانتظام لتقييم أدق.\n`;
            }

        } else {
            msg += `*ملخص الفرز الطبي (Medical Triage Report)*\n`;
            msg += `وقت التقييم: ${timestamp}\n`;
            msg += `تصنيف الخطورة: ${triageLabelMap[clinicalData.highestTriageLevel as keyof typeof triageLabelMap]}\n\n`;
            msg += `👩‍⚕️ *الديموغرافيا:* العمر: ${clinicalData.demographics.age || 'غير محدد'} | الجنس: ${clinicalData.demographics.gender || 'غير محدد'} ${clinicalData.demographics.pregnancy === 'pregnant' ? '(🤰 حامل)' : ''}\n\n`;
            msg += `*الشكوى الرئيسية (Primary):* ${primaryCat}\n`;
            if (secondaryCats) msg += `*الأعراض المصاحبة (Secondary):* ${secondaryCats}\n`;
            if (clinicalData.openNarrative) msg += `\n*وصف المريض الحرفي:*\n"${clinicalData.openNarrative}"\n\n`;
            msg += `*الأبعاد السريرية (SOCRATES):*\n`;
            msg += `- شدتة الأعراض: ${clinicalData.socratesAnswers.severity || 5}/10\n`;
            msg += `- البداية: ${clinicalData.socratesAnswers.onset || '-'}\n`;
            msg += `- المدة: ${clinicalData.socratesAnswers.duration || '-'}\n`;
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
            msg += `*التاريخ الطبي والأدوية:*\n`;
            msg += `- الأمراض المزمنة: ${clinicalData.pastMedicalHistory.length > 0 && clinicalData.pastMedicalHistory[0] ? clinicalData.pastMedicalHistory.join('، ') : 'لا يوجد التاريخ'}\n`;
            msg += `- الأدوية الحالية: ${clinicalData.currentMeds || 'لا يوجد'}\n`;
            msg += `- حساسية: ${clinicalData.allergies || 'لا يوجد'}\n\n`;
            
            // Psychosomatic Context for Patient/WhatsApp
            msg += `*النمط التشخيصي الشعوري والجسدي:*\n`;
            msg += `- ارتباط الأعراض مع مستوى التوتر والمحفزات: ${clinicalData.emotionalState.stress}/10\n`;
            msg += `- جودة النوم: ${clinicalData.emotionalState.sleep || 'غير محدد'}\n`;
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

    const handleExport = (target: 'doctor' | 'patient' | 'whatsapp') => {
        const text = generateSummaryText(target);
        if (target === 'whatsapp') {
            const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
        } else {
            navigator.clipboard.writeText(text);
            toast.success(`تم النسخ بنجاح!`, { body: target === 'doctor' ? 'تم نسخ التقرير الطبي الموحد (SOAP Note)' : 'تم نسخ الملخص الشخصي المبسط.'});
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className={`flex-1 flex flex-col overflow-y-auto transition-all ${clinicalData.hasUrgentRedFlag ? 'border-t-4 border-rose-500 shadow-rose-500/20' : ''}`} data-accent="medical"
            >
                {/* Urgent Header Banner */}
                {clinicalData.hasUrgentRedFlag && step !== 'analyzing' && step !== 'welcome' && step !== 'complete' && step !== 'review' && (
                    <div className="bg-rose-500 text-white text-[11px] font-bold text-center py-2 flex justify-center items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        حالة طارئة: تم تفعيل مسار التوثيق المختصر
                    </div>
                )}

                {/* Progress Bar Header */}
                {step !== 'welcome' && step !== 'analyzing' && step !== 'complete' && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800">
                        <motion.div
                            className={`h-full ${clinicalData.hasUrgentRedFlag ? 'bg-rose-500' : 'bg-gradient-to-r from-teal-400 to-indigo-500'}`}
                            initial={{ width: 0 }}
                            animate={{
                                width:
                                    step === 'demographics' ? '8%' :
                                    step === 'chief_complaint' ? '15%' :
                                        step === 'primary_selection' ? '25%' :
                                            step === 'routing_validation' ? '30%' :
                                                step === 'red_flags' ? '40%' :
                                                    step === 'hpi_dynamic' ? '50%' :
                                                        step === 'socrates' ? '65%' :
                                                            step === 'pmh' ? '80%' :
                                                                step === 'review' ? '95%' : '100%'
                            }}
                        />
                    </div>
                )}

                <div className="p-5 pt-6 relative z-10 min-h-[250px]">
                    <AnimatePresence mode="wait">

                        {/* 1. WELCOME */}
                        {step === 'welcome' && (
                            <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center py-2">
                                <div className="w-16 h-16 mx-auto rounded-3xl flex items-center justify-center shadow-lg mb-4 bg-gradient-to-br from-teal-500 to-indigo-600 shadow-teal-500/25">
                                    <Stethoscope className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-[17px] font-black text-slate-800 dark:text-white mb-2">التقييم السريري الخبير</h3>
                                <p className="text-[12px] text-slate-500 font-medium mb-6 leading-relaxed">
                                    نظام يجمع الأعراض ويصنف خطورتها ويدمجها في تقرير طبي دقيق شامل يمكن للطبيب قراءته فوراً. ثق بنا، نحن نهتم بأدق التفاصيل.
                                </p>
                                <div className="space-y-3 mt-auto flex flex-col gap-3">
                                    {isDraftAvailable && (
                                        <button onClick={() => loadDraft()} className="w-full py-3.5 rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-[13px] flex items-center justify-center gap-2">
                                            <Save className="w-4 h-4" /> استكمال الجلسة المحفوظة سابقاً
                                        </button>
                                    )}
                                    <button onClick={() => { updateData('orientation', 'new_issue'); haptic.selection(); setStep('demographics'); }} className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[13px] shadow-lg hover:scale-[1.02] transition-transform">
                                        بدء تسجيل الأعراض الطبية
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 1.5 DEMOGRAPHICS */}
                        {step === 'demographics' && (
                            <motion.div key="dem" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white flex items-center gap-2"><UserCog className="w-4 h-4 text-indigo-500" /> المعلومات الأولية</h4>
                                    <button onClick={handleNavigateBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5"/></button>
                                </div>
                                <p className="text-[11px] text-slate-500 mb-5 border-b pb-4">تؤثر هذه المعلومات بشدة على طبيعة الأسئلة الطبية الموجهة لك ومسارات الخطر.</p>

                                <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                    <div>
                                        <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-2">الفئة العمرية:</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['طفل (0-14)', 'شاب (15-35)', 'بالغ (36-60)', 'كبير سن (+60)'].map(a => (
                                                <button key={a} onClick={() => updateData('demographics', { ...clinicalData.demographics, age: a })} className={`p-2.5 rounded-lg text-[11px] font-bold border transition-colors ${clinicalData.demographics.age === a ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>{a}</button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-2">الجنس البيولوجي:</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => updateData('demographics', { ...clinicalData.demographics, gender: 'ذكر' })} className={`flex-1 p-2.5 rounded-lg text-[11px] font-bold border transition-colors ${clinicalData.demographics.gender === 'ذكر' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>ذكر</button>
                                            <button onClick={() => updateData('demographics', { ...clinicalData.demographics, gender: 'أنثى' })} className={`flex-1 p-2.5 rounded-lg text-[11px] font-bold border transition-colors ${clinicalData.demographics.gender === 'أنثى' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>أنثى</button>
                                        </div>
                                    </div>

                                    {clinicalData.demographics.gender === 'أنثى' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg border border-rose-100 dark:border-rose-900/50 mt-2">
                                                <label className="text-[12px] font-bold text-rose-700 block mb-2">هل يوجد احتمالية حمل بالوقت الحالي؟</label>
                                                <div className="flex gap-2">
                                                    <button onClick={() => updateData('demographics', { ...clinicalData.demographics, pregnancy: 'pregnant' })} className={`flex-1 p-2 rounded-lg text-[11px] font-bold border transition-colors ${clinicalData.demographics.pregnancy === 'pregnant' ? 'bg-rose-500 text-white border-rose-500 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>نعم محتمل</button>
                                                    <button onClick={() => updateData('demographics', { ...clinicalData.demographics, pregnancy: 'none' })} className={`flex-1 p-2 rounded-lg text-[11px] font-bold border transition-colors ${clinicalData.demographics.pregnancy === 'none' ? 'bg-slate-700 text-white border-slate-700 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>لا غير محتمل</button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <button disabled={!clinicalData.demographics.age || !clinicalData.demographics.gender || (clinicalData.demographics.gender === 'أنثى' && !clinicalData.demographics.pregnancy)} 
                                        onClick={() => { haptic.selection(); setStep('chief_complaint'); }} 
                                        className="w-full py-3.5 mt-6 rounded-xl bg-indigo-600 text-white font-bold text-[13px] disabled:opacity-40 shadow-sm flex-shrink-0">
                                    متابعة للأعراض
                                </button>
                            </motion.div>
                        )}

                        {/* 2. CHIEF COMPLAINT (MULTI-SELECT) */}
                        {step === 'chief_complaint' && (
                            <motion.div key="cc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white mb-1">حدد الأعراض الحالية</h4>
                                        <p className="text-[11px] text-slate-500">اختر تصنيفاً أو أكثر لشكواك اليوم</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button onClick={handleNavigateBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5"/></button>
                                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">{clinicalData.chiefComplaintCategories.length} محدد</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-5 max-h-[160px] overflow-y-auto custom-scrollbar pb-1">
                                    {Object.values(clinicalPathways).map(cat => {
                                        const isSelected = clinicalData.chiefComplaintCategories.includes(cat.id);
                                        const IconComponent = IconMap[cat.iconName] || Activity;
                                        return (
                                            <button
                                                key={cat.id} onClick={() => handleCCSelection(cat.id)}
                                                className={`p-2.5 rounded-xl border flex items-center justify-start gap-3 transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
                                            >
                                                <IconComponent className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                                                <span className={`text-[11px] font-bold text-right leading-tight ${isSelected ? 'text-indigo-700' : 'text-slate-600 dark:text-slate-300'}`}>{cat.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>

                                <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        أو يمكنك كتابة التفاصيل مباشرة وسنقوم بتصنيفها وتحليلها:
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="مثال: أحس بالم شديد في أسفل البطن جهة اليمين ومعاه غثيان وحرارة..."
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 transition-all custom-scrollbar"
                                        value={clinicalData.openNarrative}
                                        onChange={(e) => updateData('openNarrative', e.target.value)}
                                    />
                                    <button
                                        disabled={clinicalData.chiefComplaintCategories.length === 0 && clinicalData.openNarrative.length < 5}
                                        onClick={proceedFromChiefComplaint}
                                        className="w-full py-3.5 mt-3 rounded-xl bg-indigo-600 text-white font-bold text-[13px] disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity"
                                    >
                                        التالي <ArrowLeft className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 2.5 PRIMARY SELECTION (If multiple) */}
                        {step === 'primary_selection' && (
                            <motion.div key="primary_sel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full text-center py-2 relative">
                                <button onClick={handleNavigateBack} className="absolute top-0 right-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5"/></button>
                                <div className="w-14 h-14 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 mt-2">
                                    <ListChecks className="w-7 h-7" />
                                </div>
                                <h4 className="text-[16px] font-extrabold text-slate-800 dark:text-white mb-2">ما هو العرض الأكثر إزعاجاً؟</h4>
                                <p className="text-[12px] text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                                    لقد قمت باختيار أعراض متعددة. لترتيب أولويات التقييم بشكل طبي سليم، الرجاء تحديد العرض الأقوى (الشكوى الرئيسية Primary Complaint):
                                </p>

                                <div className="space-y-2 mt-auto text-right">
                                    {clinicalData.chiefComplaintCategories.map(cat => (
                                        <button
                                            key={cat} onClick={() => {
                                                haptic.selection();
                                                updateData('primaryComplaintId', cat);
                                            }}
                                            className={`w-full p-4 rounded-xl border-2 transition-all flex justify-between items-center ${clinicalData.primaryComplaintId === cat ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                                        >
                                            <span className="font-bold text-[13px]">{clinicalPathways[cat]?.label}</span>
                                            {clinicalData.primaryComplaintId === cat && <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm" />}
                                        </button>
                                    ))}

                                    <button
                                        disabled={!clinicalData.primaryComplaintId}
                                        onClick={() => { haptic.selection(); setStep('red_flags'); }}
                                        className="w-full py-3.5 mt-4 rounded-xl bg-slate-900 text-white font-bold text-[13px] disabled:opacity-50"
                                    >
                                        تأكيد ومتابعة التقييم
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 2.7 ROUTING VALIDATION / CONFLICT RESOLUTION */}
                        {step === 'routing_validation' && (
                            <motion.div key="routing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col h-full text-center py-2 relative">
                                <button onClick={handleNavigateBack} className="absolute top-0 right-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5"/></button>
                                <div className="w-14 h-14 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 ring-4 ring-amber-50 mt-2">
                                    <Brain className="w-7 h-7" />
                                </div>
                                <h4 className="text-[16px] font-extrabold text-slate-800 dark:text-white mb-2">تحليل النص والأعراض</h4>
                                <p className="text-[12px] text-slate-600 dark:text-slate-400 mb-5 leading-relaxed px-2">
                                    لقد اخترت مساراً معيناً، لكن وصفك النصي يوحي بوجود أعراض بارزة تخص: <br />
                                    <strong className="text-indigo-600 text-[13px] inline-block mt-2">
                                        {clinicalData.suggestedCategories.map(c => clinicalPathways[c]?.label).join('، ')}
                                    </strong>
                                </p>

                                <div className="space-y-3 mt-auto flex flex-col items-center">
                                    <p className="text-[11px] font-bold text-slate-400 mb-1">اختر الإجراء الأنسب لحالتك:</p>

                                    <button onClick={() => handleRoutingDecision('switch')} className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold text-[12px] text-right">
                                        تغيير شكواي الرئيسية لتصبح ({clinicalPathways[clinicalData.suggestedCategories[0]]?.label})
                                    </button>
                                    <button onClick={() => handleRoutingDecision('add')} className="w-full p-3 rounded-xl border-2 border-indigo-200 text-indigo-700 bg-indigo-50 font-bold text-[12px] text-right">
                                        إبقاء اختياري وإضافة هذه الأعراض كشكوى ثانوية
                                    </button>
                                    <button onClick={() => handleRoutingDecision('ignore')} className="w-full p-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-[12px] text-center">
                                        تجاهل الاقتراح، وتكملة التقييم باختياري فقط
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. RED FLAGS TRIAGE */}
                        {step === 'red_flags' && activeRedFlags.length > 0 && activeRedFlags[currentRedFlagIndex] && (
                            <motion.div key="rf" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                                        <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white">أسئلة أمان حيوية (Triage)</h4>
                                    </div>
                                    <button onClick={() => { if (currentRedFlagIndex > 0) setCurrentRedFlagIndex(p => p - 1); else handleNavigateBack(); }} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5"/></button>
                                </div>
                                <p className="text-[11px] text-slate-500 mb-4 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">للحرص على سلامتك واستبعاد الخطورة وتوجيهك فوراً إذا لزم، يرجى الإجابة بالنفي أو التأكيد:</p>

                                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/50 mb-auto mt-2">
                                    <p className="text-[14px] font-bold text-slate-800 dark:text-slate-200 leading-relaxed mb-6 text-center">
                                        "{activeRedFlags[currentRedFlagIndex].text}"
                                    </p>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleRedFlagAnswer(activeRedFlags[currentRedFlagIndex], true)} className="flex-1 py-3 text-[13px] font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-500/30 transition-colors">نعم (يوجد)</button>
                                        <button onClick={() => handleRedFlagAnswer(activeRedFlags[currentRedFlagIndex], false)} className="flex-1 py-3 text-[13px] font-bold text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl transition-colors">لا (سليم)</button>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-center gap-1.5 opacity-60">
                                    {activeRedFlags.map((_, i) => (
                                        <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentRedFlagIndex ? 'w-5 bg-rose-500' : i < currentRedFlagIndex ? 'w-1.5 bg-rose-300' : 'w-1.5 bg-slate-200'}`} />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* 4. DYNAMIC HPI (Skip if red flag triggered) */}
                        {step === 'hpi_dynamic' && activeQuestions[currentDynamicQIndex] && (
                            <motion.div key="hpi_dyn" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[14px] font-extrabold text-indigo-700 flex items-center gap-2">
                                        <Brain className="w-4 h-4" /> تفاصيل الأعراض
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{currentDynamicQIndex + 1} / {activeQuestions.length}</span>
                                        <button onClick={() => { if (currentDynamicQIndex > 0) setCurrentDynamicQIndex(p => p - 1); else handleNavigateBack(); }} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5"/></button>
                                    </div>
                                </div>

                                {(() => {
                                    const q = activeQuestions[currentDynamicQIndex];
                                    return (
                                        <div className="mb-6 flex-1">
                                            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 mb-4 leading-relaxed">{q.text}</p>

                                            {q.type === 'single' && (
                                                <div className="space-y-2 max-h-[170px] overflow-y-auto custom-scrollbar pr-1">
                                                    {q.options?.map(opt => (
                                                        <button
                                                            key={opt} onClick={() => { updateData('hpiAnswers', { ...clinicalData.hpiAnswers, [q.id]: opt }); haptic.selection(); }}
                                                            className={`w-full p-3 rounded-xl border text-right transition-all text-[12px] font-bold ${clinicalData.hpiAnswers[q.id] === opt ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {q.type === 'multiple' && (
                                                <div className="space-y-2 max-h-[170px] overflow-y-auto custom-scrollbar pr-1">
                                                    {[...(q.options || []), NONE_OPTION].map(opt => {
                                                        const isSelected = (clinicalData.hpiAnswers[q.id] || []).includes(opt);
                                                        const isNone = opt === NONE_OPTION;
                                                        return (
                                                            <button
                                                                key={opt} onClick={() => toggleHpiMulti(q.id, opt)}
                                                                className={`w-full p-3 rounded-xl border flex justify-between items-center transition-all text-[12px] font-bold ${isSelected ? (isNone ? 'bg-slate-700 text-white border-slate-700' : 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm') : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                                                            >
                                                                {opt}
                                                                <div className={`w-4 h-4 rounded-sm border ${isSelected ? (isNone ? 'bg-slate-700 border-slate-700' : 'bg-indigo-600 border-indigo-600') : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center`}>
                                                                    {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                                </div>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })()}

                                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={() => {
                                            if (currentDynamicQIndex > 0) setCurrentDynamicQIndex(p => p - 1);
                                            else handleNavigateBack();
                                        }}
                                        className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            haptic.selection();
                                            if (currentDynamicQIndex < activeQuestions.length - 1) {
                                                setCurrentDynamicQIndex(p => p + 1);
                                            } else {
                                                setStep('socrates');
                                            }
                                        }}
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-[13px] flex justify-center items-center gap-2"
                                    >
                                        التالي <ChevronLeft className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 5. SOCRATES / DURATION */}
                        {step === 'socrates' && (
                            <motion.div key="soc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white">التاريخ والشدة العامة</h4>
                                    <button onClick={handleNavigateBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5"/></button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">{socratesQuestions[0].text}</label>
                                        <div className="flex flex-wrap gap-2">
                                            {socratesQuestions[0].options?.map(opt => (
                                                <button key={opt} onClick={() => updateData('socratesAnswers', { ...clinicalData.socratesAnswers, onset: opt })} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-colors ${clinicalData.socratesAnswers.onset === opt ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">تقييم شدة الإزعاج أو الألم (10 الأسوأ)</label>
                                            <span className="text-[12px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shadow-sm">{clinicalData.socratesAnswers.severity || 5} / 10</span>
                                        </div>
                                        <input
                                            type="range" min="1" max="10"
                                            value={clinicalData.socratesAnswers.severity || 5}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setClinicalData(prev => {
                                                    const escalating = val >= 9;
                                                    const currentObjLevel = TRIAGE_PRIORITY[prev.highestTriageLevel as keyof typeof TRIAGE_PRIORITY] || 1;
                                                    const newLevel = escalating ? 'urgent_sameday' : prev.highestTriageLevel;
                                                    const finalLevel = escalating && TRIAGE_PRIORITY.urgent_sameday > currentObjLevel ? 'urgent_sameday' : prev.highestTriageLevel;
                                                    return {
                                                        ...prev,
                                                        socratesAnswers: { ...prev.socratesAnswers, severity: val },
                                                        highestTriageLevel: finalLevel
                                                    };
                                                });
                                            }}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-1"
                                        />
                                    </div>

                                    {/* Hide pattern on urgent shortened flow */}
                                    {!clinicalData.hasUrgentRedFlag && (
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">مسار وتطور الشكوى مع الوقت</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {socratesQuestions[3].options?.map(opt => (
                                                    <button key={opt} onClick={() => updateData('socratesAnswers', { ...clinicalData.socratesAnswers, pattern: opt })} className={`px-2 py-2 text-[10px] font-bold rounded-lg text-center border transition-colors ${clinicalData.socratesAnswers.pattern === opt ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button onClick={() => { haptic.selection(); setStep('pmh'); }} className="w-full py-3 mt-auto rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[13px] shadow-lg">
                                    التالي: التاريخ الطبي
                                </button>
                            </motion.div>
                        )}

                        {/* 6. PMH / MEDS / ALLERGIES */}
                        {step === 'pmh' && (
                            <motion.div key="pmh" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white">تاريخ طبي سريع (مهم للطبيب)</h4>
                                    <button onClick={handleNavigateBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5"/></button>
                                </div>

                                <div className="space-y-4 mb-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">أمراض مزمنة أو عمليات جراحية</label>
                                        <textarea
                                            placeholder="سكري، ضغط، ربو، عملية زائدة، الخ..." rows={2}
                                            value={clinicalData.pastMedicalHistory.join(', ')}
                                            onChange={(e) => updateData('pastMedicalHistory', e.target.value.split(',').map(s => s.trim()))}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">الأدوية الحالية المؤثرة</label>
                                        <textarea
                                            placeholder="اكتب الأدوية أو المكملات التي تتناولها بانتظام..." rows={1}
                                            value={clinicalData.currentMeds} onChange={(e) => updateData('currentMeds', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">حساسية من أدوية أو أشياء أخرى</label>
                                        <textarea
                                            placeholder="حساسية بنسيلين، أسبرين، غذاء، الخ... (أو اترك فارغاً)" rows={1}
                                            value={clinicalData.allergies} onChange={(e) => updateData('allergies', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <button onClick={() => setStep('emotional')} className="w-full py-3 mt-auto rounded-xl bg-slate-800 text-white font-bold text-[13px] shadow-lg flex justify-center items-center gap-2">
                                    التالي: التقييم الشعوري <Brain className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                        {/* 6.5 EMOTIONAL STATE */}
                        {step === 'emotional' && (
                            <motion.div key="emotional" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-indigo-500" /> البعد التشخيصي النفس-جسدي
                                    </h4>
                                    <button onClick={handleNavigateBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5"/></button>
                                </div>
                                <div className="space-y-4 mb-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
                                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                        <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-bold leading-relaxed mb-3">
                                            جزء أساسي من نموذجنا السريري هو <span className="font-bold text-slate-800">التشخيص الشعوري</span> لتحديد <span className="font-bold text-slate-800">النمط التشخيصي الشعوري</span> الموازي للأعراض. هذه القراءة التشخيصية المتكاملة حاسمة في دقة خطة العلاج.
                                        </p>
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700/50">
                                            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                                                <span className="text-indigo-600 font-bold block mb-1">الارتباط التشخيصي المحتمل للاستجابة الجسدية المحددة:</span>
                                                {getEmotionalPrompt(clinicalData.primaryComplaintId)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">مستوى الضغط والتوتر الحالي (10 الأعلى)</label>
                                            <span className="text-[12px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shadow-sm">{clinicalData.emotionalState.stress} / 10</span>
                                        </div>
                                        <input
                                            type="range" min="1" max="10"
                                            value={clinicalData.emotionalState.stress}
                                            onChange={(e) => updateData('emotionalState', { ...clinicalData.emotionalState, stress: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-1"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">حالة جودة النوم ومشاكله</label>
                                        <select
                                            value={clinicalData.emotionalState.sleep}
                                            onChange={(e) => updateData('emotionalState', { ...clinicalData.emotionalState, sleep: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="">اختر حالة النوم...</option>
                                            <option value="good">نوم عميق ومريح</option>
                                            <option value="tired_morning">صعوبة استيقاظ وخمول (تفكير زائد)</option>
                                            <option value="insomnia">أرق وصعوبة في الدخول بالنوم</option>
                                            <option value="interrupted">استيقاظ متكرر في منتصف الليل</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">هل تلاحظ عوامل شعورية أخرى أو محفزات توتر مؤخراً؟ (اختياري)</label>
                                        <textarea
                                            placeholder="اكتب باختصار لربط الجانب الجسدي بالشعوري للطبيب..." rows={2}
                                            value={clinicalData.emotionalState.details} onChange={(e) => updateData('emotionalState', { ...clinicalData.emotionalState, details: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <input
                                            type="checkbox"
                                            id="repeatedPattern"
                                            checked={clinicalData.emotionalState.repeated_pattern_flag}
                                            onChange={(e) => updateData('emotionalState', { ...clinicalData.emotionalState, repeated_pattern_flag: e.target.checked })}
                                            className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                                        />
                                        <label htmlFor="repeatedPattern" className="text-[12px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex-1">
                                            علامة تكرار النمط: هل تلاحظ تكرار هذا العرض الجسدي دائماً مع نفس المشاعر أو المواقف؟
                                        </label>
                                    </div>
                                </div>
                                <button onClick={() => setStep('review')} className="w-full py-3 mt-auto rounded-xl bg-slate-800 text-white font-bold text-[13px] shadow-lg flex justify-center items-center gap-2">
                                    المراجعة قبل التحليل <FileText className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                        {/* 7. REVIEW SCREEN */}
                        {step === 'review' && (
                            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white mb-1">مراجعة التقييم 📝</h4>
                                        <p className="text-[11px] text-slate-500">التقرير النهائي جاهز، راجع بياناتك</p>
                                    </div>
                                    <button onClick={() => setStep('welcome')} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 relative group">
                                        <button onClick={() => setStep('demographics')} className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-700 p-1.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-600 text-indigo-600"><Edit3 className="w-3.5 h-3.5" /></button>
                                        <h5 className="text-[11px] font-bold text-indigo-600 mb-2 flex items-center gap-1.5"><UserCog className="w-3.5 h-3.5"/> بيانات ديموغرافية</h5>
                                        <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">
                                            {clinicalData.demographics.age} • {clinicalData.demographics.gender} {clinicalData.demographics.pregnancy === 'pregnant' ? '• (محتمل حمل)' : ''}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 relative group">
                                        <button onClick={() => setStep('chief_complaint')} className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-700 p-1.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-600 text-indigo-600"><Edit3 className="w-3.5 h-3.5" /></button>
                                        <h5 className="text-[11px] font-bold text-indigo-600 mb-2 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> الشكوى الرئيسية</h5>
                                        <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{clinicalPathways[clinicalData.primaryComplaintId || '']?.label || 'غير محدد'}</p>
                                        {clinicalData.openNarrative && <p className="text-[11px] text-slate-500 mt-1">"{clinicalData.openNarrative}"</p>}
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 relative group">
                                        <button onClick={() => setStep('socrates')} className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-700 p-1.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-600 text-indigo-600"><Edit3 className="w-3.5 h-3.5" /></button>
                                        <h5 className="text-[11px] font-bold text-indigo-600 mb-2 flex items-center gap-1.5"><HeartPulse className="w-3.5 h-3.5"/> حدة الأعراض والألم</h5>
                                        <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{clinicalData.socratesAnswers.severity || 5} / 10</p>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 relative group">
                                        <button onClick={() => setStep('pmh')} className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-700 p-1.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-600 text-indigo-600"><Edit3 className="w-3.5 h-3.5" /></button>
                                        <h5 className="text-[11px] font-bold text-indigo-600 mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5"/> التاريخ والأدوية</h5>
                                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"><span className="font-bold">مزمنة:</span> {clinicalData.pastMedicalHistory.length > 0 && clinicalData.pastMedicalHistory[0] ? clinicalData.pastMedicalHistory.join('، ') : 'لا يوجد'}</p>
                                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400"><span className="font-bold">أدوية:</span> {clinicalData.currentMeds || 'لا يوجد'}</p>
                                    </div>
                                    
                                    <div className="mt-2">
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">ملاحظات حرة إضافية للطبيب (اختياري)</label>
                                        <textarea
                                            placeholder="كتابة أي شيء تود إضافته للطبيب هنا..." rows={2}
                                            value={clinicalData.additionalNotes} onChange={(e) => updateData('additionalNotes', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border-[1.5px] border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:border-indigo-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-auto pt-2">
                                    <button onClick={() => {
                                        setStep('analyzing');
                                        performAnalysis(clinicalData);
                                    }} className={`w-full py-4 rounded-xl text-white shadow-lg font-bold text-[14px] flex items-center justify-center gap-2 relative overflow-hidden group ${clinicalData.highestTriageLevel === 'emergency' ? 'bg-rose-600' : clinicalData.highestTriageLevel === 'urgent_sameday' ? 'bg-orange-500' : 'bg-gradient-to-r from-teal-500 to-indigo-600'}`}>
                                        {clinicalData.highestTriageLevel === 'emergency' || clinicalData.highestTriageLevel === 'urgent_sameday' ? <AlertTriangle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                        إصدار التقرير النهائي
                                    </button>
                                </div>
                            </motion.div>
                        )}


                        {/* 8. ANALYZING */}
                        {step === 'analyzing' && (
                            <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 h-full space-y-4">
                                <div className="relative">
                                    <div className={`w-16 h-16 rounded-full border-4 ${clinicalData.hasUrgentRedFlag ? 'border-rose-100' : 'border-slate-100 dark:border-slate-800'}`} />
                                    <div className={`w-16 h-16 rounded-full border-4 ${clinicalData.hasUrgentRedFlag ? 'border-rose-500' : 'border-indigo-600'} border-t-transparent animate-spin absolute inset-0`} />
                                    <Brain className={`w-6 h-6 ${clinicalData.hasUrgentRedFlag ? 'text-rose-500' : 'text-indigo-600'} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse`} />
                                </div>
                                <div className="text-center space-y-1 mt-2">
                                    <h4 className={`text-[15px] font-black ${clinicalData.hasUrgentRedFlag ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>جاري التوليف السريري الشامل...</h4>
                                    <p className="text-[11px] text-slate-500">يقوم النظام بترتيب معطياتك المتعددة كتقييم موحد</p>
                                </div>
                            </motion.div>
                        )}

                        {/* 9. SMART TRIAGE OUTCOME (Complete) */}
                        {step === 'complete' && (() => {
                            const level = clinicalData.highestTriageLevel;
                            const isEmergency = level === 'emergency';
                            const isUrgent = level === 'urgent_sameday';
                            const isNearReview = level === 'near_review';
                            const isRoutine = level === 'routine';
                            const complaintId = clinicalData.primaryComplaintId || 'other';
                            const suggestionMeta = getComplaintSuggestionMeta(complaintId);
                            const suggestedProducts = getRelevantProducts(complaintId, localProducts);
                            const analysisCount = Object.keys(clinicalData.hpiAnswers).length + activeRedFlags.length + socratesQuestions.length;

                            return (
                            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full">
                                {!clinicalData.hasUrgentRedFlag && <Confetti show={showConfetti} />}

                                {/* Status Header */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                                        isEmergency ? 'bg-rose-100 text-rose-600' : 
                                        isUrgent ? 'bg-orange-100 text-orange-600' : 
                                        isNearReview ? 'bg-amber-100 text-amber-600' : 
                                        'bg-emerald-100 text-emerald-600'
                                    }`}>
                                        {isEmergency || isUrgent ? <ShieldAlert className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-black text-slate-800 dark:text-white leading-tight">
                                            {isEmergency ? 'حالة طوارئ — تصرف فوراً' : 
                                             isUrgent ? 'حالة عاجلة — راجع طبيبك اليوم' :
                                             isNearReview ? 'التقرير جاهز — ننصحك بمراجعة الطبيب قريباً' :
                                             'التقرير جاهز — حالتك مطمئنة'}
                                        </h4>
                                        <p className={`text-[11px] font-bold ${
                                            isEmergency ? 'text-rose-500' : 
                                            isUrgent ? 'text-orange-500' :
                                            isNearReview ? 'text-amber-500' :
                                            'text-emerald-500'
                                        }`}>
                                            {isEmergency ? '🔴 طوارئ قصوى — الرجاء التوجه فوراً' : 
                                             isUrgent ? '🟠 ' + clinicalData.redFlagsTriggered.length + ' علامة خطر مؤكدة' :
                                             isNearReview ? '🟡 يُفضل المتابعة الطبية' :
                                             '🟢 لم يُرصد خطر فوري'}
                                        </p>
                                    </div>
                                </div>

                                {/* Trust Analysis Badge */}
                                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg px-3 py-2 mb-4 border border-indigo-100 dark:border-indigo-800">
                                    <Brain className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                    <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                        تم تحليل {analysisCount} نقطة سريرية وتصنيف حالتك بدقة عبر النظام الذكي
                                    </p>
                                </div>

                                {/* AI Clinical Insight */}
                                {aiResult && !isEmergency && (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                                        <div>
                                            <h5 className="text-[13px] font-black text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                                                <Stethoscope className="w-4 h-4 text-indigo-600" /> التحليل السريري للذكاء الاصطناعي
                                            </h5>
                                            <p className="text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                                                {aiResult.clinical_insight}
                                            </p>
                                        </div>
                                        <div className="h-px w-full bg-slate-100 dark:bg-slate-800/80" />
                                        <div>
                                            <h5 className="text-[13px] font-black text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                                                <Wind className="w-4 h-4 text-emerald-600" /> التشخيص الشعوري المدمج
                                            </h5>
                                            <p className="text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                                                {aiResult.emotional_insight}
                                            </p>
                                        </div>
                                        {aiResult.holistic_advice && aiResult.holistic_advice.length > 0 && (
                                            <>
                                                <div className="h-px w-full bg-slate-100 dark:bg-slate-800/80" />
                                                <div className="flex gap-2 items-start mt-2">
                                                    <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                        {aiResult.holistic_advice[0]}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* ===== SMART ROUTING BY URGENCY ===== */}
                                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-2">

                                    {/* 🔴 EMERGENCY: Call 997 + WhatsApp */}
                                    {isEmergency && (
                                        <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-300 rounded-xl p-4 space-y-3">
                                            <p className="text-[12px] font-bold text-rose-700 dark:text-rose-300 leading-relaxed text-center">
                                                بناءً على {clinicalData.redFlagsTriggered.length} علامة خطر تم تأكيدها، هذه الحالة تتطلب تدخلاً طبياً فورياً.
                                            </p>
                                            <a href="tel:997" className="w-full py-3 bg-rose-600 text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30">
                                                <PhoneCall className="w-5 h-5" /> الاتصال بالإسعاف (997)
                                            </a>
                                            <button onClick={() => handleExport('whatsapp')} className="w-full py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-[12px] flex justify-center items-center gap-2">
                                                <MessageCircle className="w-4 h-4" /> إرسال التقرير لطبيبك عبر واتساب
                                            </button>
                                        </div>
                                    )}

                                    {/* 🟠 URGENT: Book appointment NOW + WhatsApp */}
                                    {isUrgent && (
                                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 rounded-xl p-4 space-y-3">
                                            <p className="text-[12px] font-bold text-orange-700 dark:text-orange-300 leading-relaxed text-center">
                                                ننصح بمراجعة الطبيب اليوم. سيصل الطبيب تقريرك المفصل مسبقاً لتوفير وقتك.
                                            </p>
                                            <Link href={`/book-appointment?triage=urgent&complaint=${complaintId}`}>
                                                <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25">
                                                    <Stethoscope className="w-5 h-5" /> احجز استشارة عاجلة الآن
                                                </button>
                                            </Link>
                                            <button onClick={() => handleExport('whatsapp')} className="w-full py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-[12px] flex justify-center items-center gap-2">
                                                <MessageCircle className="w-4 h-4" /> إرسال التقرير عبر واتساب
                                            </button>
                                        </div>
                                    )}

                                    {/* 🟢🟡 ROUTINE/NEAR: Education + Export + Shop suggestions */}
                                    {(isRoutine || isNearReview) && (
                                        <>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                                                <p className="text-[12px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed text-center">
                                                    {isNearReview 
                                                        ? 'أعراضك تستدعي مراجعة الطبيب قريباً. أرسل التقرير واحجز موعداً مناسباً.' 
                                                        : 'رائع! لا توجد مؤشرات خطر واضحة. يمكنك مشاركة التقرير مع طبيبك للاطمئنان.'}
                                                </p>
                                                <button onClick={() => handleExport('whatsapp')} className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-[14px] flex justify-center items-center gap-2 shadow-lg shadow-[#25D366]/30 transition-all">
                                                    <MessageCircle className="w-5 h-5" /> إرسال التقرير للطبيب (WhatsApp)
                                                </button>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button onClick={() => handleExport('doctor')} className="py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex flex-col justify-center items-center gap-1.5 transition-all">
                                                        <Activity className="w-4 h-4" /> نسخ SOAP
                                                    </button>
                                                    <button onClick={() => handleExport('patient')} className="py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex flex-col justify-center items-center gap-1.5 transition-all">
                                                        <UserCog className="w-4 h-4" /> ملخص مبسط
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Book for follow-up */}
                                            {isNearReview && (
                                                <Link href={`/book-appointment?complaint=${complaintId}`}>
                                                    <button className="w-full py-3 rounded-xl border-2 border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 font-bold text-[13px] flex items-center justify-center gap-2">
                                                        <Stethoscope className="w-4 h-4" /> احجز موعد متابعة
                                                    </button>
                                                </Link>
                                            )}

                                            {/* Smart Product Suggestions */}
                                            {suggestedProducts.length > 0 && (
                                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800">
                                                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5" /> {suggestionMeta.emoji} {suggestionMeta.label}
                                                    </p>
                                                    <div className="space-y-2">
                                                        {suggestedProducts.map((p: any) => (
                                                            <Link key={p.id} href={`/shop?product=${p.id}`}>
                                                                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-2.5 border border-emerald-100 dark:border-emerald-800/50 hover:border-emerald-300 transition-colors">
                                                                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                                                                        {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-contain rounded-lg" /> : '💊'}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{p.name}</p>
                                                                        <p className="text-[10px] font-bold text-emerald-600">{p.price} ر.س</p>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <button onClick={() => setStep('welcome')} className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[13px] mt-auto">
                                    العودة للرئيسية وإغلاق
                                </button>
                            </motion.div>
                            );
                        })()}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
