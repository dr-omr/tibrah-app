// pages/admin/content.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import ContentPage from '@/components/admin-v2/modules/content/ContentPage';

export default function AdminContentRoute() {
  return (
    <AdminShell pageTitle="إدارة المقالات">
      <ContentPage />
    </AdminShell>
  );
}
