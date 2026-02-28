import React, { ReactNode, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import LoadingScreen from './components/common/LoadingScreen';
import SkipLinks, { MainContent } from './components/common/SkipLinks';
import BottomNav from './components/navigation/BottomNav';
import Header from './components/navigation/Header';
import Footer from './components/navigation/Footer';
import { useAuth } from './contexts/AuthContext';
import { useAudio } from './contexts/AudioContext';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';

// Dynamic imports — these are client-only interactive components
const FloatingAssistant = dynamic(() => import('./components/common/FloatingAssistant'), { ssr: false });
const NetworkStatusBanner = dynamic(() => import('./components/common/NetworkStatusBanner'), { ssr: false });
const CommandPalette = dynamic(() => import('./components/common/CommandPalette'), { ssr: false });
const PWAInstallPrompt = dynamic(() => import('./components/common/PWAInstallPrompt'), { ssr: false });
const GlobalMiniPlayer = dynamic(() => import('./components/frequencies/GlobalMiniPlayer'), { ssr: false });
const OnboardingFlow = dynamic(() => import('./components/common/OnboardingFlow'), { ssr: false });

interface LayoutProps {
  children: ReactNode;
  currentPageName?: string;
}

export default function Layout({ children, currentPageName }: LayoutProps) {
  const { user, loading } = useAuth();
  const { currentTrack } = useAudio();
  const router = useRouter();
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const done = localStorage.getItem('onboardingComplete');
      if (!done) setShowOnboarding(true);
    }
  }, []);

  // Global Ctrl+K / ⌘+K shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  // Pages that require authentication
  const protectedPages = [
    'AdminDashboard',
    'Profile',
    'MedicalFile',
    'Rewards',
    'Settings',
    'MyAppointments',
  ];

  // Check if current page is protected
  const isProtectedPage = currentPageName && protectedPages.includes(currentPageName);



  // Redirect to login if page is protected and user is not authenticated
  useEffect(() => {
    if (!loading && isProtectedPage && !user) {
      router.push('/login');
    }
  }, [loading, isProtectedPage, user, router]);

  // Show loader while checking auth on protected pages
  if (loading && isProtectedPage) {
    return <LoadingScreen message="جاري التحقق من تسجيل الدخول..." />;
  }

  // Don't render protected page if not authenticated
  if (!loading && isProtectedPage && !user) {
    return <LoadingScreen message="جاري التوجيه لتسجيل الدخول..." />;
  }

  // Pages where navigation should be hidden
  const hideNav = ['Checkout', 'ProductDetails', 'BookAppointment', 'ProgramDetails', 'ArticleDetails', 'HealthTracker', 'CourseDetails', 'RifeFrequencies', 'AdminDashboard', 'Settings', 'Login'].includes(currentPageName || '');

  // Pages where footer should be hidden
  const hideFooter = ['Checkout', 'BookAppointment', 'Login', 'AdminDashboard', 'Settings'].includes(currentPageName || '');

  return (
    <>
      {/* Onboarding for first-time users */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 font-cairo overscroll-bounce transition-colors duration-300">
        {/* Accessibility: Skip Links */}
        <SkipLinks />

        {/* Network Status Banner (Enhanced Offline + Slow Connection) */}
        <NetworkStatusBanner />

        {/* Header - shows different versions for mobile/desktop */}
        {!hideNav && <Header currentPageName={currentPageName} />}

        {/* Main Content - pb-24 for bottom nav on mobile, safe area aware */}
        <MainContent>
          <div className={`
          scroll-momentum
          ${hideNav ? 'safe-bottom' : 'pb-24' /* Default padding for nav */}
          ${currentTrack ? 'pb-48' : '' /* Extra padding if player is visible */}
          min-h-[calc(100vh-80px)]
        `}>
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </MainContent>

        {/* Footer - Only on desktop for main pages */}
        {!hideFooter && <div className="hidden md:block"><Footer /></div>}

        {/* Command Palette - Global Search */}
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
        />

        {/* Floating Assistant */}
        <FloatingAssistant />

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Global Mini Player */}
        {!hideNav && <GlobalMiniPlayer />}

        {/* Mobile Bottom Nav - iOS Tab Bar Style with safe area */}
        {!hideNav && <BottomNav currentPageName={currentPageName} />}
      </div>
    </>
  );
}
