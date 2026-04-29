// lib/result-engine/build-result-view-model.ts
// ════════════════════════════════════════════════════════════════
// Sprint E — Result Assembly Layer
//
// Pure function: takes raw engine outputs and returns a fully-typed
// ResultViewModel. StepResult consumes only this object.
//
// Rules:
//  - Deterministic: same inputs → same output, always
//  - No side effects
//  - No UI imports
//  - All Arabic copy lives here, not in UI components
// ════════════════════════════════════════════════════════════════

import type {
    EngineAnswers,
    TriageResult,
    RoutingResult,
    DomainId,
    ResultViewModel,
    ResultHeroBlock,
    ConfidencePhenotypeBlock,
    DomainCompassBlock,
    ResultInsightBlock,
    ConsistencyNoteBlock,
    KeySignalPresentation,
    ResultActionBlock,
    ResultMonitoringBlock,
    ResultEscalationBlock,
    TriDimBadgeBlock,
    RecommendationGroup,
    ResultPlanHandoffModel,
    EscalationBannerBlock,
    ResultStory,
    ResultStoryAction,
    ResultStorySignal,
    ResultStoryTimelineItem,
    ResultStoryNutritionState,
} from '@/components/health-engine/types';

import { PATHWAYS, FUNCTIONAL_PATTERN_INFO, SOMATIC_THEME_INFO } from '@/components/health-engine/constants';
import { DOMAIN_BY_ID } from '@/lib/domain-routing-map';
import { TRIAGE_META, DURATION_DISPLAY, SIGNAL_DIMENSION_EMOJI } from '@/components/health-engine/result/shared/design-tokens';
import { createPageUrl } from '@/utils';
import { buildRankedRecommendationGroups } from './rank-recommendations';
import { analyzeClinicalPrecision } from '@/lib/clinical-precision-engine';
import { analyzeTayyibatFromAssessment } from '@/lib/tayyibat-assessment-bridge';
import { analyzeMedicalHistoryForAssessment } from '@/lib/medical-history-bridge';
import {
    detectAssessmentContradictions,
    majorContradictionCount,
    totalContradictionPenalty,
    type AssessmentContradiction,
} from '@/lib/health-engine/contradiction-engine';
import { computeAssessmentConfidence, type AssessmentConfidence } from '@/lib/health-engine/confidence-engine';
import { refineTriage, type RefinedTriage } from '@/lib/health-engine/triage-refinement';
import { getDeepQuestionsForPathway } from '@/lib/clinical/deep-intake-questions';

function hasAnswer(value: unknown): boolean {
    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== '';
}

function selectedRedFlagTexts(answers: EngineAnswers): string[] {
    const pathway = PATHWAYS.find(p => p.id === answers.pathwayId);
    if (!pathway) return [];
    return answers.redFlags
        .map(id => pathway.redFlags.find(flag => flag.id === id)?.text)
        .filter((text): text is string => Boolean(text));
}

function buildSafetyAnswerBag(answers: EngineAnswers): Record<string, unknown> {
    return {
        ...answers.clinicalAnswers,
        duration: answers.duration,
        severity: answers.severity,
        redFlags: selectedRedFlagTexts(answers),
        hasEmergencyFlag: answers.hasEmergencyFlag,
    };
}

function buildPhase3SafetyContext(
    answers: EngineAnswers,
    triageResult: TriageResult,
    routing: RoutingResult,
    tayyibatVerdict: ReturnType<typeof analyzeTayyibatFromAssessment> | undefined,
): {
    confidence: AssessmentConfidence;
    contradictions: AssessmentContradiction[];
    refinedTriage: RefinedTriage;
} {
    const answerBag = buildSafetyAnswerBag(answers);
    const tayyibatForSafety = tayyibatVerdict?.isRelevant ? tayyibatVerdict : null;
    const contradictions = detectAssessmentContradictions({
        pathwayId: answers.pathwayId,
        severity: answers.severity,
        duration: answers.duration,
        answers: answerBag,
        clinicalAnswers: answerBag,
        emotionalAnswer: [...answers.emotionalContext, answers.emotionalNote].filter(Boolean).join(' '),
        adaptiveQuestionPlanSnapshot: answers.adaptiveQuestionPlanSnapshot
            ? {
                burdenMinimized: answers.adaptiveQuestionPlanSnapshot.burdenMinimized,
                safetyPrioritized: answers.adaptiveQuestionPlanSnapshot.safetyPrioritized,
            }
            : null,
        tayyibatVerdict: tayyibatForSafety
            ? {
                primaryPattern: tayyibatForSafety.primaryPattern,
                safetyGated: tayyibatForSafety.safetyGated,
                contradictionNotes: tayyibatForSafety.contradictionNotes,
                confidenceScore: tayyibatForSafety.confidenceScore,
            }
            : null,
        triageLevel: triageResult.level,
    });

    const refinedTriage = refineTriage({
        baseTriage: { level: triageResult.level, score: triageResult.score },
        pathwayId: answers.pathwayId,
        severity: answers.severity,
        answers: answerBag,
        explicitRedFlags: selectedRedFlagTexts(answers),
        contradictions,
    });

    const pathway = PATHWAYS.find(p => p.id === answers.pathwayId);
    const requiredQuestions = pathway?.clinicalQuestions ?? [];
    const deepQuestions = getDeepQuestionsForPathway(answers.pathwayId, answers.severity);
    const answeredRequiredCount = 2 + requiredQuestions.filter(q => hasAnswer(answers.clinicalAnswers[q.id])).length;
    const totalRequiredCount = 2 + requiredQuestions.length;
    const answeredOptionalCount = deepQuestions.filter(q => hasAnswer(answers.clinicalAnswers[q.id])).length;
    const redFlagClarity = answers.hasEmergencyFlag || answers.redFlags.length > 0
        ? 'clear_positive'
        : answers.adaptiveQuestionPlanSnapshot
            ? 'clear_negative'
            : 'unknown';

    const confidence = computeAssessmentConfidence({
        pathwayId: answers.pathwayId,
        severity: answers.severity,
        duration: answers.duration,
        answeredRequiredCount,
        totalRequiredCount,
        answeredOptionalCount,
        totalOptionalCount: deepQuestions.length,
        redFlagClarity,
        contradictionCount: contradictions.length,
        majorContradictionCount: majorContradictionCount(contradictions),
        phenotypeStrength: routing.phenotype?.matchScore ?? 0,
        adaptiveQuestionPlanSnapshot: answers.adaptiveQuestionPlanSnapshot ?? null,
        tayyibatVerdict: tayyibatForSafety
            ? {
                confidenceScore: tayyibatForSafety.confidenceScore,
                mealLogCountUsed: tayyibatForSafety.mealLogCountUsed,
                safetyGated: tayyibatForSafety.safetyGated,
                contradictionNotes: tayyibatForSafety.contradictionNotes,
            }
            : null,
        mealLogCount: tayyibatForSafety?.mealLogCountUsed ?? 0,
        engineConfidenceScore: routing.confidenceScore,
        triageLevel: refinedTriage.level,
    });

    return { confidence, contradictions, refinedTriage };
}

