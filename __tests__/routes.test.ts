// __tests__/routes.test.ts
// Tests for lib/routes.ts route configuration

import {
    PROTECTED_ROUTES,
    ADMIN_ROUTES,
    AUTH_ONLY_ROUTES,
    PROTECTED_PAGE_NAMES,
    PAGE_TO_TAB,
    HIDE_NAV_PAGES,
    HIDE_FOOTER_PAGES,
} from '@/lib/routes';

describe('Route Configuration Integrity', () => {
    // Test 16: Route arrays are non-empty and valid
    test('should have non-empty route arrays with paths starting with /', () => {
        expect(PROTECTED_ROUTES.length).toBeGreaterThan(0);
        expect(ADMIN_ROUTES.length).toBeGreaterThan(0);
        expect(AUTH_ONLY_ROUTES.length).toBeGreaterThan(0);

        for (const route of PROTECTED_ROUTES) {
            expect(route).toMatch(/^\//);
        }
        for (const route of ADMIN_ROUTES) {
            expect(route).toMatch(/^\//);
        }
    });

    // Test 17: PAGE_TO_TAB covers important navigation pages
    test('should have PAGE_TO_TAB entries for core navigation pages', () => {
        const corePages = ['Home', 'Shop', 'HealthTracker', 'Profile', 'Settings'];
        for (const page of corePages) {
            expect(page in PAGE_TO_TAB).toBe(true);
        }
    });

    test('should have non-empty HIDE_NAV_PAGES and HIDE_FOOTER_PAGES', () => {
        expect(HIDE_NAV_PAGES.length).toBeGreaterThan(0);
        expect(HIDE_FOOTER_PAGES.length).toBeGreaterThan(0);
    });

    test('should not have duplicate entries in PROTECTED_ROUTES', () => {
        const unique = new Set(PROTECTED_ROUTES);
        expect(unique.size).toBe(PROTECTED_ROUTES.length);
    });
});
