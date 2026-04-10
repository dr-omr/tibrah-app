import React from 'react';
import Head from 'next/head';
import SectionLandingPage from '@/components/sections/SectionLandingPage';
import { RUHI } from '@/components/sections/section-tokens';

export default function RuhiPage() {
    return (
        <>
            <Head>
                <title>روحي — طِبرَا</title>
                <meta name="description" content="السكون، الترددات، والمعنى الأعمق — التأمل والصوت العلاجي" />
            </Head>
            <SectionLandingPage section={RUHI} />
        </>
    );
}
