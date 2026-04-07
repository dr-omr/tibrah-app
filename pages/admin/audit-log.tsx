// pages/admin/audit-log.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import AuditLogPage from '@/components/admin-v2/modules/audit/AuditLogPage';

export default function AdminAuditLogRoute() {
  return (
    <AdminShell pageTitle="سجل المراجعة">
      <AuditLogPage />
    </AdminShell>
  );
}
