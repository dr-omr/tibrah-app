import React, { ReactNode, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import SkipLinks, { MainContent } from '@/components/common/SkipLinks';
import BottomNav from '@/components/navigation/BottomNav';
import Header from '@/components/navigation/Header';
import Footer from '@/components/navigation/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { useNative } from '@/contexts/NativeContext';
import { AnimatePresence } from 'framer-motion';
import { PROTECTED_PAGE_NAMES, HIDE_NAV_PAGES, HIDE_FOOTER_PAGES } from '@/lib/routes';
import PullToRefresh from '@/components/native/PullToRefresh';

// Dynamic imports — these are client-only interactive components
// FloatingAssistant merged into unified FloatingActionButton (in _app.tsx)
const NetworkStatusBanner = dynamic(() => import('@/components/common/NetworkStatusBanner'), { ssr: false });
const PWAInstallPrompt = dynamic(() => import('@/components/common/PWAInstallPrompt'), { ssr: false });
const GlobalMiniPlayer = dynamic(() => import('@/components/frequencies/GlobalMiniPlayer'), { ssr: false });
const OnboardingFlow = dynamic(() => import('@/components/common/OnboardingFlow'), { ssr: false });
const PredictiveEngine = dynamic(() => import('@/components/notifications/PredictiveEngine'), { ssr: false });
const HealthKitSync = dynamic(() => import('@/components/native/HealthKitSync'), { ssr: false });

interface LayoutProps {
  children: ReactNode;
  currentPageName?: string;
}

export default function Layout({ children, currentPageName }: LayoutProps) {
  const { user } = useAuth();
  const { currentTrack } = useAudio();
  const { safeAreaInsets, isKeyboardVisible, isNative } = useNative();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Only show onboarding for logged-in users who haven't completed it
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const done = localStorage.getItem('onboardingComplete');
      if (!done) setShowOnboarding(true);
    }
  }, [user]);

  // حساب الـ padding الديناميكي بناءً على Safe Area الحقيقية
  const bottomPadding = isNative
    ? Math.max(safeAreaInsets.bottom + 56, 80) // 56px nav + safe area
    : 96; // web default




  // Pages that require authentication — from centralized route config
  const protectedPages = PROTECTED_PAGE_NAMES as readonly string[];

  // Check if current page is protected
  const isProtectedPage = currentPageName && protectedPages.includes(currentPageName);



  // Removed legacy brutal UI redirects.
  // Authentication visualization is now gracefully handled by ProtectedRoute and AuthGate.

  // Pages where navigation should be hidden
  const hideNav = (HIDE_NAV_PAGES as readonly string[]).includes(currentPageName || '');

  // Pages where footer should be hidden
  const hideFooter = (HIDE_FOOTER_PAGES as readonly string[]).includes(currentPageName || '');

  return (
    <>
      {/* Onboarding for first-time users */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

      {/* Root Layout Layer: transparent to let Aurora background shine through */}
      <div dir="rtl" className="min-h-screen relative z-0 font-tajawal overscroll-bounce text-slate-800 dark:text-slate-100 transition-colors duration-300">
        {/* Accessibility: Skip Links */}
        <SkipLinks />

        {/* Network Status Banner (Enhanced Offline + Slow Connection) */}
        <NetworkStatusBanner />

        {/* Header - shows different versions for mobile/desktop */}
        {!hideNav && <Header currentPageName={currentPageName} />}

        {/* Main Content — padding ديناميكي من Safe Area الحقيقية */}
        <MainContent>
          <PullToRefresh 
            onRefresh={async () => {
              // Trigger a global reload/refresh logic. Wait for 1.5s as mock for now, or re-fetch active queries.
              // In the future this triggers queryClient.invalidateQueries() or window.location.reload()
              await new Promise(r => setTimeout(r, 1500));
            }}
          >
            <div
              style={{
                paddingBottom: hideNav
                  ? `${safeAreaInsets.bottom}px`
                  : `${bottomPadding + (currentTrack ? 64 : 0)}px`,
                // نترك مساحة للكيبورد على الأجهزة الناتفية
                marginBottom: isKeyboardVisible && isNative ? 0 : undefined,
              }}
              className="scroll-momentum min-h-[calc(100vh-80px)]"
            >
              {children}
            </div>
          </PullToRefresh>
        </MainContent>

        {/* Footer - Only on desktop for main pages */}
        {!hideFooter && <div className="hidden md:block"><Footer /></div>}



        {/* FloatingAssistant merged into unified FAB in _app.tsx */}

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Global Mini Player */}
        {!hideNav && <GlobalMiniPlayer />}

        {/* Mobile Bottom Nav - يُخفى تلقائياً عند فتح الكيبورد */}
        {!hideNav && !isKeyboardVisible && <BottomNav currentPageName={currentPageName} />}

        {/* Predictive AI Push Notifications Engine (Headless) */}
        {!hideNav && <PredictiveEngine />}

        {/* Native Mobile Health Sync Background Processor (Headless) */}
        {!hideNav && <HealthKitSync />}
      </div>
    </>
  );
}
