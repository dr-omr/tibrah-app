// pages/assessment-result.tsx
// ════════════════════════════════════════════════════════════════
// Tibrah — Native-grade Mobile Assessment Result Page
// Scroll-aware header · Progress bar · Story chapters · Action dock
// ════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRight, HeartPulse, Sparkles } from 'lucide-react';
import {
  getLatestSession,
  getSessionById,
  touchSession,
  type AssessmentSession,
} from '@/lib/assessment-session-store';
import { trackEvent } from '@/lib/analytics';
import { haptic } from '@/lib/HapticFeedback';
import { ResultStoryFlow } from '@/components/health-engine/result/story';
import {
  DOMAIN_VIS,
  PAGE_BG_RESULT,
  W,
} from '@/components/health-engine/result/shared/design-tokens';

/* ── Constants ─────────────────────────────────────────── */

const ARABIC_FONT =
  'var(--font-alexandria), Alexandria, "IBM Plex Sans Arabic", "Noto Kufi Arabic", system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

const HEADER_SAFE_TOP = 'env(safe-area-inset-top, 0px)';
const BOTTOM_SAFE    = 'env(safe-area-inset-bottom, 0px)';

/* ── Loading skeleton ──────────────────────────────────── */

function LoadingView() {
  return (
    <div
      dir="rtl"
      className="flex min-h-[100svh] items-center justify-center px-6"
      style={{ background: PAGE_BG_RESULT, fontFamily: ARABIC_FONT }}
    >
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-5 flex h-[88px] w-[88px] items-center justify-center rounded-full"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(186,230,253,0.60))',
            border: '1.5px solid rgba(255,255,255,0.96)',
            boxShadow: '0 20px 56px rgba(8,145,178,0.18), inset 0 2px 0 rgba(255,255,255,0.98)',
          }}
        >
          <HeartPulse style={{ width: 32, height: 32, color: '#0891B2' }} />
        </motion.div>
        <p style={{ color: W.textPrimary, fontSize: 16, fontWeight: 950, fontFamily: ARABIC_FONT }}>
          نرتب قصة نتيجتك
        </p>
        <p style={{ color: W.textSub, fontSize: 12.5, marginTop: 8, fontFamily: ARABIC_FONT }}>
          لحظة واحدة فقط…
        </p>
        {/* Pulse dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay }}
              className="rounded-full"
              style={{ width: 7, height: 7, background: '#0891B2' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────── */

function EmptyView() {
  const router = useRouter();
  return (
    <div
      dir="rtl"
      className="flex min-h-[100svh] items-center justify-center px-5"
      style={{ background: PAGE_BG_RESULT, fontFamily: ARABIC_FONT }}
    >
      <Head>
        <title>نتيجة التقييم - طِبرا</title>
      </Head>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
        className="w-full max-w-sm rounded-[34px] p-7 text-center"
        style={{
          background: 'linear-gradient(155deg, rgba(255,255,255,0.94), rgba(255,255,255,0.72))',
          border: '1.5px solid rgba(255,255,255,0.96)',
          backdropFilter: 'blur(32px) saturate(175%)',
          WebkitBackdropFilter: 'blur(32px) saturate(175%)',
          boxShadow: '0 24px 64px rgba(8,145,178,0.14), inset 0 2px 0 rgba(255,255,255,0.98)',
        }}
      >
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'rgba(8,145,178,0.10)', border: '1px solid rgba(8,145,178,0.20)' }}
        >
          <Sparkles style={{ width: 28, height: 28, color: '#0891B2' }} />
        </div>
        <h1 style={{ color: W.textPrimary, fontSize: 22, fontWeight: 950, fontFamily: ARABIC_FONT }}>
          لا توجد نتيجة محفوظة
        </h1>
        <p style={{ color: W.textSub, fontSize: 13.5, lineHeight: 1.85, marginTop: 10, fontFamily: ARABIC_FONT }}>
          ابدأ التقييم حتى يبني طِبرا ملخصاً واضحاً لحالتك وخطوتك التالية.
        </p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => { haptic.impact(); router.push('/symptom-checker'); }}
          className="mt-6 flex min-h-[54px] w-full items-center justify-center rounded-[22px]"
          style={{
            background: 'linear-gradient(135deg, #0891B2, #0E7490)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 950,
            fontFamily: ARABIC_FONT,
            boxShadow: '0 14px 36px rgba(8,145,178,0.28)',
          }}
        >
          ابدأ التقييم
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ── Native sticky header ───────────────────────────────── */

