import React, { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Camera as LucideCamera, Upload, ArrowRight, ScanFace, Sparkles, AlertCircle, RefreshCw, ChevronRight, Waves, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiClient } from '@/components/ai/aiClient';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { createPageUrl } from '../../utils';

export default function FaceScanPage() {
    const [image, setImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('الصورة كبيرة جداً');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setImage(base64);
            analyzeFace(base64, file.type);
        };
        reader.readAsDataURL(file);
    };

    const handleCapacitorCamera = async (useCamera: boolean) => {
        if (Capacitor.isNativePlatform()) {
            try {
                const photo = await Camera.getPhoto({
                    quality: 90,
                    allowEditing: false,
                    resultType: CameraResultType.Base64,
                    source: useCamera ? CameraSource.Camera : CameraSource.Photos,
                });
                
                if (photo.base64String) {
                    const mimeType = `image/${photo.format}`;
                    const base64 = `data:${mimeType};base64,${photo.base64String}`;
                    setImage(base64);
                    analyzeFace(base64, mimeType);
                }
            } catch (error) {
                console.error('Camera interaction failed or cancelled:', error);
            }
        } else {
            // Web fallback
            if (fileInputRef.current) {
                if (useCamera) {
                    fileInputRef.current.setAttribute('capture', 'user'); // Front camera
                } else {
                    fileInputRef.current.removeAttribute('capture');
                }
                fileInputRef.current.click();
            }
        }
    };

    const analyzeFace = async (base64: string, mimeType: string) => {
        setAnalyzing(true);
        setResult(null);
        try {
            const text = await aiClient.analyzeImage(base64, mimeType, 'face');
            setResult(text);
        } catch (error) {
            toast.error('تعذّر تحليل الصورة. حاول مرة أخرى.');
            console.error(error);
        } finally {
            setAnalyzing(false);
        }
    };

    const reset = () => {
        setImage(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            <Head>
                <title>TIBRAH Vision | الفحص الشمولي</title>
            </Head>

            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 p-6 flex items-center justify-between">
                <Link href="/Dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                    <span>عودة</span>
                </Link>
                <div className="flex items-center gap-2">
                    <ScanFace className="w-6 h-6 text-primary" />
                    <span className="font-bold text-slate-800">ماسح الوجه الذكي</span>
                </div>
            </div>

            <main className="container-app relative z-10 flex flex-col items-center pt-8 pb-20">

                {/* Intro Text */}
                {!image && (
                    <div className="text-center max-w-md mx-auto mb-10 animate-in slide-in-from-bottom-5 duration-700">
                        <h1 className="text-2xl font-bold text-slate-900 mb-3">اكشف أسرار صحتك من وجهك</h1>
                        <p className="text-slate-500 leading-relaxed">
                            الوجه مرآة الجسد. الذكاء الاصطناعي سيحلل لون البشرة، العيون، واللسان ليكتشف نقص الفيتامينات أو إرهاق الأعضاء حسب الطب الشمولي.
                        </p>
                    </div>
                )}

                {/* Scanner Interface */}
                <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden glass shadow-2xl transition-all duration-500">

                    {/* Scanning Animation Overlay */}
                    {analyzing && (
                        <div className="absolute inset-0 z-30 bg-black/40 flex flex-col items-center justify-center backdrop-blur-sm">
                            <div className="w-full h-1 bg-primary shadow-[0_0_20px_var(--primary)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                            <Sparkles className="w-10 h-10 text-primary animate-pulse mb-4" />
                            <p className="text-white font-medium animate-pulse">جاري تحليل ملامح الوجه...</p>
                        </div>
                    )}

                    {!image ? (
                        /* Upload State */
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/50">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse-soft">
                                <ScanFace className="w-10 h-10 text-primary" />
                            </div>

                            <div className="space-y-4 w-full">
                                <Button
                                    onClick={() => handleCapacitorCamera(false)}
                                    className="w-full h-14 text-lg rounded-xl gradient-primary text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                                >
                                    <Upload className="w-5 h-5 ml-2" />
                                    رفع صورة من المعرض
                                </Button>

                                <Button
                                    onClick={() => handleCapacitorCamera(true)}
                                    variant="outline"
                                    className="w-full h-14 text-lg rounded-xl border-primary text-primary hover:bg-primary/5 shadow-sm"
                                >
                                    <LucideCamera className="w-5 h-5 ml-2" />
                                    كاميرا أمامية
                                </Button>
                            </div>

                            <p className="mt-6 text-xs text-slate-400">
                                🔒 الصور تُحلل لحظياً ولا تُحفظ في خوادمنا
                            </p>
                        </div>
                    ) : (
                        /* Image Preview */
                        <div className="relative w-full h-full">
                            <img src={image} alt="Face Scan" className="w-full h-full object-cover" />
                            {!analyzing && !result && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <Button onClick={() => analyzeFace(image, 'image/jpeg')} className="rounded-full px-6">
                                        إعادة التحليل
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFile}
                    />
                </div>

                {/* Results Card */}
                {result && !analyzing && (
                    <div className="w-full max-w-sm mt-6 animate-in slide-in-from-bottom-10 fade-in duration-700 space-y-4">
                        <div className="glass rounded-3xl p-6 border border-[#D4AF37]/30 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F]" />

                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                                <h3 className="font-bold text-slate-800">نتيجة التحليل الشمولي</h3>
                            </div>

                            <div className="prose prose-sm text-slate-600 leading-relaxed max-w-none font-medium">
                                <div dangerouslySetInnerHTML={{ __html: result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                            </div>

                            <Button onClick={reset} variant="ghost" className="w-full mt-6 text-slate-400 hover:text-slate-600">
                                <RefreshCw className="w-4 h-4 ml-2" />
                                فحص جديد
                            </Button>
                        </div>

                        {/* Frequency Suggestion */}
                        {(() => {
                            const suggestions = [
                                { keywords: ['كبد', 'سموم', 'يرقان'], id: '21', label: 'تردد تجديد الكبد', icon: Activity },
                                { keywords: ['كلى', 'الكلى', 'احتباس'], id: '22', label: 'تردد دعم الكلى', icon: RefreshCw },
                                { keywords: ['معدة', 'هضم', 'غازات'], id: '4', label: 'تردد بكتيريا المعدة', icon: AlertCircle },
                                { keywords: ['قولون', 'بكتيريا'], id: '1', label: 'تردد تنظيف القولون', icon: AlertCircle },
                                { keywords: ['طاقة', 'خمول', 'تعب'], id: '8', label: 'تردد الطاقة (EBV)', icon: Zap },
                            ];

                            const suggestion = suggestions.find(s => s.keywords.some(k => result.includes(k)));

                            if (suggestion) {
                                return (
                                    <div className="glass rounded-3xl p-6 border border-purple-200 shadow-xl bg-purple-50/50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                <Waves className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">علاج مقترح بالترددات</h4>
                                                <p className="text-xs text-slate-500">من صيدلية رايف الرقمية</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-4">
                                            بناءً على نتيجة الفحص، نقترح الاستماع لـ <strong>{suggestion.label}</strong>.
                                        </p>
                                        <Link href={createPageUrl(`RifeFrequencies?id=${suggestion.id}`)}>
                                            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-200">
                                                <Waves className="w-4 h-4 ml-2" />
                                                استمع للجلسة الآن
                                            </Button>
                                        </Link>
                                    </div>
                                )
                            }
                            return null;
                        })()}
                    </div>
                )}
            </main>

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
}