function applyRefinedTriage(
    triageResult: TriageResult,
    refinedTriage: RefinedTriage,
): TriageResult {
    if (refinedTriage.level === triageResult.level) return triageResult;
    const scoreFloor: Record<string, number> = {
        emergency: 10,
        urgent: 9,
        needs_doctor: 7,
        review: 4,
        manageable: 1,
    };

    return {
        ...triageResult,
        level: refinedTriage.level as TriageResult['level'],
        score: Math.max(scoreFloor[refinedTriage.level] ?? triageResult.score, triageResult.score),
        integrativeInsight: refinedTriage.reason || triageResult.integrativeInsight,
    };
}

function applySafetyToRouting(
    routing: RoutingResult,
    refinedTriage: RefinedTriage,
): RoutingResult {
    const safetyFirst = refinedTriage.level === 'emergency' || refinedTriage.level === 'urgent';
    const needsDoctor = refinedTriage.level === 'needs_doctor';

    return {
        ...routing,
        escalation_needed: routing.escalation_needed || safetyFirst || needsDoctor,
        priority: safetyFirst ? refinedTriage.recommendedAction : routing.priority,
        today_action: safetyFirst ? refinedTriage.recommendedAction : routing.today_action,
        seek_care_when: refinedTriage.safetyMessage ?? routing.seek_care_when,
    };
}

/* ══════════════════════════════════════════════════════════
   HERO BLOCK
   ══════════════════════════════════════════════════════════ */
function buildResultHero(
    answers: EngineAnswers,
    triageResult: TriageResult,
    routing: RoutingResult,
): ResultHeroBlock {
    const pathway = PATHWAYS.find(p => p.id === answers.pathwayId);
    const primary = DOMAIN_BY_ID[routing.primary_domain];
    const triageMeta = TRIAGE_META[triageResult.level] ?? TRIAGE_META['review'];

    const severityDisplay = `${answers.severity}/١٠`;
    const durationDisplay = DURATION_DISPLAY[answers.duration] ?? '—';

    return {
        pathwayLabel:      pathway?.label ?? '—',
        pathwayEmoji:      pathway?.emoji ?? '⚕️',
        domainArabicName:  primary?.arabicName ?? '—',
        domainEmoji:       primary?.emoji ?? '⚕️',
        domainId:          routing.primary_domain,
        triageBadge:       triageMeta.badge,
        triageLevel:       triageResult.level as ResultHeroBlock['triageLevel'],
        score:             triageResult.score,
        severityDisplay,
        durationDisplay,
        integrativeInsight: triageResult.integrativeInsight ?? '',
    };
}

/* ══════════════════════════════════════════════════════════
   CONFIDENCE + PHENOTYPE BLOCK
   ══════════════════════════════════════════════════════════ */
function buildConfidencePhenotypeBlock(routing: RoutingResult): ConfidencePhenotypeBlock {
    const band = routing.confidence;
    const labelMap: Record<string, string> = {
        high:   'دقة التوجيه: عالية',
        medium: 'دقة التوجيه: متوسطة',
        low:    'دقة التوجيه: تحتاج مراجعة',
    };

    const phenotypeLabel = routing.phenotype?.label ?? '';
    const phenotypeDescription = routing.phenotype?.description ?? '';
    const phenotypeMatchScore = routing.phenotype?.matchScore ?? 0;

    return {
        confidenceBand:    band,
        confidenceScore:   routing.confidenceScore ?? 0,
        confidenceLabel:   labelMap[band] ?? labelMap['low'],
        confidenceFactors: (routing.confidenceFactors ?? []).slice(0, 3),
        phenotypeLabel,
        phenotypeDescription,
        phenotypeMatchScore,
        showPhenotype:     !!phenotypeLabel && phenotypeMatchScore > 0,
    };
}

/* ══════════════════════════════════════════════════════════
   DOMAIN COMPASS BLOCK
   ══════════════════════════════════════════════════════════ */
function buildDomainCompassBlock(routing: RoutingResult): DomainCompassBlock {
    return {
        primaryDomainId:   routing.primary_domain,
        secondaryDomainId: routing.secondary_domain,
        domainScores:      routing.domain_scores,
        whyText:           routing.why,
        priorityText:      routing.priority,
    };
}

/* ══════════════════════════════════════════════════════════
   CLINICAL EXPLANATION BLOCK
   ══════════════════════════════════════════════════════════ */
function buildClinicalExplanationBlock(routing: RoutingResult): ResultInsightBlock {
    return {
        body:         routing.clinical_explanation,
        iconKey:      'book',
        sectionLabel: 'التفسير السريري',
        analyticsKey: 'clinical_explanation_shown',
    };
}

/* ══════════════════════════════════════════════════════════
   TODAY ACTION BLOCK
   ══════════════════════════════════════════════════════════ */
function buildTodayActionBlock(routing: RoutingResult, refinedTriage?: RefinedTriage): ResultActionBlock {
    const safetyFirst = refinedTriage?.level === 'emergency' || refinedTriage?.level === 'urgent';
    return {
        body:         safetyFirst ? refinedTriage.recommendedAction : routing.today_action,
        sectionLabel: 'خطوتك اليوم',
        tone:         'green',
        analyticsKey: 'today_action_shown',
    };
}

/* ══════════════════════════════════════════════════════════
   MONITORING BLOCK
   ══════════════════════════════════════════════════════════ */
function buildMonitoringBlock(routing: RoutingResult): ResultMonitoringBlock {
    return {
        items:        routing.monitor_items ?? [],
        sectionLabel: 'راقب هذا الأسبوع',
        analyticsKey: 'monitoring_shown',
    };
}

/* ══════════════════════════════════════════════════════════
   SEEK CARE BLOCK
   ══════════════════════════════════════════════════════════ */
function buildSeekCareBlock(
    routing:      RoutingResult,
    triageResult: TriageResult,
    refinedTriage?: RefinedTriage,
): ResultEscalationBlock {
    const isUrgent = triageResult.level === 'emergency' || triageResult.level === 'urgent';
    return {
        body:         refinedTriage?.safetyMessage ?? routing.seek_care_when,
        sectionLabel: 'راجع طبيبك إذا',
        isUrgent,
        tone:         'red',
        analyticsKey: 'seek_care_shown',
    };
}

/* ══════════════════════════════════════════════════════════
   CONSISTENCY NOTE (CONTRADICTIONS)
   ══════════════════════════════════════════════════════════ */
function buildConsistencyNoteBlock(routing: RoutingResult): ConsistencyNoteBlock | null {
    const contradictions = routing.contradictions ?? [];
    if (contradictions.length === 0) return null;
    return {
        notes: contradictions.slice(0, 2).map(c => c.message),
        tone:  'amber',
    };
}

