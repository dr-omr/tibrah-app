// __tests__/validators.test.ts
// Tests for lib/validators.ts

import {
    validateUser,
    validateHealthMetric,
    validateDailyLog,
    sanitizeHtml,
    sanitizeEmail,
} from '@/lib/validators';

describe('Entity Validators', () => {
    // Test 1: validateUser
    describe('validateUser', () => {
        test('should pass for a valid user with email and name', () => {
            const result = validateUser({ email: 'test@example.com', name: 'Omar' });
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.data).not.toBeNull();
        });

        test('should fail when email is missing or invalid', () => {
            const noEmail = validateUser({ name: 'Omar' });
            expect(noEmail.valid).toBe(false);
            expect(noEmail.errors.some(e => e.field === 'email')).toBe(true);

            const badEmail = validateUser({ email: 'not-an-email', name: 'Omar' });
            expect(badEmail.valid).toBe(false);
            expect(badEmail.errors.some(e => e.field === 'email')).toBe(true);
        });
    });

    // Test 2: validateHealthMetric
    describe('validateHealthMetric', () => {
        test('should pass for valid health metric and fail when fields are missing', () => {
            const valid = validateHealthMetric({
                metric_type: 'blood_pressure',
                value: 120,
                unit: 'mmHg',
                recorded_at: '2026-03-25T07:00:00Z',
            });
            expect(valid.valid).toBe(true);

            const invalid = validateHealthMetric({ metric_type: 'bp' });
            expect(invalid.valid).toBe(false);
            expect(invalid.errors.length).toBeGreaterThanOrEqual(1);
        });
    });

    // Test 3: validateDailyLog — out of range
    describe('validateDailyLog', () => {
        test('should catch mood values outside 1-10 range', () => {
            const tooLow = validateDailyLog({ date: '2026-03-25', mood: 0 });
            expect(tooLow.valid).toBe(false);
            expect(tooLow.errors.some(e => e.field === 'mood')).toBe(true);

            const tooHigh = validateDailyLog({ date: '2026-03-25', mood: 11 });
            expect(tooHigh.valid).toBe(false);
            expect(tooHigh.errors.some(e => e.field === 'mood')).toBe(true);

            const justRight = validateDailyLog({ date: '2026-03-25', mood: 5 });
            expect(justRight.valid).toBe(true);
        });
    });
});

describe('Sanitization Helpers', () => {
    // Test 4: sanitizeHtml
    test('should strip HTML tags and trim whitespace', () => {
        expect(sanitizeHtml('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello');
        expect(sanitizeHtml('<b>bold</b>')).toBe('bold');
        expect(sanitizeHtml('  clean text  ')).toBe('clean text');
        expect(sanitizeHtml('')).toBe('');
    });

    // Test 5: sanitizeEmail
    test('should normalize valid emails and reject invalid ones', () => {
        expect(sanitizeEmail('  OMAR@Example.COM  ')).toBe('omar@example.com');
        expect(sanitizeEmail('valid@test.org')).toBe('valid@test.org');
        expect(sanitizeEmail('not-an-email')).toBeNull();
        expect(sanitizeEmail('@missing.com')).toBeNull();
        expect(sanitizeEmail('no-domain@')).toBeNull();
    });
});
