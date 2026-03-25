// __tests__/doctorContext.test.ts
// Tests for lib/doctorContext.ts data exports

import { EMERGENCY_KEYWORDS, HEALTH_TIPS, DOCTOR_KNOWLEDGE } from '@/lib/doctorContext';

describe('Doctor Context — Data Integrity', () => {
    // Test 20
    test('should have non-empty EMERGENCY_KEYWORDS with expected crisis terms', () => {
        expect(EMERGENCY_KEYWORDS.length).toBeGreaterThan(0);
        expect(EMERGENCY_KEYWORDS).toContain('طوارئ');
        expect(EMERGENCY_KEYWORDS).toContain('نزيف');
        expect(EMERGENCY_KEYWORDS).toContain('جلطة');
    });

    test('should have non-empty HEALTH_TIPS array', () => {
        expect(HEALTH_TIPS.length).toBeGreaterThan(0);
        // Each tip should be a non-empty string
        for (const tip of HEALTH_TIPS) {
            expect(typeof tip).toBe('string');
            expect(tip.length).toBeGreaterThan(0);
        }
    });

    test('should have DOCTOR_KNOWLEDGE containing key specialty areas', () => {
        expect(DOCTOR_KNOWLEDGE).toContain('الطب الوظيفي');
        expect(DOCTOR_KNOWLEDGE).toContain('التغذية العلاجية');
    });
});
