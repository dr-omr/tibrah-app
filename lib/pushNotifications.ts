/**
 * Push Notifications Service for Tibrah Health App
 * Handles medication reminders, water tracking, and health notifications
 * Upgraded with Native FCM/APNs dynamic syncing capabilities.
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { db } from './db';

// Check if browser supports notifications
export const isNotificationSupported = (): boolean => {
    if (Capacitor.isNativePlatform()) return true;
    return 'Notification' in window && 'serviceWorker' in navigator;
};

// Request notification permission & Register for FCM/APNs       
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (Capacitor.isNativePlatform()) {
        try {
            // 1. Request local notification permissions
            const { display } = await LocalNotifications.requestPermissions();

            // 2. Request push notification permissions
            let pushGranted = false;
            try {
                const pushStatus = await PushNotifications.requestPermissions();
                pushGranted = pushStatus.receive === 'granted';  

                if (pushGranted) {
                    // Register with Apple / Google to receive push via APNS/FCM
                    await PushNotifications.register();
                }
            } catch (e) {
                console.warn('Push Notifications registration skipped:', e);
            }

            return display === 'granted' || pushGranted;
        } catch (error) {
            console.error('Error requesting native notification permission:', error);
            return false;
        }
    }

    if (!isNotificationSupported()) {
        console.warn('Notifications not supported');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error requesting web notification permission:', error);
        return false;
    }
};

// Check current permission status
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
    if (!isNotificationSupported()) {
        return 'unsupported';
    }
    return Notification.permission;
};

// Show a notification
export const showNotification = async (
    title: string,
    options?: NotificationOptions
): Promise<Notification | null> => {
    if (Capacitor.isNativePlatform()) {
        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: title,
                        body: options?.body || '',
                        id: Math.floor(Math.random() * 1000000), 
                        schedule: { at: new Date(Date.now() + 1000) }, 
                        sound: undefined,
                        attachments: undefined,
                        actionTypeId: '',
                        extra: null
                    }
                ]
            });
            return null;
        } catch (error) {
            console.error("Native notification failed:", error); 
            return null;
        }
    }

    if (!isNotificationSupported() || Notification.permission !== 'granted') {
        return null;
    }

    const defaultOptions: NotificationOptions = {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        dir: 'rtl',
        lang: 'ar',
        tag: 'tibrah-notification',
        renotify: true,
        ...options
    } as any;
    (defaultOptions as any).vibrate = [200, 100, 200];

    return new Notification(title, defaultOptions);
};

// Schedule a reminder (uses localStorage for persistence)       
interface Reminder {
    id: string;
    title: string;
    body: string;
    scheduledTime: string; // HH:mm format
    type: 'medication' | 'water' | 'sleep' | 'general';
    enabled: boolean;
    daysOfWeek: number[]; // 0-6, Sunday = 0
}

const REMINDERS_KEY = 'tibrah_reminders';
const REMINDER_CHECK_INTERVAL = 60000; // Check every minute

// Get all reminders
export const getReminders = (): Reminder[] => {
    try {
        const stored = localStorage.getItem(REMINDERS_KEY);      
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Save reminder
export const saveReminder = (reminder: Reminder): void => {      
    const reminders = getReminders();
    const existingIndex = reminders.findIndex(r => r.id === reminder.id);

    if (existingIndex >= 0) {
        reminders[existingIndex] = reminder;
    } else {
        reminders.push(reminder);
    }

    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    if (Capacitor.isNativePlatform()) {
        syncNativeNotifications();
    }
};

// Delete reminder
export const deleteReminder = (id: string): void => {
    const reminders = getReminders().filter(r => r.id !== id);   
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    if (Capacitor.isNativePlatform()) {
        syncNativeNotifications();
    }
};

// Create medication reminder
export const createMedicationReminder = (
    medicationName: string,
    time: string,
    dosage: string
): Reminder => {
    return {
        id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `💊 وقت الدواء`,
        body: `${medicationName} - ${dosage}`,
        scheduledTime: time,
        type: 'medication',
        enabled: true,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6] 
    };
};

// Create water reminder
export const createWaterReminder = (time: string): Reminder => { 
    return {
        id: `water_${time.replace(':', '')}`,
        title: `💧 تذكير بشرب الماء`,
        body: 'حان وقت شرب كوب ماء للحفاظ على ترطيب جسمك',       
        scheduledTime: time,
        type: 'water',
        enabled: true,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
    };
};

// Create sleep reminder
export const createSleepReminder = (time: string): Reminder => { 
    return {
        id: `sleep_${time.replace(':', '')}`,
        title: `😴 وقت النوم`,
        body: 'استعد للنوم للحصول على راحة كافية',
        scheduledTime: time,
        type: 'sleep',
        enabled: true,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
    };
};

// Default water reminders      
export const getDefaultWaterReminders = (): Reminder[] => {      
    const times = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    return times.map(time => createWaterReminder(time));
};

// Check and trigger due reminders (Web Fallback)
let reminderCheckInterval: NodeJS.Timeout | null = null;

export const startReminderChecker = (): void => {
    if (Capacitor.isNativePlatform()) {
        syncNativeNotifications();
        return; 
    }

    if (reminderCheckInterval) {
        clearInterval(reminderCheckInterval);
    }

    const checkReminders = async () => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;      
        const currentDay = now.getDay();

        const reminders = getReminders();

        for (const reminder of reminders) {
            if (
                reminder.enabled &&
                reminder.scheduledTime === currentTime &&        
                reminder.daysOfWeek.includes(currentDay)
            ) {
                const lastShownKey = `reminder_shown_${reminder.id}`;
                const lastShown = localStorage.getItem(lastShownKey);
                const oneMinuteAgo = Date.now() - 60000;

                if (!lastShown || parseInt(lastShown) < oneMinuteAgo) {
                    await showNotification(reminder.title, {     
                        body: reminder.body,
                        tag: reminder.id
                    });
                    localStorage.setItem(lastShownKey, Date.now().toString());
                }
            }
        }
    };

    checkReminders();
    reminderCheckInterval = setInterval(checkReminders, REMINDER_CHECK_INTERVAL);
};

export const stopReminderChecker = (): void => {
    if (reminderCheckInterval) {
        clearInterval(reminderCheckInterval);
        reminderCheckInterval = null;
    }
};

// Listen for FCM push notifications
export const initializePushListeners = (userId?: string) => {
    if (!Capacitor.isNativePlatform()) return;

    PushNotifications.addListener('registration', async (token: Token) => {
        console.log('[PushNotifications] Push registration success, token: ' + token.value);
        try {
            localStorage.setItem('fcm_token', token.value);
            if (userId) {
                await db.entities.User.update(userId, { 
                    fcmToken: token.value 
                });
            }
        } catch (e) {
            console.error('[PushNotifications] Error handling FCM token', e);        
        }
    });

    PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotificationSchema) => {
            console.log('Push received: ' + JSON.stringify(notification));
        },
    );

    PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (action: ActionPerformed) => {
            console.log('Push action performed: ' + JSON.stringify(action.notification));
            const data = action.notification.data;
            if (data && data.deepLink) {
                window.dispatchEvent(new CustomEvent('tibrah_deeplink', { detail: data.deepLink }));
            }
        },
    );
};

// Initialize notifications and reminders
export const initializeNotifications = async (userId?: string): Promise<boolean> => {
    const granted = await requestNotificationPermission();       

    if (granted) {
        if (Capacitor.isNativePlatform()) {
            await syncNativeNotifications();
            initializePushListeners(userId);
        } else {
            startReminderChecker();
        }
        return true;
    }

    return false;
};

export const NOTIFICATION_ICONS = {
    medication: '💊',
    water: '💧',
    sleep: '😴',
    general: '🔔',
    success: '✅',
    warning: '⚠️',
    health: '❤️'
};

const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

export const syncNativeNotifications = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return;

    try {
        const pending = await LocalNotifications.getPending();   
        if (pending.notifications.length > 0) {
            await LocalNotifications.cancel(pending);
        }

        const reminders = getReminders().filter(r => r.enabled); 
        if (reminders.length === 0) return;

        const notificationsList: any[] = [];

        reminders.forEach((r) => {
            const [hourStr, minStr] = r.scheduledTime.split(':');
            const hour = parseInt(hourStr, 10);
            const minute = parseInt(minStr, 10);

            if (r.daysOfWeek.length === 7) {
                notificationsList.push({
                    title: r.title,
                    body: r.body,
                    id: hashCode(r.id),
                    schedule: { on: { hour, minute }, repeats: true },
                    smallIcon: 'ic_stat_icon_config'
                });
            } else {
                r.daysOfWeek.forEach((day: number) => {
                    const weekday = day === 0 ? 1 : day + 1; // 1=Sunday
                    notificationsList.push({
                        title: r.title,
                        body: r.body,
                        id: hashCode(`${r.id}_${day}`),
                        schedule: { on: { weekday, hour, minute }, repeats: true },
                        smallIcon: 'ic_stat_icon_config'
                    });
                });
            }
        });

        if (notificationsList.length > 0) {
             await LocalNotifications.schedule({ notifications: notificationsList });
        }
    } catch (error) {
        console.error("Failed to sync native notifications", error);
    }
};

export const registerForPushNotifications = async (userId: string) => {
    return await initializeNotifications(userId);
}

export default {
    isNotificationSupported,
    requestNotificationPermission,
    getNotificationPermission,
    showNotification,
    getReminders,
    saveReminder,
    deleteReminder,
    createMedicationReminder,
    createWaterReminder,
    createSleepReminder,
    getDefaultWaterReminders,
    initializeNotifications,
    startReminderChecker,
    stopReminderChecker,
    syncNativeNotifications,
    registerForPushNotifications,
    NOTIFICATION_ICONS
};
