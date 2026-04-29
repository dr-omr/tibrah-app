'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Compass,
  HeartPulse,
  Leaf,
  Lightbulb,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type {
  ResultStory,
  ResultStoryAction,
  ResultStoryNutritionState,
  ResultStorySignal,
  ResultStoryTimelineItem,
  ResultViewModel,
} from '@/components/health-engine/types';
import type { AssessmentSession } from '@/lib/assessment-session-store';
import type { DomainVisConfig } from '@/components/health-engine/result/shared/design-tokens';
import { haptic } from '@/lib/HapticFeedback';
import { ResultStorySpine } from './ResultStorySpine';

const ARABIC_FONT =
  'var(--font-alexandria), Alexandria, "IBM Plex Sans Arabic", "Noto Kufi Arabic", system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

const C = {
  ink: '#06364B',
  text: '#0A4960',
  sub: '#176C84',
  muted: '#6E9BAA',
  line: 'rgba(255,255,255,0.76)',
  glass: 'rgba(255,255,255,0.66)',
  glassStrong: 'rgba(255,255,255,0.84)',
  teal: '#0787A5',
  mint: '#10BFA5',
  cyan: '#24C6E8',
  violet: '#7C83FF',
  amber: '#D97706',
  red: '#DC2626',
  green: '#059669',
} as const;

type StoryProps = {
  story: ResultStory;
  vis: DomainVisConfig;
  on?: boolean;
};

type StoryChapterProps = StoryProps & {
  id: string;
  index: number;
  title: string;
  eyebrow: string;
  summary: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  details?: React.ReactNode;
  defaultOpen?: boolean;
  elevated?: boolean;
};

function actionHref(action?: ResultStoryAction, fallback = '/my-plan') {
  return action?.href || fallback;
}

function actionToneColor(tone?: ResultStoryAction['tone']) {
  if (tone === 'urgent') return C.red;
  if (tone === 'low_data' || tone === 'watch') return C.amber;
  if (tone === 'nutrition') return '#0D9488';
  return C.green;
}

function toneLabel(tone?: ResultStoryAction['tone']) {
  if (tone === 'urgent') return 'أولوية الآن';
  if (tone === 'low_data') return 'قراءة أولية';
  if (tone === 'watch') return 'تحتاج متابعة';
  if (tone === 'nutrition') return 'عامل مؤثر';
  return 'مستقرة مبدئيًا';
}

function compactSignals(signals: ResultStorySignal[], count = 3) {
  return signals.filter(signal => signal.value && signal.value !== 'غير واضح').slice(0, count);
}

function hasStrongNutritionSignal(nutrition?: ResultStoryNutritionState) {
  return Boolean(nutrition && nutrition.mode !== 'hidden' && nutrition.mode !== 'educational');
}

function reasoningStep(text: string, index: number) {
  const titles = [
    'بدأنا من الشكوى الأساسية',
    'قارنّا الشدة والمدة',
    'راجعنا علامات الأولوية',
    'أضفنا ما قد يزيد الحالة',
  ];
  return { title: titles[index] ?? `خطوة ${index + 1}`, body: text };
}

function buildFallbackStory(session: AssessmentSession): ResultStory {
  const vm = session.resultViewModel;
  const level = vm.refinedTriage?.level ?? vm.hero.triageLevel;
  const urgent = level === 'emergency' || level === 'urgent';
  const lowData = vm.confidenceExplanation?.label === 'low' || vm.confidenceExplanation?.isPreliminary;
  const primaryAction: ResultStoryAction = urgent
    ? {
        label: 'اطلب رعاية طبية',
        href: '/book-appointment',
        reason: 'لأن الأولوية الآن ليست خطة منزلية.',
        tone: 'urgent',
      }
    : lowData
      ? {
          label: 'أكمل البيانات',
          href: '/symptom-checker',
          reason: 'القراءة تصبح أوضح بإضافة المعلومات الناقصة.',
          tone: 'low_data',
        }
      : {
          label: 'ابدأ خطوتك اليوم',
          href: '/my-plan',
          reason: 'أفضل نتيجة تبدأ بخطوة واحدة قابلة للتطبيق.',
          tone: 'stable',
        };

  return {
    primaryStorySentence:
      vm.hero.integrativeInsight ||
      `أكثر شيء واضح من إجاباتك أن الحالة تميل إلى ${vm.hero.pathwayLabel} وتحتاج خطوة متابعة واضحة.`,
    statusQuestionAnswer: urgent
      ? 'الأولوية الآن أن يتم تقييم الحالة طبيًا قبل أي خطة منزلية.'
      : 'الحالة تحتاج متابعة هادئة حسب الشدة والمدة والإشارات المتاحة.',
    immediateWhy:
      vm.clinicalExplanation.body ||
      'رتبنا الشدة والمدة والإشارات الأساسية كقراءة أولية، وليست تشخيصًا نهائيًا.',
    primaryAction,
    chiefComplaintStory: vm.assessmentHandoff?.chiefComplaintLabel
      ? `بدأنا من: ${vm.assessmentHandoff.chiefComplaintLabel}.`
      : undefined,
    hopiTimeline: (vm.assessmentHandoff?.hopiSummary ?? []).map((item, index) => ({
      label: index === 0 ? 'قصة العرض' : `تفصيل ${index + 1}`,
      value: item,
      meaning: 'هذه من الإجابات التي بنينا عليها القراءة.',
    })),
    topSignals: [
      {
        label: 'البداية',
        value: vm.hero.pathwayLabel,
        meaning: 'هذا هو الباب الأول لفهم الحالة.',
        source: 'domain',
      },
      {
        label: 'الشدة',
        value: vm.hero.severityDisplay,
        meaning: 'الشدة تساعدنا نرتب الأولوية.',
        source: 'hopi',
      },
      {
        label: 'المدة',
        value: vm.hero.durationDisplay,
        meaning: 'المدة توضح هل الأمر عابر أو متكرر.',
        source: 'hopi',
      },
    ],
    reasoningNarrative: [
      'بدأنا من إجاباتك الأساسية، ثم قارنا الشدة والمدة.',
      urgent ? 'وجود علامة أولوية جعل الأمان يظهر أولًا.' : 'لم تظهر علامة أولوية واضحة في البيانات المتاحة.',
    ],
    clarityNarrative: {
      label: vm.confidenceExplanation?.label === 'high' ? 'واضحة' : vm.confidenceExplanation?.label === 'low' ? 'أولية' : 'متوسطة',
      sentence:
        vm.confidenceExplanation?.userNote ||
        'القراءة مفيدة، لكنها تتحسن كلما أضفت تفاصيل أكثر.',
      missing: vm.whatWeDoNotKnowYet ?? vm.confidenceExplanation?.missingData ?? [],
      improveAction: lowData
        ? {
            label: 'أكمل البيانات',
            href: '/symptom-checker',
            reason: 'إضافة البيانات الناقصة ترفع وضوح القراءة.',
            tone: 'low_data',
          }
        : undefined,
    },
    influencingFactors: [],
    nutritionStoryState: undefined,
    todayPlan: vm.todayAction.body,
    weekPlan: vm.monitoring.items ?? [],
    seekCareIf: [vm.seekCare.body],
    reassessment: vm.planHandoff?.reassessmentCondition || 'أعد التقييم إذا تغيرت الأعراض أو زادت.',
    deepDetails: {
      labs: [],
      tools: vm.recommendationGroups,
      domainCompass: vm.domainCompass,
      medicalHistory: vm.medicalHistoryVerdict,
    },
  };
}

