/**
 * service-icons.ts — طِبرَا Unique Icon + Color Master Map
 * ──────────────────────────────────────────────────────────
 * كل خدمة في المنصة لها رمز فريد ولون طبي خاص ✦ لا تكرار ✦
 *
 * البنية:
 *   1. HREF_MAP  — href → { icon, color }
 *   2. LABEL_MAP — label fallback (عند تشارك الـ href)
 *
 * الألوان: مجموعة طبية منسجمة مع هوية طِبرَا Water-Glass
 */

export interface ServiceIconData {
    icon: string;
    color: string;
}

/* ══════════════════════════════════════════════════════════════
   HREF MAP
══════════════════════════════════════════════════════════════ */
const HREF_MAP: Record<string, ServiceIconData> = {

    /* ─────────────────────────────── جسدي: التشخيص ─── */
    '/symptom-checker':          { icon: '🩺', color: '#0D9488' }, // Tibrah Teal
    '/body-map':                 { icon: '🫁', color: '#0891B2' }, // Ocean Cyan
    '/intake':                   { icon: '📋', color: '#2563EB' }, // Royal Blue
    '/medical-history':          { icon: '🗂️', color: '#6D28D9' }, // Deep Indigo
    '/diagnosis/face-scan':      { icon: '📷', color: '#059669' }, // Emerald
    '/health-report':            { icon: '📊', color: '#0F766E' }, // Deep Teal
    '/quick-check-in':           { icon: '⚡', color: '#D97706' }, // Amber Flash

    /* ─────────────────────────────── جسدي: البرامج ─── */
    '/programs/movement':        { icon: '🏃', color: '#10B981' }, // Active Green
    '/programs/nutrition':       { icon: '🥗', color: '#16A34A' }, // Fresh Green
    '/programs/hydration':       { icon: '🍵', color: '#06B6D4' }, // Herb Cyan
    '/programs/sleep':           { icon: '🌙', color: '#4338CA' }, // Midnight Indigo
    '/meal-planner':             { icon: '🍽️', color: '#0D9488' }, // Teal Meal
    '/programs/detox':           { icon: '🧪', color: '#9333EA' }, // Detox Purple

    /* ─────────────────────────────── جسدي: الأدوات ─── */
    '/health-tracker':           { icon: '📈', color: '#06B6D4' }, // Sky Teal
    '/record-health':            { icon: '🩸', color: '#EF4444' }, // Vital Red
    '/daily-log':                { icon: '📓', color: '#8B5CF6' }, // Lavender Notes
    '/smart-pharmacy':           { icon: '💊', color: '#EC4899' }, // Pharma Pink

    /* ─────────────────────────────── جسدي: الكورسات ── */
    '/courses/reset-body':       { icon: '🔄', color: '#0D9488' }, // Reset Teal
    '/courses/sleep-energy':     { icon: '⚡', color: '#4338CA' }, // Energy Indigo
    '/courses/healing-nutrition':{ icon: '🌿', color: '#16A34A' }, // Healing Green
    '/courses/understand-symptoms': { icon: '🧬', color: '#0891B2' }, // Bio Cyan

    /* ─────────────────────────────── جسدي: المكتبة ─── */
    '/library?domain=jasadi':    { icon: '📖', color: '#0D9488' },
    '/library/movement':         { icon: '🏋️', color: '#10B981' },
    '/library/nutrition':        { icon: '🥦', color: '#16A34A' },
    '/library/symptoms':         { icon: '🔍', color: '#0891B2' },

    /* ─────────────────────────────── نفسي: التشخيص ─── */
    '/emotional-medicine':       { icon: '💜', color: '#7C3AED' }, // Soul Purple
    '/assess/anxiety':           { icon: '😰', color: '#6D28D9' }, // Anxiety Indigo
    '/assess/depression':        { icon: '🌧️', color: '#4338CA' }, // Deep Blue
    '/assess/burnout':           { icon: '🔥', color: '#DC2626' }, // Burnout Red
    '/assess/attachment':        { icon: '🔗', color: '#9333EA' }, // Bond Purple
    '/assess/personality':       { icon: '🪞', color: '#7C3AED' }, // Self-reflection
    '/assess/awareness':         { icon: '🌀', color: '#8B5CF6' }, // Awareness Violet
    '/assess/inner-balance':     { icon: '⚖️', color: '#2563EB' }, // Balance Blue
    '/assess/meaning':           { icon: '✨', color: '#818CF8' }, // Meaning Aura
    '/assess/presence':          { icon: '🎯', color: '#0EA5E9' }, // Focus Blue
    '/assess/disconnection':     { icon: '🌫️', color: '#6366F1' }, // Fog Indigo
    '/assess/beliefs':           { icon: '🧠', color: '#D97706' }, // Belief Amber
    '/assess/cognitive':         { icon: '🌀', color: '#EA580C' }, // Pattern Orange
    '/assess/procrastination':   { icon: '⏳', color: '#B45309' }, // Time Amber
    '/assess/identity':          { icon: '🪐', color: '#D97706' }, // Identity Gold
    '/assess/inner-speech':      { icon: '💭', color: '#F97316' }, // Thought Orange

    /* ─────────────────────────────── نفسي: المشاعر ─── */
    '/programs/emotions/fear':   { icon: '😨', color: '#6D28D9' }, // Fear
    '/programs/emotions/anger':  { icon: '🌋', color: '#DC2626' }, // Anger Red
    '/programs/emotions/grief':  { icon: '🌊', color: '#2563EB' }, // Grief Blue
    '/programs/emotions/guilt':  { icon: '🪢', color: '#7C3AED' }, // Guilt Purple
    '/programs/mind-body':       { icon: '🧩', color: '#9333EA' }, // Mind-Body Purple
    '/programs/relationships':   { icon: '💞', color: '#EC4899' }, // Relation Pink

    /* ─────────────────────────────── نفسي: الأدوات ─── */
    '/tools/journal':            { icon: '🖊️', color: '#8B5CF6' }, // Journal Violet
    '/tools/grounding':          { icon: '🌳', color: '#10B981' }, // Grounding Green
    '/tools/reframe':            { icon: '🔭', color: '#0EA5E9' }, // Reframe Blue
    '/family':                   { icon: '👨‍👩‍👧', color: '#F59E0B' }, // Family Amber
    '/meditation':               { icon: '🧘', color: '#0EA5E9' }, // Clarity Blue

    /* ─────────────────────────────── نفسي: الكورسات ── */
    '/courses/emotional-regulation':{ icon: '🎛️', color: '#7C3AED' },
    '/courses/detachment':          { icon: '🕊️', color: '#6D28D9' },
    '/courses/self-reset':          { icon: '♾️', color: '#9333EA' },
    '/courses/mind-body-course':    { icon: '🔮', color: '#8B5CF6' },
    '/courses/mature-relationships':{ icon: '💎', color: '#EC4899' },

    /* ─────────────────────────────── نفسي: المكتبة ─── */
    '/library?domain=nafsi':        { icon: '📖', color: '#7C3AED' },
    '/library/emotions':            { icon: '❤️', color: '#EC4899' },
    '/library/relationships':       { icon: '🤝', color: '#9333EA' },

    /* ─────────────────────────────── فكري: التشخيص ─── */
    '/programs/success-engineering':{ icon: '🏗️', color: '#D97706' }, // Build Gold
    '/programs/belief-reprogramming':{ icon: '🔑', color: '#EA580C' }, // Key Orange
    '/programs/word-power':          { icon: '✍️', color: '#F97316' }, // Word Orange
    '/programs/discipline':          { icon: '⚔️', color: '#B45309' }, // Discipline Amber

    /* ─────────────────────────────── فكري: الأدوات ─── */
    '/tools/weekly-plan':           { icon: '🗓️', color: '#D97706' }, // Calendar Gold
    '/rewards':                     { icon: '🏅', color: '#FBBF24' }, // Gold Medal
    '/tools/vision':                { icon: '🌅', color: '#F59E0B' }, // Vision Amber

    /* ─────────────────────────────── فكري: المكتبة ─── */
    '/library':                     { icon: '📚', color: '#B45309' }, // Deep Amber
    '/glass-library':               { icon: '🔭', color: '#0EA5E9' }, // Glass Explore
    '/library?domain=fikri':        { icon: '📓', color: '#D97706' },
    '/library/mindmaps':            { icon: '🗺️', color: '#F97316' },

    /* ─────────────────────────────── فكري: الكورسات ── */
    '/courses/mind-rebuild':         { icon: '🧪', color: '#D97706' },
    '/courses/kill-procrastination': { icon: '⚡', color: '#EA580C' },
    '/courses/limiting-beliefs':     { icon: '🔓', color: '#F97316' },
    '/courses/word-power-course':    { icon: '🎙️', color: '#B45309' },
    '/courses/discipline-success':   { icon: '🏆', color: '#FBBF24' },

    /* ─────────────────────────────── روحي: التقييم ─── */
    /* (already defined: /assess/inner-balance, /assess/meaning, etc.) */

    /* ─────────────────────────────── روحي: البرامج ─── */
    '/programs/frequencies':        { icon: '〰️', color: '#3B82F6' }, // Wave Blue
    '/programs/meditation':         { icon: '🧘', color: '#0EA5E9' }, // Clarity Blue
    '/programs/morning-ritual':     { icon: '🌄', color: '#818CF8' }, // Dawn Aura
    '/programs/meaning-journey':    { icon: '🗺️', color: '#6366F1' }, // Journey Indigo

    /* ─────────────────────────────── روحي: الأدوات ─── */
    '/frequencies':                 { icon: '🔊', color: '#3B82F6' }, // Wave Blue
    '/rife-frequencies':            { icon: '〰️', color: '#6366F1' }, // Indigo Wave
    '/radio':                       { icon: '🎵', color: '#8B5CF6' }, // Music Lavender
    '/breathe':                     { icon: '🌬️', color: '#34D399' }, // Breath Mint
    '/tools/gratitude':             { icon: '🙏', color: '#818CF8' }, // Gratitude Aura

    /* ─────────────────────────────── روحي: المكتبة ─── */
    '/library?domain=ruhi':         { icon: '✨', color: '#818CF8' },
    '/library/meaning':             { icon: '🌠', color: '#6366F1' },
    '/library/frequencies':         { icon: '📡', color: '#3B82F6' },

    /* ─────────────────────────────── روحي: الكورسات ── */
    '/courses/back-to-nature':      { icon: '🌿', color: '#2563EB' },
    '/courses/inner-peace':         { icon: '☮️', color: '#4F46E5' },
    '/courses/frequencies-course':  { icon: '🎶', color: '#818CF8' },
    '/courses/meaning-balance':     { icon: '⚖️', color: '#6366F1' },

    /* ─────────────────────────────── عام ──────────── */
    '/my-care':                     { icon: '🩹', color: '#10B981' },
    '/my-appointments':             { icon: '📅', color: '#3B82F6' },
    '/book-appointment':            { icon: '🗓️', color: '#0D9488' },
    '/medical-file':                { icon: '🗃️', color: '#475569' },
    '/shop':                        { icon: '🛒', color: '#0891B2' },
    '/premium':                     { icon: '👑', color: '#F59E0B' },
    '/services':                    { icon: '🔬', color: '#059669' },
    '/digital-services':            { icon: '💻', color: '#6366F1' },
    '/profile':                     { icon: '👤', color: '#64748B' },
    '/settings':                    { icon: '⚙️', color: '#7C3AED' },
    '/help':                        { icon: '💬', color: '#06B6D4' },
    '/privacy':                     { icon: '🔐', color: '#EF4444' },
    '/terms':                       { icon: '📜', color: '#78716C' },
    '/courses':                     { icon: '🎓', color: '#D97706' },
};

