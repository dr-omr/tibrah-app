import React, { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Layout from '../Layout';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AudioProvider } from '../contexts/AudioContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { CartProvider } from '../contexts/CartContext';
import ErrorBoundary from '../components/common/ErrorBoundary';
import PageTransition from '../components/common/PageTransition';
import { initializeNotifications } from '../lib/pushNotifications';
import { startReminderChecker } from '../lib/notificationScheduler';
import { initErrorMonitoring } from '../lib/errorMonitoring';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import '../styles/globals.css';

// Dynamic imports for non-critical global components (reduces initial bundle)
const NetworkStatus = dynamic(() => import('../components/common/NetworkStatus'), { ssr: false });
const FloatingActionButton = dynamic(() => import('../components/common/FloatingActionButton'), { ssr: false });
const GlobalSearch = dynamic(() => import('../components/common/GlobalSearch'), { ssr: false });
const SmartHealthReminder = dynamic(() => import('../components/common/SmartHealthReminder'), { ssr: false });
const OnboardingTour = dynamic(() => import('../components/common/OnboardingTour'), { ssr: false });

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
        },
    },
});

// Convert route path to page name
function getPageName(pathname: string): string {
    if (pathname === '/') return 'Home';
    // Remove leading slash and convert kebab-case to PascalCase
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
                className="h-full bg-gradient-to-r from-[#2D9B83] via-[#3FB39A] to-[#D4AF37] rounded-r-full animate-pulse"
                style={{
                    animation: 'progressBar 1.5s ease-in-out infinite',
                    width: '70%',
                }}
            />
            <style jsx>{`
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
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Global keyboard shortcuts
    useKeyboardShortcuts({ onSearch: () => setIsSearchOpen(true) });

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
        // Delay initialization to not block initial render
        const timer = setTimeout(() => {
            initializeNotifications().catch(() => {
                // Silently fail — user may have denied permissions
            });
            // Start the health reminder scheduler
            startReminderChecker();
            // Initialize error monitoring (global error handlers)
            initErrorMonitoring();
        }, 3000);
        return () => clearTimeout(timer);
    }, []);
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
            <RouteProgressBar isLoading={isRouteChanging} />
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <AuthProvider>
                        <ThemeProvider>
                            <LanguageProvider>
                                <NotificationProvider>
                                    <AudioProvider>
                                        <CartProvider>
                                            <Layout currentPageName={currentPageName}>
                                                <PageTransition>
                                                    <Component {...pageProps} />
                                                </PageTransition>
                                            </Layout>
                                            <Toaster position="top-center" richColors />
                                            <NetworkStatus />
                                            <FloatingActionButton onSearchOpen={() => setIsSearchOpen(true)} />
                                            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
                                            <SmartHealthReminder />
                                            <OnboardingTour />
                                        </CartProvider>
                                    </AudioProvider>
                                </NotificationProvider>
                            </LanguageProvider>
                        </ThemeProvider>
                    </AuthProvider>
                </ErrorBoundary>
            </QueryClientProvider>
        </>
    );
}
