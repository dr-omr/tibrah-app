// lib/domain-scoring-engine.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Domain Scoring & Routing Engine
// ════════════════════════════════════════════════════════════════════════
//
// Rules-based engine that converts assessment answers into a 4-domain
// routing result with primary/secondary domains, subdomains, and
// 5 recommended tools.
//
// المبدأ: ابدأ بنظام rules-based أولاً، ثم أضف الذكاء لاحقاً.
// ════════════════════════════════════════════════════════════════════════

import type {
    DomainId,
    SubdomainId,
    ToolRecommendation,
    RoutingResult,
    EngineAnswers,
    TriageResult,
    FunctionalPattern,
    SomaticTheme,
} from '@/components/health-engine/types';

import { DOMAIN_BY_ID, SUBDOMAIN_BY_ID } from './domain-routing-map';

/* ══════════════════════════════════════════════════════════
   PATHWAY → DOMAIN MAPPING
   كل مسار سريري (pathwayId) يُعطي نقاطاً لأقسام محددة.
   ══════════════════════════════════════════════════════════ */

const PATHWAY_DOMAIN_SCORES: Record<string, Partial<Record<DomainId, number>>> = {
    fatigue:   { jasadi: 12, nafsi: 3, fikri: 1, ruhi: 4 },
    headache:  { jasadi: 7, nafsi: 4, fikri: 2, ruhi: 1 },
    digestion: { jasadi: 9, nafsi: 4, fikri: 1, ruhi: 1 },
    sleep:     { jasadi: 5, nafsi: 3, fikri: 2, ruhi: 7 },
    pain:      { jasadi: 8, nafsi: 3, fikri: 1, ruhi: 2 },
    anxiety:   { jasadi: 2, nafsi: 9, fikri: 4, ruhi: 3 },
    hormonal:  { jasadi: 9, nafsi: 2, fikri: 1, ruhi: 2 },
    immune:    { jasadi: 8, nafsi: 3, fikri: 1, ruhi: 3 },
};

/* ══════════════════════════════════════════════════════════
   PATHWAY → SUBDOMAIN MAPPING
   كل مسار سريري يُلمّح لفروع فرعية محددة.
   ══════════════════════════════════════════════════════════ */

const PATHWAY_SUBDOMAIN_HINTS: Record<string, SubdomainId[]> = {
    fatigue:   ['energy_fatigue', 'nutrition_deficiency', 'hormonal', 'anxiety_arousal', 'rhythm_disruption'],
    headache:  ['musculoskeletal', 'hormonal', 'suppression_chronic_stress', 'overthinking'],
    digestion: ['digestive', 'psychosomatic', 'anxiety_arousal', 'suppression_chronic_stress'],
    sleep:     ['sleep', 'rhythm_disruption', 'sleep_light_quiet', 'anxiety_arousal', 'overthinking'],
    pain:      ['musculoskeletal', 'inflammatory', 'suppression_chronic_stress', 'grief_depletion'],
    anxiety:   ['anxiety_arousal', 'panic', 'psychosomatic', 'overthinking', 'lost_serenity'],
    hormonal:  ['hormonal', 'nutrition_deficiency', 'skin_hair', 'suppression_chronic_stress'],
    immune:    ['inflammatory', 'nutrition_deficiency', 'energy_fatigue', 'grief_depletion'],
};

/* ══════════════════════════════════════════════════════════
   FUNCTIONAL PATTERN → DOMAIN MAPPING
   كل نمط وظيفي (FunctionalPattern) يُعزز أقسام بعينها.
   ══════════════════════════════════════════════════════════ */

const FUNCTIONAL_DOMAIN_BOOST: Record<FunctionalPattern, Partial<Record<DomainId, number>>> = {
    adrenal_exhaustion:    { jasadi: 3, nafsi: 4, ruhi: 3 },
    thyroid_underfunction: { jasadi: 6, nafsi: 1 },
    gut_dysbiosis:         { jasadi: 6, nafsi: 2 },
    blood_sugar_chaos:     { jasadi: 5, nafsi: 1, fikri: 1 },
    nutrient_depletion:    { jasadi: 5, nafsi: 1 },
    inflammatory_load:     { jasadi: 6, nafsi: 1 },
    mitochondrial_drain:   { jasadi: 5, ruhi: 2 },
    hormonal_cascade:      { jasadi: 5, nafsi: 2 },
    nervous_system_dysreg: { jasadi: 2, nafsi: 5, ruhi: 2 },
    toxic_burden:          { jasadi: 5 },
    none:                  {},
};

