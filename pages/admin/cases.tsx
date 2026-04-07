import React, { useState } from 'react';
import AdminShell from '@/components/admin-v2/layout/AdminShell';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Activity, AlertTriangle, CheckCircle, Clock, ChevronDown, FileText, Microscope, CreditCard, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminCasesPage() {
    const [selectedCase, setSelectedCase] = useState<any>(null);

    // Fetch all clinical cases
    const { data: cases = [], isLoading } = useQuery({
        queryKey: ['admin_cases'],
        queryFn: () => db.entities.ClinicalCase.list('-created_at', undefined, true)
    });

    const getStatusColor = (level: string) => {
        switch (level) {
            case 'emergency': return 'bg-red-50 text-red-700 border-red-200';
            case 'needs_doctor': return 'bg-orange-50 text-orange-700 border-orange-200';
            default: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        }
    };

    return (
        <AdminShell pageTitle="إدارة الحالات السريرية (محرك الرعاية)">
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    
                    {/* Cases List */}
                    <div className="col-span-1 md:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-600" />
                                الحالات النشطة ({cases.length})
                            </h2>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                            {isLoading ? (
                                <p className="text-center text-slate-400 text-xs py-10">جاري التحميل...</p>
                            ) : cases.map((c: any) => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedCase(c)}
                                    className={`w-full text-right p-3 rounded-xl border transition-all ${
                                        selectedCase?.id === c.id 
                                        ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                                        : 'bg-white border-slate-100 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-slate-800 text-sm truncate">{c.chief_complaint || 'شكوى غير محددة'}</span>
                                        <div className={`w-2 h-2 rounded-full mt-1.5 ${
                                            c.triage_level === 'emergency' ? 'bg-red-500' : 
                                            c.triage_level === 'needs_doctor' ? 'bg-orange-500' : 'bg-indigo-500'
                                        }`} />
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">{c.created_at ? format(new Date(c.created_at), 'dd MMM', { locale: ar }) : ''}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(c.triage_level)}`}>
                                            {c.triage_level === 'emergency' ? 'طوارئ' : c.triage_level === 'needs_doctor' ? 'استشارة' : 'مستقر'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Case Detail View */}
                    <div className="col-span-1 md:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                        {selectedCase ? (
                            <div className="flex-1 overflow-y-auto w-full">
                                {/* Header */}
                                <div className="bg-white p-6 border-b border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h1 className="text-2xl font-black text-slate-800">
                                                    {selectedCase.chief_complaint === 'chest_pain' ? 'ألم في الصدر أو ثقل' : 
                                                     selectedCase.chief_complaint === 'headache' ? 'صداع مستمر أو شديد' : 
                                                     selectedCase.chief_complaint || 'شكوى غير مسجلة'}
                                                </h1>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedCase.triage_level)}`}>
                                                    {selectedCase.triage_level === 'emergency' ? 'حالة حرجة' : 
                                                     selectedCase.triage_level === 'needs_doctor' ? 'بحاجة لطبيب' : 'يمكن إدارتها رقمياً'}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm">
                                                المعرف: {selectedCase.id} • مريض: {selectedCase.user_id} • 
                                                {selectedCase.created_at ? format(new Date(selectedCase.created_at), 'dd MMMM yyyy - p', { locale: ar }) : ''}
                                            </p>
                                        </div>
                                        {/* Status Toggle */}
                                        <div className="bg-slate-100 rounded-xl p-1 flex">
                                            <button className="px-4 py-1.5 rounded-lg bg-white shadow-sm text-sm font-bold text-slate-800">نشط</button>
                                            <button className="px-4 py-1.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-700">مكتمل</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6 grid grid-cols-3 gap-6">
                                    {/* Column 1: Clinical Data */}
                                    <div className="col-span-2 space-y-6">
                                        {/* Triage & Red Flags */}
                                        {selectedCase.triage_level === 'emergency' && (
                                            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                                                <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                                                    <AlertTriangle className="w-5 h-5" /> مؤشرات خطورة مكتشفة (Red Flags)
                                                </h3>
                                                <p className="text-red-700 text-sm">המבנה האנליטי للمحرك الرقمي رصد وجود أعراض حرجة تتطلب تدخلاً طارئاً (مثل ألم الصدر). تم توجيه المريض للطوارئ المباشرة.</p>
                                            </div>
                                        )}

                                        {/* Case Info Boxes */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white border text-center border-slate-200 rounded-2xl p-5 shadow-sm">
                                                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                                <p className="text-xs text-slate-500 font-bold mb-1">المدة والحدة</p>
                                                <p className="text-slate-800 font-black text-lg">أيام (مستوى ٨/١٠)</p>
                                            </div>
                                            <div className="bg-indigo-50 border text-center border-indigo-100 rounded-2xl p-5 shadow-sm">
                                                <Microscope className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                                                <p className="text-xs text-indigo-500 font-bold mb-1">المرفقات المخبرية</p>
                                                <p className="text-indigo-900 font-black text-lg">١ ملف مرفق</p>
                                            </div>
                                        </div>

                                        {/* Action Flow */}
                                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                                <CheckCircle className="w-5 h-5 text-emerald-500" /> رد المحرك الرقمي المباشر
                                            </h3>
                                            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-100">
                                                تم توجيه المريض وإصدار التوصيات المبدئية بناءً على مستوى التقييم في نموذج الإدخال السريري.
                                            </div>
                                            <div className="mt-4 flex justify-end gap-3">
                                                <Button className="bg-indigo-600 text-white font-bold rounded-xl">إرسال خطة رعاية</Button>
                                                <Button variant="outline" className="text-indigo-600 border-indigo-200 font-bold rounded-xl">رسالة للمريض</Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Financials & Admin context */}
                                    <div className="col-span-1 space-y-4">
                                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                                <CreditCard className="w-4 h-4 text-slate-500" />
                                                طلبات الخدمات
                                            </h3>
                                            {selectedCase.payment_status === 'pending' ? (
                                                <div className="border border-orange-200 bg-orange-50 rounded-xl p-3">
                                                    <p className="text-sm font-bold text-orange-800 mb-1">طلب معلق (تحويل بنكي)</p>
                                                    <p className="text-xs text-orange-600">طلب رقم #19034 - بانتظار التأكيد المالي لفتح إمكانية مراجعة الحالة.</p>
                                                    <Button className="w-full mt-3 h-8 bg-orange-600 text-white rounded-lg text-xs font-bold">تأكيد الاستلام والتفعيل</Button>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-slate-100">لا توجد طلبات مدفوعة مرتبطة حالياً.</p>
                                            )}
                                        </div>

                                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                                <FileText className="w-4 h-4 text-slate-500" />
                                                الملفات المرفقة
                                            </h3>
                                            <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                                                <div className="flex items-center gap-2 text-sm text-slate-700 font-bold">
                                                    <FileText className="w-4 h-4 text-indigo-500" />
                                                    تحليل دم (CBC)
                                                </div>
                                                <ExternalLink className="w-3 h-3 text-slate-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10">
                                <Activity className="w-16 h-16 text-slate-200 mb-4" />
                                <h3 className="text-lg font-bold text-slate-600 mb-2">محرك الرعاية الرقمي</h3>
                                <p className="text-sm text-center max-w-md">اختر حالة من القائمة لاستعراض تفاصيل التقييم السريري الشامل والحالة المالية للطلبات.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
