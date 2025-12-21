import { db } from '@/lib/db';
import { format, subDays } from 'date-fns';

export interface UserStats {
    activeDays: number;
    waterCups: number;
    sleepHours: number;
    dosesTaken: number;
}

export const fetchUserStats = async (): Promise<UserStats> => {
    try {
        const today = format(new Date(), 'yyyy-MM-dd');

        // 1. Get Water Log for Today
        const waterLogs = await db.entities.WaterLog.filter({ date: today }).catch(() => []);
        const waterCups = waterLogs?.[0]?.glasses || 0;

        // 2. Get Sleep Log (Latest)
        const sleepLogs = await db.entities.SleepLog.list('-date', 1).catch(() => []);
        const sleepHours = sleepLogs?.[0]?.duration_hours || 0;

        // 3. Active Days (Mock logic: Count DailyLogs in last 30 days)
        // Since we can't do complex aggregation on this client easily, I'll count records
        const recentLogs = await db.entities.DailyLog.list('-date', 30).catch(() => []);
        const activeDays = recentLogs.length;

        // 4. Doses Taken (Assuming 'MedicineLog' exists or similar, if not, mock 0 or use DailyLog habits)
        // For now, let's use a mock or try to find a 'Reminder' or 'Medicine' entity
        // I will stick to 0 or mock if entity doesn't exist.
        // Let's assume there is NO MedicineLog entity based on file list. 
        // I'll check 'health-tracker.tsx' to see where doses are stored.

        return {
            activeDays: activeDays || 0,
            waterCups: Number(waterCups),
            sleepHours: Number(sleepHours),
            dosesTaken: 0 // Placeholder until confirmed
        };

    } catch (e) {
        console.error("Error fetching stats:", e);
        return { activeDays: 0, waterCups: 0, sleepHours: 0, dosesTaken: 0 };
    }
};
