import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

import { auth as firebaseAuthInstance } from '../lib/firebase';
import * as firebaseAuth from 'firebase/auth';
import { mapAuthError } from '@/lib/auth-utils';
import { useAuth } from '@/contexts/AuthContext';

import AuthShell from '@/components/auth/AuthShell';
import PasswordField from '@/components/auth/PasswordField';

export default function ResetPassword() {
    const router = useRouter();
    const { oobCode } = router.query;
    const { isFirebaseAvailable } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        if (!router.isReady) return;

        if (!oobCode || typeof oobCode !== 'string') {
            setApiError('رابط غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.');
            setValidating(false);
            return;
        }

        if (firebaseAuthInstance && firebaseAuth) {
            firebaseAuth.verifyPasswordResetCode(firebaseAuthInstance, oobCode)
                .then(() => setValidating(false))
                .catch(() => {
                    setApiError('هذا الرابط منتهي الصلاحية أو تم استخدامه مسبقاً.');
                    setValidating(false);
                });
        } else {
            setApiError('النظام غير متاح حالياً.');
            setValidating(false);
        }
    }, [router.isReady, oobCode]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);

        if (!password || !confirmPassword) {
            setApiError('يرجى تعبئة جميع الحقول');
            return;
        }

        if (password.length < 8) {
            setApiError('كلمة المرور يجب أن لا تقل عن 8 أحرف');
            return;
        }

        if (password !== confirmPassword) {
            setApiError('كلمات المرور غير متطابقة');
            return;
        }

        setLoading(true);

        try {
            if (firebaseAuthInstance && firebaseAuth && typeof oobCode === 'string') {
                await firebaseAuth.confirmPasswordReset(firebaseAuthInstance, oobCode, password);
                setSuccess(true);
            }
        } catch (error: any) {
            setApiError(mapAuthError(error.code));
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin" />
            </div>
        );
    }

    if (success) {
        return (
            <AuthShell brandTitle="إستعادة الوصول">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">تم تعيين كلمة المرور</h3>
                    <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
                        يمكنك الآن تسجيل الدخول إلى حسابك باستخدام كلمة المرور الجديدة.
                    </p>

                    <Button
                        onClick={() => router.replace('/login')}
                        className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[16px]"
                    >
                        الانتقال لتسجيل الدخول
                    </Button>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell brandTitle="تعيين كلمة المرور">
            <div className="mb-10 text-center lg:text-right">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">كلمة مرور جديدة</h2>
                <p className="text-slate-500 text-[15px]">يرجى اختيار كلمة مرور قوية لحماية ملفك الطبي.</p>
            </div>

            {apiError && (
                <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-[14px] font-semibold flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-xl leading-none">⚠</span>
                    <div className="flex-1">
                        <span className="block mb-2">{apiError}</span>
                        {!oobCode && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => router.push('/forgot-password')}
                                className="border-rose-300 text-rose-800 hover:bg-rose-100"
                            >
                                طلب رابط جديد
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {oobCode && (
                <form onSubmit={handleReset} className="space-y-4">
                    <PasswordField
                        label="كلمة المرور الجديدة"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setApiError(null); }}
                        showStrength={true}
                    />
                    
                    <PasswordField
                        label="تأكيد كلمة المرور"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setApiError(null); }}
                    />

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={loading || !isFirebaseAvailable}
                            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[16px] transition-smooth border border-slate-800"
                        >
                            {loading ? (
                                <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                            ) : (
                                "تحديث كلمة المرور والمتابعة"
                            )}
                        </Button>
                    </div>
                </form>
            )}

            <div className="mt-8 border-t border-slate-100 pt-6">
                <Button variant="ghost" onClick={() => router.push('/login')} className="w-full text-slate-500 hover:text-slate-800">
                    <ArrowRight className="w-4 h-4 ml-2" />
                    العودة لتسجيل الدخول
                </Button>
            </div>
        </AuthShell>
    );
}
