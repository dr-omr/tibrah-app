import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNotifications, ToastEvent, NotificationCategory } from './NotificationContext';
import styles from './NotificationSystem.module.css';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Settings,
  MessageCircle,
  Calendar,
  CreditCard,
  Stethoscope,
  X,
} from 'lucide-react';

const ICON_MAP: Record<NotificationCategory, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  system: Settings,
  message: MessageCircle,
  booking: Calendar,
  payment: CreditCard,
  clinical: Stethoscope,
};

const TYPE_CLASS: Record<NotificationCategory, string> = {
  info: styles.toastInfo,
  success: styles.toastSuccess,
  warning: styles.toastWarning,
  error: styles.toastError,
  system: styles.toastSystem,
  message: styles.toastMessage,
  booking: styles.toastBooking,
  payment: styles.toastPayment,
  clinical: styles.toastClinical,
};

// ─── Staggered word-by-word reveal ───
function WordReveal({ text, baseDelay }: { text: string; baseDelay: number }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span
          key={`${word}-${i}`}
          className={styles.word}
          style={{ animationDelay: `${baseDelay + i * 35}ms` }}
        >
          {word}{' '}
        </span>
      ))}
    </>
  );
}

// ─── Single Toast ───
function NotificationToast({ toast: t }: { toast: ToastEvent }) {
  const { dismissToast } = useNotifications();
  const [isClosing, setIsClosing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeEnded, setSwipeEnded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const remainingRef = useRef(t.duration || 5000);
  const startTimeRef = useRef(Date.now());
  const touchStartRef = useRef<number | null>(null);

  const close = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => dismissToast(t.id), 280);
  }, [isClosing, dismissToast, t.id]);

  // Auto-dismiss timer
  const startTimer = useCallback(() => {
    if (t.duration === 0) return; // persistent
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(close, remainingRef.current);
  }, [t.duration, close]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      remainingRef.current -= Date.now() - startTimeRef.current;
      if (remainingRef.current < 0) remainingRef.current = 0;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [startTimer]);

  // ─── Mouse hover pause ───
  const handleMouseEnter = () => {
    setIsPaused(true);
    pauseTimer();
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimer();
  };

  // ─── Touch swipe to dismiss ───
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    setIsSwiping(true);
    pauseTimer();
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const dx = e.touches[0].clientX - touchStartRef.current;
    if (Math.abs(dx) > 4) setSwipeX(dx);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (Math.abs(swipeX) > 80) {
      setSwipeEnded(true);
      setTimeout(close, 280);
    } else {
      setSwipeX(0);
      setIsPaused(false);
      startTimer();
    }
    touchStartRef.current = null;
  };

  // ─── Keyboard ───
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Delete') close();
  };

  const Icon = ICON_MAP[t.type] || Info;
  const typeClass = TYPE_CLASS[t.type] || '';
  const durationMs = t.duration || 5000;

  return (
    <div
      className={`${styles.toast} ${typeClass}`}
      role="alert"
      aria-live={t.priority === 'urgent' ? 'assertive' : 'polite'}
      aria-atomic="true"
      tabIndex={0}
      data-closing={isClosing || undefined}
      data-paused={isPaused || undefined}
      data-swiping={isSwiping || undefined}
      data-swipe-cancel={!isSwiping && swipeX === 0 && !swipeEnded || undefined}
      data-swipe-end={swipeEnded || undefined}
      style={{
        ...(isSwiping ? { transform: `translateX(${swipeX}px)` } : {}),
        '--ne-toast-duration': `${durationMs}ms`,
        '--ne-progress-state': isPaused ? 'paused' : 'running',
      } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.toastIcon}>
        <Icon size={18} strokeWidth={2.2} />
      </div>

      <div className={styles.toastContent}>
        <h4 className={styles.toastTitle}>{t.title}</h4>
        {t.body && (
          <p className={styles.toastBody}>
            <WordReveal text={t.body} baseDelay={180} />
          </p>
        )}
        {t.action && (
          t.action.href ? (
            <a href={t.action.href} className={styles.toastAction}>
              {t.action.label}
            </a>
          ) : (
            <button className={styles.toastAction} onClick={t.action.onClick}>
              {t.action.label}
            </button>
          )
        )}
      </div>

      <button
        className={styles.toastClose}
        onClick={close}
        aria-label="إغلاق الإشعار"
      >
        <X size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Toast Provider (renders the region) ───
export function NotificationToastProvider() {
  const { activeToasts } = useNotifications();

  return (
    <div className={`${styles.engine} ${styles.toastRegion}`} aria-label="الإشعارات">
      {activeToasts.map(t => (
        <NotificationToast key={t.id} toast={t} />
      ))}
    </div>
  );
}
