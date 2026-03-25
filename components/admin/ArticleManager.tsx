import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Search, Loader2, Eye, Save, UploadCloud, Layout } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";
import { localArticles, libraryCategories } from '@/lib/articles';

interface Article {
    id: string;
    title: string;
    summary: string;
    content?: string;
    category: string;
    type: string;
    image_url?: string;
    featured?: boolean;
    [key: string]: unknown;
}

interface ArticleManagerProps {
    articles: Article[];
    onSave: (data: any, id?: string) => Promise<void>;
    onDelete: (id: string) => void;
}

export default function ArticleManager({ articles, onSave, onDelete }: ArticleManagerProps) {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('split');

    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        content: '',
        category: 'holistic',
        type: 'article',
        image_url: '',
        featured: false,
    });

    // Initialize Editor
    const handleEdit = (article: Article) => {
        setEditingArticle(article);
        setFormData({
            title: article.title,
            summary: article.summary || '',
            content: article.content || '',
            category: article.category || 'holistic',
            type: article.type || 'article',
            image_url: article.image_url || '',
            featured: !!article.featured,
        });
        setIsEditorOpen(true);
    };

    const handleCreate = () => {
        setEditingArticle(null);
        setFormData({
            title: '', summary: '', content: '',
            category: 'holistic', type: 'article', image_url: '', featured: false
        });
        setIsEditorOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.title) {
            toast.error('الرجاء كتابة عنوان المقال');
            return;
        }

        setIsLoading(true);
        try {
            await onSave(formData, editingArticle?.id);
            setIsEditorOpen(false);
            toast.success('تم حفظ المقال بنجاح ✨');
        } catch (error) {
            toast.error('حدث خطأ أثناء الحفظ');
        } finally {
            setIsLoading(false);
        }
    };

    // Bulk Import Logic
    const handleBulkImport = async () => {
        const confirm = window.confirm(`هل أنت متأكد من استيراد ${localArticles.length} مقال إلى قاعدة البيانات؟`);
        if (!confirm) return;

        setImporting(true);
        let count = 0;
        try {
            // Check existing IDs to avoid duplicates if possible, or just rely on backend
            // For now, simpler approach: Try creating them one by one.
            for (const article of localArticles) {
                // Remove ID to let DB generate one, or keep it if we want to sync IDs
                const { id, ...data } = article;
                try {
                    await onSave(data); // Create new
                    count++;
                } catch (e) {
                    console.error(`Failed to import ${article.title}`, e);
                }
            }
            toast.success(`تم استيراد ${count} مقال بنجاح! 📚`);
        } catch (error) {
            toast.error('فشل الاستيراد');
        } finally {
            setImporting(false);
        }
    };

    const filteredArticles = articles.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="بحث في المكتبة..."
                        className="pr-10 bg-slate-50 border-0 focus:bg-white transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleBulkImport}
                        disabled={importing}
                        className="border-slate-200 hover:bg-slate-50 text-slate-600"
                    >
                        {importing ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <UploadCloud className="w-4 h-4 ml-2" />}
                        استيراد المحتوى المحلي
                    </Button>
                    <Button onClick={handleCreate} className="gradient-primary text-white shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4 ml-2" />
                        مقال جديد
                    </Button>
                </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                    <div key={article.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="aspect-video rounded-2xl bg-slate-100 overflow-hidden relative mb-4">
                            {article.image_url ? (
                                <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                    <FileText className="w-10 h-10" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2">
                                {article.featured && (
                                    <div className="px-2 py-1 bg-yellow-400/90 backdrop-blur text-white text-xs font-bold rounded-lg shadow-sm">
                                        مميز
                                    </div>
                                )}
                                <div className="px-2 py-1 bg-black/50 backdrop-blur text-white text-xs font-bold rounded-lg">
                                    {(article.views as number) || 0} مشاهدة
                                </div>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100" onClick={() => handleEdit(article)}>
                                    <Edit className="w-4 h-4 ml-2" /> تعديل
                                </Button>
                                <Button size="icon" variant="destructive" className="h-9 w-9" onClick={() => onDelete(article.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wider text-primary font-bold">
                                    {libraryCategories.find(c => c.id === article.category)?.name || article.category}
                                </span>
                                <span className="text-xs text-slate-400">{new Date((article.created_at as string) || Date.now()).toLocaleDateString('ar-EG')}</span>
                            </div>
                            <h3 className="font-bold text-slate-800 leading-tight line-clamp-2 min-h-[3rem]">
                                {article.title}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-2 h-10 overflow-hidden">
                                {article.summary}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Smart Editor Dialog */}
            <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <DialogContent className="max-w-[95vw] h-[95vh] p-0 overflow-hidden flex flex-col bg-[#FDFBF7]">
                    {/* Editor Header */}
                    <div className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <h2 className="font-bold text-lg text-slate-800">
                                {editingArticle ? 'تعديل مقال' : 'كتابة مقال جديد'} ✍️
                            </h2>
                            <div className="h-6 w-px bg-slate-200" />
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('write')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'write' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    كتابة
                                </button>
                                <button
                                    onClick={() => setActiveTab('split')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'split' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    مشترك
                                </button>
                                <button
                                    onClick={() => setActiveTab('preview')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'preview' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    معاينة
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" onClick={() => setIsEditorOpen(false)}>إلغاء</Button>
                            <Button onClick={handleSubmit} disabled={isLoading} className="gradient-primary text-white px-8">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <> <Save className="w-4 h-4 ml-2" /> حفظ التغييرات </>}
                            </Button>
                        </div>
                    </div>

                    {/* Editor Body */}
                    <div className="flex-1 overflow-hidden flex">
                        {/* Settings Sidebar (Left) */}
                        <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto hidden xl:block">
                            <h3 className="font-bold text-slate-900 mb-6">إعدادات المقال</h3>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500">عنوان المقال</label>
                                    <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="bg-slate-50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500">الملخص</label>
                                    <Textarea value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} className="bg-slate-50 h-24 resize-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500">صورة الغلاف (URL)</label>
                                    <Input value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="bg-slate-50" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-500">القسم</label>
                                        <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {libraryCategories.filter(c => c.id !== 'all').map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-500">النوع</label>
                                        <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="article">مقال</SelectItem>
                                                <SelectItem value="video">فيديو</SelectItem>
                                                <SelectItem value="study">دراسة</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700">مقال مميز؟</span>
                                        <Switch checked={formData.featured} onCheckedChange={(c) => setFormData({ ...formData, featured: c })} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Editor Area (Middle) */}
                        <div className={`flex-1 flex flex-col ${activeTab === 'preview' ? 'hidden' : ''}`}>
                            <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 flex justify-between">
                                <span>Markdown Supported</span>
                                <span>{formData.content.length} حرف</span>
                            </div>
                            <Textarea
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="flex-1 resize-none border-0 focus-visible:ring-0 p-8 font-mono text-base leading-relaxed bg-transparent"
                                placeholder="# ابدأ الكتابة هنا..."
                            />
                        </div>

                        {/* Live Preview (Right) */}
                        <div className={`flex-1 bg-white overflow-y-auto border-r border-slate-200 ${activeTab === 'write' ? 'hidden' : ''} ${activeTab === 'split' ? 'hidden lg:block' : ''}`}>
                            <div className="max-w-prose mx-auto p-8 prose prose-slate prose-headings:text-primary prose-a:text-primary">
                                <h1 className="mb-4">{formData.title || 'عنوان المقال'}</h1>
                                {formData.image_url && <img src={formData.image_url} alt="Cover" className="w-full h-48 object-cover rounded-xl mb-6 shadow-md" />}
                                <ReactMarkdown>
                                    {formData.content || '_لا يوجد محتوى بعد..._'}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
