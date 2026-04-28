// components/health-engine/result/v2/ResultActionPlan.tsx
// ═══════════════════════════════════════════════════════════════
// TIBRAH v12 — ULTRA-RICH Action Plan
// Today action + Monitor checklist + Seek care + Consistency
// Layered glass, animated icon orbs, accent bars, staggered flow
// ═══════════════════════════════════════════════════════════════
'use client';
import { motion } from 'framer-motion';
import { Zap, Eye, AlertTriangle, RefreshCw, CheckCircle, Sparkles } from 'lucide-react';
import type {
  ResultActionBlock,
  ResultMonitoringBlock,
  ResultEscalationBlock,
  ConsistencyNoteBlock,
} from '../../types';
import type { DomainVisConfig } from '../shared/design-tokens';
import { W } from '../shared/design-tokens';

interface Props {
  todayAction: ResultActionBlock;
  monitoring: ResultMonitoringBlock;
  seekCare: ResultEscalationBlock;
  consistencyNote?: ConsistencyNoteBlock;
  vis: DomainVisConfig;
  on: boolean;
}

/* ── Plan card — glass with accent bar ───────────────── */
function PlanCard({ children, delay, on, accentColor, accentPos = 'right' }: {
  children: React.ReactNode; delay: number; on: boolean;
  accentColor: string; accentPos?: 'right' | 'top';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={on ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, type: 'spring', stiffness: 240, damping: 28 }}
      className="relative overflow-hidden mx-4 mb-4"
      style={{
        borderRadius: 26,
        background: `linear-gradient(160deg, rgba(255,255,255,0.78) 0%, ${accentColor}04 50%, rgba(255,255,255,0.45) 100%)`,
        border: '1.5px solid rgba(255,255,255,0.90)',
        backdropFilter: 'blur(30px) saturate(160%)',
        boxShadow: `0 6px 32px ${accentColor}08, 0 2px 10px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.95)`,
      }}>
      {/* Sheen */}
      <div className="absolute inset-x-0 top-0 pointer-events-none"
        style={{ height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, transparent 100%)', borderRadius: '26px 26px 0 0' }} />
      {/* Specular */}
      <div className="absolute pointer-events-none"
        style={{ top: '10%', left: '16%', width: 38, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', filter: 'blur(7px)' }} />
      {/* Accent bars */}
      {accentPos === 'right' && (
        <div className="absolute top-4 bottom-4 right-0 w-[3px] rounded-l-full pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}40)`, boxShadow: `0 0 10px ${accentColor}35` }} />
      )}
      {accentPos === 'top' && (
        <div className="absolute top-0 left-[12%] right-[12%] h-[3px] rounded-b-full pointer-events-none"
          style={{ background: `linear-gradient(90deg, ${accentColor}30, ${accentColor}90, ${accentColor}30)`, boxShadow: `0 2px 10px ${accentColor}30` }} />
      )}
      {/* Shimmer */}
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)' }}
        animate={{ x: ['-120%', '200%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: delay + 3 }}
      />
      {/* Bottom ambient */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none"
        style={{ height: '25%', background: `linear-gradient(0deg, ${accentColor}05 0%, transparent 100%)`, borderRadius: '0 0 26px 26px' }} />
      {children}
    </motion.div>
  );
}

/* ── Icon orb with pulse ─────────────────────────────── */
function IconOrb({ icon: Icon, color, size = 48 }: { icon: typeof Zap; color: string; size?: number }) {
  const br = Math.round(size * 0.33);
  return (
    <motion.div
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      className="flex-shrink-0 relative overflow-hidden flex items-center justify-center"
      style={{
        width: size, height: size, borderRadius: br,
        background: `linear-gradient(145deg, rgba(255,255,255,0.92) 0%, ${color}15 100%)`,
        border: '1.5px solid rgba(255,255,255,0.92)',
        boxShadow: `0 5px 22px ${color}20, inset 0 1.5px 0 rgba(255,255,255,0.95)`,
      }}>
      <div className="absolute inset-x-0 top-0 pointer-events-none"
        style={{ height: '48%', background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)', borderRadius: `${br}px ${br}px 0 0` }} />
      {/* Glow ring around icon */}
      <motion.div className="absolute rounded-full pointer-events-none"
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ inset: -4, borderRadius: br + 4, border: `2px solid ${color}25`, boxShadow: `0 0 12px ${color}20` }}
      />
      <Icon style={{ width: size * 0.40, height: size * 0.40, color, position: 'relative', zIndex: 1 }} />
    </motion.div>
  );
}

/* ── Section header ──────────────────────────────────── */
function SectionHeader({ vis, on }: { vis: DomainVisConfig; on: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }} animate={on ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.04 }}
      className="flex items-center gap-3 mx-4 mb-5">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${vis.particleColor}28)` }} />
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
        style={{ background: `${vis.particleColor}08`, border: `1px solid ${vis.particleColor}15` }}>
        <Sparkles style={{ width: 9, height: 9, color: vis.particleColor }} />
        <p style={{ fontSize: 9.5, fontWeight: 900, color: W.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          خطتك العملية
        </p>
      </div>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${vis.particleColor}28)` }} />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   ① Today Action
   ═══════════════════════════════════════════════════════ */
