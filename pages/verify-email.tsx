import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';
import { auth as firebaseAuthInstance } from '../lib/firebase';
import * as firebaseAuth from 'firebase/auth';

import AuthShell from '@/components/auth/AuthShell';
import { mapAuthError } from '@/lib/auth-utils';

export default function VerifyEmail() {
    const router = useRouter();
    const { oobCode } = router.query;

    const [validating, setValidating] = useState(true);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        if (!router.isReady) return;

        if (!oobCode || typeof oobCode !== 'string') {
            setApiError('رابط التفعيل غير صالح. يرجى طلب تفعيل جديد من داخل التطبيق.');
            setValidating(false);
            return;
        }

        if (firebaseAuthInstance && firebaseAuth) {
            firebaseAuth.applyActionCode(firebaseAuthInstance, oobCode)
                .then(() => {
                    setSuccess(true);
                    setValidating(false);
                })
                .catch((error: any) => {
                    setApiError(mapAuthError(error.code));
                    setValidating(false);
                });
        } else {
            setApiError('النظام غير متاح حالياً.');
            setValidating(false);
        }
    }, [router.isReady, oobCode]);

    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">جاري التحقق من هويتك...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthShell brandTitle="تفعيل الحساب">
            <div className="text-center">
                {success ? (
                    <>
                        <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        
                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">تم تفعيل حسابك بنجاح!</h3>
                        <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
                            بريدك الإلكتروني موثق الآن. يمكنك استخدام كافة ميزات التطبيق بأمان.
                        </p>

                        <Button
                            onClick={() => router.replace('/login')}
                            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[16px]"
                        >
                            الانتقال لتسجيل الدخول
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 mx-auto rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10 text-rose-500" />
                        </div>
                        
                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">تعذر تفعيل الحساب</h3>
                        
                        <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-[14px] font-semibold flex items-start gap-3 text-right max-w-sm mx-auto mb-8">
                            <span className="mt-0.5 shrink-0 text-xl leading-none">⚠</span>
                            <span>{apiError}</span>
                        </div>

                        <Button
                            onClick={() => router.push('/login')}
                            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[16px]"
                        >
                            <ArrowRight className="w-5 h-5 ml-2" />
                            العودة لتسجيل الدخول
                        </Button>
                    </>
                )}
            </div>
        </AuthShell>
    );
}
