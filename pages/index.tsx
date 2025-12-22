import React from 'react';
import DoctorIntro from '../components/home/DoctorIntro';
import HealthPrograms from '../components/home/HealthPrograms';
import QuickAccessGrid from '../components/home/QuickAccessGrid';
import HealthTrackerDiscovery from '../components/home/HealthTrackerDiscovery';
import SocialProof from '../components/home/SocialProof';
import CredentialsSection from '../components/home/CredentialsSection';
import SEO, { pageSEO } from '../components/common/SEO';
import { HomeStructuredData } from '../components/common/StructuredData';

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

