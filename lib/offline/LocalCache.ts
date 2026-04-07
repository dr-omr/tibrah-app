/**
 * LocalCache — Cache المحلي للبيانات الحيوية
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * يُخزِّن البيانات الحيوية محلياً لضمان عمل التطبيق بدون إنترنت:
 * 
 * البيانات المُخزَّنة:
 * - الملف الطبي (لا يتغير كثيراً)
 * - قائمة الأدوية الحالية
 * - آخر 7 سجلات صحية
 * - المقالات المُفضَّلة
 * - بيانات المستخدم الأساسية
 * 
 * كل entry لها TTL (Time-To-Live) — تنتهي صلاحيتها بعد مدة
 * وتُحدَّث تلقائياً عند توفر الإنترنت.
 *
 * الاستخدام:
 *   import { localCache } from '@/lib/offline/LocalCache'
 *   await localCache.set('medications', data, 24 * 60 * 60 * 1000) // 24h TTL
 *   const medications = await localCache.get('medications')
 */

import localforage from 'localforage';

// ─── Types ───────────────────────────────────────────────────────

interface CacheEntry<T = unknown> {
  data: T;
  storedAt: number;
  expiresAt: number;
  version: number;
}

export interface CacheStats {
  totalKeys: number;
  expiredKeys: number;
  freshKeys: number;
  estimatedSizeKB: number;
}

// ─── TTL Constants (ms) ───────────────────────────────────────────

export const TTL = {
  SHORT:    5  * 60 * 1000,  // 5 دقائق — بيانات تتغير باستمرار
  MEDIUM:   30 * 60 * 1000,  // 30 دقيقة — بيانات شبه محدَّثة
  LONG:     6  * 60 * 60 * 1000, // 6 ساعات — بيانات نادرة التغيير
  DAY:      24 * 60 * 60 * 1000, // 24 ساعة — بيانات ثابتة
  WEEK:     7  * 24 * 60 * 60 * 1000, // أسبوع — content ثابت
} as const;

// ─── Cache Keys ───────────────────────────────────────────────────

export const CACHE_KEYS = {
  USER_PROFILE:    'cache_user_profile',
  MEDICAL_FILE:    'cache_medical_file',
  MEDICATIONS:     'cache_medications',
  HEALTH_RECORDS:  'cache_health_records',
  APPOINTMENTS:    'cache_appointments',
  ARTICLES:        'cache_articles',
  DAILY_LOG:       'cache_daily_log',
  HEALTH_METRICS:  'cache_health_metrics',
} as const;

// ─── Cache Class ─────────────────────────────────────────────────

class LocalCacheClass {
  private readonly CACHE_VERSION = 1;
  private memoryCache = new Map<string, CacheEntry>();

  // ─── Core Set ───────────────────────────────────────────────

