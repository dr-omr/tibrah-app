// components/medical-file/MedicalFilesTab.tsx
// Files tab with upload section and file list

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, File, ExternalLink, Trash2, Plus, Loader2, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

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
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDelete: (id: string) => void;
}

export default function MedicalFilesTab({ files, uploading, onUpload, onDelete }: MedicalFilesTabProps) {
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

                        <div className="relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={onUpload}
                                disabled={uploading}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                            <motion.div whileTap={{ scale: 0.95 }}>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8" disabled={uploading}>
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                                    {uploading ? 'جاري الرفع...' : 'اختر ملف'}
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
                    </TabsContent>

                    <TabsContent value="labs" className="mt-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm text-center">
                            <Microscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 dark:text-slate-400 mb-2">نتائج المختبر الرقمية</p>
                            <p className="text-xs text-slate-400">سيتم عرض نتائج التحاليل هنا</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </>
    );
}
