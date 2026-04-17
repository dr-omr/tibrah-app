import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * /sections/other — redirects to /more
 * The "other" domain has been merged into the /more page
 * which handles: appointments, profile, settings, shop, support.
 */
export default function OtherRedirectPage() {
    const router = useRouter();
    useEffect(() => { router.replace('/more'); }, [router]);
    return null;
}
