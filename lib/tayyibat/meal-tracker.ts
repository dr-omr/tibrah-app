// lib/tayyibat/meal-tracker.ts
// ══════════════════════════════════════════════════════════
// تتبع الوجبات اليومي + تحليل الأنماط + الرؤى الأسبوعية
// اللغة: وصفية — تُكشف الأنماط دون الادعاء بالتشخيص
// ══════════════════════════════════════════════════════════

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type TayyibatCompliance = 'yes' | 'partial' | 'no';

export interface TayyibatMeal {
    id:                string;
    mealType:          MealType;
    foods:             string[];          // قائمة حرة من الأطعمة
    tayyibatCompliance: TayyibatCompliance;
    bloatingScore:     number | null;     // 0–10
    energyScore:       number | null;     // 0–10
    moodScore:         number | null;     // 0–10 (١٠ = مزاج ممتاز)
    sleepEffect:       number | null;     // 0–10 فقط لوجبات العشاء
    cravingsAfterMeal: number | null;     // 0–10 (١٠ = رغبة شديدة في السكر)
    nauseaScore:       number | null;     // 0–10
    notes:             string;
    createdAt:         number;            // timestamp
    date:              string;            // YYYY-MM-DD
}

export interface DayMealSummary {
    date:              string;
    meals:             TayyibatMeal[];
    dailyCompliance:   number;           // 0–100
    avgBloating:       number;
    avgEnergy:         number;
    avgMood:           number;
    topViolation:      string | null;
    insight:           string;
}

export interface WeeklyInsight {
    weekStart:                  string;   // YYYY-MM-DD
    weeklyAdherencePercentage:  number;   // 0–100
    bestEnergyDay:              string | null;
    worstBloatingDay:           string | null;
    mostSymptomLinkedMeal:      MealType | null;
    mostSymptomLinkedFood:      string | null;
    mostRepeatedTriggerFood:    string | null;
    nextWeekFocus:              string;
    insightSummary:             string;
    positiveReinforcement:      string;
    confidenceBoost:            number;  // عدد الوجبات المسجلة هذا الأسبوع
}

// ── دوال حساب الامتثال ──
const COMPLIANCE_SCORE: Record<TayyibatCompliance, number> = {
    yes: 100, partial: 55, no: 0,
};

export function computeDailyCompliance(meals: TayyibatMeal[]): number {
    if (!meals.length) return 0;
    const total = meals.reduce((s, m) => s + COMPLIANCE_SCORE[m.tayyibatCompliance], 0);
    return Math.round(total / meals.length);
}

export function computeWeeklyAdherence(days: DayMealSummary[]): number {
    if (!days.length) return 0;
    return Math.round(days.reduce((s, d) => s + d.dailyCompliance, 0) / days.length);
}

// ── تحليل المحفزات (trigger analysis) ──
export function findMostSymptomLinkedMeal(meals: TayyibatMeal[]): MealType | null {
    const mealSymptomMap: Record<MealType, number[]> = {
        breakfast: [], lunch: [], dinner: [], snack: [],
    };
    for (const m of meals) {
        if (m.bloatingScore != null) {
            mealSymptomMap[m.mealType].push(m.bloatingScore);
        }
    }
    let worstMeal: MealType | null = null;
    let worstAvg = 0;
    for (const [type, scores] of Object.entries(mealSymptomMap) as [MealType, number[]][]) {
        if (!scores.length) continue;
        const avg = scores.reduce((s,v)=>s+v,0)/scores.length;
        if (avg > worstAvg) { worstAvg = avg; worstMeal = type; }
    }
    return worstAvg >= 4 ? worstMeal : null;
}

export function findMostRepeatedTriggerFood(meals: TayyibatMeal[]): string | null {
    // الأطعمة التي ظهرت مع انتفاخ >= 6
    const foodFreq: Record<string, number> = {};
    for (const m of meals) {
        if ((m.bloatingScore ?? 0) >= 6) {
            for (const food of m.foods) {
                foodFreq[food] = (foodFreq[food] ?? 0) + 1;
            }
        }
    }
    const sorted = Object.entries(foodFreq).sort((a,b)=>b[1]-a[1]);
    return sorted[0]?.[0] ?? null;
}

