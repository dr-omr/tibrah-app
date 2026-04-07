/**
 * OfflineQueue — طابور العمليات غير المتزامنة
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * كل عملية كتابة فاشلة (بسبب انقطاع الإنترنت) تُخزَّن هنا.
 * عند عودة الإنترنت، يُعيد المحاولة تلقائياً بالترتيب.
 * 
 * Flow:
 *   1. المستخدم يُنفِّذ action بدون إنترنت
 *   2. OfflineQueue.enqueue(operation)
 *   3. عند عودة الإنترنت: flush() → تُنفَّذ كل العمليات بالترتيب
 *   4. عند النجاح: تُحذف من الطابور
 *   5. عند الفشل: تُعاد المحاولة 3 مرات ثم تُحذف مع تسجيل الخطأ
 *
 * الاستخدام:
 *   import { offlineQueue } from '@/lib/offline/OfflineQueue'
 *   await offlineQueue.enqueue({ type: 'save_medication', payload: {...}, execute: fn })
 */

import localforage from 'localforage';

// ─── Types ───────────────────────────────────────────────────────

export interface OfflineOperation {
  /** معرف فريد للعملية */
  id: string;
  /** نوع العملية — للـ logging والتصفية */
  type: string;
  /** البيانات المطلوبة للتنفيذ */
  payload: unknown;
  /** الدالة التي تُنفِّذ العملية */
  execute: () => Promise<void>;
  /** عدد محاولات إعادة التنفيذ */
  retryCount?: number;
  /** أقصى عدد محاولات */
  maxRetries?: number;
  /** توقيت إضافة العملية */
  enqueuedAt: number;
  /** label لعرضه للمستخدم */
  label?: string;
}

interface StoredOperation {
  id: string;
  type: string;
  payload: unknown;
  retryCount: number;
  maxRetries: number;
  enqueuedAt: number;
  label?: string;
  // execute لا تُخزَّن (function غير قابلة للتسلسل)
}

export interface SyncResult {
  succeeded: number;
  failed: number;
  remaining: number;
}

// ─── Storage Key ─────────────────────────────────────────────────

const QUEUE_KEY = 'tibrah_offline_queue';

// ─── Offline Queue Class ──────────────────────────────────────────

class OfflineQueueClass {
  private queue: OfflineOperation[] = [];
  private isFlushing = false;
  private isInitialized = false;
  private executeRegistry = new Map<string, () => Promise<void>>();

  // ─── Init ──────────────────────────────────────────────────

  async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // استرجاع العمليات المخزَّنة
    try {
      const stored = await localforage.getItem<StoredOperation[]>(QUEUE_KEY);
      if (stored && Array.isArray(stored)) {
        // نُعيد بناء queue بدون execute (ستُسجَّل لاحقاً)
        this.queue = stored.map(op => ({
          ...op,
          execute: async () => {
            console.warn(`[OfflineQueue] No executor registered for type: ${op.type}`);
          },
        }));
      }
    } catch {
      this.queue = [];
    }

    // الاستماع لعودة الإنترنت
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.flush().catch(console.error);
      });
    }
  }

  // ─── Enqueue ───────────────────────────────────────────────

  async enqueue(operation: Omit<OfflineOperation, 'id' | 'enqueuedAt' | 'retryCount'> & { 
    id?: string;
    retryCount?: number;
  }): Promise<void> {
    const op: OfflineOperation = {
      id: operation.id || `${operation.type}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      enqueuedAt: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      ...operation,
    };

    // تسجيل الـ executor
    this.executeRegistry.set(op.id, op.execute);

    // أضف للطابور إذا لم يكن موجوداً
    const exists = this.queue.some(q => q.id === op.id);
    if (!exists) {
      this.queue.push(op);
      await this._persist();
    }

    // حاول التنفيذ فوراً إذا كان هناك إنترنت
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.flush().catch(console.error);
    }
  }

  // ─── Flush ─────────────────────────────────────────────────

  async flush(): Promise<SyncResult> {
    if (this.isFlushing || this.queue.length === 0) {
      return { succeeded: 0, failed: 0, remaining: this.queue.length };
    }

    this.isFlushing = true;
    let succeeded = 0;
    let failed = 0;
    const toRemove: string[] = [];
    const toRetry: string[] = [];

    for (const op of [...this.queue]) {
      try {
        // استخدم الـ executor المسجَّل أو الـ fallback
        const executor = this.executeRegistry.get(op.id) || op.execute;
        await executor();
        succeeded++;
        toRemove.push(op.id);
      } catch (e) {
        const retryCount = (op.retryCount || 0) + 1;
        const maxRetries = op.maxRetries || 3;

        if (retryCount >= maxRetries) {
          // استنفدنا المحاولات — نحذف
          console.error(`[OfflineQueue] Operation ${op.id} failed after ${maxRetries} retries:`, e);
          toRemove.push(op.id);
          failed++;
        } else {
          // نُحدِّث عداد المحاولات
          op.retryCount = retryCount;
          toRetry.push(op.id);
          failed++; // نعدّها فشل مؤقت
        }
      }
    }

    // حذف المنتهية
    this.queue = this.queue.filter(op => !toRemove.includes(op.id));
    await this._persist();

    this.isFlushing = false;

    return {
      succeeded,
      failed: toRetry.length, // الفاشلة الحقيقية فقط
      remaining: this.queue.length,
    };
  }

  // ─── Getters ───────────────────────────────────────────────

  getQueuedCount(): number {
    return this.queue.length;
  }

  getQueuedOperations(): Omit<OfflineOperation, 'execute'>[] {
    return this.queue.map(({ execute: _exec, ...op }) => op);
  }

  async clear(): Promise<void> {
    this.queue = [];
    this.executeRegistry.clear();
    await localforage.removeItem(QUEUE_KEY);
  }

  // ─── Persist ───────────────────────────────────────────────

  private async _persist(): Promise<void> {
    try {
      const stored: StoredOperation[] = this.queue.map(({ execute: _exec, ...op }) => ({
      ...op,
      retryCount: op.retryCount ?? 0,
      maxRetries: op.maxRetries ?? 3,
    }));
      await localforage.setItem(QUEUE_KEY, stored);
    } catch (e) {
      console.warn('[OfflineQueue] Failed to persist queue:', e);
    }
  }
}

// ─── Singleton Export ─────────────────────────────────────────────

export const offlineQueue = new OfflineQueueClass();

// تهيئة تلقائية عند الاستيراد (client-side فقط)
if (typeof window !== 'undefined') {
  offlineQueue.init().catch(console.error);
}

export default offlineQueue;
