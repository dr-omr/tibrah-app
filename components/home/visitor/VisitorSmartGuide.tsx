// components/home/visitor/VisitorSmartGuide.tsx
// THE INTELLIGENCE LAYER — replaces 6 cluttered sections with ONE smart question
// "أين تبدأ رحلتك؟" — 3 contextual entry points that guide to the right feature
//
// Philosophy: Don't show everything. Ask one great question.
// Inspired by: Headspace onboarding · Calm "How do you feel" · Linear quick actions
// Each card leads to a DIFFERENT part of Tibrah based on the user's need:
//   1. "أعاني من أعراض" → Symptom Checker → Diagnosis → Booking
//   2. "أريد فهم نفسي" → Emotional Medicine → Psychosomatic
//   3. "أريد بروتوكولاً" → Services → Booking

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Brain, Sparkles, ArrowLeft } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { createPageUrl } from '@/utils';

const INK    = '#0F172A';
const SUB    = '#64748B';
const MUTED  = '#94A3B8';
const ACCENT = '#0D9488';
const CANVAS = '#F0FAF8';
const GLASS  = 'rgba(255,255,255,0.78)';
const BLUR   = 'blur(32px) saturate(180%)';
const BORDER = 'rgba(255,255,255,0.85)';
const SHADOW = '0 2px 0 rgba(255,255,255,1) inset, 0 8px 32px rgba(15,23,42,0.09)';
const SP     = { type: 'spring' as const, stiffness: 500, damping: 36 };

const PATHS = [
    {
        icon: HeartPulse,
        emoji: '🩺',
        title: 'أعاني من أعراض',
        desc: 'أفهم ما يحدث في جسدي',
        detail: [
            'مدقق الأعراض الذكي',
            'تحليل أولي سريع',
            'توجيه للتخصص المناسب',
        ],
        cta: 'ابدأ التشخيص',
        href: '/symptom-checker',
        accent: ACCENT,
        glow: 'rgba(13,148,136,0.12)',
    },
    {
        icon: Brain,
        emoji: '💭',
        title: 'أريد فهم نفسي',
        desc: 'ربط مشاعري بصحتي الجسدية',
        detail: [
            'الطب النفس-جسدي',
            'أنماط عاطفية مخصصة',
            'علاج جذري شامل',
        ],
        cta: 'اكتشف المزيد',
        href: '/emotional-medicine',
        accent: '#6D4AFF',
        glow: 'rgba(109,74,255,0.10)',
    },
    {
        icon: Sparkles,
        emoji: '📋',
        title: 'أريد بروتوكولاً',
        desc: 'خطة علاجية متكاملة ومخصصة',
        detail: [
            'استشارة شاملة مع الطبيب',
            'بروتوكول وظيفي مخصص',
            'متابعة مستمرة',
        ],
        cta: 'احجز جلستك',
        href: createPageUrl('BookAppointment'),
        accent: '#D97706',
        glow: 'rgba(217,119,6,0.10)',
    },
];

function PathCard({ p, i, selected, onSelect }: {
    p: typeof PATHS[0]; i: number;
    selected: boolean; onSelect: () => void;
}) {
    const Icon = p.icon;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.09, ...SP }}>
            <Link href={p.href} onClick={() => { haptic.impact(); onSelect(); }}>
                <motion.div
                    whileTap={{ scale: 0.968, transition: SP }}
                    style={{
                        position: 'relative', borderRadius: 22, overflow: 'hidden',
                        background: selected ? `rgba(255,255,255,0.90)` : GLASS,
                        backdropFilter: BLUR, WebkitBackdropFilter: BLUR,
                        border: selected ? `1.5px solid ${p.accent}35` : `1px solid ${BORDER}`,
                        boxShadow: selected
                            ? `0 2px 0 rgba(255,255,255,1) inset, 0 12px 40px rgba(15,23,42,0.12), 0 0 0 1px ${p.accent}18`
                            : SHADOW,
                        padding: '20px 20px 16px',
                        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                    }}>

                    {/* Top edge highlight */}
                    <div style={{ position: 'absolute', top: 0, left: 16, right: 16, height: 1,
                        background: 'rgba(255,255,255,1)', borderRadius: 99 }} />

                    {/* Ambient glow per path */}
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                        background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)`,
                        filter: 'blur(20px)', pointerEvents: 'none' }} />

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `${p.accent}12`, border: `1px solid ${p.accent}18` }}>
                                <Icon style={{ width: 20, height: 20, color: p.accent }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 16, fontWeight: 900, color: INK, lineHeight: 1.2 }}>{p.title}</p>
                                <p style={{ fontSize: 11, color: SUB, marginTop: 3 }}>{p.desc}</p>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16,
                        paddingRight: 4 }}>
                        {p.detail.map((d, di) => (
                            <motion.div key={d}
                                initial={{ opacity: 0, x: -6 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.09 + di * 0.04 + 0.12 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 5, height: 5, borderRadius: 99, background: p.accent,
                                    flexShrink: 0, opacity: 0.6 }} />
                                <p style={{ fontSize: 11.5, color: SUB, fontWeight: 500 }}>{d}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.65)' }}>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: p.accent }}>{p.cta}</span>
                        <div style={{ width: 30, height: 30, borderRadius: 99,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `${p.accent}12`, border: `1px solid ${p.accent}18` }}>
                            <ArrowLeft style={{ width: 14, height: 14, color: p.accent }} />
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}

export default function VisitorSmartGuide() {
    const [selected, setSelected] = useState<number | null>(null);

    return (
        <section dir="rtl" style={{ background: CANVAS, padding: '40px 20px 32px' }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: MUTED,
                    letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                    ابدأ رحلتك
                </p>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: INK,
                    lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0 }}>
                    أين تبدأ رحلتك<br />
                    <span style={{ color: ACCENT }}>نحو الشفاء؟</span>
                </h2>
                <p style={{ fontSize: 12.5, color: SUB, marginTop: 10, lineHeight: 1.6 }}>
                    اختر ما يصف حالك — سنوجهك للمسار الصحيح
                </p>
            </motion.div>

            {/* Path cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PATHS.map((p, i) => (
                    <PathCard key={p.title} p={p} i={i}
                        selected={selected === i}
                        onSelect={() => setSelected(i)} />
                ))}
            </div>
        </section>
    );
}
