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
    '/doctor',
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
 * Tabs: Home | Jasadi | MyCare(center) | Ruhi | More
 * Empty string = no bottom nav highlight.
 */
export const PAGE_TO_TAB: Record<string, string> = {
    // ── Home tab ──
    'Home': 'Home',

    // ── جسدي tab ──
    'Jasadi': 'Jasadi',
    'BodyMap': 'Jasadi',
    'SymptomChecker': 'Jasadi',
    'SymptomAnalysis': 'Jasadi',
    'QuickCheckIn': 'Jasadi',
    'Intake': 'Jasadi',
    'FaceScan': 'Jasadi',
    'HealthReport': 'Jasadi',
    'MedicalHistory': 'Jasadi',
    'MealPlanner': 'Jasadi',
    'SmartPharmacy': 'Jasadi',
    'HealthTracker': 'Jasadi',
    'RecordHealth': 'Jasadi',
    'DailyLog': 'Jasadi',

    // ── رعايتي center tab ──
    'MyCare': 'MyCare',
    'MyAppointments': 'MyCare',
    'BookAppointment': 'MyCare',
    'MedicalFile': 'MyCare',

    // ── روحي tab ──
    'Ruhi': 'Ruhi',
    'Frequencies': 'Ruhi',
    'RifeFrequencies': 'Ruhi',
    'Radio': 'Ruhi',
    'Meditation': 'Ruhi',
    'Breathe': 'Ruhi',

    // ── المزيد tab (covers نفسي, فكري, أخرى) ──
    'More': 'More',
    'Nafsi': 'More',
    'Fikri': 'More',
    'Other': 'More',
    'EmotionalMedicine': 'More',
    'Family': 'More',
    'Library': 'More',
    'GlassLibrary': 'More',
    'Courses': 'More',
    'Rewards': 'More',
    'Shop': 'More',
    'Premium': 'More',
    'Services': 'More',
    'DigitalServices': 'More',
    'Profile': 'More',
    'Settings': 'More',
    'Help': 'More',

    // ── No highlight ──
    'Checkout': '',
    'ProductDetails': '',
    'CourseDetails': '',
    'ProgramDetails': '',
    'ArticleDetails': '',
    'About': '',
    'Privacy': '',
    'Terms': '',
};

// ─── Layout config ───

/** Pages where bottom nav and header should be hidden */
export const HIDE_NAV_PAGES = [
    'Checkout', 'ProductDetails', 'BookAppointment', 'ProgramDetails',
    'ArticleDetails', 'CourseDetails', 'RifeFrequencies', 'AdminDashboard',
    'Admin', 'Settings', 'Login', 'Frequencies', 'Breathe', 'MealPlanner',
] as const;

/** Pages where footer should be hidden */
export const HIDE_FOOTER_PAGES = [
    'Checkout', 'BookAppointment', 'Login', 'AdminDashboard',
    'Admin', 'Settings', 'Frequencies', 'Breathe', 'MealPlanner',
] as const;
