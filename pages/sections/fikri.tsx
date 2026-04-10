import React from 'react';
import Head from 'next/head';
import SectionLandingPage from '@/components/sections/SectionLandingPage';
import { FIKRI } from '@/components/sections/section-tokens';

export default function FikriPage() {
    return (
        <>
            <Head>
                <title>فكري — طِبرَا</title>
                <meta name="description" content="أفكارك، معتقداتك، ونموك الذاتي — المكتبة، الدورات والتخطيط" />
            </Head>
            <SectionLandingPage section={FIKRI} />
        </>
    );
}
