import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';
import { aiClient } from '@/components/ai/aiClient';
import type { PatientProfile, ChronicCondition } from '@/components/medical-file/MedicalFileForms';

export interface MedicalFileItem {
    id?: string;
    name: string;
    url: string;
    type: string;
    uploaded_at: string;
}

export function useMedicalFile() {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(!Capacitor.isNativePlatform());

    // ─── AUTHENTICATION ───
    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            checkBiometrics();
        }
    }, [isUnlocked]);

    const checkBiometrics = async () => {
        try {
            const result = await NativeBiometric.isAvailable();
            if (!result.isAvailable) setIsUnlocked(true);
        } catch {
            setIsUnlocked(true);
        }
    };

    const authenticate = async () => {
        try {
            await NativeBiometric.verifyIdentity({
                reason: "قم بتأكيد هويتك لعرض سجلك الطبي السري",
                title: "المصادقة المطلوبة",
                subtitle: "حماية البيانات الطبية"
            });
            setIsUnlocked(true);
        } catch (e) {
            toast.error("فشلت المصادقة. يرجى المحاولة مرة أخرى.");
        }
    };

    // ─── PROFILE DATA ───
    const { data: profile = {} as PatientProfile } = useQuery<PatientProfile>({
        queryKey: ['patientProfile'],
        queryFn: async () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('patientProfile');
                return saved ? JSON.parse(saved) : {};
            }
            return {};
        },
        enabled: isUnlocked, // Only fetch if unlocked
    });

    const saveProfile = (updates: Partial<PatientProfile>) => {
        const newProfile = { ...profile, ...updates };
        if (typeof window !== 'undefined') {
            localStorage.setItem('patientProfile', JSON.stringify(newProfile));
        }
        queryClient.invalidateQueries({ queryKey: ['patientProfile'] });
        toast.success('تم حفظ البيانات');
    };

    // ─── CONDITIONS & ALLERGIES ───
    const addChronicCondition = (condition: ChronicCondition) => {
        const conditions = [...(profile.chronic_conditions || []), condition];
        saveProfile({ chronic_conditions: conditions });
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
        toast.success('تم إضافة الحساسية');
    };

    const removeAllergy = (idx: number) => {
        const allergies = (profile.allergies || []).filter((_, i) => i !== idx);
        saveProfile({ allergies });
        toast.success('تم حذف الحساسية');
    };

    // ─── FILES ───
    const { data: files = [] } = useQuery<MedicalFileItem[]>({
        queryKey: ['medicalFiles'],
        queryFn: async () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('medicalFiles');
                return saved ? JSON.parse(saved) : [];
            }
            return [];
        },
        enabled: isUnlocked,
    });

    const handleAddFile = (fileData: { name: string, base64: string, type: string }) => {
        setUploading(true);
        try {
            const newFile: MedicalFileItem = {
                id: Date.now().toString(),
                name: fileData.name,
                url: fileData.base64,
                type: fileData.type,
                uploaded_at: new Date().toISOString(),
            };
            const savedFiles = [...files, newFile];
            if (typeof window !== 'undefined') {
                localStorage.setItem('medicalFiles', JSON.stringify(savedFiles));
            }
            queryClient.invalidateQueries({ queryKey: ['medicalFiles'] });
            toast.success('تم رفع الملف بنجاح');
        } catch (error) {
            toast.error('حدث خطأ أثناء الرفع. حجم الملف قد يكون كبيراً.');
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

    // ─── AI ANALYSIS ───
    const runAiAnalysis = async () => {
        setAiLoading(true);
        try {
            const result = await aiClient.analyzeMedicalFile(
                profile,
                profile.chronic_conditions || [],
                profile.allergies || []
            );
            setAiAnalysis(result);
        } catch { 
            toast.error('تعذر التحليل'); 
        } finally { 
            setAiLoading(false); 
        }
    };

    return {
        isUnlocked,
        authenticate,
        profile,
        saveProfile,
        addChronicCondition,
        removeChronicCondition,
        addAllergy,
        removeAllergy,
        files,
        uploading,
        handleAddFile,
        deleteFile,
        aiAnalysis,
        aiLoading,
        runAiAnalysis,
    };
}
