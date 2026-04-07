// components/admin-v2/modules/products/ProductsPage.tsx
// Comprehensive E-Commerce Inventory System

import React, { useState, useMemo } from 'react';
import { Package, Plus, Edit, Trash2, LayoutGrid, LayoutList, Image as ImageIcon, Box, MonitorDown, X, AlertCircle } from 'lucide-react';
import { useAdminProducts, useProductMutation, useProductDeleteMutation } from '../../hooks/useAdminData';
import useAuditLog from '../../hooks/useAuditLog';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import AdminStatCard from '../../primitives/AdminStatCard';
import AdminDataTable, { Column } from '../../primitives/AdminDataTable';
import AdminFilterBar from '../../primitives/AdminFilterBar';
import AdminConfirmDialog from '../../primitives/AdminConfirmDialog';
import { StatusBadgeAuto } from '../../primitives/AdminStatusBadge';
import { StatGridSkeleton, TableSkeleton } from '../../primitives/AdminLoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProductsPage() {
  const { data: products = [], isLoading } = useAdminProducts();
  const saveMutation = useProductMutation();
  const deleteMutation = useProductDeleteMutation();
  const audit = useAuditLog();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    isDigital: false,
    stockCount: 0,
    image: '',
  });

  // Calculate distinct categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map((p: any) => p.category || 'غير مصنف'));
    return Array.from(cats);
  }, [products]);

  const stats = useMemo(() => {
    const physical = products.filter((p: any) => !p.isDigital);
    const lowStock = physical.filter((p: any) => (p.stockCount || 0) < 5 && (p.stockCount || 0) > 0);
    const outOfStock = physical.filter((p: any) => (p.stockCount || 0) <= 0);
    return {
      total: products.length,
      digital: products.filter((p: any) => p.isDigital).length,
      outOfStock: outOfStock.length,
      lowStock: lowStock.length,
    };
  }, [products]);

  const filters = [
    { id: 'all', label: 'كافة المنتجات', count: products.length },
    ...categories.map(c => ({ id: c, label: c, count: products.filter((p: any) => (p.category || 'غير مصنف') === c).length }))
  ];

  const filteredProducts = useMemo(() => { 
    let result = products;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p: any) => (p.name || '').toLowerCase().includes(s));
    }
    if (categoryFilter !== 'all') {
      result = result.filter((p: any) => (p.category || 'غير مصنف') === categoryFilter);
    }
    return result; 
  }, [products, search, categoryFilter]);

  const openNew = () => { 
    setEditItem(null); 
    setForm({ name: '', description: '', price: 0, category: '', isDigital: false, stockCount: 10, image: '' }); 
    setFormOpen(true); 
  };

  const openEdit = (item: any) => { 
    setEditItem(item); 
    setForm({ 
      name: item.name || '', 
      description: item.description || '', 
      price: item.price || 0, 
      category: item.category || '', 
      isDigital: !!item.isDigital, 
      stockCount: item.stockCount || 0,
      image: item.image || ''
    }); 
    setFormOpen(true); 
  };

  const handleSave = async (e: React.FormEvent) => { 
    e.preventDefault();
    await saveMutation.mutateAsync({ data: form, id: editItem?.id }); 
    audit.logCreate('products', 'product', editItem?.id || 'new', form.name); 
    setFormOpen(false); 
  };

  const handleDelete = async () => { 
    if (deleteId) { 
      await deleteMutation.mutateAsync(deleteId); 
      audit.logDelete('products', 'product', deleteId, ''); 
      setDeleteId(null);
    } 
  };

  // List View Columns
  const columns: Column<any>[] = [
    { key: 'name', label: 'المنتج', sortable: true, render: (row) => (
      <div className="flex items-center gap-4">
        {row.image ? <img src={row.image} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm bg-slate-50" /> : <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shadow-sm"><ImageIcon className="w-5 h-5 text-slate-400" /></div>}
        <div>
          <p className="text-sm font-bold text-slate-800">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-semibold">{row.category || 'غير مصنف'}</span>
            {row.isDigital ? <span className="text-[10px] text-blue-600 flex items-center gap-0.5"><MonitorDown className="w-3 h-3"/> منتج رقمي</span> : <span className="text-[10px] text-amber-600 flex items-center gap-0.5"><Box className="w-3 h-3"/> ملموس (شحن)</span>}
          </div>
        </div>
      </div>
    )},
    { key: 'price', label: 'السعر', sortable: true, render: (row) => <span className="text-[15px] font-black text-slate-900">{row.price.toLocaleString()} <span className="text-xs text-slate-500 font-bold">ر.س</span></span> },
    { key: 'stock', label: 'المخزون الداخلي', render: (row) => {
        if (row.isDigital) return <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-2 py-1 rounded-md">متاح دوماً (رقمي)</span>;
        
        let color = 'text-slate-700 bg-slate-50';
        if (row.stockCount <= 0) color = 'text-rose-700 bg-rose-50';
        else if (row.stockCount < 5) color = 'text-amber-700 bg-amber-50';
        
        return <span className={`text-xs font-bold px-2 py-1 rounded-md ${color}`}>{row.stockCount <= 0 ? 'نفذت الكمية' : `${row.stockCount} متوفر`}</span>;
    }},
    { key: 'actions', label: '', width: '90px', render: (row) => (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <button className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors bg-white shadow-sm border border-slate-100" onClick={() => openEdit(row)}><Edit className="w-4 h-4" /></button>
        <button className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors bg-white shadow-sm border border-slate-100" onClick={() => setDeleteId(row.id)}><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  if (isLoading) return <div className="space-y-6"><AdminPageHeader title="المنتجات والمخزون" /><StatGridSkeleton count={4}/><TableSkeleton /></div>;

  return (
    <div className="space-y-6 pb-20 relative">
      <AdminPageHeader 
        title="المتجر والمخزون الداخلي" 
        description="إدارة المنتجات الملموسة والدورات الرقمية، تتبع الكميات بدقة، وتهيئة الكتالوج." 
        icon={<Package className="w-5 h-5 text-indigo-500" />}
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
             <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/60 transition-all">
              <button onClick={() => setViewMode('grid')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <LayoutGrid className="w-4 h-4" /> الشبكة
              </button>
              <button onClick={() => setViewMode('list')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <LayoutList className="w-4 h-4" /> القائمة
              </button>
            </div>
            <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 sm:h-10 px-4 rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.3)]">
              <Plus className="w-5 h-5 ml-1.5" /> إضافة منتج
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminStatCard title="إجمالي المنتجات" value={stats.total} icon={<Package className="w-5 h-5" />} accentColor="#6366f1" />
        <AdminStatCard title="المنتجات الرقمية" value={stats.digital} icon={<MonitorDown className="w-5 h-5" />} accentColor="#3b82f6" />
        <AdminStatCard title="منتجات نفذت كميتها" value={stats.outOfStock} icon={<AlertCircle className="w-5 h-5" />} accentColor="#e11d48" alert={stats.outOfStock > 0} />
        <AdminStatCard title="شارفت على النفاذ" value={stats.lowStock} icon={<Box className="w-5 h-5" />} accentColor="#f59e0b" alert={stats.lowStock > 0} />
      </div>

      <AdminFilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="ابحث باسم المنتج..." filters={filters} activeFilter={categoryFilter} onFilterChange={setCategoryFilter} />
      
      {/* Dynamic View Representation */}
      {viewMode === 'list' ? (
        <div className="overflow-x-auto pb-4">
           <AdminDataTable columns={columns} data={filteredProducts} emptyIcon={<Package className="w-6 h-6" />} emptyTitle="لا توجد منتجات مسجلة" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product: any) => (
            <div key={product.id} className="bg-white border border-slate-200/60 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group flex flex-col">
              {/* Card Image Area */}
              <div className="aspect-[4/3] w-full bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                {product.image ? (
                  <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={product.name} />
                ) : (
                  <ImageIcon className="w-10 h-10 text-slate-200" />
                )}
                {/* Badges Overlay */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                   {product.isDigital ? (
                     <span className="bg-white/90 backdrop-blur border border-slate-100 shadow-sm text-indigo-600 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><MonitorDown className="w-3 h-3"/> رقمي</span>
                   ) : (
                      <>
                        {product.stockCount <= 0 && <span className="bg-rose-500 text-white shadow-sm text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 text-center leading-none">نفذت الكمية</span>}
                        {product.stockCount > 0 && product.stockCount < 5 && <span className="bg-amber-400 text-white shadow-sm text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 text-center leading-none">كمية محدودة</span>}
                      </>
                   )}
                </div>
              </div>
              
               {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase bg-slate-100 px-2 py-0.5 rounded-md">{product.category || 'تصنيف عام'}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 min-h-[40px] mt-2 mb-1">{product.name}</h3>
                </div>
                
                <div className="flex items-end justify-between mt-4">
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold mb-0.5">السعر</p>
                    <p className="font-black text-lg text-slate-900 leading-none">{product.price.toLocaleString()} <span className="text-[10px] font-bold text-slate-500">ر.س</span></p>
                  </div>
                  <div className="flex gap-1">
                    <button className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" onClick={() => openEdit(product)}><Edit className="w-3.5 h-3.5" /></button>
                    <button className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors" onClick={() => setDeleteId(product.id)}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
             <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 border-dashed">
                <Package className="w-16 h-16 text-slate-200 mb-4" />
                <p className="text-slate-500 font-bold text-lg">لم يتم العثور على منتجات مطابقة</p>
             </div>
          )}
        </div>
      )}

      {/* --- ADVANCED EDITOR DRAWER --- */}
      {formOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setFormOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out border-r border-slate-200 flex flex-col dir-rtl overflow-hidden">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
              <div>
                <h3 className="text-xl font-black text-slate-800">{editItem ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">تحديد خصائص العنصر داخل الكتالوج الرقمي</p>
              </div>
              <button onClick={() => setFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors bg-slate-50 border border-slate-100 shadow-sm">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <form id="productForm" onSubmit={handleSave} className="space-y-6">
                
                {/* Image Uploader Mock */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                   <label className="text-xs font-bold text-slate-600 block mb-3">الصورة الرئيسية (رابط مؤقتاً)</label>
                   <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 sm:p-6 bg-slate-50 relative group min-h-[120px]">
                      {form.image ? (
                        <>
                          <img src={form.image} alt="Preview" className="h-24 sm:h-32 object-contain rounded-lg" />
                          <div className="absolute inset-x-2 bottom-2 sm:inset-0 sm:bottom-0 bg-white/90 sm:bg-white/80 backdrop-blur-sm flex items-center justify-center sm:opacity-0 group-hover:opacity-100 transition-opacity rounded-xl p-2 sm:p-0 border sm:border-0 border-slate-100 shadow-sm sm:shadow-none">
                             <Input className="w-full sm:w-[80%] text-center text-xs h-9 sm:h-10" placeholder="تعديل الرابط..." value={form.image} onChange={(e) => setForm(f => ({...f, image: e.target.value}))} />
                          </div>
                        </>
                      ) : (
                        <>
                           <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                           <p className="text-xs font-bold text-slate-500 mb-3">ضع رابط الصورة لعرضها</p>
                           <Input className="w-full text-center text-xs" placeholder="https://example.com/image.png" value={form.image} onChange={(e) => setForm(f => ({...f, image: e.target.value}))} />
                        </>
                      )}
                   </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">اسم المنتج <span className="text-rose-500">*</span></label>
                    <Input required className="border-slate-200 shadow-none focus:ring-indigo-500 h-11" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">السعر (ر.س) <span className="text-rose-500">*</span></label>
                      <Input required type="number" min="0" className="border-slate-200 shadow-none font-mono focus:ring-indigo-500 h-11" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">التصنيف</label>
                      <Input placeholder="مثال: استشارات، معدات" className="border-slate-200 shadow-none focus:ring-indigo-500 h-11" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                   <div>
                     <label className="text-xs font-bold text-slate-800 block mb-2">طبيعة المنتج وطريقة التسليم</label>
                     <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button type="button" onClick={() => setForm(f => ({...f, isDigital: false}))} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${!form.isDigital ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}><Box className="w-4 h-4"/> منتج ملموس</button>
                        <button type="button" onClick={() => setForm(f => ({...f, isDigital: true, stockCount: 99999}))} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${form.isDigital ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}><MonitorDown className="w-4 h-4"/> محتوى رقمي</button>
                     </div>
                   </div>

                   {!form.isDigital && (
                     <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold text-slate-600 block mb-1 flex items-center justify-between">إدارة المخزون <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded">التتبع مفعل</span></label>
                        <p className="text-[10px] text-slate-400 mb-3 font-semibold">كم عدد القطع المتاحة حالياً في المستودع؟ ستظهر علامة "نفذت الكمية" للعملاء إذا وصلت لـ 0.</p>
                        <div className="flex items-center gap-4">
                           <Button type="button" variant="outline" className="w-12 h-12 rounded-xl text-xl font-medium" onClick={() => setForm(f => ({...f, stockCount: Math.max(0, f.stockCount - 1)}))}>-</Button>
                           <Input type="number" min="0" className="border-slate-200 shadow-none font-mono focus:ring-indigo-500 text-center text-xl h-12 font-bold flex-1" value={form.stockCount} onChange={(e) => setForm(f => ({ ...f, stockCount: parseInt(e.target.value) || 0 }))} />
                           <Button type="button" variant="outline" className="w-12 h-12 rounded-xl text-xl font-medium" onClick={() => setForm(f => ({...f, stockCount: f.stockCount + 1}))}>+</Button>
                        </div>
                     </div>
                   )}
                   {form.isDigital && (
                     <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                           <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                           <p className="text-xs font-bold leading-relaxed">هذا المنتج يعتبر منتجاً رقمياً (مثال: دورة مسجلة أو ملف للتحميل). لن يتم تتبع مخزونه أو تكليف العميل برسوم شحن إضافية وسيتاح بشكل مباشر بعد الدفع.</p>
                        </div>
                     </div>
                   )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <label className="text-xs font-bold text-slate-600 block mb-2">وصف المنتج (يظهر للمرضى)</label>
                    <textarea 
                      value={form.description} 
                      onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} 
                      placeholder="اكتب وصفاً جذاباً يشرح مزايا المنتج..."
                      className="w-full border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 min-h-[120px] focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none resize-y" 
                    />
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
               <Button type="submit" form="productForm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl text-base shadow-[0_4px_14px_rgba(79,70,229,0.3)] disabled:opacity-50" disabled={saveMutation.isPending}>
                 {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ المنتج للمتجر'}
               </Button>
            </div>
            
          </div>
        </>
      )}

      {/* Cancel confirmation */}
      <AdminConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="إزالة المنتج نهائياً" description="هل أنت متأكد من حذف المنتج بشكل نهائي من قاعدة البيانات والمتجر العام؟" confirmLabel="حذف المنتج" danger />
    </div>
  );
}
