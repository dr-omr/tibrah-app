import { CategoryDefinition, SessionCategory } from '@/types/therapeuticSessionTypes';

// ============================================================
// Category Definitions
// ============================================================

export const THERAPEUTIC_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'relaxation',
    label_ar: 'الاسترخاء',
    label_en: 'Relaxation',
    icon: '🌿',
    color_from: 'from-emerald-500',
    color_to: 'to-teal-600',
    description_ar: 'جلسات لتهدئة الجسم والعقل',
  },
  {
    id: 'sleep',
    label_ar: 'النوم',
    label_en: 'Sleep',
    icon: '🌙',
    color_from: 'from-indigo-500',
    color_to: 'to-blue-700',
    description_ar: 'التحضير للنوم العميق والمريح',
  },
  {
    id: 'focus',
    label_ar: 'التركيز',
    label_en: 'Focus',
    icon: '🎯',
    color_from: 'from-amber-500',
    color_to: 'to-orange-600',
    description_ar: 'تعزيز التركيز والوضوح الذهني',
  },
  {
    id: 'emotional_regulation',
    label_ar: 'التوازن العاطفي',
    label_en: 'Emotional Balance',
    icon: '💜',
    color_from: 'from-purple-500',
    color_to: 'to-violet-600',
    description_ar: 'دعم الهدوء العاطفي والتوازن النفسي',
  },
  {
    id: 'pain_coping',
    label_ar: 'إدارة الألم',
    label_en: 'Pain Coping',
    icon: '🩹',
    color_from: 'from-rose-500',
    color_to: 'to-pink-600',
    description_ar: 'دعم تخفيف الألم والراحة الجسدية',
  },
  {
    id: 'breathwork',
    label_ar: 'تمارين التنفس',
    label_en: 'Breathwork',
    icon: '🌬️',
    color_from: 'from-cyan-500',
    color_to: 'to-sky-600',
    description_ar: 'تنفس مُرشَد مع ترددات داعمة',
  },
  {
    id: 'meditation_depth',
    label_ar: 'التأمل العميق',
    label_en: 'Deep Meditation',
    icon: '🧘',
    color_from: 'from-violet-500',
    color_to: 'to-purple-700',
    description_ar: 'الوصول لحالات تأمل أعمق',
  },
  {
    id: 'binaural_entrainment',
    label_ar: 'موجات بينورال',
    label_en: 'Binaural Beats',
    icon: '🎧',
    color_from: 'from-blue-500',
    color_to: 'to-indigo-600',
    description_ar: 'ترددات ثنائية الأذن لتنظيم موجات الدماغ',
  },
  {
    id: 'monroe_inspired',
    label_ar: 'جلسات الحالات',
    label_en: 'State Sessions',
    icon: '✨',
    color_from: 'from-fuchsia-500',
    color_to: 'to-pink-700',
    description_ar: 'جلسات مُصممة للوصول لحالات وعي مختلفة',
  },
  {
    id: 'nature_soundscapes',
    label_ar: 'أصوات الطبيعة',
    label_en: 'Nature Soundscapes',
    icon: '🌊',
    color_from: 'from-teal-500',
    color_to: 'to-emerald-700',
    description_ar: 'مشاهد صوتية طبيعية مع ترددات علاجية',
  },
  {
    id: 'solfeggio_inspired',
    label_ar: 'سولفيجيو',
    label_en: 'Solfeggio-Inspired',
    icon: '🎵',
    color_from: 'from-yellow-500',
    color_to: 'to-amber-600',
    description_ar: 'ترددات مستوحاة من التراث الموسيقي القديم',
  },
  {
    id: 'chakra_traditional',
    label_ar: 'الشاكرات',
    label_en: 'Chakra / Traditional',
    icon: '🌈',
    color_from: 'from-orange-500',
    color_to: 'to-red-600',
    description_ar: 'ترددات مستوحاة من تقاليد الطاقة — تقليدي/استكشافي',
  },
  {
    id: 'rife_exploratory',
    label_ar: 'ترددات رايف',
    label_en: 'Rife (Exploratory)',
    icon: '🔬',
    color_from: 'from-pink-500',
    color_to: 'to-rose-700',
    description_ar: 'ترددات رايف التكميلية — استكشافي فقط',
  },
  {
    id: 'organ_support',
    label_ar: 'دعم الأعضاء',
    label_en: 'Organ Support',
    icon: '❤️',
    color_from: 'from-red-500',
    color_to: 'to-rose-600',
    description_ar: 'ترددات مقترحة لدعم أعضاء الجسم — استكشافي',
  },
  {
    id: 'guided_healing',
    label_ar: 'شفاء مُرشَد',
    label_en: 'Guided Healing',
    icon: '🕊️',
    color_from: 'from-sky-500',
    color_to: 'to-blue-600',
    description_ar: 'جلسات موجّهة مع ترددات داعمة',
  },
];

export function getCategoryById(id: SessionCategory): CategoryDefinition | undefined {
  return THERAPEUTIC_CATEGORIES.find(c => c.id === id);
}

export function getCategoryColor(id: SessionCategory): { from: string; to: string } {
  const cat = getCategoryById(id);
  return {
    from: cat?.color_from || 'from-slate-500',
    to: cat?.color_to || 'to-slate-600',
  };
}
