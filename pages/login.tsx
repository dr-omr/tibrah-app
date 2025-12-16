import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, LogIn, Sparkles, Heart, Brain, Activity, Shield, Zap, Star } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }

        setLoading(true);
        try {
            await base44.auth.login(email, password);
            toast.success('تم تسجيل الدخول بنجاح!');

            const returnUrl = localStorage.getItem('base44_return_url');
            if (returnUrl) {
                localStorage.removeItem('base44_return_url');
                window.location.href = returnUrl;
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            toast.error('خطأ في تسجيل الدخول');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 gradient-primary relative items-center justify-center p-12">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-40 h-40 border border-white rounded-full" />
                    <div className="absolute bottom-40 right-20 w-60 h-60 border border-white rounded-full" />
                    <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-white rounded-full" />
                </div>

                {/* Floating Icons */}
                <div className="absolute top-1/4 left-1/4 animate-float">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Heart className="w-7 h-7 text-white" />
                    </div>
                </div>
                <div className="absolute bottom-1/4 right-1/4 animate-float" style={{ animationDelay: '1s' }}>
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="absolute top-1/3 right-1/3 animate-float" style={{ animationDelay: '2s' }}>
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-white text-center max-w-md">
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mb-8 shadow-2xl">
                        <span className="text-4xl font-bold">ط</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">مرحباً بك في طِبرَا</h1>
                    <p className="text-white/80 text-lg leading-relaxed mb-8">
                        عيادتك الرقمية للطب الوظيفي والتكاملي. اكتشف صحتك بطريقة جديدة.
                    </p>

                    {/* Features */}
                    <div className="space-y-4">
                        {[
                            { icon: Shield, text: 'حماية بياناتك الصحية' },
                            { icon: Zap, text: 'متابعة صحتك بذكاء' },
                            { icon: Star, text: 'استشارات متخصصة' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 justify-center">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <span className="text-white/90">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-slate-50 via-white to-slate-50">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Logo */}
                    <div className="text-center mb-8 lg:hidden">
                        <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-primary/30 mb-4">
                            <span className="text-white font-bold text-2xl">ط</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">مرحباً بك في طِبرَا</h1>
                    </div>

                    {/* Desktop Title */}
                    <div className="hidden lg:block text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">تسجيل الدخول</h2>
                        <p className="text-slate-500">أدخل بياناتك للوصول لحسابك</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    البريد الإلكتروني
                                </label>
                                <div className="relative">
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        className="pr-12 h-14 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-primary/20 text-lg"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    كلمة المرور
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="pr-12 h-14 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-primary/20 text-lg"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Forgot Password */}
                            <div className="text-left">
                                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                    نسيت كلمة المرور؟
                                </Link>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 rounded-2xl gradient-primary text-white font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all group"
                        >
                            {loading ? (
                                <span className="flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 animate-spin" />
                                    جاري تسجيل الدخول...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3">
                                    <LogIn className="w-6 h-6" />
                                    تسجيل الدخول
                                    <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-sm text-slate-400">أو</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Quick Login */}
                    <Button
                        variant="outline"
                        className="w-full h-14 rounded-2xl border-2 text-slate-600 hover:bg-slate-50"
                        onClick={() => {
                            setEmail('demo@tibrah.com');
                            setPassword('demo123');
                        }}
                    >
                        <Sparkles className="w-5 h-5 ml-2 text-gold" />
                        تجربة الحساب التجريبي
                    </Button>

                    {/* Register Link */}
                    <p className="text-center text-slate-500 mt-6">
                        ليس لديك حساب؟{' '}
                        <Link href="/register" className="text-primary font-semibold hover:underline">
                            سجل الآن
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

