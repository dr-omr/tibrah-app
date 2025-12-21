// pages/medical-file.tsx
// Premium Medical File with Touch Interactions

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import {
    FileText, Upload, File, X, Calendar, ExternalLink,
    User, Edit3, Activity, AlertCircle, Pill, Plus,
    ChevronDown, ChevronUp, Trash2, Save, Droplets,
    Microscope, Loader2, Heart, Scale, Thermometer,
    Shield, Clock, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';

// Types
interface ChronicCondition {
    name: string;
    status: 'active' | 'controlled' | 'resolved';
    diagnosis_date?: string;
}

interface PatientProfile {
    full_name?: string;
    birth_date?: string;
    gender?: string;
    blood_type?: string;
    height?: number;
    weight?: number;
    emergency_contact?: string;
    chronic_conditions?: ChronicCondition[];
    allergies?: string[];
}

interface MedicalFile {
    id?: string;
    name: string;
    url: string;
    type: string;
    uploaded_at: string;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Quick Action Items for the profile
const quickInfoItems = [
    { icon: Droplets, label: 'فصيلة الدم', key: 'blood_type', color: '#EF4444', bg: 'bg-red-50' },
    { icon: Scale, label: 'الوزن', key: 'weight', color: '#8B5CF6', bg: 'bg-purple-50', suffix: 'كجم' },
    { icon: Thermometer, label: 'الطول', key: 'height', color: '#3B82F6', bg: 'bg-blue-50', suffix: 'سم' },
    { icon: Calendar, label: 'العمر', key: 'birth_date', color: '#10B981', bg: 'bg-emerald-50' },
];

export default function MedicalFile() {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [showProfileSheet, setShowProfileSheet] = useState(false);
    const [showConditionSheet, setShowConditionSheet] = useState(false);
    const [showAllergySheet, setShowAllergySheet] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        conditions: true,
        allergies: true,
    });

    // Fetch profile
    const { data: profile = {} as PatientProfile } = useQuery<PatientProfile>({
        queryKey: ['patientProfile'],
        queryFn: async () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('patientProfile');
                return saved ? JSON.parse(saved) : {};
            }
            return {};
        },
    });

    // Fetch files
    const { data: files = [] } = useQuery<MedicalFile[]>({
        queryKey: ['medicalFiles'],
        queryFn: async () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('medicalFiles');
                return saved ? JSON.parse(saved) : [];
            }
            return [];
        },
    });

    // Save profile
    const saveProfile = (updates: Partial<PatientProfile>) => {
        const newProfile = { ...profile, ...updates };
        if (typeof window !== 'undefined') {
            localStorage.setItem('patientProfile', JSON.stringify(newProfile));
        }
        queryClient.invalidateQueries({ queryKey: ['patientProfile'] });
        toast.success('تم حفظ البيانات');
    };

    // Add chronic condition
    const addChronicCondition = (condition: ChronicCondition) => {
        const conditions = [...(profile.chronic_conditions || []), condition];
        saveProfile({ chronic_conditions: conditions });
        setShowConditionSheet(false);
        toast.success('تم إضافة الحالة');
    };

    // Remove chronic condition
    const removeChronicCondition = (idx: number) => {
        const conditions = (profile.chronic_conditions || []).filter((_, i) => i !== idx);
        saveProfile({ chronic_conditions: conditions });
        toast.success('تم حذف الحالة');
    };

    // Add allergy
    const addAllergy = (allergy: string) => {
        const allergies = [...(profile.allergies || []), allergy];
        saveProfile({ allergies });
        setShowAllergySheet(false);
        toast.success('تم إضافة الحساسية');
    };

    // Remove allergy
    const removeAllergy = (idx: number) => {
        const allergies = (profile.allergies || []).filter((_, i) => i !== idx);
        saveProfile({ allergies });
        toast.success('تم حذف الحساسية');
    };

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Simulate upload for demo
            const newFile: MedicalFile = {
                id: Date.now().toString(),
                name: file.name,
                url: URL.createObjectURL(file),
                type: file.type,
                uploaded_at: new Date().toISOString(),
            };

            const savedFiles = [...files, newFile];
            if (typeof window !== 'undefined') {
                localStorage.setItem('medicalFiles', JSON.stringify(savedFiles));
            }
            queryClient.invalidateQueries({ queryKey: ['medicalFiles'] });
            toast.success('تم رفع الملف بنجاح');
        } catch (error) {
            toast.error('حدث خطأ أثناء الرفع');
        } finally {
            setUploading(false);
        }
    };

    // Delete file
    const deleteFile = (id: string) => {
        const filtered = files.filter(f => f.id !== id);
        if (typeof window !== 'undefined') {
            localStorage.setItem('medicalFiles', JSON.stringify(filtered));
        }
        queryClient.invalidateQueries({ queryKey: ['medicalFiles'] });
        toast.success('تم حذف الملف');
    };

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

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() ||
            (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            {/* Premium Header */}
            <motion.div
                className="bg-gradient-to-br from-[#2D9B83] via-[#3FB39A] to-[#2D9B83] text-white px-6 py-8 rounded-b-[2.5rem] shadow-xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">ملفي الطبي</h1>
                        <p className="text-white/70 text-sm">كل بياناتك الصحية في مكان واحد</p>
                    </div>
                    <motion.div
                        className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
                        whileTap={{ scale: 0.9, rotate: 10 }}
                    >
                        <FileText className="w-6 h-6 text-white" />
                    </motion.div>
                </div>

                {/* Profile Card */}
                <motion.div
                    className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20"
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                    <div className="flex items-center gap-4">
                        <motion.div
                            className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center"
                            whileTap={{ scale: 0.9 }}
                        >
                            <User className="w-8 h-8 text-white" />
                        </motion.div>
                        <div className="flex-1">
                            <h2 className="font-bold text-lg">{profile.full_name || 'أدخل اسمك'}</h2>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {profile.blood_type && (
                                    <Badge className="bg-red-500/30 text-white border-0 text-xs">
                                        <Droplets className="w-3 h-3 ml-1" />
                                        {profile.blood_type}
                                    </Badge>
                                )}
                                {profile.birth_date && (
                                    <Badge className="bg-white/20 border-0 text-xs">
                                        <Calendar className="w-3 h-3 ml-1" />
                                        {calculateAge(profile.birth_date)} سنة
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <motion.button
                            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setShowProfileSheet(true)}
                        >
                            <Edit3 className="w-5 h-5 text-white" />
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>

            {/* Quick Info Grid - 4 columns */}
            <div className="px-4 -mt-6 relative z-10">
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {quickInfoItems.map((item, index) => {
                        const Icon = item.icon;
                        let value = profile[item.key as keyof PatientProfile];
                        if (item.key === 'birth_date' && value) {
                            value = calculateAge(value as string).toString();
                        }
                        return (
                            <motion.div
                                key={index}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileTap={{ scale: 0.92 }}
                            >
                                <motion.div
                                    className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}
                                    whileTap={{ rotate: 10, scale: 0.9 }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: item.color }} strokeWidth={1.5} />
                                </motion.div>
                                <div className="text-sm font-bold text-slate-800 dark:text-white">
                                    {value || '-'}{item.suffix && value ? ` ${item.suffix}` : ''}
                                </div>
                                <div className="text-[10px] text-slate-400">{item.label}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div className="px-4 space-y-4">
                {/* Chronic Conditions Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-0 shadow-lg overflow-hidden">
                        <motion.div whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                            <CardHeader
                                className="pb-2 cursor-pointer"
                                onClick={() => toggleSection('conditions')}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Activity className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
                                        </motion.div>
                                        <div>
                                            <CardTitle className="text-base">الحالات المزمنة</CardTitle>
                                            <span className="text-xs text-slate-400">
                                                {profile.chronic_conditions?.length || 0} حالات مسجلة
                                            </span>
                                        </div>
                                    </div>
                                    <motion.div whileTap={{ scale: 0.8 }}>
                                        {expandedSections.conditions ?
                                            <ChevronUp className="w-5 h-5 text-slate-400" /> :
                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                        }
                                    </motion.div>
                                </div>
                            </CardHeader>
                        </motion.div>
                        <AnimatePresence>
                            {expandedSections.conditions && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                >
                                    <CardContent className="pt-0">
                                        {profile.chronic_conditions && profile.chronic_conditions.length > 0 ? (
                                            <div className="space-y-2">
                                                {profile.chronic_conditions.map((condition, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl p-3"
                                                        whileTap={{ scale: 0.98 }}
                                                    >
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
                                                            <motion.button
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                                                                whileTap={{ scale: 0.8 }}
                                                                onClick={() => removeChronicCondition(idx)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </motion.button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 text-center py-2">لا توجد حالات مسجلة</p>
                                        )}
                                        <motion.button
                                            className="w-full mt-3 p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-500"
                                            whileTap={{ scale: 0.98, borderColor: '#2D9B83' }}
                                            onClick={() => setShowConditionSheet(true)}
                                        >
                                            <Plus className="w-4 h-4" />
                                            إضافة حالة مزمنة
                                        </motion.button>
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                </motion.div>

                {/* Allergies Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-0 shadow-lg overflow-hidden">
                        <motion.div whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                            <CardHeader
                                className="pb-2 cursor-pointer"
                                onClick={() => toggleSection('allergies')}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <AlertCircle className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                                        </motion.div>
                                        <div>
                                            <CardTitle className="text-base">الحساسية</CardTitle>
                                            <span className="text-xs text-slate-400">
                                                {profile.allergies?.length || 0} نوع مسجل
                                            </span>
                                        </div>
                                    </div>
                                    <motion.div whileTap={{ scale: 0.8 }}>
                                        {expandedSections.allergies ?
                                            <ChevronUp className="w-5 h-5 text-slate-400" /> :
                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                        }
                                    </motion.div>
                                </div>
                            </CardHeader>
                        </motion.div>
                        <AnimatePresence>
                            {expandedSections.allergies && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                >
                                    <CardContent className="pt-0">
                                        {profile.allergies && profile.allergies.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {profile.allergies.map((allergy, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1"
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        {allergy}
                                                        <button
                                                            onClick={() => removeAllergy(idx)}
                                                            className="mr-1 hover:text-red-500"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 text-center py-2">لا توجد حساسية مسجلة</p>
                                        )}
                                        <motion.button
                                            className="w-full mt-3 p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-500"
                                            whileTap={{ scale: 0.98, borderColor: '#F59E0B' }}
                                            onClick={() => setShowAllergySheet(true)}
                                        >
                                            <Plus className="w-4 h-4" />
                                            إضافة حساسية
                                        </motion.button>
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                </motion.div>

                {/* Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border-2 border-dashed border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <motion.div
                                className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3"
                                whileTap={{ scale: 0.9, rotate: -10 }}
                            >
                                <Upload className="w-7 h-7 text-emerald-600" />
                            </motion.div>
                            <h3 className="font-bold text-slate-800 dark:text-white mb-1">إضافة مستند طبي</h3>
                            <p className="text-sm text-slate-500 mb-4">ارفع نتائج التحاليل أو التقارير الطبية</p>

                            <div className="relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                />
                                <motion.div whileTap={{ scale: 0.95 }}>
                                    <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8" disabled={uploading}>
                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                                        {uploading ? 'جاري الرفع...' : 'اختر ملف'}
                                    </Button>
                                </motion.div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Files Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Tabs defaultValue="files" className="w-full">
                        <TabsList className="w-full bg-white dark:bg-slate-800 p-1 rounded-xl h-12 shadow-sm">
                            <TabsTrigger value="files" className="flex-1 rounded-lg data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-700">
                                الملفات ({files.length})
                            </TabsTrigger>
                            <TabsTrigger value="labs" className="flex-1 rounded-lg data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-700">
                                المختبر
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="files" className="mt-4 space-y-3">
                            {files.length > 0 ? (
                                files.map((file, index) => (
                                    <motion.div
                                        key={file.id}
                                        className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <File className="w-5 h-5 text-slate-500" />
                                            </motion.div>
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-white truncate max-w-[180px]">{file.name}</p>
                                                <p className="text-xs text-slate-400">
                                                    {format(new Date(file.uploaded_at), 'dd/MM/yyyy', { locale: ar })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <motion.a
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileTap={{ scale: 0.85 }}
                                            >
                                                <Button variant="ghost" size="icon" className="rounded-lg">
                                                    <ExternalLink className="w-4 h-4 text-slate-400" />
                                                </Button>
                                            </motion.a>
                                            <motion.button
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50"
                                                whileTap={{ scale: 0.85 }}
                                                onClick={() => deleteFile(file.id!)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <File className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500">لا توجد ملفات مرفقة بعد</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="labs" className="mt-4">
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm text-center">
                                <Microscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600 dark:text-slate-400 mb-2">نتائج المختبر الرقمية</p>
                                <p className="text-xs text-slate-400">سيتم عرض نتائج التحاليل هنا</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>

            {/* Profile Edit Sheet */}
            <Sheet open={showProfileSheet} onOpenChange={setShowProfileSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-right text-xl">البيانات الشخصية</SheetTitle>
                    </SheetHeader>
                    <ProfileEditForm profile={profile} onSave={saveProfile} onClose={() => setShowProfileSheet(false)} />
                </SheetContent>
            </Sheet>

            {/* Add Condition Sheet */}
            <Sheet open={showConditionSheet} onOpenChange={setShowConditionSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl">
                    <SheetHeader>
                        <SheetTitle className="text-right text-xl">إضافة حالة مزمنة</SheetTitle>
                    </SheetHeader>
                    <AddConditionForm onAdd={addChronicCondition} />
                </SheetContent>
            </Sheet>

            {/* Add Allergy Sheet */}
            <Sheet open={showAllergySheet} onOpenChange={setShowAllergySheet}>
                <SheetContent side="bottom" className="rounded-t-3xl">
                    <SheetHeader>
                        <SheetTitle className="text-right text-xl">إضافة حساسية</SheetTitle>
                    </SheetHeader>
                    <AddAllergyForm onAdd={addAllergy} />
                </SheetContent>
            </Sheet>
        </div>
    );
}

// Profile Edit Form
function ProfileEditForm({
    profile,
    onSave,
    onClose
}: {
    profile: PatientProfile;
    onSave: (updates: Partial<PatientProfile>) => void;
    onClose: () => void;
}) {
    const [formData, setFormData] = useState(profile);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <div className="py-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل</label>
                <Input
                    value={formData.full_name || ''}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="أدخل اسمك الكامل"
                    className="h-12 rounded-xl"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">تاريخ الميلاد</label>
                    <Input
                        type="date"
                        value={formData.birth_date || ''}
                        onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                        className="h-12 rounded-xl"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">الجنس</label>
                    <select
                        value={formData.gender || ''}
                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full h-12 rounded-xl border border-slate-200 px-4"
                    >
                        <option value="">اختر</option>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">فصيلة الدم</label>
                <div className="grid grid-cols-4 gap-2">
                    {BLOOD_TYPES.map(type => (
                        <motion.button
                            key={type}
                            onClick={() => setFormData({ ...formData, blood_type: type })}
                            className={`p-3 rounded-xl text-sm font-bold transition-all ${formData.blood_type === type
                                    ? 'bg-red-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            whileTap={{ scale: 0.9 }}
                        >
                            {type}
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">الطول (سم)</label>
                    <Input
                        type="number"
                        value={formData.height || ''}
                        onChange={e => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                        placeholder="170"
                        className="h-12 rounded-xl"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">الوزن (كجم)</label>
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
                <label className="block text-sm font-medium text-slate-700 mb-2">رقم الطوارئ</label>
                <Input
                    value={formData.emergency_contact || ''}
                    onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
                    placeholder="رقم للتواصل في الحالات الطارئة"
                    className="h-12 rounded-xl"
                    dir="ltr"
                />
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                    onClick={handleSave}
                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg"
                >
                    <Save className="w-5 h-5 ml-2" />
                    حفظ البيانات
                </Button>
            </motion.div>
        </div>
    );
}

// Add Condition Form
function AddConditionForm({ onAdd }: { onAdd: (condition: ChronicCondition) => void }) {
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
        <div className="py-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">اسم الحالة</label>
                <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: السكري، ضغط الدم"
                    className="h-12 rounded-xl"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الحالة</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: 'active', label: 'نشط', color: 'bg-red-500' },
                        { value: 'controlled', label: 'تحت السيطرة', color: 'bg-green-500' },
                        { value: 'resolved', label: 'تم الشفاء', color: 'bg-slate-400' }
                    ].map(status => (
                        <motion.button
                            key={status.value}
                            onClick={() => setFormData({ ...formData, status: status.value as any })}
                            className={`p-3 rounded-xl text-sm font-medium transition-all ${formData.status === status.value
                                    ? `${status.color} text-white`
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                            whileTap={{ scale: 0.9 }}
                        >
                            {status.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">تاريخ التشخيص</label>
                <Input
                    type="date"
                    value={formData.diagnosis_date || ''}
                    onChange={e => setFormData({ ...formData, diagnosis_date: e.target.value })}
                    className="h-12 rounded-xl"
                />
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                    onClick={handleAdd}
                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة
                </Button>
            </motion.div>
        </div>
    );
}

// Add Allergy Form
function AddAllergyForm({ onAdd }: { onAdd: (allergy: string) => void }) {
    const [allergy, setAllergy] = useState('');
    const commonAllergies = ['البنسلين', 'الجلوتين', 'اللاكتوز', 'الفول السوداني', 'البيض', 'الأسبرين'];

    const handleAdd = () => {
        if (!allergy.trim()) {
            toast.error('أدخل نوع الحساسية');
            return;
        }
        onAdd(allergy.trim());
        setAllergy('');
    };

    return (
        <div className="py-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">نوع الحساسية</label>
                <Input
                    value={allergy}
                    onChange={e => setAllergy(e.target.value)}
                    placeholder="أدخل نوع الحساسية"
                    className="h-12 rounded-xl"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">اختيارات شائعة</label>
                <div className="flex flex-wrap gap-2">
                    {commonAllergies.map(a => (
                        <motion.button
                            key={a}
                            onClick={() => setAllergy(a)}
                            className={`px-3 py-2 rounded-xl text-sm transition-all ${allergy === a
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            whileTap={{ scale: 0.9 }}
                        >
                            {a}
                        </motion.button>
                    ))}
                </div>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                    onClick={handleAdd}
                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة
                </Button>
            </motion.div>
        </div>
    );
}
