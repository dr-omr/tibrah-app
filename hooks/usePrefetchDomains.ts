import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { DOMAINS } from '@/components/home/domain-data';

/**
 * usePrefetchDomains — Prefetching Engine 🚀
 * ──────────────────────────────────────────
 * يقوم بتحميل جميع مسارات الأقسام الأربعة مسبقاً بمجرد أن 
 * يصبح المتصفح غير مشغول (Idle)، لضمان انتقال لحظي 0ms.
 */
export function usePrefetchDomains() {
    const router = useRouter();

    useEffect(() => {
        // ننتظر قليلاً حتى لا نعيق تحميل الصفحة الحالية
        const timer = setTimeout(() => {
            if ('requestIdleCallback' in window) {
                // @ts-ignore
                window.requestIdleCallback(() => {
                    DOMAINS.forEach((domain) => {
                        router.prefetch(domain.sectionHref).catch(() => {});
                    });
                });
            } else {
                DOMAINS.forEach((domain) => {
                    router.prefetch(domain.sectionHref).catch(() => {});
                });
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);
}
