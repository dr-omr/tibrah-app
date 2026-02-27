// components/medical-file/MedicalFileForms.tsx
// Sub-components for the Medical File page

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Types
export interface ChronicCondition {
    name: string;
    status: 'active' | 'controlled' | 'resolved';
    diagnosis_date?: string;
}

export interface PatientProfile {
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

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Profile Edit Form
export function ProfileEditForm({
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
                        className="w-full h-12 rounded-xl border border-slate-200 px-4"
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
export function AddConditionForm({ onAdd }: { onAdd: (condition: ChronicCondition) => void }) {
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">تاريخ التشخيص</label>
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
export function AddAllergyForm({ onAdd }: { onAdd: (allergy: string) => void }) {
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
