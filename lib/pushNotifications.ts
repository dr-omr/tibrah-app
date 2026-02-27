/**
 * Push Notifications Service for Tibrah Health App
 * Handles medication reminders, water tracking, and health notifications
 */

// Check if browser supports notifications
export const isNotificationSupported = (): boolean => {
    return 'Notification' in window && 'serviceWorker' in navigator;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!isNotificationSupported()) {
        console.warn('Notifications not supported');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
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
export const showNotification = (
    title: string,
    options?: NotificationOptions
): Notification | null => {
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
    // Note: vibrate is a valid Web API property but not always in TS types
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
};

// Delete reminder
export const deleteReminder = (id: string): void => {
    const reminders = getReminders().filter(r => r.id !== id);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
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
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6] // Every day
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

// Default water reminders (every 2 hours from 8am to 8pm)
export const getDefaultWaterReminders = (): Reminder[] => {
    const times = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    return times.map(time => createWaterReminder(time));
};

// Check and trigger due reminders
let reminderCheckInterval: NodeJS.Timeout | null = null;

export const startReminderChecker = (): void => {
    if (reminderCheckInterval) {
        clearInterval(reminderCheckInterval);
    }

    const checkReminders = () => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentDay = now.getDay();

        const reminders = getReminders();

        reminders.forEach(reminder => {
            if (
                reminder.enabled &&
                reminder.scheduledTime === currentTime &&
                reminder.daysOfWeek.includes(currentDay)
            ) {
                // Check if we haven't shown this reminder in the last minute
                const lastShownKey = `reminder_shown_${reminder.id}`;
                const lastShown = localStorage.getItem(lastShownKey);
                const oneMinuteAgo = Date.now() - 60000;

                if (!lastShown || parseInt(lastShown) < oneMinuteAgo) {
                    showNotification(reminder.title, {
                        body: reminder.body,
                        tag: reminder.id
                    });
                    localStorage.setItem(lastShownKey, Date.now().toString());
                }
            }
        });
    };

    // Check immediately
    checkReminders();

    // Then check every minute
    reminderCheckInterval = setInterval(checkReminders, REMINDER_CHECK_INTERVAL);
};

export const stopReminderChecker = (): void => {
    if (reminderCheckInterval) {
        clearInterval(reminderCheckInterval);
        reminderCheckInterval = null;
    }
};

// Initialize notifications and reminders
export const initializeNotifications = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();

    if (granted) {
        startReminderChecker();
        return true;
    }

    return false;
};

// Notification types with icons
export const NOTIFICATION_ICONS = {
    medication: '💊',
    water: '💧',
    sleep: '😴',
    general: '🔔',
    success: '✅',
    warning: '⚠️',
    health: '❤️'
};

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
    initializeNotifications,
    startReminderChecker,
    stopReminderChecker
};
