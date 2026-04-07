// components/admin-v2/modules/content/RecipesPage.tsx
import React, { useState, useMemo } from 'react';
import { ChefHat } from 'lucide-react';
import { useAdminRecipes } from '../../hooks/useAdminData';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import AdminDataTable, { Column } from '../../primitives/AdminDataTable';
import AdminFilterBar from '../../primitives/AdminFilterBar';
import { TableSkeleton } from '../../primitives/AdminLoadingSkeleton';

export default function RecipesPage() {
  const { data: recipes = [], isLoading } = useAdminRecipes();
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => { if (!search) return recipes; const s = search.toLowerCase(); return recipes.filter((r: any) => (r.name || r.title || '').toLowerCase().includes(s)); }, [recipes, search]);

  const columns: Column<any>[] = [
    { key: 'name', label: 'الوصفة', sortable: true, render: (row) => <span className="text-sm font-semibold text-slate-700">{row.name || row.title || '—'}</span> },
    { key: 'category', label: 'التصنيف', render: (row) => <span className="text-xs text-slate-500">{row.category || '—'}</span> },
    { key: 'calories', label: 'السعرات', render: (row) => <span className="text-xs text-amber-600 font-bold">{row.calories || '—'}</span> },
    { key: 'prep_time', label: 'وقت التحضير', render: (row) => <span className="text-xs text-slate-500">{row.prep_time || row.prepTime || '—'} د</span> },
    { key: 'ingredients', label: 'المكونات', render: (row) => <span className="text-xs text-slate-400">{row.ingredients?.length || 0} مكون</span> },
  ];

  if (isLoading) return <div className="space-y-6"><AdminPageHeader title="الوصفات" /><TableSkeleton /></div>;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="إدارة الوصفات" description={`${recipes.length} وصفة`} icon={<ChefHat className="w-5 h-5 text-orange-500" />} />
      <AdminFilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="ابحث في الوصفات..." />
      <AdminDataTable columns={columns} data={filtered} emptyIcon={<ChefHat className="w-6 h-6" />} emptyTitle="لا توجد وصفات" />
    </div>
  );
}
