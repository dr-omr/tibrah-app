// pages/admin/recipes.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import RecipesPage from '@/components/admin-v2/modules/content/RecipesPage';

export default function AdminRecipesRoute() {
  return (
    <AdminShell pageTitle="إدارة الوصفات">
      <RecipesPage />
    </AdminShell>
  );
}
