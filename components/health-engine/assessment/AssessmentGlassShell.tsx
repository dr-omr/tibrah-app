'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Brain, ChevronDown, Sparkles } from 'lucide-react';
import type { StepId } from '../types';
import type { AssessmentDirectorState } from '@/lib/assessment/assessment-director';

const A = {
  bg: 'linear-gradient(158deg, #F8FDFF 0%, #E4FAF6 22%, #E8F1FF 48%, #F6FBFF 74%, #FFFFFF 100%)',
  ink: '#073B52',
  sub: '#0F6F8F',
  muted: '#639CAF',
  teal: '#0787A5',
  cyan: '#28C7E8',
  mint: '#20BFA9',
  violet: '#7C83FF',
  border: 'rgba(255,255,255,0.90)',
  font: 'var(--font-alexandria), Alexandria, "IBM Plex Sans Arabic", "Noto Kufi Arabic", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
} as const;

const STAGES: Record<StepId, { label: string; title: string; meaning: string }> = {
  welcome: {
    label: 'البداية',
    title: 'خلّينا نفهم حالتك خطوة خطوة',
    meaning: 'نبدأ بهدوء، ونسأل فقط ما يساعدنا نرتب الصورة.',
  },
  personalHistory: {
    label: 'عنّك',
    title: 'قبل الأعراض... نعرف عنك شوي',
    meaning: 'معلومات بسيطة تساعدنا نفهم الحالة بدون ما نثقل عليك.',
  },
  chiefComplaint: {
    label: 'الشكوى',
    title: 'إيش أكثر شيء يضايقك الآن؟',
    meaning: 'نبدأ من العرض الأساسي، وبعدها تتشكل الأسئلة حسب إجاباتك.',
  },
  hopi: {
    label: 'قصة العرض',
    title: 'خلّينا نفهم العرض أكثر',
    meaning: 'نسأل عن البداية والشدة والمدة وما يزيد أو يخفف.',
  },
  relatedSymptoms: {
    label: 'معه شيء؟',
    title: 'هل معه أعراض ثانية؟',
    meaning: 'الأعراض المرافقة تساعدنا نربط الصورة بدون افتراض تشخيص.',
  },
  redflags: {
    label: 'الأولوية',
    title: 'أسئلة سلامة قصيرة',
    meaning: 'نبدأ من الأمان حتى لا نتجاهل علامة تحتاج تعامل أسرع.',
  },
  lifestyle: {
    label: 'الروتين',
    title: 'أشياء ممكن تزيد الحالة',
    meaning: 'نقرأ النوم، الضغط، الأكل، الحركة والماء كعوامل قد تؤثر.',
  },
  pathway: {
    label: 'المسار',
    title: 'نحدد الباب الأقرب للحالة',
    meaning: 'هذا مسار مساعد، ويمكن أن يتغير مع إجاباتك.',
  },
  clinical: {
    label: 'التفاصيل',
    title: 'الشدة والمدة والنمط',
    meaning: 'نحوّل وصفك إلى إشارات واضحة تساعد النتيجة.',
  },
  emotional: {
    label: 'الضغط',
    title: 'هل في شيء يزيد الإحساس؟',
    meaning: 'هذا لا يعني أن الأعراض نفسية؛ فقط يساعدنا نفهم الصورة كاملة.',
  },
  nutrition: {
    label: 'الأكل',
    title: 'الأكل والنوم والروتين',
    meaning: 'الأكل طبقة فهم مساعدة، وليس التفسير الوحيد للحالة.',
  },
  review: {
    label: 'المراجعة',
    title: 'قبل أن نبني الملخص',
    meaning: 'نراجع ما جمعناه حتى تكون القراءة مبنية على إجاباتك.',
  },
  analyzing: {
    label: 'الربط',
    title: 'نربط الإجابات ونبني ملخص حالتك',
    meaning: 'نحوّل إشاراتك إلى قراءة أولية وخطوة عملية.',
  },
  result: {
    label: 'النتيجة',
    title: 'ملخص حالتك',
    meaning: 'ما فهمناه، لماذا ظهر، وما خطوتك الآن.',
  },
};

const ORDER: StepId[] = [
  'personalHistory',
  'chiefComplaint',
  'hopi',
  'redflags',
  'relatedSymptoms',
  'lifestyle',
  'emotional',
  'nutrition',
  'review',
  'analyzing',
  'result',
];

const SIGNAL_LAYERS = [
  { id: 'body', label: 'الجسم', steps: ['chiefComplaint', 'hopi', 'relatedSymptoms', 'clinical', 'analyzing', 'result'] },
  { id: 'safety', label: 'السلامة', steps: ['redflags', 'analyzing', 'result'] },
  { id: 'routine', label: 'الروتين', steps: ['lifestyle', 'nutrition', 'analyzing', 'result'] },
  { id: 'context', label: 'الضغط', steps: ['emotional', 'analyzing', 'result'] },
  { id: 'action', label: 'الخطوة', steps: ['review', 'result'] },
] as const;

