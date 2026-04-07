// pages/admin/frequencies.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import FrequenciesPage from '@/components/admin-v2/modules/content/FrequenciesPage';

export default function AdminFrequenciesRoute() {
  return (
    <AdminShell pageTitle="إدارة الترددات">
      <FrequenciesPage />
    </AdminShell>
  );
}
