/**
 * Tibrah Daily Health Challenges System
 * Tracks daily/weekly health challenges and awards points for completion
 */

export interface Challenge {
    id: string;
    title: string;
    description: string;
    icon: string;
    points: number;
    type: 'daily' | 'weekly';
    category: 'water' | 'sleep' | 'exercise' | 'mood' | 'fasting' | 'nutrition' | 'mindfulness';
    target: number;
    unit: string;
    color: string;
}

export interface ChallengeProgress {
    challengeId: string;
    current: number;
    completed: boolean;
    completedAt?: string;
    date: string;
}

export interface UserStreak {
    current: number;
    longest: number;
    lastActiveDate: string;
}

export interface DailyChallengesData {
    challenges: ChallengeProgress[];
    streak: UserStreak;
    totalPointsEarned: number;
    badges: string[];
    lastRefreshDate: string;
}

// Daily challenge templates — 3 random ones are assigned each day
const CHALLENGE_POOL: Challenge[] = [
    // Water
    { id: 'water-8', title: 'اشرب 8 أكواب ماء', description: 'حافظ على ترطيب جسمك', icon: '💧', points: 15, type: 'daily', category: 'water', target: 8, unit: 'كوب', color: '#3B82F6' },
    { id: 'water-morning', title: 'ماء الصباح', description: 'اشرب كوبين ماء عند الاستيقاظ', icon: '🌅', points: 10, type: 'daily', category: 'water', target: 2, unit: 'كوب', color: '#06B6D4' },

    // Sleep
    { id: 'sleep-7h', title: 'نم 7 ساعات', description: 'نوم صحي لجسم سليم', icon: '🌙', points: 20, type: 'daily', category: 'sleep', target: 7, unit: 'ساعة', color: '#8B5CF6' },
    { id: 'sleep-early', title: 'نم قبل 11 مساءً', description: 'النوم المبكر مفتاح الصحة', icon: '😴', points: 15, type: 'daily', category: 'sleep', target: 1, unit: 'مرة', color: '#7C3AED' },

    // Exercise
    { id: 'walk-30', title: 'امشِ 30 دقيقة', description: 'حركة بسيطة تصنع فرقاً كبيراً', icon: '🚶', points: 20, type: 'daily', category: 'exercise', target: 30, unit: 'دقيقة', color: '#22C55E' },
    { id: 'exercise-15', title: 'تمرين 15 دقيقة', description: 'أي نشاط رياضي تحبه', icon: '💪', points: 15, type: 'daily', category: 'exercise', target: 15, unit: 'دقيقة', color: '#10B981' },
    { id: 'steps-5k', title: '5000 خطوة', description: 'تحرك وانشط جسمك', icon: '👟', points: 25, type: 'daily', category: 'exercise', target: 5000, unit: 'خطوة', color: '#059669' },

    // Mood
    { id: 'mood-log', title: 'سجّل مزاجك', description: 'تتبع حالتك النفسية يومياً', icon: '😊', points: 10, type: 'daily', category: 'mood', target: 1, unit: 'مرة', color: '#F59E0B' },
    { id: 'gratitude', title: 'اكتب 3 أشياء تشكرها', description: 'الامتنان يحسن الصحة النفسية', icon: '🙏', points: 15, type: 'daily', category: 'mindfulness', target: 3, unit: 'شيء', color: '#EC4899' },

    // Fasting
    { id: 'fast-16', title: 'صيام 16 ساعة', description: 'صيام متقطع لتحسين الأيض', icon: '⏰', points: 30, type: 'daily', category: 'fasting', target: 16, unit: 'ساعة', color: '#F97316' },

    // Nutrition
    { id: 'healthy-meal', title: 'وجبة صحية', description: 'حضّر وجبة متوازنة اليوم', icon: '🥗', points: 15, type: 'daily', category: 'nutrition', target: 1, unit: 'وجبة', color: '#84CC16' },
    { id: 'no-sugar', title: 'يوم بدون سكر', description: 'تجنب السكريات المضافة', icon: '🚫', points: 25, type: 'daily', category: 'nutrition', target: 1, unit: 'يوم', color: '#EF4444' },

    // Mindfulness
    { id: 'breathe-5', title: 'تمرين تنفس 5 دقائق', description: 'خذ لحظة هدوء وتأمل', icon: '🌬️', points: 10, type: 'daily', category: 'mindfulness', target: 5, unit: 'دقيقة', color: '#14B8A6' },
    { id: 'screen-break', title: 'استراحة من الشاشة', description: 'ابتعد عن الشاشات 30 دقيقة', icon: '📵', points: 10, type: 'daily', category: 'mindfulness', target: 30, unit: 'دقيقة', color: '#6366F1' },
];

