import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Head from 'next/head';
import Layout from '../Layout';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AudioProvider } from '../contexts/AudioContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import ErrorBoundary from '../components/common/ErrorBoundary';
import PageTransition from '../components/common/PageTransition';
import { initializeNotifications } from '../lib/pushNotifications';
import '../styles/globals.css';

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



export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const currentPageName = getPageName(router.pathname);

    // Initialize push notifications on app mount
    useEffect(() => {
        // Delay initialization to not block initial render
        const timer = setTimeout(() => {
            initializeNotifications().catch(() => {
                // Silently fail — user may have denied permissions
            });
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
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <AuthProvider>
                        <ThemeProvider>
                            <LanguageProvider>
                                <NotificationProvider>
                                    <AudioProvider>
                                        <Layout currentPageName={currentPageName}>
                                            <PageTransition>
                                                <Component {...pageProps} />
                                            </PageTransition>
                                        </Layout>
                                        <Toaster position="top-center" richColors />
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