/* ══════════════════════════════════════════════════════════════
   LABEL FALLBACK — خدمات تشترك في نفس الـ href
══════════════════════════════════════════════════════════════ */
const LABEL_MAP: Record<string, ServiceIconData> = {
    'الطب الشعوري':              { icon: '💜', color: '#7C3AED' },
    'أدوات الشفاء العاطفي':      { icon: '💙', color: '#6366F1' },
    'تحرير المشاعر':              { icon: '🕊️', color: '#6D28D9' },
    'خرائط الوعي والأنماط':       { icon: '🌀', color: '#8B5CF6' },
    'تقييم الاتزان الداخلي':      { icon: '⚖️', color: '#2563EB' },
    'مسح الوجه الذكي':            { icon: '📷', color: '#059669' },
    'هندسة النجاح':               { icon: '🏗️', color: '#D97706' },
    'إعادة برمجة المعتقدات':       { icon: '🔑', color: '#EA580C' },
    'هندسة الفكر والكلمة':         { icon: '✍️', color: '#F97316' },
    'الصوت والترددات':             { icon: '〰️', color: '#3B82F6' },
    'برنامج التأمل التدريجي':       { icon: '🧘', color: '#0EA5E9' },
    'الطقوس اليومية':              { icon: '🌄', color: '#818CF8' },
};

/* ══════════════════════════════════════════════════════════════
   PUBLIC API
══════════════════════════════════════════════════════════════ */
export function getServiceIcon(href: string, label?: string): ServiceIconData {
    if (HREF_MAP[href])  return HREF_MAP[href];
    if (label && LABEL_MAP[label]) return LABEL_MAP[label];
    // Generic medical fallback — should never reach in production
    return { icon: '⚕️', color: '#0D9488' };
}
