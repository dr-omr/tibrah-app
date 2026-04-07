/**
 * CameraService — خدمة الكاميرا الناتفية
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * يُغلِّف Capacitor Camera Plugin مع تكاملات ذكية:
 * - تصوير الوصفات الطبية + OCR بـ Gemini
 * - قراءة QR codes للمنتجات الصيدلانية
 * - تحديث صورة الملف الشخصي
 * - fallback لـ file picker على الويب
 *
 * الاستخدام:
 *   const camera = useCameraService()
 *   const receipt = await camera.captureReceipt()
 *   const profilePic = await camera.captureProfilePhoto()
 */

import { bridge } from '@/lib/native/NativeBridge';

// ─── Types ───────────────────────────────────────────────────────

export interface CapturedPhoto {
  base64: string;        // Base64 string بدون data: prefix
  mimeType: 'image/jpeg' | 'image/png';
  webPath?: string;      // URL مؤقت للعرض في img src
  format: string;
}

export interface MedicalReceiptData {
  rawText: string;
  medications: Array<{
    name: string;
    dosage?: string;
    instructions?: string;
  }>;
  confidence: number; // 0-1
}

// ─── Camera Quality Presets ───────────────────────────────────────

const QUALITY_PRESETS = {
  profile: { quality: 85, width: 512, height: 512 },
  receipt: { quality: 90, width: 1200, height: 1600 },
  document: { quality: 95, width: 2048, height: 2048 },
  thumbnail: { quality: 60, width: 256, height: 256 },
} as const;

// ─── Core Capture Function ────────────────────────────────────────

async function capturePhoto(options: {
  quality?: number;
  allowEditing?: boolean;
  resultType?: 'base64' | 'uri';
  source?: 'camera' | 'photos';
  width?: number;
  height?: number;
}): Promise<CapturedPhoto | null> {
  if (!bridge.isNative) {
    // Web fallback: file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) { resolve(null); return; }

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          const mimeType = file.type as 'image/jpeg' | 'image/png';
          resolve({ base64, mimeType, webPath: result, format: 'jpeg' });
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }

  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');

    const photo = await Camera.getPhoto({
      quality: options.quality ?? 85,
      allowEditing: options.allowEditing ?? false,
      resultType: CameraResultType.Base64,
      source: options.source === 'photos' ? CameraSource.Photos : CameraSource.Camera,
      width: options.width,
      height: options.height,
      correctOrientation: true,
      saveToGallery: false,
    });

    if (!photo.base64String) return null;

    return {
      base64: photo.base64String,
      mimeType: `image/${photo.format}` as 'image/jpeg' | 'image/png',
      webPath: photo.webPath,
      format: photo.format || 'jpeg',
    };
  } catch (e: unknown) {
    // المستخدم ألغى — ليس خطأ حقيقياً
    if (e instanceof Error && e.message?.includes('cancelled')) return null;
    if (e instanceof Error && e.message?.includes('cancel')) return null;
    console.error('[CameraService] capture failed:', e);
    return null;
  }
}

// ─── Public Service Functions ─────────────────────────────────────

/**
 * تصوير وصفة طبية للتحليل بـ OCR
 */
export async function captureReceipt(): Promise<CapturedPhoto | null> {
  return capturePhoto({
    ...QUALITY_PRESETS.receipt,
    allowEditing: false,
    source: 'camera',
  });
}

/**
 * اختيار صورة من المعرض للوصفة
 */
export async function pickReceiptFromGallery(): Promise<CapturedPhoto | null> {
  return capturePhoto({
    ...QUALITY_PRESETS.receipt,
    source: 'photos',
  });
}

/**
 * تصوير صورة الملف الشخصي (مع التعديل)
 */
export async function captureProfilePhoto(): Promise<CapturedPhoto | null> {
  return capturePhoto({
    ...QUALITY_PRESETS.profile,
    allowEditing: true,
    source: 'camera',
  });
}

/**
 * اختيار صورة ملف شخصي من المعرض
 */
export async function pickProfileFromGallery(): Promise<CapturedPhoto | null> {
  return capturePhoto({
    ...QUALITY_PRESETS.profile,
    allowEditing: true,
    source: 'photos',
  });
}

/**
 * تصوير وثيقة عامة (نتائج تحاليل، تقارير)
 */
export async function captureDocument(): Promise<CapturedPhoto | null> {
  return capturePhoto({
    ...QUALITY_PRESETS.document,
    allowEditing: false,
    source: 'camera',
  });
}

/**
 * تحويل CapturedPhoto إلى data URL للعرض في img
 */
export function photoToDataUrl(photo: CapturedPhoto): string {
  return `data:${photo.mimeType};base64,${photo.base64}`;
}

/**
 * حساب حجم الصورة بالـ KB
 */
export function photoSizeKB(photo: CapturedPhoto): number {
  return Math.round((photo.base64.length * 0.75) / 1024);
}

// ─── React Hook ───────────────────────────────────────────────────

export function useCameraService() {
  return {
    captureReceipt,
    pickReceiptFromGallery,
    captureProfilePhoto,
    pickProfileFromGallery,
    captureDocument,
    photoToDataUrl,
    photoSizeKB,
    isAvailable: bridge.isNative || (typeof window !== 'undefined'),
  };
}

export default useCameraService;
