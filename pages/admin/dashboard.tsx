// pages/admin/dashboard.tsx
// Executive Command Center — The main admin dashboard

import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import DashboardPage from '@/components/admin-v2/modules/dashboard/DashboardPage';

export default function AdminDashboardRoute() {
  return (
    <AdminShell pageTitle="لوحة القيادة">
      <DashboardPage />
    </AdminShell>
  );
}
