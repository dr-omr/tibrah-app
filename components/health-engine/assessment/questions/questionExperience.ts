import type { AnswerValue, ClinicalQuestion } from '@/components/health-engine/types';

export type QuestionMode = 'core' | 'deep' | 'food';

export const SEVERITY_QUESTION_META = {
  whyWeAsk: 'الشدة تساعدنا نعرف أولوية التعامل، وهل نحتاج اختصار الأسئلة أو تعميقها.',
  impact: 'كلما ارتفعت الشدة، زادت أولوية المتابعة أو المراجعة.',
};

export const DURATION_QUESTION_META = {
  whyWeAsk: 'المدة تساعدنا نميّز بين عرض عابر ونمط يتكرر.',
  impact: 'إذا كانت الأعراض متكررة، سنقرأ النوم والغذاء والإيقاع بدقة أكبر.',
};

export function whyForSmartQuestion(q: ClinicalQuestion, mode: QuestionMode): string {
  if (mode === 'food') return 'نبحث إن كان الغذاء يغيّر شدة الأعراض أو توقيتها.';
  if (mode === 'deep') return 'هذا السؤال يرفع دقة الخريطة عندما تكون الأعراض ممتدة أو مؤثرة.';
  if (q.id.includes('progression')) return 'نحتاج معرفة الاتجاه: هل يتحسن النمط أم يزداد أم يتذبذب.';
  if (q.id.includes('trigger') || q.id.includes('pattern')) return 'المحفزات تكشف العلاقة بين العرض والنوم والغذاء والضغط.';
  if (q.id.includes('general_life_effect')) return 'الأثر على يومك يساعدنا نعرف إن كانت القراءة تحتاج متابعة أقرب.';
  return 'هذا يساعدنا نعرف المسار الأقرب دون القفز إلى استنتاج نهائي.';
}

export function impactForSmartQuestion(q: ClinicalQuestion, mode: QuestionMode, override?: string): string {
  if (override) return override;
  if (mode === 'food') return 'إذا ظهرت علاقة، ستدخل طبقة الغذاء والإيقاع في النتيجة.';
  if (mode === 'deep') return 'إجابتك هنا قد ترفع موثوقية القراءة أو توضّح ما نحتاج معرفته لاحقًا.';
  if (q.id.includes('progression')) return 'إذا كان النمط يزداد، سنجعل المتابعة أقرب وأوضح.';
  if (q.id.includes('trigger') || q.id.includes('pattern')) return 'إذا ظهر محفز محدد، سنربطه بخطوة عملية في النتيجة.';
  if (q.id.includes('general_life_effect')) return 'كلما زاد تأثير العرض على يومك، زادت أولوية المتابعة.';
  return 'إجابتك تغير وزن هذه الإشارة داخل خريطة الحالة.';
}

export function isUncertainAnswerValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(isUncertainAnswerValue);
  if (typeof value !== 'string') return false;
  return value === 'not_sure'
    || value === 'unknown'
    || value.includes('لا أعرف')
    || value.includes('لست متأكد')
    || value.includes('غير واضح');
}

export function countAnswered(value: AnswerValue | undefined): number {
  if (Array.isArray(value)) return value.length;
  return value ? 1 : 0;
}
