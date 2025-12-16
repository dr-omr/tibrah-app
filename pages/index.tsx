import React from 'react';
import DoctorIntro from '../components/home/DoctorIntro';
import QuickAccessGrid from '../components/home/QuickAccessGrid';
import HealthPrograms from '../components/home/HealthPrograms';
import SocialProof from '../components/home/SocialProof';

export default function HomePage() {
    return (
        <div className="min-h-screen">
            <DoctorIntro />
            <QuickAccessGrid />
            <HealthPrograms />
            <SocialProof />
        </div>
    );
}
