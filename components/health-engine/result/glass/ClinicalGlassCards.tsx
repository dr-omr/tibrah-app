'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Compass,
  ClipboardList,
  FlaskConical,
  Info,
  Leaf,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import type { AssessmentSession } from '@/lib/assessment-session-store';
import { haptic } from '@/lib/HapticFeedback';
import { trackEvent } from '@/lib/analytics';
import type { DomainVisConfig } from '@/components/health-engine/result/shared/design-tokens';
import { W } from '@/components/health-engine/result/shared/design-tokens';
import {
  buildHumanSummary,
  buildLabSuggestions,
  buildSignalChips,
  CONFIDENCE_LABEL_AR,
  DOMAIN_AR,
  isEducationalTayyibat,
  SIGNAL_MEANING,
  STATUS_BADGE,
  type LabSuggestion,
  type ResultViewModel,
  type SignalChip,
  type TayyibatVerdict,
} from './model';

type GlassTone = 'default' | 'safe' | 'watch' | 'urgent';

const TONE_COLOR: Record<GlassTone, string> = {
  default: '#0891B2',
  safe: '#059669',
  watch: '#D97706',
  urgent: '#DC2626',
};

function toneColor(tone: SignalChip['tone'], fallback: string) {
  if (!tone || tone === 'normal') return fallback;
  return TONE_COLOR[tone === 'safe' ? 'safe' : tone === 'urgent' ? 'urgent' : 'watch'];
}

function isSafetyFirst(level?: string) {
  return level === 'emergency' || level === 'urgent';
}

function confidenceLabel(vm: ResultViewModel) {
  const label = vm.confidenceExplanation?.label ?? vm.confidencePhenotype.confidenceBand;
  return CONFIDENCE_LABEL_AR[label] ?? 'محدودة';
}

function formatSessionDate(session: AssessmentSession) {
  const raw = (session as unknown as { updatedAt?: string; createdAt?: string }).updatedAt
    ?? (session as unknown as { updatedAt?: string; createdAt?: string }).createdAt;
  const date = raw ? new Date(raw) : new Date();
  try {
    return new Intl.DateTimeFormat('ar', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return 'اليوم';
  }
}

function buildImmediateAction(session: AssessmentSession) {
  const vm = session.resultViewModel;
  const level = vm.refinedTriage?.level ?? vm.hero.triageLevel;
  const conf = vm.confidenceExplanation?.label ?? vm.confidencePhenotype.confidenceBand;

  if (isSafetyFirst(level)) {
    return {
      title: 'اطلب رعاية طبية',
      body: vm.safetySummary?.recommendedAction || 'اتصل برقم الطوارئ المحلي في بلدك أو توجه لأقرب طوارئ فوراً.',
      href: '/book-appointment',
      tone: '#DC2626',
    };
  }

  if (conf === 'low') {
    return {
      title: 'أكمل البيانات',
      body: 'أضف ما ينقص من المدة أو المتابعة أو السياق حتى ترتفع موثوقية القراءة.',
      href: `/symptom-checker?edit=${encodeURIComponent(session.id)}`,
      tone: '#D97706',
    };
  }

  return {
    title: 'ابدأ بخطوة اليوم',
    body: vm.planHandoff?.startTodayStep || vm.todayAction.body,
    href: '/my-plan',
    tone: '#059669',
  };
}

function buildReasoningBullets(vm: ResultViewModel) {
  const bullets = [
    `الشدة والمدة وضعتا القراءة في نطاق ${vm.hero.severityDisplay} و${vm.hero.durationDisplay}.`,
    vm.clinicalExplanation.body || 'رجّحنا المسار الأقرب بناءً على إجاباتك الأساسية.',
  ];

  if (vm.refinedTriage?.dominantSignals?.length) {
    bullets.push(`علامات الأولوية: ${vm.refinedTriage.dominantSignals.slice(0, 2).join('، ')}.`);
  } else if (vm.keySignals.length > 0) {
    bullets.push(`الإشارات الأقوى: ${vm.keySignals.slice(0, 2).map(signal => signal.label).join('، ')}.`);
  } else {
    bullets.push('لم تظهر علامة أولوية واضحة، لذلك بقيت الخطة عملية ومراقِبة.');
  }

  return bullets.slice(0, 3);
}

function tayyibatKnowledgeState(session: AssessmentSession): 'dont_know' | 'know_not_apply' | 'partial' | 'mostly' | 'unknown' {
  const raw = session.answers.nutritionAnswers?.gateAnswers?.tay_know ?? '';
  if (raw === 'dont_know') return 'dont_know';
  if (raw === 'know_not_following' || raw === 'know_not_apply') return 'know_not_apply';
  if (raw === 'yes_partial' || raw === 'partial') return 'partial';
  if (raw === 'yes_following' || raw === 'mostly') return 'mostly';
  return 'unknown';
}

function signalGlyph(label: string) {
  if (label.includes('الشدة')) return '◉';
  if (label.includes('المدة')) return '◌';
  if (label.includes('المسار')) return '◇';
  if (label.includes('الأولوية')) return '!';
  if (label.includes('الغذاء')) return '⌁';
  return '•';
}

function GlassSheen({ color }: { color: string }) {
  return (
    <>
      <div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0.10), transparent)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 34% at 24% 6%, rgba(255,255,255,0.72), transparent 64%)' }} />
      <div className="absolute -top-24 -right-20 pointer-events-none rounded-full" style={{ width: 210, height: 210, background: `radial-gradient(circle, ${color}20, transparent 68%)`, filter: 'blur(34px)' }} />
      <div className="absolute top-0 left-[16%] right-[16%] h-[3px] rounded-b-full pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${color}BB, transparent)`, boxShadow: `0 2px 18px ${color}28` }} />
    </>
  );
}

