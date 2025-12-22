// Admin Cloud Sync Page
// One-click sync all local data to Firestore

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cloud, CloudOff, Check, X, Loader2, ArrowRight,
    Database, Heart, Utensils, BookOpen, Package, Settings,
    Zap, RefreshCw, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

// Data imports
import { emotionalDiseases } from '@/data/emotionalMedicineData';
import { foodDatabase } from '@/lib/mealDatabase';
import { localProducts } from '@/lib/products';
import { localArticles } from '@/lib/articles';

// Firestore services
import firestoreService, {
    isFirestoreAvailable,
    batchWriteDocuments,
    COLLECTIONS
} from '@/lib/firestore';

interface SyncItem {
    id: string;
    name: string;
    nameAr: string;
    icon: React.ReactNode;
    collection: string;
    count: number;
    getData: () => any[];
    status: 'idle' | 'syncing' | 'success' | 'error';
    color: string;
}

export default function CloudSyncPage() {
    const router = useRouter();
    const [isFirestoreReady] = useState(isFirestoreAvailable());
    const [syncItems, setSyncItems] = useState<SyncItem[]>([
        {
            id: 'diseases',
            name: 'Emotional Diseases',
            nameAr: 'الأمراض الشعورية',
            icon: <Heart className="w-5 h-5" />,
            collection: COLLECTIONS.DISEASES,
            count: emotionalDiseases?.length || 0,
            getData: () => emotionalDiseases || [],
            status: 'idle',
            color: 'from-rose-500 to-pink-500'
        },
        {
            id: 'foods',
            name: 'Food Database',
            nameAr: 'قاعدة الأطعمة',
            icon: <Utensils className="w-5 h-5" />,
            collection: COLLECTIONS.FOODS,
            count: foodDatabase?.length || 0,
            getData: () => foodDatabase || [],
            status: 'idle',
            color: 'from-amber-500 to-orange-500'
        },
        {
            id: 'products',
            name: 'Products',
            nameAr: 'المنتجات',
            icon: <Package className="w-5 h-5" />,
            collection: COLLECTIONS.PRODUCTS,
            count: localProducts?.length || 0,
            getData: () => localProducts || [],
            status: 'idle',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'articles',
            name: 'Articles',
            nameAr: 'المقالات',
            icon: <BookOpen className="w-5 h-5" />,
            collection: COLLECTIONS.ARTICLES,
            count: localArticles?.length || 0,
            getData: () => localArticles || [],
            status: 'idle',
            color: 'from-purple-500 to-indigo-500'
        },
    ]);

    const [isSyncingAll, setIsSyncingAll] = useState(false);
    const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });

    const updateItemStatus = (id: string, status: SyncItem['status']) => {
        setSyncItems(items =>
            items.map(item =>
                item.id === id ? { ...item, status } : item
            )
        );
    };

    const syncSingleItem = useCallback(async (item: SyncItem) => {
        if (!isFirestoreReady) {
            toast.error('Firestore غير متصل');
            return false;
        }

        updateItemStatus(item.id, 'syncing');

        try {
            const data = item.getData();

            if (data.length === 0) {
                toast.warning(`${item.nameAr}: لا توجد بيانات للمزامنة`);
                updateItemStatus(item.id, 'idle');
                return false;
            }

            // Prepare documents for batch write
            const documents = data.map((d: any) => ({
                id: d.id?.toString() || undefined,
                data: { ...d }
            }));

            // Batch write in chunks of 500 (Firestore limit)
            const chunkSize = 450;
            for (let i = 0; i < documents.length; i += chunkSize) {
                const chunk = documents.slice(i, i + chunkSize);
                const success = await batchWriteDocuments(item.collection, chunk);

                if (!success) {
                    throw new Error(`فشل في رفع الجزء ${i / chunkSize + 1}`);
                }
            }

            updateItemStatus(item.id, 'success');
            toast.success(`✅ ${item.nameAr}: تم رفع ${data.length} عنصر`);
            return true;

        } catch (error: any) {
            console.error(`Sync error for ${item.id}:`, error);
            updateItemStatus(item.id, 'error');
            toast.error(`❌ ${item.nameAr}: ${error.message || 'خطأ في المزامنة'}`);
            return false;
        }
    }, [isFirestoreReady]);

    const syncAllData = useCallback(async () => {
        if (!isFirestoreReady) {
            toast.error('Firestore غير متصل! تأكد من إعدادات Firebase.');
            return;
        }

        setIsSyncingAll(true);
        setSyncProgress({ current: 0, total: syncItems.length });

        let successCount = 0;

        for (let i = 0; i < syncItems.length; i++) {
            setSyncProgress({ current: i + 1, total: syncItems.length });
            const success = await syncSingleItem(syncItems[i]);
            if (success) successCount++;
        }

        setIsSyncingAll(false);

        if (successCount === syncItems.length) {
            toast.success('🎉 تم رفع جميع البيانات للسحابة بنجاح!');
        } else {
            toast.warning(`تم رفع ${successCount} من ${syncItems.length} مجموعات`);
        }
    }, [isFirestoreReady, syncItems, syncSingleItem]);

    const getStatusIcon = (status: SyncItem['status']) => {
        switch (status) {
            case 'syncing':
                return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'error':
                return <X className="w-5 h-5 text-red-500" />;
            default:
                return <Cloud className="w-5 h-5 text-slate-400" />;
        }
    };

    const totalItems = syncItems.reduce((sum, item) => sum + item.count, 0);
    const successCount = syncItems.filter(i => i.status === 'success').length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" dir="rtl">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 py-12 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -top-20 -right-20 w-60 h-60 bg-white rounded-full blur-3xl"
                    />
                </div>

                <div className="relative z-10">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="text-white hover:bg-white/20 rounded-full mb-4"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </Button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                            <Database className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">مزامنة السحابة</h1>
                            <p className="text-white/70 text-sm">رفع جميع بيانات الموقع لـ Firestore</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 flex-wrap">
                        <div className="bg-white/15 backdrop-blur-md rounded-xl px-4 py-3">
                            <p className="text-white font-bold text-xl">{totalItems.toLocaleString()}</p>
                            <p className="text-white/70 text-xs">إجمالي العناصر</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-md rounded-xl px-4 py-3">
                            <p className="text-white font-bold text-xl">{syncItems.length}</p>
                            <p className="text-white/70 text-xs">مجموعات البيانات</p>
                        </div>
                        <div className={`backdrop-blur-md rounded-xl px-4 py-3 ${isFirestoreReady ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                            <div className="flex items-center gap-2">
                                {isFirestoreReady ? (
                                    <Check className="w-4 h-4 text-green-300" />
                                ) : (
                                    <CloudOff className="w-4 h-4 text-red-300" />
                                )}
                                <p className="text-white text-sm">
                                    {isFirestoreReady ? 'متصل' : 'غير متصل'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 -mt-6">
                {/* Sync All Button */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-6"
                >
                    <Button
                        onClick={syncAllData}
                        disabled={isSyncingAll || !isFirestoreReady}
                        className={`w-full h-16 rounded-2xl text-lg font-bold transition-all ${isSyncingAll
                            ? 'bg-blue-600'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                            } text-white shadow-lg`}
                    >
                        {isSyncingAll ? (
                            <>
                                <Loader2 className="w-6 h-6 ml-2 animate-spin" />
                                جاري المزامنة ({syncProgress.current}/{syncProgress.total})
                            </>
                        ) : (
                            <>
                                <Zap className="w-6 h-6 ml-2" />
                                رفع جميع البيانات للسحابة
                            </>
                        )}
                    </Button>

                    {isSyncingAll && (
                        <div className="mt-3 bg-white/10 rounded-full h-2 overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    )}
                </motion.div>

                {/* Data Collections */}
                <div className="space-y-3">
                    <h3 className="text-white/60 text-sm font-medium mb-4 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        مجموعات البيانات
                    </h3>

                    <AnimatePresence>
                        {syncItems.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white`}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{item.nameAr}</h4>
                                            <p className="text-white/50 text-sm">
                                                {item.count.toLocaleString()} عنصر
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(item.status)}

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => syncSingleItem(item)}
                                            disabled={item.status === 'syncing' || isSyncingAll}
                                            className="text-white/70 hover:text-white hover:bg-white/10"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${item.status === 'syncing' ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </div>
                                </div>

                                {item.status === 'success' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-3 pt-3 border-t border-white/10"
                                    >
                                        <p className="text-green-400 text-sm flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            تم الرفع بنجاح ☁️
                                        </p>
                                    </motion.div>
                                )}

                                {item.status === 'error' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-3 pt-3 border-t border-white/10"
                                    >
                                        <p className="text-red-400 text-sm flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            فشل في الرفع - اضغط للمحاولة مرة أخرى
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Success Summary */}
                {successCount > 0 && !isSyncingAll && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-green-500/20 border border-green-500/30 rounded-2xl p-4 text-center"
                    >
                        <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
                        <p className="text-green-300 font-bold">
                            تم رفع {successCount} من {syncItems.length} مجموعات!
                        </p>
                        <p className="text-green-400/70 text-sm mt-1">
                            البيانات محفوظة بأمان في السحابة ☁️
                        </p>
                    </motion.div>
                )}

                {/* Not Connected Warning */}
                {!isFirestoreReady && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 bg-red-500/20 border border-red-500/30 rounded-2xl p-4"
                    >
                        <div className="flex items-start gap-3">
                            <CloudOff className="w-6 h-6 text-red-400 flex-shrink-0" />
                            <div>
                                <h4 className="text-red-300 font-bold mb-1">Firestore غير متصل</h4>
                                <p className="text-red-400/70 text-sm">
                                    تأكد من إضافة مفاتيح Firebase في ملف .env.local
                                    وأعد تشغيل السيرفر
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