/* ══════════════════════════════════════════════════════════
   KEY SIGNALS — enriched with emoji
   ══════════════════════════════════════════════════════════ */
function buildKeySignalsBlock(routing: RoutingResult): KeySignalPresentation[] {
    const raw = routing.key_signals ?? [];
    return raw.slice(0, 3).map(sig => ({
        label:     sig.label,
        dimension: sig.dimension as KeySignalPresentation['dimension'],
        weight:    sig.weight,
        emoji:     SIGNAL_DIMENSION_EMOJI[sig.dimension] ?? '🔵',
    }));
}

/* ══════════════════════════════════════════════════════════
   TRIDIM BADGES
   ══════════════════════════════════════════════════════════ */
function buildTriDimBadgeBlock(triageResult: TriageResult): TriDimBadgeBlock {
    const funcInfo = FUNCTIONAL_PATTERN_INFO[triageResult.topFunctionalPattern];
    const somInfo  = SOMATIC_THEME_INFO[triageResult.topSomaticTheme];
    return {
        conventionalScore:       triageResult.score,
        functionalScore:         triageResult.functionalScore,
        somaticScore:            triageResult.somaticScore,
        topFunctionalPatternLabel: funcInfo?.label ?? '—',
        topSomaticThemeLabel:    somInfo?.label  ?? '—',
    };
}

/* ══════════════════════════════════════════════════════════
   ESCALATION BANNER (shown above hero if escalation needed)
   ══════════════════════════════════════════════════════════ */
function buildEscalationBanner(
    routing:      RoutingResult,
    triageResult: TriageResult,
    answers:      EngineAnswers,
): EscalationBannerBlock | null {
    if (!routing.escalation_needed) return null;

    const isEmergency = triageResult.level === 'emergency';

    let title = '🩺 هذه الحالة تحتاج تقييماً مباشراً مع الطبيب';
    if (isEmergency)                         title = '⚠️ حالة طارئة — تحتاج تدخل فوري';
    else if (triageResult.level === 'urgent') title = '🟠 حالة عاجلة — تحتاج تقييم طبي';

    let body = 'بناءً على تقييمك، ننصحك بمتابعة مع أخصائي لضمان التشخيص الدقيق.';
    if (isEmergency) {
        body = 'أعراضك تشير لحالة تحتاج رعاية طبية فورية. لا تعتمد على هذا التقييم وحده. اتصل برقم الطوارئ المحلي في بلدك أو توجه لأقرب طوارئ فورًا.';
    } else if (answers.severity >= 8 && answers.duration === 'months') {
        body = 'شدة الأعراض مرتفعة مع مدة طويلة. نوصي بجلسة تشخيصية مباشرة مع د. عمر.';
    }

    const emergencyPhone = process.env.NEXT_PUBLIC_EMERGENCY_PHONE?.trim();
    const ctaLabel = isEmergency
        ? (emergencyPhone ? 'اتصل بالطوارئ' : 'توجه للطوارئ الآن')
        : 'احجز الآن';
    const ctaHref  = isEmergency
        ? (emergencyPhone ? `tel:${emergencyPhone}` : undefined)
        : createPageUrl('BookAppointment');

    return {
        level: triageResult.level as EscalationBannerBlock['level'],
        title,
        body,
        ctaLabel,
        ctaHref,
        isEmergency,
    };
}

/* ══════════════════════════════════════════════════════════
   PLAN HANDOFF BLOCK
   ══════════════════════════════════════════════════════════ */
function buildPlanHandoffBlock(
    routing:      RoutingResult,
    triageResult: TriageResult,
    answers:      EngineAnswers,
    refinedTriage?: RefinedTriage,
): ResultPlanHandoffModel {
    const primary = DOMAIN_BY_ID[routing.primary_domain];
    const safetyFirst = refinedTriage?.level === 'emergency' || refinedTriage?.level === 'urgent';

    const mainDirection = safetyFirst
        ? (refinedTriage.safetyMessage ?? refinedTriage.recommendedAction)
        : `اتجاهك الرئيسي هو ${primary?.arabicName ?? 'العناية'} — ${routing.priority}`;

    // Dynamic start step: prefer first protocol if available, otherwise today_action
    const protocolTool = routing.recommended_tools.find(t => t.type === 'protocol');
    const startTodayStep = safetyFirst
        ? refinedTriage.recommendedAction
        : protocolTool
            ? `ابدأ بـ "${protocolTool.arabicName}" — ${protocolTool.description}`
            : routing.today_action;

    // Revisit note based on confidence + duration
    let revisitNote = 'راجع أعراضك بعد ٣–٥ أيام وقيّم أي تحسن.';
    if (routing.confidence === 'low' || answers.duration === 'months') {
        revisitNote = 'هذه الحالة المزمنة تستحق متابعة دورية. راجع بعد ٣ أيام وسجّل التغيرات.';
    } else if (routing.confidence === 'high' && triageResult.level === 'manageable') {
        revisitNote = 'إذا لم تلاحظ تحسناً بعد أسبوع، أعد التقييم أو استشر مختصاً.';
    }

    // Reassessment condition
    let reassessmentCondition = 'أعد التقييم إذا زادت الأعراض أو ظهرت أعراض جديدة.';
    if (routing.escalation_needed) {
        reassessmentCondition = 'راجع طبيبك قبل إعادة التقييم — حالتك تحتاج تقييماً مباشراً.';
    } else if (answers.duration === 'months') {
        reassessmentCondition = 'أعد التقييم بعد ٢ أسبوع — الأنماط المزمنة تتطور ببطء.';
    }

    return {
        mainDirection,
        startTodayStep,
        revisitNote,
        reassessmentCondition,
        showBookingCta:       routing.escalation_needed && triageResult.level !== 'emergency',
        showReassessmentCta:  !routing.escalation_needed,
    };
}

function uniqueStrings(items: Array<string | undefined | null>): string[] {
    return Array.from(new Set(items
        .map(item => item?.trim())
        .filter((item): item is string => Boolean(item))));
}

function valueToText(value: unknown): string {
    if (Array.isArray(value)) return value.map(valueToText).filter(Boolean).join('، ');
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return value.trim();
    return '';
}

function firstText(...values: unknown[]): string {
    for (const value of values) {
        const text = valueToText(value);
        if (text) return text;
    }
    return '';
}

function listFromUnknown(value: unknown): string[] {
    if (Array.isArray(value)) return value.map(valueToText).filter(Boolean);
    const text = valueToText(value);
    return text ? [text] : [];
}

function severityLabel(severity: number | undefined): string {
    const score = typeof severity === 'number' ? severity : 0;
    if (score >= 9) return `${score}/10 - شديد جدًا`;
    if (score >= 7) return `${score}/10 - شديد`;
    if (score >= 4) return `${score}/10 - متوسط`;
    if (score > 0) return `${score}/10 - خفيف`;
    return 'غير واضح';
}

