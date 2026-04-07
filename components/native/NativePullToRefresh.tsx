/**
 * NativePullToRefresh — مكوّن السحب للتحديث الناتفي
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * تجربة Pull-to-Refresh مطابقة للتطبيقات الناتفية:
 * - Haptic عند الوصول للـ threshold
 * - Animation دائرية تدور مع السحب ثم تستمر عند التحديث
 * - Overscroll bounce طبيعي
 * - يعمل مع touch و mouse (للـ web)
 * 
 * الاستخدام:
 *   <NativePullToRefresh onRefresh={async () => { await fetchData() }}>
 *     <PageContent />
 *   </NativePullToRefresh>
 */

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  CSSProperties,
} from 'react';
import { useNative } from '@/contexts/NativeContext';
import { haptic } from '@/lib/HapticFeedback';

// ─── Types ───────────────────────────────────────────────────────

interface NativePullToRefreshProps {
  /** دالة async تُنفَّذ عند التحديث */
  onRefresh: () => Promise<void>;
  /** المسافة اللازمة للتفعيل بالبكسل */
  threshold?: number;
  /** أقصى مسافة للسحب (مع مقاومة) */
  maxPull?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** لون المؤشر */
  color?: string;
  /** تعطيل المكوّن */
  disabled?: boolean;
}

// ─── SVG Spinner ─────────────────────────────────────────────────

function RefreshSpinner({
  progress,
  isRefreshing,
  color = '#2D9B83',
}: {
  progress: number;   // 0-1 أثناء السحب
  isRefreshing: boolean;
  color?: string;
}) {
  const size = 36;
  const strokeWidth = 2.8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // أثناء السحب: نعرض القوس بنسبة progress
  // أثناء التحديث: دوران كامل لا نهائي
  const strokeDashoffset = isRefreshing
    ? 0
    : circumference * (1 - progress * 0.75);

  const scale = 0.5 + progress * 0.5;
  const opacity = Math.max(0, progress * 1.5 - 0.2);

  return (
    <div
      className="flex items-center justify-center"
      style={{
        transform: `scale(${scale})`,
        opacity,
        transition: isRefreshing
          ? 'opacity 0.2s ease'
          : 'none',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          animation: isRefreshing ? 'ptr-spin 0.8s linear infinite' : undefined,
          transform: `rotate(${progress * 360 - 90}deg)`,
          transition: isRefreshing ? 'none' : 'transform 0.05s ease',
        }}
      >
        {/* الحلقة الخلفية */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={0.15}
        />
        {/* الحلقة الأمامية */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: isRefreshing ? 'none' : 'stroke-dashoffset 0.05s ease',
          }}
        />
      </svg>

      <style>{`
        @keyframes ptr-spin {
          from { transform: rotate(-90deg); }
          to   { transform: rotate(270deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export default function NativePullToRefresh({
  onRefresh,
  threshold = 72,
  maxPull = 110,
  children,
  className = '',
  style,
  color = '#2D9B83',
  disabled = false,
}: NativePullToRefreshProps) {
  const { isNative } = useNative();

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const hapticFired = useRef(false);

  // ─── Touch Handlers ──────────────────────────────────────────

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const el = containerRef.current;
    if (!el || disabled || isRefreshing) return;

    // فقط إذا كنا في أعلى الصفحة
    const scrollTop = el.scrollTop || document.documentElement.scrollTop;
    if (scrollTop > 2) return;

    startY.current = e.touches[0].clientY;
    isPulling.current = true;
    hapticFired.current = false;
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || disabled || isRefreshing) return;

    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY <= 0) {
      setPullDistance(0);
      return;
    }

    // مقاومة تدريجية — logarithmic لشعور طبيعي
    const resistance = 0.45;
    const damped = Math.min(maxPull, deltaY * resistance);
    setPullDistance(damped);

    // Haptic عند الوصول للـ threshold
    if (damped >= threshold && !hapticFired.current) {
      haptic.impact();
      hapticFired.current = true;
      setIsTriggered(true);
    } else if (damped < threshold) {
      setIsTriggered(false);
    }
  }, [disabled, isRefreshing, threshold, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold); // نُثبت الـ indicator أثناء التحديث
      haptic.success();

      try {
        await onRefresh();
      } finally {
        // animation جميلة للإخفاء
        setIsRefreshing(false);
        setIsTriggered(false);
        setTimeout(() => setPullDistance(0), 150);
      }
    } else {
      // عودة سلسة
      setPullDistance(0);
      setIsTriggered(false);
    }

    hapticFired.current = false;
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  // ─── Event Listeners ─────────────────────────────────────────

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // نستخدم passive:false فقط لـ touchmove لمنع scroll أثناء السحب
    el.addEventListener('touchstart', handleTouchStart as unknown as EventListener, { passive: true });
    el.addEventListener('touchmove', handleTouchMove as unknown as EventListener, { passive: true });
    el.addEventListener('touchend', handleTouchEnd as unknown as EventListener);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart as unknown as EventListener);
      el.removeEventListener('touchmove', handleTouchMove as unknown as EventListener);
      el.removeEventListener('touchend', handleTouchEnd as unknown as EventListener);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // ─── Render ──────────────────────────────────────────────────

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto overscroll-contain ${className}`}
      style={{
        ...style,
        // Safe scroll للموبايل
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Indicator Container — يظهر عند السحب */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center overflow-hidden z-10 pointer-events-none"
        style={{
          height: `${pullDistance}px`,
          transition: isRefreshing || (!isPulling.current && pullDistance === 0)
            ? 'height 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            : 'none',
        }}
        aria-hidden="true"
      >
        <div
          className="flex flex-col items-center justify-end pb-2 gap-1"
          style={{ height: '100%' }}
        >
          {/* مؤشر الجاهزية */}
          {isTriggered && !isRefreshing && (
            <span
              className="text-xs font-medium"
              style={{ color, opacity: progress }}
            >
              اترك للتحديث
            </span>
          )}

          {/* الـ Spinner */}
          <div
            className="rounded-full shadow-md flex items-center justify-center"
            style={{
              width: 42,
              height: 42,
              backgroundColor: 'rgba(254, 252, 245, 0.95)',
              backdropFilter: 'blur(8px)',
              boxShadow: isTriggered
                ? `0 0 0 2px ${color}33, 0 4px 16px rgba(0,0,0,0.1)`
                : '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'box-shadow 0.2s ease',
            }}
          >
            <RefreshSpinner
              progress={progress}
              isRefreshing={isRefreshing}
              color={color}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing || (!isPulling.current && pullDistance === 0)
            ? 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            : 'none',
          willChange: pullDistance > 0 ? 'transform' : 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}
