import { db } from '@/lib/db';
import { TAYYIBAT_ATTRIBUTION_COPY } from '@/lib/tayyibat/tayyibat-nutrition-policy';


export interface Recommendation {
    id: string;
    type: 'product' | 'frequency' | 'article' | 'action';
    title: string;
    subtitle: string;
    image?: string;
    reason: string;
    actionLabel: string;
    actionLink: string;
    priority: number; // 99 = highest
}

export const generateRecommendations = async (userId: string): Promise<Recommendation[]> => {
    const recs: Recommendation[] = [];
    if (!userId) return recs;
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch User Data (parallel)
    const [dailyLogs, sleepLogs, waterLogs, userProfile] = await Promise.all([
        db.entities.DailyLog.filter({ date: today, user_id: userId }).catch(() => []),
        db.entities.SleepLog.listForUser(userId, '-date', 1).catch(() => []),
        db.entities.WaterLog.filter({ date: today, user_id: userId }).catch(() => []),
        db.entities.User.get(userId).catch(() => null),
    ]);

    const log = dailyLogs[0] || null;
    const lastSleep = sleepLogs[0] || null;
    const water = waterLogs[0] || { glasses: 0 };

    // Extract user goals and interests from onboarding profile
    const goals = (userProfile as any)?.health_goals as string[] || [];
    const interests = (userProfile as any)?.health_interests as string[] || [];

    // ═══════════════════════════════════════════════════════════
    // REAL-TIME HEALTH DATA RULES
    // ═══════════════════════════════════════════════════════════

    // --- Rule A: Low Energy ---
    if (log?.energy_level && Number(log.energy_level) <= 2) {
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

        const freqs = await db.entities.RifeFrequency.filter({ category: 'disease_support' }, undefined, 1);
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
            actionLink: '/meditation',
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
            actionLink: '/health-tracker',
            priority: 80
        });
    }

    // --- Rule D: Poor Sleep ---
    if (lastSleep && Number(lastSleep.duration_hours) < 5) {
        recs.push({
            id: 'rec_sleep_freq',
            type: 'frequency',
            title: 'نوم عميق',
            subtitle: 'ترددات دلتا للنوم',
            reason: 'نعوض نقص النوم الليلة 🌙',
            actionLabel: 'تشغيل',
            actionLink: '/meditation',
            priority: 92
        });
    }

    // ═══════════════════════════════════════════════════════════
    // PERSONALIZED GOAL-BASED RECOMMENDATIONS
    // Uses onboarding health_goals + health_interests
    // ═══════════════════════════════════════════════════════════

    if (goals.includes('lose_weight') && !recs.find(r => r.id.includes('weight'))) {
        recs.push({
            id: 'rec_goal_weight',
            type: 'action',
            title: 'بروتوكول الطيبات لضبط الوزن',
            subtitle: 'تحوّل لوقود الدهون بدلاً من السكر — مبادئ الطيبات',
            reason: 'مطابق لهدفك: إنقاص الوزن ⚖️',
            actionLabel: 'اعرف النظام',
            actionLink: '/tayyibat',
            priority: 75
        });
    }

    if (goals.includes('better_sleep') && !(lastSleep && Number(lastSleep.duration_hours) < 5)) {
        recs.push({
            id: 'rec_goal_sleep',
            type: 'action',
            title: 'روتين نوم ذهبي',
            subtitle: 'استرخاء مسائي لنوم عميق',
            reason: 'مطابق لهدفك: نوم أفضل 🌙',
            actionLabel: 'ابدأ الروتين',
            actionLink: '/meditation',
            priority: 70
        });
    }

    if (goals.includes('reduce_stress') && !(log?.stress_level && Number(log.stress_level) >= 4)) {
        recs.push({
            id: 'rec_goal_stress',
            type: 'action',
            title: 'تأمل الهدوء الداخلي',
            subtitle: '5 دقائق يومياً تصنع الفرق',
            reason: 'مطابق لهدفك: تقليل التوتر 🧘',
            actionLabel: 'ابدأ',
            actionLink: '/meditation',
            priority: 68
        });
    }

    if (goals.includes('eat_healthy')) {
        recs.push({
            id: 'rec_goal_nutrition',
            type: 'action',
            title: 'نظام الطيبات الغذائي',
            subtitle: `${TAYYIBAT_ATTRIBUTION_COPY.short} — ابدأ من هنا`,
            reason: 'مطابق لهدفك: أكل صحي 🥗',
            actionLabel: 'استكشف الطيبات',
            actionLink: '/tayyibat',
            priority: 72
        });
    }

    if (goals.includes('manage_chronic')) {
        recs.push({
            id: 'rec_goal_chronic',
            type: 'action',
            title: 'احجز جلسة تشخيصية',
            subtitle: '25 ر.س فقط — مع د. عمر العماد',
            reason: 'لإدارة حالتك المزمنة بشكل أفضل 💊',
            actionLabel: 'احجز الآن',
            actionLink: '/book-appointment',
            priority: 85
        });
    }

    if (goals.includes('more_energy') && !(log?.energy_level && Number(log.energy_level) <= 2)) {
        recs.push({
            id: 'rec_goal_energy',
            type: 'action',
            title: 'بروتوكول الطاقة اليومي',
            subtitle: 'حركة + تغذية + ترددات',
            reason: 'مطابق لهدفك: طاقة أكثر ⚡',
            actionLabel: 'عرض البروتوكول',
            actionLink: '/health-tracker',
            priority: 65
        });
    }

    if (goals.includes('gut_health')) {
        recs.push({
            id: 'rec_goal_gut',
            type: 'action',
            // Tayyibat-aligned: gut health via elimination of fermentation triggers, not generic fiber/probiotic
            title: 'بروتوكول صحة الأمعاء (الطيبات)',
            subtitle: 'تخفيف التخمرات والالتهاب — خطوة بخطوة مع الطيبات',
            reason: 'مطابق لهدفك: صحة الأمعاء 🦠',
            actionLabel: 'ابدأ بروتوكول الأمعاء',
            actionLink: '/tayyibat/assessment',
            priority: 60
        });
    }

    // Interest-based: if user is interested in fasting but no active session
    if (interests.includes('fasting')) {
        const activeFasting = await db.entities.FastingSession.filter({ completed: false, user_id: userId }).catch(() => []);
        if (activeFasting.length === 0) {
            recs.push({
                id: 'rec_interest_fasting',
                type: 'action',
                title: 'ابدأ جلسة صيام جديدة',
                subtitle: 'الصيام المتقطع يعزز الأيض',
                reason: 'مبني على اهتمامك بالصيام 🔥',
                actionLabel: 'ابدأ صيام',
                actionLink: '/health-tracker',
                priority: 55
            });
        }
    }

    // Sort by priority (highest first), limit to top 6
    return recs.sort((a, b) => b.priority - a.priority).slice(0, 6);
};
