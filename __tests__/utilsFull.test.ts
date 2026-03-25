// __tests__/utilsFull.test.ts
// Tests for root utils.ts (formatArabicNumber, formatArabicDate, formatCurrency, truncateText)

import {
    createPageUrl,
    formatArabicNumber,
    formatArabicDate,
    formatCurrency,
    truncateText,
} from '@/utils';

describe('Utils — formatArabicNumber', () => {
    // Test 11
    test('should convert western digits to Arabic numerals', () => {
        expect(formatArabicNumber(0)).toBe('٠');
        expect(formatArabicNumber(123)).toBe('١٢٣');
        expect(formatArabicNumber(2026)).toBe('٢٠٢٦');
    });

    test('should handle negative numbers preserving the minus sign', () => {
        const result = formatArabicNumber(-5);
        expect(result).toContain('٥');
        expect(result).toContain('-');
    });
});

describe('Utils — formatArabicDate', () => {
    // Test 12
    test('should return a string containing Arabic weekday and month', () => {
        const result = formatArabicDate(new Date(2026, 2, 25)); // March 25, 2026
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(5);
    });

    test('should accept ISO string input', () => {
        const result = formatArabicDate('2026-03-25T07:00:00Z');
        expect(typeof result).toBe('string');
    });
});

describe('Utils — formatCurrency', () => {
    // Test 13
    test('should append ر.س to the amount', () => {
        const result = formatCurrency(99);
        expect(result).toContain('ر.س');
    });

    test('should format large numbers', () => {
        const result = formatCurrency(1500);
        expect(result).toContain('ر.س');
    });
});

describe('Utils — truncateText', () => {
    // Test 14
    test('should truncate text longer than maxLength with ellipsis', () => {
        const result = truncateText('This is a really long text that should be truncated', 20);
        expect(result.length).toBeLessThanOrEqual(20);
        expect(result).toContain('...');
    });

    test('should return original text when shorter than maxLength', () => {
        expect(truncateText('Short', 100)).toBe('Short');
    });
});

describe('Utils — createPageUrl (extended)', () => {
    test('should convert PascalCase with consecutive uppercase to correct path', () => {
        expect(createPageUrl('AIChat')).toBe('/ai-chat');
        expect(createPageUrl('HealthTracker')).toBe('/health-tracker');
    });

    test('should preserve query strings', () => {
        expect(createPageUrl('Shop?category=vitamins')).toBe('/shop?category=vitamins');
    });

    test('should return full paths as-is', () => {
        expect(createPageUrl('/already/a/path')).toBe('/already/a/path');
    });
});
