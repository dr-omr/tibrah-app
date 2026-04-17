// components/home/visitor/VisitorProtocolShowcase.tsx — Sprint 6
// ═══════════════════════════════════════════════════════════════════
// مكتبة الخطط العلاجية — Protocol Discovery for Visitors
//
// يعرض الـ 8 بروتوكولات كـ scrollable chips/cards
// اللغة: بشرية تماماً — لا "بروتوكول" ولا "subdomain"
// CTA: "ابدأ تقييمك للحصول على خطتك"
// ═══════════════════════════════════════════════════════════════════

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';

/* ── Design tokens ───────────────────────────────────────────── */
const ACCENT = '#0D9488';
const INK    = '#0F172A';
const SUB    = '#475569';
const MUTED  = '#94A3B8';
const CANVAS = '#F0FAF8';
const SP     = { type: 'spring' as const, stiffness: 460, damping: 32 };

/* ── Protocol cards data (user-facing language) ──────────────── */
const PROTOCOLS = [
    {
        emoji: '😴',
        name: 'استعادة النوم',
        desc: '7 أيام لإعادة ضبط إيقاع نومك',
        domain: 'جسدي',
        domainColor: '#00B7EB',
        days: 7,
        href: '/symptom-checker',
    },
    {
        emoji: '🧘',
        name: 'تهدئة القلق',
        desc: 'خفض استثارة الجهاز العصبي يومياً',
        domain: 'نفسي',
        domainColor: '#8B5CF6',
        days: 7,
        href: '/symptom-checker',
    },
    {
        emoji: '⚡',
        name: 'استعادة الطاقة',
        desc: 'اكتشف جذر إرهاقك واستعده',
        domain: 'جسدي',
        domainColor: '#00B7EB',
        days: 7,
        href: '/symptom-checker',
    },
    {
        emoji: '🍃',
        name: 'صحة الجهاز الهضمي',
        desc: 'توازن ميكروبيوم وتحسين الهضم',
        domain: 'جسدي',
        domainColor: '#00B7EB',
        days: 7,
        href: '/symptom-checker',
    },
    {
        emoji: '⚖️',
        name: 'التوازن الهرموني',
        desc: 'دعم محاور الهرمونات وتقليل الأعراض',
        domain: 'جسدي',
        domainColor: '#00B7EB',
        days: 7,
        href: '/symptom-checker',
    },
    {
        emoji: '💗',
        name: 'الأعراض النفس-جسدية',
        desc: 'فك الارتباط بين المشاعر والأعراض الجسدية',
        domain: 'نفسي',
        domainColor: '#8B5CF6',
        days: 7,
        href: '/symptom-checker',
    },
    {
        emoji: '🌀',
        name: 'تهدئة العقل',
        desc: 'كسر دائرة فرط التفكير وصفاء ذهني',
        domain: 'معرفي',
        domainColor: '#10B981',
        days: 7,
        href: '/symptom-checker',
    },
    {
        emoji: '☀️',
        name: 'إعادة الإيقاع اليومي',
        desc: 'إصلاح الساعة البيولوجية وانتظام الحياة',
        domain: 'روحي',
        domainColor: '#F59E0B',
        days: 7,
        href: '/symptom-checker',
    },
];

