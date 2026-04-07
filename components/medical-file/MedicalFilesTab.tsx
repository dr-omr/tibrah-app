// components/medical-file/MedicalFilesTab.tsx
// Files tab with upload section and file list

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, File, ExternalLink, Trash2, Plus, Loader2, Microscope, Camera as LucideCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import LabResultsTracker from './LabResultsTracker';

interface MedicalFileData {
    id?: string;
    name: string;
    url: string;
    type: string;
    uploaded_at: string;
}

interface MedicalFilesTabProps {
    files: MedicalFileData[];
    uploading: boolean;
    onAddFile: (fileData: { name: string, base64: string, type: string }) => void;
    onDelete: (id: string) => void;
}

export default function MedicalFilesTab({ files, uploading, onAddFile, onDelete }: MedicalFilesTabProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleWebUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            onAddFile({
                name: file.name,
                base64: reader.result as string,
                type: file.type
            });
        };
        reader.readAsDataURL(file);
    };

    const handleNativeCamera = async (useCamera: boolean) => {
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
                    onAddFile({
                        name: `Scanned_Document_${Date.now()}.${photo.format}`,
                        base64: base64,
                        type: mimeType
                    });
                }
            } catch (error) {
                console.error('Camera interaction failed or cancelled:', error);
            }
        } else {
            // Web fallback
            if (fileInputRef.current) {
                if (useCamera) {
                    fileInputRef.current.setAttribute('capture', 'environment'); // Back camera 
                } else {
                    fileInputRef.current.removeAttribute('capture');
                }
                fileInputRef.current.click();
            }
        }
    };
    return (
        <>
            {/* Upload Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="border-2 border-dashed border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <motion.div
                            className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3"
                            whileTap={{ scale: 0.9, rotate: -10 }}
                        >
                            <Upload className="w-7 h-7 text-emerald-600" />
                        </motion.div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-1">إضافة مستند طبي</h3>
                        <p className="text-sm text-slate-500 mb-4">ارفع نتائج التحاليل أو التقارير الطبية</p>

                        <div className="flex gap-2 justify-center w-full max-w-xs mx-auto">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleWebUpload}
                                disabled={uploading}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                            
                            <motion.div whileTap={{ scale: 0.95 }} className="flex-1 border border-emerald-600 rounded-xl overflow-hidden hover:opacity-90 transition-opacity">
                                <Button 
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-white shadow-md border-0" 
                                    disabled={uploading}
                                    onClick={() => handleNativeCamera(false)}
                                >
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Upload className="w-4 h-4 ml-1.5" />}
                                    <span className="text-xs font-bold leading-none">معرض الصور</span>
                                </Button>
                            </motion.div>

                            <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                                <Button 
                                    variant="outline"
                                    className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50 h-11 shadow-sm font-bold bg-white" 
                                    disabled={uploading}
                                    onClick={() => handleNativeCamera(true)}
                                >
                                    <LucideCamera className="w-4 h-4 ml-1.5" />
                                    <span className="text-xs font-bold leading-none">تصوير وثيقة</span>
                                </Button>
                            </motion.div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Files Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Tabs defaultValue="files" className="w-full">
                    <TabsList className="w-full bg-white dark:bg-slate-800 p-1 rounded-xl h-12 shadow-sm">
                        <TabsTrigger value="files" className="flex-1 rounded-lg data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-700">
                            الملفات ({files.length})
                        </TabsTrigger>
                        <TabsTrigger value="labs" className="flex-1 rounded-lg data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-700">
                            المختبر
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="files" className="mt-4 space-y-3">
                        {files.length > 0 ? (
                            files.map((file, index) => (
                                <motion.div
                                    key={file.id}
                                    className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <File className="w-5 h-5 text-slate-500" />
                                        </motion.div>
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white truncate max-w-[180px]">{file.name}</p>
                                            <p className="text-xs text-slate-400">
                                                {format(new Date(file.uploaded_at), 'dd/MM/yyyy', { locale: ar })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <motion.a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileTap={{ scale: 0.85 }}
                                        >
                                            <Button variant="ghost" size="icon" className="rounded-lg">
                                                <ExternalLink className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </motion.a>
                                        <motion.button
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50"
                                            whileTap={{ scale: 0.85 }}
                                            onClick={() => onDelete(file.id!)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <File className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500">لا توجد ملفات مرفقة بعد</p>
                            </div>
                        )}

                        {/* Lab Review CTA */}
                        {files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 p-5 rounded-2xl shadow-lg relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="text-white">
                                        <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                                            <Microscope className="w-5 h-5" />
                                            طلب مراجعة مخبرية
                                        </h4>
                                        <p className="text-emerald-100 text-xs max-w-[200px] leading-relaxed">
                                            احصل على تقييم دقيق لتحاليلك وربطها بالأعراض من قِبل د. عمر العماد.
                                        </p>
                                    </div>
                                    <Button 
                                        className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-md h-12 px-6 rounded-xl shrink-0"
                                        onClick={() => window.location.href = '/digital-services'}
                                    >
                                        طلب المراجعة
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </TabsContent>

                    <TabsContent value="labs" className="mt-4">
                        <LabResultsTracker />
                    </TabsContent>
                </Tabs>
            </motion.div>
        </>
    );
}
