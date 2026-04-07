// pages/admin/clinical.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import ClinicalPage from '@/components/admin-v2/modules/clinical/ClinicalPage';

export default function AdminClinicalRoute() {
  return (
    <AdminShell pageTitle="الذكاء السريري">
      <ClinicalPage />
    </AdminShell>
  );
}
