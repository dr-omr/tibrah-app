import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
    FileText, Upload, File, X, Calendar, Download, ExternalLink,
    AlertCircle, CheckCircle2, Clock, Activity, Microscope, Pill
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import AIContextAssistant from '@/components/ai/AIContextAssistant';
import { DOCTOR_KNOWLEDGE } from '@/components/ai/knowledge';

export default function MedicalFile() {
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState([]); // In a real app, fetch from entity 'PatientFile'

    // Mock data for demo - replace with actual queries
    const userMetrics = [];
    const userSymptoms = [];
    const chronicConditions = [
        { name: 'ارتفاع ضغط الدم', status: 'تحت السيطرة', diagnosis_date: '2023-01-15' },
        { name: 'قولون عصبي', status: 'نشط', diagnosis_date: '2023-06-20' }
    ];

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });

            // Simulate saving file record
            const newFile = {
                id: Date.now(),
                name: file.name,
                url: file_url,
                type: file.type,
                uploaded_at: new Date().toISOString()
            };

            setFiles([newFile, ...files]);
            toast.success('تم رفع الملف بنجاح');
        } catch (error) {
            console.error(error);
            toast.error('فشل رفع الملف');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 text-white px-6 py-8 rounded-b-[2.5rem] shadow-xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">ملفي الطبي الموحد</h1>
                        <p className="text-slate-400 text-sm">كل بياناتك الصحية في مكان واحد آمن</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Chronic Disease Summary Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-5 h-5 text-[#2D9B83]" />
                        <h3 className="font-bold">الحالات المزمنة</h3>
                    </div>
                    <div className="space-y-2">
                        {chronicConditions.map((condition, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-black/20 rounded-lg p-2 px-3">
                                <span className="text-sm font-medium">{condition.name}</span>
                                <Badge variant={condition.status === 'نشط' ? 'destructive' : 'outline'} className="text-xs border-0">
                                    {condition.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10">
                        <AIContextAssistant
                            contextType="chronic_summary"
                            contextData={{ conditions: chronicConditions }}
                            knowledgeBase={DOCTOR_KNOWLEDGE}
                            title="تحليل حالتي المزمنة"
                        />
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-6 relative z-10 space-y-6">

                {/* Quick Upload Action */}
                <Card className="border-dashed border-2 border-[#2D9B83]/30 bg-green-50/50">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-[#2D9B83]/10 flex items-center justify-center mb-3">
                            <Upload className="w-7 h-7 text-[#2D9B83]" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">إضافة مستند طبي</h3>
                        <p className="text-sm text-slate-500 mb-4">ارفع نتائج التحاليل، الأشعة، أو التقارير الطبية</p>

                        <div className="relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                            <Button className="gradient-primary rounded-xl px-8" disabled={uploading}>
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <PlusIcon className="w-4 h-4 ml-2" />}
                                {uploading ? 'جاري الرفع...' : 'اختر ملف'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs for Data */}
                <Tabs defaultValue="files" className="w-full">
                    <TabsList className="w-full bg-white p-1 rounded-xl h-12 shadow-sm">
                        <TabsTrigger value="files" className="flex-1 rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-[#2D9B83]">الملفات</TabsTrigger>
                        <TabsTrigger value="labs" className="flex-1 rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-[#2D9B83]">المختبر</TabsTrigger>
                        <TabsTrigger value="history" className="flex-1 rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-[#2D9B83]">السجل</TabsTrigger>
                    </TabsList>

                    <TabsContent value="files" className="mt-4 space-y-3">
                        {files.length > 0 ? (
                            files.map((file) => (
                                <div key={file.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                            <File className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 truncate max-w-[200px]">{file.name}</p>
                                            <p className="text-xs text-slate-400">{new Date(file.uploaded_at).toLocaleDateString('ar-SA')}</p>
                                        </div>
                                    </div>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="icon">
                                            <ExternalLink className="w-4 h-4 text-slate-400" />
                                        </Button>
                                    </a>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white rounded-xl border border-slate-100">
                                <File className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500">لا توجد ملفات مرفقة بعد</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="labs" className="mt-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                            <Microscope className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 mb-2">نتائج المختبر الرقمية</p>
                            <p className="text-xs text-slate-400">سيتم عرض نتائج التحاليل التي يدخلها الطبيب هنا تلقائياً</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-4">
                        {/* Comprehensive History Link */}
                        <Button className="w-full bg-white text-slate-700 border border-slate-200 h-12 hover:bg-slate-50" onClick={() => window.location.href = '/HealthTracker'}>
                            الذهاب إلى السجل اليومي المفصل
                        </Button>
                    </TabsContent>
                </Tabs>

            </div>
        </div>
    );
}

function PlusIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
