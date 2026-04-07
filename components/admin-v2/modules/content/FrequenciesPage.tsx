// components/admin-v2/modules/content/FrequenciesPage.tsx
import React, { useState, useMemo } from 'react';
import { Waves, Plus, Edit, Trash2 } from 'lucide-react';
import { useAdminFrequencies, useFrequencyMutation, useFrequencyDeleteMutation } from '../../hooks/useAdminData';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import AdminDataTable, { Column } from '../../primitives/AdminDataTable';
import AdminFilterBar from '../../primitives/AdminFilterBar';
import AdminFormModal from '../../primitives/AdminFormModal';
import AdminConfirmDialog from '../../primitives/AdminConfirmDialog';
import { TableSkeleton } from '../../primitives/AdminLoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FrequenciesPage() {
  const { data: frequencies = [], isLoading } = useAdminFrequencies();
  const saveMutation = useFrequencyMutation();
  const deleteMutation = useFrequencyDeleteMutation();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', frequency_hz: 0, description: '', category: '' });

  const filtered = useMemo(() => { if (!search) return frequencies; const s = search.toLowerCase(); return frequencies.filter((f: any) => (f.name || '').toLowerCase().includes(s)); }, [frequencies, search]);
  const openNew = () => { setEditItem(null); setForm({ name: '', frequency_hz: 0, description: '', category: '' }); setFormOpen(true); };
  const openEdit = (item: any) => { setEditItem(item); setForm({ name: item.name || '', frequency_hz: item.frequency_hz || 0, description: item.description || '', category: item.category || '' }); setFormOpen(true); };
  const handleSave = async () => { await saveMutation.mutateAsync({ data: form, id: editItem?.id }); setFormOpen(false); };
  const handleDelete = async () => { if (deleteId) await deleteMutation.mutateAsync(deleteId); };

  const columns: Column<any>[] = [
    { key: 'name', label: 'الاسم', sortable: true, render: (row) => <span className="text-sm font-semibold text-slate-700">{row.name}</span> },
    { key: 'frequency_hz', label: 'التردد (Hz)', sortable: true, render: (row) => <span className="text-xs font-mono font-bold text-purple-600">{row.frequency_hz?.toLocaleString() || '—'} Hz</span> },
    { key: 'category', label: 'التصنيف', render: (row) => <span className="text-xs text-slate-500">{row.category || '—'}</span> },
    { key: 'description', label: 'الوصف', render: (row) => <span className="text-xs text-slate-400 truncate max-w-[200px] block">{row.description || '—'}</span> },
    { key: 'actions', label: '', width: '100px', render: (row) => (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-500" onClick={() => openEdit(row)}><Edit className="w-3.5 h-3.5" /></button>
        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500" onClick={() => setDeleteId(row.id)}><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  if (isLoading) return <div className="space-y-6"><AdminPageHeader title="الترددات" /><TableSkeleton /></div>;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="إدارة الترددات العلاجية" description={`${frequencies.length} تردد`} icon={<Waves className="w-5 h-5 text-purple-500" />}>
        <Button onClick={openNew} className="bg-teal-600 hover:bg-teal-700 text-white text-xs"><Plus className="w-4 h-4 ml-1" /> إضافة تردد</Button>
      </AdminPageHeader>
      <AdminFilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="ابحث في الترددات..." />
      <AdminDataTable columns={columns} data={filtered} emptyIcon={<Waves className="w-6 h-6" />} emptyTitle="لا توجد ترددات" />
      <AdminFormModal open={formOpen} onClose={() => setFormOpen(false)} title={editItem ? 'تعديل تردد' : 'إضافة تردد'} onSubmit={handleSave} loading={saveMutation.isPending}>
        <div className="space-y-4">
          <div><label className="text-xs font-bold text-slate-600 block mb-1">الاسم</label><Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="text-xs font-bold text-slate-600 block mb-1">التردد (Hz)</label><Input type="number" value={form.frequency_hz} onChange={(e) => setForm(f => ({ ...f, frequency_hz: Number(e.target.value) }))} /></div>
          <div><label className="text-xs font-bold text-slate-600 block mb-1">التصنيف</label><Input value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} /></div>
          <div><label className="text-xs font-bold text-slate-600 block mb-1">الوصف</label><textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-teal-200 outline-none" /></div>
        </div>
      </AdminFormModal>
      <AdminConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="حذف التردد" description="هل أنت متأكد؟" confirmLabel="حذف" danger />
    </div>
  );
}
