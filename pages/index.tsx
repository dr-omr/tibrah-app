import React from 'react';
import dynamic from 'next/dynamic';
import DoctorIntro from '../components/home/DoctorIntro';
import SEO, { pageSEO } from '../components/common/SEO';
import { HomeStructuredData } from '../components/common/StructuredData';

// Dynamic imports — below the fold components load lazily
const HealthPrograms = dynamic(() => import('../components/home/HealthPrograms'), {
    loading: () => <div className="h-96 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl mx-4 my-4" />,
});
const QuickAccessGrid = dynamic(() => import('../components/home/QuickAccessGrid'), {
    loading: () => <div className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl mx-4 my-4" />,
});
const HealthTrackerDiscovery = dynamic(() => import('../components/home/HealthTrackerDiscovery'), {
    loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl mx-4 my-4" />,
});
const SocialProof = dynamic(() => import('../components/home/SocialProof'), {
    loading: () => <div className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl mx-4 my-4" />,
});
const CredentialsSection = dynamic(() => import('../components/home/CredentialsSection'), {
    loading: () => <div className="h-40 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl mx-4 my-4" />,
});

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* SEO Meta Tags */}
            <SEO {...pageSEO.home} />
            {/* Structured Data (JSON-LD) for Rich Snippets */}
            <HomeStructuredData />

            {/* 1. ترحيب الدكتور + زر الحجز */}
            <DoctorIntro />

            {/* 2. البرامج العلاجية - أهم شيء يشوفه الزبون! */}
            <HealthPrograms />

            {/* 3. الأقسام الرئيسية */}
            <QuickAccessGrid />

            {/* 4. اكتشف متتبع الصحة */}
            <HealthTrackerDiscovery />

            {/* 5. آراء العملاء */}
            <SocialProof />

            {/* 6. الخبرات والشهادات */}
            <CredentialsSection />
        </div>
    );
}
