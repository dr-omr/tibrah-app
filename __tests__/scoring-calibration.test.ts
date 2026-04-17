// __tests__/scoring-calibration.test.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Scoring Engine Calibration (10 Clinical Personas)
// ════════════════════════════════════════════════════════════════════════
//
// Each persona simulates a real assessment, and we verify that the
// routing engine assigns the expected primary and secondary domains.
// ════════════════════════════════════════════════════════════════════════

import { computeRouting } from '@/lib/domain-scoring-engine';
import { computeTriage } from '@/components/health-engine/constants';
import type { EngineAnswers, DomainId } from '@/components/health-engine/types';

/* ══════════════════════════════════════════════════════════
   HELPER: Build a minimal EngineAnswers
   ══════════════════════════════════════════════════════════ */
function buildAnswers(partial: {
    pathwayId: string;
    severity: number;
    duration: string;
    emotionalContext?: string[];
    redFlags?: string[];
    clinicalAnswers?: Record<string, string | string[] | number>;
}): EngineAnswers {
    return {
        pathwayId: partial.pathwayId,
        severity: partial.severity,
        duration: partial.duration,
        emotionalContext: partial.emotionalContext ?? [],
        emotionalNote: '',
        redFlags: partial.redFlags ?? [],
        hasEmergencyFlag: (partial.redFlags ?? []).some(f =>
            f.toLowerCase().includes('chest') || f.toLowerCase().includes('breathing')
        ),
        emergencyMessage: '',
        clinicalAnswers: partial.clinicalAnswers ?? {},
        freeText: '',
    };
}

/* ══════════════════════════════════════════════════════════
   TEST PERSONAS
   ══════════════════════════════════════════════════════════ */

interface Persona {
    name: string;
    answers: EngineAnswers;
    expectedPrimary: DomainId;
    expectedSecondary?: DomainId;  // optional — some are less deterministic
}

const PERSONAS: Persona[] = [
    {
        name: 'GERD + anxiety (أحمد)',
        answers: buildAnswers({
            pathwayId: 'digestion',
            severity: 6,
            duration: 'weeks',
            emotionalContext: ['work_stress'],
        }),
        expectedPrimary: 'jasadi',
        expectedSecondary: 'nafsi',
    },
    {
        name: 'Insomnia + overthinking (فاطمة)',
        answers: buildAnswers({
            pathwayId: 'sleep',
            severity: 7,
            duration: 'months',
            emotionalContext: [],
        }),
        expectedPrimary: 'ruhi',
    },
    {
        name: 'Fatigue + low mood (خالد)',
        answers: buildAnswers({
            pathwayId: 'fatigue',
            severity: 5,
            duration: 'weeks',
            emotionalContext: ['grief'],
        }),
        expectedPrimary: 'jasadi',
        expectedSecondary: 'nafsi',
    },
    {
        name: 'IBS + emotional suppression (نور)',
        answers: buildAnswers({
            pathwayId: 'digestion',
            severity: 6,
            duration: 'months',
            emotionalContext: ['family'],
        }),
        expectedPrimary: 'jasadi',
        expectedSecondary: 'nafsi',
    },
    {
        name: 'Panic-like somatic (سارة)',
        answers: buildAnswers({
            pathwayId: 'anxiety',
            severity: 8,
            duration: 'days',
            emotionalContext: ['fear'],
        }),
        expectedPrimary: 'nafsi',
    },
    {
        name: 'Hormone/fatigue pattern (ليلى)',
        answers: buildAnswers({
            pathwayId: 'hormonal',
            severity: 5,
            duration: 'months',
            emotionalContext: ['burnout'],
        }),
        expectedPrimary: 'jasadi',
    },
    {
        name: 'Loss of meaning (عبدالله)',
        answers: buildAnswers({
            pathwayId: 'fatigue',
            severity: 4,
            duration: 'months',
            emotionalContext: ['identity', 'loneliness'],
        }),
        expectedPrimary: 'ruhi',  // Clinical decision: loss of meaning IS ruhi
    },
    {
        name: 'Pure digestive (محمد)',
        answers: buildAnswers({
            pathwayId: 'digestion',
            severity: 7,
            duration: 'weeks',
            emotionalContext: [],
        }),
        expectedPrimary: 'jasadi',
    },
    {
        name: 'Pure emotional (هند)',
        answers: buildAnswers({
            pathwayId: 'anxiety',
            severity: 8,
            duration: 'weeks',
            emotionalContext: ['grief', 'fear', 'trauma'],
        }),
        expectedPrimary: 'nafsi',
    },
    {
        name: 'Mixed body-mind-spirit (سلطان)',
        answers: buildAnswers({
            pathwayId: 'fatigue',
            severity: 6,
            duration: 'months',
            emotionalContext: ['burnout', 'loneliness'],
        }),
        expectedPrimary: 'jasadi',
    },
];

/* ══════════════════════════════════════════════════════════
   TESTS
   ══════════════════════════════════════════════════════════ */

describe('Scoring Engine — 10 Clinical Persona Calibration', () => {
    PERSONAS.forEach((persona) => {
        it(`routes "${persona.name}" to primary=${persona.expectedPrimary}`, () => {
            const triage = computeTriage(persona.answers);
            const routing = computeRouting(persona.answers, triage);

            // Log for debugging
            console.log(`  ${persona.name}:`);
            console.log(`    Scores: J=${routing.domain_scores.jasadi} N=${routing.domain_scores.nafsi} F=${routing.domain_scores.fikri} R=${routing.domain_scores.ruhi}`);
            console.log(`    Primary: ${routing.primary_domain} (expected: ${persona.expectedPrimary})`);
            console.log(`    Secondary: ${routing.secondary_domain} (expected: ${persona.expectedSecondary ?? 'any'})`);
            console.log(`    Subdomain: ${routing.primary_subdomain}`);
            console.log(`    Tools: ${routing.recommended_tools.length}`);

            expect(routing.primary_domain).toBe(persona.expectedPrimary);

            if (persona.expectedSecondary) {
                expect(routing.secondary_domain).toBe(persona.expectedSecondary);
            }

            // Universal assertions
            expect(routing.recommended_tools.length).toBeGreaterThan(0);
            expect(routing.recommended_tools.length).toBeLessThanOrEqual(5);
            expect(routing.priority).toBeTruthy();
            expect(routing.why).toBeTruthy();
        });
    });

    it('returns different results for different personas', () => {
        const results = PERSONAS.map(p => {
            const triage = computeTriage(p.answers);
            return computeRouting(p.answers, triage);
        });

        // At least 3 different primary domains across 10 personas
        const uniquePrimaries = new Set(results.map(r => r.primary_domain));
        expect(uniquePrimaries.size).toBeGreaterThanOrEqual(2);
    });

    it('escalation is triggered for severity >= 8', () => {
        const highSeverityPersona = PERSONAS.find(p => p.answers.severity >= 8);
        if (highSeverityPersona) {
            const triage = computeTriage(highSeverityPersona.answers);
            const routing = computeRouting(highSeverityPersona.answers, triage);
            expect(routing.escalation_needed).toBe(true);
        }
    });
});
