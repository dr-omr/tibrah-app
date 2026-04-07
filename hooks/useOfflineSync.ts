/**
 * useOfflineSync — ربط Offline Queue + Cache مع الـ App
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Hook مركزي يُدير:
 * - مزامنة الطابور عند عودة الإنترنت
 * - عدد العمليات المعلقة
 * - حالة المزامنة
 * - إشعار المستخدم بنتيجة المزامنة
 * 
 * الاستخدام:
 *   const { pendingCount, isSyncing, syncNow } = useOfflineSync()
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineQueue, SyncResult } from '@/lib/offline/OfflineQueue';
import { useNative } from '@/contexts/NativeContext';
import { toast } from '@/components/notification-engine';

export function useOfflineSync() {
  const { isOnline, appState } = useNative();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const prevOnline = useRef(isOnline);
  const prevAppState = useRef(appState);

  // تحديث عداد العمليات المعلقة
  const refreshCount = useCallback(() => {
    setPendingCount(offlineQueue.getQueuedCount());
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // مزامنة يدوية
  const syncNow = useCallback(async (): Promise<SyncResult> => {
    if (!isOnline || isSyncing) {
      return { succeeded: 0, failed: 0, remaining: pendingCount };
    }

    setIsSyncing(true);
    try {
      const result = await offlineQueue.flush();
      setLastSyncResult(result);
      setPendingCount(result.remaining);

      if (result.succeeded > 0) {
        toast.success(`تمت مزامنة ${result.succeeded} عملية بنجاح`);
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, pendingCount]);

  // مزامنة تلقائية عند عودة الإنترنت
  useEffect(() => {
    const wasOffline = !prevOnline.current;
    const isNowOnline = isOnline;
    prevOnline.current = isOnline;

    if (wasOffline && isNowOnline && pendingCount > 0) {
      // تأخير صغير للسماح للاتصال بالاستقرار
      const timer = setTimeout(() => {
        syncNow().catch(console.error);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingCount, syncNow]);

  // مزامنة عند عودة التطبيق من الخلفية
  useEffect(() => {
    const wasBackground = prevAppState.current !== 'active';
    const isNowActive = appState === 'active';
    prevAppState.current = appState;

    if (wasBackground && isNowActive && isOnline && pendingCount > 0) {
      const timer = setTimeout(() => {
        syncNow().catch(console.error);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [appState, isOnline, pendingCount, syncNow]);

  return {
    pendingCount,
    isSyncing,
    lastSyncResult,
    syncNow,
    refreshCount,
    isOnline,
  };
}

export default useOfflineSync;
