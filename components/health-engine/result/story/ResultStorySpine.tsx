'use client';

// components/health-engine/result/story/ResultStorySpine.tsx
// ═══════════════════════════════════════════════════════════════
// Flowing story spine — no cards, just continuous narrative
// Each chapter = label + title + flowing content
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Compass,
  HeartPulse,
  Leaf,
  Lightbulb,
  ListChecks,
  ShieldCheck,
} from 'lucide-react';
import type { ResultStory, ResultStoryAction } from '@/components/health-engine/types';
import type { DomainVisConfig } from '@/components/health-engine/result/shared/design-tokens';
import { haptic } from '@/lib/HapticFeedback';

const ARABIC_FONT =
  'var(--font-alexandria), Alexandria, "IBM Plex Sans Arabic", "Noto Kufi Arabic", system-ui, sans-serif';

const C = {
  ink:   '#06364B',
  sub:   '#176C84',
  muted: '#5A8FA0',
  faint: '#A8C8D4',
  line:  'rgba(14,116,144,0.14)',
};

function actionHref(action?: ResultStoryAction, fallback = '/my-plan') {
  return action?.href || fallback;
}

/* ── Divider ─────────────────────────────────────────────── */

function SpineDivider({ color }: { color: string }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: `${color}50` }} />
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />
    </div>
  );
}

/* ── Section header ──────────────────────────────────────── */

function SpineSection({
  index,
  icon,
  label,
  title,
  color,
  children,
  on = true,
}: {
  index: number;
  icon: React.ReactNode;
  label: string;
  title: string;
  color: string;
  textColor: string;
  children: React.ReactNode;
  on?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={on ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 240, damping: 28 }}
      dir="rtl"
      style={{ fontFamily: ARABIC_FONT }}
    >
      {/* Section label row */}
      <div className="flex items-center gap-2.5 mb-3">
        {/* Number dot */}
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: color, fontSize: 10.5, fontWeight: 950 }}
        >
          {index}
        </div>
        {/* Icon */}
        <div style={{ color, opacity: 0.75 }}>{icon}</div>
        {/* Label */}
        <span
          className="rounded-full px-2.5 py-0.5"
          style={{
            background: `${color}12`,
            color,
            fontSize: 10,
            fontWeight: 950,
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
      </div>

      {/* Title */}
      <h2
        style={{
          color: C.ink,
          fontSize: 18,
          fontWeight: 950,
          lineHeight: 1.55,
          marginBottom: 12,
          fontFamily: ARABIC_FONT,
        }}
      >
        {title}
      </h2>

      {/* Content */}
      <div style={{ paddingRight: 8 }}>{children}</div>
    </motion.div>
  );
}

/* ── Body text ───────────────────────────────────────────── */

function BodyText({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        color: C.sub,
        fontSize: 14,
        lineHeight: 1.90,
        fontWeight: 700,
        fontFamily: ARABIC_FONT,
      }}
    >
      {children}
    </p>
  );
}

/* ── Inline pill list ────────────────────────────────────── */