function ClinicalGlassCard({
  title,
  subtitle,
  icon,
  color,
  children,
  details,
  detailLabel = 'تفاصيل أكثر',
  defaultDetailsOpen = false,
  className = '',
  delay = 0,
  on = true,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  details?: React.ReactNode;
  detailLabel?: string;
  defaultDetailsOpen?: boolean;
  className?: string;
  delay?: number;
  on?: boolean;
}) {
  const [open, setOpen] = useState(defaultDetailsOpen);
  return (
    <motion.section
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={on ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay, type: 'spring', stiffness: 230, damping: 28 }}
      className={`relative overflow-hidden rounded-[30px] p-5 ${className}`}
      style={{
        background: 'linear-gradient(155deg, rgba(255,255,255,0.82), rgba(255,255,255,0.54) 44%, rgba(255,255,255,0.38))',
        border: '1.5px solid rgba(255,255,255,0.92)',
        backdropFilter: 'blur(30px) saturate(175%)',
        WebkitBackdropFilter: 'blur(30px) saturate(175%)',
        boxShadow: `0 18px 54px ${color}14, 0 4px 16px rgba(12,74,110,0.06), inset 0 1.5px 0 rgba(255,255,255,0.96), inset 0 -1px 0 rgba(8,145,178,0.06)`,
      }}
    >
      <GlassSheen color={color} />
      <div className="relative z-10">
        <div className="mb-4 flex items-start gap-3">
          <div className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-[20px]" style={{ width: 48, height: 48, background: `linear-gradient(150deg, rgba(255,255,255,0.90), ${color}18)`, border: `1px solid ${color}24`, boxShadow: `0 10px 24px ${color}12, inset 0 1px 0 rgba(255,255,255,0.92)`, color }}>
            <div className="absolute inset-x-0 top-0 h-1/2" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.72), transparent)' }} />
            <span className="relative z-10">{icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 style={{ fontSize: 18, fontWeight: 950, lineHeight: 1.35, color: W.textPrimary }}>{title}</h2>
            {subtitle && <p style={{ marginTop: 3, fontSize: 12, lineHeight: 1.75, color: W.textSub, fontWeight: 650 }}>{subtitle}</p>}
          </div>
        </div>

        {children}

        {details && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                haptic.tap();
                setOpen(value => !value);
              }}
              className="flex w-full items-center justify-between rounded-[18px] px-3 py-2.5 text-right"
              style={{ background: `${color}08`, border: `1px solid ${color}16`, color: W.textSub }}
            >
              <span style={{ fontSize: 11, fontWeight: 900 }}>{detailLabel}</span>
              <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: 'spring', stiffness: 320, damping: 24 }}>
                <ChevronDown style={{ width: 15, height: 15, color }} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="pt-3">{details}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.section>
  );
}

function SignalPill({ chip, color }: { chip: SignalChip; color: string }) {
  const accent = toneColor(chip.tone, color);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-2" style={{ background: `${accent}0D`, border: `1px solid ${accent}22`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.62)' }}>
      <span style={{ fontSize: 10, fontWeight: 950, color: accent }}>{chip.label}</span>
      <span style={{ fontSize: 11.5, fontWeight: 800, color: W.textPrimary }}>{chip.value}</span>
    </span>
  );
}