export function getResultStory(session: AssessmentSession): ResultStory {
  return session.resultViewModel.resultStory ?? buildFallbackStory(session);
}

function GlassSurface({
  color,
  children,
  className = '',
  strong = false,
}: {
  color: string;
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: strong
          ? 'linear-gradient(155deg, rgba(255,255,255,0.94), rgba(255,255,255,0.74) 42%, rgba(238,252,255,0.54))'
          : 'linear-gradient(150deg, rgba(255,255,255,0.82), rgba(255,255,255,0.58) 46%, rgba(232,250,255,0.40))',
        border: '1px solid rgba(255,255,255,0.88)',
        backdropFilter: 'blur(34px) saturate(178%)',
        WebkitBackdropFilter: 'blur(34px) saturate(178%)',
        boxShadow: `0 24px 72px ${color}18, 0 10px 32px rgba(6,54,75,0.08), inset 0 1px 0 rgba(255,255,255,0.96), inset 0 -18px 42px ${color}08`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.84), rgba(255,255,255,0.12), transparent)' }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 82% 36% at 18% 0%, ${color}18, transparent 68%)` }}
      />
      <div
        className="pointer-events-none absolute left-[15%] right-[15%] top-0 h-[3px] rounded-b-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color}9A, transparent)` }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function ClinicalOrb({ color, tone }: { color: string; tone: ResultStoryAction['tone'] }) {
  return (
    <div className="relative mx-auto mb-4 flex h-[88px] w-[88px] items-center justify-center">
      <motion.div
        animate={{ scale: [0.96, 1.1, 0.96], opacity: [0.38, 0.65, 0.38] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}32, transparent 68%)`, filter: 'blur(12px)' }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-2 rounded-full"
        style={{
          background: `conic-gradient(from 35deg, transparent, ${color}50, rgba(255,255,255,0.90), transparent, ${color}22, transparent)`,
          WebkitMask: 'radial-gradient(circle, transparent 56%, #000 58%)',
          mask: 'radial-gradient(circle, transparent 56%, #000 58%)',
        }}
      />
      <div
        className="relative flex h-[68px] w-[68px] flex-col items-center justify-center rounded-full text-center"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(255,255,255,0.64) 48%, rgba(220,248,255,0.38))',
          border: '1.5px solid rgba(255,255,255,0.96)',
          boxShadow: `0 16px 40px ${color}1E, inset 0 2px 0 rgba(255,255,255,0.98)`,
        }}
      >
        <HeartPulse style={{ width: 20, height: 20, color }} />
        <span style={{ color: C.ink, fontSize: 9.5, fontWeight: 950, lineHeight: 1.3, marginTop: 5 }}>
          {toneLabel(tone)}
        </span>
      </div>
    </div>
  );
}

function SignalPill({ signal, color, index }: { signal: ResultStorySignal; color: string; index: number }) {
  return (
    <div
      className="rounded-[24px] p-3.5"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.70), rgba(255,255,255,0.48))',
        border: '1px solid rgba(255,255,255,0.78)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.86)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[16px]"
          style={{ background: `${color}12`, border: `1px solid ${color}22`, color, fontSize: 13, fontWeight: 950 }}
        >
          {index + 1}
        </div>
        <div className="min-w-0">
          <p style={{ color: C.muted, fontSize: 10.5, fontWeight: 900 }}>{signal.label}</p>
          <p style={{ color: C.ink, fontSize: 14.5, fontWeight: 950, lineHeight: 1.35, marginTop: 2 }}>{signal.value}</p>
          <p style={{ color: C.sub, fontSize: 11.5, fontWeight: 650, lineHeight: 1.65, marginTop: 4 }}>{signal.meaning}</p>
        </div>
      </div>
    </div>
  );
}

function ChapterRail({ index, color }: { index: number; color: string }) {
  return (
    <div className="absolute right-0 top-0 flex h-full w-9 justify-center">
      {/* Vertical line */}
      <div
        className="absolute bottom-0 top-0 w-px"
        style={{
          background: `linear-gradient(180deg, ${color}50, rgba(255,255,255,0.55), ${color}18)`,
        }}
      />
      {/* Chapter number bubble */}
      <div
        className="relative z-10 mt-[18px] flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(255,255,255,0.78))',
          border: `1.5px solid ${color}30`,
          boxShadow: `0 8px 24px ${color}22, inset 0 1.5px 0 rgba(255,255,255,0.98)`,
          color,
          fontSize: 11.5,
          fontWeight: 950,
        }}
      >
        {index}
      </div>
    </div>
  );
}

export function ResultStoryShell({ vis, children }: StoryProps & { children: React.ReactNode }) {
  return (
    <main
      dir="rtl"
      className="relative overflow-x-hidden"
      style={{
        fontFamily: ARABIC_FONT,
        minHeight: '100svh',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 220px)',
        paddingLeft: 14,
        paddingRight: 14,
        willChange: 'auto',
      }}
    >
      {/* Aquatic background — fixed, layered */}
      <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)',
          }}
        />
        {/* Domain colour orb — top right */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.30, 0.58, 0.30] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-28 -top-28 rounded-full"
          style={{
            width: 420,
            height: 420,
            background: `radial-gradient(circle at 35% 30%, ${vis.particleColor}32, transparent 68%)`,
            filter: 'blur(60px)',
          }}
        />
        {/* Violet orb — bottom left */}
        <motion.div
          animate={{ y: [0, -18, 0], opacity: [0.20, 0.42, 0.20] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-24 -left-20 rounded-full"
          style={{
            width: 380,
            height: 380,
            background: 'radial-gradient(circle, rgba(129,140,248,0.20), transparent 68%)',
            filter: 'blur(56px)',
          }}
        />
        {/* Teal mid-accent */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 55% 42% at 72% 6%, ${vis.particleColor}1E, transparent 62%)`,
          }}
        />
        {/* Caustic shimmer */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'linear-gradient(115deg, rgba(255,255,255,0.30) 0 1px, transparent 1px 13px), linear-gradient(25deg, rgba(255,255,255,0.22) 0 1px, transparent 1px 16px)',
            backgroundSize: '44px 44px, 58px 58px',
          }}
        />
        {/* Top light sheen */}
        <div
          className="absolute inset-x-0 top-0 h-44"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.40), transparent)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[620px]">{children}</div>
    </main>
  );
}

