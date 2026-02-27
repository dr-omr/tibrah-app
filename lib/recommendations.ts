import { db } from '@/lib/db';

export interface Recommendation {
    id: string;
    type: 'product' | 'frequency' | 'article';
    title: string;
    subtitle: string;
    image?: string; // or icon
    reason: string;
    actionLabel: string;
    actionLink: string;
    priority: number; // 99 = highest
}

export const getSmartRecommendations = async (): Promise<Recommendation[]> => {
    const recs: Recommendation[] = [];
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch User Data
    const dailyLogs = await db.entities.DailyLog.filter({ date: today });
    const log = dailyLogs[0] || null;

    const sleepLogs = await db.entities.SleepLog.list('-date', 1);
    const lastSleep = sleepLogs[0] || null;

    const waterLogs = await db.entities.WaterLog.filter({ date: today });
    const water = waterLogs[0] || { glasses: 0 };

    // 2. Logic Rules

    // --- Rule A: Low Energy ---
    if (log?.energy_level && Number(log.energy_level) <= 2) {
        // Fetch High Energy Products
        const vitamins = await db.entities.Product.filter({ category: 'vitamins' }, undefined, 1);
        if (vitamins[0]) {
            recs.push({
                id: 'rec_energy_vit',
                type: 'product',
                title: (vitamins[0].name as string) || 'فيتامينات الطاقة',
                subtitle: 'لرفع مستويات النشاط لديك',
                image: vitamins[0].image_url as string,
                reason: 'طاقتك منخفضة اليوم 📉',
                actionLabel: 'شراء الآن',
                actionLink: `/products/${vitamins[0].id}`,
                priority: 90
            });
        }

        // Suggest Energy Frequency
        const freqs = await db.entities.RifeFrequency.filter({ category: 'disease_support' }, undefined, 1);
        // Note: In real app, we'd search for "Fatigue" or "Energy" tags
        if (freqs[0]) {
            recs.push({
                id: 'rec_energy_freq',
                type: 'frequency',
                title: 'ترددات الحيوية',
                subtitle: 'جلسة صوتية لرفع الطاقة',
                reason: 'اشحن طاقتك فوراً ⚡',
                actionLabel: 'استماع',
                actionLink: `/frequencies/${freqs[0].id}`,
                priority: 85
            });
        }
    }

    // --- Rule B: High Stress ---
    if (log?.stress_level && Number(log.stress_level) >= 4) {
        recs.push({
            id: 'rec_stress_breathing',
            type: 'article',
            title: 'تقنية التنفس 4-7-8',
            subtitle: 'دقيقة واحدة للهدوء',
            reason: 'مستوى توترك مرتفع 😰',
            actionLabel: 'ابدأ التمرين',
            actionLink: '/library/breathing-exercise', // Mock link
            priority: 95
        });

        const minerals = await db.entities.Product.filter({ category: 'minerals' }, undefined, 1);
        if (minerals[0]) {
            recs.push({
                id: 'rec_stress_mg',
                type: 'product',
                title: 'المغنيسيوم للاسترخاء',
                subtitle: 'يساعد على تهدئة الأعصاب',
                image: minerals[0].image_url as string,
                reason: 'هدئ أعصابك طبيعياً 🌿',
                actionLabel: 'عرض',
                actionLink: `/products/${minerals[0].id}`,
                priority: 88
            });
        }
    }

    // --- Rule C: Low Water ---
    if (Number(water.glasses) < 3 && new Date().getHours() > 14) {
        recs.push({
            id: 'rec_water',
            type: 'article',
            title: 'أهمية الماء للتركيز',
            subtitle: 'هل تعلم أن الجفاف يقلل التركيز؟',
            reason: 'لم تشرب كفايتك بعد 💧',
            actionLabel: 'سجل كوب ماء',
            actionLink: '/health-tracker', // Should trigger widget focus ideally
            priority: 80
        });
    }

    // --- Rule D: Poor Sleep ---
    if (lastSleep && Number(lastSleep.duration_hours) < 5) {
        const sleepFreq = await db.entities.RifeFrequency.list('-created_at', 1); // Mock: get any freq
        if (sleepFreq[0]) {
            recs.push({
                id: 'rec_sleep_freq',
                type: 'frequency',
                title: 'نوم عميق',
                subtitle: 'ترددات دلتا للنوم',
                reason: 'نعوض نقص النوم الليلة 🌙',
                actionLabel: 'تشغيل',
                actionLink: `/frequencies/${sleepFreq[0].id}`,
                priority: 92
            });
        }
    }

    // Sort by priority
    return recs.sort((a, b) => b.priority - a.priority);
};
