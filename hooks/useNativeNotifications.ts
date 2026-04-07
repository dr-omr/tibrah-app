/**
 * useNativeNotifications — جدولة إشعارات ذكية بـ Capacitor
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * يُجدول إشعارات محلية للموبايل باستخدام Local Notifications:
 * - إشعارات الدواء — دقيقة على الوقت المحدد
 * - تذكير الماء — كل ساعتين (يتوقف ليلاً 10م-7ص)
 * - موعد الطبيب — 24h + 1h قبل
 * - Streak reminder — إذا لم يسجل قبل 8م
 * 
 * على الويب: يستخدم Web Notifications API كـ fallback
 *
 * الاستخدام:
 *   const { scheduleMedication, scheduleWaterReminders, cancelAll } = useNativeNotifications()
 */

import { useCallback } from 'react';
import { bridge } from '@/lib/native/NativeBridge';

// ─── Types ───────────────────────────────────────────────────────

export interface MedicationSchedule {
  id: string;
  medicationName: string;
  dosage: string;
  times: string[]; // ['08:00', '14:00', '20:00']
  daysOfWeek?: number[]; // 1=Sun, 2=Mon, ... 7=Sat (كل الأيام إذا فارغ)
}

export interface AppointmentReminder {
  id: string;
  doctorName: string;
  appointmentDate: Date;
}

// ─── Notification IDs ────────────────────────────────────────────

const BASE_IDS = {
  medication: 1000,
  water: 2000,
  appointment: 3000,
  streak: 4000,
};

// ─── Hook ─────────────────────────────────────────────────────────

