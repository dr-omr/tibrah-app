import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

// Types
export interface Notification {
    id: string;
    title: string;
    body: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    timestamp: number;
    action?: {
        label: string;
        href: string;
    };
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotification: (id: string) => void;
    clearAll: () => void;
    notify: (title: string, options?: { body?: string; type?: Notification['type']; action?: Notification['action'] }) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const STORAGE_KEY = 'tibrah_notifications';
const MAX_NOTIFICATIONS = 50;

// Provider Component
export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load notifications from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setNotifications(parsed);
                }
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }, []);

    // Save to localStorage whenever notifications change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        } catch (error) {
            console.error('Failed to save notifications:', error);
        }
    }, [notifications]);

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Add a new notification
    const addNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotification: Notification = {
            ...notif,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            isRead: false,
        };

        setNotifications(prev => {
            const updated = [newNotification, ...prev];
            // Keep only the latest MAX_NOTIFICATIONS
            return updated.slice(0, MAX_NOTIFICATIONS);
        });

        return newNotification.id;
    }, []);

    // Mark a single notification as read
    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, isRead: true }))
        );
    }, []);

    // Clear a single notification
    const clearNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Clear all notifications
    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // Easy notify function - also shows toast
    const notify = useCallback((
        title: string,
        options?: { body?: string; type?: Notification['type']; action?: Notification['action'] }
    ) => {
        const type = options?.type || 'info';
        const body = options?.body || '';

        // Add to notification list
        addNotification({ title, body, type, action: options?.action });

        // Show toast based on type
        const toastMessage = body ? `${title}: ${body}` : title;
        switch (type) {
            case 'success':
                toast.success(toastMessage);
                break;
            case 'error':
                toast.error(toastMessage);
                break;
            case 'warning':
                toast.warning(toastMessage);
                break;
            default:
                toast.info(toastMessage);
        }
    }, [addNotification]);

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        notify,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

// Hook to use notifications
export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

// Standalone notify function for use outside of React (e.g., in API calls)
// This only shows toast, doesn't add to notification list
export function notify(title: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    switch (type) {
        case 'success':
            toast.success(title);
            break;
        case 'error':
            toast.error(title);
            break;
        case 'warning':
            toast.warning(title);
            break;
        default:
            toast.info(title);
    }
}

export default NotificationContext;