function PillRow({ items, color }: { items: string[]; color: string }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {items.map((item, i) => (
        <span
          key={i}
          className="rounded-full px-3 py-1.5"
          style={{
            background: `${color}0E`,
            border: `1px solid ${color}1C`,
            color: C.ink,
            fontSize: 12,
            fontWeight: 850,
            fontFamily: ARABIC_FONT,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/* ── Timeline row ────────────────────────────────────────── */

function TimelineRow({ label, value, meaning, color }: { label: string; value: string; meaning?: string; color: string }) {
  return (
    <div
      className="rounded-[18px] p-3.5 mb-2"
      style={{ background: `${color}08`, border: `1px solid ${color}16` }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span style={{ color, fontSize: 10, fontWeight: 950, fontFamily: ARABIC_FONT }}>{label}</span>
        <span style={{ color: C.ink, fontSize: 13, fontWeight: 900, fontFamily: ARABIC_FONT }}>{value}</span>
      </div>
      {meaning && (
        <p style={{ color: C.muted, fontSize: 11.5, lineHeight: 1.65, fontWeight: 650, fontFamily: ARABIC_FONT }}>{meaning}</p>
      )}
    </div>
  );
}

/* ── Action link ─────────────────────────────────────────── */

function SpineAction({ action, color }: { action: ResultStoryAction; color: string }) {
  return (
    <Link href={actionHref(action)} onClick={() => haptic.impact()} className="block mt-4">
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="flex min-h-[56px] items-center justify-between rounded-[22px] px-4 py-3"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}C8)`,
          color: '#fff',
          boxShadow: `0 12px 32px ${color}26, inset 0 1.5px 0 rgba(255,255,255,0.26)`,
        }}
      >
        <div className="min-w-0 flex-1">
          <p style={{ fontSize: 14.5, fontWeight: 950, fontFamily: ARABIC_FONT }}>{action.label}</p>
          {action.reason && (
            <p className="line-clamp-2 mt-1" style={{ fontSize: 11, opacity: 0.88, fontWeight: 620, lineHeight: 1.5, fontFamily: ARABIC_FONT }}>
              {action.reason}
            </p>
          )}
        </div>
        <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }}>
          <ArrowLeft style={{ width: 15, height: 15 }} />
        </div>
      </motion.div>
    </Link>
  );
}

/* ── Seek care row ───────────────────────────────────────── */

function SeekCareRow({ text, color }: { text: string; color: string }) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-[16px] p-3 mb-2"
      style={{ background: `${color}0A`, border: `1px solid ${color}18` }}
    >
      <ShieldCheck style={{ width: 14, height: 14, color, flexShrink: 0, marginTop: 2 }} />
      <p style={{ color: C.sub, fontSize: 12.5, lineHeight: 1.7, fontWeight: 700, fontFamily: ARABIC_FONT }}>{text}</p>
    </div>
  );
}

/* ── Main Story Spine ────────────────────────────────────── */

export function ResultStorySpine({
  story,
  vis,
  on = true,
}: {
  story: ResultStory;
  vis: DomainVisConfig;
  on?: boolean;
}) {
  const color = vis.particleColor;
  const textColor = vis.textColor;

  return (
    <div
      dir="rtl"
      className="px-1"
      style={{ fontFamily: ARABIC_FONT }}
    >

      {/* ── Chapter 1: What you said ── */}
      <SpineSection index={1} icon={<BookOpen style={{ width: 14, height: 14 }} />} label="ما قلته" title={story.chiefComplaintStory ? 'هذا ما بدأنا منه' : 'شكواك الأساسية'} color={color} textColor={textColor} on={on}>
        {story.chiefComplaintStory && <BodyText>{story.chiefComplaintStory}</BodyText>}
        {story.hopiTimeline && story.hopiTimeline.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {story.hopiTimeline.slice(0, 4).map((item, i) => (
              <TimelineRow key={i} label={item.label} value={item.value} meaning={item.meaning} color={color} />
            ))}
          </div>
        )}
        {story.topSignals && story.topSignals.length > 0 && (
          <PillRow items={story.topSignals.filter(s => s.value && s.value !== 'غير واضح').slice(0, 4).map(s => `${s.label}: ${s.value}`)} color={color} />
        )}
      </SpineSection>

      <SpineDivider color={color} />

      {/* ── Chapter 2: How we connected ── */}
      <SpineSection index={2} icon={<Compass style={{ width: 14, height: 14 }} />} label="كيف ربطنا الإشارات" title="منطق القراءة" color={color} textColor={textColor} on={on}>
        {story.reasoningNarrative && story.reasoningNarrative.length > 0 ? (
          <div className="space-y-3">
            {story.reasoningNarrative.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${color}14`, color, fontSize: 9.5, fontWeight: 950 }}
                >
                  {i + 1}
                </div>
                <p style={{ color: C.sub, fontSize: 13.5, lineHeight: 1.80, fontWeight: 700, fontFamily: ARABIC_FONT }}>{step}</p>
              </div>
            ))}
          </div>
        ) : (
          <BodyText>ربطنا شدة الأعراض، مدتها، والتاريخ الشخصي لنبني قراءة أولية.</BodyText>
        )}
      </SpineSection>

      <SpineDivider color={color} />

      {/* ── Chapter 3: Clarity of reading ── */}
      <SpineSection index={3} icon={<Lightbulb style={{ width: 14, height: 14 }} />} label="وضوح القراءة" title={`وضوح النتيجة: ${story.clarityNarrative?.label ?? 'متوسط'}`} color={color} textColor={textColor} on={on}>
        <BodyText>{story.clarityNarrative?.sentence ?? 'القراءة مبنية على البيانات المتاحة.'}</BodyText>
        {story.clarityNarrative?.missing && story.clarityNarrative.missing.length > 0 && (
          <>
            <p style={{ color: C.muted, fontSize: 10.5, fontWeight: 900, marginTop: 12, marginBottom: 6, fontFamily: ARABIC_FONT }}>
              ما لم يكتمل بعد
            </p>
            <PillRow items={story.clarityNarrative.missing.slice(0, 5)} color={color} />
          </>
        )}
        {story.clarityNarrative?.improveAction && (
          <SpineAction action={story.clarityNarrative.improveAction} color={color} />
        )}
      </SpineSection>

      <SpineDivider color={color} />

      {/* ── Chapter 4: Influencing factors ── */}
      {story.influencingFactors && story.influencingFactors.length > 0 && (
        <>
          <SpineSection index={4} icon={<Leaf style={{ width: 14, height: 14 }} />} label="العوامل المؤثرة" title="ما قد يؤثر على القراءة" color={color} textColor={textColor} on={on}>
            <div className="space-y-2">
              {story.influencingFactors.map((factor, i) => (
                <div
                  key={i}
                  className="rounded-[16px] p-3.5"
                  style={{ background: `${color}09`, border: `1px solid ${color}16` }}
                >
                  <p style={{ color: C.ink, fontSize: 13, fontWeight: 900, marginBottom: 3, fontFamily: ARABIC_FONT }}>
                    {factor.name}
                  </p>
                  {factor.impact && (
                    <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.65, fontFamily: ARABIC_FONT }}>{factor.impact}</p>
                  )}
                </div>
              ))}
            </div>
          </SpineSection>
          <SpineDivider color={color} />
        </>
      )}

      {/* ── Chapter 5: Today's plan ── */}
      <SpineSection
        index={story.influencingFactors && story.influencingFactors.length > 0 ? 5 : 4}
        icon={<ListChecks style={{ width: 14, height: 14 }} />}
        label="خطوتك اليوم"
        title="ماذا تفعل الآن"
        color={color}
        textColor={textColor}
        on={on}
      >
        {story.todayPlan && <BodyText>{story.todayPlan}</BodyText>}
        {story.weekPlan && story.weekPlan.length > 0 && (
          <div className="mt-4 space-y-2">
            {story.weekPlan.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 style={{ width: 14, height: 14, color, marginTop: 3, flexShrink: 0 }} />
                <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.70, fontWeight: 750, fontFamily: ARABIC_FONT }}>
                  {typeof item === 'string' ? item : item.label ?? item.body ?? ''}
                </p>
              </div>
            ))}
          </div>
        )}
        <SpineAction action={story.primaryAction} color={color} />
      </SpineSection>

      <SpineDivider color={color} />

      {/* ── Chapter 6: Follow-up ── */}
      <SpineSection
        index={story.influencingFactors && story.influencingFactors.length > 0 ? 6 : 5}
        icon={<CalendarClock style={{ width: 14, height: 14 }} />}
        label="المتابعة"
        title="متى تعود وتقيّم"
        color={color}
        textColor={textColor}
        on={on}
      >
        {story.reassessment && <BodyText>{story.reassessment}</BodyText>}
        {story.seekCareIf && story.seekCareIf.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <p style={{ color: C.muted, fontSize: 10.5, fontWeight: 900, marginBottom: 8, fontFamily: ARABIC_FONT }}>
              توجّه للطبيب إذا
            </p>
            {story.seekCareIf.filter(Boolean).slice(0, 4).map((text, i) => (
              <SeekCareRow key={i} text={text} color={color} />
            ))}
          </div>
        )}
      </SpineSection>

    </div>
  );
}
