// pages/admin/foods.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import FoodsPage from '@/components/admin-v2/modules/content/FoodsPage';

export default function AdminFoodsRoute() {
  return (
    <AdminShell pageTitle="إدارة الأطعمة">
      <FoodsPage />
    </AdminShell>
  );
}
