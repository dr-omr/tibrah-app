// pages/admin/broadcast.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import BroadcastPage from '@/components/admin-v2/modules/broadcast/BroadcastPage';

export default function AdminBroadcastRoute() {
  return (
    <AdminShell pageTitle="مركز البث المباشر">
      <BroadcastPage />
    </AdminShell>
  );
}
