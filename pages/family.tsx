import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { Users, Plus, ShieldAlert, ArrowRight, Loader2, Link2, Share2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { toast } from 'sonner';

import FamilyMemberCard, { FamilyMember } from '@/components/profile/FamilyMemberCard';

export default function FamilyHub() {
    const router = useRouter();
    const { user } = useAuth();
    const [dbProfile, setDbProfile] = useState<any>(null);
    const [family, setFamily] = useState<FamilyMember[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    
    // Add Member Form State
    const [newMember, setNewMember] = useState({ name: '', relation: '', age: 0, phone: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user?.id) {
            db.entities.User.get(user.id).then((dbUser: any) => {
                if (dbUser) {
                    setDbProfile(dbUser);
                    if (dbUser.family_members) {
                        setFamily(dbUser.family_members);
                    }
                }
            });
        }
    }, [user?.id]);

    // Handle authentication state
    if (user === null) {
        if (typeof window !== 'undefined') router.replace('/login');
        return null;
    }

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMember.name || !newMember.relation) {
            toast.error('يرجى تعبئة كافة الحقول المطلوبة');
            return;
        }

        setIsSaving(true);
        try {
            // Check if phone number is provided, if so try to invite, otherwise create unlinked profile
            if (newMember.phone && newMember.phone.length >= 9) {
                const res = await fetch('/api/family/invite-member', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        inviterId: user.id,
                        inviterPhone: dbProfile?.phone || user.phone,
                        targetPhone: newMember.phone,
                        relation: newMember.relation
                    })
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'فشل إرسال الدعوة');
                }
                
                toast.success('تم إرسال دعوة الانضمام بنجاح عبر الواتساب');
            }

            // Create placeholder member
            const memberObj: FamilyMember = {
                id: `fam_${Math.random().toString(36).substr(2, 9)}`,
                name: newMember.name,
                relation: newMember.relation,
                age: Number(newMember.age) || 0,
                hasAppAccess: false
            };

            const updatedMembers = [...family, memberObj];
            await db.entities.User.update(user.id, { family_members: updatedMembers });
            
            setFamily(updatedMembers);
            setIsAdding(false);
            setNewMember({ name: '', relation: '', age: 0, phone: '' });
            haptic.success();
            uiSounds.success();
            
            if (!newMember.phone) {
                toast.success('تم إضافة الفرد كملف فرعي بنجاح');
            }
        } catch (error: any) {
            toast.error(error.message);
            haptic.error();
        } finally {
            setIsSaving(false);
        }
    };

    const handleEmergencyShare = async (memberId: string) => {
        haptic.selection();
        try {
            const toastId = toast.loading('جاري توليد رابط طوارئ مؤقت...');
            
            const res = await fetch('/api/family/emergency-share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, targetId: memberId })
            });

            if (!res.ok) throw new Error('فشل إنشاء الرابط');
            
            const data = await res.json();
            
            // Share via navigator if supported, else copy to clipboard
            if (navigator.share) {
                toast.dismiss(toastId);
                await navigator.share({
                    title: 'سجل طبي للطوارئ - طِبرَا',
                    text: `هذا سجل طبي للطوارئ (صالح لـ 24 ساعة فقط) للمريض.`,
                    url: data.url
                });
            } else {
                await navigator.clipboard.writeText(data.url);
                toast.success('تم نسخ رابط الطوارئ السري إلى الحافظة', { id: toastId });
            }
            uiSounds.success();
        } catch (err: any) {
            toast.error(err.message || 'حدث خطأ أثناء الإنشاء', { id: 'error-share' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-24">
            <Head>
                <title>طِبرَا | العائلة</title>
            </Head>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="px-5 py-4 max-w-lg mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => router.back()} 
                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform active:scale-95"
                    >
                        <ArrowRight className="w-5 h-5 rtl:-scale-x-100 text-slate-700 dark:text-slate-300" />
                    </button>
                    <span className="font-black text-lg">عائلتي</span>
                    <button 
                        onClick={() => setIsAdding(true)} 
                        className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center transition-transform active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-5 pt-28">
                {/* Hero Box */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] p-6 text-white mb-8 shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/20">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-black mb-2">الصحة العائلية</h1>
                        <p className="text-indigo-100 text-sm font-medium leading-relaxed max-w-[90%]">
                            اربط حسابات عائلتك لمتابعة التزامهم بالأدوية، وتلقي منبهات مشتركة، ومشاركة السجل الطبي أثناء الطوارئ.
                        </p>
                    </div>
                </div>

                {/* Family List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h2 className="font-bold text-slate-700 dark:text-slate-300 text-sm">أفراد العائلة ({family.length}/5)</h2>
                    </div>

                    <AnimatePresence>
                        {family.map((member) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <FamilyMemberCard 
                                    member={member} 
                                    onShare={() => handleEmergencyShare(member.id)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {family.length === 0 && !isAdding && (
                        <div className="bg-slate-100 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[32px] p-10 text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 mb-4 flex items-center justify-center">
                                <Users className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">لا يوجد أفراد مضافين</h3>
                            <p className="text-sm text-slate-500 font-medium mb-6">قم بإضافة أفراد عائلتك لتبدأ في إدارة صحتهم بكل سهولة.</p>
                            <Button 
                                onClick={() => setIsAdding(true)}
                                className="bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-full px-6 shadow-sm border border-slate-200 dark:border-slate-600"
                            >
                                <Plus className="w-4 h-4 ml-2" />
                                إضافة فرد جديد
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Member Modal / Bottom Sheet */}
            <AnimatePresence>
                {isAdding && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                        />
                        <motion.div 
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[40px] shadow-2xl p-6 pb-12 max-w-lg mx-auto border-t border-slate-200 dark:border-slate-800"
                        >
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8" />
                            
                            <h2 className="text-xl font-black mb-6 px-2 flex items-center gap-2">
                                <Plus className="w-6 h-6 text-teal-500" />
                                إضافة فرد للعائلة
                            </h2>

                            <form onSubmit={handleAddSubmit} className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-2 px-2">الاسم بالكامل</label>
                                    <Input 
                                        autoFocus
                                        value={newMember.name}
                                        onChange={e => setNewMember({...newMember, name: e.target.value})}
                                        placeholder="مثال: صالح محمد"
                                        className="h-14 bg-slate-50 dark:bg-slate-800 border-transparent rounded-2xl px-4 text-base focus-visible:ring-2 focus-visible:ring-teal-500"
                                        required
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-2 px-2">صلة القرابة</label>
                                        <select 
                                            value={newMember.relation}
                                            onChange={e => setNewMember({...newMember, relation: e.target.value})}
                                            className="w-full h-14 bg-slate-50 dark:bg-slate-800 border-transparent rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            required
                                        >
                                            <option value="" disabled>اختر القرابة</option>
                                            <option value="أب">أب</option>
                                            <option value="أم">أم</option>
                                            <option value="زوج / زوجة">زوج / زوجة</option>
                                            <option value="ابن / ابنة">ابن / ابنة</option>
                                            <option value="أخ / أخت">أخ / أخت</option>
                                            <option value="أخرى">أخرى</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-2 px-2">العمر</label>
                                        <Input 
                                            type="number"
                                            min="0"
                                            max="120"
                                            value={newMember.age || ''}
                                            onChange={e => setNewMember({...newMember, age: parseInt(e.target.value)})}
                                            placeholder="مثال: 45"
                                            className="h-14 bg-slate-50 dark:bg-slate-800 border-transparent rounded-2xl px-4 text-base focus-visible:ring-2 focus-visible:ring-teal-500"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="text-xs font-bold text-slate-500 block mb-2 px-2 flex items-center justify-between">
                                        <span>رقم الهاتف (لإرسال دعوة ذكية)</span>
                                        <span className="text-slate-400 font-normal">اختياري</span>
                                    </label>
                                    <div className="relative">
                                        <Input 
                                            type="tel"
                                            value={newMember.phone}
                                            onChange={e => setNewMember({...newMember, phone: e.target.value})}
                                            placeholder="05X XXX XXXX"
                                            className="h-14 bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 rounded-2xl px-4 pl-12 text-base text-left focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        />
                                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 px-2 font-medium">
                                        إذا تم إدخال رقم الهاتف، سيتم إرسال دعوة على واتساب للربط المباشر لحساباتكم.
                                    </p>
                                </div>

                                <Button 
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full h-14 mt-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-lg shadow-teal-600/30 text-lg transition-transform active:scale-[0.98]"
                                >
                                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'حفظ الفرد'}
                                </Button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
