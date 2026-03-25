// pages/breathe.tsx
// Redirects to health-tracker — breathing exercises are now part of the health tracker

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function BreathePage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/health-tracker');
    }, [router]);

    return null;
}
