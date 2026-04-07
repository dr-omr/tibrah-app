// components/admin-v2/modules/content/CoursesPage.tsx
import React, { useState, useMemo } from 'react';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { useAdminCourses, useCourseMutation, useCourseDeleteMutation } from '../../hooks/useAdminData';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import AdminDataTable, { Column } from '../../primitives/AdminDataTable';
import AdminFilterBar from '../../primitives/AdminFilterBar';
import AdminFormModal from '../../primitives/AdminFormModal';
import AdminConfirmDialog from '../../primitives/AdminConfirmDialog';
import { TableSkeleton } from '../../primitives/AdminLoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CoursesPage() {
  const { data: courses = [], isLoading } = useAdminCourses();
  const saveMutation = useCourseMutation();
  const deleteMutation = useCourseDeleteMutation();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', instructor: '', category: '', price: 0 });

  const filtered = useMemo(() => { if (!search) return courses; const s = search.toLowerCase(); return courses.filter((c: any) => (c.title || '').toLowerCase().includes(s)); }, [courses, search]);
  const openNew = () => { setEditItem(null); setForm({ title: '', description: '', instructor: '', category: '', price: 0 }); setFormOpen(true); };
  const openEdit = (item: any) => { setEditItem(item); setForm({ title: item.title || '', description: item.description || '', instructor: item.instructor || '', category: item.category || '', price: item.price || 0 }); setFormOpen(true); };
  const handleSave = async () => { await saveMutation.mutateAsync({ data: form, id: editItem?.id }); setFormOpen(false); };
  const handleDelete = async () => { if (deleteId) await deleteMutation.mutateAsync(deleteId); };

  const columns: Column<any>[] = [
    { key: 'title', label: 'الدورة', sortable: true, render: (row) => <span className="text-sm font-semibold text-slate-700">{row.title}</span> },
    { key: 'instructor', label: 'المحاضر', render: (row) => <span className="text-xs text-slate-500">{row.instructor || '—'}</span> },
    { key: 'category', label: 'التصنيف', render: (row) => <span className="text-xs text-slate-500">{row.category || '—'}</span> },
    { key: 'price', label: 'السعر', sortable: true, render: (row) => <span className="text-xs font-bold text-slate-700">{row.price ? `${row.price} ر.س` : 'مجاني'}</span> },
    { key: 'actions', label: '', width: '100px', render: (row) => (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-500" onClick={() => openEdit(row)}><Edit className="w-3.5 h-3.5" /></button>
        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500" onClick={() => setDeleteId(row.id)}><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  if (isLoading) return <div className="space-y-6"><AdminPageHeader title="إدارة الدورات" /><TableSkeleton /></div>;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="إدارة الدورات" description={`${courses.length} دورة`} icon={<BookOpen className="w-5 h-5 text-pink-500" />}>
        <Button onClick={openNew} className="bg-teal-600 hover:bg-teal-700 text-white text-xs"><Plus className="w-4 h-4 ml-1" /> إضافة دورة</Button>
      </AdminPageHeader>
      <AdminFilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="ابحث في الدورات..." />
      <AdminDataTable columns={columns} data={filtered} emptyIcon={<BookOpen className="w-6 h-6" />} emptyTitle="لا توجد دورات" />
      <AdminFormModal open={formOpen} onClose={() => setFormOpen(false)} title={editItem ? 'تعديل دورة' : 'إضافة دورة'} onSubmit={handleSave} loading={saveMutation.isPending}>
        <div className="space-y-4">
          <div><label className="text-xs font-bold text-slate-600 block mb-1">العنوان</label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div><label className="text-xs font-bold text-slate-600 block mb-1">الوصف</label><Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><label className="text-xs font-bold text-slate-600 block mb-1">المحاضر</label><Input value={form.instructor} onChange={(e) => setForm(f => ({ ...f, instructor: e.target.value }))} /></div>
          <div><label className="text-xs font-bold text-slate-600 block mb-1">التصنيف</label><Input value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} /></div>
          <div><label className="text-xs font-bold text-slate-600 block mb-1">السعر (ر.س)</label><Input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))} /></div>
        </div>
      </AdminFormModal>
      <AdminConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="حذف الدورة" description="هل أنت متأكد؟" confirmLabel="حذف" danger />
    </div>
  );
}
