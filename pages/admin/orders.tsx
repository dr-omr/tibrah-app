// pages/admin/orders.tsx
import React from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import OrdersPage from '@/components/admin-v2/modules/orders/OrdersPage';

export default function AdminOrdersRoute() {
  return (
    <AdminShell pageTitle="الطلبات والمدفوعات">
      <OrdersPage />
    </AdminShell>
  );
}
