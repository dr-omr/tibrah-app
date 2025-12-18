import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
    FileText, Upload, File, X, Calendar, Download, ExternalLink,
    AlertCircle, CheckCircle2, Clock, Activity, Microscope, Pill,
    Plus, Edit3, Trash2, User, Heart, Droplets, ChevronDown, ChevronUp,
    Loader2, Save
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Interfaces
interface PatientProfile {
    id?: string;
    full_name?: string;
    birth_date?: string;
    gender?: string;
    blood_type?: string;
    height?: number;
    weight?: number;
    allergies?: string[];
    chronic_conditions?: ChronicCondition[];
    emergency_contact?: string;
    notes?: string;
}

interface ChronicCondition {
    name: string;
    status: 'active' | 'controlled' | 'resolved';
    diagnosis_date?: string;
    notes?: string;
}

interface MedicalFile {
    id?: string;
    name: string;
    url: string;
    type: string;
    category: string;
    uploaded_at: string;
    notes?: string;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const FILE_CATEGORIES = ['تحاليل', 'أشعة', 'تقارير', 'روشتات', 'أخرى'];

export default function MedicalFile() {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [showProfileSheet, setShowProfileSheet] = useState(false);
    const [showConditionSheet, setShowConditionSheet] = useState(false);
    const [showAllergySheet, setShowAllergySheet] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        profile: true,
        conditions: true,
        allergies: true
    });

    // Load patient profile from localStorage
    const [profile, setProfile] = useState<PatientProfile>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('patientProfile');
            return saved ? JSON.parse(saved) : {};
        }
        return {};
    });

    // Fetch uploaded files
    const { data: files = [], isLoading: filesLoading } = useQuery<MedicalFile[]>({
        queryKey: ['medicalFiles'],
        queryFn: async () => {
            try {
                const data = await base44.entities.PatientFile?.list?.('-uploaded_at');
                return (data || []) as MedicalFile[];
            } catch {
                // Return from localStorage as fallback
                const saved = localStorage.getItem('medicalFiles');
                return saved ? JSON.parse(saved) : [];
            }
        },
    });

    // Save profile
    const saveProfile = (updates: Partial<PatientProfile>) => {
        const newProfile = { ...profile, ...updates };
        setProfile(newProfile);
        localStorage.setItem('patientProfile', JSON.stringify(newProfile));
        toast.success('تم حفظ البيانات');
    };

    // Add chronic condition
    const addChronicCondition = (condition: ChronicCondition) => {
        const conditions = [...(profile.chronic_conditions || []), condition];
        saveProfile({ chronic_conditions: conditions });
        setShowConditionSheet(false);
    };

    // Remove chronic condition
    const removeChronicCondition = (index: number) => {
        const conditions = [...(profile.chronic_conditions || [])];
        conditions.splice(index, 1);
        saveProfile({ chronic_conditions: conditions });
    };

    // Add allergy
    const addAllergy = (allergy: string) => {
        const allergies = [...(profile.allergies || []), allergy];
        saveProfile({ allergies });
        setShowAllergySheet(false);
    };

    // Remove allergy
    const removeAllergy = (index: number) => {
        const allergies = [...(profile.allergies || [])];
        allergies.splice(index, 1);
        saveProfile({ allergies });
    };

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });

            const newFile: MedicalFile = {
                id: Date.now().toString(),
                name: file.name,
                url: file_url,
                type: file.type,
                category: 'أخرى',
                uploaded_at: new Date().toISOString()
            };

            // Save to localStorage as fallback
            const savedFiles = JSON.parse(localStorage.getItem('medicalFiles') || '[]');
            localStorage.setItem('medicalFiles', JSON.stringify([newFile, ...savedFiles]));

            queryClient.invalidateQueries({ queryKey: ['medicalFiles'] });
            toast.success('تم رفع الملف بنجاح');
        } catch (error) {
            console.error(error);
            toast.error('فشل رفع الملف');
        } finally {
            setUploading(false);
        }
    };

    // Delete file
    const deleteFile = (id: string) => {
        const savedFiles = JSON.parse(localStorage.getItem('medicalFiles') || '[]');
        const filtered = savedFiles.filter((f: MedicalFile) => f.id !== id);
        localStorage.setItem('medicalFiles', JSON.stringify(filtered));
        queryClient.invalidateQueries({ queryKey: ['medicalFiles'] });
        toast.success('تم حذف الملف');
    };

    const allFiles = files.length > 0 ? files : JSON.parse(localStorage.getItem('medicalFiles') || '[]');

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-red-100 text-red-700';
            case 'controlled': return 'bg-green-100 text-green-700';
            case 'resolved': return 'bg-slate-100 text-slate-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'نشط';
            case 'controlled': return 'تحت السيطرة';
            case 'resolved': return 'تم الشفاء';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
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

                {/* Quick Profile Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#2D9B83]/30 flex items-center justify-center">
                            <User className="w-8 h-8 text-[#2D9B83]" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold text-lg">
                                {profile.full_name || 'أدخل اسمك'}
                            </h2>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {profile.blood_type && (
                                    <Badge className="bg-red-500/20 text-red-200 border-0 text-xs">
                                        <Droplets className="w-3 h-3 ml-1" />
                                        {profile.blood_type}
                                    </Badge>
                                )}
                                {profile.birth_date && (
                                    <Badge className="bg-white/20 border-0 text-xs">
                                        <Calendar className="w-3 h-3 ml-1" />
                                        {format(new Date(profile.birth_date), 'yyyy')}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={() => setShowProfileSheet(true)}
                        >
                            <Edit3 className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-6 relative z-10 space-y-4">

                {/* Chronic Conditions Section */}
                <Card className="border-0 shadow-lg">
                    <CardHeader
                        className="pb-2 cursor-pointer"
                        onClick={() => toggleSection('conditions')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-[#2D9B83]" />
                                <CardTitle className="text-base">الحالات المزمنة</CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                    {profile.chronic_conditions?.length || 0}
                                </Badge>
                            </div>
                            {expandedSections.conditions ?
                                <ChevronUp className="w-5 h-5 text-slate-400" /> :
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                            }
                        </div>
                    </CardHeader>
                    {expandedSections.conditions && (
                        <CardContent className="pt-0">
                            {profile.chronic_conditions && profile.chronic_conditions.length > 0 ? (
                                <div className="space-y-2">
                                    {profile.chronic_conditions.map((condition, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                                            <div>
                                                <span className="font-medium text-slate-800 dark:text-white">{condition.name}</span>
                                                {condition.diagnosis_date && (
                                                    <span className="text-xs text-slate-400 mr-2">
                                                        منذ {format(new Date(condition.diagnosis_date), 'yyyy', { locale: ar })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={`${getStatusColor(condition.status)} border-0 text-xs`}>
                                                    {getStatusLabel(condition.status)}
                                                </Badge>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="w-8 h-8 text-red-500 hover:bg-red-50"
                                                    onClick={() => removeChronicCondition(idx)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-2">لا توجد حالات مسجلة</p>
                            )}
                            <Button
                                variant="outline"
                                className="w-full mt-3 rounded-xl border-dashed"
                                onClick={() => setShowConditionSheet(true)}
                            >
                                <Plus className="w-4 h-4 ml-2" />
                                إضافة حالة مزمنة
                            </Button>
                        </CardContent>
                    )}
                </Card>

                {/* Allergies Section */}
                <Card className="border-0 shadow-lg">
                    <CardHeader
                        className="pb-2 cursor-pointer"
                        onClick={() => toggleSection('allergies')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                <CardTitle className="text-base">الحساسية</CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                    {profile.allergies?.length || 0}
                                </Badge>
                            </div>
                            {expandedSections.allergies ?
                                <ChevronUp className="w-5 h-5 text-slate-400" /> :
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                            }
                        </div>
                    </CardHeader>
                    {expandedSections.allergies && (
                        <CardContent className="pt-0">
                            {profile.allergies && profile.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.allergies.map((allergy, idx) => (
                                        <Badge
                                            key={idx}
                                            className="bg-amber-100 text-amber-700 border-0 px-3 py-1 text-sm flex items-center gap-1"
                                        >
                                            {allergy}
                                            <button
                                                onClick={() => removeAllergy(idx)}
                                                className="mr-1 hover:text-red-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-2">لا توجد حساسية مسجلة</p>
                            )}
                            <Button
                                variant="outline"
                                className="w-full mt-3 rounded-xl border-dashed"
                                onClick={() => setShowAllergySheet(true)}
                            >
                                <Plus className="w-4 h-4 ml-2" />
                                إضافة حساسية
                            </Button>
                        </CardContent>
                    )}
                </Card>

                {/* Quick Upload Action */}
                <Card className="border-dashed border-2 border-[#2D9B83]/30 bg-green-50/50 dark:bg-green-900/10">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-[#2D9B83]/10 flex items-center justify-center mb-3">
                            <Upload className="w-7 h-7 text-[#2D9B83]" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-1">إضافة مستند طبي</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">ارفع نتائج التحاليل، الأشعة، أو التقارير الطبية</p>

                        <div className="relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                            <Button className="gradient-primary rounded-xl px-8" disabled={uploading}>
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                                {uploading ? 'جاري الرفع...' : 'اختر ملف'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Files Tabs */}
                <Tabs defaultValue="files" className="w-full">
                    <TabsList className="w-full bg-white dark:bg-slate-800 p-1 rounded-xl h-12 shadow-sm">
                        <TabsTrigger value="files" className="flex-1 rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-[#2D9B83]">
                            الملفات ({allFiles.length})
                        </TabsTrigger>
                        <TabsTrigger value="labs" className="flex-1 rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-[#2D9B83]">
                            المختبر
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="files" className="mt-4 space-y-3">
                        {allFiles.length > 0 ? (
                            allFiles.map((file: MedicalFile) => (
                                <div key={file.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                            <File className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white truncate max-w-[180px]">{file.name}</p>
                                            <p className="text-xs text-slate-400">
                                                {format(new Date(file.uploaded_at), 'dd/MM/yyyy', { locale: ar })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="icon" className="rounded-lg">
                                                <ExternalLink className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </a>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={() => deleteFile(file.id!)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <File className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-500 dark:text-slate-400">لا توجد ملفات مرفقة بعد</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="labs" className="mt-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm text-center">
                            <Microscope className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-600 dark:text-slate-400 mb-2">نتائج المختبر الرقمية</p>
                            <p className="text-xs text-slate-400">سيتم عرض نتائج التحاليل هنا</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Profile Edit Sheet */}
            <ProfileEditSheet
                open={showProfileSheet}
                onOpenChange={setShowProfileSheet}
                profile={profile}
                onSave={saveProfile}
            />

            {/* Add Condition Sheet */}
            <AddConditionSheet
                open={showConditionSheet}
                onOpenChange={setShowConditionSheet}
                onAdd={addChronicCondition}
            />

            {/* Add Allergy Sheet */}
            <AddAllergySheet
                open={showAllergySheet}
                onOpenChange={setShowAllergySheet}
                onAdd={addAllergy}
            />
        </div>
    );
}

// Profile Edit Sheet Component
function ProfileEditSheet({
    open,
    onOpenChange,
    profile,
    onSave
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile: PatientProfile;
    onSave: (updates: Partial<PatientProfile>) => void;
}) {
    const [formData, setFormData] = useState(profile);

    const handleSave = () => {
        onSave(formData);
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-right text-xl">البيانات الشخصية</SheetTitle>
                </SheetHeader>

                <div className="py-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الاسم الكامل</label>
                        <Input
                            value={formData.full_name || ''}
                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="أدخل اسمك الكامل"
                            className="h-12 rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">تاريخ الميلاد</label>
                            <Input
                                type="date"
                                value={formData.birth_date || ''}
                                onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الجنس</label>
                            <select
                                value={formData.gender || ''}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-4"
                            >
                                <option value="">اختر</option>
                                <option value="male">ذكر</option>
                                <option value="female">أنثى</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">فصيلة الدم</label>
                        <div className="grid grid-cols-4 gap-2">
                            {BLOOD_TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFormData({ ...formData, blood_type: type })}
                                    className={`p-3 rounded-xl text-sm font-bold transition-all ${formData.blood_type === type
                                            ? 'bg-red-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الطول (سم)</label>
                            <Input
                                type="number"
                                value={formData.height || ''}
                                onChange={e => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                                placeholder="170"
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الوزن (كجم)</label>
                            <Input
                                type="number"
                                value={formData.weight || ''}
                                onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                                placeholder="70"
                                className="h-12 rounded-xl"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">رقم الطوارئ</label>
                        <Input
                            value={formData.emergency_contact || ''}
                            onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
                            placeholder="رقم للتواصل في الحالات الطارئة"
                            className="h-12 rounded-xl"
                            dir="ltr"
                        />
                    </div>

                    <Button
                        onClick={handleSave}
                        className="w-full h-14 rounded-2xl gradient-primary text-white font-bold text-lg"
                    >
                        <Save className="w-5 h-5 ml-2" />
                        حفظ البيانات
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Add Condition Sheet
function AddConditionSheet({
    open,
    onOpenChange,
    onAdd
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (condition: ChronicCondition) => void;
}) {
    const [formData, setFormData] = useState<ChronicCondition>({
        name: '',
        status: 'active',
        diagnosis_date: ''
    });

    const handleAdd = () => {
        if (!formData.name) {
            toast.error('أدخل اسم الحالة');
            return;
        }
        onAdd(formData);
        setFormData({ name: '', status: 'active', diagnosis_date: '' });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                    <SheetTitle className="text-right text-xl">إضافة حالة مزمنة</SheetTitle>
                </SheetHeader>

                <div className="py-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">اسم الحالة</label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="مثال: السكري، ضغط الدم"
                            className="h-12 rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الحالة</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'active', label: 'نشط', color: 'bg-red-500' },
                                { value: 'controlled', label: 'تحت السيطرة', color: 'bg-green-500' },
                                { value: 'resolved', label: 'تم الشفاء', color: 'bg-slate-400' }
                            ].map(status => (
                                <button
                                    key={status.value}
                                    onClick={() => setFormData({ ...formData, status: status.value as any })}
                                    className={`p-3 rounded-xl text-sm font-medium transition-all ${formData.status === status.value
                                            ? `${status.color} text-white`
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                                        }`}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">تاريخ التشخيص</label>
                        <Input
                            type="date"
                            value={formData.diagnosis_date || ''}
                            onChange={e => setFormData({ ...formData, diagnosis_date: e.target.value })}
                            className="h-12 rounded-xl"
                        />
                    </div>

                    <Button
                        onClick={handleAdd}
                        className="w-full h-14 rounded-2xl gradient-primary text-white font-bold"
                    >
                        <Plus className="w-5 h-5 ml-2" />
                        إضافة
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Add Allergy Sheet
function AddAllergySheet({
    open,
    onOpenChange,
    onAdd
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (allergy: string) => void;
}) {
    const [allergy, setAllergy] = useState('');

    const handleAdd = () => {
        if (!allergy.trim()) {
            toast.error('أدخل نوع الحساسية');
            return;
        }
        onAdd(allergy.trim());
        setAllergy('');
    };

    const commonAllergies = ['البنسلين', 'الجلوتين', 'اللاكتوز', 'الفول السوداني', 'البيض', 'الأسبرين'];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                    <SheetTitle className="text-right text-xl">إضافة حساسية</SheetTitle>
                </SheetHeader>

                <div className="py-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">نوع الحساسية</label>
                        <Input
                            value={allergy}
                            onChange={e => setAllergy(e.target.value)}
                            placeholder="أدخل نوع الحساسية"
                            className="h-12 rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">اختيارات شائعة</label>
                        <div className="flex flex-wrap gap-2">
                            {commonAllergies.map(a => (
                                <button
                                    key={a}
                                    onClick={() => setAllergy(a)}
                                    className={`px-3 py-2 rounded-xl text-sm transition-all ${allergy === a
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                        }`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleAdd}
                        className="w-full h-14 rounded-2xl gradient-primary text-white font-bold"
                    >
                        <Plus className="w-5 h-5 ml-2" />
                        إضافة
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
