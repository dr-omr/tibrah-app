// components/admin-v2/modules/audit/AuditLogPage.tsx
// Searchable audit trail viewer

import React, { useState, useMemo } from 'react';
import { ScrollText, Clock, User, FileText, ShoppingBag, Settings, Stethoscope } from 'lucide-react';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import AdminDataTable, { Column } from '../../primitives/AdminDataTable';
import AdminFilterBar from '../../primitives/AdminFilterBar';
import AdminEmptyState from '../../primitives/AdminEmptyState';

const ACTION_LABELS: Record<string, string> = {
  create: 'إنشاء',
  update: 'تعديل',
  delete: 'حذف',
  status_change: 'تغيير الحالة',
  login: 'تسجيل دخول',
  export: 'تصدير',
  config_change: 'تغيير إعداد',
};

const ACTION_COLORS: Record<string, string> = {
  create: '#10b981',
  update: '#3b82f6',
  delete: '#ef4444',
  status_change: '#f59e0b',
  login: '#8b5cf6',
  export: '#06b6d4',
  config_change: '#64748b',
};

const MODULE_ICONS: Record<string, React.ReactNode> = {
  orders: <ShoppingBag className="w-3.5 h-3.5" />,
  users: <User className="w-3.5 h-3.5" />,
  content: <FileText className="w-3.5 h-3.5" />,
  clinical: <Stethoscope className="w-3.5 h-3.5" />,
  settings: <Settings className="w-3.5 h-3.5" />,
};

// Placeholder: In production, this would fetch from Firestore audit_logs collection
const SAMPLE_ENTRIES: any[] = [];

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const entries = SAMPLE_ENTRIES;

  const filters = [
    { id: 'all', label: 'الكل' },
    { id: 'create', label: 'إنشاء' },
    { id: 'update', label: 'تعديل' },
    { id: 'delete', label: 'حذف' },
    { id: 'status_change', label: 'تغيير حالة' },
  ];

  const filtered = useMemo(() => {
    let result = entries;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((e: any) => 
        (e.actor_name || '').toLowerCase().includes(s) ||
        (e.entity_label || '').toLowerCase().includes(s) ||
        (e.module || '').toLowerCase().includes(s)
      );
    }
    if (actionFilter !== 'all') result = result.filter((e: any) => e.action === actionFilter);
    return result;
  }, [entries, search, actionFilter]);

  const columns: Column<any>[] = [
    {
      key: 'action', label: 'الإجراء',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ACTION_COLORS[row.action] || '#94a3b8'}15` }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: ACTION_COLORS[row.action] || '#94a3b8' }} />
          </div>
          <span className="text-xs font-bold" style={{ color: ACTION_COLORS[row.action] || '#64748b' }}>
            {ACTION_LABELS[row.action] || row.action}
          </span>
        </div>
      ),
    },
    { key: 'module', label: 'الوحدة', render: (row) => (
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        {MODULE_ICONS[row.module] || <FileText className="w-3.5 h-3.5" />}
        <span>{row.module}</span>
      </div>
    )},
    { key: 'entity_label', label: 'العنصر', render: (row) => <span className="text-sm text-slate-700 font-medium">{row.entity_label || '—'}</span> },
    { key: 'actor_name', label: 'المنفذ', render: (row) => <span className="text-xs text-slate-500">{row.actor_name}</span> },
    { key: 'timestamp', label: 'التوقيت', sortable: true, render: (row) => {
      try { return <span className="text-xs text-slate-400">{new Date(row.timestamp).toLocaleString('ar-SA')}</span>; }
      catch { return <span className="text-xs text-slate-400">—</span>; }
    }},
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="سجل المراجعة" description="سجل كامل لجميع العمليات الإدارية" icon={<ScrollText className="w-5 h-5 text-slate-500" />} />
      <AdminFilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="ابحث في السجل..." filters={filters} activeFilter={actionFilter} onFilterChange={setActionFilter} />

      {entries.length === 0 ? (
        <div className="admin-card">
          <AdminEmptyState
            icon={<ScrollText className="w-6 h-6" />}
            title="سجل المراجعة فارغ"
            description="ستظهر هنا جميع العمليات الإدارية بمجرد إجراء أي تعديل على المنصة"
          />
        </div>
      ) : (
        <AdminDataTable columns={columns} data={filtered} emptyIcon={<ScrollText className="w-6 h-6" />} emptyTitle="لا توجد سجلات" />
      )}
    </div>
  );
}
