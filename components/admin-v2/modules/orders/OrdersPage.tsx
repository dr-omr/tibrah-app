// components/admin-v2/modules/orders/OrdersPage.tsx
// Order management with Visual Status Timeline and Digital/Physical parsing

import React, { useState, useMemo } from 'react';
import { ShoppingBag, DollarSign, Clock, Package, TruckIcon, CheckCircle2, XCircle, MonitorDown, FileText, ChevronDown } from 'lucide-react';
import { useAdminOrders, useOrderStatusMutation } from '../../hooks/useAdminData';
import useAuditLog from '../../hooks/useAuditLog';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import AdminDataTable, { Column } from '../../primitives/AdminDataTable';
import AdminFilterBar from '../../primitives/AdminFilterBar';
import AdminDetailDrawer from '../../primitives/AdminDetailDrawer';
import AdminStatCard from '../../primitives/AdminStatCard';
import AdminConfirmDialog from '../../primitives/AdminConfirmDialog';
import { StatusBadgeAuto } from '../../primitives/AdminStatusBadge';
import { StatGridSkeleton, TableSkeleton } from '../../primitives/AdminLoadingSkeleton';
import { Button } from '@/components/ui/button';

// Enhanced Workflow
const STATUS_FLOW_PHYSICAL = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_FLOW_DIGITAL = ['pending', 'confirmed', 'delivered']; // Bypasses shipping