/* ══════════════════════════════════════════════════════════
   FUNCTIONAL PATTERN → SUBDOMAIN MAPPING
   ══════════════════════════════════════════════════════════ */

const FUNCTIONAL_SUBDOMAIN_HINTS: Record<FunctionalPattern, SubdomainId[]> = {
    adrenal_exhaustion:    ['energy_fatigue', 'anxiety_arousal', 'inner_depletion'],
    thyroid_underfunction: ['hormonal', 'energy_fatigue', 'nutrition_deficiency'],
    gut_dysbiosis:         ['digestive', 'nutrition_deficiency', 'inflammatory'],
    blood_sugar_chaos:     ['digestive', 'energy_fatigue', 'nutrition_deficiency'],
    nutrient_depletion:    ['nutrition_deficiency', 'energy_fatigue', 'skin_hair'],
    inflammatory_load:     ['inflammatory', 'musculoskeletal', 'digestive'],
    mitochondrial_drain:   ['energy_fatigue', 'sleep', 'inner_depletion'],
    hormonal_cascade:      ['hormonal', 'skin_hair', 'suppression_chronic_stress'],
    nervous_system_dysreg: ['anxiety_arousal', 'psychosomatic', 'sleep'],
    toxic_burden:          ['inflammatory', 'energy_fatigue', 'skin_hair'],
    none:                  [],
};

/* ══════════════════════════════════════════════════════════
   SOMATIC THEME → DOMAIN MAPPING
   كل نمط شعوري-جسدي (SomaticTheme) يُعزز أقسام بعينها.
   ══════════════════════════════════════════════════════════ */

const SOMATIC_DOMAIN_BOOST: Record<SomaticTheme, Partial<Record<DomainId, number>>> = {
    suppressed_expression: { nafsi: 5, fikri: 2 },
    hypervigilance:        { nafsi: 6, jasadi: 2 },
    grief_unprocessed:     { nafsi: 5, ruhi: 3 },
    chronic_self_override: { nafsi: 3, fikri: 3, ruhi: 2 },
    worth_and_belonging:   { nafsi: 3, fikri: 4, ruhi: 2 },
    control_and_release:   { nafsi: 4, jasadi: 2 },
    compassion_fatigue:    { nafsi: 4, ruhi: 4 },
    childhood_imprint:     { nafsi: 5, fikri: 2 },
    none:                  {},
};

/* ══════════════════════════════════════════════════════════
   SOMATIC THEME → SUBDOMAIN MAPPING
   ══════════════════════════════════════════════════════════ */

const SOMATIC_SUBDOMAIN_HINTS: Record<SomaticTheme, SubdomainId[]> = {
    suppressed_expression: ['suppression_chronic_stress', 'psychosomatic', 'emotion_symptom_link'],
    hypervigilance:        ['anxiety_arousal', 'panic', 'psychosomatic'],
    grief_unprocessed:     ['grief_depletion', 'lost_meaning', 'inner_depletion'],
    chronic_self_override: ['self_criticism', 'perfectionism', 'inner_depletion'],
    worth_and_belonging:   ['self_criticism', 'limiting_beliefs', 'lost_meaning'],
    control_and_release:   ['digestive', 'suppression_chronic_stress', 'psychosomatic'],
    compassion_fatigue:    ['grief_depletion', 'inner_depletion', 'lost_serenity'],
    childhood_imprint:     ['anxiety_arousal', 'limiting_beliefs', 'emotion_symptom_link'],
    none:                  [],
};

/* ══════════════════════════════════════════════════════════
   EMOTIONAL CONTEXT → DOMAIN BOOSTERS
   ══════════════════════════════════════════════════════════ */

const EMOTIONAL_DOMAIN_BOOST: Record<string, Partial<Record<DomainId, number>>> = {
    work_stress:  { nafsi: 3, fikri: 2 },
    family:       { nafsi: 3, ruhi: 1 },
    loneliness:   { nafsi: 2, ruhi: 4 },
    grief:        { nafsi: 4, ruhi: 3 },
    financial:    { nafsi: 2, fikri: 3 },
    identity:     { fikri: 3, ruhi: 4 },
    anger:        { nafsi: 4, fikri: 1 },
    fear:         { nafsi: 4, fikri: 1 },
    burnout:      { nafsi: 3, ruhi: 3, jasadi: 2 },
    trauma:       { nafsi: 4, jasadi: 1 },
    shame:        { nafsi: 3, fikri: 4 },
    disconnected: { ruhi: 4, nafsi: 2 },
};

