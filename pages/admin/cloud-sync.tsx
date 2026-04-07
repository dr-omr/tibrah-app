// pages/admin/cloud-sync.tsx
// Cloud Sync — migrated into AdminShell layout
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import CloudSyncPage from '@/components/admin-v2/modules/settings/CloudSyncPage';

export default function AdminCloudSyncRoute() {
  return (
    <AdminShell pageTitle="مزامنة السحابة">
      <CloudSyncPage />
    </AdminShell>
  );
}
