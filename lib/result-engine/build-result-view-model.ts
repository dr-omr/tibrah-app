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
} from '@/components/health-engine/types';

import { PATHWAYS, FUNCTIONAL_PATTERN_INFO, SOMATIC_THEME_INFO } from '@/components/health-engine/constants';
import { DOMAIN_BY_ID } from '@/lib/domain-routing-map';
import { TRIAGE_META, DURATION_DISPLAY, SIGNAL_DIMENSION_EMOJI } from '@/components/health-engine/result/shared/design-tokens';
import { createPageUrl } from '@/utils';
import { buildRankedRecommendationGroups } from './rank-recommendations';
import { analyzeClinicalPrecision } from '@/lib/clinical-precision-engine';
import { analyzeTayyibatFromAssessment } from '@/lib/tayyibat-assessment-bridge';
import { analyzeMedicalHistoryForAssessment } from '@/lib/medical-history-bridge';

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
function buildTodayActionBlock(routing: RoutingResult): ResultActionBlock {
    return {
        body:         routing.today_action,
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
): ResultEscalationBlock {
    const isUrgent = triageResult.level === 'emergency' || triageResult.level === 'urgent';
    return {
        body:         routing.seek_care_when,
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
        body = 'أعراضك تشير لحالة تحتاج رعاية طبية فورية. لا تعتمد على هذا التقييم وحده.';
    } else if (answers.severity >= 8 && answers.duration === 'months') {
        body = 'شدة الأعراض مرتفعة مع مدة طويلة. نوصي بجلسة تشخيصية مباشرة مع د. عمر.';
    }

    const ctaLabel = isEmergency ? 'اتصل بالإسعاف' : 'احجز الآن';
    const ctaHref  = isEmergency ? 'tel:911' : createPageUrl('BookAppointment');

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
): ResultPlanHandoffModel {
    const primary = DOMAIN_BY_ID[routing.primary_domain];

    const mainDirection = `اتجاهك الرئيسي هو ${primary?.arabicName ?? 'العناية'} — ${routing.priority}`;

    // Dynamic start step: prefer first protocol if available, otherwise today_action
    const protocolTool = routing.recommended_tools.find(t => t.type === 'protocol');
    const startTodayStep = protocolTool
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
        showBookingCta:       routing.escalation_needed,
        showReassessmentCta:  !routing.escalation_needed,
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
    const escalationBanner = buildEscalationBanner(routing, triageResult, answers);
    const hero             = buildResultHero(answers, triageResult, routing);
    const domainCompass    = buildDomainCompassBlock(routing);
    const confPheno        = buildConfidencePhenotypeBlock(routing);
    const clinicalExp      = buildClinicalExplanationBlock(routing);
    const todayAction      = buildTodayActionBlock(routing);
    const monitoring       = buildMonitoringBlock(routing);
    const seekCare         = buildSeekCareBlock(routing, triageResult);
    const consistencyNote  = buildConsistencyNoteBlock(routing);
    const keySignals       = buildKeySignalsBlock(routing);
    const triDimBadges     = buildTriDimBadgeBlock(triageResult);
    const planHandoff      = buildPlanHandoffBlock(routing, triageResult, answers);

    const recommendationGroups = buildRankedRecommendationGroups(
        routing,
        triageResult,
    );

    // Clinical precision analysis (additive layer)
    const clinicalPrecision = analyzeClinicalPrecision(answers, triageResult, routing);

    // Tayyibat dietary analysis (additive layer)
    const tayyibatVerdict = analyzeTayyibatFromAssessment(answers, triageResult, routing);

    // Medical history correlation (additive layer)
    const medicalHistoryVerdict = analyzeMedicalHistoryForAssessment(answers, triageResult, routing);

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
        domainId:             routing.primary_domain,
        escalationNeeded:     routing.escalation_needed,
        primarySectionHref:   `/sections/${routing.primary_domain}`,
        planHandoff,
        clinicalPrecision,
        tayyibatVerdict:      tayyibatVerdict.isRelevant ? tayyibatVerdict : undefined,
        medicalHistoryVerdict: (medicalHistoryVerdict.hasData && medicalHistoryVerdict.summaryArabic)
            ? medicalHistoryVerdict : undefined,
    };
}