const STATUS_DATA: Record<string, { label: string, color: string, icon: any }> = {
  pending: { label: 'قيد المراجعة', color: 'bg-amber-500', icon: Clock },
  confirmed: { label: 'مؤكد', color: 'bg-indigo-500', icon: CheckCircle2 },
  processing: { label: 'جاري التجهيز', color: 'bg-blue-500', icon: Package },
  shipped: { label: 'في الطريق', color: 'bg-violet-500', icon: TruckIcon },
  delivered: { label: 'مكتمل وتم التسليم', color: 'bg-emerald-500', icon: CheckCircle2 },
  cancelled: { label: 'ملغي', color: 'bg-rose-500', icon: XCircle },
};

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useAdminOrders();
  const statusMutation = useOrderStatusMutation();
  const audit = useAuditLog();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [cancelDialog, setCancelDialog] = useState<string | null>(null);

  // Stats Computation
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o: any) => o.status === 'pending').length,
      active: orders.filter((o: any) => ['confirmed', 'processing', 'shipped'].includes(o.status)).length,
      delivered: orders.filter((o: any) => o.status === 'delivered').length,
      revenue: orders.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + (o.total || 0), 0),
    };
  }, [orders]);

  const filters = [
    { id: 'all', label: 'كافة الطلبات', count: orders.length },
    { id: 'pending', label: '⏳ بانتظار المراجعة', count: stats.pending },
    { id: 'confirmed', label: '✅ مؤكدة', count: orders.filter((o: any) => o.status === 'confirmed').length },
    { id: 'processing', label: '📦 قيد التجهيز', count: orders.filter((o: any) => o.status === 'processing').length },
    { id: 'shipped', label: '🚚 في الطريق', count: orders.filter((o: any) => o.status === 'shipped').length },
    { id: 'delivered', label: '🎉 مكتملة', count: stats.delivered },
    { id: 'cancelled', label: '❌ ملغية', count: orders.filter((o: any) => o.status === 'cancelled').length },
  ];

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((o: any) =>
        (o.user_name || '').toLowerCase().includes(s) ||
        (o.user_phone || '').includes(s) ||
        (o.transaction_id || '').includes(s)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((o: any) => o.status === statusFilter);
    }
    return result;
  }, [orders, search, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string, oldStatus: string) => {
    await statusMutation.mutateAsync({ id: orderId, status: newStatus });
    audit.logStatusChange('orders', 'order', orderId, `طلب #${orderId}`, oldStatus, newStatus);
  };

  const columns: Column<any>[] = [
    {
      key: 'user_name',
      label: 'معلومات العميل',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-sm font-bold text-slate-800">{row.user_name || 'عميل غير مسجل'}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{row.user_phone || 'لا يوجد هاتف'}</p>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'القيمة',
      sortable: true,
      render: (row) => (
        <span className="text-[15px] font-black text-slate-900 border-b-2 border-green-100 pb-0.5">{(row.total || 0).toLocaleString('ar-SA')} ر.س</span>
      ),
    },
    {
      key: 'items',
      label: 'محتوى الطلب',
      render: (row) => {
         const isDigitalOnly = row.items?.every((i:any) => i.isDigital);
         return (
          <div className="flex flex-col items-start gap-1">
             <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{row.items?.length || 0} منتجات</span>
             {isDigitalOnly && <span className="text-[9px] text-indigo-600 font-bold flex items-center gap-0.5"><MonitorDown className="w-2.5 h-2.5"/> رقمي بالكامل</span>}
          </div>
         );
      },
    },
    {
      key: 'status',
      label: 'الحالة الحالية',
      sortable: true,
      render: (row) => <StatusBadgeAuto status={row.status || 'pending'} pulse={row.status === 'pending' || row.status === 'processing'} />,
    },
    {
      key: 'created_at',
      label: 'تاريخ الإنشاء',
      sortable: true,
      render: (row) => {
        try { 
          const d = new Date(row.created_at);
          return (
            <div>
               <p className="text-xs font-semibold text-slate-600">{d.toLocaleDateString('ar-SA')}</p>
               <p className="text-[10px] text-slate-400 font-mono">{d.toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          );
        }
        catch { return <span className="text-xs text-slate-400">—</span>; }
      },
    },
  ];

  // Logic rendering for Timeline inside drawer
  const renderVisualTimeline = (order: any) => {
    const isDigitalOnly = order.items?.every((i:any) => i.isDigital);
    const flow = isDigitalOnly ? STATUS_FLOW_DIGITAL : STATUS_FLOW_PHYSICAL;
    const currentIdx = flow.indexOf(order.status || 'pending');
    const isCancelled = order.status === 'cancelled';

    if (isCancelled) {
      return (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
             <XCircle className="w-5 h-5 text-rose-600" />
           </div>
           <div>
             <h4 className="font-bold text-rose-800">تم إلغاء الطلب</h4>
             <p className="text-xs font-semibold text-rose-600/80 mt-0.5">تم تجاوز مسار التسليم لأن الطلب ملغي حالياً.</p>
           </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-50 border border-slate-100 p-5 sm:p-6 rounded-2xl overflow-hidden">
        <h4 className="text-[11px] sm:text-xs font-bold text-slate-500 mb-5 sm:mb-6 uppercase tracking-wide">مسار تتبع الطلب {isDigitalOnly ? '(رقمي)' : ''}</h4>
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-4 right-4 sm:right-5 bottom-4 w-0.5 bg-slate-200 z-0"></div>
          
          <div className="space-y-5 sm:space-y-6 relative z-10">
            {flow.map((step, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              const isFuture = idx > currentIdx;
              const stepData = STATUS_DATA[step];
              const StepIcon = stepData.icon;

              let iconBg = isFuture ? 'bg-white border-2 border-slate-200 text-slate-300' : (isPast ? 'bg-emerald-500 text-white' : stepData.color + ' text-white shadow-lg shadow-' + stepData.color.split('-')[1] + '-500/30 scale-110');
              if(isPast) StepIcon.displayName = 'CheckCircle2'; // Overwrite with check if passed

              return (
                <div key={step} className={`flex items-start gap-3 sm:gap-4 transition-all duration-300 ${isFuture ? 'opacity-50' : 'opacity-100'}`}>
                   <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all z-10 ${iconBg}`}>
                      {isPast ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                   </div>
                   <div className="pt-1.5 sm:pt-2.5">
                     <h5 className={`text-xs sm:text-sm font-bold ${isCurrent ? 'text-slate-900' : 'text-slate-600'}`}>{stepData.label}</h5>
                     {isCurrent && <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 mt-1">الطلب يقف في هذه المرحلة.</p>}
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="الطلبات وتتبع الشحنات" />
        <StatGridSkeleton count={4} />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title="الطلبات وتتبع المبيعات"
        description="لوحة تتبع المتجر: معالجة الطلبات، تغيير الحالات، ومتابعة مدفوعات العملاء"
        icon={<ShoppingBag className="w-5 h-5 text-amber-500" />}
      />

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminStatCard title="إجمالي مبيعات المتجر" value={stats.revenue} icon={<DollarSign className="w-5 h-5" />} accentColor="#10b981" suffix="ر.س" />
        <AdminStatCard title="بانتظار الموافقة" value={stats.pending} icon={<Clock className="w-5 h-5" />} accentColor="#f59e0b" alert={stats.pending > 0} />
        <AdminStatCard title="شحنات قيد التنفيذ" value={stats.active} icon={<TruckIcon className="w-5 h-5" />} accentColor="#6366f1" />
        <AdminStatCard title="طلبات تم تسليمها" value={stats.delivered} icon={<Package className="w-5 h-5" />} accentColor="#3b82f6" />
      </div>

      <AdminFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="ابحث باسم العميل أو رقم الهاتف..."
        filters={filters}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      <AdminDataTable
        columns={columns}
        data={filteredOrders}
        onRowClick={(row) => setSelectedOrder(row)}
        emptyIcon={<Package className="w-6 h-6" />}
        emptyTitle="لا توجد طلبات مطابقة"
      />

      {/* Advanced Order Fulfillment Detail Drawer */}
      <AdminDetailDrawer
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">معلومات الطلب #{selectedOrder?.id?.slice(0,6) || '---'}</span>
            <span className="text-xl font-black text-slate-800">{selectedOrder?.user_name || 'عميل'}</span>
          </div>
        }
        subtitle={
          <div className="mt-2 inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-100">
             <DollarSign className="w-4 h-4" />
             <span className="font-bold">{(selectedOrder?.total || 0).toLocaleString('ar-SA')} ر.س</span>
          </div>
        }
        footer={
          selectedOrder && selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full bg-slate-50 p-4 border-t border-slate-200">
              {(() => {
                const isDigitalOnly = selectedOrder.items?.every((i:any) => i.isDigital);
                const flow = isDigitalOnly ? STATUS_FLOW_DIGITAL : STATUS_FLOW_PHYSICAL;
                const currentIdx = flow.indexOf(selectedOrder.status);
                const nextIdx = currentIdx + 1;

                if (nextIdx < flow.length) {
                  return (
                    <Button
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20"
                      onClick={() => {
                        handleStatusChange(selectedOrder.id, flow[nextIdx], selectedOrder.status);
                        setSelectedOrder({ ...selectedOrder, status: flow[nextIdx] });
                      }}
                      disabled={statusMutation.isPending}
                    >
                      تحديث الحالة إلى: {STATUS_DATA[flow[nextIdx]]?.label}
                    </Button>
                  );
                }
                return null;
              })()}
              <Button
                variant="outline"
                className="text-rose-600 border-rose-200 bg-white hover:bg-rose-50 font-bold"
                onClick={() => setCancelDialog(selectedOrder.id)}
              >
                إلغاء الطلب نهائياً
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedOrder && (
          <div className="space-y-8">

            {/* Visual Timeline Tracker */}
            {renderVisualTimeline(selectedOrder)}

            {/* Customer Details Stub */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 mb-3 ml-1">بيانات الدفع والاتصال</h4>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <DetailRow label="رقم الهاتف" value={selectedOrder.user_phone || '—'} mono />
                <DetailRow label="طريقة الدفع" value={selectedOrder.payment_method || 'نقدي'} />
                {selectedOrder.transaction_id && (
                  <DetailRow label="الرقم المرجعي للحوالة" value={selectedOrder.transaction_id} mono highlight />
                )}
                {selectedOrder.address && (
                  <DetailRow label="عنوان التوصيل" value={selectedOrder.address} />
                )}
              </div>
            </div>

            {/* Invoice Breakdown */}
            {selectedOrder.items?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-3 ml-1 flex items-center justify-between">
                  <span>الفاتورة التفصيلية</span>
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px]">{selectedOrder.items.length} منتجات</span>
                </h4>
                
                <div className="bg-white border text-sm border-slate-200 rounded-2xl p-2 shadow-sm">
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className={`flex items-start justify-between p-3 ${i !== selectedOrder.items.length -1 ? 'border-b border-slate-100' : ''}`}>
                      <div className="flex items-start gap-3">
                         <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            {item.isDigital ? <MonitorDown className="w-5 h-5 text-indigo-400" /> : <Package className="w-5 h-5 text-amber-500" />}
                         </div>
                         <div>
                           <p className="font-bold text-slate-800 leading-snug">{item.product_name}</p>
                           <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">الكمية: {item.quantity}</p>
                              {item.isDigital && <span className="text-[10px] text-indigo-600 font-bold">وصول فوري</span>}
                           </div>
                         </div>
                      </div>
                      <span className="font-black text-slate-900 mt-1 whitespace-nowrap">{(item.price * item.quantity).toLocaleString('ar-SA')} ر.س</span>
                    </div>
                  ))}
                  
                  {/* Total Stub */}
                  <div className="bg-slate-50 rounded-xl p-4 mt-2 border border-slate-100 flex justify-between items-center">
                     <span className="font-bold text-slate-600">الإجمالي النهائي</span>
                     <span className="text-xl font-black text-green-700">{(selectedOrder.total || 0).toLocaleString('ar-SA')} ر.س</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminDetailDrawer>

      {/* Cancel confirmation */}
      <AdminConfirmDialog
        open={!!cancelDialog}
        onClose={() => setCancelDialog(null)}
        onConfirm={async () => {
          if (cancelDialog) {
            await handleStatusChange(cancelDialog, 'cancelled', selectedOrder?.status || '');
            if (selectedOrder?.id === cancelDialog) {
              setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
            }
          }
        }}
        title="إلغاء الطلب"
        description="تحذير: هل أنت متأكد من إلغاء هذا الطلب نهائياً؟ هذا الإجراء سيرسل إشعاراً للعميل ولا يمكن التراجع عنه."
        confirmLabel="نعم، قم بإلغاء الطلب"
        danger
      />
    </div>
  );
}

// Helper specific to this layout
function DetailRow({ label, value, mono, highlight }: { label: string; value?: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-3 sm:p-4 border-b border-slate-50 last:border-0 flex-wrap gap-2 ${highlight ? 'bg-indigo-50/50' : 'bg-white'}`}>
      <span className="text-[11px] sm:text-xs text-slate-500 font-bold w-1/3 sm:w-auto shrink-0">{label}</span>
      <span className={`text-xs sm:text-sm font-bold text-slate-800 text-left sm:text-right w-full sm:w-auto break-words ${mono ? 'font-mono text-[11px] sm:text-[13px] bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200' : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}
