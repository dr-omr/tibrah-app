/**
 * Health Context Builder
 * Builds comprehensive health context from user data for AI assistant
 */

import { getUserData } from './userDataService';

export interface HealthContext {
    name?: string;
    waterToday?: number;
    waterGoal?: number;
    sleepHours?: number;
    sleepScore?: number;
    weight?: number;
    height?: number;
    goalWeight?: number;
    bmi?: number;
    moodScore?: number;
    stressLevel?: number;
    fastingActive?: boolean;
    fastingPlan?: string;
    symptoms?: string[];
    lastActivity?: string;
}

/**
 * Build health context from stored user data
 */
export async function buildHealthContext(userId: string | null): Promise<HealthContext> {
    if (!userId) {
        return {};
    }

    try {
        const context: HealthContext = {};

        // Get water data
        const waterGoal = await getUserData<number>(userId, 'waterGoalMl', 2500);
        context.waterGoal = waterGoal;

        // Get weight/height data
        const height = await getUserData<number>(userId, 'userHeight', 170);
        const goalWeight = await getUserData<number>(userId, 'goalWeight', 70);
        context.height = height;
        context.goalWeight = goalWeight;

        // Get fasting state
        const fastingState = await getUserData<any>(userId, 'fastingState', null);
        if (fastingState && fastingState.startTime) {
            context.fastingActive = true;
            context.fastingPlan = fastingState.planId;
        }

        // Calculate BMI if we have weight
        if (context.weight && context.height) {
            context.bmi = context.weight / Math.pow(context.height / 100, 2);
        }

        return context;

    } catch (error) {
        console.warn('[HealthContext] Error building context:', error);
        return {};
    }
}

/**
 * Get quick health summary for display
 */
export function getHealthSummary(context: HealthContext): string {
    const parts: string[] = [];

    if (context.waterToday && context.waterGoal) {
        const percent = Math.round((context.waterToday / context.waterGoal) * 100);
        parts.push(`💧 ${percent}% من هدف الماء`);
    }

    if (context.sleepScore) {
        const emoji = context.sleepScore >= 80 ? '😴' : context.sleepScore >= 60 ? '😊' : '😔';
        parts.push(`${emoji} جودة النوم ${context.sleepScore}%`);
    }

    if (context.moodScore) {
        const emoji = context.moodScore >= 4 ? '😊' : context.moodScore >= 3 ? '😐' : '😔';
        parts.push(`${emoji} المزاج`);
    }

    if (context.fastingActive) {
        parts.push(`⏱️ صيام نشط`);
    }

    return parts.join(' | ') || 'لا توجد بيانات صحية بعد';
}

/**
 * Get personalized greeting based on health context
 */
export function getPersonalizedGreeting(context: HealthContext, time: Date = new Date()): string {
    const hour = time.getHours();
    let greeting = '';

    if (hour < 12) {
        greeting = 'صباح الخير';
    } else if (hour < 17) {
        greeting = 'مساء الخير';
    } else {
        greeting = 'مساء النور';
    }

    if (context.name) {
        greeting += ` يا ${context.name}`;
    } else {
        greeting += ' يا غالي';
    }

    // Add contextual message
    if (context.waterToday && context.waterGoal) {
        const percent = (context.waterToday / context.waterGoal) * 100;
        if (percent < 30) {
            greeting += '! لاحظت أنك لم تشرب كفاية من الماء اليوم 💧';
        } else if (percent >= 100) {
            greeting += '! أحسنت على شرب الماء الكافي اليوم 🎉';
        }
    }

    if (context.sleepScore && context.sleepScore < 60) {
        greeting += ' كيف تحس بعد نوم قليل الليلة الماضية؟';
    }

    return greeting + '! كيف أقدر أساعدك اليوم؟ 🌿';
}
