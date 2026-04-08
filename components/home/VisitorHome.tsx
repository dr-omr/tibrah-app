// components/home/VisitorHome.tsx — V8 "Complete & Smart"
// User keeps V6 sections + V7 smart intelligence
// Full rich journey: 9 sections, every one earns its place
// Smart user journey: Hero → Guide → Stats → Health Preview → Services → Pillars → Why → Testimonials → CTA
// + Floating persistent pill

import React from 'react';
import dynamic from 'next/dynamic';
import VisitorHeroSection from './visitor/VisitorHeroSection';
import VisitorFloatingCTA from './visitor/VisitorFloatingCTA';

// Intelligence layer
const VisitorSmartGuide   = dynamic(() => import('./visitor/VisitorSmartGuide'));

// Trust & Numbers
const VisitorStatsBar     = dynamic(() => import('./visitor/VisitorStatsBar'));

// Desire-creation (locked preview)
const VisitorHealthPreview= dynamic(() => import('./visitor/VisitorHealthPreview'));

// Services discovery
const VisitorServicesScroll = dynamic(() => import('./visitor/VisitorServicesScroll'));

// Doctor schedule picker (NEW)
const VisitorDoctorSchedule = dynamic(() => import('./visitor/VisitorDoctorSchedule'));

// Philosophy & differentiation
const VisitorPillars      = dynamic(() => import('./visitor/VisitorPillars'));
const VisitorWhyTibrah    = dynamic(() => import('./visitor/VisitorWhyTibrah'));

// Journey & social proof
const VisitorJourney      = dynamic(() => import('./visitor/VisitorJourney'));
const VisitorSocialProof  = dynamic(() => import('./visitor/VisitorSocialProof'));

// FAQ & Success Stories (NEW)
const VisitorFAQ            = dynamic(() => import('./visitor/VisitorFAQ'));
const VisitorSuccessStories = dynamic(() => import('./visitor/VisitorSuccessStories'));

// Close
const VisitorFinalCTA     = dynamic(() => import('./visitor/VisitorFinalCTA'));

export default function VisitorHome() {
    return (
        <div dir="rtl" style={{
            background: '#F0FAF8',
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 'env(safe-area-inset-bottom)',
        }}>

            {/* ① Hero — First impression · Doctor trust · Entry CTA */}
            <VisitorHeroSection />

            {/* ② Smart Guide — "أين تبدأ؟" · Intelligent 3-path routing */}
            <VisitorSmartGuide />

            {/* ③ Doctor Schedule — interactive booking calendar (NEW) */}
            <VisitorDoctorSchedule />

            {/* ④ Stats — Trust numbers (animated counters) */}
            <VisitorStatsBar />

            {/* ④ Health Preview — Locked dashboard (creates desire to register) */}
            <VisitorHealthPreview />

            {/* ⑤ Services — App Store style horizontal scroll */}
            <VisitorServicesScroll />

            {/* ⑥ Pillars — Three dimensions of healing */}
            <VisitorPillars />

            {/* ⑦ Why Tibrah — Comparison vs traditional medicine */}
            <VisitorWhyTibrah />

            {/* ⑧ Journey — Patient 5-step journey */}
            <VisitorJourney />

            {/* ⑨ Success Stories — Animated metrics + patient cards (NEW) */}
            <VisitorSuccessStories />

            {/* ⑩ Social Proof — Testimonial carousel */}
            <VisitorSocialProof />

            {/* ⑪ FAQ — Spring accordion, 6 questions (NEW) */}
            <VisitorFAQ />

            {/* ⑫ Final CTA — Book or WhatsApp */}
            <VisitorFinalCTA />

            {/* ⑬ Floating pill — Persistent after scroll */}
            <VisitorFloatingCTA />
        </div>
    );
}