/* ── Single protocol card ─────────────────────────────────────── */
function ProtocolCard({ p, i }: { p: typeof PROTOCOLS[0]; i: number }) {
    return (
        <Link href={p.href} onClick={() => haptic.selection()}>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: i * 0.06, ...SP }}
                whileTap={{ scale: 0.96, transition: SP }}
                style={{
                    width: 148,
                    flexShrink: 0,
                    borderRadius: 18,
                    padding: '14px 14px 12px',
                    background: 'rgba(255,255,255,0.84)',
                    backdropFilter: 'blur(28px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.90)',
                    boxShadow: '0 2px 0 rgba(255,255,255,1) inset, 0 4px 20px rgba(15,23,42,0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                }}
            >
                {/* Top reflection */}
                <div style={{
                    position: 'absolute', top: 0, left: 10, right: 10, height: 1,
                    background: 'rgba(255,255,255,1)', borderRadius: 99,
                }} />

                {/* Subtle domain color glow */}
                <div style={{
                    position: 'absolute', top: -10, right: -10, width: 60, height: 60,
                    background: `radial-gradient(circle, ${p.domainColor}18 0%, transparent 70%)`,
                    filter: 'blur(10px)', pointerEvents: 'none',
                }} />

                {/* Emoji */}
                <div style={{
                    width: 38, height: 38, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${p.domainColor}12`,
                    border: `1px solid ${p.domainColor}20`,
                    marginBottom: 10, fontSize: 18,
                }}>
                    {p.emoji}
                </div>

                {/* Name */}
                <p style={{
                    fontSize: 12.5, fontWeight: 900, color: INK,
                    lineHeight: 1.25, marginBottom: 5,
                }}>
                    {p.name}
                </p>

                {/* Desc */}
                <p style={{
                    fontSize: 10, color: SUB, lineHeight: 1.5, marginBottom: 10,
                }}>
                    {p.desc}
                </p>

                {/* Footer */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: 8, borderTop: `1px solid ${p.domainColor}15`,
                }}>
                    <span style={{
                        fontSize: 8.5, fontWeight: 800, color: p.domainColor,
                        background: `${p.domainColor}12`,
                        padding: '2px 7px', borderRadius: 99,
                    }}>
                        {p.domain}
                    </span>
                    <span style={{ fontSize: 8.5, fontWeight: 600, color: MUTED }}>
                        {p.days} أيام
                    </span>
                </div>
            </motion.div>
        </Link>
    );
}

/* ── Main component ─────────────────────────────────────────── */
export default function VisitorProtocolShowcase() {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <section dir="rtl" style={{ background: CANVAS, paddingTop: 36, paddingBottom: 36 }}>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ paddingInline: 20, marginBottom: 20 }}
            >
                <p style={{
                    fontSize: 10.5, fontWeight: 700, color: MUTED,
                    letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 7,
                }}>
                    مكتبة الخطط العلاجية
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <h2 style={{
                        fontSize: 22, fontWeight: 900, color: INK,
                        lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0,
                    }}>
                        خطط علاجية مخصصة<br />
                        <span style={{ color: ACCENT }}>لكل حالة</span>
                    </h2>
                    <Link href="/symptom-checker" onClick={() => haptic.tap()}>
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '7px 12px', borderRadius: 99,
                                background: `${ACCENT}12`, border: `1px solid ${ACCENT}25`,
                            }}
                        >
                            <span style={{ fontSize: 11, fontWeight: 800, color: ACCENT }}>ابدأ تقييمك</span>
                            <ArrowLeft style={{ width: 12, height: 12, color: ACCENT }} />
                        </motion.div>
                    </Link>
                </div>
                <p style={{ fontSize: 12, color: SUB, marginTop: 8, lineHeight: 1.55 }}>
                    كل خطة مدّتها ٧ أيام مع متابعة يومية — مبنية على أعراضك الفعلية
                </p>
            </motion.div>

            {/* Horizontal scroll cards */}
            <div
                ref={scrollRef}
                style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    paddingInline: 20,
                    paddingBottom: 4,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
                className="hide-scrollbar"
            >
                {PROTOCOLS.map((p, i) => (
                    <ProtocolCard key={p.name} p={p} i={i} />
                ))}
                {/* End spacer */}
                <div style={{ width: 4, flexShrink: 0 }} />
            </div>

            {/* Scroll hint fade */}
            <div style={{
                position: 'relative', marginTop: -4, marginInlineEnd: 0,
                height: 0, overflow: 'visible', pointerEvents: 'none',
            }}>
                <div style={{
                    position: 'absolute', top: -60, left: 0, width: 40, height: 60,
                    background: `linear-gradient(to right, transparent, ${CANVAS})`,
                }} />
            </div>

            {/* CTA strip */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ paddingInline: 20, marginTop: 20 }}
            >
                <Link href="/symptom-checker" onClick={() => haptic.impact()}>
                    <motion.div
                        whileTap={{ scale: 0.97, transition: SP }}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '14px 20px', borderRadius: 16,
                            background: 'rgba(255,255,255,0.82)',
                            backdropFilter: 'blur(28px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                            border: `1.5px solid ${ACCENT}25`,
                            boxShadow: `0 4px 20px ${ACCENT}10`,
                        }}
                    >
                        <span style={{ fontSize: 16 }}>🩺</span>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 900, color: INK }}>
                                ابدأ تقييمك للحصول على خطتك
                            </p>
                            <p style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>
                                مجاني · 5 دقائق · بدون تسجيل
                            </p>
                        </div>
                        <ArrowLeft style={{ width: 16, height: 16, color: ACCENT, marginRight: 'auto' }} />
                    </motion.div>
                </Link>
            </motion.div>

            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </section>
    );
}