/** Maximum total emotional bonus any single domain can receive */
const EMOTIONAL_BONUS_CAP = 10;

/** Physical-dominant pathways that should not be easily overridden */
const PHYSICAL_PATHWAYS = new Set(['fatigue', 'hormonal', 'digestion', 'pain', 'immune', 'headache']);

/* ══════════════════════════════════════════════════════════
   PRIORITY & WHY TEXT GENERATORS
   ══════════════════════════════════════════════════════════ */

const DOMAIN_NAMES: Record<DomainId, string> = {
    jasadi: 'الجسدي',
    nafsi:  'النفسي',
    fikri:  'الفكري',
    ruhi:   'الروحي والإيقاعي',
};

const SUBDOMAIN_NAMES: Record<SubdomainId, string> = {
    digestive:            'هضمي',
    hormonal:             'هرموني',
    inflammatory:         'التهابي/مناعي',
    energy_fatigue:       'طاقة/إرهاق',
    sleep:                'نوم',
    nutrition_deficiency: 'تغذية ونواقص',
    musculoskeletal:      'ألم عضلي/هيكلي',
    skin_hair:            'جلد/شعر',
    anxiety_arousal:      'قلق/استثارة',
    suppression_chronic_stress: 'كبت/ضغط مزمن',
    grief_depletion:      'حزن/استنزاف',
    psychosomatic:        'نفس-جسدي',
    panic:                'نوبات هلع',
    emotion_symptom_link: 'ربط المشاعر بالأعراض',
    overthinking:         'اجترار فكري',
    limiting_beliefs:     'معتقدات مرضية',
    body_hypermonitor:    'مراقبة جسدية مفرطة',
    self_criticism:       'جلد الذات',
    perfectionism:        'كمالية',
    confusion_directionless: 'تشوش وفقدان اتجاه',
    lost_serenity:        'فقدان السكينة',
    rhythm_disruption:    'انقطاع الإيقاع',
    lost_meaning:         'فقدان المعنى',
    inner_depletion:      'إرهاق داخلي',
    self_disconnection:   'انقطاع عن الذات',
    sleep_light_quiet:    'خلل النوم/البيئة',
};

