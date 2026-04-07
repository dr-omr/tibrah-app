// pages/admin/workflows.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import WorkflowsPage from '@/components/admin-v2/modules/marketing/WorkflowsPage';

export default function AdminWorkflowsRoute() {
  return (
    <AdminShell pageTitle="أتمتة المريض">
      <WorkflowsPage />
    </AdminShell>
  );
}
