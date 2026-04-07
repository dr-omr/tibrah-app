// components/admin-v2/modules/settings/CloudSyncPage.tsx
// Migrated Cloud Sync tool — integrated into AdminShell layout

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud, Check, Loader2, Database,
  Heart, Utensils, BookOpen, Package,
  Zap, RefreshCw, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/notification-engine';
import AdminPageHeader from '../../primitives/AdminPageHeader';

// Data imports
import { emotionalDiseases } from '@/data/emotionalMedicineData';
import { foodDatabase } from '@/lib/mealDatabase';
import { localProducts } from '@/lib/products';
import { localArticles } from '@/lib/articles';

// Firestore services
import {
  isFirestoreAvailable,
  batchWriteDocuments,
  COLLECTIONS
} from '@/lib/firestore';

interface SyncItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  status: 'idle' | 'syncing' | 'success' | 'error';
  count?: number;
  error?: string;
  color: string;
}

export default function CloudSyncPage() {
  const [syncItems, setSyncItems] = useState<SyncItem[]>([
    {
      id: 'emotional',
      name: 'بيانات الطب النفسي الجسدي',
      icon: <Heart className="w-5 h-5" />,
      description: 'أمراض وأنماط الطب النفسي الجسدي والعاطفي',
      status: 'idle',
      color: '#ef4444',
    },
    {
      id: 'foods',
      name: 'قاعدة بيانات الأطعمة',
      icon: <Utensils className="w-5 h-5" />,
      description: 'قاعدة بيانات الأطعمة والقيم الغذائية',
      status: 'idle',
      color: '#f59e0b',
    },
    {
      id: 'products',
      name: 'المنتجات والمتجر',
      icon: <Package className="w-5 h-5" />,
      description: 'منتجات المتجر والمكملات الغذائية',
      status: 'idle',
      color: '#8b5cf6',
    },
    {
      id: 'articles',
      name: 'المقالات والمحتوى',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'مقالات ومحتوى المنصة الصحية',
      status: 'idle',
      color: '#2d9b83',
    },
  ]);

  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [firestoreReady, setFirestoreReady] = useState<boolean | null>(null);

  React.useEffect(() => {
    setFirestoreReady(isFirestoreAvailable());
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<SyncItem>) => {
    setSyncItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const syncItem = useCallback(async (itemId: string) => {
    updateItem(itemId, { status: 'syncing', error: undefined });

    try {
      let rawData: any[] = [];
      let collection = '';

      switch (itemId) {
        case 'emotional':
          rawData = Array.isArray(emotionalDiseases) ? emotionalDiseases : [];
          collection = COLLECTIONS.DISEASES;
          break;
        case 'foods':
          rawData = Array.isArray(foodDatabase) ? foodDatabase : [];
          collection = COLLECTIONS.FOODS;
          break;
        case 'products':
          rawData = Array.isArray(localProducts) ? localProducts : [];
          collection = COLLECTIONS.PRODUCTS;
          break;
        case 'articles':
          rawData = Array.isArray(localArticles) ? localArticles : [];
          collection = COLLECTIONS.ARTICLES;
          break;
      }

      if (rawData.length === 0) {
        updateItem(itemId, { status: 'success', count: 0 });
        toast.info('لا توجد بيانات للمزامنة');
        return;
      }

      // batchWriteDocuments expects {id?, data}[] format
      const documents = rawData.map((item: any) => ({
        id: item.id ? String(item.id) : undefined,
        data: item,
      }));

      await batchWriteDocuments(collection, documents);
      updateItem(itemId, { status: 'success', count: rawData.length });
      toast.success(`✓ تمت مزامنة ${rawData.length} عنصر`);
    } catch (err: any) {
      updateItem(itemId, { status: 'error', error: err.message });
      toast.error(`فشل المزامنة: ${err.message}`);
    }
  }, [updateItem]);

  const syncAll = useCallback(async () => {
    setIsSyncingAll(true);
    for (const item of syncItems) {
      await syncItem(item.id);
    }
    setIsSyncingAll(false);
    toast.success('اكتملت المزامنة الشاملة ✓');
  }, [syncItems, syncItem]);

  const resetAll = useCallback(() => {
    setSyncItems(prev => prev.map(item => ({
      ...item,
      status: 'idle',
      count: undefined,
      error: undefined,
    })));
  }, []);

  const completedCount = syncItems.filter(i => i.status === 'success').length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="مزامنة السحابة"
        description="رفع البيانات المحلية إلى Firestore دفعة واحدة"
        icon={<Cloud className="w-5 h-5 text-slate-500" />}
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetAll} className="text-xs gap-1.5 h-8 border-slate-200">
            <RefreshCw className="w-3.5 h-3.5" />
            إعادة تعيين
          </Button>
          <Button
            onClick={syncAll}
            disabled={isSyncingAll || firestoreReady === false}
            className="text-xs gap-1.5 h-8 bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isSyncingAll
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Zap className="w-3.5 h-3.5" />}
            مزامنة الكل
          </Button>
        </div>
      </AdminPageHeader>

      {/* Firestore Status Banner */}
      <div className={`admin-card p-4 flex items-center gap-3 ${
        firestoreReady === null ? 'bg-slate-50 border-slate-200' :
        firestoreReady ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        {firestoreReady === null
          ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          : firestoreReady
            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
            : <AlertCircle className="w-4 h-4 text-red-500" />}
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-700">
            {firestoreReady === null ? 'جاري فحص Firestore...' :
             firestoreReady ? 'Firestore متاح — جاهز للمزامنة' :
             'Firestore غير متاح'}
          </p>
          {firestoreReady === false && (
            <p className="text-xs text-red-500 mt-0.5">
              تحقق من إعدادات Firebase في ملف .env.local
            </p>
          )}
        </div>
        {completedCount > 0 && (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            {completedCount}/{syncItems.length} مكتمل
          </span>
        )}
      </div>

      {/* Sync Items Grid */}
      <div className="grid gap-3">
        {syncItems.map(item => (
          <motion.div key={item.id} layout className="admin-card">
            <div className="admin-card-body flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.color}15`, color: item.color }}
              >
                {item.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                {item.count !== undefined && item.status === 'success' && (
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    ✓ مزامنة {item.count} عنصر
                  </p>
                )}
                {item.error && (
                  <p className="text-xs text-red-500 mt-1">✗ {item.error}</p>
                )}
              </div>

              <div className="flex-shrink-0">
                {item.status === 'idle' && (
                  <Button
                    size="sm" variant="outline"
                    onClick={() => syncItem(item.id)}
                    disabled={firestoreReady === false}
                    className="text-xs h-8 gap-1 border-slate-200"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    رفع
                  </Button>
                )}
                {item.status === 'syncing' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span className="text-xs text-blue-600 font-medium">جارٍ...</span>
                  </div>
                )}
                {item.status === 'success' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg">
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">مكتمل</span>
                  </div>
                )}
                {item.status === 'error' && (
                  <Button
                    size="sm" variant="outline"
                    onClick={() => syncItem(item.id)}
                    className="text-xs h-8 gap-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    إعادة
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
