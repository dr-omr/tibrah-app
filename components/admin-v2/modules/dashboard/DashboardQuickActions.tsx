// components/admin-v2/modules/dashboard/DashboardQuickActions.tsx
// High-leverage shortcut buttons

import React from 'react';
import Link from 'next/link';
import { Plus, ShoppingBag, UserPlus, FileText, Stethoscope, Cloud, BarChart3, Settings } from 'lucide-react';

const quickActions = [
  { icon: <ShoppingBag className="w-4 h-4" />, label: 'مراجعة الطلبات', href: '/admin/orders', color: '#f59e0b' },
  { icon: <Stethoscope className="w-4 h-4" />, label: 'المراجعة السريرية', href: '/admin/clinical', color: '#2d9b83' },
  { icon: <FileText className="w-4 h-4" />, label: 'إضافة مقال', href: '/admin/content', color: '#3b82f6' },
  { icon: <BarChart3 className="w-4 h-4" />, label: 'التقارير', href: '/admin/analytics', color: '#8b5cf6' },
  { icon: <Cloud className="w-4 h-4" />, label: 'مزامنة السحابة', href: '/admin/cloud-sync', color: '#06b6d4' },
  { icon: <Settings className="w-4 h-4" />, label: 'الإعدادات', href: '/admin/settings', color: '#64748b' },
];

export default function DashboardQuickActions() {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Plus className="w-4 h-4 text-teal-500" />
          إجراءات سريعة
        </h3>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {quickActions.map((action, i) => (
          <Link key={i} href={action.href}>
            <button className="w-full flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all text-right group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                style={{ background: `${action.color}10`, color: action.color }}
              >
                {action.icon}
              </div>
              <span className="text-xs font-semibold text-slate-600 leading-tight">{action.label}</span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
