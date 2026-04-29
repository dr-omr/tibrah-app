// lib/brand-colors.ts
// ═══════════════════════════════════════════════════════
// TIBRAH — Single Source of Truth for Brand Colors
// استخدم هذه المتغيرات في كل ملفات TS/TSX
// بدلاً من hardcoding الألوان مباشرة
// ═══════════════════════════════════════════════════════

/** اللون الرئيسي للعلامة التجارية — Cyan #0891B2 */
export const BRAND = {
  /** Primary brand cyan */
  primary:    '#0891B2',
  /** Lighter variant */
  light:      '#22D3EE',
  /** Darker variant */
  dark:       '#0E7490',
  /** Darkest */
  darkest:    '#083D4F',
  /** Very light background tint */
  tint:       '#CFFAFE',
  /** Ultra-light surface */
  surface:    '#ECFEFF',

  // Semantic aliases
  teal:       '#0891B2',
  tealLight:  '#22D3EE',
  tealDark:   '#0E7490',

  // Text colors
  textOn:     '#FFFFFF',
  textPrimary: '#083D4F',
  textSub:    '#0E7490',

  // Gradients
  gradient:   'linear-gradient(135deg, #0891B2, #0E7490)',
  gradientSoft: 'linear-gradient(135deg, #0891B2, #22D3EE)',
  gradientFull: 'linear-gradient(135deg, #083D4F 0%, #0891B2 50%, #22D3EE 100%)',

  // Alpha variants for glass/overlay use
  alpha10:    'rgba(8,145,178,0.10)',
  alpha15:    'rgba(8,145,178,0.15)',
  alpha20:    'rgba(8,145,178,0.20)',
  alpha25:    'rgba(8,145,178,0.25)',
  alpha30:    'rgba(8,145,178,0.30)',
  alpha40:    'rgba(8,145,178,0.40)',
} as const;

/** Shorthand alias */
export const B = BRAND;
