import type { AssessmentSession } from '@/lib/assessment-session-store';

export type ResultViewModel = NonNullable<AssessmentSession['resultViewModel']>;
export type TayyibatVerdict = NonNullable<ResultViewModel['tayyibatVerdict']>;

export const CONFIDENCE_LABEL_AR: Record<string, string> = {
  high: 'عالية',
  medium: 'متوسطة',
  low: 'محدودة',
};

export const DOMAIN_AR: Record<string, { label: string; icon: string; meaning: string }> = {
  jasadi: { label: 'جسدي', icon: 'ج', meaning: 'إشارات الجسد والأعراض المباشرة' },
  nafsi: { label: 'نفسي', icon: 'ن', meaning: 'الضغط، الكبت، والقلق المصاحب' },
  fikri: { label: 'فكري', icon: 'ف', meaning: 'الانتباه، الأفكار، ونمط المتابعة' },
  ruhi: { label: 'روحي', icon: 'ر', meaning: 'الإيقاع، السكينة، ومعنى العناية' },
};

// Status badge map — human-readable triage status
export const STATUS_BADGE: Record<string, { label: string; color: string; bg: string; meaning: string }> = {
  emergency:    { label: 'عاجل',            color: '#DC2626', bg: 'rgba(254,242,242,0.92)', meaning: 'توجد إشارات تجعل الرعاية الطبية الفورية أولى من أي خطة منزلية.' },
  urgent:       { label: 'عاجل',            color: '#DC2626', bg: 'rgba(254,242,242,0.92)', meaning: 'توجد إشارات تحتاج تقييماً طبياً سريعاً قبل بروتوكولات المنزل.' },
  needs_doctor: { label: 'يحتاج مراجعة',    color: '#D97706', bg: 'rgba(255,251,235,0.92)', meaning: 'الصورة تحتاج قراءة متخصصة خلال الأيام القادمة.' },
  review:       { label: 'يحتاج متابعة',    color: '#0E7490', bg: 'rgba(240,249,255,0.92)', meaning: 'الأعراض الحالية قابلة للمتابعة مع مراقبة التغيّر.' },
  manageable:   { label: 'مستقر مبدئياً',   color: '#059669', bg: 'rgba(240,253,244,0.92)', meaning: 'لا تظهر إشارات أولوية حالياً، وخطة المتابعة هي الأنسب الآن.' },
};

// One-line meaning per signal dimension
export const SIGNAL_MEANING: Record<string, string> = {
  'الشدة': 'تُحدد أولوية التعامل وسرعة المتابعة.',
  'المدة': 'تُميّز بين حدث عابر ونمط متكرر.',
  'المسار الأقرب': 'نقطة البدء في قراءة الأعراض.',
  'علامات الأولوية': 'تُغيّر ترتيب الإجراءات عند وجودها.',
  'الغذاء/النوم/الضغط': 'قد يؤثر على شدة الأعراض أو توقيتها.',
};

export interface SignalChip {
  label: string;
  value: string;
  meaning?: string;
  tone?: 'normal' | 'safe' | 'watch' | 'urgent';
}

// Build human summary sentence from triage level
export function buildHumanSummary(session: AssessmentSession): string {
  const vm = session.resultViewModel;
  const level = vm.hero.triageLevel;
  const pathway = vm.hero.pathwayLabel;
  const severity = vm.hero.severityDisplay;
  if (level === 'emergency' || level === 'urgent') {
    return 'توجد إشارات تجعل مراجعة الرعاية الطبية أولى من أي بروتوكول منزلي الآن.';
  }
  if (level === 'needs_doctor') {
    return `إجاباتك تشير إلى أعراض ${severity} في مسار "${pathway}" وتستحق مراجعة منظمة خلال الأيام القادمة.`;
  }
  if (level === 'review') {
    return `إجاباتك تشير إلى حالة مستقرة نسبياً مع أعراض ${severity} تحتاج متابعة هادئة خلال الأيام القادمة.`;
  }
  return `الصورة الأقرب هي ${pathway}: حالة مستقرة مبدئياً مع أعراض ${severity} وخطوة متابعة واضحة.`;
}

export interface LabSuggestion {
  name: string;
  why: string;
  priority: string;
  note: string;
}