// Weekly challenge templates
const WEEKLY_CHALLENGES: Challenge[] = [
    { id: 'week-water', title: 'بطل الترطيب', description: 'اشرب 8 أكواب ماء 5 أيام', icon: '🏆💧', points: 100, type: 'weekly', category: 'water', target: 5, unit: 'يوم', color: '#3B82F6' },
    { id: 'week-exercise', title: 'أسبوع نشط', description: 'تمرن 4 أيام هذا الأسبوع', icon: '🏆💪', points: 120, type: 'weekly', category: 'exercise', target: 4, unit: 'يوم', color: '#22C55E' },
    { id: 'week-sleep', title: 'نوم منتظم', description: 'نم 7+ ساعات 5 أيام', icon: '🏆🌙', points: 100, type: 'weekly', category: 'sleep', target: 5, unit: 'يوم', color: '#8B5CF6' },
    { id: 'week-streak', title: 'سلسلة 7 أيام', description: 'أكمل تحدي يومي 7 أيام متتالية', icon: '🔥', points: 200, type: 'weekly', category: 'mindfulness', target: 7, unit: 'يوم', color: '#F97316' },
];

// Badge definitions
export const BADGES: Record<string, { name: string; icon: string; description: string; requirement: string }> = {
    'first-challenge': { name: 'البداية', icon: '🌟', description: 'أكملت أول تحدي', requirement: 'أكمل تحدي واحد' },
    'streak-3': { name: 'مواظب', icon: '🔥', description: '3 أيام متتالية', requirement: 'حقق سلسلة 3 أيام' },
    'streak-7': { name: 'مثابر', icon: '💪', description: '7 أيام متتالية', requirement: 'حقق سلسلة 7 أيام' },
    'streak-30': { name: 'بطل', icon: '🏆', description: '30 يوم متتالية', requirement: 'حقق سلسلة 30 يوم' },
    'water-master': { name: 'سقّاء', icon: '💧', description: 'أكملت 10 تحديات ماء', requirement: '10 تحديات ماء مكتملة' },
    'early-bird': { name: 'الطائر المبكر', icon: '🐦', description: 'نمت مبكراً 7 مرات', requirement: '7 تحديات نوم مبكر' },
    'fit-warrior': { name: 'محارب اللياقة', icon: '⚔️', description: 'أكملت 15 تحدي رياضي', requirement: '15 تحدي رياضي' },
    'zen-master': { name: 'سيد الهدوء', icon: '🧘', description: 'أكملت 10 تحديات تأمل', requirement: '10 تحديات ذهنية' },
    'points-500': { name: 'جامع النقاط', icon: '💰', description: 'جمعت 500 نقطة', requirement: '500 نقطة من التحديات' },
    'points-1000': { name: 'ثروة صحية', icon: '👑', description: 'جمعت 1000 نقطة', requirement: '1000 نقطة من التحديات' },
};

const STORAGE_KEY = 'tibrah_daily_challenges';

function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

function getWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
}

// Deterministic daily challenge selection based on date
function getDailyChallenges(date: string): Challenge[] {
    const seed = date.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    const shuffled = [...CHALLENGE_POOL].sort((a, b) => {
        const hashA = (seed * 31 + a.id.charCodeAt(0)) % 100;
        const hashB = (seed * 31 + b.id.charCodeAt(0)) % 100;
        return hashA - hashB;
    });
    return shuffled.slice(0, 4); // 4 daily challenges
}

function getWeeklyChallenges(): Challenge[] {
    const weekStart = getWeekStart();
    const seed = weekStart.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    const shuffled = [...WEEKLY_CHALLENGES].sort((a, b) => {
        const hashA = (seed * 17 + a.id.charCodeAt(0)) % 100;
        const hashB = (seed * 17 + b.id.charCodeAt(0)) % 100;
        return hashA - hashB;
    });
    return shuffled.slice(0, 2); // 2 weekly challenges
}

function loadData(): DailyChallengesData {
    if (typeof window === 'undefined') {
        return { challenges: [], streak: { current: 0, longest: 0, lastActiveDate: '' }, totalPointsEarned: 0, badges: [], lastRefreshDate: '' };
    }
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch { }
    return { challenges: [], streak: { current: 0, longest: 0, lastActiveDate: '' }, totalPointsEarned: 0, badges: [], lastRefreshDate: '' };
}

function saveData(data: DailyChallengesData): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
}

