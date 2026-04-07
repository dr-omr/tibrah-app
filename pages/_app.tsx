import React, { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Alexandria, Outfit } from 'next/font/google';

const alexandria = Alexandria({ 
    subsets: ['arabic', 'latin'],
    variable: '--font-alexandria',
    display: 'swap',
});

const outfit = Outfit({ 
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

import Layout from '../components/layout/Layout';
import { AuthProvider } from '../contexts/AuthContext';
import { AudioProvider } from '../contexts/AudioContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { CartProvider } from '../contexts/CartContext';
import { NativeProvider } from '../contexts/NativeContext';

// Dynamic UI Providers (Loaded async to reduce First Load JS)
const ThemeProvider = dynamic(() => import('../contexts/ThemeContext').then(m => m.ThemeProvider), { ssr: false });
const AuroraBackground = dynamic(() => import('../components/layout/AuroraBackground').then(m => m.AuroraBackground), { ssr: false });

import ErrorBoundary from '../components/common/ErrorBoundary';
import PageTransition from '../components/common/PageTransition';
import { initializeNotifications } from '../lib/pushNotifications';
import { startReminderChecker } from '../lib/notificationScheduler';
import { initErrorMonitoring } from '../lib/errorMonitoring';
import { bridge } from '../lib/native/NativeBridge';

// Engines Providers
const NotificationEngineProvider = dynamic(() => import('../components/notification-engine').then(m => m.NotificationEngineProvider), { ssr: false });
const NotificationToastProvider = dynamic(() => import('../components/notification-engine').then(m => m.NotificationToastProvider), { ssr: false });
const SearchEngineProvider = dynamic(() => import('../components/search-engine').then(m => m.SearchEngineProvider), { ssr: false });
const SearchPalette = dynamic(() => import('../components/search-engine').then(m => m.SearchPalette), { ssr: false });

import '../styles/globals.css';
import '../components/body-map/bodyMapStyles.css';

// Premium unified FAB (AI + Booking + Search + WhatsApp)
const FloatingActionButton = dynamic(() => import('../components/common/FloatingActionButton'), { ssr: false });

// Deferred global components — load after initial render is complete
const SmartHealthReminder = dynamic(() => import('../components/common/SmartHealthReminder'), { ssr: false });
const OnboardingTour = dynamic(() => import('../components/common/OnboardingTour'), { ssr: false });
const CompanionBot = dynamic(() => import('../components/ai/CompanionBot'), { ssr: false });

// Convert route path to page name
function getPageName(pathname: string): string {
    if (pathname === '/') return 'Home';
    const path = pathname.slice(1).split('/')[0];
    return path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

/** Animated top progress bar shown during route changes */
function RouteProgressBar({ isLoading }: { isLoading: boolean }) {
    if (!isLoading) return null;
    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1">
            <div
                className="h-full bg-gradient-to-r from-primary via-primary-light to-[#D4AF37] rounded-r-full animate-pulse"
                style={{
                    animation: 'progressBar 1.5s ease-in-out infinite',
                    width: '70%',
                }}
            />
            <style autoFocus>{`
                @keyframes progressBar {
                    0% { width: 0%; opacity: 1; }
                    50% { width: 70%; opacity: 1; }
                    100% { width: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
}

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const currentPageName = getPageName(router.pathname);
    const [isRouteChanging, setIsRouteChanging] = useState(false);
    const [deferredReady, setDeferredReady] = useState(false);
    
    // PERF-5 FIX: QueryClient created inside state to avoid shared instance bugs
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                retry: 1,
            },
        },
    }));

    // Route change progress indicator
    useEffect(() => {
        const handleStart = () => setIsRouteChanging(true);
        const handleComplete = () => setIsRouteChanging(false);

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleComplete);
        };
    }, [router]);

    // Initialize push notifications and reminder scheduler on app mount
    useEffect(() => {
        const timer = setTimeout(() => {
            initializeNotifications().catch(() => { });
            startReminderChecker();
            initErrorMonitoring();
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Defer non-critical overlays — load after page settles
    useEffect(() => {
        const timer = setTimeout(() => setDeferredReady(true), 4000);
        return () => clearTimeout(timer);
    }, []);

    // ── Native Init: StatusBar + Deep Links ──────────────────────
    useEffect(() => {
        if (!bridge.isNative) return;
        // إعداد StatusBar الديناميكي عند بداية التطبيق
        bridge.setStatusBarStyle('dark', '#FEFCF5').catch(() => {});

        // Deep Link handler
        const cleanup: (() => void)[] = [];
        bridge.setupDeepLinks((url) => {
            // مثال: tibrah://profile → /profile
            try {
                const parsed = new URL(url);
                const path = parsed.pathname || parsed.hostname;
                router.push(path).catch(() => {});
            } catch { /* رابط غير صالح */ }
        }).then(handle => {
            if (handle) cleanup.push(() => handle.remove());
        });

        return () => cleanup.forEach(fn => fn());
    }, [router]);

    const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(router.pathname);

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                <meta name="theme-color" content="#2D9B83" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="طِبرَا" />
                <title>طِبرَا - العيادة الرقمية</title>
            </Head>
            <AuroraBackground />
            <RouteProgressBar isLoading={isRouteChanging} />
            {/* NativeProvider يجب أن يكون الأول — يُهيّئ Safe Area وApp Lifecycle */}
            <NativeProvider>
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <AuthProvider>
                        <ThemeProvider>
                            <LanguageProvider>
                                <NotificationEngineProvider>
                                    <SearchEngineProvider>
                                        <AudioProvider>
                                            <CartProvider>
                                                <main className={`${alexandria.variable} ${outfit.variable} font-sans`}>
                                                    {isAuthRoute ? (
                                                        <PageTransition>
                                                            <Component {...pageProps} />
                                                        </PageTransition>
                                                    ) : (
                                                        <Layout currentPageName={currentPageName}>
                                                            <PageTransition>
                                                                <Component {...pageProps} />
                                                            </PageTransition>
                                                        </Layout>
                                                    )}
                                                    
                                                    <NotificationToastProvider />
                                                    <SearchPalette />
                                                
                                                {!isAuthRoute && (
                                                    <>
                                                        {/* Premium unified FAB — always available */}
                                                        <FloatingActionButton />
                                                        {/* Deferred overlays — load after page settles */}
                                                        {deferredReady && (
                                                            <>
                                                                <SmartHealthReminder />
                                                                <OnboardingTour />
                                                                <CompanionBot />
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                                </main>
                                            </CartProvider>
                                        </AudioProvider>
                                    </SearchEngineProvider>
                                </NotificationEngineProvider>
                            </LanguageProvider>
                        </ThemeProvider>
                    </AuthProvider>
                </ErrorBoundary>
            </QueryClientProvider>
            </NativeProvider>
        </>
    );
}
