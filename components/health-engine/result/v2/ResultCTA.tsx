// components/health-engine/result/v2/ResultCTA.tsx
// ═══════════════════════════════════════════════════════════════
// TIBRAH v12 — ULTRA-RICH CTA Section
// Plan handoff · My Plan button · Edit/Restart · Disclaimer
// Maximum glass layers, shimmer sweeps, animated icon boxes
// ═══════════════════════════════════════════════════════════════
'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, Edit3, RefreshCw, Star, Sparkles, AlertCircle } from 'lucide-react';
import type { DomainVisConfig } from '../shared/design-tokens';
import { W } from '../shared/design-tokens';
import { haptic } from '@/lib/HapticFeedback';
import { trackEvent } from '@/lib/analytics';

interface Props {
  vis: DomainVisConfig;
  sessionId: string;
  planHandoffText?: string;
  revisitNote?: string;
  reassessmentCondition?: string;
  showBookingCta?: boolean;
  on: boolean;
}

export function ResultCTA({ vis, sessionId, planHandoffText, revisitNote, reassessmentCondition, showBookingCta, on }: Props) {
  const C = vis.particleColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={on ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.06, type: 'spring', stiffness: 240, damping: 28 }}
      className="mx-4">

      {/* ═══ Plan Handoff Narrative ═══ */}
      {planHandoffText && (
        <div className="mb-6 rounded-[28px] p-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(160deg, rgba(255,255,255,0.78) 0%, ${C}06 50%, rgba(255,255,255,0.50) 100%)`,
            border: '1.5px solid rgba(255,255,255,0.90)',
            backdropFilter: 'blur(30px) saturate(160%)',
            boxShadow: `0 8px 36px ${C}08, 0 2px 10px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.95)`,
          }}>
          {/* Sheen */}
          <div className="absolute inset-x-0 top-0 pointer-events-none"
            style={{ height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, transparent 100%)', borderRadius: '28px 28px 0 0' }} />
          {/* Top accent */}
          <div className="absolute top-0 left-[12%] right-[12%] h-[3px] rounded-b-full pointer-events-none"
            style={{ background: `linear-gradient(90deg, ${C}30, ${C}90, ${C}30)`, boxShadow: `0 2px 10px ${C}30` }} />
          {/* Shimmer */}
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%)' }}
            animate={{ x: ['-120%', '200%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 3 }}
          />
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-9 h-9 rounded-[12px] flex items-center justify-center relative overflow-hidden flex-shrink-0"
                style={{ background: `${C}12`, border: `1.5px solid rgba(255,255,255,0.90)`, boxShadow: `0 4px 16px ${C}18, inset 0 1.5px 0 rgba(255,255,255,0.95)` }}>
                <div className="absolute inset-x-0 top-0 h-[48%]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 100%)', borderRadius: '10px 10px 0 0' }} />
                <Sparkles style={{ width: 15, height: 15, color: C, position: 'relative', zIndex: 1 }} />
              </motion.div>
              <p style={{ fontSize: 10, fontWeight: 900, color: vis.textColor, textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                ✦ خلاصة طِبرَا لك
              </p>
            </div>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: W.textPrimary, lineHeight: 1.9 }}>
              {planHandoffText}
            </p>
          </div>
        </div>
      )}

      {/* ═══ Section Divider ═══ */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${C}28)` }} />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ background: `${C}08`, border: `1px solid ${C}15` }}>
          <Star style={{ width: 9, height: 9, color: C }} />
          <p style={{ fontSize: 9.5, fontWeight: 900, color: W.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            خطوتك التالية
          </p>
        </div>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${C}28)` }} />
      </div>

      {/* ═══ Primary CTA: My Plan ═══ */}
      <Link href="/my-plan"
        onClick={() => { haptic.impact(); trackEvent('result_return_clicked', { session_id: sessionId, destination: 'my_plan' }); }}>
        <motion.div
          whileTap={{ scale: 0.97, y: 1 }}
          className="relative overflow-hidden rounded-[28px] flex items-center gap-4 px-6 mb-4 cursor-pointer"
          style={{
            height: 74,
            background: `linear-gradient(160deg, rgba(255,255,255,0.92) 0%, ${C}16 45%, ${C}10 100%)`,
            border: '1.5px solid rgba(255,255,255,0.94)',
            backdropFilter: 'blur(26px)',
            boxShadow: `0 14px 48px ${vis.glow}, 0 4px 0 rgba(255,255,255,0.97) inset, 0 2px 10px rgba(0,0,0,0.04)`,
          }}>
          {/* Sheen */}
          <div className="absolute inset-x-0 top-0 h-[52%] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.80) 0%, transparent 100%)', borderRadius: '28px 28px 0 0' }} />
          {/* Specular */}
          <div className="absolute pointer-events-none"
            style={{ top: '14%', left: '22%', width: 50, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.50)', filter: 'blur(9px)' }} />
          {/* Shimmer sweep */}
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.30) 50%, transparent 70%)' }}
            animate={{ x: ['-150%', '250%'] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', delay: 1 }}
          />

          {/* Icon box */}
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex-shrink-0 w-12 h-12 rounded-[16px] flex items-center justify-center relative overflow-hidden"
            style={{
              background: `linear-gradient(145deg, rgba(255,255,255,0.90) 0%, ${C}16 100%)`,
              border: '1.5px solid rgba(255,255,255,0.92)',
              boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.95), 0 5px 20px ${C}18`,
              position: 'relative', zIndex: 1,
            }}>
            <div className="absolute inset-x-0 top-0 h-[48%]"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)', borderRadius: '14px 14px 0 0' }} />
            <FileText style={{ width: 18, height: 18, color: vis.textColor, position: 'relative', zIndex: 1 }} />
          </motion.div>

          {/* Text */}
          <div className="flex-1 text-right" style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 17, fontWeight: 900, color: W.textPrimary, lineHeight: 1.2 }}>خطّتي العلاجية</p>
            <p style={{ fontSize: 11, color: vis.textColor, fontWeight: 650 }}>عرض أدواتك المخصصة والمتابعة اليومية</p>
          </div>

          {/* Star */}
          <motion.div
            animate={{ rotate: [0, 15, 0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
            <Star style={{ width: 16, height: 16, color: vis.textColor }} />
          </motion.div>
        </motion.div>
      </Link>

      {/* ═══ Secondary CTAs ═══ */}
      <div className="flex gap-3 mb-5">
        {[
          {
            href: `/symptom-checker?edit=${sessionId}`,
            icon: Edit3, label: 'تعديل الأعراض', iconColor: vis.textColor,
            onClick: () => { haptic.selection(); trackEvent('symptoms_edited_from_result', { session_id: sessionId }); },
          },
          {
            href: '/symptom-checker',
            icon: RefreshCw, label: 'تحليل جديد', iconColor: W.textMuted,
            onClick: () => haptic.selection(),
          },
        ].map(({ href, icon: Icon, label, iconColor, onClick }, i) => (
          <Link key={i} href={href} className="flex-1" onClick={onClick}>
            <motion.div whileTap={{ scale: 0.96 }}
              className="flex items-center justify-center gap-2 py-4 rounded-[22px] relative overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.50) 100%)',
                border: '1.5px solid rgba(255,255,255,0.90)',
                backdropFilter: 'blur(22px)',
                boxShadow: '0 4px 20px rgba(8,145,178,0.06), inset 0 1.5px 0 rgba(255,255,255,0.92)',
              }}>
              <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.68) 0%, transparent 100%)', borderRadius: '22px 22px 0 0' }} />
              <Icon style={{ width: 14, height: 14, color: iconColor, position: 'relative', zIndex: 1 }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: W.textSub, position: 'relative', zIndex: 1 }}>{label}</span>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* ═══ Disclaimer ═══ */}
      <div className="flex items-start gap-3 rounded-[22px] p-5 relative overflow-hidden mb-6"
        style={{
          background: 'linear-gradient(160deg, rgba(254,243,199,0.72) 0%, rgba(254,243,199,0.50) 100%)',
          border: '1px solid rgba(251,191,36,0.28)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 4px 18px rgba(251,191,36,0.08), inset 0 1px 0 rgba(255,255,255,0.55)',
        }}>
        <div className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)', borderRadius: '22px 22px 0 0' }} />
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
          style={{ background: 'rgba(251,191,36,0.15)', border: '1.5px solid rgba(251,191,36,0.28)' }}>
          <div className="absolute inset-x-0 top-0 h-[48%]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)' }} />
          <AlertCircle style={{ width: 16, height: 16, color: '#92400E', position: 'relative', zIndex: 1 }} />
        </div>
        <p style={{ fontSize: 11.5, color: '#92400E', lineHeight: 1.75, fontWeight: 500, position: 'relative', zIndex: 1 }}>
          هذا التحليل استرشادي طبي ولا يُغني عن استشارة الطبيب. في الحالات الطارئة التي تهدد الحياة، اتصل بالإسعاف فوراً.
        </p>
      </div>

      {/* ═══ Revisit & Reassessment Info ═══ */}
      {(revisitNote || reassessmentCondition) && (
        <div className="flex gap-3 mb-5">
          {revisitNote && (
            <div className="flex-1 rounded-[20px] p-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(240,249,255,0.80) 0%, rgba(255,255,255,0.55) 100%)',
                border: '1px solid rgba(8,145,178,0.15)',
                backdropFilter: 'blur(18px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.70)',
              }}>
              <div className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%)', borderRadius: '20px 20px 0 0' }} />
              <p style={{ fontSize: 8, fontWeight: 900, color: '#0891B2', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 5, position: 'relative', zIndex: 1 }}>
                🗓️ موعد إعادة التقييم
              </p>
              <p style={{ fontSize: 11, fontWeight: 550, color: '#374151', lineHeight: 1.65, position: 'relative', zIndex: 1 }}>
                {revisitNote}
              </p>
            </div>
          )}
          {reassessmentCondition && (
            <div className="flex-1 rounded-[20px] p-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(254,243,199,0.60) 0%, rgba(255,255,255,0.55) 100%)',
                border: '1px solid rgba(245,158,11,0.18)',
                backdropFilter: 'blur(18px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.70)',
              }}>
              <div className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%)', borderRadius: '20px 20px 0 0' }} />
              <p style={{ fontSize: 8, fontWeight: 900, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 5, position: 'relative', zIndex: 1 }}>
                ⚠️ أعد التقييم إذا
              </p>
              <p style={{ fontSize: 11, fontWeight: 550, color: '#374151', lineHeight: 1.65, position: 'relative', zIndex: 1 }}>
                {reassessmentCondition}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Booking CTA ═══ */}
      {showBookingCta && (
        <Link href="/booking"
          onClick={() => { haptic.impact(); trackEvent('booking_from_result', { session_id: sessionId }); }}>
          <motion.div whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-3 py-4 rounded-[22px] mb-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(220,38,38,0.06) 0%, rgba(255,255,255,0.70) 100%)',
              border: '1.5px solid rgba(220,38,38,0.18)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 20px rgba(220,38,38,0.08), inset 0 1.5px 0 rgba(255,255,255,0.85)',
            }}>
            <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)', borderRadius: '22px 22px 0 0' }} />
            <span style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>🏥</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#991B1B', position: 'relative', zIndex: 1 }}>احجز موعد مع طبيب</span>
          </motion.div>
        </Link>
      )}

      {/* ═══ Footer Watermark ═══ */}
      <div className="flex items-center justify-center gap-2 pb-6">
        <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${C}18)` }} />
        <p style={{ fontSize: 8, fontWeight: 800, color: W.textMuted, letterSpacing: '0.20em', textTransform: 'uppercase' }}>
          طِبرَا · محرك الرعاية الذكي © ٢٠٢٥
        </p>
        <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${C}18)` }} />
      </div>
    </motion.div>
  );
}
