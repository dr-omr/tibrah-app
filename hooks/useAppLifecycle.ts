/**
 * useAppLifecycle — Hook لإدارة دورة حياة التطبيق
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * يُمكِّن أي مكوّن من:
 * - الاستجابة لانتقال التطبيق background/foreground
 * - إيقاف real-time listeners عند الخروج
 * - استئنافها عند العودة
 * - معرفة مدة الـ background لإعادة تحميل البيانات إذا لزم
 * 
 * الاستخدام:
 *   useAppLifecycle({
 *     onForeground: () => refetch(),
 *     onBackground: () => pauseVideo(),
 *     refreshAfterMs: 5 * 60 * 1000, // أعد التحميل إذا كان غائباً > 5 دقائق
 *   })
 */

import { useEffect, useRef, useCallback } from 'react';
import { useNative } from '@/contexts/NativeContext';

// ─── Types ───────────────────────────────────────────────────────

interface AppLifecycleOptions {
  /** يُستدعى عند عودة التطبيق للمقدمة */
  onForeground?: () => void;
  /** يُستدعى عند انتقال التطبيق للخلفية */
  onBackground?: () => void;
  /**
   * إذا كان التطبيق في الخلفية أكثر من هذه المدة (بالـ ms)
   * يُستدعى onForeground مع استدعاء onStaleRefresh إضافي
   */
  refreshAfterMs?: number;
  /** يُستدعى عند العودة بعد مدة طويلة */
  onStaleRefresh?: () => void;
  /** تعطيل الـ hook مؤقتاً */
  enabled?: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useAppLifecycle({
  onForeground,
  onBackground,
  refreshAfterMs = 5 * 60 * 1000, // 5 دقائق افتراضي
  onStaleRefresh,
  enabled = true,
}: AppLifecycleOptions = {}) {
  const { appState } = useNative();
  const backgroundTime = useRef<number | null>(null);
  const prevState = useRef<string>(appState);

  useEffect(() => {
    if (!enabled) return;

    const wasActive = prevState.current === 'active';
    const isNowActive = appState === 'active';

    if (!wasActive && isNowActive) {
      // ─── عاد للمقدمة ────────────────────────────────────────
      onForeground?.();

      // تحقق إذا كان غائباً لفترة طويلة
      if (backgroundTime.current !== null && onStaleRefresh) {
        const elapsed = Date.now() - backgroundTime.current;
        if (elapsed >= refreshAfterMs) {
          onStaleRefresh();
        }
      }

      backgroundTime.current = null;
    } else if (wasActive && !isNowActive) {
      // ─── انتقل للخلفية ─────────────────────────────────────
      onBackground?.();
      backgroundTime.current = Date.now();
    }

    prevState.current = appState;
  }, [appState, enabled, onForeground, onBackground, onStaleRefresh, refreshAfterMs]);

  // Fallback للـ Web: يستخدم visibilitychange event
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        onForeground?.();

        if (backgroundTime.current !== null && onStaleRefresh) {
          const elapsed = Date.now() - backgroundTime.current;
          if (elapsed >= refreshAfterMs) {
            onStaleRefresh();
          }
        }
        backgroundTime.current = null;
      } else {
        onBackground?.();
        backgroundTime.current = Date.now();
      }
    };

    // فقط على الـ web (Capacitor يُعالج هذا بـ appState)
    if (typeof window !== 'undefined' && !('Capacitor' in window)) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [enabled, onForeground, onBackground, onStaleRefresh, refreshAfterMs]);
}

export default useAppLifecycle;
