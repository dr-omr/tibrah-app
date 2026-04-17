'use client';
/**
 * SectionLandingPage.tsx — طِبرَا Domain Hub Orchestrator
 * ─────────────────────────────────────────────────────────
 * يجمع HeroHeader + CrossDomainBar + SubsectionCards
 * مع خلفية water-glass aurora متنفسة حية
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import type { SectionDefinition } from './section-tokens';

import { SectionAuthGate }  from './SectionAuthGate';
import { SectionHeroHeader } from './SectionHeroHeader';
import { CrossDomainBar }   from './CrossDomainBar';
import { SubsectionCard }   from './SubsectionCard';

export interface SectionLandingPageProps {
    section: SectionDefinition;
}

export default function SectionLandingPage({ section }: SectionLandingPageProps) {
    const { user }  = useAuth();
    const router    = useRouter();

    if (!user) return <SectionAuthGate section={section} />;

    return (
        <div className="relative min-h-screen pb-28 overflow-hidden">

            {/* ── MULTI-AURORA PAGE BACKGROUND ── */}
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    background: [
                        'linear-gradient(185deg,',
                        `  color-mix(in srgb, ${section.color} 12%, white) 0%,`,
                        '  #EEF2FF 45%,',
                        `  color-mix(in srgb, ${section.colorAlt} 6%, white) 80%,`,
                        '  #F0FDF4 100%',
                        ')',
                    ].join(''),
                }}
            />

            {/* aurora orb top-right */}
            <motion.div
                animate={{ scale: [1, 1.10, 1], opacity: [0.45, 0.70, 0.45] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="fixed -top-16 -right-16 w-80 h-80 rounded-full z-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${section.color}25, transparent 68%)`,
                    filter: 'blur(30px)',
                }}
            />
            {/* aurora orb bottom-left */}
            <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.30, 0.50, 0.30] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                className="fixed bottom-16 -left-12 w-64 h-64 rounded-full z-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${section.colorAlt}20, transparent 68%)`,
                    filter: 'blur(24px)',
                }}
            />
            {/* subtle mid orb */}
            <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.18, 0.32, 0.18] }}
                transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
                className="fixed top-1/2 -right-8 w-52 h-52 rounded-full z-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${section.color}18, transparent 68%)`,
                    filter: 'blur(20px)',
                    transform: 'translateY(-50%)',
                }}
            />

            {/* ── CONTENT LAYER (above aurora) ── */}
            <div className="relative z-10">

                {/* ① Hero Header */}
                <SectionHeroHeader section={section} onBack={() => router.back()} />

                {/* ② Cross-domain navigation */}
                <div style={{
                    background: 'rgba(255,255,255,0.60)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderBottom: '1px solid rgba(255,255,255,0.70)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.85) inset, 0 4px 16px rgba(0,0,0,0.04)',
                }}>
                    <CrossDomainBar currentSlug={section.slug} />
                </div>

                {/* ③ Subsection Cards */}
                <motion.div
                    className="px-4 pt-5 pb-36"
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
                    }}
                >
                    {section.subsections.map((sub, i) => (
                        <SubsectionCard
                            key={sub.id ?? sub.title}
                            title={sub.title}
                            icon={sub.icon}
                            items={sub.items}
                            color={section.color}
                            colorAlt={section.colorAlt}
                            index={i}
                        />
                    ))}

                    {/* Footer */}
                    <motion.div
                        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                        className="mt-6 flex flex-col items-center gap-2"
                    >
                        <div className="w-16 h-[1.5px] rounded-full"
                            style={{ background: `linear-gradient(to right, transparent, ${section.color}55, transparent)` }} />
                        <p className="text-[8.5px] font-semibold text-slate-300 tracking-widest uppercase">
                            {section.arabicName} · {section.englishName} · طِبرَا
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
