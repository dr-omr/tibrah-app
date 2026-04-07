/**
 * useShareService — خدمة المشاركة الناتفية
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * يستخدم Capacitor Share Plugin على الأجهزة الناتفية
 * ويرجع للـ Web Share API على المتصفح
 * ويستخدم Clipboard كـ fallback أخير
 *
 * الاستخدام:
 *   const { shareHealthReport, shareText, shareUrl } = useShareService()
 *   await shareHealthReport(userId)
 */

import { useCallback } from 'react';
import { bridge } from '@/lib/native/NativeBridge';
import { toast } from '@/components/notification-engine';
import { haptic } from '@/lib/HapticFeedback';

// ─── Types ───────────────────────────────────────────────────────

interface ShareOptions {
  title?: string;
  text: string;
  url?: string;
  dialogTitle?: string;
}

interface ShareService {
  /** مشاركة نص عادي */
  shareText: (options: ShareOptions) => Promise<boolean>;
  /** مشاركة رابط */
  shareUrl: (url: string, title?: string) => Promise<boolean>;
  /** مشاركة التقرير الصحي */
  shareHealthSummary: (summary: {
    name: string;
    metrics: Record<string, string | number>;
  }) => Promise<boolean>;
  /** نسخ للحافظة مع toast تأكيد */
  copyToClipboard: (text: string, label?: string) => Promise<boolean>;
  /** هل الـ Share API متاحة */
  isAvailable: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useShareService(): ShareService {
  const isAvailable = bridge.isNative || (typeof navigator !== 'undefined' && !!navigator.share);

  const shareText = useCallback(async (options: ShareOptions): Promise<boolean> => {
    haptic.trigger('light');
    try {
      const success = await bridge.share({
        title: options.title,
        text: options.text,
        url: options.url,
        dialogTitle: options.dialogTitle,
      });

      if (!success) {
        // Fallback: نسخ للحافظة
        await copyToClipboard(options.text, 'تم نسخ النص');
      }
      return true;
    } catch (e) {
      console.error('[ShareService]', e);
      return false;
    }
  }, []);

  const shareUrl = useCallback(async (url: string, title?: string): Promise<boolean> => {
    return shareText({
      title: title || 'طِبرَا',
      text: title ? `${title}\n${url}` : url,
      url,
      dialogTitle: 'مشاركة الرابط',
    });
  }, [shareText]);

  const shareHealthSummary = useCallback(async (summary: {
    name: string;
    metrics: Record<string, string | number>;
  }): Promise<boolean> => {
    const lines = [
      `📊 تقريري الصحي — طِبرَا`,
      `الاسم: ${summary.name}`,
      '',
      ...Object.entries(summary.metrics).map(
        ([key, val]) => `• ${key}: ${val}`
      ),
      '',
      `تم التوليد بتاريخ: ${new Date().toLocaleDateString('ar-SA')}`,
      `https://tibrah.com`,
    ];

    return shareText({
      title: 'تقريري الصحي - طِبرَا',
      text: lines.join('\n'),
      url: 'https://tibrah.com',
      dialogTitle: 'مشاركة التقرير الصحي',
    });
  }, [shareText]);

  const copyToClipboard = useCallback(async (text: string, label = 'تم النسخ'): Promise<boolean> => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Legacy fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      haptic.success();
      toast.success(label);
      return true;
    } catch {
      toast.error('تعذّر النسخ');
      return false;
    }
  }, []);

  return {
    shareText,
    shareUrl,
    shareHealthSummary,
    copyToClipboard,
    isAvailable,
  };
}

export default useShareService;
