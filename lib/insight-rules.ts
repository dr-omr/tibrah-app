// lib/insight-rules.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Insight Rules Library (Sprint 5)
// ════════════════════════════════════════════════════════════════════════
//
// مكتبة موحّدة لتوليد tracker insights.
// تستبدل النصوص الـ hardcoded في TrackerInsightCard بمنطق مركزي متسق.
//
// الهدف: نفس النبرة + نفس منطق التصعيد عبر كل البروتوكولات.
// ════════════════════════════════════════════════════════════════════════

import type { InsightHook, InsightLevel } from '@/lib/protocol-registry';
import { getInsightHooks } from '@/lib/protocol-registry';
import type { SubdomainId } from '@/components/health-engine/types';

export interface TrackerInsight {
    emoji: string;
    label: string;
    level: InsightLevel;
    message: string;
    score: number | null;
    unit: string;
    shouldNudge: boolean;
    shouldEscalate: boolean;
}

/* ══════════════════════════════════════════════════════════
   CORE ENGINE
   ══════════════════════════════════════════════════════════ */

function classifyLevel(score: number, hook: InsightHook): InsightLevel {
    if (score <= hook.thresholds.low)  return 'low';
    if (score >= hook.thresholds.high) return 'high';
    return 'medium';
}

/**
 * Generate a contextual insight from a tracker log entry.
 *
 * @param hook       - The InsightHook definition
 * @param data       - Raw localStorage data from the tracker
 * @param unitLabel  - Display unit e.g. '/10' or '/5'
 */
function buildInsight(hook: InsightHook, data: Record<string, unknown>, unitLabel = '/10'): TrackerInsight {
    const raw   = data[hook.scoreField];
    const score = typeof raw === 'number' ? raw : null;

    if (score === null) {
        return {
            emoji: hook.emoji,
            label: hook.label,
            level: 'medium',
            message: `سجّلت ${hook.label} اليوم ✓`,
            score: null,
            unit: unitLabel,
            shouldNudge: false,
            shouldEscalate: false,
        };
    }

    const level   = classifyLevel(score, hook);
    const message = hook.messages[level];

    // النبرة: low = low score (مشكلة) في أدوات القلق والأعراض
    // لكن في الطاقة والنوم: low score = مشكلة أيضاً
    const shouldNudge    = level === 'medium';
    const shouldEscalate = level === 'low'; // low score = الأعراض شديدة = تحتاج تدخل

    return { emoji: hook.emoji, label: hook.label, level, message, score, unit: unitLabel, shouldNudge, shouldEscalate };
}

/* ══════════════════════════════════════════════════════════
   PUBLIC API
   ══════════════════════════════════════════════════════════ */

/**
 * Get the first matching tracker insight for a subdomain from localStorage.
 *
 * @param subdomainId  - e.g. 'anxiety_arousal'
 * @param planId       - used in the localStorage key
 */
export function getTrackerInsight(
    subdomainId: SubdomainId | string,
    planId: string,
): TrackerInsight | null {
    if (typeof window === 'undefined') return null;

    const hooks = getInsightHooks(subdomainId);
    if (hooks.length === 0) return null;

    const today = new Date().toDateString();

    for (const hook of hooks) {
        const key = `tibrah_tracker_${planId}_${hook.trackerId}_${today}`;
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const data = JSON.parse(raw) as Record<string, unknown>;
            // Guess unit from tracker hook (simple heuristic)
            const unit = hook.label.includes('نوم') ? '/5' : '/10';
            return buildInsight(hook, data, unit);
        } catch {
            /* ignore malformed data */
        }
    }

    return null;
}

/**
 * Get all insights for a given subdomain (one per hook).
 */
export function getAllTrackerInsights(
    subdomainId: SubdomainId | string,
    planId: string,
): TrackerInsight[] {
    if (typeof window === 'undefined') return [];

    const hooks  = getInsightHooks(subdomainId);
    const today  = new Date().toDateString();
    const result: TrackerInsight[] = [];

    for (const hook of hooks) {
        const key = `tibrah_tracker_${planId}_${hook.trackerId}_${today}`;
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const data = JSON.parse(raw) as Record<string, unknown>;
            const unit = hook.label.includes('نوم') ? '/5' : '/10';
            result.push(buildInsight(hook, data, unit));
        } catch { /* ignore */ }
    }

    return result;
}

/**
 * Determine if any today's tracker insight needs escalation (score very low).
 */
export function hasEscalationSignal(subdomainId: SubdomainId | string, planId: string): boolean {
    const insights = getAllTrackerInsights(subdomainId, planId);
    return insights.some(i => i.shouldEscalate);
}

/* ══════════════════════════════════════════════════════════
   FALLBACK — for subdomains without a registry entry
   Uses the legacy hardcoded TRACKER_TOOL_IDS from my-plan
   ══════════════════════════════════════════════════════════ */

const LEGACY_TRACKER_IDS = [
    { trackerId: 'jasadi_sleep_tracker',   scoreField: 'quality',         emoji: '😴', label: 'نوم', unit: '/5',
      thresholds: { low: 2, high: 4 },
      messages: { low: 'نوم ضعيف — بروتوكول المساء سيساعد الليلة', medium: 'نوم مقبول — نم أبكر 30 دقيقة', high: 'نوم جيد — جسمك يتعافى ✓' } },
    { trackerId: 'nafsi_anxiety_tracker',  scoreField: 'morning_anxiety', emoji: '🧘', label: 'قلق', unit: '/10',
      thresholds: { low: 3, high: 7 },
      messages: { low: 'قلق مرتفع — خذ استراحة قصيرة الآن', medium: 'قلق متوسط — تنفس 4-4-6 يساعد', high: 'قلق منخفض — يوم جيد نفسياً ✓' } },
    { trackerId: 'jasadi_energy_tracker',  scoreField: 'morning_energy',  emoji: '⚡', label: 'طاقة', unit: '/10',
      thresholds: { low: 4, high: 7 },
      messages: { low: 'طاقة منخفضة — ماء + حركة أولاً', medium: 'طاقة متوسطة — امشِ 10 دقائق', high: 'طاقة جيدة — استثمرها الآن ✓' } },
] as const;

/**
 * Fallback insight reader using legacy tracker IDs.
 * Used in TrackerInsightCard for subdomains not yet in the registry.
 */
export function getLegacyTrackerInsight(planId: string): TrackerInsight | null {
    if (typeof window === 'undefined') return null;

    const today = new Date().toDateString();

    for (const t of LEGACY_TRACKER_IDS) {
        const key = `tibrah_tracker_${planId}_${t.trackerId}_${today}`;
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const data  = JSON.parse(raw) as Record<string, unknown>;
            const score = typeof data[t.scoreField] === 'number' ? (data[t.scoreField] as number) : null;
            const level: InsightLevel = score === null
                ? 'medium'
                : score <= t.thresholds.low  ? 'low'
                : score >= t.thresholds.high ? 'high'
                : 'medium';
            return {
                emoji:          t.emoji,
                label:          t.label,
                level,
                message:        t.messages[level],
                score,
                unit:           t.unit,
                shouldNudge:    level === 'medium',
                shouldEscalate: level === 'low',
            };
        } catch { /* ignore */ }
    }

    return null;
}
