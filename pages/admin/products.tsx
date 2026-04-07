// pages/admin/products.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import ProductsPage from '@/components/admin-v2/modules/products/ProductsPage';

export default function AdminProductsRoute() {
  return (
    <AdminShell pageTitle="إدارة المنتجات">
      <ProductsPage />
    </AdminShell>
  );
}