export function ResultOpeningScene({ story, vis, on = true }: StoryProps) {
  const color = actionToneColor(story.primaryAction.tone) || vis.particleColor;
  const signals = compactSignals(story.topSignals, 3);

  return (
    <motion.section
      id="story-1"
      dir="rtl"
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      animate={on ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 210, damping: 28 }}
      className="mb-6"
      style={{ fontFamily: ARABIC_FONT }}
    >
      <GlassSurface color={color} className="rounded-[32px] p-4 sm:p-6" strong>
        {/* Header badges */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
            style={{ background: `${color}14`, border: `1.5px solid ${color}28`, color }}
          >
            <HeartPulse style={{ width: 14, height: 14 }} />
            <span style={{ fontSize: 12.5, fontWeight: 950, fontFamily: ARABIC_FONT }}>ملخص حالتك</span>
          </div>
          <div
            className="inline-flex rounded-full px-3 py-1.5"
            style={{ background: 'rgba(255,255,255,0.68)', border: '1px solid rgba(255,255,255,0.82)', color: C.sub, fontSize: 11.5, fontWeight: 850, fontFamily: ARABIC_FONT }}
          >
            قراءة هادئة
          </div>
        </div>

        <ClinicalOrb color={color} tone={story.primaryAction.tone} />

        {/* Case status answer */}
        <div
          className="mb-5 rounded-[24px] p-4"
          style={{ background: 'rgba(255,255,255,0.58)', border: '1px solid rgba(255,255,255,0.78)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.86)' }}
        >
          <p style={{ color: C.muted, fontSize: 10.5, fontWeight: 950, letterSpacing: '0.05em', marginBottom: 6, fontFamily: ARABIC_FONT }}>هل حالتي مستقرة؟</p>
          <p style={{ color: C.ink, fontSize: 14, lineHeight: 1.8, fontWeight: 780, fontFamily: ARABIC_FONT }}>{story.statusQuestionAnswer}</p>
        </div>

        {/* Primary story sentence — FIXED SIZE */}
        <h1
          style={{
            color: C.ink,
            fontSize: 17,
            lineHeight: 1.75,
            fontWeight: 900,
            fontFamily: ARABIC_FONT,
            marginBottom: 16,
          }}
        >
          {story.primaryStorySentence}
        </h1>

        {/* Top signals */}
        {signals.length > 0 && (
          <div className="grid grid-cols-1 gap-2.5 mb-5">
            {signals.map((signal, index) => (
              <SignalPill key={`${signal.label}-${index}`} signal={signal} color={color} index={index} />
            ))}
          </div>
        )}

        {/* Why this reading */}
        <div
          className="rounded-[25px] p-4 mb-5"
          style={{ background: `${vis.particleColor}0E`, border: `1px solid ${vis.particleColor}1C`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.58)' }}
        >
          <p style={{ color: vis.textColor, fontSize: 10.5, fontWeight: 950, marginBottom: 7, fontFamily: ARABIC_FONT }}>لماذا ظهرت هذه القراءة؟</p>
          <p style={{ color: C.ink, fontSize: 14, lineHeight: 1.88, fontWeight: 760, fontFamily: ARABIC_FONT }}>{story.immediateWhy}</p>
        </div>

        {/* Primary CTA */}
        <p style={{ color: C.muted, fontSize: 10, fontWeight: 900, letterSpacing: '0.06em', marginBottom: 9, fontFamily: ARABIC_FONT }}>أول خطوة الآن</p>
        <Link href={actionHref(story.primaryAction)} onClick={() => haptic.impact()} className="block">
          <motion.div
            whileTap={{ scale: 0.97, y: 1 }}
            className="flex min-h-[62px] items-center justify-between rounded-[24px] px-4 py-3.5"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}D4)`,
              color: '#fff',
              boxShadow: `0 20px 48px ${color}30, inset 0 1.5px 0 rgba(255,255,255,0.30)`,
            }}
          >
            <div className="min-w-0 flex-1">
              <p style={{ fontSize: 15.5, fontWeight: 950, fontFamily: ARABIC_FONT }}>{story.primaryAction.label}</p>
              <p className="line-clamp-2" style={{ marginTop: 4, fontSize: 11.5, opacity: 0.88, fontWeight: 650, lineHeight: 1.55, fontFamily: ARABIC_FONT }}>
                {story.primaryAction.reason}
              </p>
            </div>
            <div
              className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.20)' }}
            >
              <ArrowLeft style={{ width: 19, height: 19 }} />
            </div>
          </motion.div>
        </Link>
      </GlassSurface>
    </motion.section>
  );
}

export function StoryChapter({
  id,
  index,
  title,
  eyebrow,
  summary,
  icon,
  vis,
  children,
  details,
  defaultOpen = true,
  elevated = false,
  on = true,
}: StoryChapterProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={on ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.04 * index, type: 'spring', stiffness: 200, damping: 26 }}
      className="relative mb-4 pr-10 sm:mb-5 sm:pr-11"
    >
      <ChapterRail index={index} color={vis.particleColor} />
      <GlassSurface
        color={vis.particleColor}
        className={`rounded-[32px] p-3 ${elevated ? 'shadow-xl' : ''}`}
      >
        {/* Chapter header — full touch area */}
        <button
          type="button"
          onClick={() => { haptic.tap(); setOpen(v => !v); }}
          className="flex min-h-[76px] w-full items-center gap-3 rounded-[26px] px-2 py-1 text-right"
          style={{ touchAction: 'manipulation' }}
          aria-expanded={open}
          aria-controls={`${id}-content`}
        >
          {/* Icon bubble */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[21px]"
            style={{
              background: `linear-gradient(145deg, rgba(255,255,255,0.90), ${vis.particleColor}18)`,
              border: `1.5px solid ${vis.particleColor}28`,
              color: vis.particleColor,
              boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.82), 0 8px 22px ${vis.particleColor}14`,
            }}
          >
            {icon}
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span
                className="rounded-full px-2.5 py-0.5"
                style={{
                  background: `${vis.particleColor}0E`,
                  color: vis.textColor,
                  fontSize: 10,
                  fontWeight: 950,
                  fontFamily: ARABIC_FONT,
                }}
              >
                {eyebrow}
              </span>
            </div>
            <h2
              style={{
                color: C.ink,
                fontSize: 19,
                fontWeight: 950,
                lineHeight: 1.35,
                fontFamily: ARABIC_FONT,
              }}
            >
              {title}
            </h2>
            <p
              style={{
                marginTop: 3,
                color: C.sub,
                fontSize: 12.5,
                lineHeight: 1.65,
                fontWeight: 650,
                fontFamily: ARABIC_FONT,
              }}
            >
              {summary}
            </p>
          </div>

          {/* Chevron */}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `${vis.particleColor}0E`,
              color: vis.particleColor,
              border: `1px solid ${vis.particleColor}1C`,
            }}
          >
            <ChevronDown style={{ width: 17, height: 17 }} />
          </motion.span>
        </button>

        {/* Chapter body */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={`${id}-content`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-1 pb-2 pt-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details toggle */}
        {open && details && (
          <div className="mt-2 px-1">
            <button
              type="button"
              onClick={() => { haptic.tap(); setDetailsOpen(v => !v); }}
              className="flex min-h-[46px] w-full items-center justify-between rounded-[18px] px-3.5 py-2.5"
              style={{
                background: `${vis.particleColor}08`,
                border: `1px solid ${vis.particleColor}14`,
                color: C.sub,
                touchAction: 'manipulation',
              }}
              aria-expanded={detailsOpen}
            >
              <span style={{ fontSize: 12, fontWeight: 900, fontFamily: ARABIC_FONT }}>
                {detailsOpen ? 'إخفاء التفاصيل' : 'افتح التفاصيل'}
              </span>
              <motion.span
                animate={{ rotate: detailsOpen ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <ChevronDown style={{ width: 15, height: 15 }} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {detailsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 pb-1">{details}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </GlassSurface>
    </motion.section>
  );
}

function Timeline({ items }: { items: ResultStoryTimelineItem[] }) {
  if (items.length === 0) {
    return (
      <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.8 }}>
        لم تسجل تفاصيل كافية عن بداية العرض، ويمكن إضافتها لاحقًا.
      </p>
    );
  }

  return (
    <div className="relative grid gap-3">
      <div className="absolute bottom-5 right-[21px] top-5 w-px" style={{ background: `linear-gradient(180deg, ${C.teal}44, ${C.teal}10)` }} />
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="relative rounded-[24px] p-4 pr-14"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.68), rgba(255,255,255,0.46))',
            border: '1px solid rgba(255,255,255,0.78)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.82)',
          }}
        >
          <span
            className="absolute right-2.5 top-4 flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              background: 'rgba(255,255,255,0.94)',
              border: `1px solid ${C.teal}20`,
              color: C.teal,
              fontSize: 11,
              fontWeight: 950,
              boxShadow: `0 8px 20px ${C.teal}18`,
            }}
          >
            {index + 1}
          </span>
          <p style={{ color: C.muted, fontSize: 11, fontWeight: 900 }}>{item.label}</p>
          <p style={{ color: C.ink, fontSize: 15, fontWeight: 950, lineHeight: 1.45, marginTop: 2 }}>{item.value}</p>
          <p style={{ color: C.sub, fontSize: 11.5, lineHeight: 1.7, marginTop: 5 }}>{item.meaning}</p>
        </div>
      ))}
    </div>
  );
}

