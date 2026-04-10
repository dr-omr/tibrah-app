'use client';
/**
 * SectionLandingPage — طِبرَا Domain Hub
 * ───────────────────────────────────────
 * Main orchestrator file. Extremely lightweight as all 
 * components have been modularized for high performance.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import type { SectionDefinition } from './section-tokens';

// Subcomponents
import { SectionAuthGate } from './SectionAuthGate';
import { SectionHeroHeader } from './SectionHeroHeader';
import { CrossDomainBar } from './CrossDomainBar';
import { SubsectionCard } from './SubsectionCard';

export interface SectionLandingPageProps {
    section: SectionDefinition;
}

export default function SectionLandingPage({ section }: SectionLandingPageProps) {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) return <SectionAuthGate section={section} />;

    return (
        <div className="min-h-screen pb-28"
            style={{ background: 'linear-gradient(180deg, #E4F7F5 0%, #EEF2FF 55%, #F0FDF4 100%)' }}>

            {/* ① Hero Header Cinematic */}
            <SectionHeroHeader section={section} onBack={() => router.back()} />

            {/* ② Cross-domain bar */}
            <div style={{
                background: 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
            }}>
                <CrossDomainBar currentSlug={section.slug} />
            </div>

            {/* ③ Subsections — شبكة 2 عمود */}
            <div className="px-4 pt-5 pb-36">
                {section.subsections.map((sub, i) => (
                    <SubsectionCard
                        key={sub.title}
                        title={sub.title}
                        items={sub.items}
                        color={section.color}
                        colorAlt={section.colorAlt}
                        index={i}
                    />
                ))}

                {/* Footer Logo */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 flex flex-col items-center gap-2"
                >
                    <div className="w-16 h-[1.5px] rounded-full"
                        style={{ background: `linear-gradient(to right, transparent, ${section.color}50, transparent)` }} />
                    <p className="text-[9px] font-semibold text-slate-300 tracking-widest uppercase">
                        {section.arabicName} · {section.englishName} · طِبرَا
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
