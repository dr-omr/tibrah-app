/**
 * NativeModal — Bottom Sheet ناتف بـ Snap Points
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * تجربة Sheet مطابقة لـ iOS native sheets:
 * - يجر من الأسفل
 * - Snap points: 40%, 75%, 95% أو مخصصة
 * - يُغلق بالسحب للأسفل بسرعة
 * - Haptic عند كل snap
 * - Backdrop blur + dimming
 * - يدعم LTR و RTL
 * 
 * الاستخدام:
 *   <NativeModal isOpen={open} onClose={() => setOpen(false)} snapPoints={[0.5, 0.9]}>
 *     <Content />
 *   </NativeModal>
 */

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  TouchEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { useNative } from '@/contexts/NativeContext';
import { haptic } from '@/lib/HapticFeedback';

// ─── Types ───────────────────────────────────────────────────────

interface NativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** نسب الارتفاع للـ snap points [0-1] — مثال: [0.5, 0.9] */
  snapPoints?: number[];
  /** الـ snap الابتدائي (index في snapPoints) */
  initialSnap?: number;
  /** عنوان الـ sheet (اختياري) */
  title?: string;
  children: ReactNode;
  /** إغلاق عند الضغط على الـ backdrop */
  closeOnBackdrop?: boolean;
  /** منع الإغلاق بالسحب */
  preventClose?: boolean;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────

export default function NativeModal({
  isOpen,
  onClose,
  snapPoints = [0.5, 0.85],
  initialSnap = 0,
  title,
  children,
  closeOnBackdrop = true,
  preventClose = false,
  className = '',
}: NativeModalProps) {
  const { safeAreaInsets, isIOS } = useNative();
  const [mounted, setMounted] = useState(false);
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // إعادة ضبط الـ snap عند فتح الـ modal
  useEffect(() => {
    if (isOpen) setCurrentSnap(initialSnap);
  }, [isOpen, initialSnap]);

  // منع scroll الـ body عند فتح الـ sheet
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const sortedSnaps = [...snapPoints].sort((a, b) => a - b);

  // ─── Pan Handlers ──────────────────────────────────────────────

  const handleDragEnd = useCallback(
    (_: unknown, { offset, velocity }: PanInfo) => {
      const draggedDown = offset.y > 0;
      const isFast = Math.abs(velocity.y) > 500;

      if (draggedDown && isFast && !preventClose) {
        // سحب سريع للأسفل = إغلاق
        haptic.trigger('medium');
        onClose();
        return;
      }

      // إيجاد أقرب snap point
      const currentY = offset.y;
      const currentHeight = sortedSnaps[currentSnap] * screenHeight;
      const targetHeight = currentHeight - currentY;
      const targetRatio = targetHeight / screenHeight;

      let closestIdx = 0;
      let closestDist = Infinity;

      sortedSnaps.forEach((snap, idx) => {
        const dist = Math.abs(snap - targetRatio);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = idx;
        }
      });

      // إذا كان المستخدم سحب تحت أدنى snap: أغلق
      if (targetRatio < sortedSnaps[0] * 0.5 && !preventClose) {
        haptic.trigger('light');
        onClose();
        return;
      }

      if (closestIdx !== currentSnap) {
        haptic.trigger('light');
      }
      setCurrentSnap(closestIdx);
    },
    [currentSnap, sortedSnaps, screenHeight, onClose, preventClose]
  );

  // ─── Height Calculation ────────────────────────────────────────

  const sheetHeight = sortedSnaps[currentSnap] * screenHeight;
  const bottomInset = safeAreaInsets.bottom;

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[1000]"
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop && !preventClose ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'نافذة'}
            className={`fixed bottom-0 left-0 right-0 z-[1001] flex flex-col ${className}`}
            style={{
              height: `${sheetHeight}px`,
              borderRadius: '20px 20px 0 0',
              background: 'rgba(254, 252, 245, 0.97)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.12), 0 -1px 0 rgba(255,255,255,0.8) inset',
              paddingBottom: `${bottomInset}px`,
            }}
            initial={{ y: '100%' }}
            animate={{
              y: 0,
              height: `${sheetHeight}px`,
            }}
            exit={{ y: '110%' }}
            transition={{
              type: 'spring',
              damping: 32,
              stiffness: 400,
              mass: 0.8,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: screenHeight * 0.9 }}
            dragElastic={{ top: 0.05, bottom: 0.3 }}
            onDragEnd={handleDragEnd}
            dragListener={true}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div
                className="w-9 h-1 rounded-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.18)' }}
                aria-hidden="true"
              />
            </div>

            {/* Title */}
            {title && (
              <div className="px-5 pb-3 flex-shrink-0 border-b border-black/[0.06]">
                <h2 className="text-base font-bold text-slate-800 text-right">{title}</h2>
              </div>
            )}

            {/* Content — قابل للـ scroll داخلياً */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{
                // منع drag الـ sheet أثناء scroll المحتوى
                touchAction: 'pan-y',
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Snap عناوين مساعدة ──────────────────────────────────────────

export const SheetSnapPoints = {
  half: [0.5],
  twoThirds: [0.65],
  large: [0.85],
  full: [0.95],
  halfAndFull: [0.5, 0.95],
  thirdAndFull: [0.4, 0.75, 0.95],
} as const;
