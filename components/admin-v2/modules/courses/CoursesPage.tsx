// components/admin-v2/modules/courses/CoursesPage.tsx
// Ultra-Premium Clinical Curriculum CMS

import React, { useState } from 'react';
import { BookOpen, Plus, PlayCircle, FileText, GripVertical, CheckCircle2, ChevronDown, Video, MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import AdminPageHeader from '../../primitives/AdminPageHeader';
import AdminFilterBar from '../../primitives/AdminFilterBar';
import AdminDetailDrawer from '../../primitives/AdminDetailDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminCourses, useCourseMutation } from '../../hooks/useAdminData';
import { toast } from '@/components/notification-engine';

const MOCK_COURSES = [
  { id: 'c1', title: 'تأهيل آلام أسفل الظهر التام', modules: 12, students: 240, progress: 68, active: true, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=500' },
  { id: 'c2', title: 'استعادة مرونة الكتف وتخفيف الألم', modules: 8, students: 115, progress: 45, active: false, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=500' },
  { id: 'c3', title: 'البرنامج الشامل للركبة الرياضية', modules: 15, students: 305, progress: 82, active: true, image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?auto=format&fit=crop&q=80&w=500' }
];

export default function CoursesPage() {
  const { data: courses = [], isLoading } = useAdminCourses();
  const { mutateAsync: saveCourse } = useCourseMutation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [builderOpen, setBuilderOpen] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for the course being edited
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');

  // Auto-populate when opening an existing course
  React.useEffect(() => {
    if (builderOpen && builderOpen !== 'new') {
      const c = courses.find((x: any) => x.id === builderOpen) || MOCK_COURSES.find(x => x.id === builderOpen);
      if (c) {
        setCourseTitle(c.title || '');
        setCourseDesc(c.description || '');
      }
    } else {
      setCourseTitle('');
      setCourseDesc('');
    }
  }, [builderOpen, courses]);

  const handlePublish = async () => {
    if (!courseTitle) {
      toast.error('الرجاء كتابة عنوان الدورة أولاً');
      return;
    }
    setIsSaving(true);
    try {
      await saveCourse({ 
        data: { 
          title: courseTitle, 
          description: courseDesc,
          active: true,
          modules: 3, 
          students: 0,
          progress: 0,
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=500' // Default
        },
        id: builderOpen !== 'new' ? builderOpen : undefined
      });
      setBuilderOpen(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const filters = [
    { id: 'all', label: 'كافة البرامج', count: MOCK_COURSES.length },
    { id: 'active', label: 'النشطة', count: MOCK_COURSES.filter(c => c.active).length },
    { id: 'drafts', label: 'المسودات', count: MOCK_COURSES.filter(c => !c.active).length },
  ];

  return (
    <div className="space-y-8 pb-20">
      <AdminPageHeader
        title="أكاديمية طِبرة وبرامج التأهيل"
        description="بناء المناهج السريرية وإدارة الرحلات العلاجية للمرضى بأسلوب تفاعلي."
        icon={<BookOpen className="w-5 h-5 text-indigo-500" />}
        action={
          <Button onClick={() => setBuilderOpen('new')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 sm:h-10 px-6 rounded-xl shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all">
            <Plus className="w-5 h-5 ml-2" /> بناء برنامج جديد
          </Button>
        }
      />

      <AdminFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="ابحث في البرامج العلاجية..."
        filters={filters}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {/* Course Grid - Premium presentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(courses.length > 0 ? courses : MOCK_COURSES).map((course: any) => (
          <div key={course.id} className="bg-white rounded-[2rem] p-3 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer" onClick={() => setBuilderOpen(course.id)}>
             <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-4">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2 mb-1">
                     <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm ${course.active ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30' : 'bg-slate-500/30 text-slate-200 border border-slate-400/30'}`}>
                        {course.active ? 'نشط عالمياً' : 'مسودة غير منشورة'}
                     </span>
                  </div>
                </div>
             </div>
             
             <div className="px-3 pb-3">
               <h3 className="font-black text-slate-800 text-lg leading-tight mb-4">{course.title}</h3>
               
               {/* Sparkline & Metric simulation */}
               <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-semibold text-slate-500">متوسط إنجاز المرضى ({course.progress}%)</span>
                 <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{course.students} مشترك</span>
               </div>
               
               <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 rounded-full relative" style={{ width: `${course.progress}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 animate-pulse"></div>
                 </div>
               </div>

               <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4">
                 <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5"><PlayCircle className="w-4 h-4"/> {course.modules} فصول تأهيلية</span>
                 <Button variant="ghost" className="h-8 text-xs font-bold text-indigo-600 hover:bg-indigo-50 bg-white shadow-sm border border-slate-100 rounded-xl px-4">فتح المنشئ</Button>
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* Visual Curriculum Builder Drawer */}
      <AdminDetailDrawer
        open={!!builderOpen}
        onClose={() => setBuilderOpen(null)}
        width="60vw" // Very wide for content editing, resembles a workspace
        title={<span className="text-xl font-black text-slate-900 flex items-center gap-2"><BookOpen className="text-indigo-600"/> منشئ الخطة العلاجية المبتكر</span>}
        subtitle="Stripe & Notion Inspired Visual Builder"
        footer={
          <div className="flex gap-3 w-full bg-slate-50/50 p-4 border-t border-slate-100 backdrop-blur-xl">
             <Button 
               onClick={handlePublish}
               disabled={isSaving}
               className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl shadow-lg disabled:opacity-50"
             >
               {isSaving ? 'جاري النشر...' : 'حفظ المنهج ونشره'}
             </Button>
             <Button variant="outline" className="h-12 px-6 rounded-xl font-bold bg-white" onClick={() => setBuilderOpen(null)}>إلغاء</Button>
          </div>
        }
      >
        <div className="space-y-10 p-2 sm:p-4">
           {/* Unified Outline Header */}
           <div className="space-y-4">
             <Input 
               value={courseTitle} 
               onChange={e => setCourseTitle(e.target.value)}
               placeholder="عنوان البرنامج العلاجي الدقيق..." 
               className="text-3xl font-black h-16 border-0 shadow-none px-0 text-slate-800 placeholder:text-slate-300 focus-visible:ring-0" 
             />
             <Input 
               value={courseDesc}
               onChange={e => setCourseDesc(e.target.value)}
               placeholder="وصف موجز لأهداف البرنامج، ولمن يصلح..." 
               className="text-lg font-medium h-auto border-0 shadow-none px-0 text-slate-500 placeholder:text-slate-300 focus-visible:ring-0" 
             />
           </div>

           {/* Interactive Node Graph Curriculum Area */}
           <div>
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">خريطة الرحلة</h4>
                <Button variant="outline" size="sm" className="h-8 rounded-full border-dashed border-2 border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 font-bold transition-all"><Plus className="w-3.5 h-3.5 ml-1"/> إضافة مرحلة جديدة</Button>
             </div>

             <CurriculumNode moduleName="المرحلة الأولى: تقليل الالتهاب وتخفيف الألم الحاد" items={['فيديو: مقدمة لشرح التشريح', 'بطاقة: إرشادات الثلج والراحة', 'تمرين: استطالة الرقبة الخفيف']} isFirst />
             <CurriculumNode moduleName="المرحلة الثانية: استعادة المدى الحركي (الأسابيع 2-4)" items={['فيديو: سلسلة تمارين التنقل الوظيفي', 'استبيان تقييم الألم']} />
             <CurriculumNode moduleName="المرحلة الثالثة: تقوية العضلات العميقة واستدامة التعافي" items={['فيديو: تمارين المقاومة باستخدام الأحزمة']} isLast />
           </div>

        </div>
      </AdminDetailDrawer>
    </div>
  );
}

// Visual Building Block (Notion/Stripe layout pattern)
function CurriculumNode({ moduleName, items, isFirst, isLast }: { moduleName: string; items: string[], isFirst?: boolean, isLast?: boolean }) {
  return (
    <div className="relative group/node flex gap-6">
       {/* Timeline trunk */}
       <div className="flex flex-col items-center">
          <div className={`w-0.5 bg-indigo-100 ${isFirst ? 'mt-4 h-full' : (isLast ? 'h-4 mb-auto' : 'h-full')} absolute left-6`}></div>
          <div className="w-12 h-12 rounded-2xl bg-white border-2 border-indigo-100 flex items-center justify-center relative z-10 shadow-sm text-indigo-400 group-hover/node:border-indigo-600 group-hover/node:text-indigo-600 transition-colors">
            <CheckCircle2 className="w-5 h-5" />
          </div>
       </div>

       {/* Content Box */}
       <div className="flex-1 pb-10">
         <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
               <div className="flex items-center gap-3">
                 <GripVertical className="w-5 h-5 text-slate-300 cursor-grab active:cursor-grabbing hover:text-indigo-400" />
                 <h5 className="font-bold text-slate-800 text-lg">{moduleName}</h5>
               </div>
               <div className="flex items-center gap-2 opacity-0 group-hover/node:opacity-100 transition-opacity">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"><MoreHorizontal className="w-4 h-4"/></button>
               </div>
            </div>

            <div className="space-y-3 pl-8">
               {items.map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors group/item">
                    <div className="flex items-center gap-3">
                       <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                       <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                          {item.includes('فيديو') ? <PlayCircle className="w-4 h-4 text-rose-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
                       </div>
                       <span className="font-semibold text-slate-700 text-sm">{item}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                       <button className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-white"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                 </div>
               ))}
               
               <button className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-400 hover:text-indigo-600 transition-colors p-2 mt-2 group/add w-full">
                  <div className="w-5 h-5 rounded-md bg-slate-100 group-hover/add:bg-indigo-50 flex items-center justify-center border border-dashed border-slate-300 group-hover/add:border-indigo-300">
                     <Plus className="w-3 h-3" />
                  </div>
                  إضافة مصدر (فيديو، مسابقة، أو مقال)
               </button>
            </div>
         </div>
       </div>
    </div>
  );
}
