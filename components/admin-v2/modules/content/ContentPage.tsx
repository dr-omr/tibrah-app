// components/admin-v2/modules/content/ContentPage.tsx
// Notion-style Clinical Knowledge Base Editor

import React, { useState } from 'react';
import { FileText, Plus, GripVertical, Image as ImageIcon, Heading1, Heading2, Quote, List, Eye, Trash2, CheckCircle2, CornerDownLeft, Sparkles, Send } from 'lucide-react';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import AdminFilterBar from '../../primitives/AdminFilterBar';
import AdminDetailDrawer from '../../primitives/AdminDetailDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminArticles, useArticleMutation } from '../../hooks/useAdminData';
import { toast } from '@/components/notification-engine';

const MOCK_ARTICLES = [
  { id: 'a1', title: 'دليل التعافي بعد عملية الرباط الصليبي (ACL)', author: 'د. يوسف', reads: 1420, active: true },
  { id: 'a2', title: 'خمسة تمارين لتقوية الكاحل ومنع الالتواء', author: 'د. يوسف', reads: 380, active: true },
  { id: 'a3', title: 'الفرق بين كمادات الثلج والحرارة للإصابات الرياضية', author: 'فريق طِبرة', reads: 0, active: false }
];

export default function ContentPage() {
  const { data: articles = [], isLoading } = useAdminArticles();
  const { mutateAsync: saveArticle } = useArticleMutation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editorOpen, setEditorOpen] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [articleTitle, setArticleTitle] = useState('');

  React.useEffect(() => {
    if (editorOpen && editorOpen !== 'new') {
      const a = articles.find((x: any) => x.id === editorOpen) || MOCK_ARTICLES.find(x => x.id === editorOpen);
      if (a) setArticleTitle(a.title || '');
    } else {
      setArticleTitle('');
    }
  }, [editorOpen, articles]);

  const handlePublish = async () => {
    if (!articleTitle) {
      toast.error('الرجاء كتابة عنوان المقال');
      return;
    }
    setIsSaving(true);
    try {
      await saveArticle({
        data: {
          title: articleTitle,
          author: 'د. عمر',
          reads: 0,
          active: true,
          content: 'محتوى المقال...'
        },
        id: editorOpen !== 'new' ? editorOpen : undefined
      });
      setEditorOpen(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const filters = [
    { id: 'all', label: 'كافة المقالات', count: MOCK_ARTICLES.length },
    { id: 'active', label: 'منشور', count: MOCK_ARTICLES.filter(a => a.active).length },
    { id: 'drafts', label: 'مسودة', count: MOCK_ARTICLES.filter(a => !a.active).length },
  ];

  return (
    <div className="space-y-8 pb-20">
      <AdminPageHeader
        title="المدونة والمقالات الطبية"
        description="شارك المعرفة الطبية وبناء الوعي الصحي للمرضى عبر مكتبة طِبرة."
        icon={<FileText className="w-5 h-5 text-indigo-500" />}
        action={
          <Button onClick={() => setEditorOpen('new')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 sm:h-10 px-6 rounded-xl shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all">
            <Plus className="w-5 h-5 ml-2" /> كتابة مقال جديد
          </Button>
        }
      />

      <AdminFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="ابحث في عناوين المقالات..."
        filters={filters}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
         {(articles.length > 0 ? articles : MOCK_ARTICLES).map((article: any, idx: number) => (
           <div key={article.id} className={`flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors cursor-pointer group ${idx !== MOCK_ARTICLES.length - 1 ? 'border-b border-slate-100' : ''}`} onClick={() => setEditorOpen(article.id)}>
              <div className="flex gap-4 items-center">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${article.active ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-100 border-slate-200'}`}>
                    <FileText className={`w-5 h-5 ${article.active ? 'text-indigo-500' : 'text-slate-400'}`} />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-1 group-hover:text-indigo-600 transition-colors">{article.title}</h3>
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-semibold text-slate-500">الكاتب: {article.author}</span>
                       <span className="text-[10px] text-slate-300">•</span>
                       <span className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Eye className="w-3.5 h-3.5"/> {article.reads} قراءة</span>
                    </div>
                 </div>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                 <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${article.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {article.active ? 'منشور وفعال' : 'مسودة'}
                 </span>
                 <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 rounded-lg shrink-0"><CornerDownLeft className="w-4 h-4"/></Button>
              </div>
           </div>
         ))}
      </div>

      {/* Notion-style Fullscreen Editor Drawer */}
      <AdminDetailDrawer
        open={!!editorOpen}
        onClose={() => setEditorOpen(null)}
        width="100%" // Full width for writing distraction free
        title={<span className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500"/> محرر الكتل الذكي المستوحى من Notion</span>}
        footer={
           <div className="max-w-4xl mx-auto w-full flex items-center justify-between p-4 bg-white border-t border-slate-100 relative z-50">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> تم الحفظ التلقائي في المسودة</span>
              <div className="flex items-center gap-3">
                 <Button variant="ghost" className="text-slate-500 hover:bg-slate-100 font-bold" onClick={() => setEditorOpen(null)}>إغلاق المحرر</Button>
                 <Button 
                   onClick={handlePublish}
                   disabled={isSaving}
                   className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-md disabled:opacity-50"
                 >
                   {isSaving ? 'جاري النشر...' : <><Send className="w-4 h-4 ml-2"/> نشر المقال للمرضى</>}
                 </Button>
              </div>
           </div>
        }
      >
        {/* Editor Canvas Container */}
        <div className="max-w-3xl mx-auto w-full pt-10 pb-32 px-4 sm:px-0">
           
           {/* Cover Add Toggle Mock */}
           <div className="group/cover mb-8">
              <div className="h-48 w-full rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-emerald-50 opacity-50"></div>
                 <div className="flex flex-col items-center gap-2 text-slate-400 group-hover/cover:text-indigo-500 relative z-10 transition-colors">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-sm font-bold">إضافة صورة الغلاف الرئيسية</span>
                 </div>
              </div>
           </div>

           {/* Title Input */}
           <div className="mb-8">
              <input 
                autoFocus
                className="w-full text-4xl sm:text-5xl font-black text-slate-800 placeholder:text-slate-200 focus:outline-none bg-transparent"
                placeholder="عنوان المقال..."
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
              />
           </div>

           {/* Blocks Mock Stream */}
           <div className="space-y-4">
              <EditorBlock type="paragraph" placeholder="ابدأ الكتابة هنا، أو اضغط '/' لإضافة أمر..." content="تشريح الركبة يعتبر من أكثر المواضيع المفيدة..." />
              <EditorBlock type="heading" placeholder="عنوان فرعي 1" content="لماذا يحتاج الرياضيون لتمرين الأربطة؟" />
              <EditorBlock type="image" />
              <EditorBlock type="quote" content="الاستمرارية في التأهيل أهم من قوة التمرين نفسه، العضلة تحتاج فترة للتعود وبناء الذاكرة الحركية." />
              <EditorBlock type="paragraph" placeholder="اكتب المزيد..." />
              
              {/* Slash Command Hint */}
              <div className="flex items-center gap-2 opacity-50 pl-8 mt-6">
                 <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">/</div>
                 <span className="text-sm text-slate-400 font-semibold">لفتح قائمة الأوامر التفاعلية (صور، عناوين، أرقام)</span>
              </div>
           </div>
        </div>
      </AdminDetailDrawer>
    </div>
  );
}

// Internal component mimicking an individual Notion editable block
function EditorBlock({ type, placeholder, content }: { type: string; placeholder?: string, content?: string }) {
  return (
    <div className="group/block flex items-start -ml-12 pl-4 pr-4 transition-colors rounded-lg hover:bg-slate-50 py-1">
       {/* Block Controls (Hover Reveal) */}
       <div className="w-10 opacity-0 group-hover/block:opacity-100 transition-opacity flex items-center gap-1 justify-end shrink-0 pt-1">
          <button className="text-slate-300 hover:text-indigo-500"><Plus className="w-4 h-4"/></button>
          <button className="text-slate-300 hover:text-slate-500 cursor-grab"><GripVertical className="w-4 h-4"/></button>
       </div>

       {/* Block Content Render */}
       <div className="flex-1 min-w-0 pr-3">
          {type === 'paragraph' && (
             <div className="w-full text-lg leading-relaxed text-slate-600 focus:outline-none min-h-[1.5rem]" contentEditable suppressContentEditableWarning data-placeholder={placeholder}>
                {content}
             </div>
          )}
          
          {type === 'heading' && (
             <div className="w-full text-2xl font-bold text-slate-800 focus:outline-none min-h-[2rem] mt-4 mb-2" contentEditable suppressContentEditableWarning data-placeholder={placeholder}>
                {content}
             </div>
          )}

          {type === 'quote' && (
             <div className="w-full text-xl font-medium text-slate-700 italic border-r-4 border-indigo-500 pr-5 py-2 my-4 bg-indigo-50/50 rounded-l-xl focus:outline-none" contentEditable suppressContentEditableWarning>
                "{content}"
             </div>
          )}

          {type === 'image' && (
              <div className="w-full h-40 bg-slate-100 rounded-xl my-4 border border-slate-200 flex items-center justify-center flex-col text-slate-400 gap-2 cursor-pointer hover:bg-slate-200 transition-colors">
                 <ImageIcon className="w-6 h-6" />
                 <span className="text-xs font-bold">مساحة لرفع صورة أو جلبها من Unsplash</span>
              </div>
          )}
       </div>
    </div>
  );
}
