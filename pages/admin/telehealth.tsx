// pages/admin/telehealth.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import TelehealthPage from '@/components/admin-v2/modules/telehealth/TelehealthPage';

export default function AdminTelehealthRoute() {
  return (
    <AdminShell pageTitle="العيادة الافتراضية">
      <TelehealthPage />
    </AdminShell>
  );
}
