import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Sparkles, X, CheckCircle2, Clock, Pill } from 'lucide-react';
import { toast } from 'sonner';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { haptic } from '@/lib/HapticFeedback';
import { Capacitor } from '@capacitor/core';

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    instructions: string;
}

export default function PrescriptionScanner() {
    const [isScanning, setIsScanning] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [results, setResults] = useState<Medication[] | null>(null);

    const handleCapture = async (source: CameraSource = CameraSource.Prompt) => {
        try {
            haptic.selection();
            let imageUrl: string;

            if (Capacitor.isNativePlatform()) {
                const image = await CapacitorCamera.getPhoto({
                    quality: 90,
                    allowEditing: false,
                    resultType: CameraResultType.DataUrl,
                    source: source
                });
                imageUrl = image.dataUrl as string;
            } else {
                // Fallback for Web Testing (Input File)
                imageUrl = await new Promise<string>((resolve, reject) => {
                   const input = document.createElement('input');
                   input.type = 'file';
                   input.accept = 'image/*';
                   if (source === CameraSource.Camera) {
                       input.capture = 'environment';
                   }
                   input.onchange = (e) => {
                       const file = (e.target as HTMLInputElement).files?.[0];
                       if (file) {
                           const reader = new FileReader();
                           reader.onload = (re) => resolve(re.target?.result as string);
                           reader.onerror = reject;
                           reader.readAsDataURL(file);
                       }
                   };
                   input.click();
                });
            }

            if (imageUrl) {
                setImagePreview(imageUrl);
                processImage(imageUrl);
            }
        } catch (error) {
            console.error('Camera error', error);
            toast.error('لم نتمكن من التقاط الصورة');
        }
    };

    const processImage = async (base64Image: string) => {
        setIsScanning(true);
        setResults(null);
        haptic.impact();

        try {
            // Extract mimetype
            const mimeType = base64Image.substring(base64Image.indexOf(":") + 1, base64Image.indexOf(";"));
            
            const response = await fetch('/api/parse-prescription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64Image, mimeType })
            });

            if (!response.ok) {
                throw new Error('فشل تحليل الوصفة الطبية');
            }

            const data = await response.json();
            
            if (data && data.medications) {
                setResults(data.medications);
                haptic.success();
                toast.success('تم تحليل الوصفة بنجاح!');
            } else {
                throw new Error('لم يتم العثور على أدوية في النص المستخرج');
            }

        } catch (error: any) {
            console.error('Parsing error', error);
            toast.error(error.message || 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي');
            setImagePreview(null);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!imagePreview ? (
                    <motion.div
                        key="capture-buttons"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-2 gap-3"
                    >
                        <button
                            onClick={() => handleCapture(CameraSource.Camera)}
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl"
                            style={{ 
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(13,148,136,0.15))',
                                border: '1px solid rgba(16,185,129,0.2)'
                            }}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-teal-500/20 shadow-[0_4px_20px_rgba(20,184,166,0.2)]">
                                <Camera className="w-5 h-5 text-teal-400" />
                            </div>
                            <div className="text-center">
                                <span className="block text-sm text-teal-50 font-black mb-1">تصوير الروشتة</span>
                                <span className="text-[10px] text-teal-200/60 font-semibold">بالكاميرا مباشرة</span>
                            </div>
                        </button>
                        
                        <button
                            onClick={() => handleCapture(CameraSource.Photos)}
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl"
                            style={{ 
                                background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.15))',
                                border: '1px solid rgba(139,92,246,0.2)'
                            }}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-violet-500/20 shadow-[0_4px_20px_rgba(139,92,246,0.2)]">
                                <Upload className="w-5 h-5 text-violet-400" />
                            </div>
                            <div className="text-center">
                                <span className="block text-sm text-violet-50 font-black mb-1">رفع صورة</span>
                                <span className="text-[10px] text-violet-200/60 font-semibold">من الاستوديو</span>
                            </div>
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview-results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {/* Preview Header */}
                        <div className="relative w-full h-40 rounded-3xl overflow-hidden mb-6 border border-white/10 group">
                            <img src={imagePreview} alt="Prescription snippet" className="w-full h-full object-cover opacity-50 blur-[2px]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                            
                            <button 
                                onClick={() => { setImagePreview(null); setResults(null); }}
                                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {isScanning && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm z-10">
                                    <Sparkles className="w-8 h-8 text-teal-400 animate-pulse mb-3" />
                                    <span className="text-sm font-black tracking-wide text-white animate-pulse">جاري التحليل بالذكاء الاصطناعي...</span>
                                    <span className="text-xs text-white/50 font-semibold mt-1">يُرجى الانتظار</span>
                                </div>
                            )}
                        </div>

                        {/* Results list */}
                        {!isScanning && results && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[15px] font-black text-white flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        الأدوية المستخرجة
                                    </h3>
                                    <span className="text-xs font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                        {results.length} أدوية
                                    </span>
                                </div>

                                {results.map((med, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={idx}
                                        className="p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-teal-400 to-emerald-500" />
                                        
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-black text-white">{med.name}</h4>
                                            <span className="text-[10px] font-bold text-teal-200 bg-teal-500/20 px-2.5 py-1 rounded-full">
                                                {med.dosage}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-xs mt-3">
                                            <div className="flex items-center gap-1.5 text-white/60 font-semibold">
                                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                                <span>{med.frequency}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-white/60 font-semibold">
                                                <Pill className="w-3.5 h-3.5 text-violet-400" />
                                                <span>{med.instructions}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                
                                <button className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 text-white font-black text-sm shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    تم، أضف إلى جدولي
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
