// components/settings/settings-data.ts
// ════════════════════════════════════════════════════════
// Types, constants, and configs for Settings page
// ════════════════════════════════════════════════════════

/* ─── Settings Shape ─────────────────────────── */
export interface SettingsState {
  notifications: Record<string, boolean>;
  units: { weight: string; temperature: string; bloodSugar: string; height: string };
  appearance: { theme: string; primaryColor: string };
}

export const DEFAULT_SETTINGS: SettingsState = {
  notifications: {
    appointments: true, medications: true, supplements: true,
    frequencies: true, water: true, dailyCheckIn: true, tips: true,
  },
  units: { weight: 'kg', temperature: 'celsius', bloodSugar: 'mg/dL', height: 'cm' },
  appearance: { theme: 'light', primaryColor: 'teal' },
};

/* ─── Notification Items ─────────────────────── */
export const NOTIFICATION_ITEMS = [
  { key: 'appointments', label: 'تذكيرات المواعيد', icon: '📅' },
  { key: 'medications', label: 'تذكيرات الأدوية', icon: '💊' },
  { key: 'supplements', label: 'تذكيرات المكملات', icon: '💉' },
  { key: 'frequencies', label: 'تذكيرات الترددات', icon: '🎵' },
  { key: 'water', label: 'تذكيرات شرب الماء', icon: '💧' },
  { key: 'dailyCheckIn', label: 'التسجيل اليومي', icon: '☀️' },
  { key: 'tips', label: 'نصائح صحية', icon: '💡' },
];

/* ─── Color Options ──────────────────────────── */
export const COLOR_OPTIONS = [
  { id: 'teal', name: 'أخضر مزرق', color: '#2D9B83' },
  { id: 'blue', name: 'أزرق', color: '#3B82F6' },
  { id: 'purple', name: 'بنفسجي', color: '#8B5CF6' },
  { id: 'rose', name: 'وردي', color: '#F43F5E' },
  { id: 'amber', name: 'ذهبي', color: '#F59E0B' },
];
