// pages/admin/settings.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import SettingsPage from '@/components/admin-v2/modules/settings/SettingsPage';

export default function AdminSettingsRoute() {
  return (
    <AdminShell pageTitle="إعدادات المنصة">
      <SettingsPage />
    </AdminShell>
  );
}
