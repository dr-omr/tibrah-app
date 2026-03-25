/**
 * Route Configuration — Single Source of Truth
 * 
 * All route protection logic across middleware.ts, Layout.tsx,
 * and BottomNav.tsx should import from this file.
 * 
 * @see REMEDIATION_PLAN.md P0-SEC-3
 */

// ─── URL paths (used by middleware.ts) ───

/** Routes that require any authenticated user */
export const PROTECTED_ROUTES = [
    '/profile',
    '/settings',
    '/medical-file',
    '/my-appointments',
    '/health-tracker',
    '/rewards',
] as const;

/** Routes that require admin role */
export const ADMIN_ROUTES = [
    '/admin-dashboard',
    '/admin',
] as const;

/** Routes that redirect to home if user is already authenticated */
export const AUTH_ONLY_ROUTES = [
    '/login',
    '/register',
] as const;

// ─── Page names (used by Layout.tsx for client-side protection) ───

/**
 * PascalCase page names that require authentication.
 * Must be kept in sync with PROTECTED_ROUTES above.
 */
export const PROTECTED_PAGE_NAMES = [
    'Profile',
    'Settings',
    'MedicalFile',
    'MyAppointments',
    'HealthTracker',
    'Rewards',
    'AdminDashboard',
] as const;

// ─── Navigation config (used by BottomNav.tsx) ───

/**
 * Maps every page name to its parent bottom-nav tab.
 * Empty string = no bottom nav highlight (accessed via header menu).
 */
export const PAGE_TO_TAB: Record<string, string> = {
    // Bottom nav tabs
    'Home': 'Home',
    'MyCare': 'MyCare',
    'MyAppointments': 'MyCare',
    'BookAppointment': 'MyCare',
    'MedicalFile': 'MyCare',
    'HealthTracker': 'HealthTracker',
    'SymptomAnalysis': 'HealthTracker',
    'BodyMap': 'HealthTracker',
    'Shop': 'Shop',
    'Checkout': 'Shop',
    'ProductDetails': 'Shop',
    'Premium': 'Premium',
    // Header menu pages — no bottom nav highlight
    'Profile': '',
    'Settings': '',
    'Rewards': '',
    'Help': '',
    'About': '',
    'Courses': '',
    'CourseDetails': '',
    'Library': '',
    'Frequencies': '',
    'Breathe': '',
    'MealPlanner': '',
    'Privacy': '',
    'Terms': '',
};

// ─── Layout config ───

/** Pages where bottom nav and header should be hidden */
export const HIDE_NAV_PAGES = [
    'Checkout', 'ProductDetails', 'BookAppointment', 'ProgramDetails',
    'ArticleDetails', 'CourseDetails', 'RifeFrequencies', 'AdminDashboard',
    'Settings', 'Login', 'Frequencies', 'Breathe', 'MealPlanner',
] as const;

/** Pages where footer should be hidden */
export const HIDE_FOOTER_PAGES = [
    'Checkout', 'BookAppointment', 'Login', 'AdminDashboard',
    'Settings', 'Frequencies', 'Breathe', 'MealPlanner',
] as const;
