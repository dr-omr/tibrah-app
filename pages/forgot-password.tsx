import React, { useState } from 'react';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from '@/components/notification-engine';
import Link from 'next/link';
import { auth as firebaseAuthInstance } from '@/lib/firebase';
import * as firebaseAuth from 'firebase/auth';
import { mapAuthError } from '@/lib/auth-utils';

// Premium Components
import MedicalBrandingSide from '@/components/auth-premium/layout/MedicalBrandingSide';
import MedicalTextInput from '@/components/auth-premium/inputs/MedicalTextInput';
import MedicalSubmitBtn from '@/components/auth-premium/feedback/MedicalSubmitBtn';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('يرجى إدخال البريد الإلكتروني للبحث عن السجل');
            return;
        }

        setLoading(true);
        try {
            if (firebaseAuthInstance && firebaseAuth) {
                await firebaseAuth.sendPasswordResetEmail(firebaseAuthInstance, email.trim().toLowerCase());
                setSent(true);
            } else {
                toast.error('النظام الأمني تحت الصيانة');
            }
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                setSent(true); // Security practice: Don't reveal if user exists
            } else {
                toast.error(mapAuthError(error.code));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="medical-split-container medical-bg-canvas font-sans selection:bg-medical-teal selection:text-white" dir="rtl">
            <MedicalBrandingSide />

            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
                <div className="w-full max-w-[420px]">
                    {!sent ? (
                        <div className="animate-fade-slide-up">
                            {/* Header */}
                            <div className="mb-10 text-center lg:text-right">
                                {/* Mobile logo */}
                                <div className="w-16 h-16 bg-white dark:bg-[#111822] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl shadow-sm flex lg:hidden items-center justify-center mx-auto mb-6">
                                    <span className="text-3xl font-extrabold text-medical-teal">ط</span>
                                </div>
                                <h2 className="text-3xl font-black text-medical-heading mb-2 tracking-tight">استعادة السجل</h2>
                                <p className="text-medical-muted text-[15px]">أدخل البريد المربوط بملفك الصحي لاسترجاع الوصول</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <MedicalTextInput
                                    icon={Mail}
                                    label="البريد الإلكتروني"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    dir="ltr"
                                />

                                <MedicalSubmitBtn
                                    loading={loading}
                                    label="طلب رمز الاستعادة"
                                />
                            </form>
                        </div>
                    ) : (
                        <div className="text-center animate-fade-slide-up">
                            <div className="w-20 h-20 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-medical-teal" />
                            </div>
                            
                            <h3 className="text-2xl font-black text-medical-heading mb-4 tracking-tight">
                                تفقد بريدك الوارد
                            </h3>
                            
                            <p className="text-medical-muted text-[15px] leading-relaxed mb-10 max-w-sm mx-auto">
                                إذا كان الملف <strong className="text-medical-heading mx-1">{email}</strong> مسجلاً في عيادتنا، ستصلك رسالة تحوي رابطاً آمناً صالحاً لمدة ساعة لتغيير الرمز.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => { setSent(false); setEmail(''); }}
                                    className="w-full h-[54px] rounded-xl bg-white dark:bg-[#111822] border border-slate-200 dark:border-slate-800 text-medical-heading font-bold text-[15px] hover:bg-slate-50 dark:hover:bg-[#151E2E] transition-colors"
                                >
                                    المحاولة باستخدام بريد آخر
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-12 pt-8 text-center animate-fade-slide-up">
                        <Link href="/login" className="inline-flex items-center gap-2 text-[14px] font-bold text-medical-muted hover:text-medical-heading transition-colors group">
                            <ArrowRight className="w-4 h-4 rtl:translate-x-0 transform group-hover:translate-x-1 transition-transform" />
                            العودة للبوابة الرئيسية
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
