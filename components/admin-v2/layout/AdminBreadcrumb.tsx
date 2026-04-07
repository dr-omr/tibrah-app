// components/admin-v2/layout/AdminBreadcrumb.tsx
// Dynamic breadcrumb trail for admin pages

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      <Link
        href="/admin/dashboard"
        className="text-slate-400 hover:text-slate-600 transition-colors font-medium text-xs"
      >
        لوحة التحكم
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronLeft className="w-3 h-3 text-slate-300" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-slate-400 hover:text-slate-600 transition-colors font-medium text-xs"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-700 font-semibold text-xs">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Helper: get breadcrumb config from pathname
export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const map: Record<string, BreadcrumbItem[]> = {
    '/admin/dashboard': [],
    '/admin/users': [{ label: 'المستخدمين' }],
    '/admin/clinical': [{ label: 'الذكاء السريري' }],
    '/admin/orders': [{ label: 'الطلبات والمدفوعات' }],
    '/admin/appointments': [{ label: 'المواعيد' }],
    '/admin/content': [{ label: 'المحتوى', href: '/admin/content' }, { label: 'المقالات' }],
    '/admin/courses': [{ label: 'المحتوى', href: '/admin/content' }, { label: 'الدورات' }],
    '/admin/foods': [{ label: 'المحتوى', href: '/admin/content' }, { label: 'الأطعمة' }],
    '/admin/recipes': [{ label: 'المحتوى', href: '/admin/content' }, { label: 'الوصفات' }],
    '/admin/frequencies': [{ label: 'المحتوى', href: '/admin/content' }, { label: 'الترددات' }],
    '/admin/products': [{ label: 'المنتجات' }],
    '/admin/analytics': [{ label: 'التقارير والتحليلات' }],
    '/admin/audit-log': [{ label: 'سجل المراجعة' }],
    '/admin/settings': [{ label: 'الإعدادات' }],
    '/admin/cloud-sync': [{ label: 'النظام', href: '/admin/settings' }, { label: 'مزامنة السحابة' }],
  };

  return map[pathname] || [];
}
