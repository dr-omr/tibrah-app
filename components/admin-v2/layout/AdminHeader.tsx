// components/admin-v2/layout/AdminHeader.tsx
// Admin top bar: breadcrumb, search, notifications, user

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, Search, Bell, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminBreadcrumb, { getBreadcrumbItems } from './AdminBreadcrumb';

interface AdminHeaderProps {
  onMenuClick: () => void;
  pageTitle?: string;
}

export default function AdminHeader({ onMenuClick, pageTitle }: AdminHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const breadcrumbItems = getBreadcrumbItems(router.pathname);

  const getPageTitle = (): string => {
    if (pageTitle) return pageTitle;
    const titleMap: Record<string, string> = {
      '/admin/dashboard': 'لوحة القيادة',
      '/admin/users': 'إدارة المستخدمين',
      '/admin/clinical': 'الذكاء السريري',
      '/admin/orders': 'الطلبات والمدفوعات',
      '/admin/appointments': 'إدارة المواعيد',
      '/admin/content': 'إدارة المقالات',
      '/admin/courses': 'إدارة الدورات',
      '/admin/foods': 'إدارة الأطعمة',
      '/admin/recipes': 'إدارة الوصفات',
      '/admin/frequencies': 'إدارة الترددات',
      '/admin/products': 'إدارة المنتجات',
      '/admin/analytics': 'التقارير والتحليلات',
      '/admin/audit-log': 'سجل المراجعة',
      '/admin/settings': 'الإعدادات',
      '/admin/cloud-sync': 'مزامنة السحابة',
    };
    return titleMap[router.pathname] || 'لوحة الإدارة';
  };

  return (
    <header className="admin-header">
      {/* Mobile menu button */}
      <button
        className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors -mr-2"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Left side: title + breadcrumb */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-slate-800 truncate leading-tight">
          {getPageTitle()}
        </h1>
        {breadcrumbItems.length > 0 && (
          <div className="mt-0.5">
            <AdminBreadcrumb items={breadcrumbItems} />
          </div>
        )}
      </div>

      {/* Right side: actions */}
      <div className="flex items-center gap-2">
        {/* Search toggle */}
        {searchOpen ? (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث سريع..."
              className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-48"
              autoFocus
            />
            <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
              <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
            </button>
          </div>
        ) : (
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-[18px] h-[18px]" />
          </button>
        )}

        {/* Notifications */}
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pr-2 border-r border-slate-100 mr-1">
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-700 leading-tight">{user?.name || 'المدير'}</p>
            <p className="text-[10px] text-slate-400 font-medium">مدير النظام</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {(user?.name || 'م').charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
