// pages/admin/loyalty.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import LoyaltyPage from '@/components/admin-v2/modules/marketing/LoyaltyPage';

export default function AdminLoyaltyRoute() {
  return (
    <AdminShell pageTitle="نقاط الولاء والمكافآت">
      <LoyaltyPage />
    </AdminShell>
  );
}