export function buildSignalChips(session: AssessmentSession): SignalChip[] {
  const vm = session.resultViewModel;
  const answers = session.answers;
  const foodRelevant = Boolean(
    answers.adaptiveQuestionPlanSnapshot?.foodSignalFound ||
    answers.nutritionAnswers ||
    vm.tayyibatVerdict
  );
  const redFlagCount = answers.redFlags.length;

  return [
    { label: 'الشدة', value: vm.hero.severityDisplay },
    { label: 'المدة', value: vm.hero.durationDisplay },
    { label: 'المسار الأقرب', value: vm.hero.pathwayLabel },
    {
      label: 'علامات الأولوية',
      value: redFlagCount > 0 ? `${redFlagCount} محددة` : 'غير موجودة',
      tone: redFlagCount > 0 ? 'urgent' : 'safe',
    },
    { label: 'الغذاء/النوم/الضغط', value: foodRelevant ? 'مؤثر محتمل' : 'غير ظاهر بقوة' },
  ];
}

export function buildLabSuggestions(session: AssessmentSession): LabSuggestion[] {
  const pathway = session.answers.pathwayId;
  const urgent = session.resultViewModel.hero.triageLevel === 'emergency' || session.resultViewModel.hero.triageLevel === 'urgent';
  const common: LabSuggestion[] = urgent
    ? [{ name: 'تقييم طبي مباشر أولاً', why: 'وجود أولوية سلامة يجعل الفحص السريري قبل أي قائمة تحاليل.', priority: 'عاجل', note: 'الطبيب أو الطوارئ يحدد التحاليل المناسبة.' }]
    : [];

  const byPathway: Record<string, LabSuggestion[]> = {
    fatigue: [
      { name: 'CBC + Ferritin', why: 'الإرهاق قد يتأثر بفقر الدم أو مخزون الحديد.', priority: 'مناقشة قريبة', note: 'ناقشه مع طبيبك خصوصاً مع دوخة أو خفقان.' },
      { name: 'TSH + Vitamin D', why: 'الطاقة والنوم والمزاج قد تتأثر بالدرقية وفيتامين د.', priority: 'مناسب هذا الأسبوع', note: 'ليست تشخيصاً، بل نقاط تحقق محتملة.' },
    ],
    hormonal: [
      { name: 'TSH / Free T4', why: 'أعراض الغدد تحتاج قراءة مخبرية لا انطباعاً فقط.', priority: 'مهم', note: 'يفضل تفسيرها مع طبيب.' },
      { name: 'Ferritin + Vitamin D', why: 'تساقط الشعر والتعب وتغير المزاج قد تتداخل مع هذه المؤشرات.', priority: 'مساند', note: 'لا تبدأ مكملات عالية الجرعة بلا مراجعة.' },
    ],
    digestion: [
      { name: 'CBC أو فحص براز عند اللزوم', why: 'الأعراض الهضمية الممتدة تحتاج استبعاد الالتهاب أو النزف الخفي حسب القصة.', priority: 'حسب الأعراض', note: 'خصوصاً مع دم، نقص وزن، أو ألم شديد.' },
    ],
    pain: [
      { name: 'ESR / CRP + Vitamin D', why: 'الألم والتيبس قد يحتاجان تمييز التهاب من إجهاد أو نقص.', priority: 'مناقشة', note: 'قرار التحليل يعتمد على الفحص السريري.' },
    ],
    immune: [
      { name: 'CBC + CRP', why: 'تكرار العدوى أو الحمى يحتاج مؤشرات عامة للمناعة والالتهاب.', priority: 'مناسب', note: 'مع الحمى الشديدة تصبح الأولوية للفحص المباشر.' },
    ],
    anxiety: [
      { name: 'TSH + CBC عند الأعراض الجسدية', why: 'الخفقان والقلق قد يتشابهان مع الدرقية أو فقر الدم.', priority: 'اختياري حسب القصة', note: 'لا يعني أن القلق سببه عضوي دائماً.' },
    ],
  };

  return [...common, ...(byPathway[pathway] ?? [])].slice(0, 3);
}

export function isEducationalTayyibat(data: TayyibatVerdict): boolean {
  return data.isEducationalOnly === true || (data.primaryPattern === null && data.confidenceScore <= 20);
}