function NativeHeader({
  session,
  scrolled,
  scrollProgress,
  vis,
}: {
  session: AssessmentSession;
  scrolled: boolean;
  scrollProgress: number;
  vis: { particleColor: string; textColor: string };
}) {
  const router = useRouter();
  const story = session.resultViewModel.resultStory;
  const label = story?.primaryAction.label ?? 'نتيجة التقييم';

  return (
    <>
      {/* Scroll progress line */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-x-0 top-0 z-50"
          >
            <motion.div
              style={{
                height: 2.5,
                width: `${scrollProgress * 100}%`,
                background: `linear-gradient(90deg, ${vis.particleColor}, ${vis.particleColor}80)`,
                boxShadow: `0 0 12px ${vis.particleColor}50`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <motion.header
        dir="rtl"
        className="fixed inset-x-0 top-0 z-40"
        style={{
          fontFamily: ARABIC_FONT,
          paddingTop: `calc(${HEADER_SAFE_TOP} + ${scrolled ? '10px' : '38px'})`,
          paddingBottom: scrolled ? 10 : 12,
          paddingLeft: 14,
          paddingRight: 14,
          background: scrolled ? 'rgba(228,246,252,0.90)' : 'transparent',
          backdropFilter: scrolled ? 'blur(30px) saturate(185%)' : 'blur(0px)',
          WebkitBackdropFilter: scrolled ? 'blur(30px) saturate(185%)' : 'blur(0px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.60)' : '1px solid transparent',
          transition: 'padding-top 0.22s ease, background 0.22s ease, border-color 0.22s ease',
          boxShadow: scrolled ? '0 4px 24px rgba(8,145,178,0.06)' : 'none',
        }}
      >
        <div className="mx-auto flex max-w-[620px] items-center gap-3">
          {/* Back button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => { haptic.selection(); router.back(); }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{
              background: 'rgba(255,255,255,0.76)',
              border: '1px solid rgba(255,255,255,0.90)',
              boxShadow: `0 8px 24px rgba(8,145,178,0.10), inset 0 1.5px 0 rgba(255,255,255,0.96)`,
            }}
            aria-label="رجوع"
          >
            <ArrowRight style={{ width: 18, height: 18, color: W.textSub }} />
          </motion.button>

          {/* Title (slides in on scroll) */}
          <AnimatePresence initial={false}>
            {scrolled && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
                className="min-w-0 flex-1"
              >
                <p style={{ color: W.textPrimary, fontSize: 14, fontWeight: 950, lineHeight: 1.25, fontFamily: ARABIC_FONT }}>
                  ملخص حالتك
                </p>
                <p className="truncate" style={{ color: W.textSub, fontSize: 10.5, fontWeight: 750, marginTop: 2, fontFamily: ARABIC_FONT }}>
                  {label}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date badge */}
          <div
            className="mr-auto shrink-0 rounded-full px-3 py-1.5"
            style={{
              background: 'rgba(255,255,255,0.64)',
              border: '1px solid rgba(255,255,255,0.82)',
              color: W.textSub,
              fontSize: 10.5,
              fontWeight: 850,
              fontFamily: ARABIC_FONT,
            }}
          >
            {new Date(session.createdAt).toLocaleDateString('ar', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      </motion.header>
    </>
  );
}

/* ── Main page ──────────────────────────────────────────── */

export default function AssessmentResultPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const [session, setSession]             = useState<AssessmentSession | null>(null);
  const [loading, setLoading]             = useState(true);
  const [on, setOn]                       = useState(false);
  const [scrolled, setScrolled]           = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  /* Load session */
  useEffect(() => {
    if (!router.isReady) return;

    const id    = router.query.id as string | undefined;
    const found = id ? getSessionById(id) : getLatestSession();

    if (found) {
      setSession(found);
      touchSession(found.id);
      trackEvent('assessment_result_reopened', {
        session_id: found.id,
        from: id ? 'direct_link' : 'latest',
      });

      if (router.query.animate === '1') {
        setTimeout(() => {
          setOn(true);
          haptic.trigger('heavy');

          if (!reducedMotion) {
            const level = found.resultViewModel?.hero?.triageLevel ?? found.triageResult?.level;
            if (level === 'manageable' || level === 'review') {
              const domainId = (found.resultViewModel?.domainId ?? 'jasadi') as keyof typeof DOMAIN_VIS;
              const vis = DOMAIN_VIS[domainId] ?? DOMAIN_VIS.jasadi;
              confetti({
                particleCount: 80,
                spread: 62,
                origin: { y: 0.72 },
                colors: [vis.particleColor, '#22D3EE', '#ffffff', '#BAE6FD'],
                disableForReducedMotion: true,
                zIndex: 100,
              });
            }
          }
        }, 180);
      } else {
        setOn(true);
      }
    }

    setLoading(false);
  }, [router.isReady, router.query.id, router.query.animate, reducedMotion]);

  /* Scroll listener — passive, optimised */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y    = window.scrollY;
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        setScrolled(y > 60);
        setScrollProgress(docH > 0 ? Math.min(y / docH, 1) : 0);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Render ── */

  if (loading) return <LoadingView />;
  if (!session || !session.resultViewModel) return <EmptyView />;

  const domainId = (
    session.resultViewModel.domainId ??
    session.resultViewModel.hero?.domainId ??
    'jasadi'
  ) as keyof typeof DOMAIN_VIS;
  const vis = DOMAIN_VIS[domainId] ?? DOMAIN_VIS.jasadi;

  return (
    <div
      dir="rtl"
      style={{
        background: PAGE_BG_RESULT,
        minHeight: '100svh',
        fontFamily: ARABIC_FONT,
        overscrollBehavior: 'none',
      } as React.CSSProperties}
    >
      <Head>
        <title>ملخص حالتك - طِبرا</title>
        <meta
          name="description"
          content="قصة نتيجة التقييم الصحي من طِبرا: ما فهمناه، لماذا ظهر، وما خطوتك الآن."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#E8F8FB" />
      </Head>

      <NativeHeader
        session={session}
        scrolled={scrolled}
        scrollProgress={scrollProgress}
        vis={vis}
      />

      <ResultStoryFlow session={session} vis={vis} on={on} />
    </div>
  );
}
