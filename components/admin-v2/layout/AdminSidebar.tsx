// components/admin-v2/layout/AdminSidebar.tsx
// Premium admin sidebar with grouped navigation

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard, Users, Stethoscope, ShoppingBag, Calendar,
  FileText, BookOpen, Utensils, ChefHat, Waves, Package,
  BarChart3, ScrollText, Settings, Shield, X, LogOut, Cloud,
  Video, Trophy, Share2
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingOrders?: number;
  pendingAppointments?: number;
}

const navGroups: NavGroup[] = [
  {
    label: 'الرئيسية',
    items: [
      { id: 'dashboard', label: 'لوحة القيادة', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'العمليات',
    items: [
      { id: 'telehealth', label: 'العيادة الافتراضية', href: '/admin/telehealth', icon: Video },
      { id: 'clinical', label: 'الذكاء السريري', href: '/admin/clinical', icon: Stethoscope },
      { id: 'appointments', label: 'المواعيد', href: '/admin/appointments', icon: Calendar },
      { id: 'broadcast', label: 'مركز البث والإشعارات', href: '/admin/broadcast', icon: Users }, // Added Broadcast Hub
      { id: 'orders', label: 'الطلبات والمدفوعات', href: '/admin/orders', icon: ShoppingBag },
      { id: 'users', label: 'المستخدمين', href: '/admin/users', icon: Users },
    ],
  },
  {
    label: 'المحتوى',
    items: [
      { id: 'content', label: 'المقالات', href: '/admin/content', icon: FileText },
      { id: 'courses', label: 'الدورات', href: '/admin/courses', icon: BookOpen },
      { id: 'products', label: 'المنتجات', href: '/admin/products', icon: Package },
      { id: 'foods', label: 'الأطعمة', href: '/admin/foods', icon: Utensils },
      { id: 'recipes', label: 'الوصفات', href: '/admin/recipes', icon: ChefHat },
      { id: 'frequencies', label: 'الترددات', href: '/admin/frequencies', icon: Waves },
    ],
  },
  {
    label: 'النمو والولاء',
    items: [
      { id: 'loyalty', label: 'النقاط والمكافآت', href: '/admin/loyalty', icon: Trophy },
      { id: 'workflows', label: 'أتمتة المريض', href: '/admin/workflows', icon: Share2 },
    ],
  },
  {
    label: 'النظام',
    items: [
      { id: 'analytics', label: 'التقارير والتحليلات', href: '/admin/analytics', icon: BarChart3 },
      { id: 'audit-log', label: 'سجل المراجعة', href: '/admin/audit-log', icon: ScrollText },
      { id: 'settings', label: 'الإعدادات', href: '/admin/settings', icon: Settings },
      { id: 'cloud-sync', label: 'مزامنة السحابة', href: '/admin/cloud-sync', icon: Cloud },
    ],
  },
];

export default function AdminSidebar({ isOpen, onClose, pendingOrders = 0, pendingAppointments = 0 }: AdminSidebarProps) {
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return router.pathname === '/admin' || router.pathname === '/admin/dashboard';
    }
    return router.pathname === href;
  };

  // Inject badge counts
  const getItemBadge = (id: string): number | undefined => {
    if (id === 'orders' && pendingOrders > 0) return pendingOrders;
    if (id === 'appointments' && pendingAppointments > 0) return pendingAppointments;
    return undefined;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="admin-sidebar-overlay lg:hidden"
          style={{ display: 'block' }}
          onClick={onClose}
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo Section */}
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-icon">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm leading-tight truncate">مركز عمليات طِبرَا</h1>
            <p className="text-slate-500 text-[10px] font-medium">Administration Platform</p>
          </div>
          <button
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav admin-scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label} className="admin-nav-group">
              <div className="admin-nav-group-label">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const badge = getItemBadge(item.id);
                return (
                  <Link key={item.id} href={item.href}>
                    <button
                      className={`admin-nav-item relative ${active ? 'active' : ''}`}
                      onClick={() => onClose()}
                    >
                      <Icon className="admin-nav-icon" />
                      <span>{item.label}</span>
                      {badge !== undefined && badge > 0 && (
                        <span className="admin-nav-badge">{badge}</span>
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <Link href="/">
            <button className="admin-nav-item text-red-400 hover:!text-red-300 hover:!bg-red-950/30">
              <LogOut className="admin-nav-icon !opacity-100" />
              <span>العودة للموقع</span>
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}