function durationLabel(duration?: string): string {
    const map: Record<string, string> = {
        today: 'اليوم',
        hours: 'من ساعات',
        days: 'من أيام',
        week: 'من أسبوع',
        weeks: 'من أسابيع',
        months: 'من أشهر',
        chronic: 'يتكرر من فترة',
        recurring: 'يتكرر من فترة',
        unknown: 'غير واضح',
    };
    return duration ? (map[duration] ?? duration) : 'غير واضح';
}

function onsetLabel(onset?: string): string {
    return durationLabel(onset);
}

function triageStoryLabel(level: string): string {
    const labels: Record<string, string> = {
        emergency: 'عاجلة جدًا',
        urgent: 'تحتاج انتباه سريع',
        needs_doctor: 'تحتاج مراجعة',
        review: 'تحتاج متابعة',
        manageable: 'مستقرة مبدئيًا',
    };
    return labels[level] ?? 'تحتاج متابعة';
}

function isSafetyFirst(refinedTriage: RefinedTriage): boolean {
    return refinedTriage.level === 'emergency' || refinedTriage.level === 'urgent';
}

function getChiefComplaintLabel(answers: EngineAnswers, hero: ResultHeroBlock): string {
    return firstText(
        answers.chiefComplaint?.complaintLabel,
        answers.assessmentReviewSnapshot?.chiefComplaintLabel,
        hero.pathwayLabel,
    ) || 'الأعراض التي ذكرتها';
}

function buildStatusQuestionAnswer(refinedTriage: RefinedTriage, confidence: AssessmentConfidence): string {
    if (refinedTriage.level === 'emergency' || refinedTriage.level === 'urgent') {
        return 'الأولوية الآن أن يتم تقييم الحالة طبيًا قبل أي خطة منزلية.';
    }
    if (refinedTriage.level === 'needs_doctor') {
        return 'الحالة ليست للتهويل، لكنها تحتاج مراجعة طبية لأن بعض الإشارات تستحق متابعة.';
    }
    if (confidence.isPreliminary || confidence.label === 'low') {
        return 'القراءة أولية؛ لدينا اتجاه عام لكن نحتاج بيانات أكثر حتى تصبح أوضح.';
    }
    if (refinedTriage.level === 'manageable') {
        return 'الحالة تبدو مستقرة مبدئيًا مع خطوة متابعة واضحة.';
    }
    return 'الحالة تحتاج متابعة هادئة ومراجعة التغير خلال الأيام القادمة.';
}

function buildImmediateWhy(
    answers: EngineAnswers,
    refinedTriage: RefinedTriage,
    confidence: AssessmentConfidence,
): string {
    if (isSafetyFirst(refinedTriage)) {
        return 'لأن إجاباتك أو علامات الأولوية تغيّر ترتيب التعامل، فالأمان يأتي قبل أي نصيحة غذاء أو روتين.';
    }
    const pieces = uniqueStrings([
        `الشدة ${severityLabel(answers.hopi?.severity ?? answers.severity)}`,
        `والمدة ${durationLabel(answers.hopi?.onset ?? answers.duration)}`,
        answers.redFlags.length > 0 ? 'مع وجود علامة أولوية' : 'بدون علامة أولوية واضحة',
        confidence.isPreliminary ? 'ومع بيانات تحتاج إكمال' : undefined,
    ]);
    return `لأننا جمعنا ${pieces.join('، ')} ثم رتبناها كقراءة أولية وليست تشخيصًا نهائيًا.`;
}

function buildStoryPrimaryAction(
    refinedTriage: RefinedTriage,
    confidence: AssessmentConfidence,
): ResultStoryAction {
    if (isSafetyFirst(refinedTriage)) {
        return {
            label: 'اطلب رعاية طبية',
            href: '/book-appointment',
            reason: 'لأن الأولوية الآن ليست خطة منزلية.',
            tone: 'urgent',
        };
    }
    if (confidence.isPreliminary || confidence.label === 'low') {
        return {
            label: 'أكمل البيانات',
            href: '/symptom-checker',
            reason: 'لأن القراءة تصبح أوضح بإضافة معلومات ناقصة.',
            tone: 'low_data',
        };
    }
    return {
        label: 'ابدأ خطوتك اليوم',
        href: '/my-plan',
        reason: 'أفضل نتيجة تبدأ بخطوة واحدة قابلة للتطبيق.',
        tone: 'stable',
    };
}

function buildChiefComplaintStory(answers: EngineAnswers, hero: ResultHeroBlock): string | undefined {
    const complaint = getChiefComplaintLabel(answers, hero);
    if (!complaint) return undefined;
    const system = answers.chiefComplaint?.systemLabel;
    const secondary = answers.chiefComplaint?.secondaryComplaints?.length
        ? ` ومعه ${answers.chiefComplaint.secondaryComplaints.slice(0, 2).join('، ')}`
        : '';
    const unsure = answers.assessmentFlowSnapshot?.userWasUnsureOfPathway
        || answers.assessmentReviewSnapshot?.userWasUnsureOfPathway;
    if (unsure) {
        return `بدأنا من مسار عام لأنك لم تكن متأكدًا من التصنيف، ثم أخذنا "${complaint}" كبداية لفهم القصة.`;
    }
    return `بدأنا من ${system ? `${system}: ` : ''}${complaint}${secondary}. هذا هو الباب الذي رتّبنا حوله باقي الإشارات.`;
}

function buildHopiTimeline(answers: EngineAnswers): ResultStoryTimelineItem[] {
    const hopi = answers.hopi;
    if (!hopi) return [];

    const items: ResultStoryTimelineItem[] = [];
    const push = (label: string, value: unknown, meaning: string) => {
        const text = Array.isArray(value) ? value.map(valueToText).filter(Boolean).join('، ') : valueToText(value);
        if (text) items.push({ label, value: text, meaning });
    };

    if (hopi.onset) {
        push('متى بدأ', onsetLabel(hopi.onset), 'هذا يساعدنا نميّز بين شيء عابر ونمط يتكرر.');
    }
    push('كيف ماشي', hopi.course, 'اتجاه العرض مع الوقت يغيّر أولوية المتابعة.');
    push('قد إيش شدته', severityLabel(hopi.severity ?? answers.severity), 'الشدة تساعدنا نعرف هل نكتفي بالمتابعة أو نرفع الأولوية.');
    push('فين مكانه', hopi.location, 'المكان يضيف وضوحًا للقصة بدون أن يكون تشخيصًا وحده.');
    push('نوع الإحساس', hopi.character, 'وصف الإحساس يساعدنا نفهم نمط العرض بشكل أفضل.');
    push('هل ينتقل', hopi.radiation, 'انتقال العرض لمكان آخر قد يغير الأسئلة التالية.');
    push('إيش يزيده', hopi.aggravating, 'العوامل التي تزيده تكشف نمطًا قد نحتاج متابعته.');
    push('إيش يخففه', hopi.relieving, 'ما يخفف العرض يساعدنا نختار خطوة أولى واقعية.');
    push('هل مأثر على يومك', hopi.functionalImpact, 'تأثيره على اليوم يوضح حجم المتابعة المطلوبة.');

    return items;
}

