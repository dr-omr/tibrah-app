// components/admin-v2/modules/dashboard/DashboardKPIGrid.tsx
// Real KPI cards from dashboard data

import React from 'react';
import { Users, ShoppingBag, DollarSign, Calendar, FileText, BookOpen, Package, Stethoscope } from 'lucide-react';
import AdminStatCard from '../../primitives/AdminStatCard';

interface DashboardKPIGridProps {
  data: any;
}

export default function DashboardKPIGrid({ data }: DashboardKPIGridProps) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <AdminStatCard
        title="إجمالي المستخدمين"
        value={data.usersCount || 0}
        icon={<Users className="w-5 h-5" />}
        accentColor="#2d9b83"
        suffix="مستخدم"
      />
      <AdminStatCard
        title="الطلبات قيد الانتظار"
        value={data.pendingOrdersCount || 0}
        icon={<ShoppingBag className="w-5 h-5" />}
        accentColor="#f59e0b"
        suffix="طلب"
      />
      <AdminStatCard
        title="إجمالي الإيرادات"
        value={data.totalRevenue || 0}
        icon={<DollarSign className="w-5 h-5" />}
        accentColor="#10b981"
        suffix="ر.س"
      />
      <AdminStatCard
        title="المواعيد المعلقة"
        value={data.pendingAppointmentsCount || 0}
        icon={<Calendar className="w-5 h-5" />}
        accentColor="#8b5cf6"
        suffix="موعد"
      />
      <AdminStatCard
        title="المقالات المنشورة"
        value={data.articlesCount || 0}
        icon={<FileText className="w-5 h-5" />}
        accentColor="#3b82f6"
      />
      <AdminStatCard
        title="الدورات التعليمية"
        value={data.coursesCount || 0}
        icon={<BookOpen className="w-5 h-5" />}
        accentColor="#ec4899"
      />
      <AdminStatCard
        title="المنتجات"
        value={data.productsCount || 0}
        icon={<Package className="w-5 h-5" />}
        accentColor="#06b6d4"
      />
      <AdminStatCard
        title="إجمالي الطلبات"
        value={data.ordersCount || 0}
        icon={<Stethoscope className="w-5 h-5" />}
        accentColor="#6366f1"
      />
    </div>
  );
}
