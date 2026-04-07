// components/admin-v2/modules/dashboard/DashboardPage.tsx
// Executive Command Center — real KPIs, activity, alerts, quick actions

import React from 'react';
import { useDashboardOverview } from '../../hooks/useAdminData';
import DashboardKPIGrid from './DashboardKPIGrid';
import DashboardRecentActivity from './DashboardRecentActivity';
import DashboardAlerts from './DashboardAlerts';
import DashboardQuickActions from './DashboardQuickActions';
import { PageSkeleton } from '../../primitives/AdminLoadingSkeleton';

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardOverview();

  if (isLoading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="admin-card p-8 text-center">
        <p className="text-sm text-red-500 font-medium">خطأ في تحميل البيانات</p>
        <p className="text-xs text-slate-400 mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <DashboardKPIGrid data={data} />

      {/* Alerts + Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardAlerts data={data} />
        </div>
        <div>
          <DashboardQuickActions />
        </div>
      </div>

      {/* Recent Activity */}
      <DashboardRecentActivity data={data} />
    </div>
  );
}
