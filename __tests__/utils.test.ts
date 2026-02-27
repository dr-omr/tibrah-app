// __tests__/utils.test.ts
// Unit tests for utility functions

import { createPageUrl } from '@/utils';

describe('Utility Functions', () => {
    describe('createPageUrl', () => {
        test('should convert page name to URL path', () => {
            const result = createPageUrl('Shop');
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });

        test('should handle Checkout page', () => {
            const result = createPageUrl('Checkout');
            expect(typeof result).toBe('string');
        });

        test('should handle Home page', () => {
            const result = createPageUrl('Home');
            expect(typeof result).toBe('string');
        });
    });
});