function visibleOrder(nutritionShown: boolean, emotionalShown = true) {
  return ORDER.filter(step => {
    if (step === 'nutrition') return nutritionShown;
    if (step === 'emotional') return emotionalShown;
    return true;
  });
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onBack}
      className="flex min-h-[40px] items-center gap-1.5 rounded-full px-3 py-2"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.50))',
        border: '1px solid rgba(255,255,255,0.90)',
        backdropFilter: 'blur(20px) saturate(170%)',
        WebkitBackdropFilter: 'blur(20px) saturate(170%)',
        color: A.sub,
        fontSize: 11,
        fontWeight: 900,
        boxShadow: '0 10px 26px rgba(7,135,165,0.10), inset 0 1px 0 rgba(255,255,255,0.95)',
      }}
    >
      <ArrowRight style={{ width: 13, height: 13 }} />
      رجوع
    </motion.button>
  );
}

function ProgressRail({
  stepId,
  nutritionShown,
  emotionalShown,
  directorState,
}: {
  stepId: StepId;
  nutritionShown: boolean;
  emotionalShown: boolean;
  directorState?: AssessmentDirectorState;
}) {
  if (stepId === 'welcome') return null;

  const steps = visibleOrder(nutritionShown, emotionalShown);
  const index = Math.max(0, steps.indexOf(stepId));
  const current = index + 1;
  const percent = Math.round((current / steps.length) * 100);
  const fallback = STAGES[stepId];
  const title = directorState?.stageTitle || fallback.title;
  const label = directorState?.currentStage || fallback.label;

  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-2 pt-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded-full px-2 py-0.5" style={{ background: 'rgba(7,135,165,0.10)', color: A.teal, fontSize: 9.5, fontWeight: 950 }}>
            {label}
          </span>
          <p className="truncate" style={{ color: A.ink, fontSize: 12, fontWeight: 850 }}>
            {title}
          </p>
        </div>
        <span style={{ color: A.muted, fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}>{current}/{steps.length}</span>
      </div>

      <div className="flex items-center gap-1" aria-hidden>
        {steps.map((step, i) => (
          <div key={step} className="flex-1 overflow-hidden rounded-full" style={{ height: 3.5, background: 'rgba(7,135,165,0.10)' }}>
            <motion.div
              className="h-full rounded-full"
              animate={{ width: i <= index ? '100%' : '0%' }}
              transition={{ duration: 0.4, ease: [0.05, 0.7, 0.1, 1] }}
              style={{ background: i < index ? 'rgba(7,135,165,0.50)' : `linear-gradient(90deg, ${A.teal}, ${A.cyan}, ${A.mint})` }}
            />
          </div>
        ))}
      </div>
      <div className="sr-only" aria-live="polite">{percent}%</div>
    </motion.div>
  );
}

function SignalStrip({ stepId }: { stepId: StepId }) {
  if (stepId === 'welcome') return null;

  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-3">
      <div
        className="relative overflow-hidden rounded-[22px] px-3 py-2.5"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.66), rgba(255,255,255,0.42))',
          border: '1px solid rgba(255,255,255,0.78)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          boxShadow: '0 10px 28px rgba(7,135,165,0.07), inset 0 1px 0 rgba(255,255,255,0.88)',
        }}
      >
        <div className="relative z-10 flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <span className="shrink-0" style={{ color: A.teal, fontSize: 9.5, fontWeight: 950 }}>طبقات الفهم</span>
          {SIGNAL_LAYERS.map(layer => {
            const active = (layer.steps as readonly StepId[]).includes(stepId);
            return (
              <span
                key={layer.id}
                className="shrink-0 rounded-full px-2.5 py-1"
                style={{
                  background: active ? 'rgba(7,135,165,0.12)' : 'rgba(255,255,255,0.46)',
                  border: `1px solid ${active ? 'rgba(7,135,165,0.22)' : 'rgba(255,255,255,0.66)'}`,
                  color: active ? A.ink : A.muted,
                  fontSize: 10,
                  fontWeight: active ? 950 : 760,
                }}
              >
                {layer.label}
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export function AdaptiveBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4 }}
      className="mx-4 mb-2 flex items-center gap-2 rounded-[16px] px-3 py-2"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.70), rgba(228,250,246,0.46))',
        border: '1px solid rgba(255,255,255,0.80)',
        backdropFilter: 'blur(18px) saturate(160%)',
        WebkitBackdropFilter: 'blur(18px) saturate(160%)',
        boxShadow: '0 10px 26px rgba(7,135,165,0.07), inset 0 1px 0 rgba(255,255,255,0.88)',
      }}
    >
      <Brain style={{ width: 12, height: 12, color: A.teal, flexShrink: 0 }} />
      <p style={{ color: A.sub, fontSize: 10.5, fontWeight: 750, lineHeight: 1.55 }}>{message}</p>
    </motion.div>
  );
}

