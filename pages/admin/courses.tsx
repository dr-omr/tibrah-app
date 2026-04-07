// pages/admin/courses.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import CoursesPage from '@/components/admin-v2/modules/courses/CoursesPage';

export default function AdminCoursesRoute() {
  return (
    <AdminShell pageTitle="إدارة الدورات">
      <CoursesPage />
    </AdminShell>
  );
}