export function useNativeNotifications() {

  // ─── طلب الإذن ──────────────────────────────────────────────

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!bridge.isNative) {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
      return false;
    }

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch {
      return false;
    }
  }, []);

  // ─── جدولة إشعارات الدواء ───────────────────────────────────

  const scheduleMedication = useCallback(async (schedule: MedicationSchedule): Promise<void> => {
    if (!bridge.isNative) return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      // إلغاء الإشعارات القديمة لهذا الدواء أولاً
      const oldIds = schedule.times.map((_, i) => ({
        id: BASE_IDS.medication + parseInt(schedule.id) * 10 + i,
      }));
      await LocalNotifications.cancel({ notifications: oldIds }).catch(() => {});

      // إنشاء إشعار لكل وقت
      const notifications = schedule.times.map((time, i) => {
        const [hour, minute] = time.split(':').map(Number);
        const notifDate = new Date();
        notifDate.setHours(hour, minute, 0, 0);

        // إذا فات الوقت اليوم، جدول لليوم التالي
        if (notifDate <= new Date()) {
          notifDate.setDate(notifDate.getDate() + 1);
        }

        return {
          id: BASE_IDS.medication + parseInt(schedule.id) * 10 + i,
          title: `💊 وقت دوائك`,
          body: `${schedule.medicationName} — ${schedule.dosage}`,
          schedule: {
            at: notifDate,
            repeats: true,
            every: 'day' as const,
          },
          smallIcon: 'ic_stat_icon_tibrah',
          iconColor: '#2D9B83',
          sound: 'notification.wav',
          extra: {
            type: 'medication',
            medicationId: schedule.id,
          },
        };
      });

      await LocalNotifications.schedule({ notifications });
    } catch (e) {
      console.error('[NativeNotifications] scheduleMedication failed:', e);
    }
  }, []);

  // ─── جدولة تذكيرات الماء ─────────────────────────────────────

  const scheduleWaterReminders = useCallback(async (): Promise<void> => {
    if (!bridge.isNative) return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      // إلغاء القديمة
      const oldIds = Array.from({ length: 8 }, (_, i) => ({ id: BASE_IDS.water + i }));
      await LocalNotifications.cancel({ notifications: oldIds }).catch(() => {});

      // كل ساعتين من 7ص حتى 9م = 8 إشعارات
      const waterHours = [7, 9, 11, 13, 15, 17, 19, 21];
      const messages = [
        'اشرب كوب ماء الآن 💧',
        'جسمك يحتاج ترطيباً 🌊',
        'كوب ماء = صحة أفضل 💙',
        'لا تنسَ حصتك اليومية من الماء 💧',
      ];

      const notifications = waterHours.map((hour, i) => {
        const notifDate = new Date();
        notifDate.setHours(hour, 0, 0, 0);
        if (notifDate <= new Date()) notifDate.setDate(notifDate.getDate() + 1);

        return {
          id: BASE_IDS.water + i,
          title: '💧 تذكير الترطيب',
          body: messages[i % messages.length],
          schedule: {
            at: notifDate,
            repeats: true,
            every: 'day' as const,
          },
          smallIcon: 'ic_stat_icon_tibrah',
          iconColor: '#2D9B83',
          extra: { type: 'water' },
        };
      });

      await LocalNotifications.schedule({ notifications });
    } catch (e) {
      console.error('[NativeNotifications] scheduleWaterReminders failed:', e);
    }
  }, []);

  // ─── جدولة تذكير موعد الطبيب ────────────────────────────────

  const scheduleAppointmentReminder = useCallback(async (appt: AppointmentReminder): Promise<void> => {
    if (!bridge.isNative) return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      const apptId = parseInt(appt.id.replace(/\D/g, '').slice(0, 4) || '1');
      const notifications = [];

      // 24 ساعة قبل
      const dayBefore = new Date(appt.appointmentDate);
      dayBefore.setHours(dayBefore.getHours() - 24);

      if (dayBefore > new Date()) {
        notifications.push({
          id: BASE_IDS.appointment + apptId * 2,
          title: '📅 موعدك غداً',
          body: `موعدك مع ${appt.doctorName} غداً في ${appt.appointmentDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`,
          schedule: { at: dayBefore },
          smallIcon: 'ic_stat_icon_tibrah',
          iconColor: '#2D9B83',
          extra: { type: 'appointment', appointmentId: appt.id },
        });
      }

      // ساعة قبل
      const hourBefore = new Date(appt.appointmentDate);
      hourBefore.setHours(hourBefore.getHours() - 1);

      if (hourBefore > new Date()) {
        notifications.push({
          id: BASE_IDS.appointment + apptId * 2 + 1,
          title: '⏰ موعدك بعد ساعة!',
          body: `تذكير: موعدك مع ${appt.doctorName} بعد ساعة. لا تتأخر!`,
          schedule: { at: hourBefore },
          smallIcon: 'ic_stat_icon_tibrah',
          iconColor: '#E74C3C',
          sound: 'notification_urgent.wav',
          extra: { type: 'appointment_urgent', appointmentId: appt.id },
        });
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
      }
    } catch (e) {
      console.error('[NativeNotifications] scheduleAppointmentReminder failed:', e);
    }
  }, []);

  // ─── جدولة Streak reminder ─────────────────────────────────

  const scheduleStreakReminder = useCallback(async (hour = 20): Promise<void> => {
    if (!bridge.isNative) return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      await LocalNotifications.cancel({ notifications: [{ id: BASE_IDS.streak }] }).catch(() => {});

      const reminderDate = new Date();
      reminderDate.setHours(hour, 0, 0, 0);
      if (reminderDate <= new Date()) reminderDate.setDate(reminderDate.getDate() + 1);

      await LocalNotifications.schedule({
        notifications: [{
          id: BASE_IDS.streak,
          title: '🔥 حافظ على Streak يومك!',
          body: 'لم تسجل صحتك اليوم بعد. خصص 2 دقيقة لصحتك.',
          schedule: {
            at: reminderDate,
            repeats: true,
            every: 'day' as const,
          },
          smallIcon: 'ic_stat_icon_tibrah',
          iconColor: '#F39C12',
          extra: { type: 'streak' },
        }],
      });
    } catch (e) {
      console.error('[NativeNotifications] scheduleStreakReminder failed:', e);
    }
  }, []);

  // ─── إلغاء الكل ─────────────────────────────────────────────

  const cancelAll = useCallback(async (): Promise<void> => {
    if (!bridge.isNative) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch { /* no-op */ }
  }, []);

  // ─── إلغاء دواء محدد ────────────────────────────────────────

  const cancelMedication = useCallback(async (medicationId: string): Promise<void> => {
    if (!bridge.isNative) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const ids = Array.from({ length: 10 }, (_, i) => ({
        id: BASE_IDS.medication + parseInt(medicationId) * 10 + i,
      }));
      await LocalNotifications.cancel({ notifications: ids }).catch(() => {});
    } catch { /* no-op */ }
  }, []);

  return {
    requestPermission,
    scheduleMedication,
    scheduleWaterReminders,
    scheduleAppointmentReminder,
    scheduleStreakReminder,
    cancelAll,
    cancelMedication,
  };
}

export default useNativeNotifications;