export function UserAnswerStory({ story, vis, on }: StoryProps) {
  const hopiSignals = story.topSignals.filter(signal => signal.source === 'chief_complaint' || signal.source === 'hopi' || signal.source === 'related_symptoms');
  const visibleTimeline = story.hopiTimeline.slice(0, 5);
  const extraTimeline = story.hopiTimeline.slice(5);

  return (
    <StoryChapter
      id="story-2"
      index={2}
      title="ماذا قلت لنا؟"
      eyebrow="قصة العرض"
      summary="هذه هي القصة التي بنينا عليها القراءة."
      icon={<BookOpen style={{ width: 20, height: 20 }} />}
      vis={vis}
      story={story}
      on={on}
      elevated
      details={(hopiSignals.length > 0 || extraTimeline.length > 0) && (
        <div className="grid gap-2">
          {extraTimeline.length > 0 && <Timeline items={extraTimeline} />}
          {hopiSignals.map((signal, index) => (
            <div key={`${signal.label}-${index}`} className="rounded-[18px] p-3" style={{ background: 'rgba(255,255,255,0.48)', border: '1px solid rgba(255,255,255,0.68)' }}>
              <p style={{ color: C.muted, fontSize: 10.5, fontWeight: 850 }}>{signal.label}</p>
              <p style={{ color: C.ink, fontSize: 13, fontWeight: 900, marginTop: 2 }}>{signal.value}</p>
              <p style={{ color: C.sub, fontSize: 11, lineHeight: 1.6, marginTop: 4 }}>{signal.meaning}</p>
            </div>
          ))}
        </div>
      )}
    >
      {story.chiefComplaintStory && (
        <p
          className="mb-4 rounded-[22px] p-4"
          style={{ background: `${vis.particleColor}0D`, border: `1px solid ${vis.particleColor}18`, color: C.ink, fontSize: 14, lineHeight: 1.85, fontWeight: 760 }}
        >
          {story.chiefComplaintStory}
        </p>
      )}
      <Timeline items={visibleTimeline} />
    </StoryChapter>
  );
}

