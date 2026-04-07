import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ShieldAlert, AlertTriangle, User, HeartPulse, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EmergencySharePage() {
    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        // Wait until `id` is ready
        if (!router.isReady) return;

        if (!id) {
            setValid(false);
            setLoading(false);
            return;
        }

        async function fetchShareData() {
            try {
                const res = await fetch(`/api/share/${id}`);
                const data = await res.json();
                
                if (data.valid) {
                    setValid(true);
                    setProfile(data.profile);
                } else {
                    setValid(false);
                }
            } catch (err) {
                console.error('Share fetch error:', err);
                setValid(false);
            } finally {
                setLoading(false);
            }
        }

        fetchShareData();
    }, [id, router.isReady]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                 <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <h1 className="text-xl font-bold text-white">جاري التحقق من هوية السجل...</h1>
            </div>
        );
    }

    if (!valid || !profile) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <ShieldAlert className="w-16 h-16 text-rose-500 mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                <h1 className="text-2xl font-black text-white mb-2">الرابط غير صالح أو منتهي الصلاحية</h1>
                <p className="text-slate-400 mb-8 max-w-sm">
                    رابط مشاركة الطوارئ يعمل لمدة 24 ساعة فقط للحفاظ على خصوصية المريض الطبية. يرجى طلب رابط جديد من عائلة المريض.
                </p>
                <Link href="/">
                    <Button className="bg-white text-slate-900 rounded-full font-bold px-8">العودة للرئيسية</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-24">
            <Head>
                <title>طِبرَا | سجل الطوارئ الطبي</title>
                <meta name="theme-color" content="#f43f5e" />
            </Head>

            {/* Emergency Header */}
            <header className="bg-rose-500 text-white p-5 pt-10 sticky top-0 z-40 shadow-lg shadow-rose-500/20">
                <div className="flex items-center justify-center gap-2 max-w-lg mx-auto">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                    <h1 className="font-black text-lg tracking-wide">ملف طوارئ طبي</h1>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-5 py-8 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1">{profile.name}</h2>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                            <span className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-lg">فصيلة الدم: {profile.blood_type}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Allergies Warning */}
                    <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-5">
                        <h3 className="font-black text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5" />
                            حساسية
                        </h3>
                        {profile.allergies.map((a: string, i: number) => (
                            <div key={i} className="font-bold text-slate-800 dark:text-slate-200 text-lg">{a}</div>
                        ))}
                    </div>

                    {/* Chronic Conditions */}
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-5">
                        <h3 className="font-black text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-3">
                            <HeartPulse className="w-5 h-5" />
                            الأمراض المزمنة
                        </h3>
                        {profile.chronic_conditions.map((c: string, i: number) => (
                            <div key={i} className="font-bold text-slate-800 dark:text-slate-200 text-lg">{c}</div>
                        ))}
                    </div>

                    {/* Active Medications */}
                    <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-5">
                        <h3 className="font-black text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5" />
                            الأدوية الحالية
                        </h3>
                        <div className="space-y-3">
                            {profile.current_medications.map((m: any, i: number) => (
                                <div key={i} className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm">
                                    <div className="font-bold text-slate-800 dark:text-slate-200">{m.name}</div>
                                    <div className="text-sm font-medium text-slate-500">{m.dosage}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