// ── بناء الرؤية الأسبوعية ──
export function buildWeeklyInsight(
    days: DayMealSummary[],
    allMeals: TayyibatMeal[]
): WeeklyInsight {
    const adherence = computeWeeklyAdherence(days);
    const logCount  = allMeals.length;

    // أفضل يوم طاقة
    let bestEnergyDay: string | null = null;
    let bestEnergy = 0;
    for (const d of days) {
        if (d.avgEnergy > bestEnergy) { bestEnergy = d.avgEnergy; bestEnergyDay = d.date; }
    }

    // أسوأ يوم انتفاخ
    let worstBloatingDay: string | null = null;
    let worstBloating = 0;
    for (const d of days) {
        if (d.avgBloating > worstBloating) { worstBloating = d.avgBloating; worstBloatingDay = d.date; }
    }

    const mostSymptomLinkedMeal  = findMostSymptomLinkedMeal(allMeals);
    const mostRepeatedTriggerFood = findMostRepeatedTriggerFood(allMeals);

    // تركيز الأسبوع القادم
    let nextWeekFocus = 'استمر في تسجيل وجباتك — البيانات الكافية تُعطي رؤية أوضح.';
    if (mostRepeatedTriggerFood) {
        nextWeekFocus = `راقب تأثير "${mostRepeatedTriggerFood}" على جهازك الهضمي هذا الأسبوع — قد يكون محفزاً شخصياً لديك.`;
    } else if (mostSymptomLinkedMeal === 'dinner') {
        nextWeekFocus = 'جرّب تقديم وجبة العشاء ساعة واحدة — راقب تأثيره على النوم والانتفاخ.';
    } else if (adherence < 50) {
        nextWeekFocus = 'ركّز على تغيير واحد فقط هذا الأسبوع — الثبات أهم من الكمال.';
    }

    // ملخص إيجابي دائماً
    const positiveReinforcement = adherence >= 70
        ? 'أسبوع جيد! المثابرة هي المفتاح — كل يوم ملتزم يُراكم فوائد حقيقية.'
        : adherence >= 40
        ? `سجّلت ${logCount} وجبة هذا الأسبوع — هذا بحد ذاته خطوة قيّمة نحو الوعي الغذائي.`
        : 'البداية صعبة دائماً — التسجيل نفسه هو نجاح. الأسبوع القادم نبني عليه.';

    const insightSummary = mostSymptomLinkedMeal
        ? `وجبة ${MEAL_TYPE_AR[mostSymptomLinkedMeal]} ارتبطت بأعلى درجة انتفاخ هذا الأسبوع — قد يكون ما يُؤكل فيها يستحق المراجعة.`
        : adherence >= 70
        ? 'لا مؤشرات واضحة مرتبطة بوجبة بعينها هذا الأسبوع — هذا مؤشر إيجابي.'
        : 'البيانات لا تزال محدودة لاستخلاص نمط واضح — أسبوع إضافي من التسجيل سيُوضح الصورة.';

    return {
        weekStart: days[0]?.date ?? '',
        weeklyAdherencePercentage: adherence,
        bestEnergyDay: bestEnergy >= 6 ? bestEnergyDay : null,
        worstBloatingDay: worstBloating >= 5 ? worstBloatingDay : null,
        mostSymptomLinkedMeal,
        mostSymptomLinkedFood: mostRepeatedTriggerFood,
        mostRepeatedTriggerFood,
        nextWeekFocus,
        insightSummary,
        positiveReinforcement,
        confidenceBoost: logCount,
    };
}

// ── بناء ملخص اليوم ──
export function buildDaySummary(date: string, meals: TayyibatMeal[]): DayMealSummary {
    const scored = meals.filter(m => m.bloatingScore != null);
    const avgBloating = scored.length
        ? scored.reduce((s,m)=>s+(m.bloatingScore??0),0)/scored.length : 0;
    const avgEnergy = meals.filter(m=>m.energyScore!=null).reduce((s,m)=>s+(m.energyScore??0),0) / Math.max(1, meals.filter(m=>m.energyScore!=null).length);
    const avgMood   = meals.filter(m=>m.moodScore!=null).reduce((s,m)=>s+(m.moodScore??0),0)   / Math.max(1, meals.filter(m=>m.moodScore!=null).length);

    const violation = meals.find(m=>m.tayyibatCompliance==='no');
    const topViolation = violation ? (violation.foods[0] ?? null) : null;

    const insight = avgBloating >= 7
        ? 'انتفاخ مرتفع هذا اليوم — ما الوجبة التي سبقته؟ دوّن ذلك في الملاحظات.'
        : avgEnergy <= 3
        ? 'طاقة منخفضة هذا اليوم — هل كان الفطور بروتينياً؟'
        : 'يوم طبيعي — استمر في التسجيل لاكتشاف الأنماط.';

    return {
        date, meals,
        dailyCompliance: computeDailyCompliance(meals),
        avgBloating: Math.round(avgBloating * 10) / 10,
        avgEnergy:   Math.round(avgEnergy * 10) / 10,
        avgMood:     Math.round(avgMood * 10) / 10,
        topViolation,
        insight,
    };
}

// ── ترجمة عربية ──
export const MEAL_TYPE_AR: Record<MealType, string> = {
    breakfast: 'الفطور', lunch: 'الغداء', dinner: 'العشاء', snack: 'وجبة خفيفة',
};

export const COMPLIANCE_AR: Record<TayyibatCompliance, string> = {
    yes: '✅ ملتزم', partial: '🔶 جزئي', no: '⛔ غير ملتزم',
};
