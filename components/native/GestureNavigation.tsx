/**
 * GestureNavigation — إيماءات التنقل الناتفية
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * يُضيف سلوك التمرير الجانبي للرجوع (مثل iOS Edge Swipe)
 * مع Haptic feedback ناتف فعلي.
 * 
 * يعمل فقط على الأجهرة الناتفية (iOS / Android).
 * على الويب: يمرر الأبناء مباشرةً بدون أي wrapper.
 *
 * الاستخدام:
 *   <GestureNavigation>
 *     <PageContent />
 *   </GestureNavigation>
 */

import React, {
  useRef,
  useState,
  useCallback,
  ReactNode,
  TouchEvent,
  CSSProperties,
} from 'react';
import { useRouter } from 'next/router';
import { useNative } from '@/contexts/NativeContext';
import { haptic } from '@/lib/HapticFeedback';

// ─── Types ───────────────────────────────────────────────────────

interface GestureNavigationProps {
  children: ReactNode;
  /** تعطيل Swipe Back في صفحات محددة (مثل الصفحة الرئيسية) */
  disableSwipeBack?: boolean;
  /** Callback مخصص بدل الـ router.back() */
  onSwipeBack?: () => void;
  className?: string;
  style?: CSSProperties;
}

// ─── Constants ───────────────────────────────────────────────────

const EDGE_ZONE = 28;       // منطقة الـ edge اليمين (RTL) بالبكسل
const TRIGGER_DISTANCE = 80; // المسافة المطلوبة لتشغيل الرجوع
const TRIGGER_VELOCITY = 0.4; // السرعة المطلوبة (px/ms)
const MAX_RESISTANCE = 120;  // أقصى مسافة للسحب مع مقاومة

// ─── Component ───────────────────────────────────────────────────

export default function GestureNavigation({
  children,
  disableSwipeBack = false,
  onSwipeBack,
  className = '',
  style,
}: GestureNavigationProps) {
  const router = useRouter();
  const { isNative, isIOS } = useNative();

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isEdgeSwipe = useRef(false);
  const hapticFired = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // على الويب: لا نُضيف أي منطق للإيماءات
  if (!isNative) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // ─── Touch Handlers ────────────────────────────────────────────

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (disableSwipeBack) return;

    const touch = e.touches[0];
    const screenWidth = window.innerWidth;

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    hapticFired.current = false;

    // في RTL: الـ Edge هو الجانب الأيمن (clientX قريبة من screenWidth)
    const fromRightEdge = screenWidth - touch.clientX;
    isEdgeSwipe.current = fromRightEdge <= EDGE_ZONE;
  }, [disableSwipeBack]);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!isEdgeSwipe.current || disableSwipeBack) return;

    const touch = e.touches[0];
    const deltaX = touchStartX.current - touch.clientX; // موجب = سحب لليسار (RTL = رجوع)
    const deltaY = Math.abs(touch.clientY - touchStartY.current);

    // تجاهل إذا كان الحركة رأسية أكثر من أفقية
    if (deltaY > Math.abs(deltaX) * 1.5) {
      isEdgeSwipe.current = false;
      return;
    }

    if (deltaX <= 0) return; // نتجاهل السحب للأمام

    // مقاومة تدريجية — كلما سحبت أبعد، كلما أصبح أصعب
    const resistance = 0.5;
    const damped = Math.min(MAX_RESISTANCE, deltaX * resistance);
    setDragX(damped);
    setIsDragging(true);

    // Haptic عند الوصول للـ threshold
    if (damped >= TRIGGER_DISTANCE && !hapticFired.current) {
      haptic.impact();
      hapticFired.current = true;
    }
  }, [disableSwipeBack]);

  const handleTouchEnd = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!isEdgeSwipe.current || !isDragging) {
      setDragX(0);
      setIsDragging(false);
      isEdgeSwipe.current = false;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touchStartX.current - touch.clientX;
    const deltaTime = Date.now() - touchStartTime.current;
    const velocity = Math.abs(deltaX) / deltaTime;

    const shouldGoBack =
      dragX >= TRIGGER_DISTANCE ||
      (velocity >= TRIGGER_VELOCITY && deltaX > 40);

    if (shouldGoBack) {
      haptic.trigger('medium');
      if (onSwipeBack) {
        onSwipeBack();
      } else {
        router.back();
      }
    }

    // Animation العودة
    setDragX(0);
    setIsDragging(false);
    isEdgeSwipe.current = false;
    hapticFired.current = false;
  }, [isDragging, dragX, router, onSwipeBack]);

  // ─── Visual Feedback ────────────────────────────────────────────

  // نُحوّل الـ dragX إلى opacity للـ indicator
  const indicatorOpacity = Math.min(dragX / TRIGGER_DISTANCE, 1);
  const indicatorScale = 0.5 + (dragX / TRIGGER_DISTANCE) * 0.5;
  const pageTranslate = isDragging ? -dragX * 0.15 : 0; // تحرك خفيف للصفحة

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        ...style,
        transform: `translateX(${pageTranslate}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: isDragging ? 'transform' : 'auto',
        touchAction: 'pan-y', // نسمح بالـ scroll الرأسي دائماً
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe Back Indicator — يظهر من الجانب الأيمن (RTL) */}
      {isDragging && dragX > 10 && (
        <div
          className="fixed right-0 top-1/2 -translate-y-1/2 z-[9999] pointer-events-none"
          style={{
            opacity: indicatorOpacity,
            transform: `translateY(-50%) scale(${indicatorScale})`,
            transition: 'opacity 0.1s ease',
          }}
          aria-hidden="true"
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full shadow-xl"
            style={{
              backgroundColor: 'rgba(45, 155, 131, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.3)',
            }}
          >
            {/* سهم للأمام (RTL: رجوع = سهم يمين) */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
