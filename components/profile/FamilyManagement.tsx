import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, UserPlus, HeartPulse, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { toast } from '@/components/notification-engine';

export default function FamilyManagement() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [relation, setRelation] = useState('');
    const [age, setAge] = useState('');
    const [medicalHistory, setMedicalHistory] = useState('');

    const familyMembers: any[] = (user as any)?.family_members || [];

    const updateProfileMutation = useMutation({
        mutationFn: async (updatedMembers: any[]) => {
            if (!user?.id) throw new Error('User not logged in');
            return db.entities.User.update(user.id, { family_members: updatedMembers });
        },
        onSuccess: () => {
            toast.success('تم التحديث بنجاح 👏');
            // Optimistic update of local user context if needed, handled by AuthContext reload or Query invalidation
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            setIsAdding(false);
            setName('');
            setRelation('');
            setAge('');
            setMedicalHistory('');
        },
        onError: (err: any) => {
            toast.error(err.message || 'حدث خطأ أثناء حفظ البيانات');
        }
    });

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !relation || !age) {
            toast.error('يرجى ملء كافة الحقول الأساسية');
            return;
        }

        const newMember = {
            id: Date.now().toString(),
            name,
            relation,
            age: parseInt(age, 10),
            medical_history: medicalHistory
        };

        const updatedMembers = [...familyMembers, newMember];
        updateProfileMutation.mutate(updatedMembers);
    };

    const handleDeleteMember = (id: string) => {
        if (!confirm('هل أنت متأكد من حذف فرد العائلة هذا؟')) return;
        const updatedMembers = familyMembers.filter(m => m.id !== id);
        updateProfileMutation.mutate(updatedMembers);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">ملفات العائلة</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">أدر الملفات الطبية لأحبابك</p>
                    </div>
                </div>
                {!isAdding && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="w-8 h-8 rounded-full bg-teal-50 dark:bg-white/5 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAddMember}
                        className="mb-8 overflow-hidden"
                    >
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl space-y-4 border border-slate-100 dark:border-white/10">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-teal-500" />
                                إضافة فرد جديد للعائلة
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 block mb-1.5">الاسم الكامل</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-teal-500 transition-colors"
                                        placeholder="مثال: أحمد"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 block mb-1.5">صلة القرابة</label>
                                    <select 
                                        value={relation}
                                        onChange={(e) => setRelation(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none"
                                    >
                                        <option value="" disabled>اختر الصلة</option>
                                        <option value="son">ابن</option>
                                        <option value="daughter">ابنة</option>
                                        <option value="wife">زوجة</option>
                                        <option value="husband">زوج</option>
                                        <option value="father">أب</option>
                                        <option value="mother">أم</option>
                                        <option value="other">أخرى</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 block mb-1.5">العمر</label>
                                <input 
                                    type="number" 
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-teal-500 transition-colors"
                                    placeholder="العمر بالسنوات"
                                    min="0"
                                    max="120"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-500 block mb-1.5">نبذة صحية سريعة (اختياري)</label>
                                <textarea 
                                    value={medicalHistory}
                                    onChange={(e) => setMedicalHistory(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-teal-500 transition-colors resize-none h-20"
                                    placeholder="هل يعاني من أمراض مزمنة أو حساسيات؟"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    إلغاء
                                </button>
                                <button 
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
                                >
                                    {updateProfileMutation.isPending ? 'جاري الحفظ...' : 'إضافة الفرد'}
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* List Members */}
            {familyMembers.length === 0 && !isAdding ? (
                <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">لا يوجد أفراد عائلة مضافين بعد.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {familyMembers.map((member) => (
                        <div key={member.id} className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                                    <HeartPulse className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        {member.name}
                                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                                            {member.relation}
                                        </span>
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-1">{member.age} سنة</p>
                                    {member.medical_history && (
                                        <p className="text-[11px] text-slate-400 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-2 rounded-lg leading-relaxed">
                                            {member.medical_history}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDeleteMember(member.id)}
                                className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