function TodayCard({ block, vis, delay, on }: {
  block: ResultActionBlock; vis: DomainVisConfig; delay: number; on: boolean;
}) {
  const GREEN = '#059669';
  return (
    <PlanCard delay={delay} on={on} accentColor={GREEN} accentPos="right">
      <div className="flex items-start gap-4 p-6 relative z-10">
        <IconOrb icon={Zap} color={GREEN} size={52} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <motion.div className="w-2 h-2 rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ background: GREEN, boxShadow: `0 0 6px ${GREEN}` }}
            />
            <p style={{ fontSize: 9, fontWeight: 900, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.16em' }}>
              {block.sectionLabel}
            </p>
          </div>
          <p style={{ fontSize: 16, fontWeight: 900, color: W.textPrimary, marginBottom: 10, lineHeight: 1.25 }}>
            خطوتك اليوم
          </p>
          <div className="rounded-[18px] p-4 relative overflow-hidden"
            style={{ background: `${GREEN}07`, border: `1px solid ${GREEN}15`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.55)` }}>
            <div className="absolute inset-x-0 top-0 h-[42%] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)', borderRadius: '18px 18px 0 0' }} />
            <p style={{ fontSize: 13.5, fontWeight: 600, color: W.textPrimary, lineHeight: 1.8, position: 'relative', zIndex: 1 }}>
              {block.body}
            </p>
          </div>
        </div>
      </div>
    </PlanCard>
  );
}

/* ═══════════════════════════════════════════════════════
   ② Monitor This Week
   ═══════════════════════════════════════════════════════ */
function MonitorCard({ block, vis, delay, on }: {
  block: ResultMonitoringBlock; vis: DomainVisConfig; delay: number; on: boolean;
}) {
  const CYAN = '#0891B2';
  const items = block.items ?? [];

  return (
    <PlanCard delay={delay} on={on} accentColor={CYAN} accentPos="top">
      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <IconOrb icon={Eye} color={CYAN} size={48} />
          <div>
            <p style={{ fontSize: 9, fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              {block.sectionLabel ?? 'راقب هذا الأسبوع'}
            </p>
            <p style={{ fontSize: 15, fontWeight: 900, color: W.textPrimary }}>نقاط المراقبة</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {items.map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -12 }} animate={on ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: delay + 0.12 + i * 0.07, type: 'spring', stiffness: 300 }}
              className="flex items-start gap-3 rounded-[16px] p-3.5 relative overflow-hidden"
              style={{
                background: `linear-gradient(155deg, rgba(255,255,255,0.60) 0%, ${CYAN}05 100%)`,
                border: `1px solid rgba(255,255,255,0.80)`,
                boxShadow: `0 2px 10px ${CYAN}06, inset 0 1px 0 rgba(255,255,255,0.80)`,
              }}>
              <div className="absolute inset-x-0 top-0 h-[42%] pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%)', borderRadius: '16px 16px 0 0' }} />
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative overflow-hidden"
                style={{ background: `${CYAN}12`, border: `1.5px solid ${CYAN}25` }}>
                <div className="absolute inset-x-0 top-0 h-[48%]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)' }} />
                <CheckCircle style={{ width: 12, height: 12, color: CYAN, position: 'relative', zIndex: 1 }} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: W.textPrimary, lineHeight: 1.65, position: 'relative', zIndex: 1 }}>{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </PlanCard>
  );
}

/* ═══════════════════════════════════════════════════════
   ③ Seek Care
   ═══════════════════════════════════════════════════════ */
function SeekCareCard({ block, delay, on }: {
  block: ResultEscalationBlock; delay: number; on: boolean;
}) {
  const AMBER = '#D97706';
  return (
    <PlanCard delay={delay} on={on} accentColor={AMBER} accentPos="right">
      <div className="flex items-start gap-4 p-6 relative z-10">
        <IconOrb icon={AlertTriangle} color={AMBER} size={48} />
        <div className="flex-1">
          <p style={{ fontSize: 9, fontWeight: 900, color: AMBER, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 5 }}>
            {block.sectionLabel}
          </p>
          <p style={{ fontSize: 15, fontWeight: 900, color: W.textPrimary, marginBottom: 8, lineHeight: 1.25 }}>
            متى تطلب الرعاية الطبية؟
          </p>
          <div className="rounded-[16px] p-3.5 relative overflow-hidden"
            style={{ background: `${AMBER}06`, border: `1px solid ${AMBER}14`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.55)` }}>
            <div className="absolute inset-x-0 top-0 h-[42%] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)', borderRadius: '16px 16px 0 0' }} />
            <p style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', lineHeight: 1.8, position: 'relative', zIndex: 1 }}>
              {block.body}
            </p>
          </div>
        </div>
      </div>
    </PlanCard>
  );
}

/* ═══════════════════════════════════════════════════════
   ④ Consistency Note
   ═══════════════════════════════════════════════════════ */
function ConsistencyCard({ block, delay, on }: {
  block: ConsistencyNoteBlock; delay: number; on: boolean;
}) {
  const VIOLET = '#7C3AED';
  return (
    <PlanCard delay={delay} on={on} accentColor={VIOLET} accentPos="top">
      <div className="flex items-start gap-4 p-6 relative z-10">
        <IconOrb icon={RefreshCw} color={VIOLET} size={44} />
        <div className="flex-1">
          <p style={{ fontSize: 9, fontWeight: 900, color: VIOLET, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 5 }}>
            ملاحظة حول دقة النتيجة
          </p>
          <div className="space-y-2">
            {block.notes.map((note, idx) => (
              <div key={idx} className="rounded-[14px] p-3 relative overflow-hidden"
                style={{ background: `${VIOLET}06`, border: `1px solid ${VIOLET}12`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.55)` }}>
                <div className="absolute inset-x-0 top-0 h-[42%] pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)', borderRadius: '14px 14px 0 0' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: W.textPrimary, lineHeight: 1.75, position: 'relative', zIndex: 1 }}>{note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PlanCard>
  );
}

/* ── Timeline Step wrapper ───────────────────────────── */
function TimelineStep({ step, color, isLast, delay, on, children }: {
  step: number; color: string; isLast: boolean; delay: number; on: boolean; children: React.ReactNode;
}) {
  return (
    <div className="relative flex">
      {/* Timeline column */}
      <motion.div
        initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}}
        transition={{ delay }}
        className="flex flex-col items-center flex-shrink-0 mr-1"
        style={{ width: 28 }}>
        {/* Step number orb */}
        <motion.div
          initial={{ scale: 0 }} animate={on ? { scale: 1 } : {}}
          transition={{ delay: delay + 0.05, type: 'spring', stiffness: 400, damping: 20 }}
          className="w-7 h-7 rounded-full flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(145deg, rgba(255,255,255,0.90) 0%, ${color}18 100%)`,
            border: `2px solid ${color}30`,
            boxShadow: `0 3px 12px ${color}18, inset 0 1px 0 rgba(255,255,255,0.90)`,
            marginTop: 22,
          }}>
          <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)' }} />
          <span style={{ fontSize: 11, fontWeight: 900, color, position: 'relative', zIndex: 1 }}>{step}</span>
        </motion.div>
        {/* Connecting line */}
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }} animate={on ? { scaleY: 1 } : {}}
            transition={{ delay: delay + 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1"
            style={{
              width: 2, minHeight: 20,
              background: `linear-gradient(to bottom, ${color}30, ${color}10)`,
              transformOrigin: 'top',
            }}
          />
        )}
      </motion.div>
      {/* Card */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════ */
export function ResultActionPlan({ todayAction, monitoring, seekCare, consistencyNote, vis, on }: Props) {
  const steps = [
    { color: '#059669', node: <TodayCard block={todayAction} vis={vis} delay={0.08} on={on} /> },
    { color: '#0891B2', node: <MonitorCard block={monitoring} vis={vis} delay={0.18} on={on} /> },
    { color: '#D97706', node: <SeekCareCard block={seekCare} delay={0.26} on={on} /> },
    ...(consistencyNote ? [{ color: '#7C3AED', node: <ConsistencyCard block={consistencyNote} delay={0.34} on={on} /> }] : []),
  ];

  return (
    <>
      <SectionHeader vis={vis} on={on} />
      <div className="mx-2">
        {steps.map((s, i) => (
          <TimelineStep key={i} step={i + 1} color={s.color} isLast={i === steps.length - 1} delay={0.06 + i * 0.1} on={on}>
            {s.node}
          </TimelineStep>
        ))}
      </div>
    </>
  );
}
