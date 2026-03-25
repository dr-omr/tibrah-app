// __tests__/healthContextBuilder.test.ts
// Tests for lib/healthContextBuilder.ts (pure functions only)
// We mock the userDataService import to avoid Firebase dependency chain

jest.mock('@/lib/userDataService', () => ({
    getUserData: jest.fn(),
}));

import { getHealthSummary, getPersonalizedGreeting } from '@/lib/healthContextBuilder';
import type { HealthContext } from '@/lib/healthContextBuilder';

describe('Health Context Builder — getHealthSummary', () => {
    // Test 18
    test('should build summary from context with water and sleep data', () => {
        const ctx: HealthContext = {
            waterToday: 1500,
            waterGoal: 2500,
            sleepScore: 85,
            moodScore: 4,
        };
        const summary = getHealthSummary(ctx);
        expect(summary).toContain('💧');
        expect(summary).toContain('60%'); // 1500/2500 = 60%
        expect(summary).toContain('😴'); // sleepScore >= 80
        expect(summary).toContain('😊'); // moodScore >= 4
    });

    test('should return default message when no data is provided', () => {
        const summary = getHealthSummary({});
        expect(summary).toBe('لا توجد بيانات صحية بعد');
    });

    test('should include fasting indicator when active', () => {
        const summary = getHealthSummary({ fastingActive: true });
        expect(summary).toContain('⏱️');
        expect(summary).toContain('صيام');
    });
});

describe('Health Context Builder — getPersonalizedGreeting', () => {
    // Test 19
    test('should greet with صباح الخير in the morning and include name', () => {
        const morning = new Date(2026, 2, 25, 8, 0, 0);
        const greeting = getPersonalizedGreeting({ name: 'أحمد' }, morning);
        expect(greeting).toContain('صباح الخير');
        expect(greeting).toContain('أحمد');
    });

    test('should greet with مساء النور in the evening', () => {
        const evening = new Date(2026, 2, 25, 20, 0, 0);
        const greeting = getPersonalizedGreeting({}, evening);
        expect(greeting).toContain('مساء النور');
        expect(greeting).toContain('غالي'); // default when no name
    });

    test('should warn about low water intake', () => {
        const morning = new Date(2026, 2, 25, 10, 0, 0);
        const greeting = getPersonalizedGreeting(
            { waterToday: 200, waterGoal: 2500 },
            morning
        );
        expect(greeting).toContain('الماء');
    });
});