export function ReasoningChapter({ story, vis, on }: StoryProps) {
  return (
    <StoryChapter
      id="story-3"
      index={3}
      title="كيف ربطنا الإشارات؟"
      eyebrow="لماذا"
      summary="نشرح ما جعل القراءة تظهر بهذا الشكل، بدون تشخيص حتمي أو تهويل."
      icon={<Lightbulb style={{ width: 20, height: 20 }} />}
      vis={vis}
      story={story}
      on={on}
      elevated
    >
      <div className="grid gap-3">
        {story.reasoningNarrative.slice(0, 4).map((item, index) => {
          const step = reasoningStep(item, index);
          return (
            <div key={`${item}-${index}`} className="flex gap-3 rounded-[22px] p-3.5" style={{ background: 'rgba(255,255,255,0.52)', border: '1px solid rgba(255,255,255,0.72)' }}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: `${vis.particleColor}12`, color: vis.particleColor, fontSize: 11, fontWeight: 950 }}>
                {index + 1}
              </span>
              <div>
                <p style={{ color: C.ink, fontSize: 13.5, lineHeight: 1.5, fontWeight: 950 }}>{step.title}</p>
                <p style={{ color: C.sub, fontSize: 12.2, lineHeight: 1.75, fontWeight: 680, marginTop: 3 }}>{step.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </StoryChapter>
  );
}

export function ClarityChapter({ story, vis, on }: StoryProps) {
  const missing = story.clarityNarrative.missing.slice(0, 6);

  return (
    <StoryChapter
      id="story-4"
      index={4}
      title="قد إيش النتيجة واضحة؟"
      eyebrow="وضوح القراءة"
      summary="نشرح قوة القراءة بلغة بسيطة، وليس كنسبة باردة."
      icon={<ShieldCheck style={{ width: 20, height: 20 }} />}
      vis={vis}
      story={story}
      on={on}
      defaultOpen
    >
      <div className="rounded-[24px] p-4" style={{ background: `${vis.particleColor}0D`, border: `1px solid ${vis.particleColor}18` }}>
        <div className="mb-2 inline-flex rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,0.62)', color: vis.textColor, fontSize: 11, fontWeight: 950 }}>
          {story.clarityNarrative.label}
        </div>
        <p style={{ color: C.ink, fontSize: 14, lineHeight: 1.85, fontWeight: 760 }}>{story.clarityNarrative.sentence}</p>
      </div>
      {missing.length > 0 && (
        <div className="mt-4">
          <p style={{ color: C.sub, fontSize: 12, lineHeight: 1.75, marginBottom: 10 }}>
            هذه ليست مشكلة في النتيجة؛ هذه نقاط لو أضفتها تصير القراءة أوضح.
          </p>
          <div className="flex flex-wrap gap-2">
            {missing.map((item, index) => (
              <span key={`${item}-${index}`} className="rounded-full px-3 py-1.5" style={{ background: '#F59E0B10', border: '1px solid #F59E0B22', color: '#92400E', fontSize: 11, fontWeight: 850 }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </StoryChapter>
  );
}

export function NutritionStoryChapter({ nutrition, vis }: { nutrition?: ResultStoryNutritionState; vis: DomainVisConfig }) {
  if (!nutrition || nutrition.mode === 'hidden') return null;
  const color = nutrition.mode === 'suppressed' ? C.amber : '#0D9488';

  return (
    <div className="mt-4 rounded-[24px] p-4" style={{ background: `${color}0D`, border: `1px solid ${color}22` }}>
      <div className="mb-2 flex items-center gap-2">
        <Leaf style={{ width: 16, height: 16, color }} />
        <span className="rounded-full px-2.5 py-1" style={{ background: 'rgba(255,255,255,0.62)', color, fontSize: 11, fontWeight: 950 }}>
          {nutrition.title}
        </span>
      </div>
      <p style={{ color: C.ink, fontSize: 13.5, lineHeight: 1.85, fontWeight: 720 }}>{nutrition.sentence}</p>
      {nutrition.showScore && (
        <p style={{ marginTop: 8, color: C.sub, fontSize: 11.5, lineHeight: 1.7 }}>
          تظهر درجة المتابعة فقط عندما تكون بيانات الأكل كافية، وليست حكمًا على الالتزام.
        </p>
      )}
      {nutrition.ctas.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {nutrition.ctas.map(cta => (
            <Link key={cta.href} href={cta.href} className="min-h-[40px] rounded-full px-3 py-2" style={{ background: `${vis.particleColor}12`, border: `1px solid ${vis.particleColor}20`, color: vis.textColor, fontSize: 11, fontWeight: 850 }}>
              {cta.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function InfluencingFactorsChapter({ story, vis, on }: StoryProps) {
  const factors = story.influencingFactors.slice(0, 5);
  if (factors.length === 0 && (!story.nutritionStoryState || story.nutritionStoryState.mode === 'hidden')) return null;

  return (
    <StoryChapter
      id="story-5"
      index={5}
      title="أشياء ممكن تزيد الحالة"
      eyebrow="عوامل"
      summary="هذه عوامل قد ترفع أو تخفف الأعراض، وليست سببًا نهائيًا."
      icon={<Compass style={{ width: 20, height: 20 }} />}
      vis={vis}
      story={story}
      on={on}
      defaultOpen={factors.length >= 2 || hasStrongNutritionSignal(story.nutritionStoryState)}
    >
      {factors.length > 0 && (
        <div className="grid gap-2.5">
          {factors.map((factor, index) => (
            <div key={`${factor.label}-${index}`} className="rounded-[20px] p-3.5" style={{ background: 'rgba(255,255,255,0.52)', border: '1px solid rgba(255,255,255,0.72)' }}>
              <p style={{ color: C.muted, fontSize: 10.5, fontWeight: 850 }}>{factor.label}</p>
              <p style={{ color: C.ink, fontSize: 13.5, fontWeight: 900, marginTop: 2 }}>{factor.value}</p>
              <p style={{ color: C.sub, fontSize: 11.5, lineHeight: 1.7, marginTop: 4 }}>{factor.meaning}</p>
            </div>
          ))}
        </div>
      )}
      <NutritionStoryChapter nutrition={story.nutritionStoryState} vis={vis} />
    </StoryChapter>
  );
}

export function PlanChapter({ story, vis, on }: StoryProps) {
  const week = story.weekPlan.slice(0, 3);
  const color = actionToneColor(story.primaryAction.tone) || vis.particleColor;

  return (
    <StoryChapter
      id="story-6"
      index={6}
      title="خطوتك اليوم"
      eyebrow="القرار"
      summary="النتيجة لا تنتهي كمعلومة؛ تبدأ بخطوة واحدة قابلة للتطبيق."
      icon={<ListChecks style={{ width: 20, height: 20 }} />}
      vis={vis}
      story={story}
      on={on}
      elevated
      details={week.length > 0 && (
        <div className="grid gap-2.5">
          {week.map((item, index) => (
            <div key={`${item}-${index}`} className="flex gap-2 rounded-[18px] p-3" style={{ background: 'rgba(255,255,255,0.48)', border: '1px solid rgba(255,255,255,0.68)' }}>
              <CheckCircle2 style={{ width: 15, height: 15, color: C.green, marginTop: 2 }} />
              <p style={{ color: C.ink, fontSize: 12.5, lineHeight: 1.75, fontWeight: 700 }}>{item}</p>
            </div>
          ))}
        </div>
      )}
    >
      <div className="rounded-[24px] p-4" style={{ background: `${color}0D`, border: `1px solid ${color}22` }}>
        <p style={{ color: C.ink, fontSize: 15, lineHeight: 1.85, fontWeight: 850 }}>{story.todayPlan}</p>
        <p style={{ marginTop: 8, color: C.sub, fontSize: 12, lineHeight: 1.75 }}>{story.primaryAction.reason}</p>
      </div>
    </StoryChapter>
  );
}

export function FollowUpChapter({ story, vis, on }: StoryProps) {
  return (
    <StoryChapter
      id="story-7"
      index={7}
      title="متى تنتبه؟"
      eyebrow="متابعة"
      summary="نعطيك وقت إعادة التقييم، ومتى لا تنتظر."
      icon={<CalendarClock style={{ width: 20, height: 20 }} />}
      vis={vis}
      story={story}
      on={on}
      defaultOpen={false}
      details={
        <div className="grid gap-2.5">
          {story.seekCareIf.slice(0, 4).map((item, index) => (
            <div key={`${item}-${index}`} className="flex gap-2 rounded-[18px] p-3" style={{ background: '#DC26260A', border: '1px solid #DC26261C' }}>
              <AlertTriangle style={{ width: 15, height: 15, color: C.red, marginTop: 2 }} />
              <p style={{ color: C.ink, fontSize: 12.5, lineHeight: 1.75, fontWeight: 700 }}>{item}</p>
            </div>
          ))}
        </div>
      }
    >
      <div className="rounded-[22px] p-4" style={{ background: 'rgba(255,255,255,0.54)', border: '1px solid rgba(255,255,255,0.72)' }}>
        <p style={{ color: C.ink, fontSize: 14, lineHeight: 1.85, fontWeight: 800 }}>{story.reassessment}</p>
      </div>
    </StoryChapter>
  );
}

function DomainCompassMini({ vm }: { vm: ResultViewModel }) {
  const compass = vm.resultStory?.deepDetails.domainCompass ?? vm.domainCompass;
  const entries = Object.entries(compass.domainScores ?? {}).sort((a, b) => Number(b[1]) - Number(a[1]));
  const names: Record<string, string> = { jasadi: 'جسدي', nafsi: 'نفسي', fikri: 'فكري', ruhi: 'روحي' };

  return (
    <div className="grid gap-2">
      {entries.map(([domain, score]) => (
        <div key={domain} className="rounded-[18px] p-3" style={{ background: 'rgba(255,255,255,0.48)', border: '1px solid rgba(255,255,255,0.68)' }}>
          <div className="mb-2 flex items-center justify-between">
            <span style={{ color: C.ink, fontSize: 12, fontWeight: 900 }}>{names[domain] ?? domain}</span>
            <span style={{ color: C.sub, fontSize: 11, fontWeight: 850 }}>{Math.round(Number(score))}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: `${C.teal}10` }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, Number(score)))}%`, background: C.teal }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DeepDetailsDrawer({ story, vm, vis, on = true }: StoryProps & { vm: ResultViewModel }) {
  const [open, setOpen] = useState(false);
  const labs = story.deepDetails.labs ?? [];
  const tools = story.deepDetails.tools ?? [];
  const totalTools = tools.reduce((sum, group) => sum + group.recommendations.length, 0);

  return (
    <section className="relative mb-6 pr-9 sm:pr-10" style={{ fontFamily: ARABIC_FONT }}>
      <ChapterRail index={8} color={vis.particleColor} />
      <GlassSurface color={vis.particleColor} className="rounded-[32px] p-3">
        <button
          type="button"
          onClick={() => {
            haptic.tap();
            setOpen(value => !value);
          }}
          className="flex min-h-[68px] w-full items-center justify-between gap-4 text-right"
          aria-expanded={open}
        >
          <div>
            <h2 style={{ color: C.ink, fontSize: 19, fontWeight: 950, lineHeight: 1.35 }}>تفاصيل إضافية لمن يريد التعمق</h2>
            <p style={{ marginTop: 3, color: C.sub, fontSize: 12.5, lineHeight: 1.65, fontWeight: 650 }}>
              الفحوصات، الأدوات، والبوصلة موجودة هنا بدون تكرار ملخص القصة.
            </p>
          </div>
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${vis.particleColor}10`, color: vis.particleColor }}>
            <ChevronDown style={{ width: 18, height: 18 }} />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={on ? { opacity: 1, height: 'auto' } : {}}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-5 grid gap-4">
                {labs.length > 0 && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2" style={{ color: C.ink, fontSize: 14, fontWeight: 950 }}>
                      <ClipboardList style={{ width: 16, height: 16, color: vis.particleColor }} />
                      فحوصات للنقاش
                    </h3>
                    <div className="grid gap-2.5">
                      {labs.map((lab, index) => (
                        <div key={`${lab.name}-${index}`} className="rounded-[18px] p-3" style={{ background: 'rgba(255,255,255,0.48)', border: '1px solid rgba(255,255,255,0.70)' }}>
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p style={{ color: C.ink, fontSize: 13, fontWeight: 950 }}>{lab.name}</p>
                            <span className="rounded-full px-2 py-0.5" style={{ background: `${vis.particleColor}10`, color: vis.textColor, fontSize: 10, fontWeight: 850 }}>{lab.priority}</span>
                          </div>
                          <p style={{ color: C.sub, fontSize: 11.5, lineHeight: 1.65 }}>{lab.why}</p>
                          <p style={{ color: C.muted, fontSize: 10.5, lineHeight: 1.6, marginTop: 4 }}>{lab.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-2 flex items-center gap-2" style={{ color: C.ink, fontSize: 14, fontWeight: 950 }}>
                    <Compass style={{ width: 16, height: 16, color: vis.particleColor }} />
                    البوصلة المختصرة
                  </h3>
                  <DomainCompassMini vm={vm} />
                </div>

                {totalTools > 0 && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2" style={{ color: C.ink, fontSize: 14, fontWeight: 950 }}>
                      <Sparkles style={{ width: 16, height: 16, color: vis.particleColor }} />
                      أدوات مقترحة
                    </h3>
                    <div className="grid gap-3">
                      {tools.flatMap(group => group.recommendations.slice(0, 2)).slice(0, 4).map(tool => (
                        <Link key={tool.id} href={tool.href} className="block min-h-[48px] rounded-[18px] p-3" style={{ background: 'rgba(255,255,255,0.48)', border: '1px solid rgba(255,255,255,0.70)' }}>
                          <p style={{ color: C.ink, fontSize: 13, fontWeight: 950 }}>{tool.arabicName}</p>
                          <p style={{ color: C.sub, fontSize: 11.5, lineHeight: 1.65, marginTop: 3 }}>{tool.whyNow || tool.description}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {story.deepDetails.medicalHistory?.summaryArabic && (
                  <div className="rounded-[18px] p-3" style={{ background: 'rgba(255,255,255,0.48)', border: '1px solid rgba(255,255,255,0.70)' }}>
                    <p style={{ color: C.ink, fontSize: 13, fontWeight: 950 }}>تاريخك الصحي</p>
                    <p style={{ color: C.sub, fontSize: 11.5, lineHeight: 1.7, marginTop: 4 }}>{story.deepDetails.medicalHistory.summaryArabic}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassSurface>
    </section>
  );
}

export function ResultStoryDock({ story, session, vis }: StoryProps & { session: AssessmentSession }) {
  const [open, setOpen] = useState(false);
  const color = actionToneColor(story.primaryAction.tone);
  const secondary = useMemo(
    () => [
      { label: 'سجّل متابعة', icon: '📋', href: '/quick-check-in' },
      { label: 'عدّل الأعراض', icon: '✏️', href: `/symptom-checker?edit=${encodeURIComponent(session.id)}` },
    ],
    [session.id],
  );

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3"
      style={{ fontFamily: ARABIC_FONT }}
      dir="rtl"
    >
      {/* Fade scrim at bottom */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(228,246,252,0.90) 42%, rgba(228,246,252,0.99))' }}
      />

      <div
        className="pointer-events-auto relative mx-auto max-w-[620px] rounded-[32px] p-2.5"
        style={{
          background: 'linear-gradient(148deg, rgba(255,255,255,0.92), rgba(255,255,255,0.72))',
          border: '1.5px solid rgba(255,255,255,0.95)',
          backdropFilter: 'blur(32px) saturate(185%)',
          WebkitBackdropFilter: 'blur(32px) saturate(185%)',
          boxShadow: `0 22px 64px ${vis.particleColor}20, 0 8px 28px rgba(6,54,75,0.10), inset 0 1.5px 0 rgba(255,255,255,0.98)`,
        }}
      >
        {/* Primary action */}
        <Link href={actionHref(story.primaryAction)} onClick={() => haptic.impact()} className="block">
          <motion.div
            whileTap={{ scale: 0.983, y: 1 }}
            className="flex min-h-[68px] items-center justify-between gap-3 rounded-[26px] px-5 py-4"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}CC)`,
              color: '#fff',
              boxShadow: `0 16px 38px ${color}2C, inset 0 1.5px 0 rgba(255,255,255,0.28)`,
            }}
          >
            <div className="min-w-0 flex-1">
              <p style={{ fontSize: 10, fontWeight: 850, opacity: 0.80, marginBottom: 3, fontFamily: ARABIC_FONT }}>خطوتك الآن</p>
              <p style={{ fontSize: 15, fontWeight: 950, fontFamily: ARABIC_FONT }}>{story.primaryAction.label}</p>
              {story.primaryAction.reason && (
                <p
                  className="line-clamp-2 mt-1"
                  style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, lineHeight: 1.5, fontFamily: ARABIC_FONT }}
                >
                  {story.primaryAction.reason}
                </p>
              )}
            </div>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.20)', border: '1px solid rgba(255,255,255,0.28)' }}
            >
              <ArrowLeft style={{ width: 20, height: 20 }} />
            </div>
          </motion.div>
        </Link>

        {/* Secondary row */}
        <div className="mt-2 flex gap-1.5">
          <Link
            href={secondary[0].href}
            onClick={() => haptic.tap()}
            className="flex min-h-[46px] flex-1 items-center justify-center gap-1.5 rounded-[20px] px-3 py-2.5"
            style={{ background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.78)', color: C.sub, fontFamily: ARABIC_FONT }}
          >
            <span style={{ fontSize: 14 }}>{secondary[0].icon}</span>
            <span style={{ fontSize: 11.5, fontWeight: 900 }}>{secondary[0].label}</span>
          </Link>
          <button
            type="button"
            onClick={() => { haptic.tap(); setOpen(v => !v); }}
            className="flex min-h-[46px] w-[84px] items-center justify-center gap-1 rounded-[20px] shrink-0"
            style={{
              background: open ? `${vis.particleColor}12` : 'rgba(255,255,255,0.62)',
              border: `1px solid ${open ? `${vis.particleColor}28` : 'rgba(255,255,255,0.78)'}`,
              color: open ? vis.textColor : C.sub,
              fontFamily: ARABIC_FONT,
            }}
            aria-expanded={open}
          >
            <span style={{ fontSize: 11.5, fontWeight: 900 }}>المزيد</span>
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
              <ChevronDown style={{ width: 14, height: 14 }} />
            </motion.span>
          </button>
        </div>

        {/* Expanded secondary options */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {secondary.slice(1).map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => haptic.tap()}
                    className="flex min-h-[46px] items-center justify-center gap-1.5 rounded-[18px] px-3 py-2.5 text-center"
                    style={{ background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.78)', color: C.sub, fontFamily: ARABIC_FONT }}
                  >
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 900 }}>{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Chapter jump nav (tablet+) ─────────────────────────── */

function ChapterJumpNav({ vis }: { vis: { particleColor: string; textColor: string } }) {
  const chapters = [
    { id: 'story-1', icon: '🏠', label: 'الملخص' },
    { id: 'story-2', icon: '💬', label: 'ما قلته' },
    { id: 'story-3', icon: '🔗', label: 'الربط' },
    { id: 'story-4', icon: '🎯', label: 'القراءة' },
    { id: 'story-5', icon: '⚖️', label: 'العوامل' },
    { id: 'story-6', icon: '📋', label: 'الخطة' },
    { id: 'story-7', icon: '🔄', label: 'المتابعة' },
  ];

  const scrollTo = (id: string) => {
    haptic.tap();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 26 }}
      className="pointer-events-auto fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1.5 lg:flex"
      dir="rtl"
      style={{ fontFamily: 'var(--font-alexandria), system-ui, sans-serif' }}
    >
      {chapters.map((ch) => (
        <button
          key={ch.id}
          type="button"
          onClick={() => scrollTo(ch.id)}
          title={ch.label}
          className="group flex h-9 w-9 items-center justify-center rounded-full transition-all hover:w-28 hover:rounded-[18px] hover:px-3"
          style={{
            background: 'rgba(255,255,255,0.76)',
            border: `1px solid rgba(255,255,255,0.90)`,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            boxShadow: `0 6px 18px ${vis.particleColor}14, inset 0 1px 0 rgba(255,255,255,0.96)`,
          }}
        >
          <span className="shrink-0 text-[14px]">{ch.icon}</span>
          <span
            className="max-w-0 overflow-hidden whitespace-nowrap transition-all group-hover:max-w-[80px] group-hover:mr-1.5"
            style={{ fontSize: 11, fontWeight: 900, color: vis.textColor }}
          >
            {ch.label}
          </span>
        </button>
      ))}
    </motion.div>
  );
}

/* ── Scroll-to-top ──────────────────────────────────────── */

function ScrollToTopButton({ color }: { color: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            haptic.tap();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="pointer-events-auto fixed left-4 z-30 flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 190px)',
            background: 'rgba(255,255,255,0.88)',
            border: '1px solid rgba(255,255,255,0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: `0 10px 28px ${color}20, inset 0 1.5px 0 rgba(255,255,255,0.98)`,
            color,
          }}
          aria-label="العودة للأعلى"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function ResultStoryFlow({ session, vis, on = true }: { session: AssessmentSession; vis: DomainVisConfig; on?: boolean }) {
  const story = getResultStory(session);

  return (
    <ResultStoryShell story={story} vis={vis} on={on}>
      {/* Hero card */}
      <ResultOpeningScene story={story} vis={vis} on={on} />

      {/* Flowing story spine — no cards, just narrative */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={on ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.22, type: 'spring', stiffness: 200, damping: 28 }}
        className="mt-2 rounded-[28px] px-4 py-6"
        style={{
          background: 'linear-gradient(155deg, rgba(255,255,255,0.88), rgba(255,255,255,0.62) 52%, rgba(232,250,255,0.44))',
          border: '1px solid rgba(255,255,255,0.90)',
          backdropFilter: 'blur(32px) saturate(175%)',
          WebkitBackdropFilter: 'blur(32px) saturate(175%)',
          boxShadow: `0 18px 52px ${vis.particleColor}14, 0 6px 20px rgba(6,54,75,0.05), inset 0 1.5px 0 rgba(255,255,255,0.96)`,
        }}
      >
        <ResultStorySpine story={story} vis={vis} on={on} />
      </motion.div>

      {/* Native dock */}
      <ResultStoryDock story={story} session={session} vis={vis} on={on} />
    </ResultStoryShell>
  );
}
