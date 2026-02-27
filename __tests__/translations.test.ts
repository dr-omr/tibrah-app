// __tests__/translations.test.ts
// Unit tests for i18n translation system integrity

import { translations } from '@/contexts/LanguageContext';

describe('Translation System', () => {
    const arKeys = Object.keys(translations.ar);
    const enKeys = Object.keys(translations.en);

    test('Arabic translations should have at least 100 keys', () => {
        expect(arKeys.length).toBeGreaterThanOrEqual(100);
    });

    test('English translations should have at least 100 keys', () => {
        expect(enKeys.length).toBeGreaterThanOrEqual(100);
    });

    test('Arabic and English should have the same number of keys', () => {
        expect(arKeys.length).toBe(enKeys.length);
    });

    test('Every Arabic key should exist in English', () => {
        const missingInEn = arKeys.filter(key => !enKeys.includes(key));
        expect(missingInEn).toEqual([]);
    });

    test('Every English key should exist in Arabic', () => {
        const missingInAr = enKeys.filter(key => !arKeys.includes(key));
        expect(missingInAr).toEqual([]);
    });

    test('No translation value should be empty', () => {
        const emptyAr = arKeys.filter(key => !(translations.ar as any)[key]);
        const emptyEn = enKeys.filter(key => !(translations.en as any)[key]);
        expect(emptyAr).toEqual([]);
        expect(emptyEn).toEqual([]);
    });

    test('Navigation keys should exist in both languages', () => {
        const navKeys = ['nav.home', 'nav.services', 'nav.shop', 'nav.courses', 'nav.library'];
        navKeys.forEach(key => {
            expect(arKeys).toContain(key);
            expect(enKeys).toContain(key);
        });
    });

    test('Meal planner keys should exist in both languages', () => {
        const mealKeys = ['meal.title', 'meal.breakfast', 'meal.lunch', 'meal.dinner', 'meal.calories'];
        mealKeys.forEach(key => {
            expect(arKeys).toContain(key);
            expect(enKeys).toContain(key);
        });
    });

    test('Medical file keys should exist in both languages', () => {
        const medicalKeys = ['medical.title', 'medical.chronicConditions', 'medical.allergies'];
        medicalKeys.forEach(key => {
            expect(arKeys).toContain(key);
            expect(enKeys).toContain(key);
        });
    });

    test('Admin keys should exist in both languages', () => {
        const adminKeys = ['admin.title', 'admin.overview', 'admin.login'];
        adminKeys.forEach(key => {
            expect(arKeys).toContain(key);
            expect(enKeys).toContain(key);
        });
    });

    test('Common UI keys should exist in both languages', () => {
        const commonKeys = ['common.search', 'common.add', 'common.remove', 'common.close'];
        commonKeys.forEach(key => {
            expect(arKeys).toContain(key);
            expect(enKeys).toContain(key);
        });
    });

    test('Arabic values should contain Arabic characters', () => {
        const arabicRegex = /[\u0600-\u06FF]/;
        const nonArabic = arKeys.filter(key => {
            const val = (translations.ar as any)[key];
            // Skip keys that might have emojis or English content
            return typeof val === 'string' && val.length > 2 && !arabicRegex.test(val) && !val.includes('English');
        });
        expect(nonArabic.length).toBeLessThanOrEqual(5); // Allow a few exceptions
    });
});
