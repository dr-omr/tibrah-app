// components/admin-v2/layout/AdminShell.tsx
// Main admin layout wrapper: sidebar + header + content area

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { ShieldAlert } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pendingOrders?: number;
  pendingAppointments?: number;
}

export default function AdminShell({
  children,
  pageTitle,
  pendingOrders = 0,
  pendingAppointments = 0,
}: AdminShellProps) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}&reason=admin`);
    }
  }, [loading, user, isAdmin, router]);

  // Auth guard — redirect non-admins
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-teal-500/10 animate-pulse"></div>
        <div className="relative z-10 bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl text-center flex flex-col items-center">
           <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mb-6" />
           <p className="text-slate-300 font-bold tracking-wide">جاري مصادقة التشفير المركزي...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-rose-500/10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Shield Icon Container */}
        <div className="relative z-10 bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl text-center max-w-sm w-full transform transition-all hover:scale-105 duration-500">
           <div className="w-20 h-20 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(244,63,94,0.3)]">
             <ShieldAlert className="w-10 h-10 text-rose-400" />
           </div>
           <h2 className="text-2xl font-black text-white mb-2 tracking-wide">الوصول مقفل مجدداً</h2>
           <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">لا تملك صلاحيات مسؤول (Admin) موثقة. جاري توجيهك بأمان...</p>
           
           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
               <div className="w-1/2 h-full bg-rose-500 animate-[progress_1.5s_ease-in-out_infinite]"></div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle ? `${pageTitle} — إدارة طِبرَا` : 'مركز عمليات طِبرَا'}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="admin-shell">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          pendingOrders={pendingOrders}
          pendingAppointments={pendingAppointments}
        />

        <main className="admin-main">
          <AdminHeader
            onMenuClick={() => setSidebarOpen(true)}
            pageTitle={pageTitle}
          />
          <div className="admin-content">
            <div className="admin-page-active">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