// Sync points with the main rewards system
function syncPointsToRewards(points: number): void {
    if (typeof window === 'undefined') return;
    try {
        const saved = JSON.parse(localStorage.getItem('tibrahRewards') || '{}');
        saved.points = (saved.points || 0) + points;
        localStorage.setItem('tibrahRewards', JSON.stringify(saved));
    } catch { }
}

export function getTodaysChallenges(): { daily: Challenge[]; weekly: Challenge[]; progress: ChallengeProgress[] } {
    const today = getToday();
    const data = loadData();

    // Refresh daily challenges if new day
    if (data.lastRefreshDate !== today) {
        // Update streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (data.streak.lastActiveDate === yesterdayStr) {
            data.streak.current += 1;
        } else if (data.streak.lastActiveDate !== today) {
            data.streak.current = 0;
        }
        data.streak.longest = Math.max(data.streak.longest, data.streak.current);

        data.lastRefreshDate = today;
        // Clear old daily progress (keep weekly)
        data.challenges = data.challenges.filter(c => c.date === today || c.date >= getWeekStart());
        saveData(data);
    }

    const daily = getDailyChallenges(today);
    const weekly = getWeeklyChallenges();

    // Ensure progress entries exist
    const allChallenges = [...daily, ...weekly];
    for (const challenge of allChallenges) {
        const dateKey = challenge.type === 'weekly' ? getWeekStart() : today;
        if (!data.challenges.find(c => c.challengeId === challenge.id && c.date === dateKey)) {
            data.challenges.push({
                challengeId: challenge.id,
                current: 0,
                completed: false,
                date: dateKey,
            });
        }
    }
    saveData(data);

    return { daily, weekly, progress: data.challenges };
}

export function updateChallengeProgress(challengeId: string, amount: number): { completed: boolean; pointsEarned: number; newBadges: string[] } {
    const data = loadData();
    const today = getToday();
    const dateKey = challengeId.startsWith('week-') ? getWeekStart() : today;

    const progress = data.challenges.find(c => c.challengeId === challengeId && c.date === dateKey);
    if (!progress || progress.completed) return { completed: false, pointsEarned: 0, newBadges: [] };

    progress.current = Math.min(progress.current + amount, 9999);

    // Find the challenge definition
    const allChallenges = [...CHALLENGE_POOL, ...WEEKLY_CHALLENGES];
    const challenge = allChallenges.find(c => c.id === challengeId);
    if (!challenge) return { completed: false, pointsEarned: 0, newBadges: [] };

    let pointsEarned = 0;
    const newBadges: string[] = [];

    if (progress.current >= challenge.target && !progress.completed) {
        progress.completed = true;
        progress.completedAt = new Date().toISOString();
        pointsEarned = challenge.points;
        data.totalPointsEarned += pointsEarned;

        // Update streak
        data.streak.lastActiveDate = today;
        if (data.streak.current === 0) data.streak.current = 1;
        data.streak.longest = Math.max(data.streak.longest, data.streak.current);

        // Sync points to rewards system
        syncPointsToRewards(pointsEarned);

        // Check for new badges
        const completedCount = data.challenges.filter(c => c.completed).length;
        if (completedCount === 1 && !data.badges.includes('first-challenge')) {
            data.badges.push('first-challenge');
            newBadges.push('first-challenge');
        }
        if (data.streak.current >= 3 && !data.badges.includes('streak-3')) {
            data.badges.push('streak-3');
            newBadges.push('streak-3');
        }
        if (data.streak.current >= 7 && !data.badges.includes('streak-7')) {
            data.badges.push('streak-7');
            newBadges.push('streak-7');
        }
        if (data.streak.current >= 30 && !data.badges.includes('streak-30')) {
            data.badges.push('streak-30');
            newBadges.push('streak-30');
        }
        if (data.totalPointsEarned >= 500 && !data.badges.includes('points-500')) {
            data.badges.push('points-500');
            newBadges.push('points-500');
        }
        if (data.totalPointsEarned >= 1000 && !data.badges.includes('points-1000')) {
            data.badges.push('points-1000');
            newBadges.push('points-1000');
        }
    }

    saveData(data);
    return { completed: progress.completed, pointsEarned, newBadges };
}

export function getChallengeStats(): { streak: UserStreak; totalPoints: number; badges: string[]; completedToday: number; totalCompleted: number } {
    const data = loadData();
    const today = getToday();
    const completedToday = data.challenges.filter(c => c.date === today && c.completed).length;
    const totalCompleted = data.challenges.filter(c => c.completed).length;

    return {
        streak: data.streak,
        totalPoints: data.totalPointsEarned,
        badges: data.badges,
        completedToday,
        totalCompleted,
    };
}
