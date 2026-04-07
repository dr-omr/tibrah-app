// pages/admin/users.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import UsersPage from '@/components/admin-v2/modules/users/UsersPage';

export default function AdminUsersRoute() {
  return (
    <AdminShell pageTitle="إدارة المستخدمين">
      <UsersPage />
    </AdminShell>
  );
}
