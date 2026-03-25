// __tests__/localBrain.test.ts
// Tests for lib/localBrain.ts

import { getFallbackAdvice, getGeneralResponse } from '@/lib/localBrain';

describe('Local Brain — getFallbackAdvice', () => {
    // Test 6: Low sleep triggers sleep warning
    test('should warn about low sleep when sleep < 5', () => {
        const advice = getFallbackAdvice({ sleep: 3 });
        expect(advice).toContain('نومك');
        expect(advice).toContain('نصيحتي');
    });

    // Test 7: All healthy returns positive response
    test('should return positive message when all metrics are good', () => {
        const advice = getFallbackAdvice({ sleep: 8, water: 8, mood: 5, stress: 1, energy: 5 });
        expect(advice).toContain('ما شاء الله');
        expect(advice).toContain('استمر');
    });

    // Test 8: High stress triggers stress warning
    test('should warn about high stress when stress > 3', () => {
        const advice = getFallbackAdvice({ stress: 5 });
        expect(advice).toContain('التوتر');
    });
});

describe('Local Brain — getGeneralResponse', () => {
    // Test 8 (continued): booking keyword
    test('should return booking info when message contains حز', () => {
        const response = getGeneralResponse('أريد حجز موعد');
        expect(response).toContain('حجز');
    });

    test('should return default greeting for unrecognized messages', () => {
        const response = getGeneralResponse('مرحبا');
        expect(response).toContain('مساعد');
    });
});
