/**
 * Smart Notification Scheduler
 * Schedules health reminders using the Notifications API
 * Reminders: water, medication, sleep, fasting, exercise, daily challenge
 */

export interface ScheduledReminder {
    id: string;
    type: 'water' | 'medication' | 'sleep' | 'fasting' | 'exercise' | 'challenge' | 'custom';
    title: string;
    body: string;
    icon: string;
    time: string; // HH:MM format
    days: number[]; // 0=Sun, 1=Mon, ... 6=Sat (empty = every day)
    enabled: boolean;
    sound?: boolean;
}

const STORAGE_KEY = 'tibrah_reminders';
const DEFAULT_ICON = '/icons/icon-192x192.png';

// Default health reminders
const DEFAULT_REMINDERS: ScheduledReminder[] = [
    {
        id: 'water-morning', type: 'water',
        title: '💧 وقت شرب الماء', body: 'ابدأ يومك بكوبين ماء على الريق لتنشيط جسمك',
        icon: DEFAULT_ICON, time: '07:00', days: [], enabled: true
    },
    {
        id: 'water-noon', type: 'water',
        title: '💧 تذكير الماء', body: 'اشرب كوب ماء — حافظ على ترطيب جسمك',
        icon: DEFAULT_ICON, time: '12:00', days: [], enabled: true
    },
    {
        id: 'water-afternoon', type: 'water',
        title: '💧 لا تنسَ الماء', body: 'كوب ماء الآن يحسن تركيزك وطاقتك',
        icon: DEFAULT_ICON, time: '16:00', days: [], enabled: true
    },
    {
        id: 'challenge-daily', type: 'challenge',
        title: '🔥 تحديات اليوم جاهزة!', body: 'أكمل تحدياتك الصحية اليومية واكسب نقاط',
        icon: DEFAULT_ICON, time: '08:00', days: [], enabled: true
    },
    {
        id: 'sleep-prepare', type: 'sleep',
        title: '🌙 وقت التحضير للنوم', body: 'ابتعد عن الشاشات وجهز نفسك لنوم مريح',
        icon: DEFAULT_ICON, time: '22:00', days: [], enabled: true
    },
    {
        id: 'exercise-remind', type: 'exercise',
        title: '💪 وقت الحركة!', body: '15 دقيقة رياضة تصنع فرقاً كبيراً في صحتك',
        icon: DEFAULT_ICON, time: '17:00', days: [0, 1, 2, 3, 4], enabled: false
    },
];

/**
 * Load saved reminders or return defaults
 */
export function getReminders(): ScheduledReminder[] {
    if (typeof window === 'undefined') return DEFAULT_REMINDERS;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch { }
    return DEFAULT_REMINDERS;
}

/**
 * Save reminders to storage
 */
export function saveReminders(reminders: ScheduledReminder[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

/**
 * Toggle a reminder on/off
 */
export function toggleReminder(id: string): ScheduledReminder[] {
    const reminders = getReminders();
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
        reminder.enabled = !reminder.enabled;
        saveReminders(reminders);
    }
    return reminders;
}

/**
 * Update reminder time
 */
export function updateReminderTime(id: string, time: string): ScheduledReminder[] {
    const reminders = getReminders();
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
        reminder.time = time;
        saveReminders(reminders);
    }
    return reminders;
}

/**
 * Add a custom reminder
 */
export function addCustomReminder(title: string, body: string, time: string, type: ScheduledReminder['type'] = 'custom'): ScheduledReminder[] {
    const reminders = getReminders();
    reminders.push({
        id: `custom_${Date.now()}`,
        type,
        title,
        body,
        icon: DEFAULT_ICON,
        time,
        days: [],
        enabled: true,
    });
    saveReminders(reminders);
    return reminders;
}

/**
 * Delete a reminder
 */
export function deleteReminder(id: string): ScheduledReminder[] {
    const reminders = getReminders().filter(r => r.id !== id);
    saveReminders(reminders);
    return reminders;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
}

/**
 * Send a notification immediately
 */
export function sendNotification(title: string, body: string, icon?: string): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
        const notification = new Notification(title, {
            body,
            icon: icon || DEFAULT_ICON,
            badge: DEFAULT_ICON,
            dir: 'rtl',
            lang: 'ar',
            tag: `tibrah-${Date.now()}`,
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        // Auto-close after 8 seconds
        setTimeout(() => notification.close(), 8000);
    } catch { }
}

// Active interval references
let checkIntervalId: ReturnType<typeof setInterval> | null = null;
const firedToday = new Set<string>();

/**
 * Start the reminder checker (runs every minute)
 */
export function startReminderChecker(): void {
    if (typeof window === 'undefined') return;
    if (checkIntervalId) return; // Already running

    // Reset fired reminders at midnight
    const resetAtMidnight = () => {
        const now = new Date();
        const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
        setTimeout(() => {
            firedToday.clear();
            resetAtMidnight();
        }, msUntilMidnight);
    };
    resetAtMidnight();

    // Check every 60 seconds
    checkIntervalId = setInterval(() => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentDay = now.getDay();

        const reminders = getReminders();
        for (const reminder of reminders) {
            if (!reminder.enabled) continue;
            if (firedToday.has(reminder.id)) continue;
            if (reminder.time !== currentTime) continue;
            if (reminder.days.length > 0 && !reminder.days.includes(currentDay)) continue;

            // Fire this reminder
            sendNotification(reminder.title, reminder.body, reminder.icon);
            firedToday.add(reminder.id);
        }
    }, 60 * 1000);
}

/**
 * Stop the reminder checker
 */
export function stopReminderChecker(): void {
    if (checkIntervalId) {
        clearInterval(checkIntervalId);
        checkIntervalId = null;
    }
}
