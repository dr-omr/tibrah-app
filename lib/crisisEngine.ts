// lib/crisisEngine.ts
// The Dynamic Remediation Protocol (SOS Crisis Engine)

import { db } from './db';

export type CrisisLevel = 'NORMAL' | 'WARNING' | 'CRISIS';

export interface SOSRescueTasks {
    breathing: boolean;
    frequency: boolean;
    supplement: string | null;
}

export interface CrisisState {
    level: CrisisLevel;
    score: number;       // 0-100 (100 is severe crisis)
    message: string;
    tasks: SOSRescueTasks;
}

/**
 * Evaluates the user's current crisis level based on recent logs.
 * We look at: Stress levels, Pain levels, Sleep quality.
 */
export const evaluateCrisisState = async (userId: string): Promise<CrisisState> => {
    try {
        if (!userId) {
            return {
                level: 'NORMAL',
                score: 0,
                message: 'كل شيء على ما يرام، استمر في يومك الجميل.',
                tasks: { breathing: false, frequency: false, supplement: null }
            };
        }

        // 1. Fetch recent daily logs (e.g., today and yesterday)
        const recentLogs = await db.entities.DailyLog.listForUser(userId);
        
        let stressScore = 0;
        let painScore = 0;
        let sleepPenalty = 0;

        if (recentLogs && recentLogs.length > 0) {
            // Sort by date descending
            const sortedLogs = [...recentLogs].sort((a: any, b: any) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            const todayLog = sortedLogs[0];
            
            // Check emotional stress from today's log or health metrics
            const metrics: any = todayLog.metrics;
            if (metrics) {
                if (metrics.stress_level) {
                    stressScore = metrics.stress_level; // assuming 1-10
                }
                if (metrics.sleep_hours && metrics.sleep_hours < 5) {
                    sleepPenalty = 5; // Major penalty for bad sleep
                }
            }
        }

        // 2. We can also check recent Triage Drafts in localStorage for immediate pain context
        if (typeof window !== 'undefined') {
            const triageDraft = localStorage.getItem('tibrah_triage_draft');
            if (triageDraft) {
                try {
                    const parsed = JSON.parse(triageDraft);
                    const severityStr = parsed.socratesAnswers?.severity || '0';
                    painScore = parseInt(severityStr, 10) || 0;
                } catch (e) {
                    console.error('Failed to parse triage draft in crisis engine', e);
                }
            }
        }

        // Calculate total crisis score
        // Max theoretical: Stress(10) * 4 + Pain(10) * 4 + Sleep(5) * 4 = ~100
        const rawScore = (stressScore * 4) + (painScore * 4) + (sleepPenalty * 4);
        const score = Math.min(100, Math.max(0, rawScore));

        // Determine Level
        let level: CrisisLevel = 'NORMAL';
        let message = 'مؤشراتك مستقرة اليوم، استمتع بيومك المشرق.';
        let tasks: SOSRescueTasks = {
            breathing: false,
            frequency: false,
            supplement: null,
        };

        if (score >= 60) {
            level = 'CRISIS';
            message = 'يبدو أنك تمر بضغط شديد جداً أو ألم غير محتمل اليوم. أرجوك توقف لحظة... هذا البروتوكول الفوري مصمم لتهدئة جهازك العصبي فوراً لتتمكن من المواجهة.';
            tasks = {
                breathing: true,
                frequency: true,
                supplement: 'شاي بابونج دافئ أو كوب ماء مع ليمون وملح بحري',
            };
        } else if (score >= 35) {
            level = 'WARNING';
            message = 'ألاحظ ارتفاعاً في معدلات التوتر والإرهاق لديك. خذ هذه الدقائق القليلة لإعادة ضبط يومك قبل أن يتفاقم الإجهاد.';
            tasks = {
                breathing: true,
                frequency: false,
                supplement: 'كوب ماء كبير مع تنفس عميق',
            };
        }

        // DEMO OVERRIDE: For presentation, if localStorage flag is set, force CRISIS
        if (typeof window !== 'undefined' && localStorage.getItem('FORCE_CRISIS_MODE') === 'true') {
            return {
                level: 'CRISIS',
                score: 85,
                message: 'يبدو أنك تمر بضغط شديد جداً أو ألم غير محتمل اليوم. أرجوك توقف لحظة... هذا البروتوكول الفوري مصمم لتهدئة جهازك العصبي فوراً.',
                tasks: {
                    breathing: true,
                    frequency: true,
                    supplement: 'شاي بابونج أو مكمل مغنيسيوم قبل النوم',
                }
            };
        }

        return { level, score, message, tasks };
    } catch (error) {
        console.error('Error evaluating crisis state:', error);
        return {
            level: 'NORMAL',
            score: 0,
            message: 'كل شيء على ما يرام.',
            tasks: { breathing: false, frequency: false, supplement: null }
        };
    }
};

/**
 * Toggles a demo crisis mode for presentation/testing purposes
 */
export const toggleDemoCrisisMode = () => {
    if (typeof window !== 'undefined') {
        const isSet = localStorage.getItem('FORCE_CRISIS_MODE') === 'true';
        if (isSet) {
            localStorage.removeItem('FORCE_CRISIS_MODE');
        } else {
            localStorage.setItem('FORCE_CRISIS_MODE', 'true');
        }
    }
};
