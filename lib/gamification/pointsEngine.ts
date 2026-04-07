import db from '@/lib/db';

export type GamificationAction =
    | 'daily_checkin'        // 10 pts
    | 'book_appointment'     // 50 pts
    | 'premium_subscription' // 500 pts
    | 'complete_course'      // 100 pts
    | 'add_family_member';   // 20 pts

interface GamificationRules {
    [key: string]: {
        points: number;
        cooldownMs?: number; // Time before action can be rewarded again
    };
}

export const POINTS_RULES: GamificationRules = {
    'daily_checkin': { points: 10, cooldownMs: 24 * 60 * 60 * 1000 },
    'book_appointment': { points: 50 },
    'premium_subscription': { points: 500 },
    'complete_course': { points: 100 },
    'add_family_member': { points: 20 }
};

export async function awardPoints(userId: string, action: GamificationAction): Promise<{ awarded: boolean; newTotal: number; newTier?: string; pointsAdded: number }> {
    const rule = POINTS_RULES[action];
    if (!rule) throw new Error('Invalid action');

    const user = (await db.entities.User.get(userId)) as any;
    if (!user) throw new Error('User not found');

    const currentPoints: number = typeof user.loyalty_points === 'number' ? user.loyalty_points : 0;
    const history = Array.isArray(user.rewards_history) ? user.rewards_history : [];

    // Check cooldown
    if (rule.cooldownMs) {
        const lastAction = history.find((h: any) => h.action === action);
        if (lastAction && lastAction.timestamp) {
            const timeSince = Date.now() - new Date(lastAction.timestamp).getTime();
            if (timeSince < rule.cooldownMs) {
                return { awarded: false, newTotal: currentPoints, pointsAdded: 0 };
            }
        }
    }

    const newTotal = currentPoints + rule.points;
    let newTier = user.loyalty_tier || 'silver';

    // Tier logic
    if (newTotal >= 2000) newTier = 'platinum';
    else if (newTotal >= 500) newTier = 'gold';

    const newHistoryEntry = {
        action,
        points: rule.points,
        timestamp: new Date().toISOString()
    };

    const updates: any = {
        loyalty_points: newTotal,
        loyalty_tier: newTier,
        rewards_history: [newHistoryEntry, ...history].slice(0, 50) // Keep last 50
    };

    await db.entities.User.update(userId, updates);

    return {
        awarded: true,
        newTotal,
        newTier: newTier !== user.loyalty_tier ? newTier : undefined,
        pointsAdded: rule.points
    };
}