function buildTopSignals(
    answers: EngineAnswers,
    hero: ResultHeroBlock,
    confidence: AssessmentConfidence,
): ResultStorySignal[] {
    const signals: ResultStorySignal[] = [];
    const complaint = getChiefComplaintLabel(answers, hero);
    if (complaint) {
        signals.push({
            label: 'الشكوى الأساسية',
            value: complaint,
            meaning: 'هذا هو الباب الذي بدأنا منه قراءة الحالة.',
            source: 'chief_complaint',
        });
    }

    signals.push({
        label: 'الشدة',
        value: severityLabel(answers.hopi?.severity ?? answers.severity),
        meaning: 'الشدة تساعدنا نرتب الأولوية بدون تهويل.',
        source: 'hopi',
    });

    signals.push({
        label: 'المدة',
        value: durationLabel(answers.hopi?.onset ?? answers.duration),
        meaning: 'المدة تفرق بين عرض عابر ونمط يحتاج متابعة.',
        source: 'hopi',
    });

    signals.push({
        label: 'علامات الأولوية',
        value: answers.redFlags.length > 0 || answers.hasEmergencyFlag ? 'موجودة' : 'غير واضحة في إجاباتك',
        meaning: answers.redFlags.length > 0 || answers.hasEmergencyFlag
            ? 'وجودها يجعل الأمان أولًا قبل أي خطة منزلية.'
            : 'عدم ظهورها يجعلنا نكمل القراءة بهدوء مع متابعة التغير.',
        source: 'red_flags',
    });

    const related = uniqueStrings([
        ...(answers.relatedSymptoms ?? []),
        ...listFromUnknown(answers.hopi?.associated),
    ]).slice(0, 3);
    if (related.length > 0) {
        signals.push({
            label: 'أعراض مرافقة',
            value: related.join('، '),
            meaning: 'الأعراض المرافقة تساعدنا نضيق الاتجاه الأقرب.',
            source: 'related_symptoms',
        });
    }

    const adaptiveTrigger = answers.assessmentFlowSnapshot?.adaptiveTriggers?.[0]
        ?? answers.assessmentReviewSnapshot?.flowSnapshot?.adaptiveTriggers?.[0];
    if (adaptiveTrigger) {
        signals.push({
            label: 'عامل غيّر الأسئلة',
            value: adaptiveTrigger.trigger,
            meaning: adaptiveTrigger.caused,
            source: 'lifestyle',
        });
    }

    if (confidence.isPreliminary || confidence.label === 'low') {
        signals.push({
            label: 'وضوح النتيجة',
            value: 'أولية',
            meaning: 'بعض البيانات الناقصة تجعل القراءة قابلة للتحسين.',
            source: 'confidence',
        });
    }

    return signals.slice(0, 5);
}

function buildReasoningNarrative(
    answers: EngineAnswers,
    refinedTriage: RefinedTriage,
    tayyibatVerdict: ReturnType<typeof analyzeTayyibatFromAssessment>,
): string[] {
    const bullets = [
        'بدأنا من الشكوى الأساسية التي اخترتها، ثم قارناها بالشدة والمدة.',
        answers.redFlags.length > 0 || answers.hasEmergencyFlag
            ? 'وجود علامة أولوية غيّر ترتيب التعامل وجعل الأمان يظهر أولًا.'
            : 'عدم ظهور علامة أولوية واضحة سمح ببناء قراءة متابعة بدل توجيه عاجل.',
    ];

    if ((answers.relatedSymptoms ?? []).length > 0 || (answers.hopi?.associated ?? []).length > 0) {
        bullets.push('الأعراض المرافقة ساعدتنا نحدد الاتجاه الأقرب بدل الاعتماد على عرض واحد.');
    }

    if (tayyibatVerdict.isRelevant || answers.assessmentFlowSnapshot?.adaptiveTriggers?.length) {
        bullets.push('إشارات الأكل أو النوم أو الضغط ظهرت كعوامل قد تزيد الحالة، لا كتفسير وحيد.');
    }

    if (refinedTriage.wasRefined) {
        bullets.push('طبقة السلامة راجعت القراءة الأساسية وعدّلت الأولوية عندما احتاج الأمر.');
    }

    return bullets.slice(0, 4);
}

function buildClarityNarrative(
    confidence: AssessmentConfidence,
    answers: EngineAnswers,
): ResultStory['clarityNarrative'] {
    const missing = uniqueStrings([
        ...confidence.missingData,
        ...(answers.assessmentFlowSnapshot?.missingImportantData ?? []),
        ...(answers.assessmentReviewSnapshot?.unknowns ?? []),
    ]).slice(0, 5);

    const labelMap: Record<AssessmentConfidence['label'], string> = {
        low: 'أولية',
        medium: 'متوسطة',
        high: 'أوضح',
    };

    let sentence = 'القراءة مفيدة، لكنها تصير أوضح إذا أضفت متابعة أو تفاصيل أكثر.';
    if (confidence.label === 'low' || confidence.isPreliminary) {
        sentence = 'القراءة مبدئية لأن بعض البيانات الأساسية ناقصة.';
    } else if (confidence.label === 'high') {
        sentence = 'القراءة أوضح لأن معظم البيانات الأساسية مكتملة ولا توجد تناقضات مهمة.';
    }

    return {
        label: labelMap[confidence.label] ?? 'متوسطة',
        sentence,
        missing,
        improveAction: missing.length > 0
            ? {
                label: 'أكمل البيانات',
                href: '/symptom-checker',
                reason: 'إضافة هذه النقاط تجعل القصة أوضح في المرة القادمة.',
                tone: 'low_data',
            }
            : undefined,
    };
}

