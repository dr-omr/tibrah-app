import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Stethoscope, Heart, TrendingUp, Award } from 'lucide-react';
import DailyGreeting from './DailyGreeting';
import { ZoneDivider, ScrollReveal, SectionHeader, DailyMotivation } from './HomeShared';

const ServicesPreview = dynamic(() => import('./ServicesPreview'), {
    loading: () => <div className="h-[200px] bg-slate-100 dark:bg-slate-800 animate-pulse m-5 rounded-3xl" />,
});
const ShopPreview = dynamic(() => import('./ShopPreview'), {
    loading: () => <div className="h-[200px] bg-slate-100 dark:bg-slate-800 animate-pulse m-5 rounded-3xl" />,
});
const TrustAndTestimonials = dynamic(() => import('./TrustAndTestimonials'), {
    loading: () => <section className="h-[250px] mx-4 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />,
});
const FinalCTA = dynamic(() => import('./FinalCTA'), {
    loading: () => <div className="h-[200px] mx-4 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />,
});

/* ═══════════════════════════════════════════════
   VISITOR FLOW — التجربة الأصلية
   ═══════════════════════════════════════════════ */
export default function VisitorHome() {
    return (
        <div className="flex flex-col gap-7 pb-8">
            <DailyGreeting />

            <ZoneDivider icon={Stethoscope} label="خدماتنا" />

            <div className="content-visibility-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 800px' }}>
                <ScrollReveal>
                    <ServicesPreview />
                </ScrollReveal>

                <ZoneDivider label="ثقة ونتائج" icon={Heart} />

                <div className="space-y-4">
                    <SectionHeader
                        title="قصص نجاح ومجتمعنا"
                        subtitle="ناس تعافت بفضل الله"
                        Icon={Heart}
                        accentColor="var(--section-community)"
                    />
                    <ScrollReveal>
                        <TrustAndTestimonials />
                    </ScrollReveal>
                </div>

                <div className="my-7">
                    <DailyMotivation />
                </div>

                <ScrollReveal>
                    <ShopPreview />
                </ScrollReveal>

                <ScrollReveal>
                    <FinalCTA />
                </ScrollReveal>
            </div>
        </div>
    );
}
