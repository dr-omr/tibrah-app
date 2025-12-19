import React from 'react';
import BreathingSanctuary from '../components/wellness/BreathingSanctuary';
import Head from 'next/head';

export default function BreathePage() {
    return (
        <>
            <Head>
                <title>TIBRAH | معبد التنفس</title>
                <meta name="theme-color" content="#0f172a" />
            </Head>
            <BreathingSanctuary />
        </>
    );
}