function buildInfluencingFactors(answers: EngineAnswers): ResultStorySignal[] {
    const factors: ResultStorySignal[] = [];
    const add = (label: string, value: string, meaning: string, source: ResultStorySignal['source'] = 'lifestyle') => {
        if (!value) return;
        factors.push({ label, value, meaning, source });
    };

    for (const [key, value] of Object.entries(answers.lifestyleContext ?? {})) {
        const text = valueToText(value);
        if (!text) continue;
        const label = key.includes('sleep') || text.includes('نوم') ? 'النوم'
            : key.includes('caffeine') || text.includes('كافيين') ? 'الكافيين'
                : key.includes('food') || text.includes('أكل') ? 'الأكل'
                    : key.includes('water') || text.includes('ماء') ? 'الماء'
                        : 'عامل من الروتين';
        add(label, text, `${label} قد يزيد أو يخفف الإحساس بالأعراض عند بعض الناس.`);
    }

    if (answers.emotionalContext.length > 0) {
        add('الضغط أو القلق', answers.emotionalContext.slice(0, 2).join('، '), 'قد يزيد شدة الإحساس، لكنه لا يعني أن الأعراض نفسية.', 'lifestyle');
    }

    for (const trigger of answers.assessmentFlowSnapshot?.adaptiveTriggers ?? []) {
        add('سبب ظهور سؤال إضافي', trigger.trigger, trigger.caused, 'lifestyle');
    }

    const foodAnswers = answers.nutritionAnswers?.deepAnswers ?? {};
    for (const [key, value] of Object.entries(foodAnswers)) {
        const text = valueToText(value);
        if (!text || text === 'no' || text === 'none') continue;
        const label = key.includes('sleep') ? 'النوم والروتين' : 'الأكل';
        add(label, text, 'هذا عامل قد يغيّر توقيت الأعراض أو شدتها، وليس سببًا نهائيًا.', 'nutrition');
    }

    return factors.slice(0, 5);
}

function hasFoodOrRhythmSignal(answers: EngineAnswers, tayyibatVerdict: ReturnType<typeof analyzeTayyibatFromAssessment>): boolean {
    if (tayyibatVerdict.isRelevant) return true;
    if (answers.adaptiveQuestionPlanSnapshot?.foodSignalFound || answers.adaptiveQuestionPlanSnapshot?.nutritionShown) return true;
    if (answers.assessmentFlowSnapshot?.adaptiveTriggers?.some(item => item.caused.includes('الغذاء') || item.caused.includes('الأكل'))) return true;
    const text = [
        ...Object.values(answers.clinicalAnswers).map(valueToText),
        ...Object.values(answers.lifestyleContext ?? {}).map(valueToText),
        ...Object.values(answers.nutritionAnswers?.deepAnswers ?? {}).map(valueToText),
        ...(answers.hopi?.aggravating ?? []),
    ].join(' ');
    return ['أكل', 'الغذاء', 'وجبة', 'انتفاخ', 'غازات', 'حموضة', 'سكر', 'كافيين', 'نوم'].some(word => text.includes(word));
}

function buildNutritionStoryState(
    answers: EngineAnswers,
    refinedTriage: RefinedTriage,
    tayyibatVerdict: ReturnType<typeof analyzeTayyibatFromAssessment>,
): ResultStoryNutritionState | undefined {
    const tayKnow = answers.nutritionAnswers?.gateAnswers?.tay_know;
    const foodSignal = hasFoodOrRhythmSignal(answers, tayyibatVerdict);

    if (!refinedTriage.nutritionAllowed || isSafetyFirst(refinedTriage)) {
        return {
            mode: 'suppressed',
            title: 'الأكل ملاحظة مساعدة',
            sentence: 'الأكل هنا ملاحظة مساعدة فقط، وليس الخطوة الأساسية الآن.',
            showScore: false,
            ctas: [],
        };
    }

    if (tayKnow === 'dont_know' || tayyibatVerdict.isEducationalOnly) {
        return {
            mode: 'educational',
            title: 'مدخل تعريفي',
            sentence: 'اخترت أنك لا تعرف نظام الطيبات بعد، لذلك لا نعرض درجة التزام. نعرض فقط مدخلًا يساعدك تفهم علاقة الأكل بالأعراض إذا كانت موجودة.',
            showScore: false,
            ctas: [
                { label: 'تعرّف على النظام', href: '/tayyibat' },
                { label: 'سجّل وجباتك', href: '/tayyibat/tracker' },
            ],
        };
    }

    if (!foodSignal && !answers.nutritionAnswers) {
        return {
            mode: 'hidden',
            title: 'الأكل والنوم والروتين',
            sentence: 'لم تظهر إشارة غذائية كافية تجعل هذا الجزء أساسيًا في القراءة الآن.',
            showScore: false,
            ctas: [],
        };
    }

    if (tayKnow === 'know_not_following') {
        return {
            mode: 'beginner',
            title: 'بداية عملية',
            sentence: 'تعرف الفكرة، لكن التطبيق لم يبدأ بعد. نبدأ بخطوة صغيرة لا بخطة صارمة.',
            showScore: false,
            ctas: [{ label: 'ابدأ بتبديل واحد', href: '/tayyibat' }],
        };
    }

    const canShowPatternScore = Boolean(
        answers.nutritionAnswers?.deepTriggered
        && !tayyibatVerdict.isEducationalOnly
        && tayyibatVerdict.confidenceScore >= 30,
    );

    if (tayKnow === 'yes_partial' || tayKnow === 'yes_following' || tayyibatVerdict.isRelevant) {
        return {
            mode: 'pattern',
            title: tayyibatVerdict.primaryPatternLabel || 'نمط غذائي قابل للمتابعة',
            sentence: tayyibatVerdict.summaryArabic || 'ظهرت إشارات تجعل الأكل أو توقيت الوجبات عاملًا يستحق المتابعة بهدوء.',
            showScore: canShowPatternScore,
            ctas: [{ label: 'سجّل وجباتك', href: '/tayyibat/tracker' }],
        };
    }

    return undefined;
}

function buildTodayPlan(
    refinedTriage: RefinedTriage,
    todayAction: ResultActionBlock,
): string {
    if (isSafetyFirst(refinedTriage)) return refinedTriage.recommendedAction;
    return todayAction.body || 'اختر خطوة واحدة فقط وابدأ بها اليوم.';
}

function buildWeekPlan(
    monitoring: ResultMonitoringBlock,
    planHandoff: ResultPlanHandoffModel,
): string[] {
    return uniqueStrings([
        ...monitoring.items,
        planHandoff.revisitNote,
    ]).slice(0, 4);
}

function buildSeekCareIf(
    seekCare: ResultEscalationBlock,
    refinedTriage: RefinedTriage,
): string[] {
    return uniqueStrings([
        refinedTriage.safetyMessage ?? undefined,
        seekCare.body,
        'إذا ظهرت علامة جديدة أو زادت الشدة بشكل واضح.',
    ]).slice(0, 4);
}

