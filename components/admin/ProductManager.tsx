import React, { useState } from 'react';
import { Package, Plus, Edit, Trash2, Search, Filter, Loader2, Image, UploadCloud } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { localProducts } from '@/lib/products';

interface Product {
    id: string;
    name: string;
    price: number;
    category?: string;
    image_url?: string;
    in_stock?: boolean;
    description?: string;
    original_price?: number;
    [key: string]: unknown;
}

interface ProductManagerProps {
    products: Product[];
    onSave: (data: any, id?: string) => Promise<void>;
    onDelete: (id: string) => void;
}

export default function ProductManager({ products, onSave, onDelete }: ProductManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [importing, setImporting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'supplements',
        description: '',
        image_url: '',
    });

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: String(product.price),
            category: product.category || 'supplements',
            description: product.description || '',
            image_url: product.image_url || '',
        });
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setFormData({ name: '', price: '', category: 'supplements', description: '', image_url: '' });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await onSave({
                ...formData,
                price: Number(formData.price)
            }, editingProduct?.id);
            setIsDialogOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkImport = async () => {
        const confirm = window.confirm(`هل أنت متأكد من استيراد ${localProducts.length} منتج؟`);
        if (!confirm) return;

        setImporting(true);
        let count = 0;
        try {
            for (const product of localProducts) {
                const { id, ...data } = product;
                try {
                    await onSave(data);
                    count++;
                } catch (e) {
                    console.error(`Failed to import ${product.name}`, e);
                }
            }
            toast.success(`تم استيراد ${count} منتج بنجاح! 📦`);
        } catch (error) {
            toast.error('فشل الاستيراد');
        } finally {
            setImporting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="بحث عن منتج..."
                        className="pr-10 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleBulkImport}
                        disabled={importing}
                        className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        {importing ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <UploadCloud className="w-4 h-4 ml-2" />}
                        استيراد المنتجات
                    </Button>
                    <Button onClick={handleCreate} className="bg-[#2D9B83] hover:bg-[#258570]">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة منتج جديد
                    </Button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 group hover:border-[#2D9B83]/30 transition-all">
                        <div className="w-20 h-20 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Package className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 line-clamp-1">{product.name}</h3>
                            <p className="text-sm text-slate-500 mb-2">{product.category}</p>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-[#2D9B83]">{product.price} ر.س</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(product)}>
                                        <Edit className="w-4 h-4 text-slate-500" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => onDelete(product.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit DIALOG */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">اسم المنتج</label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">السعر</label>
                                <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">الفئة</label>
                                <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="supplements">مكملات</SelectItem>
                                        <SelectItem value="vitamins">فيتامينات</SelectItem>
                                        <SelectItem value="devices">أجهزة</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">الوصف</label>
                            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">رابط الصورة</label>
                            <div className="flex gap-2">
                                <Input value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
                                {formData.image_url && <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden"><img src={formData.image_url} className="w-full h-full object-cover" /></div>}
                            </div>
                        </div>

                        <Button className="w-full bg-[#2D9B83] hover:bg-[#258570]" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ التغييرات'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