  async set<T>(key: string, data: T, ttl: number = TTL.MEDIUM): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      storedAt: Date.now(),
      expiresAt: Date.now() + ttl,
      version: this.CACHE_VERSION,
    };

    // تخزين في الذاكرة أولاً (سريع)
    this.memoryCache.set(key, entry as CacheEntry);

    // ثم في LocalForage (دائم)
    try {
      await localforage.setItem(`tibrah_${key}`, entry);
    } catch (e) {
      console.warn(`[LocalCache] Failed to persist ${key}:`, e);
    }
  }

  // ─── Core Get ───────────────────────────────────────────────

  async get<T>(key: string): Promise<T | null> {
    // أولاً: تحقق من الذاكرة
    const memEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (memEntry) {
      if (Date.now() < memEntry.expiresAt) {
        return memEntry.data;
      }
      // منتهية الصلاحية — احذفها من الذاكرة
      this.memoryCache.delete(key);
    }

    // ثانياً: جرب LocalForage
    try {
      const stored = await localforage.getItem<CacheEntry<T>>(`tibrah_${key}`);
      if (!stored) return null;

      // تحقق من الصلاحية
      if (Date.now() > stored.expiresAt) {
        // منتهية — احذفها
        await localforage.removeItem(`tibrah_${key}`);
        return null;
      }

      // تحقق من الإصدار
      if (stored.version !== this.CACHE_VERSION) {
        await localforage.removeItem(`tibrah_${key}`);
        return null;
      }

      // أعد التخزين في الذاكرة
      this.memoryCache.set(key, stored as CacheEntry);
      return stored.data;
    } catch {
      return null;
    }
  }

  // ─── Getters مع Fallback ────────────────────────────────────

  /**
   * يُرجع البيانات حتى لو منتهية الصلاحية (stale-while-revalidate)
   * مفيد عند عدم وجود إنترنت
   */
  async getStale<T>(key: string): Promise<{ data: T | null; isStale: boolean }> {
    try {
      const stored = await localforage.getItem<CacheEntry<T>>(`tibrah_${key}`);
      if (!stored) return { data: null, isStale: false };

      const isStale = Date.now() > stored.expiresAt;
      return { data: stored.data, isStale };
    } catch {
      return { data: null, isStale: false };
    }
  }

  // ─── Invalidate ─────────────────────────────────────────────

  async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await localforage.removeItem(`tibrah_${key}`).catch(() => {});
  }

  async invalidateAll(): Promise<void> {
    this.memoryCache.clear();
    try {
      const keys = await localforage.keys();
      const tibrahKeys = keys.filter(k => k.startsWith('tibrah_cache_'));
      await Promise.all(tibrahKeys.map(k => localforage.removeItem(k)));
    } catch { /* no-op */ }
  }

  // ─── Has (فقط للذاكرة السريعة) ─────────────────────────────

  hasValid(key: string): boolean {
    const entry = this.memoryCache.get(key);
    return !!entry && Date.now() < entry.expiresAt;
  }

  // ─── Stats ──────────────────────────────────────────────────

  async getStats(): Promise<CacheStats> {
    try {
      const keys = await localforage.keys();
      const tibrahKeys = keys.filter(k => k.startsWith('tibrah_cache_'));
      const now = Date.now();

      let expiredKeys = 0;
      let freshKeys = 0;
      let estimatedSizeKB = 0;

      for (const key of tibrahKeys) {
        const entry = await localforage.getItem<CacheEntry>(key);
        if (entry) {
          const sizeKB = JSON.stringify(entry.data).length / 1024;
          estimatedSizeKB += sizeKB;

          if (now > entry.expiresAt) {
            expiredKeys++;
          } else {
            freshKeys++;
          }
        }
      }

      return {
        totalKeys: tibrahKeys.length,
        expiredKeys,
        freshKeys,
        estimatedSizeKB: Math.round(estimatedSizeKB),
      };
    } catch {
      return { totalKeys: 0, expiredKeys: 0, freshKeys: 0, estimatedSizeKB: 0 };
    }
  }

  // ─── Preload Critical Data ───────────────────────────────────

  /**
   * يُحمِّل البيانات الأساسية مسبقاً للـ offline mode
   * يُستدعى عند تسجيل الدخول وعند عودة التطبيق للمقدمة
   */
  async preloadCriticalData(
    userId: string,
    loaders: {
      loadMedications?: () => Promise<unknown>;
      loadMedicalFile?: () => Promise<unknown>;
      loadHealthMetrics?: () => Promise<unknown>;
    }
  ): Promise<void> {
    const tasks: Promise<void>[] = [];

    if (loaders.loadMedications) {
      tasks.push(
        loaders.loadMedications()
          .then(data => this.set(`${CACHE_KEYS.MEDICATIONS}_${userId}`, data, TTL.LONG))
          .catch(() => {})
      );
    }

    if (loaders.loadMedicalFile) {
      tasks.push(
        loaders.loadMedicalFile()
          .then(data => this.set(`${CACHE_KEYS.MEDICAL_FILE}_${userId}`, data, TTL.DAY))
          .catch(() => {})
      );
    }

    if (loaders.loadHealthMetrics) {
      tasks.push(
        loaders.loadHealthMetrics()
          .then(data => this.set(`${CACHE_KEYS.HEALTH_METRICS}_${userId}`, data, TTL.MEDIUM))
          .catch(() => {})
      );
    }

    await Promise.allSettled(tasks);
  }
}

// ─── Singleton Export ─────────────────────────────────────────────

export const localCache = new LocalCacheClass();
export default localCache;
