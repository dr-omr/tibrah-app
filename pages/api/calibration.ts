// pages/api/calibration.ts
// Quick calibration API endpoint — runs all 10 personas and returns results
import type { NextApiRequest, NextApiResponse } from 'next';
import { computeRouting } from '@/lib/domain-scoring-engine';
import { computeTriage } from '@/components/health-engine/constants';
import type { EngineAnswers, DomainId } from '@/components/health-engine/types';

interface Persona {
    name: string;
    pathwayId: string;
    severity: number;
    duration: string;
    emotionalContext: string[];
    expPrimary: DomainId;
    expSecondary?: DomainId;
}

function buildAnswers(p: Persona): EngineAnswers {
    return {
        pathwayId: p.pathwayId,
        severity: p.severity,
        duration: p.duration,
        emotionalContext: p.emotionalContext,
        emotionalNote: '',
        redFlags: [],
        hasEmergencyFlag: false,
        emergencyMessage: '',
        clinicalAnswers: {},
        freeText: '',
    };
}

const personas: Persona[] = [
    { name: 'GERD + anxiety', pathwayId: 'digestion', severity: 6, duration: 'weeks', emotionalContext: ['work_stress'], expPrimary: 'jasadi', expSecondary: 'nafsi' },
    { name: 'Insomnia + overthinking', pathwayId: 'sleep', severity: 7, duration: 'months', emotionalContext: [], expPrimary: 'ruhi' },
    { name: 'Fatigue + low mood', pathwayId: 'fatigue', severity: 5, duration: 'weeks', emotionalContext: ['grief'], expPrimary: 'jasadi', expSecondary: 'nafsi' },
    { name: 'IBS + emotional suppression', pathwayId: 'digestion', severity: 6, duration: 'months', emotionalContext: ['family'], expPrimary: 'jasadi', expSecondary: 'nafsi' },
    { name: 'Panic-like somatic', pathwayId: 'anxiety', severity: 8, duration: 'days', emotionalContext: ['fear'], expPrimary: 'nafsi' },
    { name: 'Hormone/fatigue', pathwayId: 'hormonal', severity: 5, duration: 'months', emotionalContext: ['burnout'], expPrimary: 'jasadi' },
    { name: 'Loss of meaning', pathwayId: 'fatigue', severity: 4, duration: 'months', emotionalContext: ['identity', 'loneliness'], expPrimary: 'ruhi' },
    { name: 'Pure digestive', pathwayId: 'digestion', severity: 7, duration: 'weeks', emotionalContext: [], expPrimary: 'jasadi' },
    { name: 'Pure emotional', pathwayId: 'anxiety', severity: 8, duration: 'weeks', emotionalContext: ['grief', 'fear', 'trauma'], expPrimary: 'nafsi' },
    { name: 'Mixed body-mind-spirit', pathwayId: 'fatigue', severity: 6, duration: 'months', emotionalContext: ['burnout', 'loneliness'], expPrimary: 'jasadi' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // ── Dev-only guard — never expose in production ──
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Not found' });
    }

    const results = personas.map((p, i) => {
        const answers = buildAnswers(p);
        const triage = computeTriage(answers);
        const routing = computeRouting(answers, triage);

        const primaryOk = routing.primary_domain === p.expPrimary;
        const secondaryOk = !p.expSecondary || routing.secondary_domain === p.expSecondary;

        return {
            index: i + 1,
            name: p.name,
            status: primaryOk && secondaryOk ? 'PASS' : 'FAIL',
            scores: routing.domain_scores,
            actualPrimary: routing.primary_domain,
            expectedPrimary: p.expPrimary,
            primaryMatch: primaryOk,
            actualSecondary: routing.secondary_domain,
            expectedSecondary: p.expSecondary ?? 'any',
            secondaryMatch: secondaryOk,
            subdomain: routing.primary_subdomain,
            triageLevel: triage.level,
            triageScore: triage.score,
            escalation: routing.escalation_needed,
            toolCount: routing.recommended_tools.length,
            tools: routing.recommended_tools.map(t => ({ type: t.type, name: t.arabicName })),
        };
    });

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    res.status(200).json({
        summary: { total: results.length, passed, failed },
        results,
    });
}
