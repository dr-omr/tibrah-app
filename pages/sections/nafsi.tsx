import React from 'react';
import Head from 'next/head';
import SectionLandingPage from '@/components/sections/SectionLandingPage';
import { NAFSI } from '@/components/sections/section-tokens';

export default function NafsiPage() {
    return (
        <>
            <Head>
                <title>نفسي — طِبرَا</title>
                <meta name="description" content="عواطفك، علاقاتك، وسلامتك الداخلية — الطب الشعوري والتشخيص النفسي" />
            </Head>
            <SectionLandingPage section={NAFSI} />
        </>
    );
}