function buildStoryLabSuggestions(
    answers: EngineAnswers,
    refinedTriage: RefinedTriage,
): ResultStory['deepDetails']['labs'] {
    if (isSafetyFirst(refinedTriage)) {
        return [{
            name: 'تقييم طبي مباشر',
            why: 'لأن علامات الأولوية تجعل الفحص السريري أهم من قائمة فحوصات منزلية.',
            priority: 'عالية',
            note: 'ناقش أي فحوصات مع الطبيب حسب الفحص المباشر.',
        }];
    }

    const complaintText = [
        answers.chiefComplaint?.complaintLabel,
        answers.chiefComplaint?.systemLabel,
        ...(answers.relatedSymptoms ?? []),
        ...(answers.hopi?.associated ?? []),
        answers.pathwayId,
    ].filter(Boolean).join(' ');

    const labs: ResultStory['deepDetails']['labs'] = [];
    const add = (name: string, why: string, priority = 'متوسطة') => {
        if (!labs.some(lab => lab.name === name)) {
            labs.push({ name, why, priority, note: 'ناقشها مع طبيبك إذا استمرت الأعراض أو تكررت.' });
        }
    };

    if (/تعب|خمول|دوخة|طاقة|fatigue/.test(complaintText)) {
        add('CBC', 'لاستبعاد فقر الدم أو مؤشرات التهاب عند وجود تعب أو دوخة.');
        add('Ferritin', 'يفيد عندما يظهر تعب أو دوخة أو تساقط شعر أو أعراض نقص مخزون الحديد.');
        add('TSH', 'يناقش عند التعب أو اضطراب النوم أو تغير الوزن أو الخفقان.');
    }
    if (/هضم|بطن|انتفاخ|غاز|حموضة|إسهال|إمساك|digestion/.test(complaintText)) {
        add('CBC', 'يساعد في متابعة فقر الدم أو الالتهاب إذا وُجد ألم بطن أو تغير مستمر.');
        add('فحص براز عند اللزوم', 'يناقش إذا وُجد إسهال مستمر أو دم أو أعراض هضمية متكررة.');
    }
    if (/ألم|مفاصل|ظهر|عضلات|pain/.test(complaintText)) {
        add('ESR / CRP', 'يناقش عند الألم المستمر أو التورم أو تيبس الصباح.');
        add('Vitamin D', 'قد يفيد عند آلام عضلية أو تعب عام متكرر.');
    }
    if (/غدة|هرمون|دورة|شعر|hormonal/.test(complaintText)) {
        add('TSH / Free T4', 'يناقش عند أعراض تعب مع برودة أو تغير وزن أو اضطراب دورة.');
        add('Ferritin + Vitamin D', 'يفيدان عند التعب أو تساقط الشعر أو الإرهاق المتكرر.');
    }

    return labs.slice(0, 4);
}

function buildStoryDeepDetails(
    answers: EngineAnswers,
    refinedTriage: RefinedTriage,
    recommendationGroups: RecommendationGroup[],
    domainCompass: DomainCompassBlock,
    medicalHistoryVerdict?: ReturnType<typeof analyzeMedicalHistoryForAssessment>,
): ResultStory['deepDetails'] {
    return {
        labs: buildStoryLabSuggestions(answers, refinedTriage),
        tools: recommendationGroups,
        domainCompass,
        medicalHistory: medicalHistoryVerdict?.hasData && medicalHistoryVerdict.summaryArabic
            ? medicalHistoryVerdict
            : undefined,
    };
}

function buildPrimaryStorySentence(
    answers: EngineAnswers,
    hero: ResultHeroBlock,
    refinedTriage: RefinedTriage,
    confidence: AssessmentConfidence,
): string {
    const complaint = getChiefComplaintLabel(answers, hero);
    if (isSafetyFirst(refinedTriage)) {
        return 'توجد إشارات تجعل الأولوية الآن للتقييم الطبي المباشر قبل أي خطة منزلية.';
    }

    const missing = uniqueStrings([
        ...confidence.missingData,
        ...(answers.assessmentFlowSnapshot?.missingImportantData ?? []),
    ]).slice(0, 2);
    if (confidence.isPreliminary || confidence.label === 'low') {
        return `إجاباتك تعطينا قراءة أولية عن ${complaint}، لكنها تحتاج بيانات أكثر${missing.length ? ` عن ${missing.join(' و')}` : ''} حتى تصبح أوضح.`;
    }

    const onset = durationLabel(answers.hopi?.onset ?? answers.duration);
    const severity = severityLabel(answers.hopi?.severity ?? answers.severity);
    const trigger = firstText(answers.hopi?.aggravating, answers.assessmentFlowSnapshot?.adaptiveTriggers?.[0]?.trigger);
    const triggerText = trigger ? `، و${trigger} قد يغيّر شدته أو توقيته` : '';
    return `أكثر شيء واضح من إجاباتك أن ${complaint} بدأ ${onset}، شدته ${severity}${triggerText}؛ لذلك القراءة الآن تبدو ${triageStoryLabel(refinedTriage.level)} مع خطوة متابعة واضحة.`;
}

function buildResultStory({
    answers,
    hero,
    domainCompass,
    confidence,
    refinedTriage,
    tayyibatVerdict,
    recommendationGroups,
    planHandoff,
    todayAction,
    monitoring,
    seekCare,
    medicalHistoryVerdict,
}: {
    answers: EngineAnswers;
    hero: ResultHeroBlock;
    domainCompass: DomainCompassBlock;
    confidence: AssessmentConfidence;
    refinedTriage: RefinedTriage;
    tayyibatVerdict: ReturnType<typeof analyzeTayyibatFromAssessment>;
    recommendationGroups: RecommendationGroup[];
    planHandoff: ResultPlanHandoffModel;
    todayAction: ResultActionBlock;
    monitoring: ResultMonitoringBlock;
    seekCare: ResultEscalationBlock;
    medicalHistoryVerdict?: ReturnType<typeof analyzeMedicalHistoryForAssessment>;
}): ResultStory {
    return {
        primaryStorySentence: buildPrimaryStorySentence(answers, hero, refinedTriage, confidence),
        statusQuestionAnswer: buildStatusQuestionAnswer(refinedTriage, confidence),
        immediateWhy: buildImmediateWhy(answers, refinedTriage, confidence),
        primaryAction: buildStoryPrimaryAction(refinedTriage, confidence),
        chiefComplaintStory: buildChiefComplaintStory(answers, hero),
        hopiTimeline: buildHopiTimeline(answers),
        topSignals: buildTopSignals(answers, hero, confidence),
        reasoningNarrative: buildReasoningNarrative(answers, refinedTriage, tayyibatVerdict),
        clarityNarrative: buildClarityNarrative(confidence, answers),
        influencingFactors: buildInfluencingFactors(answers),
        nutritionStoryState: buildNutritionStoryState(answers, refinedTriage, tayyibatVerdict),
        todayPlan: buildTodayPlan(refinedTriage, todayAction),
        weekPlan: buildWeekPlan(monitoring, planHandoff),
        seekCareIf: buildSeekCareIf(seekCare, refinedTriage),
        reassessment: planHandoff.reassessmentCondition,
        deepDetails: buildStoryDeepDetails(
            answers,
            refinedTriage,
            recommendationGroups,
            domainCompass,
            medicalHistoryVerdict,
        ),
    };
}

/* ══════════════════════════════════════════════════════════
   MAIN ASSEMBLY FUNCTION
   ══════════════════════════════════════════════════════════ */
