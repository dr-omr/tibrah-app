// pages/admin/analytics.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import AnalyticsPage from '@/components/admin-v2/modules/analytics/AnalyticsPage';

export default function AdminAnalyticsRoute() {
  return (
    <AdminShell pageTitle="التقارير والتحليلات">
      <AnalyticsPage />
    </AdminShell>
  );
}
