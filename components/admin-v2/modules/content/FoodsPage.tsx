// components/admin-v2/modules/content/FoodsPage.tsx
import React, { useState, useMemo } from 'react';
import { Utensils, Plus, Edit, Trash2 } from 'lucide-react';
import { useAdminFoods } from '../../hooks/useAdminData';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import AdminDataTable, { Column } from '../../primitives/AdminDataTable';
import AdminFilterBar from '../../primitives/AdminFilterBar';
import { TableSkeleton } from '../../primitives/AdminLoadingSkeleton';

export default function FoodsPage() {
  const { data: foods = [], isLoading } = useAdminFoods();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return foods;
    const s = search.toLowerCase();
    return foods.filter((f: any) => (f.name || f.name_ar || '').toLowerCase().includes(s));
  }, [foods, search]);

  const columns: Column<any>[] = [
    { key: 'name', label: 'الاسم', sortable: true, render: (row) => <span className="text-sm font-semibold text-slate-700">{row.name_ar || row.name || '—'}</span> },
    { key: 'calories', label: 'السعرات', sortable: true, render: (row) => <span className="text-xs font-bold text-amber-600">{row.calories || '—'} كال</span> },
    { key: 'protein', label: 'بروتين', render: (row) => <span className="text-xs text-slate-500">{row.protein || '—'}g</span> },
    { key: 'carbs', label: 'كربوهيدرات', render: (row) => <span className="text-xs text-slate-500">{row.carbs || '—'}g</span> },
    { key: 'fat', label: 'دهون', render: (row) => <span className="text-xs text-slate-500">{row.fat || '—'}g</span> },
    { key: 'category', label: 'التصنيف', render: (row) => <span className="text-xs text-slate-400">{row.category || '—'}</span> },
  ];

  if (isLoading) return <div className="space-y-6"><AdminPageHeader title="قاعدة الأطعمة" /><TableSkeleton /></div>;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="قاعدة بيانات الأطعمة" description={`${foods.length} عنصر`} icon={<Utensils className="w-5 h-5 text-amber-500" />} />
      <AdminFilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="ابحث في الأطعمة..." />
      <AdminDataTable columns={columns} data={filtered} emptyIcon={<Utensils className="w-6 h-6" />} emptyTitle="لا توجد أطعمة" />
    </div>
  );
}
