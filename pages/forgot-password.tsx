import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowRight, Shield, CheckCircle, Sparkles, Heart, Brain, Activity } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Try to import Firebase
let firebaseAuth: typeof import('firebase/auth') | null = null;
let auth: import('firebase/auth').Auth | null = null;

try {
    const firebase = require('../lib/firebase');
    auth = firebase.auth;
    firebaseAuth = require('firebase/auth');
} catch (e) {
    console.log('Firebase not configured');
}

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const router = useRouter();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('يرجى إدخال البريد الإلكتروني');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('يرجى إدخال بريد إلكتروني صحيح');
            return;
        }

        setLoading(true);
        try {
            if (auth && firebaseAuth) {
                await firebaseAuth.sendPasswordResetEmail(auth, email.trim().toLowerCase());
                setSent(true);
                toast.success('تم إرسال رابط إعادة تعيين كلمة المرور! 📧');
            } else {
                toast.error('خدمة إعادة تعيين كلمة المرور غير متاحة حالياً');
            }
        } catch (error: unknown) {
            const authError = error as { code?: string; message?: string };
            switch (authError.code) {
                case 'auth/user-not-found':
                    // Don't reveal if email exists — security best practice
                    setSent(true);
                    toast.success('إذا كان البريد مسجلاً لدينا، ستصلك رسالة إعادة التعيين 📧');
                    break;
                case 'auth/invalid-email':
                    toast.error('البريد الإلكتروني غير صحيح');
                    break;
                case 'auth/too-many-requests':
                    toast.error('محاولات كثيرة. يرجى المحاولة لاحقاً');
                    break;
                default:
                    toast.error('حدث خطأ. يرجى المحاولة لاحقاً');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Left Side — Brand Panel */}
            <div className="hidden lg:flex lg:w-[46%] relative items-center justify-center p-16" style={{ background: 'linear-gradient(160deg, #042f2e 0%, #0d4744 30%, #0f766e 70%, #14b8a6 100%)' }}>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/[0.06]" />
                    <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full border border-white/[0.04]" />
                    <div className="absolute top-1/3 right-1/4 w-56 h-56 rounded-full bg-emerald-400/[0.06] blur-3xl" />
                </div>

                {/* Floating icons */}
                <div className="absolute top-[18%] left-[18%] animate-float">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] flex items-center justify-center shadow-lg shadow-black/10">
                        <Heart className="w-5 h-5 text-emerald-200/80" />
                    </div>
                </div>
                <div className="absolute bottom-[22%] right-[15%] animate-float" style={{ animationDelay: '1.2s' }}>
                    <div className="w-11 h-11 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] flex items-center justify-center shadow-lg shadow-black/10">
                        <Brain className="w-5 h-5 text-teal-200/80" />
                    </div>
                </div>
                <div className="absolute top-[38%] right-[22%] animate-float" style={{ animationDelay: '2.4s' }}>
                    <div className="w-9 h-9 rounded-lg bg-white/[0.06] backdrop-blur-sm border border-white/[0.06] flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white/60" />
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-sm">
                    <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-10 shadow-2xl shadow-black/20">
                        <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-8 shadow-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <span className="text-4xl font-black text-white/90">ط</span>
                        </div>
                        <h1 className="text-3xl font-black text-white text-center mb-3 tracking-tight">استعادة كلمة المرور</h1>
                        <p className="text-white/60 text-[15px] leading-relaxed text-center mb-10">
                            سنساعدك في استعادة الوصول إلى حسابك بأمان
                        </p>

                        <div className="space-y-4">
                            {[
                                { icon: Shield, text: 'إعادة تعيين آمنة عبر البريد' },
                                { icon: Mail, text: 'رابط صالح لمدة ساعة واحدة' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                                        <item.icon className="w-3.5 h-3.5 text-emerald-300/80" />
                                    </div>
                                    <span className="text-[13px] text-white/70 font-medium">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side — Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-gradient-to-br from-slate-50 via-white to-teal-50/20 overflow-y-auto h-screen relative">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-100/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-50/30 rounded-full blur-[80px] pointer-events-none" />

                <div className="w-full max-w-[400px] relative z-10">
                    {/* Mobile Logo */}
                    <div className="text-center mb-10 lg:hidden">
                        <div className="relative inline-block mb-5">
                            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl blur-xl opacity-30" style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }} />
                            <div className="relative w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-xl shadow-teal-600/20" style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }}>
                                <span className="text-white font-black text-2xl">ط</span>
                            </div>
                        </div>
                        <h1 className="text-[22px] font-black text-slate-800">استعادة كلمة المرور</h1>
                        <p className="text-sm text-slate-400 mt-1.5 font-medium">أدخل بريدك الإلكتروني لإعادة التعيين</p>
                    </div>

                    {/* Desktop Title */}
                    <div className="hidden lg:block mb-10">
                        <h2 className="text-[28px] font-black text-slate-800 mb-1.5 tracking-tight">نسيت كلمة المرور؟</h2>
                        <p className="text-[15px] text-slate-400 font-medium">لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
                    </div>

                    {sent ? (
                        /* Success State */
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-3">تم الإرسال بنجاح! 📧</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                إذا كان البريد <strong className="text-slate-700">{email}</strong> مسجلاً لدينا، ستصلك رسالة تحتوي على رابط إعادة تعيين كلمة المرور.
                            </p>
                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/50 text-amber-800 text-sm mb-6">
                                <p className="font-bold mb-1">💡 لم تصلك الرسالة؟</p>
                                <ul className="text-xs space-y-1 text-amber-700">
                                    <li>• تحقق من مجلد الرسائل غير المرغوب فيها (Spam)</li>
                                    <li>• تأكد من صحة البريد الإلكتروني</li>
                                    <li>• الرابط صالح لمدة ساعة واحدة</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => { setSent(false); setEmail(''); }}
                                    variant="outline"
                                    className="w-full h-[48px] rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm"
                                >
                                    إعادة المحاولة ببريد آخر
                                </Button>
                                <Button
                                    onClick={() => router.push('/login')}
                                    className="w-full h-[52px] rounded-xl text-white font-bold text-[15px] shadow-lg shadow-teal-600/20"
                                    style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }}
                                >
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                    العودة لتسجيل الدخول
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Form State */
                        <>
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="bg-white rounded-2xl p-5 shadow-sm shadow-slate-100/80 border border-slate-100 space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide">
                                            البريد الإلكتروني
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="example@email.com"
                                                className="pr-12 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:ring-teal-500/20 text-[15px] transition-colors"
                                                dir="ltr"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[52px] rounded-xl text-white font-bold text-[15px] transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-teal-600/20"
                                    style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-3">
                                            <Sparkles className="w-6 h-6 animate-spin" />
                                            جاري الإرسال...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-3">
                                            <Mail className="w-5 h-5" />
                                            إرسال رابط إعادة التعيين
                                        </span>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-5 pt-5 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/login')}
                                    className="w-full h-[48px] rounded-xl border border-teal-200 text-teal-700 hover:bg-teal-50/50 hover:border-teal-300 font-semibold text-sm transition-all"
                                >
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                    العودة لتسجيل الدخول
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Mobile footer */}
                    <div className="flex items-center justify-center gap-1.5 mt-8 lg:hidden">
                        <Shield className="w-3 h-3 text-teal-400" />
                        <span className="text-[10px] text-slate-400 font-medium">طِبرَا — نحرص على حماية خصوصيتك</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
