// pages/admin/protocols.tsx — Sprint 6
// Protocol Observability Dashboard

import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import ProtocolObservabilityPage from '@/components/admin-v2/modules/protocols/ProtocolObservabilityPage';

export default function AdminProtocolsRoute() {
    return (
        <AdminShell pageTitle="مراقبة البروتوكولات">
            <ProtocolObservabilityPage />
        </AdminShell>
    );
}
