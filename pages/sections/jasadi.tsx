import React from 'react';
import Head from 'next/head';
import SectionLandingPage from '@/components/sections/SectionLandingPage';
import { JASADI } from '@/components/sections/section-tokens';

export default function JasadiPage() {
    return (
        <>
            <Head>
                <title>جسدي — طِبرَا</title>
                <meta name="description" content="صحة جسدك من الداخل والخارج — التشخيص الجسدي، التغذية، المتابعة اليومية" />
            </Head>
            <SectionLandingPage section={JASADI} />
        </>
    );
}