export function ClinicalMapHeroCard({ session, vis, on }: {
  session: AssessmentSession;
  vis: DomainVisConfig;
  on: boolean;
}) {
  const vm = session.resultViewModel;
  const topSignals = buildSignalChips(session).slice(0, 5);
  const sb = STATUS_BADGE[vm.hero.triageLevel] ?? STATUS_BADGE.review;
  const action = buildImmediateAction(session);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18, scale: 0.982 }}
      animate={on ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: 0.05, type: 'spring', stiffness: 220, damping: 28 }}
      className="relative overflow-hidden rounded-[34px] p-5 md:p-6"
      style={{
        minHeight: 360,
        background: `linear-gradient(160deg, rgba(255,255,255,0.88), ${vis.particleColor}10 42%, rgba(255,255,255,0.50)), ${vis.heroGrad}`,
        border: '1.5px solid rgba(255,255,255,0.95)',
        backdropFilter: 'blur(34px) saturate(185%)',
        WebkitBackdropFilter: 'blur(34px) saturate(185%)',
        boxShadow: `0 24px 70px ${vis.particleColor}18, 0 8px 24px rgba(12,74,110,0.08), inset 0 1.5px 0 rgba(255,255,255,0.98), inset 0 -1px 0 rgba(255,255,255,0.48)`,
      }}
    >
      <GlassSheen color={vis.particleColor} />
      <motion.div
        className="absolute left-6 top-8 hidden rounded-full md:block"
        animate={{ y: [0, -8, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 128, height: 128, background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.88), ${vis.particleColor}30 54%, rgba(255,255,255,0.18))`, border: '1px solid rgba(255,255,255,0.78)', boxShadow: `0 22px 64px ${vis.particleColor}20, inset 0 2px 0 rgba(255,255,255,0.92)` }}
      />

      <div className="relative z-10 grid gap-4">
        {/* Status badge row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full px-3.5 py-1.5" style={{ background: sb.bg, border: `1.5px solid ${sb.color}30`, color: sb.color, fontSize: 12, fontWeight: 950 }}>
            {sb.label}
          </span>
          <span className="rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.80)', color: W.textSub, fontSize: 11, fontWeight: 900 }}>
            الشدة {vm.hero.severityDisplay}
          </span>
          <span className="rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.80)', color: W.textSub, fontSize: 11, fontWeight: 900 }}>
            {vm.hero.domainArabicName}
          </span>
          <span className="rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.80)', color: W.textSub, fontSize: 11, fontWeight: 900 }}>
            موثوقية {confidenceLabel(vm)}
          </span>
          <span className="rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.80)', color: W.textSub, fontSize: 11, fontWeight: 900 }}>
            {formatSessionDate(session)}
          </span>
        </div>

        {/* Hero title + human summary */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 900, color: vis.textColor, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>خريطة الحالة</p>
          <h1 style={{ fontSize: 31, fontWeight: 950, color: W.textPrimary, lineHeight: 1.18, letterSpacing: 0 }}>
            خريطة حالتك
          </h1>
          <p style={{ marginTop: 12, fontSize: 14.5, lineHeight: 1.9, color: W.textSub, fontWeight: 720 }}>
            {buildHumanSummary(session)}
          </p>
        </div>

        {/* 3-panel above-fold */}
        <div className="grid gap-2.5 md:grid-cols-3">
          <div className="rounded-[22px] p-3.5" style={{ background: sb.bg, border: `1px solid ${sb.color}25`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)' }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: sb.color, marginBottom: 6, letterSpacing: '0.06em' }}>هل حالتي مستقرة؟</p>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: W.textPrimary, fontWeight: 820 }}>{sb.meaning}</p>
          </div>
          <div className="rounded-[22px] p-3.5" style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(255,255,255,0.82)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)' }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: vis.textColor, marginBottom: 6, letterSpacing: '0.06em' }}>لماذا ظهرت هذه القراءة؟</p>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: W.textPrimary, fontWeight: 760 }}>
              لأن الشدة، المدة، وإشارات الأولوية رجّحت مسار {vm.hero.pathwayLabel}.
            </p>
          </div>
          <div className="rounded-[22px] p-3.5" style={{ background: `${action.tone}0B`, border: `1px solid ${action.tone}24`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)' }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: action.tone, marginBottom: 6, letterSpacing: '0.06em' }}>ماذا أفعل الآن؟</p>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: W.textPrimary, fontWeight: 850 }}>{action.title}</p>
            <p style={{ marginTop: 3, fontSize: 11.5, lineHeight: 1.55, color: W.textSub, fontWeight: 650 }}>{action.body}</p>
          </div>
        </div>

        {/* Signal chips */}
        <div className="flex flex-wrap gap-2">
          {topSignals.map(chip => <SignalPill key={chip.label} chip={chip} color={vis.particleColor} />)}
        </div>
      </div>
    </motion.section>
  );
}

export function KeySignalsGlassCard({ session, vis, on }: {
  session: AssessmentSession;
  vis: DomainVisConfig;
  on: boolean;
}) {
  const chips = buildSignalChips(session);
  return (
    <ClinicalGlassCard
      title="أهم ما فهمناه"
      subtitle="هذه الإشارات شكّلت القراءة — كل واحدة لها معنى."
      icon={<CheckCircle2 style={{ width: 21, height: 21 }} />}
      color={vis.particleColor}
      on={on}
      delay={0.06}
    >
      <div className="grid gap-2.5">
        {chips.map(chip => {
          const accent = toneColor(chip.tone, vis.particleColor);
          const meaning = SIGNAL_MEANING[chip.label];
          return (
            <div key={chip.label} className="rounded-[18px] px-3.5 py-3 flex items-start gap-3"
              style={{ background: `${accent}08`, border: `1px solid ${accent}18`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.62)' }}>
              <span className="flex shrink-0 items-center justify-center rounded-[14px]" style={{ width: 34, height: 34, background: `${accent}12`, border: `1px solid ${accent}20`, color: accent, fontSize: 14, fontWeight: 950 }}>
                {signalGlyph(chip.label)}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 11, fontWeight: 900, color: accent }}>{chip.label}</span>
                  <span className="rounded-full px-2 py-0.5" style={{ background: `${accent}14`, color: accent, fontSize: 10, fontWeight: 800 }}>{chip.value}</span>
                </div>
                {meaning && <p style={{ fontSize: 11, color: W.textSub, lineHeight: 1.6, fontWeight: 500 }}>{meaning}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </ClinicalGlassCard>
  );
}

export function WhyThisReadingCard({ vm, vis, on }: {
  vm: ResultViewModel;
  vis: DomainVisConfig;
  on: boolean;
}) {
  const bullets = buildReasoningBullets(vm);
  const details = vm.contradictionSummary?.userMessages?.length ? (
    <div className="grid gap-2">
      {vm.contradictionSummary.userMessages.slice(0, 3).map(message => (
        <p key={message} className="rounded-[16px] p-3" style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.16)', color: '#92400E', fontSize: 11.5, lineHeight: 1.75, fontWeight: 750 }}>
          {message}
        </p>
      ))}
    </div>
  ) : vm.assessmentHandoff ? (
    <div className="grid gap-2">
      {vm.assessmentHandoff.adaptiveReasonsShown.slice(0, 3).map(reason => (
        <p key={reason} className="rounded-[16px] p-3" style={{ background: `${vis.particleColor}08`, border: `1px solid ${vis.particleColor}16`, color: W.textSub, fontSize: 11.5, lineHeight: 1.75, fontWeight: 750 }}>
          سألناك بهذا الاتجاه لأن: {reason}
        </p>
      ))}
      {vm.assessmentHandoff.skippedSections.length > 0 && (
        <p className="rounded-[16px] p-3" style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.16)', color: '#047857', fontSize: 11.5, lineHeight: 1.75, fontWeight: 760 }}>
          لم نُطِل: {vm.assessmentHandoff.skippedSections.join('، ')} لأن البيانات الحالية كافية لقراءة أولية.
        </p>
      )}
    </div>
  ) : undefined;

  return (
    <ClinicalGlassCard
      title="لماذا ظهرت هذه القراءة؟"
      subtitle="رجّحنا هذا الاتجاه لأن الإجابات اجتمعت حول هذه الإشارات."
      icon={<Info style={{ width: 21, height: 21 }} />}
      color={vis.particleColor}
      details={details}
      detailLabel="ملاحظات الاتساق"
      on={on}
      delay={0.08}
    >
      <p style={{ fontSize: 13.5, lineHeight: 1.95, color: W.textPrimary, fontWeight: 800, marginBottom: 12 }}>
        رجّحنا هذا الاتجاه لأن…
      </p>
      <div className="grid gap-2.5">
        {bullets.map((bullet, index) => (
          <div key={`${bullet}-${index}`} className="rounded-[18px] p-3 flex items-start gap-2.5"
            style={{ background: 'rgba(255,255,255,0.58)', border: '1px solid rgba(255,255,255,0.82)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.66)' }}>
            <span className="flex shrink-0 items-center justify-center rounded-full"
              style={{ width: 24, height: 24, background: `${vis.particleColor}12`, border: `1px solid ${vis.particleColor}20`, color: vis.textColor, fontSize: 11, fontWeight: 950 }}>
              {index + 1}
            </span>
            <p style={{ fontSize: 12.3, lineHeight: 1.75, color: W.textPrimary, fontWeight: 720 }}>{bullet}</p>
          </div>
        ))}
      </div>
      {vm.keySignals.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {vm.keySignals.slice(0, 4).map(signal => (
            <span key={signal.label} className="rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.64)', border: '1px solid rgba(255,255,255,0.82)', color: W.textSub, fontSize: 11, fontWeight: 850 }}>
              {signal.emoji} {signal.label}
            </span>
          ))}
        </div>
      )}
    </ClinicalGlassCard>
  );
}

export function ConfidenceGlassCard({ vm, vis, on }: {
  vm: ResultViewModel;
  vis: DomainVisConfig;
  on: boolean;
}) {
  const conf = vm.confidenceExplanation;
  const color = conf?.label === 'low' ? '#DC2626' : conf?.label === 'medium' ? '#D97706' : '#059669';
  const score = typeof conf?.score === 'number' ? conf.score : vm.confidencePhenotype.confidenceScore;
  const unknowns = (conf?.missingData?.length ? conf.missingData : vm.whatWeDoNotKnowYet ?? []).slice(0, 3);
  const improvements = conf?.howToImprove?.slice(0, 3) ?? [];

  return (
    <ClinicalGlassCard
      title="موثوقية القراءة"
      subtitle="نقول لك ما نعرفه وما لا نعرفه بعد."
      icon={<ShieldCheck style={{ width: 21, height: 21 }} />}
      color={color}
      details={(unknowns.length > 0 || improvements.length > 0) && (
        <div className="grid gap-2">
          {unknowns.length > 0 && (
            <p className="rounded-[16px] p-3" style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.16)', color: '#92400E', fontSize: 11.5, lineHeight: 1.75, fontWeight: 800 }}>
              لرفع الدقة نحتاج: {unknowns.join('، ')}
            </p>
          )}
          {improvements.length > 0 && (
            <p className="rounded-[16px] p-3" style={{ background: `${vis.particleColor}08`, border: `1px solid ${vis.particleColor}18`, color: W.textSub, fontSize: 11.5, lineHeight: 1.75, fontWeight: 750 }}>
              ما يحسنها: {improvements.join('، ')}
            </p>
          )}
        </div>
      )}
      detailLabel="ما يرفع الدقة"
      on={on}
      delay={0.1}
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0 rounded-full" style={{ width: 86, height: 86, background: 'rgba(255,255,255,0.52)', border: '1px solid rgba(255,255,255,0.82)', boxShadow: `0 14px 34px ${color}14, inset 0 1.5px 0 rgba(255,255,255,0.92)` }}>
          <div className="absolute inset-2 rounded-full" style={{ background: `conic-gradient(${color} ${Math.max(8, Math.min(score, 100))}%, ${color}18 0)`, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.65))' }} />
          <div className="absolute inset-[12px] rounded-full flex flex-col items-center justify-center" style={{ background: 'rgba(255,255,255,0.88)' }}>
            <span style={{ fontSize: 18, fontWeight: 950, color: W.textPrimary }}>{score}%</span>
            <span style={{ fontSize: 8, fontWeight: 850, color }}>{CONFIDENCE_LABEL_AR[conf?.label ?? vm.confidencePhenotype.confidenceBand] ?? 'محدودة'}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p style={{ fontSize: 14, lineHeight: 1.85, color: W.textPrimary, fontWeight: 780 }}>{conf?.userNote ?? vm.confidencePhenotype.confidenceLabel}</p>
          {conf?.isPreliminary && (
            <span className="mt-2 inline-flex rounded-full px-3 py-1.5" style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.18)', color: '#92400E', fontSize: 10.5, fontWeight: 900 }}>
              قراءة أولية قابلة للتحسين
            </span>
          )}
        </div>
      </div>
    </ClinicalGlassCard>
  );
}

export function UnknownsGlassCard({ items, vis, on }: {
  items: string[];
  vis: DomainVisConfig;
  on: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <ClinicalGlassCard
      title="ما نحتاج معرفته لرفع الدقة"
      subtitle="هذه ليست ثغرات في النتيجة؛ هذه نقاط إذا أضفتها تصبح القراءة أدق."
      icon={<AlertCircle style={{ width: 21, height: 21 }} />}
      color="#D97706"
      on={on}
      delay={0.11}
    >
      <div className="grid gap-2.5">
        {items.slice(0, 4).map((item, index) => (
          <div key={item} className="rounded-[18px] px-3.5 py-3 flex items-start gap-3"
            style={{ background: 'rgba(217,119,6,0.075)', border: '1px solid rgba(217,119,6,0.16)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.64)' }}>
            <span className="flex shrink-0 items-center justify-center rounded-[13px]" style={{ width: 30, height: 30, background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.18)', color: '#D97706', fontSize: 12, fontWeight: 950 }}>
              {index + 1}
            </span>
            <p style={{ fontSize: 12.2, lineHeight: 1.72, color: '#92400E', fontWeight: 760 }}>{item}</p>
          </div>
        ))}
        <Link href="/quick-check-in" className="mt-1 inline-flex w-fit rounded-full px-3.5 py-2"
          style={{ background: `${vis.particleColor}0B`, border: `1px solid ${vis.particleColor}1C`, color: vis.textColor, fontSize: 11, fontWeight: 920 }}>
          سجّل متابعة لرفع الدقة
        </Link>
      </div>
    </ClinicalGlassCard>
  );
}

export function DomainCompassGlassCard({ vm, vis, on }: {
  vm: ResultViewModel;
  vis: DomainVisConfig;
  on: boolean;
}) {
  const domains = Object.entries(vm.domainCompass.domainScores) as Array<[keyof typeof DOMAIN_AR, number]>;
  const sorted = [...domains].sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0]?.[0];
  const secondary = sorted[1]?.[0];

  const contribution = (domain: keyof typeof DOMAIN_AR) => {
    if (domain === dominant) return 'الاتجاه الأقوى';
    if (domain === secondary) return 'تأثير ثانوي';
    return 'عامل مساعد';
  };

  return (
    <ClinicalGlassCard
      title="البوصلة الصحية"
      subtitle="جسدي / نفسي / فكري / روحي كاتجاهات قراءة، لا كدرجات حكم على الشخص."
      icon={<Compass style={{ width: 21, height: 21 }} />}
      color={vis.particleColor}
      details={<p style={{ fontSize: 11.5, lineHeight: 1.8, color: W.textSub, fontWeight: 700 }}>{vm.domainCompass.whyText}</p>}
      detailLabel="سبب اتجاه البوصلة"
      on={on}
      delay={0.12}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {domains.map(([domain, score]) => {
          const meta = DOMAIN_AR[domain] ?? { label: domain, icon: '•', meaning: '' };
          const active = domain === dominant;
          const soft = domain === secondary;
          return (
            <div key={domain} className="rounded-[22px] p-3 relative overflow-hidden" style={{ background: active ? `${vis.particleColor}10` : soft ? 'rgba(255,255,255,0.64)' : 'rgba(255,255,255,0.46)', border: `1px solid ${active ? `${vis.particleColor}26` : 'rgba(255,255,255,0.78)'}`, boxShadow: active ? `0 12px 32px ${vis.particleColor}12, inset 0 1px 0 rgba(255,255,255,0.72)` : 'inset 0 1px 0 rgba(255,255,255,0.64)' }}>
              {active && <div className="absolute top-0 left-[18%] right-[18%] h-[3px] rounded-b-full" style={{ background: `linear-gradient(90deg, transparent, ${vis.particleColor}, transparent)` }} />}
              <div className="mb-2 flex items-start gap-2.5">
                <span className="flex shrink-0 items-center justify-center rounded-full" style={{ width: 34, height: 34, background: `${vis.particleColor}12`, color: vis.textColor, border: `1px solid ${vis.particleColor}22`, fontWeight: 950 }}>{meta.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p style={{ fontSize: 12.5, fontWeight: 950, color: W.textPrimary }}>{meta.label}</p>
                    <span className="rounded-full px-2 py-0.5" style={{ background: `${vis.particleColor}10`, color: vis.textColor, fontSize: 9.5, fontWeight: 900 }}>
                      {contribution(domain)}
                    </span>
                  </div>
                  <p style={{ fontSize: 10.5, lineHeight: 1.55, color: W.textSub, fontWeight: 650 }}>{meta.meaning}</p>
                </div>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 7, background: `${vis.particleColor}10` }}>
                <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={on ? { width: `${Math.max(8, Math.min(score, 100))}%` } : {}} transition={{ duration: 0.8, delay: 0.12 }} style={{ background: `linear-gradient(90deg, ${vis.particleColor}, ${vis.particleColor}99)` }} />
              </div>
            </div>
          );
        })}
      </div>
    </ClinicalGlassCard>
  );
}

export function NutritionRhythmGlassCard({ data, vis, on, suppressed, recommendedAction, session }: {
  data?: TayyibatVerdict;
  vis: DomainVisConfig;
  on: boolean;
  suppressed?: boolean;
  recommendedAction?: string;
  session: AssessmentSession;
}) {
  if (suppressed) {
    return (
      <ClinicalGlassCard
        title="الغذاء مؤجل الآن"
        subtitle="عندما تكون السلامة أولوية، لا نجعل التغذية أو نمط الحياة الإجراء الأساسي."
        icon={<ShieldCheck style={{ width: 21, height: 21 }} />}
        color="#DC2626"
        on={on}
        delay={0.14}
      >
        <p style={{ fontSize: 12.8, lineHeight: 1.85, color: '#991B1B', fontWeight: 800 }}>{recommendedAction}</p>
      </ClinicalGlassCard>
    );
  }

  if (!data) return null;

  const educational = isEducationalTayyibat(data);
  const knowledge = tayyibatKnowledgeState(session);
  const beginner = knowledge === 'know_not_apply';
  const partial = knowledge === 'partial';
  const mostly = knowledge === 'mostly';
  const color = educational ? '#6366F1' : vis.particleColor;
  const topGaps = data.topGaps.slice(0, 3);
  const badge = educational
    ? 'رؤية تعريفية'
    : beginner
      ? 'بداية عملية'
      : partial
        ? 'متابعة الثغرات'
        : mostly
          ? 'نمط متابعة'
          : data.primaryPatternLabel || 'نمط غذائي محتمل';
  const stateText = educational
    ? 'اخترت أنك لا تعرف نظام الطيبات بعد، لذلك لا نعرض درجة التزام. هذه قراءة تعريفية تساعدك تفهم العلاقة بين الغذاء والأعراض.'
    : beginner
      ? 'أنت تعرف الفكرة لكن التطبيق لم يبدأ بعد. نبدأ بخطوة صغيرة لا بخطة صارمة.'
      : data.summaryArabic;

  return (
    <ClinicalGlassCard
      title="الغذاء والإيقاع"
      subtitle="نقرأ علاقة الأكل والتوقيت بالأعراض كطبقة مساعدة، لا كتفسير وحيد."
      icon={<Leaf style={{ width: 21, height: 21 }} />}
      color={color}
      details={!educational && topGaps.length > 0 && (
        <div className="grid gap-2">
          {topGaps.map(gap => (
            <p key={gap} className="rounded-[16px] p-3" style={{ background: `${color}08`, border: `1px solid ${color}16`, color: W.textSub, fontSize: 11.5, lineHeight: 1.7, fontWeight: 750 }}>
              {gap}
            </p>
          ))}
        </div>
      )}
      detailLabel="ثغرات المتابعة"
      on={on}
      delay={0.14}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full px-3 py-1.5" style={{ background: `${color}11`, border: `1px solid ${color}24`, color, fontSize: 11, fontWeight: 950 }}>
          {badge}
        </span>
        {!educational && (
          <span className="rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(255,255,255,0.80)', color: W.textSub, fontSize: 10.5, fontWeight: 850 }}>
            موثوقية غذائية {CONFIDENCE_LABEL_AR[data.confidenceLabel] ?? 'محدودة'}
          </span>
        )}
      </div>

      <p style={{ fontSize: 12.8, lineHeight: 1.9, color: W.textPrimary, fontWeight: 700 }}>{stateText}</p>

      {educational ? (
        <div className="mt-3 grid gap-2">
          <p className="rounded-[18px] p-3" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', color: '#4338CA', fontSize: 12, lineHeight: 1.8, fontWeight: 850 }}>
            اخترت أنك لا تعرف نظام الطيبات بعد، لذلك لا نعرض درجة التزام أو شارة التزام أو بروتوكول صارم. هذه قراءة تعريفية فقط.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/tayyibat" className="rounded-[18px] px-3 py-2.5 text-center" style={{ background: 'rgba(99,102,241,0.11)', border: '1px solid rgba(99,102,241,0.22)', color: '#4338CA', fontSize: 11, fontWeight: 900 }}>تعرّف على النظام</Link>
            <Link href="/tayyibat/tracker" className="rounded-[18px] px-3 py-2.5 text-center" style={{ background: 'rgba(255,255,255,0.58)', border: '1px solid rgba(255,255,255,0.78)', color: W.textSub, fontSize: 11, fontWeight: 900 }}>سجّل وجباتك</Link>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid gap-2">
          {data.firstStepToday && !data.safetyGated && (
            <div className="rounded-[18px] p-3" style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.16)' }}>
              <p style={{ fontSize: 11, fontWeight: 950, color: '#059669', marginBottom: 5 }}>{beginner ? 'خطوة بداية' : 'خطوة غذائية هادئة'}</p>
              <p style={{ fontSize: 11.8, lineHeight: 1.75, color: W.textPrimary, fontWeight: 700 }}>{beginner ? 'ابدأ بتبديل واحد يمكن الاستمرار عليه، ثم راقب أثره على الطاقة أو الهضم.' : data.firstStepToday}</p>
            </div>
          )}
          <Link href="/tayyibat/tracker" className="w-fit rounded-[18px] px-3.5 py-2.5" style={{ background: `${color}0D`, border: `1px solid ${color}1F`, color, fontSize: 11, fontWeight: 920 }}>
            {beginner ? 'ابدأ بتبديل واحد' : 'سجّل وجباتك'}
          </Link>
        </div>
      )}
    </ClinicalGlassCard>
  );
}

export function LabsToDiscussCard({ labs, on }: {
  labs: LabSuggestion[];
  on: boolean;
}) {
  const shownLabs = labs.length ? labs : [{ name: 'لا توجد تحاليل محددة الآن', why: 'الإجابات الحالية لا تكفي لاقتراح فحوصات بعينها.', priority: 'متابعة', note: 'أعد التقييم إذا ظهرت علامات جديدة.' }];

  return (
    <ClinicalGlassCard
      title="الفحوصات المقترحة"
      subtitle="لا نطلب تحاليل كتشخيص ذاتي؛ نعرض أسباباً واضحة للنقاش الطبي."
      icon={<FlaskConical style={{ width: 21, height: 21 }} />}
      color="#0891B2"
      on={on}
      delay={0.16}
    >
      <div className="grid gap-3">
        {shownLabs.map(lab => (
          <div key={lab.name} className="rounded-[20px] p-3.5" style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(255,255,255,0.80)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.68)' }}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <p style={{ fontSize: 13.5, fontWeight: 950, color: W.textPrimary }}>{lab.name}</p>
              <span className="shrink-0 rounded-full px-2.5 py-1" style={{ background: 'rgba(8,145,178,0.09)', color: '#0891B2', fontSize: 10, fontWeight: 950 }}>{lab.priority}</span>
            </div>
            <p style={{ fontSize: 11.8, lineHeight: 1.75, color: W.textSub, fontWeight: 700 }}>{lab.why}</p>
            <p style={{ marginTop: 5, fontSize: 10.8, lineHeight: 1.6, color: '#64748B', fontWeight: 650 }}>{lab.note}</p>
          </div>
        ))}
      </div>
    </ClinicalGlassCard>
  );
}

export function PracticalPlanGlassCard({ vm, on }: {
  vm: ResultViewModel;
  on: boolean;
}) {
  const items = [
    ['اليوم', vm.todayAction.body],
    ['هذا الأسبوع', vm.monitoring.items.slice(0, 2).join('، ') || vm.planHandoff?.revisitNote],
    ['راجع طبيبك إذا', vm.seekCare.body],
    ['موعد إعادة التقييم', vm.planHandoff?.revisitNote || 'أعد التقييم إذا تغيّر النمط أو ظهرت أعراض جديدة.'],
  ];

  return (
      <ClinicalGlassCard
      title="خطتك العملية"
      subtitle="قصيرة وواضحة: اليوم، هذا الأسبوع، متى تراجع الطبيب، ومتى تعيد التقييم."
      icon={<CalendarDays style={{ width: 21, height: 21 }} />}
      color="#059669"
      on={on}
      delay={0.18}
    >
      <div className="grid gap-3">
        {items.map(([title, body]) => (
          <div key={title} className="rounded-[20px] p-3.5" style={{ background: 'rgba(5,150,105,0.075)', border: '1px solid rgba(5,150,105,0.17)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.62)' }}>
            <p style={{ fontSize: 11, fontWeight: 950, color: '#059669', marginBottom: 4 }}>{title}</p>
            <p style={{ fontSize: 12.2, lineHeight: 1.82, color: W.textPrimary, fontWeight: 700 }}>{body}</p>
          </div>
        ))}
      </div>
    </ClinicalGlassCard>
  );
}

export function ToolsPriorityGlassCard({ groups, vis, on }: {
  groups: ResultViewModel['recommendationGroups'];
  vis: DomainVisConfig;
  on: boolean;
}) {
  const buckets = [
    { title: 'ابدأ بهذا', items: groups.find(group => group.key === 'primary')?.recommendations.slice(0, 2) ?? [] },
    { title: 'يساعدك في المتابعة', items: groups.find(group => group.key === 'tracking')?.recommendations.slice(0, 2) ?? [] },
    { title: 'تعمّق لاحقاً', items: groups.find(group => group.key === 'tools')?.recommendations.slice(0, 2) ?? [] },
  ].filter(bucket => bucket.items.length > 0);
  if (buckets.length === 0) return null;

  return (
    <ClinicalGlassCard
      title="أدواتك المقترحة"
      subtitle="نقترح أقل عدد مفيد الآن، والباقي في التفاصيل إن احتجته."
      icon={<ClipboardList style={{ width: 21, height: 21 }} />}
      color={vis.particleColor}
      on={on}
      delay={0.2}
    >
      <div className="grid gap-3">
        {buckets.map(bucket => (
          <div key={bucket.title} className="grid gap-2">
            <p style={{ fontSize: 10.5, fontWeight: 950, color: vis.textColor }}>{bucket.title}</p>
            {bucket.items.map((rec, index) => (
              <Link
                key={rec.id}
                href={rec.href}
                onClick={() => {
                  haptic.tap();
                  trackEvent('assessment_result_tool_preview_clicked', { tool_id: rec.id, rank: index + 1, bucket: bucket.title });
                }}
                className="rounded-[20px] p-3.5 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(255,255,255,0.82)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.68)' }}
              >
                <span className="rounded-full flex items-center justify-center shrink-0" style={{ width: 38, height: 38, background: `${rec.accentColor}13`, border: `1px solid ${rec.accentColor}20`, color: rec.accentColor, fontSize: 18 }}>
                  {rec.emoji}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block" style={{ fontSize: 12.8, fontWeight: 950, color: W.textPrimary, lineHeight: 1.35 }}>{rec.arabicName}</span>
                  <span className="block" style={{ fontSize: 10.8, lineHeight: 1.6, color: W.textSub, fontWeight: 700 }}>{rec.whyNow}</span>
                  <span className="block" style={{ fontSize: 10.2, lineHeight: 1.55, color: '#64748B', fontWeight: 650, marginTop: 2 }}>
                    الفائدة: {rec.expectedBenefit} · {rec.durationHint}
                  </span>
                </span>
                <span className="shrink-0 rounded-full px-3 py-1.5" style={{ background: `${rec.accentColor}10`, border: `1px solid ${rec.accentColor}20`, color: rec.accentColor, fontSize: 10, fontWeight: 950 }}>
                  {rec.ctaLabel}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </ClinicalGlassCard>
  );
}

export function ReassessmentGlassCard({ vm, vis, on }: {
  vm: ResultViewModel;
  vis: DomainVisConfig;
  on: boolean;
}) {
  const handoff = vm.assessmentHandoff;
  const signalCount = handoff?.keyAnsweredSignals?.length ?? 0;
  const skippedCount = handoff?.skippedSections?.length ?? 0;

  return (
    <ClinicalGlassCard
      title="إعادة التقييم"
      subtitle="الخريطة أولية وقابلة للتحديث عندما يتغيّر النمط."
      icon={<RotateCcw style={{ width: 21, height: 21 }} />}
      color={vis.particleColor}
      on={on}
      delay={0.22}
      details={handoff && (
        <div className="grid gap-2 mt-1">
          <p style={{ fontSize: 10.5, fontWeight: 950, color: vis.textColor, marginBottom: 4 }}>ملخص رحلة التقييم</p>
          {signalCount > 0 && (
            <p className="rounded-[16px] px-3 py-2.5" style={{ background: `${vis.particleColor}08`, border: `1px solid ${vis.particleColor}16`, color: W.textSub, fontSize: 11.5, lineHeight: 1.7, fontWeight: 700 }}>
              ✅ أجبت عن {signalCount} إشارة أساسية — بينها: {handoff.keyAnsweredSignals.slice(0, 2).join('، ')}.
            </p>
          )}
          {skippedCount > 0 && (
            <p className="rounded-[16px] px-3 py-2.5" style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.14)', color: '#92400E', fontSize: 11.5, lineHeight: 1.7, fontWeight: 700 }}>
              ⏭️ تجاوزت {skippedCount} قسم: {handoff.skippedSections.slice(0, 2).join('، ')}.
            </p>
          )}
          {handoff.unknowns?.length > 0 && (
            <p className="rounded-[16px] px-3 py-2.5" style={{ background: 'rgba(100,116,139,0.07)', border: '1px solid rgba(100,116,139,0.15)', color: '#475569', fontSize: 11.5, lineHeight: 1.7, fontWeight: 700 }}>
              ❓ لم نتمكن من تحديد: {handoff.unknowns.slice(0, 2).join('، ')}.
            </p>
          )}
        </div>
      )}
      detailLabel="ماذا غطّى هذا التقييم"
    >
      <div className="grid gap-2">
        <p className="rounded-[20px] p-3.5" style={{ background: `${vis.particleColor}08`, border: `1px solid ${vis.particleColor}18`, color: W.textPrimary, fontSize: 12.2, lineHeight: 1.82, fontWeight: 760 }}>
          {vm.planHandoff?.reassessmentCondition || 'أعد التقييم إذا تغيّر النمط أو زادت الأعراض.'}
        </p>
        {vm.planHandoff?.revisitNote && (
          <p style={{ fontSize: 11.6, lineHeight: 1.75, color: W.textSub, fontWeight: 700 }}>
            {vm.planHandoff.revisitNote}
          </p>
        )}
        <Link
          href="/symptom-checker"
          className="mt-1 flex items-center justify-center gap-2 rounded-[20px] py-3"
          style={{ background: `linear-gradient(155deg, rgba(255,255,255,0.80), ${vis.particleColor}12)`, border: `1.5px solid ${vis.particleColor}20`, color: vis.textColor, fontSize: 13, fontWeight: 950, boxShadow: `0 8px 24px ${vis.particleColor}12` }}
        >
          <RotateCcw style={{ width: 14, height: 14 }} />
          ابدأ تقييماً جديداً
        </Link>
      </div>
    </ClinicalGlassCard>
  );
}

export function ResultActionDock({ session, vis, on }: {
  session: AssessmentSession;
  vis: DomainVisConfig;
  on: boolean;
}) {
  const vm = session.resultViewModel;
  const level = vm.refinedTriage?.level ?? vm.hero.triageLevel;
  const editHref = `/symptom-checker?edit=${encodeURIComponent(session.id)}`;

  // CTA logic — no emergency phone links
  const isLowConf = (vm.confidenceExplanation?.label ?? vm.confidencePhenotype?.confidenceBand) === 'low';
  const urgent = isSafetyFirst(level);
  const primaryLabel = urgent ? 'اطلب رعاية طبية' : isLowConf ? 'أكمل البيانات' : 'ابدأ خطتي';
  const primaryHref  = urgent ? '/book-appointment' : isLowConf ? editHref : '/my-plan';
  const primaryColor = urgent ? '#DC2626' : isLowConf ? '#D97706' : vis.particleColor;

  const hasNutrition = Boolean(vm.tayyibatVerdict) && !vm.safetySummary?.nutritionSuppressed;
  const secondaryActions = [
    { label: 'سجّل متابعة', href: '/quick-check-in', key: 'followup' },
    { label: 'عدّل الأعراض', href: editHref, key: 'edit' },
    ...(hasNutrition ? [{ label: 'سجّل وجباتك', href: '/tayyibat/tracker', key: 'meals' }] : []),
    ...(vm.planHandoff?.showBookingCta ? [{ label: 'احجز استشارة', href: '/book-appointment', key: 'booking' }] : []),
  ].slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={on ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.12, type: 'spring', stiffness: 240, damping: 26 }}
      className="sticky bottom-0 z-30 px-4 pt-3"
      style={{
        paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
        background: 'linear-gradient(180deg, rgba(232,248,251,0), rgba(232,248,251,0.88) 24%, rgba(232,248,251,0.98) 100%)',
        backdropFilter: 'blur(24px) saturate(175%)',
        WebkitBackdropFilter: 'blur(24px) saturate(175%)',
      }}
    >
      <div className="relative overflow-hidden rounded-[30px] p-3" style={{ background: 'linear-gradient(155deg, rgba(255,255,255,0.82), rgba(255,255,255,0.58))', border: '1.5px solid rgba(255,255,255,0.94)', boxShadow: `0 18px 52px ${primaryColor}18, inset 0 1.5px 0 rgba(255,255,255,0.96)` }}>
        <GlassSheen color={primaryColor} />
        <div className="relative z-10 grid gap-2">
          <Link
            href={primaryHref}
            onClick={() => {
              haptic.impact();
              trackEvent('assessment_result_primary_cta_clicked', { action: primaryLabel, session_id: session.id });
            }}
            className="flex items-center justify-center rounded-[23px] px-4 py-3.5"
            style={{ background: `linear-gradient(160deg, ${primaryColor}, ${primaryColor}D8)`, color: '#FFFFFF', boxShadow: `0 12px 30px ${primaryColor}30, inset 0 1px 0 rgba(255,255,255,0.28)`, fontSize: 15, fontWeight: 950, letterSpacing: '-0.01em' }}
          >
            {primaryLabel}
          </Link>
          <div className={`grid gap-2 ${secondaryActions.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {secondaryActions.map(action => (
              <Link
                key={action.key}
                href={action.href}
                onClick={() => {
                  haptic.tap();
                  trackEvent('assessment_result_secondary_cta_clicked', { action: action.key, session_id: session.id });
                }}
                className="flex items-center justify-center rounded-[19px] px-2 py-2.5 text-center"
                style={{ background: `${vis.particleColor}09`, border: `1px solid ${vis.particleColor}1A`, color: vis.textColor, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.62)', fontSize: 11, fontWeight: 880, lineHeight: 1.4 }}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ClinicalMapGlassSpine({ session, vis, on }: {
  session: AssessmentSession;
  vis: DomainVisConfig;
  on: boolean;
}) {
  const vm = session.resultViewModel;
  const labs = buildLabSuggestions(session);
  const nutritionSuppressed = vm.safetySummary?.nutritionSuppressed;
  const unknowns = (vm.confidenceExplanation?.missingData?.length
    ? vm.confidenceExplanation.missingData
    : vm.whatWeDoNotKnowYet ?? []).slice(0, 4);
  const level = vm.refinedTriage?.level ?? vm.hero.triageLevel;
  const safetyFirst = isSafetyFirst(level);
  const emergencyPhone = typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_EMERGENCY_PHONE?.trim()
    : undefined;

  return (
    <section id="clinical-map" className="px-4 pt-4 pb-2">
      <div className="mx-auto grid max-w-4xl gap-4">

        {/* ① Safety Priority Card — appears FIRST for urgent/emergency */}
        {safetyFirst && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={on ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: 0.02, type: 'spring', stiffness: 240, damping: 26 }}
            className="relative overflow-hidden rounded-[30px] p-5"
            style={{
              background: 'linear-gradient(155deg, rgba(255,255,255,0.88), rgba(254,243,199,0.75) 50%, rgba(217,119,6,0.18))',
              border: '1.5px solid rgba(217,119,6,0.30)',
              backdropFilter: 'blur(30px) saturate(170%)',
              WebkitBackdropFilter: 'blur(30px) saturate(170%)',
              boxShadow: '0 20px 56px rgba(217,119,6,0.14), 0 4px 16px rgba(12,74,110,0.06), inset 0 1.5px 0 rgba(255,255,255,0.96)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.78), transparent)' }} />
            <div className="relative z-10">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex shrink-0 items-center justify-center rounded-[18px]"
                  style={{ width: 46, height: 46, background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.28)', color: '#B45309' }}>
                  <span style={{ fontSize: 22 }}>⚕️</span>
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: 10, fontWeight: 900, color: '#B45309', letterSpacing: '0.08em', marginBottom: 4 }}>
                    أولوية سلامة
                  </p>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: '#78350F', lineHeight: 1.3 }}>
                    {level === 'emergency'
                      ? 'هذه الإشارات تستوجب تقييمًا طبيًا عاجلاً'
                      : 'يُنصح بمراجعة طبيب قبل أي بروتوكول منزلي'}
                  </h2>
                </div>
              </div>

              <p style={{ fontSize: 13, lineHeight: 1.85, color: '#92400E', fontWeight: 700, marginBottom: 16 }}>
                {emergencyPhone
                  ? `اتصل على ${emergencyPhone} أو توجه لأقرب مرفق صحي في حال الشعور بتدهور مفاجئ.`
                  : 'اتصل برقم الطوارئ المحلي في بلدك أو توجه لأقرب طوارئ فورًا في حال الشعور بتدهور.'}
              </p>

              <div className="grid gap-2 grid-cols-2">
                {emergencyPhone && (
                  <a href={`tel:${emergencyPhone}`}
                    className="flex items-center justify-center rounded-[19px] px-3 py-3"
                    style={{ background: 'linear-gradient(135deg, #B45309, #92400E)', color: '#fff', fontSize: 13, fontWeight: 950, boxShadow: '0 8px 20px rgba(180,83,9,0.30)' }}>
                    📞 اتصل الآن
                  </a>
                )}
                <Link href="/book-appointment"
                  className="flex items-center justify-center rounded-[19px] px-3 py-3"
                  style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(217,119,6,0.25)', color: '#B45309', fontSize: 13, fontWeight: 850, gridColumn: emergencyPhone ? 'auto' : '1 / -1' }}>
                  احجز استشارة
                </Link>
              </div>

              <p style={{ marginTop: 12, fontSize: 11, color: '#A16207', lineHeight: 1.65, fontWeight: 550 }}>
                الخريطة أدناه تبقى متاحة لفهم الصورة — لكن السلامة تأتي أولاً.
              </p>
            </div>
          </motion.div>
        )}

        <ClinicalMapHeroCard session={session} vis={vis} on={on} />
        <KeySignalsGlassCard session={session} vis={vis} on={on} />
        <WhyThisReadingCard vm={vm} vis={vis} on={on} />
        <ConfidenceGlassCard vm={vm} vis={vis} on={on} />
        <UnknownsGlassCard items={unknowns} vis={vis} on={on} />
        <DomainCompassGlassCard vm={vm} vis={vis} on={on} />
        <NutritionRhythmGlassCard
          data={vm.tayyibatVerdict}
          vis={vis}
          on={on}
          suppressed={nutritionSuppressed}
          recommendedAction={vm.safetySummary?.recommendedAction}
          session={session}
        />
        <LabsToDiscussCard labs={labs} on={on} />
        <PracticalPlanGlassCard vm={vm} on={on} />
        <ToolsPriorityGlassCard groups={vm.recommendationGroups} vis={vis} on={on} />
        <ReassessmentGlassCard vm={vm} vis={vis} on={on} />
      </div>
    </section>
  );
}
