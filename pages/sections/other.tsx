import React from 'react';
import Head from 'next/head';
import SectionLandingPage from '@/components/sections/SectionLandingPage';
import { OTHER } from '@/components/sections/section-tokens';

export default function OtherPage() {
    return (
        <>
            <Head>
                <title>أخرى — طِبرَا</title>
                <meta name="description" content="حسابك، خدماتك، ومواعيدك — الرعاية الطبية، الصيدلية والإعدادات" />
            </Head>
            <SectionLandingPage section={OTHER} />
        </>
    );
}
