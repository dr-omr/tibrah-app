// components/admin-v2/modules/dashboard/DashboardRecentActivity.tsx
// Recent orders and appointments as real activity feed

import React from 'react';
import { Clock, ShoppingBag, Calendar, User } from 'lucide-react';
import { StatusBadgeAuto } from '../../primitives/AdminStatusBadge';

interface DashboardRecentActivityProps {
  data: any;
}

export default function DashboardRecentActivity({ data }: DashboardRecentActivityProps) {
  if (!data) return null;

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffMins < 1) return 'الآن';
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      if (diffDays < 7) return `منذ ${diffDays} يوم`;
      return date.toLocaleDateString('ar-SA');
    } catch { return '—'; }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Orders */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            أحدث الطلبات
          </h3>
          <a href="/admin/orders" className="text-xs font-semibold text-teal-600 hover:text-teal-700">عرض الكل</a>
        </div>
        <div className="admin-card-body p-0">
          {(!data.recentOrders || data.recentOrders.length === 0) ? (
            <div className="p-6 text-center text-sm text-slate-400">لا توجد طلبات</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {data.recentOrders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{order.user_name || 'طلب جديد'}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatTime(order.created_at)}
                      {order.total && <span className="font-bold text-slate-500 mr-2">{order.total} ر.س</span>}
                    </p>
                  </div>
                  <StatusBadgeAuto status={order.status || 'pending'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-500" />
            أحدث المستخدمين
          </h3>
          <a href="/admin/users" className="text-xs font-semibold text-teal-600 hover:text-teal-700">عرض الكل</a>
        </div>
        <div className="admin-card-body p-0">
          {(!data.recentUsers || data.recentUsers.length === 0) ? (
            <div className="p-6 text-center text-sm text-slate-400">لا يوجد مستخدمين</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {data.recentUsers.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    {(user.name || user.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{user.name || user.displayName || 'مستخدم'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    {formatTime(user.created_at || user.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
