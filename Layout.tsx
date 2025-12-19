import React, { ReactNode, useEffect } from 'react';
import FloatingAssistant from './components/common/FloatingAssistant';
import OfflineBanner from './components/common/OfflineBanner';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import LoadingScreen from './components/common/LoadingScreen';
import BottomNav from './components/navigation/BottomNav';
import Header from './components/navigation/Header';
import Footer from './components/navigation/Footer';
import { useAuth } from './contexts/AuthContext';
import { useAudio } from './contexts/AudioContext';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  currentPageName?: string;
}

export default function Layout({ children, currentPageName }: LayoutProps) {
  const { user, loading } = useAuth();
  const { currentTrack } = useAudio();
  const router = useRouter();


  // Pages that require authentication
  const protectedPages = [
    'Dashboard',
    'Profile',
    'HealthTracker',
    'Settings',
    'AdminDashboard',
    'Checkout',
    'BookAppointment'
  ];

  // Check if current page is protected
  const isProtectedPage = currentPageName && protectedPages.includes(currentPageName);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);

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
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-cairo overscroll-bounce">
      {/* PWA meta tags are in _document.tsx */}

      <OfflineBanner />

      {/* Header - shows different versions for mobile/desktop */}
      {!hideNav && <Header currentPageName={currentPageName} />}

      {/* Main Content - pb-24 for bottom nav on mobile, safe area aware */}
      <main className={`
        scroll-momentum
        ${hideNav ? 'safe-bottom' : 'pb-24' /* Default padding for nav */}
        ${currentTrack ? 'pb-48' : '' /* Extra padding if player is visible */}
        min-h-[calc(100vh-80px)]
      `}>
        <div className="px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer - Only on desktop for main pages */}
      {!hideFooter && <div className="hidden md:block"><Footer /></div>}

      {/* Floating Assistant */}
      <FloatingAssistant />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Mobile Bottom Nav - iOS Tab Bar Style with safe area */}
      {!hideNav && <BottomNav currentPageName={currentPageName} />}
    </div>
  );
}
