// pages/admin/appointments.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import AppointmentsPage from '@/components/admin-v2/modules/appointments/AppointmentsPage';

export default function AdminAppointmentsRoute() {
  return (
    <AdminShell pageTitle="إدارة المواعيد">
      <AppointmentsPage />
    </AdminShell>
  );
}