function DirectorReasonCard({ state }: { state?: AssessmentDirectorState }) {
  const [open, setOpen] = useState(false);
  if (!state) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mb-2">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="flex min-h-[40px] w-full items-center gap-2 rounded-[16px] px-3 py-2 text-right"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.68), rgba(255,255,255,0.42))',
          border: '1px solid rgba(255,255,255,0.78)',
          backdropFilter: 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: 'blur(18px) saturate(160%)',
          boxShadow: '0 10px 26px rgba(7,135,165,0.06), inset 0 1px 0 rgba(255,255,255,0.86)',
        }}
        aria-expanded={open}
      >
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown style={{ width: 14, height: 14, color: A.teal }} />
        </motion.span>
        <span style={{ color: A.teal, flex: 1, fontSize: 10.5, fontWeight: 950 }}>لماذا هذه المرحلة؟</span>
        <span className="truncate" style={{ color: A.muted, maxWidth: 150, fontSize: 9.5, fontWeight: 760 }}>
          {state.userProgressMeaning}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className="mt-1 rounded-[16px] p-3"
              style={{
                background: 'rgba(255,255,255,0.54)',
                border: '1px solid rgba(255,255,255,0.76)',
                backdropFilter: 'blur(18px) saturate(150%)',
                WebkitBackdropFilter: 'blur(18px) saturate(150%)',
              }}
            >
              <p style={{ color: A.sub, fontSize: 11, fontWeight: 720, lineHeight: 1.7 }}>{state.visibleReason}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface AssessmentGlassShellProps {
  children: ReactNode;
  stepId: StepId;
  nutritionShown?: boolean;
  emotionalShown?: boolean;
  onBack?: () => void;
  adaptiveMessage?: string | null;
  directorState?: AssessmentDirectorState;
}

export function AssessmentGlassShell({
  children,
  stepId,
  nutritionShown = false,
  emotionalShown = true,
  onBack,
  adaptiveMessage,
  directorState,
}: AssessmentGlassShellProps) {
  const showBack = stepId !== 'welcome' && stepId !== 'analyzing' && stepId !== 'result' && Boolean(onBack);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden" dir="rtl" style={{ background: A.bg, fontFamily: A.font }}>
      <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-x-0 top-0 h-[46vh]"
          style={{ background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(40,199,232,0.20), rgba(255,255,255,0.24) 45%, transparent 78%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.36, 0.66, 0.36] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -120, right: -90, width: 410, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(40,199,232,0.24), transparent 66%)', filter: 'blur(62px)' }}
        />
        <motion.div
          animate={{ y: [0, -12, 0], opacity: [0.28, 0.46, 0.28] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: 96, left: 30, width: 76, height: 76, borderRadius: 28, background: 'linear-gradient(145deg, rgba(255,255,255,0.62), rgba(32,191,169,0.20))', border: '1px solid rgba(255,255,255,0.62)', backdropFilter: 'blur(16px)' }}
        />
        <div style={{ position: 'absolute', bottom: 80, left: -70, width: 320, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,131,255,0.14), transparent 64%)', filter: 'blur(56px)' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -60, width: 260, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(32,191,169,0.12), transparent 66%)', filter: 'blur(50px)' }} />
      </div>

      <div className="relative z-20 flex items-center justify-between px-4" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}>
        <div style={{ minWidth: 76 }}>{showBack && <BackButton onBack={onBack!} />}</div>
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42))',
            border: '1px solid rgba(255,255,255,0.82)',
            backdropFilter: 'blur(20px) saturate(170%)',
            WebkitBackdropFilter: 'blur(20px) saturate(170%)',
            boxShadow: '0 10px 26px rgba(7,135,165,0.08), inset 0 1px 0 rgba(255,255,255,0.90)',
          }}
        >
          <Sparkles style={{ width: 11, height: 11, color: A.teal }} />
          <span style={{ color: A.teal, fontSize: 9.5, fontWeight: 950, letterSpacing: 0 }}>طِبرا · تقييم ذكي</span>
        </div>
        <div style={{ minWidth: 76 }} />
      </div>

      <div className="relative z-20">
        <ProgressRail stepId={stepId} nutritionShown={nutritionShown} emotionalShown={emotionalShown} directorState={directorState} />
        <SignalStrip stepId={stepId} />
        <DirectorReasonCard state={directorState} />
        <AnimatePresence>{adaptiveMessage && <AdaptiveBanner message={adaptiveMessage} />}</AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stepId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.05, 0.7, 0.1, 1] }}
          className="relative z-10 flex flex-1 flex-col"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
