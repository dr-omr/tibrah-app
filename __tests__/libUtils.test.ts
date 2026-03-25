// __tests__/libUtils.test.ts
// Tests for lib/utils.ts (cn utility)

import { cn } from '@/lib/utils';

describe('cn — class name merge utility', () => {
    // Test 15
    test('should merge multiple class names and ignore falsy values', () => {
        expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
        expect(cn('base', false, undefined, null, 'active')).toBe('base active');
        expect(cn()).toBe('');
        expect(cn('single')).toBe('single');
    });
});
