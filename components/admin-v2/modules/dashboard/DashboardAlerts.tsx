// components/admin-v2/modules/dashboard/DashboardAlerts.tsx
// Pending actions & operational warnings

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ShoppingBag, Calendar, ArrowLeft } from 'lucide-react';

interface DashboardAlertsProps {
  data: any;
}

export default function DashboardAlerts({ data }: DashboardAlertsProps) {
  if (!data) return null;

  const alerts: { icon: React.ReactNode; label: string; count: number; href: string; color: string }[] = [];

  if (data.pendingOrdersCount > 0) {
    alerts.push({
      icon: <ShoppingBag className="w-4 h-4" />,
      label: 'طلبات بانتظار المراجعة',
      count: data.pendingOrdersCount,
      href: '/admin/orders',
      color: '#f59e0b',
    });
  }

  if (data.pendingAppointmentsCount > 0) {
    alerts.push({
      icon: <Calendar className="w-4 h-4" />,
      label: 'مواعيد بانتظار التأكيد',
      count: data.pendingAppointmentsCount,
      href: '/admin/appointments',
      color: '#8b5cf6',
    });
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-700">تنبيهات تحتاج انتباهك</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {alerts.length} تنبيه
        </span>
      </div>
      <div className="admin-card-body p-0">
        {alerts.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">✅</span>
            </div>
            <p className="text-sm font-bold text-slate-600">لا توجد تنبيهات حالياً</p>
            <p className="text-xs text-slate-400 mt-0.5">كل شيء على ما يرام</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {alerts.map((alert, i) => (
              <Link key={i} href={alert.href}>
                <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${alert.color}10`, color: alert.color }}
                  >
                    {alert.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">{alert.label}</p>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${alert.color}15`, color: alert.color }}
                  >
                    {alert.count}
                  </span>
                  <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
