/**
 * service-icons.ts — طِبرَا Unique Icon + Color Map
 * ───────────────────────────────────────────────────
 * كل خدمة لها رمز فريد ولون طبي خاص — لا تكرار.
 * الألوان مختارة من مجموعة طبية تنسجم مع هوية طِبرَا.
 *
 * استخدام:
 *   import { getServiceIcon } from '@/components/sections/service-icons';
 *   const { icon, color } = getServiceIcon(href);
 */

export interface ServiceIconData {
    icon: string;  // emoji أو رمز unicode
    color: string; // Tibrah-grade hex
}

/* ══════════════════════════════════════════════════
   MASTER MAP — href → { icon, color }
══════════════════════════════════════════════════ */
const SERVICE_ICON_MAP: Record<string, ServiceIconData> = {

    /* ─── جسدي: التشخيص ──────────────────────────── */
    '/symptom-checker':     { icon: '🩺', color: '#0D9488' }, // Tibrah Teal
    '/body-map':            { icon: '🫁', color: '#0891B2' }, // Ocean Cyan
    '/symptom-analysis':    { icon: '🤖', color: '#7C3AED' }, // AI Violet
    '/quick-check-in':      { icon: '⚡', color: '#D97706' }, // Amber Flash
    '/diagnosis/face-scan': { icon: '📷', color: '#059669' }, // Emerald Scan
    '/intake':              { icon: '📋', color: '#2563EB' }, // Royal Blue
    '/medical-history':     { icon: '🗂️', color: '#6D28D9' }, // Deep Indigo
    '/health-report':       { icon: '📊', color: '#0F766E' }, // Deep Teal

    /* ─── جسدي: التغذية ──────────────────────────── */
    '/meal-planner':        { icon: '🥗', color: '#10B981' }, // Fresh Green
    '/smart-pharmacy':      { icon: '💊', color: '#EC4899' }, // Pharma Pink

    /* ─── جسدي: المتابعة ─────────────────────────── */
    '/health-tracker':      { icon: '📈', color: '#06B6D4' }, // Sky Teal
    '/record-health':       { icon: '🩸', color: '#EF4444' }, // Vital Red
    '/daily-log':           { icon: '📓', color: '#8B5CF6' }, // Lavender Notes

    /* ─── جسدي: الكورسات ─────────────────────────── */
    '/courses?domain=jasadi': { icon: '🏃', color: '#14B8A6' }, // Active Teal

    /* ─── نفسي: التشخيص ──────────────────────────── */
    '/emotional-medicine':  { icon: '🫀', color: '#A855F7' }, // Soul Purple

    /* ─── نفسي: المشاعر ──────────────────────────── */
    // Same href, different label — handled by label fallback
    '/family':              { icon: '👨‍👩‍👧', color: '#F59E0B' }, // Warm Amber

    /* ─── نفسي: الكورسات ─────────────────────────── */
    '/courses?domain=nafsi': { icon: '🧠', color: '#9333EA' }, // Neuro Violet

    /* ─── فكري: المكتبة ──────────────────────────── */
    '/library':             { icon: '📚', color: '#B45309' }, // Deep Amber
    '/glass-library':       { icon: '🔭', color: '#0EA5E9' }, // Explore Blue

    /* ─── فكري: التطوير ──────────────────────────── */
    '/rewards':             { icon: '🏅', color: '#FBBF24' }, // Gold Medal

    /* ─── فكري: الكورسات ─────────────────────────── */
    '/courses':             { icon: '🎓', color: '#D97706' }, // Academy Orange
    '/courses?domain=fikri': { icon: '💡', color: '#F97316' }, // Insight Orange

    /* ─── روحي: الترددات ─────────────────────────── */
    '/frequencies':         { icon: '🔊', color: '#3B82F6' }, // Wave Blue
    '/rife-frequencies':    { icon: '〰️', color: '#6366F1' }, // Indigo Wave
    '/radio':               { icon: '🎵', color: '#8B5CF6' }, // Music Lavender

    /* ─── روحي: السكون ───────────────────────────── */
    '/meditation':          { icon: '🧘', color: '#0EA5E9' }, // Clarity Blue
    '/breathe':             { icon: '🌬️', color: '#34D399' }, // Breath Mint

    /* ─── روحي: الكورسات ─────────────────────────── */
    '/courses?domain=ruhi': { icon: '✨', color: '#818CF8' }, // Aura Indigo

    /* ─── أخرى: الرعاية ──────────────────────────── */
    '/my-care':             { icon: '🩹', color: '#10B981' }, // Care Green
    '/my-appointments':     { icon: '📅', color: '#3B82F6' }, // Schedule Blue
    '/book-appointment':    { icon: '⚡', color: '#0D9488' }, // Priority Teal
    '/medical-file':        { icon: '🗃️', color: '#475569' }, // Archive Slate

    /* ─── أخرى: الصيدلية ─────────────────────────── */
    '/shop':                { icon: '🛒', color: '#0891B2' }, // Shop Cyan
    '/premium':             { icon: '👑', color: '#F59E0B' }, // VIP Gold

    /* ─── أخرى: الخدمات ──────────────────────────── */
    '/services':            { icon: '🔬', color: '#059669' }, // Lab Green
    '/digital-services':    { icon: '💻', color: '#6366F1' }, // Digital Indigo
    // '/rewards' already defined above
    // '/family' already defined above

    /* ─── أخرى: الحساب ───────────────────────────── */
    '/profile':             { icon: '👤', color: '#64748B' }, // Profile Slate
    '/settings':            { icon: '⚙️', color: '#7C3AED' }, // Settings Purple
    '/help':                { icon: '💬', color: '#06B6D4' }, // Support Cyan
    '/privacy':             { icon: '🔐', color: '#EF4444' }, // Privacy Red
    '/terms':               { icon: '📜', color: '#78716C' }, // Contract Stone
};

/* ══════════════════════════════════════════════════
   LABEL FALLBACK — للعناصر التي تشترك في نفس href
═══════════════════════════════════════════════════ */
const LABEL_ICON_MAP: Record<string, ServiceIconData> = {
    'أدوات الشفاء العاطفي': { icon: '💙', color: '#6366F1' },
    'الطب الشعوري':         { icon: '💜', color: '#7C3AED' },
};

/* ══════════════════════════════════════════════════
   PUBLIC HELPERS
══════════════════════════════════════════════════ */

/** الحصول على أيقونة + لون خاص بكل خدمة */
export function getServiceIcon(href: string, label?: string): ServiceIconData {
    // 1. Try exact href match
    if (SERVICE_ICON_MAP[href]) return SERVICE_ICON_MAP[href];
    // 2. Try label fallback
    if (label && LABEL_ICON_MAP[label]) return LABEL_ICON_MAP[label];
    // 3. Generic fallback (should never hit in production)
    return { icon: '⚕️', color: '#0D9488' };
}
