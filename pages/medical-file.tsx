// pages/medical-file.tsx
// Premium Medical File — refactored with sub-components

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import {
    FileText, Calendar, User, Edit3, Droplets, Scale, Thermometer,
    Sparkles, Brain, Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
    ProfileEditForm, AddConditionForm, AddAllergyForm,
    type ChronicCondition, type PatientProfile
} from '@/components/medical-file/MedicalFileForms';
import { aiClient } from '@/components/ai/aiClient';

// Dynamic imports for code splitting
const ConditionsSection = dynamic(() => import('@/components/medical-file/ConditionsSection'), { ssr: false });
const AllergiesSection = dynamic(() => import('@/components/medical-file/AllergiesSection'), { ssr: false });
const MedicalFilesTab = dynamic(() => import('@/components/medical-file/MedicalFilesTab'), { ssr: false });

interface MedicalFile {
    id?: string;
    name: string;
    url: string;
    type: string;
    uploaded_at: string;
}

// Quick info items for the profile header
const quickInfoItems = [
    { icon: Droplets, label: 'فصيلة الدم', key: 'blood_type', color: '#EF4444', bg: 'bg-red-50' },
    { icon: Scale, label: 'الوزن', key: 'weight', color: '#8B5CF6', bg: 'bg-purple-50', suffix: 'كجم' },
    { icon: Thermometer, label: 'الطول', key: 'height', color: '#3B82F6', bg: 'bg-blue-50', suffix: 'سم' },
    { icon: Calendar, label: 'العمر', key: 'birth_date', color: '#10B981', bg: 'bg-emerald-50' },
];

export default function MedicalFilePage() {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [showProfileSheet, setShowProfileSheet] = useState(false);
    const [showConditionSheet, setShowConditionSheet] = useState(false);
    const [showAllergySheet, setShowAllergySheet] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        conditions: true,
        allergies: true,
    });
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const runAiAnalysis = async () => {
        setAiLoading(true);
        try {
            const result = await aiClient.analyzeMedicalFile(
                profile,
                profile.chronic_conditions || [],
                profile.allergies || []
            );
            setAiAnalysis(result);
        } catch { toast.error('تعذر التحليل'); }
        finally { setAiLoading(false); }
    };

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

    const addChronicCondition = (condition: ChronicCondition) => {
        const conditions = [...(profile.chronic_conditions || []), condition];
        saveProfile({ chronic_conditions: conditions });
        setShowConditionSheet(false);
        toast.success('تم إضافة الحالة');
    };

    const removeChronicCondition = (idx: number) => {
        const conditions = (profile.chronic_conditions || []).filter((_, i) => i !== idx);
        saveProfile({ chronic_conditions: conditions });
        toast.success('تم حذف الحالة');
    };

    const addAllergy = (allergy: string) => {
        const allergies = [...(profile.allergies || []), allergy];
        saveProfile({ allergies });
        setShowAllergySheet(false);
        toast.success('تم إضافة الحساسية');
    };

    const removeAllergy = (idx: number) => {
        const allergies = (profile.allergies || []).filter((_, i) => i !== idx);
        saveProfile({ allergies });
        toast.success('تم حذف الحساسية');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
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

            {/* Quick Info Grid */}
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
                                    {typeof value === 'string' || typeof value === 'number' ? value || '-' : '-'}{item.suffix && value ? ` ${item.suffix}` : ''}
                                </div>
                                <div className="text-[10px] text-slate-400">{item.label}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* AI Medical Analysis */}
            <div className="px-4 mb-4">
                <motion.div
                    className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-purple-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <span className="font-bold text-slate-800 text-sm">تحليل ذكي للملف الطبي</span>
                        </div>
                        <Button
                            size="sm"
                            className="bg-purple-600 text-white rounded-xl h-8 text-xs"
                            disabled={aiLoading}
                            onClick={runAiAnalysis}
                        >
                            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 ml-1" />}
                            {aiLoading ? 'جاري...' : 'حلل ملفي'}
                        </Button>
                    </div>
                    {aiAnalysis && (
                        <div className="space-y-3 mt-3">
                            {aiAnalysis.health_overview && (
                                <p className="text-sm text-slate-700 leading-relaxed">{aiAnalysis.health_overview}</p>
                            )}
                            {aiAnalysis.risk_factors?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-red-600 mb-1">⚠️ عوامل خطر:</p>
                                    {aiAnalysis.risk_factors.map((r: string, i: number) => (
                                        <p key={i} className="text-xs text-slate-600 mr-2">• {r}</p>
                                    ))}
                                </div>
                            )}
                            {aiAnalysis.lifestyle_recommendations?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-green-600 mb-1">💚 نصائح:</p>
                                    {aiAnalysis.lifestyle_recommendations.map((r: string, i: number) => (
                                        <p key={i} className="text-xs text-slate-600 mr-2">• {r}</p>
                                    ))}
                                </div>
                            )}
                            {aiAnalysis.tests_due?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {aiAnalysis.tests_due.map((t: string, i: number) => (
                                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-200">🔬 {t}</span>
                                    ))}
                                </div>
                            )}
                            {aiAnalysis.positive_indicators?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {aiAnalysis.positive_indicators.map((p: string, i: number) => (
                                        <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg">✓ {p}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>

            <div className="px-4 space-y-4">
                {/* Chronic Conditions */}
                <ConditionsSection
                    conditions={profile.chronic_conditions || []}
                    expanded={expandedSections.conditions}
                    onToggle={() => toggleSection('conditions')}
                    onRemove={removeChronicCondition}
                    onAdd={() => setShowConditionSheet(true)}
                />

                {/* Allergies */}
                <AllergiesSection
                    allergies={profile.allergies || []}
                    expanded={expandedSections.allergies}
                    onToggle={() => toggleSection('allergies')}
                    onRemove={removeAllergy}
                    onAdd={() => setShowAllergySheet(true)}
                />

                {/* Files Upload & List */}
                <MedicalFilesTab
                    files={files}
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    onDelete={deleteFile}
                />
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
