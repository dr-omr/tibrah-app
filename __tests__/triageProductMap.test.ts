// __tests__/triageProductMap.test.ts
// Tests for lib/triageProductMap.ts

import {
    getRelevantProducts,
    getComplaintSuggestionMeta,
    triageProductMap,
} from '@/lib/triageProductMap';

describe('Triage Product Map', () => {
    const mockProducts = [
        { name: 'مغنيسيوم طبيعي', name_en: 'Natural Magnesium', description: 'مكمل للاسترخاء' },
        { name: 'أوميغا 3', name_en: 'Omega 3', description: 'دعم القلب والدماغ' },
        { name: 'بروتين', name_en: 'Protein Powder', description: 'لبناء العضلات' },
        { name: 'فيتامين سي', name_en: 'Vitamin C', description: 'دعم المناعة' },
    ];

    // Test 9: getRelevantProducts matches by keyword
    test('should return products matching headache complaint keywords', () => {
        const results = getRelevantProducts('headache', mockProducts);
        expect(results.length).toBeGreaterThan(0);
        // Magnesium and Omega should match headache keywords
        const productNames = results.map((p: any) => p.name);
        expect(productNames.some((n: string) => n.includes('مغنيسيوم') || n.includes('أوميغا'))).toBe(true);
    });

    test('should return max 3 products', () => {
        const manyProducts = Array(20).fill(mockProducts[0]);
        const results = getRelevantProducts('headache', manyProducts);
        expect(results.length).toBeLessThanOrEqual(3);
    });

    // Test 10: getComplaintSuggestionMeta fallback
    test('should fallback to "other" for unknown complaint IDs', () => {
        const meta = getComplaintSuggestionMeta('unknown_complaint');
        expect(meta).toEqual(triageProductMap.other);
        expect(meta.emoji).toBe('💊');
    });

    test('should return correct meta for known complaint', () => {
        const meta = getComplaintSuggestionMeta('fatigue');
        expect(meta.emoji).toBe('⚡');
        expect(meta.keywords.length).toBeGreaterThan(0);
    });
});