export function buildResultViewModel(
    answers:      EngineAnswers,
    triageResult: TriageResult,
    routing:      RoutingResult,
): ResultViewModel {
    // Tayyibat dietary analysis (additive layer)
    const tayyibatVerdict = analyzeTayyibatFromAssessment(answers, triageResult, routing);
    const phase3Safety = buildPhase3SafetyContext(answers, triageResult, routing, tayyibatVerdict);
    const effectiveTriage = applyRefinedTriage(triageResult, phase3Safety.refinedTriage);
    const effectiveRouting = applySafetyToRouting(routing, phase3Safety.refinedTriage);

    const escalationBanner = buildEscalationBanner(effectiveRouting, effectiveTriage, answers);
    const hero             = buildResultHero(answers, effectiveTriage, effectiveRouting);
    const domainCompass    = buildDomainCompassBlock(effectiveRouting);
    const confPheno        = buildConfidencePhenotypeBlock(effectiveRouting);
    const clinicalExp      = buildClinicalExplanationBlock(effectiveRouting);
    const todayAction      = buildTodayActionBlock(effectiveRouting, phase3Safety.refinedTriage);
    const monitoring       = buildMonitoringBlock(effectiveRouting);
    const seekCare         = buildSeekCareBlock(effectiveRouting, effectiveTriage, phase3Safety.refinedTriage);
    const phase3ContradictionSummary = phase3Safety.contradictions.length > 0
        ? {
            count: phase3Safety.contradictions.length,
            majorCount: majorContradictionCount(phase3Safety.contradictions),
            userMessages: phase3Safety.contradictions.slice(0, 3).map(c => c.messageForUser),
            confidencePenalty: totalContradictionPenalty(phase3Safety.contradictions),
        }
        : undefined;
    const consistencyNote  = phase3ContradictionSummary
        ? { notes: phase3ContradictionSummary.userMessages.slice(0, 2), tone: 'amber' as const }
        : buildConsistencyNoteBlock(effectiveRouting);
    const keySignals       = buildKeySignalsBlock(effectiveRouting);
    const triDimBadges     = buildTriDimBadgeBlock(effectiveTriage);
    const planHandoff      = buildPlanHandoffBlock(effectiveRouting, effectiveTriage, answers, phase3Safety.refinedTriage);

    const recommendationGroups = phase3Safety.refinedTriage.level === 'emergency' || phase3Safety.refinedTriage.level === 'urgent'
        ? []
        : buildRankedRecommendationGroups(effectiveRouting, effectiveTriage);

    // Clinical precision analysis (additive layer)
    const clinicalPrecision = analyzeClinicalPrecision(answers, effectiveTriage, effectiveRouting);

    // Medical history correlation (additive layer)
    const medicalHistoryVerdict = analyzeMedicalHistoryForAssessment(answers, effectiveTriage, effectiveRouting);
    const resultStory = buildResultStory({
        answers,
        hero,
        domainCompass,
        confidence: phase3Safety.confidence,
        refinedTriage: phase3Safety.refinedTriage,
        tayyibatVerdict,
        recommendationGroups,
        planHandoff,
        todayAction,
        monitoring,
        seekCare,
        medicalHistoryVerdict,
    });

    return {
        escalationBanner,
        hero,
        domainCompass,
        confidencePhenotype:  confPheno,
        clinicalExplanation:  clinicalExp,
        todayAction,
        monitoring,
        seekCare,
        consistencyNote,
        keySignals,
        triDimBadges,
        recommendationGroups,
        domainId:             effectiveRouting.primary_domain,
        escalationNeeded:     effectiveRouting.escalation_needed,
        primarySectionHref:   `/sections/${effectiveRouting.primary_domain}`,
        planHandoff,
        clinicalPrecision,
        tayyibatVerdict:      tayyibatVerdict.isRelevant && phase3Safety.refinedTriage.nutritionAllowed
            ? tayyibatVerdict
            : undefined,
        medicalHistoryVerdict: (medicalHistoryVerdict.hasData && medicalHistoryVerdict.summaryArabic)
            ? medicalHistoryVerdict : undefined,
        confidenceExplanation: {
            score: phase3Safety.confidence.score,
            label: phase3Safety.confidence.label,
            userNote: phase3Safety.confidence.userNote,
            howToImprove: phase3Safety.confidence.howToImprove.slice(0, 4),
            missingData: phase3Safety.confidence.missingData.slice(0, 4),
            nutritionConfidence: phase3Safety.confidence.nutritionConfidence,
            isPreliminary: phase3Safety.confidence.isPreliminary,
        },
        contradictionSummary: phase3ContradictionSummary,
        refinedTriage: {
            level: phase3Safety.refinedTriage.level,
            reason: phase3Safety.refinedTriage.reason,
            dominantSignals: phase3Safety.refinedTriage.dominantSignals,
            safetyMessage: phase3Safety.refinedTriage.safetyMessage,
            lifestyleAllowed: phase3Safety.refinedTriage.lifestyleAllowed,
            nutritionAllowed: phase3Safety.refinedTriage.nutritionAllowed,
            recommendedAction: phase3Safety.refinedTriage.recommendedAction,
            wasRefined: phase3Safety.refinedTriage.wasRefined,
            baseLevelWas: phase3Safety.refinedTriage.baseLevelWas,
        },
        safetySummary: {
            message: phase3Safety.refinedTriage.safetyMessage,
            recommendedAction: phase3Safety.refinedTriage.recommendedAction,
            nutritionSuppressed: !phase3Safety.refinedTriage.nutritionAllowed,
            lifestyleSuppressed: !phase3Safety.refinedTriage.lifestyleAllowed,
        },
        resultStory,
        whatWeDoNotKnowYet: phase3Safety.confidence.missingData.slice(0, 4),
        assessmentHandoff: answers.assessmentReviewSnapshot
            ? {
                pathwayLabel: answers.assessmentReviewSnapshot.pathwayLabel,
                keyAnsweredSignals: answers.assessmentReviewSnapshot.keyAnsweredSignals,
                adaptiveReasonsShown: answers.assessmentReviewSnapshot.adaptiveReasonsShown,
                skippedSections: answers.assessmentReviewSnapshot.skippedSections,
                unknowns: answers.assessmentReviewSnapshot.unknowns,
                tayyibatMode: answers.assessmentReviewSnapshot.tayyibatMode,
                chiefComplaintLabel: answers.assessmentReviewSnapshot.chiefComplaintLabel,
                hopiSummary: answers.assessmentReviewSnapshot.hopiSummary,
                personalHistorySignals: answers.assessmentReviewSnapshot.personalHistorySignals,
                relatedSymptoms: answers.assessmentReviewSnapshot.relatedSymptoms,
                lifestyleSignals: answers.assessmentReviewSnapshot.lifestyleSignals,
                confidenceReadiness: answers.assessmentReviewSnapshot.confidenceReadiness,
                userWasUnsureOfPathway: answers.assessmentReviewSnapshot.userWasUnsureOfPathway,
                flowSnapshot: answers.assessmentReviewSnapshot.flowSnapshot ?? answers.assessmentFlowSnapshot,
            }
            : undefined,
    };
}
