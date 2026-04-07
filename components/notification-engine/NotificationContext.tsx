import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';

// ─── Types ───
export type NotificationCategory =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'system'
  | 'message'
  | 'booking'
  | 'payment'
  | 'clinical';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface EngineNotification {
  id: string;
  title: string;
  body?: string;
  type: NotificationCategory;
  priority: NotificationPriority;
  isRead: boolean;
  timestamp: number;
  action?: NotificationAction;
  pinned?: boolean;
  groupKey?: string;
}

export interface ToastOptions {
  body?: string;
  type?: NotificationCategory;
  priority?: NotificationPriority;
  duration?: number;       // ms, 0 = persistent
  action?: NotificationAction;
  pinned?: boolean;
  groupKey?: string;
  addToFeed?: boolean;     // default true
}

export interface ToastEvent {
  id: string;
  title: string;
  body?: string;
  type: NotificationCategory;
  priority: NotificationPriority;
  timestamp: number;
  duration: number;
  action?: NotificationAction;
}

// ─── Context ───
interface NotificationEngineContextType {
  notifications: EngineNotification[];
  unreadCount: number;
  addNotification: (title: string, options?: ToastOptions) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  activeToasts: ToastEvent[];
  dismissToast: (id: string) => void;
}

const NotificationEngineContext = createContext<NotificationEngineContextType | null>(null);

// ─── Constants ───
const STORAGE_KEY = 'tibrah_ne_v2';
const MAX_FEED = 200;
const MAX_TOASTS = 3;
const DEFAULT_DURATION: Record<NotificationPriority, number> = {
  low: 3500,
  normal: 5000,
  high: 7000,
  urgent: 0, // persistent
};
const DEDUP_WINDOW_MS = 2500;

// ─── Global event bus ───
type ToastListener = (event: ToastEvent, addToFeed: boolean) => void;
let listeners: ToastListener[] = [];

function emitToastEvent(event: ToastEvent, addToFeed: boolean) {
  listeners.forEach(fn => fn(event, addToFeed));
}

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `ne_${Date.now()}_${idCounter}_${Math.random().toString(36).substring(2, 7)}`;
}

// ─── Provider ───
export function NotificationEngineProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<EngineNotification[]>([]);
  const [activeToasts, setActiveToasts] = useState<ToastEvent[]>([]);
  const recentHashes = useRef<Map<string, number>>(new Map());

  // Hydrate from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setNotifications(parsed);
      }
    } catch { /* no-op */ }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch { /* no-op */ }
  }, [notifications]);

  // Listen to global toast emissions
  useEffect(() => {
    const handler: ToastListener = (event, addToFeed) => {
      // Push into toast stack
      setActiveToasts(prev => [event, ...prev].slice(0, MAX_TOASTS));

      if (!addToFeed) return;

      // Dedup check
      const hash = `${event.title}|${event.body || ''}`;
      const lastTime = recentHashes.current.get(hash);
      if (lastTime && Date.now() - lastTime < DEDUP_WINDOW_MS) return;
      recentHashes.current.set(hash, Date.now());

      // Clean up stale hashes every so often
      if (recentHashes.current.size > 100) {
        const now = Date.now();
        recentHashes.current.forEach((t, k) => {
          if (now - t > 10000) recentHashes.current.delete(k);
        });
      }

      const feedItem: EngineNotification = {
        id: event.id,
        title: event.title,
        body: event.body,
        type: event.type,
        priority: event.priority || 'normal',
        isRead: false,
        timestamp: event.timestamp,
        action: event.action,
        pinned: false,
      };

      setNotifications(prev => [feedItem, ...prev].slice(0, MAX_FEED));
    };

    listeners.push(handler);
    return () => {
      listeners = listeners.filter(fn => fn !== handler);
    };
  }, []);

  // Derived
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = useCallback((title: string, options?: ToastOptions): string => {
    const id = generateId();
    const type = options?.type || 'info';
    const priority = options?.priority || 'normal';
    const duration = options?.duration ?? DEFAULT_DURATION[priority];

    const event: ToastEvent = {
      id,
      title,
      body: options?.body,
      type,
      priority,
      timestamp: Date.now(),
      duration,
      action: options?.action,
    };

    const addToFeed = options?.addToFeed !== false;
    emitToastEvent(event, addToFeed);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications(prev => prev.filter(n => n.pinned));
    setActiveToasts([]);
  }, []);

  return (
    <NotificationEngineContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        activeToasts,
        dismissToast,
      }}
    >
      {children}
    </NotificationEngineContext.Provider>
  );
}

// ─── Hook ───
export function useNotifications() {
  const ctx = useContext(NotificationEngineContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationEngineProvider');
  return ctx;
}

// ─── Standalone `toast` API — drop-in replacement for `sonner` ───
function createToast(title: string, options?: ToastOptions): string {
  const id = generateId();
  const type = options?.type || 'info';
  const priority = options?.priority || 'normal';
  const duration = options?.duration ?? DEFAULT_DURATION[priority];

  emitToastEvent(
    { id, title, body: options?.body, type, priority, timestamp: Date.now(), duration, action: options?.action },
    options?.addToFeed !== false,
  );
  return id;
}

export const toast = Object.assign(
  (title: string, opts?: ToastOptions) => createToast(title, opts),
  {
    success:  (title: string, opts?: Omit<ToastOptions, 'type'>) => createToast(title, { ...opts, type: 'success' }),
    error:    (title: string, opts?: Omit<ToastOptions, 'type'>) => createToast(title, { ...opts, type: 'error' }),
    info:     (title: string, opts?: Omit<ToastOptions, 'type'>) => createToast(title, { ...opts, type: 'info' }),
    warning:  (title: string, opts?: Omit<ToastOptions, 'type'>) => createToast(title, { ...opts, type: 'warning' }),
    system:   (title: string, opts?: Omit<ToastOptions, 'type'>) => createToast(title, { ...opts, type: 'system' }),
    message:  (title: string, opts?: Omit<ToastOptions, 'type'>) => createToast(title, { ...opts, type: 'message' }),
    booking:  (title: string, opts?: Omit<ToastOptions, 'type'>) => createToast(title, { ...opts, type: 'booking' }),
    payment:  (title: string, opts?: Omit<ToastOptions, 'type'>) => createToast(title, { ...opts, type: 'payment' }),
    clinical: (title: string, opts?: Omit<ToastOptions, 'type'>) => createToast(title, { ...opts, type: 'clinical' }),
  },
);