function generateWhy(
    primary: DomainId,
    secondary: DomainId,
    primarySub: SubdomainId,
    secondarySub: SubdomainId,
): string {
    const pName = DOMAIN_NAMES[primary];
    const sName = DOMAIN_NAMES[secondary];
    const pSub  = SUBDOMAIN_NAMES[primarySub];
    const sSub  = SUBDOMAIN_NAMES[secondarySub];

    const templates = [
        `أعراضك الحالية تشير إلى نمط ${pSub} واضح في البُعد ${pName}، مع مؤشرات ${sSub} في البُعد ${sName} تزيد من شدته.`,
        `التقييم يُظهر أن البُعد ${pName} (${pSub}) هو المحور الرئيسي، بينما يلعب البُعد ${sName} (${sSub}) دوراً مساعداً في تضخيم الأعراض.`,
        `حالتك ترتبط بشكل أساسي بالمسار ${pSub} في القسم ${pName}، مع تأثير واضح من ${sSub} في القسم ${sName}.`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
}

function generatePriority(
    primarySub: SubdomainId,
    secondarySub: SubdomainId,
): string {
    const pSub = SUBDOMAIN_NAMES[primarySub];
    const sSub = SUBDOMAIN_NAMES[secondarySub];

    const actionMap: Partial<Record<SubdomainId, string>> = {
        digestive:            'خفض التهيج الهضمي + تقليل المحفزات',
        hormonal:             'إعادة التوازن الهرموني + دعم الغدد',
        inflammatory:         'خفض مؤشرات الالتهاب + تعديل الغذاء',
        energy_fatigue:       'استعادة الطاقة + دعم الميتوكوندريا',
        sleep:                'إعادة ضبط إيقاع النوم',
        nutrition_deficiency: 'سد النواقص الغذائية + دعم المكملات',
        musculoskeletal:      'تخفيف الألم + حركة علاجية',
        skin_hair:            'معالجة الجلد/الشعر من الجذر',
        anxiety_arousal:      'تهدئة الجهاز العصبي + خفض الاستثارة',
        suppression_chronic_stress: 'تفريغ المشاعر المكبوتة + تنظيم الضغط',
        grief_depletion:      'معالجة الحزن + إعادة الملء العاطفي',
        psychosomatic:        'فهم العلاقة نفس-جسد + تنظيم عصبي',
        panic:                'تأمين من نوبات الهلع + تمارين تأريض',
        emotion_symptom_link: 'رسم خريطة المشاعر-الأعراض',
        overthinking:         'إيقاف الاجترار + تفريغ الأفكار',
        limiting_beliefs:     'تحدي المعتقدات السلبية + إعادة البرمجة',
        body_hypermonitor:    'تقليل سلوك المراقبة + تحويل الانتباه',
        self_criticism:       'بناء الرحمة الذاتية + تهدئة الصوت الداخلي',
        perfectionism:        'التخلي عن المثالية + قبول الجيد',
        confusion_directionless: 'استعادة الوضوح + اكتشاف الاتجاه',
        lost_serenity:        'استعادة السكينة الداخلية',
        rhythm_disruption:    'إعادة ضبط الإيقاع اليومي',
        lost_meaning:         'استكشاف المعنى والرسالة',
        inner_depletion:      'إعادة ملء الخزان الداخلي',
        self_disconnection:   'إعادة الاتصال بالذات والجسد',
        sleep_light_quiet:    'تهيئة بيئة النوم والسكون',
    };

    const primary  = actionMap[primarySub]   || `معالجة ${pSub}`;
    const secondary = actionMap[secondarySub] || `دعم ${sSub}`;

    return `${primary} + ${secondary}`;
}

/* ══════════════════════════════════════════════════════════
   MAIN SCORING ENGINE
   ══════════════════════════════════════════════════════════ */

export function computeRouting(
    answers: EngineAnswers,
    triageResult: TriageResult,
): RoutingResult {
    // ── Step 1: Initialize domain scores ──
    const scores: Record<DomainId, number> = {
        jasadi: 0,
        nafsi:  0,
        fikri:  0,
        ruhi:   0,
    };

    // ── Step 2: Add pathway base scores ──
    const pathwayBoost = PATHWAY_DOMAIN_SCORES[answers.pathwayId];
    if (pathwayBoost) {
        for (const [d, v] of Object.entries(pathwayBoost)) {
            scores[d as DomainId] += v as number;
        }
    }

    // ── Step 3: Add functional pattern boost ──
    const funcBoost = FUNCTIONAL_DOMAIN_BOOST[triageResult.topFunctionalPattern];
    if (funcBoost) {
        for (const [d, v] of Object.entries(funcBoost)) {
            scores[d as DomainId] += v as number;
        }
    }

    // ── Step 4: Add somatic theme boost ──
    const somBoost = SOMATIC_DOMAIN_BOOST[triageResult.topSomaticTheme];
    if (somBoost) {
        for (const [d, v] of Object.entries(somBoost)) {
            scores[d as DomainId] += v as number;
        }
    }

    // ── Step 5: Add emotional context boost (with cap) ──
    const emotionalAccumulator: Record<DomainId, number> = { jasadi: 0, nafsi: 0, fikri: 0, ruhi: 0 };
    for (const emo of answers.emotionalContext) {
        if (emo === 'none') continue;
        const emoBoost = EMOTIONAL_DOMAIN_BOOST[emo];
        if (emoBoost) {
            for (const [d, v] of Object.entries(emoBoost)) {
                emotionalAccumulator[d as DomainId] += v as number;
            }
        }
    }
    // Apply cap: no domain gets more than EMOTIONAL_BONUS_CAP from emotions
    for (const d of ['jasadi', 'nafsi', 'fikri', 'ruhi'] as DomainId[]) {
        scores[d] += Math.min(emotionalAccumulator[d], EMOTIONAL_BONUS_CAP);
    }

    // ── Step 5b: Physical pathway protection rule ──
    // For physical pathways, emotional context should not override jasadi
    // unless: emotional tags >= 2 AND severity >= 7 AND duration >= weeks
    // EXCEPTION: existential/spiritual contexts (identity, loneliness, disconnected, grief)
    // with chronic duration may allow ruhi to lead — this is "loss of meaning" archetype
    const isPhysicalPathway = PHYSICAL_PATHWAYS.has(answers.pathwayId);
    if (isPhysicalPathway) {
        const emoTagCount = answers.emotionalContext.filter(e => e !== 'none').length;
        const isLongDuration = answers.duration === 'weeks' || answers.duration === 'months';
        const emotionalOverrideAllowed = emoTagCount >= 2 && answers.severity >= 7 && isLongDuration;

        // Existential exception: if dominant non-jasadi is ruhi, and emotional tags
        // are existential, and duration is months → allow ruhi to lead
        const EXISTENTIAL_TAGS = new Set(['identity', 'loneliness', 'disconnected', 'grief']);
        const existentialTags = answers.emotionalContext.filter(e => EXISTENTIAL_TAGS.has(e));
        const isExistentialOverride = existentialTags.length >= 2
            && answers.duration === 'months'
            && scores.ruhi >= scores.nafsi;  // ruhi is the natural leading non-jasadi

        if (!emotionalOverrideAllowed && !isExistentialOverride) {
            // Ensure jasadi stays dominant for physical pathways
            const maxNonJasadi = Math.max(scores.nafsi, scores.fikri, scores.ruhi);
            if (maxNonJasadi > scores.jasadi) {
                // Boost jasadi to at least match the highest competitor
                scores.jasadi = maxNonJasadi + 1;
            }
        }
        // If isExistentialOverride → allow natural scoring (no jasadi protection)
        // The post-sort swap in Step 7 handles promoting ruhi
    }

    // ── Step 6: Severity modulation ──
    // High severity → boost jasadi (physical symptoms are severe)
    if (answers.severity >= 7) {
        scores.jasadi += 2;
    }

    // Long duration → boost ruhi (chronic → rhythmic/spiritual dimension)
    if (answers.duration === 'months') {
        scores.ruhi += 2;
        scores.fikri += 1;
    }

    // ── Step 7: Determine primary & secondary domains ──
    const sortedDomains = (Object.entries(scores) as [DomainId, number][])
        .sort(([, a], [, b]) => b - a);

    let primary   = sortedDomains[0][0];
    let secondary = sortedDomains[1][0];

    // Ensure primary ≠ secondary (should always be true, but guard)
    if (primary === secondary && sortedDomains.length > 1) {
        secondary = sortedDomains[1][0];
    }

    // ── Step 7b: Existential archetype post-sort swap ──
    // If jasadi won but existential override conditions are met,
    // and ruhi is within striking distance (≥80% of jasadi raw score),
    // promote ruhi to primary and jasadi to secondary.
    if (isPhysicalPathway && primary === 'jasadi') {
        const EXISTENTIAL_TAGS_CHECK = new Set(['identity', 'loneliness', 'disconnected', 'grief']);
        const existentialCount = answers.emotionalContext.filter(e => EXISTENTIAL_TAGS_CHECK.has(e)).length;
        const ruhiCloseEnough = scores.ruhi >= scores.jasadi * 0.75;
        if (existentialCount >= 2 && answers.duration === 'months' && ruhiCloseEnough && scores.ruhi >= scores.nafsi) {
            // Swap: ruhi becomes primary, jasadi becomes secondary
            primary = 'ruhi';
            secondary = 'jasadi';
        }
    }

    // ── Step 8: Determine subdomains ──
    const subdomainTally: Record<string, number> = {};

    // Pathway hints
    const pwHints = PATHWAY_SUBDOMAIN_HINTS[answers.pathwayId] ?? [];
    for (const s of pwHints) {
        subdomainTally[s] = (subdomainTally[s] ?? 0) + 3;
    }

    // Functional pattern hints
    const funcHints = FUNCTIONAL_SUBDOMAIN_HINTS[triageResult.topFunctionalPattern] ?? [];
    for (const s of funcHints) {
        subdomainTally[s] = (subdomainTally[s] ?? 0) + 2;
    }

    // Somatic theme hints
    const somHints = SOMATIC_SUBDOMAIN_HINTS[triageResult.topSomaticTheme] ?? [];
    for (const s of somHints) {
        subdomainTally[s] = (subdomainTally[s] ?? 0) + 2;
    }

    // Filter subdomains by domain, then pick top
    const primarySubdomainIds   = DOMAIN_BY_ID[primary]?.subdomains.map(s => s.id) ?? [];
    const secondarySubdomainIds = DOMAIN_BY_ID[secondary]?.subdomains.map(s => s.id) ?? [];

    const primarySub = pickTopSubdomain(subdomainTally, primarySubdomainIds);
    const secondarySub = pickTopSubdomain(subdomainTally, secondarySubdomainIds);

    // ── Step 9: Select 5 recommended tools ──
    const primaryTools   = SUBDOMAIN_BY_ID[primarySub]?.tools ?? [];
    const secondaryTools = SUBDOMAIN_BY_ID[secondarySub]?.tools ?? [];

    // Pick: 1 protocol, 1 practice, 1 test from primary; 1 workshop, 1 tracker from secondary
    const recommended: ToolRecommendation[] = [];

    const pickByType = (tools: ToolRecommendation[], type: string): ToolRecommendation | undefined =>
        tools.find(t => t.type === type);

    const primaryProtocol = pickByType(primaryTools, 'protocol');
    const primaryPractice = pickByType(primaryTools, 'practice');
    const primaryTest     = pickByType(primaryTools, 'test');
    const primaryWorkshop = pickByType(primaryTools, 'workshop');
    const primaryTracker  = pickByType(primaryTools, 'tracker');

    // Prefer mixing primary + secondary for variety
    const secondaryWorkshop = pickByType(secondaryTools, 'workshop');
    const secondaryTracker  = pickByType(secondaryTools, 'tracker');

    if (primaryProtocol) recommended.push(primaryProtocol);
    if (primaryPractice) recommended.push(primaryPractice);
    if (primaryTest)     recommended.push(primaryTest);
    if (secondaryWorkshop) recommended.push(secondaryWorkshop);
    else if (primaryWorkshop) recommended.push(primaryWorkshop);
    if (secondaryTracker) recommended.push(secondaryTracker);
    else if (primaryTracker) recommended.push(primaryTracker);

    // Cap at 5
    const finalTools = recommended.slice(0, 5);

    // ── Step 10: Normalize scores to 0–100 ──
    const maxScore = Math.max(1, ...Object.values(scores));
    const normalizedScores: Record<DomainId, number> = {
        jasadi: Math.round((scores.jasadi / maxScore) * 100),
        nafsi:  Math.round((scores.nafsi  / maxScore) * 100),
        fikri:  Math.round((scores.fikri  / maxScore) * 100),
        ruhi:   Math.round((scores.ruhi   / maxScore) * 100),
    };

    // ── Step 11: Generate text ──
    const why      = generateWhy(primary, secondary, primarySub, secondarySub);
    const priority = generatePriority(primarySub, secondarySub);

    // ── Step 12: Escalation check (3-tier) ──
    // Tier 1: Emergency — real red flags
    // Tier 2: Urgent — high severity + high triage score
    // Tier 3: Manageable — no escalation
    const scoreGap = normalizedScores[primary] - normalizedScores[secondary];
    const confidence: 'high' | 'medium' | 'low' = scoreGap >= 30 ? 'high' : scoreGap >= 15 ? 'medium' : 'low';

    let escalation_needed = false;
    if (triageResult.level === 'emergency' || answers.hasEmergencyFlag) {
        // Tier 1: Real emergency
        escalation_needed = true;
    } else if (answers.severity >= 7 && triageResult.score >= 8) {
        // Tier 2: High severity + high triage score
        escalation_needed = true;
    } else if (confidence === 'low' && answers.duration === 'months') {
        // Tier 2b: Low confidence with chronic duration
        escalation_needed = true;
    }
    // Otherwise: Tier 3 — no escalation

    return {
        primary_domain:      primary,
        secondary_domain:    secondary,
        primary_subdomain:   primarySub,
        secondary_subdomain: secondarySub,
        domain_scores:       normalizedScores,
        priority,
        why,
        recommended_tools:   finalTools,
        escalation_needed,
    };
}

/* ══════════════════════════════════════════════════════════
   HELPER: Pick top subdomain from a filtered list
   ══════════════════════════════════════════════════════════ */

function pickTopSubdomain(
    tally: Record<string, number>,
    validIds: SubdomainId[],
): SubdomainId {
    let topId    = validIds[0]; // fallback to first
    let topScore = -1;

    for (const id of validIds) {
        const s = tally[id] ?? 0;
        if (s > topScore) {
            topScore = s;
            topId    = id;
        }
    }

    return topId;
}
