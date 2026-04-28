// lib/recommendation-sequencer.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Recommendation Sequencer (Sprint F)
// ════════════════════════════════════════════════════════════════════════
//
// Transforms a flat list of tool recommendations into a guided sequence
// with badges, ordering, and completion awareness.
//
// Does NOT modify routing/scoring/triage — reads only.
// ════════════════════════════════════════════════════════════════════════

import type { ToolType } from '@/components/health-engine/types';

export type ToolBadge = 'start_here' | 'daily' | 'learn' | 'track' | 'plan' | 'if_stuck';

export interface SequencedTool {
    id: string;
    type: ToolType;
    order: number;
    badge: ToolBadge;
    badgeAr: string;
    badgeEmoji: string;
    isCompleted: boolean;
    isNext: boolean;       // true for the first non-completed tool
}

/* ── Badge definitions ────────────────────────────────── */
const BADGE_MAP: Record<ToolBadge, { ar: string; emoji: string }> = {
    start_here: { ar: 'ابدأ هنا',    emoji: '🎯' },
    daily:      { ar: 'يومي',       emoji: '⚡' },
    learn:      { ar: 'تعلّم',      emoji: '📖' },
    track:      { ar: 'تتبّع',      emoji: '📊' },
    plan:       { ar: 'خطتك',       emoji: '🗓️' },
    if_stuck:   { ar: 'لو لم تتحسن', emoji: '🔄' },
};

/* ── Type → Badge mapping ─────────────────────────────── */
const TYPE_BADGE: Record<string, ToolBadge> = {
    test:     'start_here',
    practice: 'daily',
    workshop: 'learn',
    protocol: 'plan',
    tracker:  'track',
};

/* ── Type → Order (lower = first) ─────────────────────── */
const TYPE_ORDER: Record<string, number> = {
    test:     1,
    practice: 2,
    workshop: 3,
    protocol: 4,
    tracker:  5,
};

/* ── Public API ────────────────────────────────────────── */

/**
 * Sequence a flat list of tool recommendations into an ordered,
 * badge-tagged, completion-aware list.
 *
 * @param tools - flat tool list (from routing.recommended_tools or subdomain.tools)
 * @param completedIds - set of completed tool IDs (from tool-progress-store)
 */
export function sequenceTools(
    tools: Array<{ id: string; type: string }>,
    completedIds: string[],
): SequencedTool[] {
    const completedSet = new Set(completedIds);

    // Sort by type order
    const sorted = [...tools].sort((a, b) => {
        const orderA = TYPE_ORDER[a.type] ?? 99;
        const orderB = TYPE_ORDER[b.type] ?? 99;
        return orderA - orderB;
    });

    let foundNext = false;

    return sorted.map((tool, index) => {
        const badge = TYPE_BADGE[tool.type] ?? 'learn';
        const badgeInfo = BADGE_MAP[badge];
        const isCompleted = completedSet.has(tool.id);
        const isNext = !isCompleted && !foundNext;

        if (isNext) foundNext = true;

        return {
            id: tool.id,
            type: tool.type as ToolType,
            order: index + 1,
            badge,
            badgeAr: badgeInfo.ar,
            badgeEmoji: badgeInfo.emoji,
            isCompleted,
            isNext,
        };
    });
}

/**
 * Get the next recommended tool (first non-completed in sequence).
 */
export function getNextTool(
    tools: Array<{ id: string; type: string }>,
    completedIds: string[],
): SequencedTool | null {
    const sequenced = sequenceTools(tools, completedIds);
    return sequenced.find(t => t.isNext) ?? null;
}

/**
 * Get completion percentage for a set of tools.
 */
export function getToolSetCompletion(
    tools: Array<{ id: string }>,
    completedIds: string[],
): { completed: number; total: number; percent: number } {
    const completedSet = new Set(completedIds);
    const completed = tools.filter(t => completedSet.has(t.id)).length;
    const total = tools.length;
    return {
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
}

/**
 * Get the tools for a specific subdomain from the routing map.
 * This is a helper to extract subdomain tools from the full routing data.
 */
export function getSubdomainTools(
    subdomainId: string,
    allTools: Array<{ id: string; type: string }>,
): Array<{ id: string; type: string }> {
    // Tools follow the pattern: {domain}_{subdomain}_{type}
    return allTools.filter(t => {
        const parts = t.id.split('_');
        if (parts.length < 3) return false;
        // Remove domain prefix and type suffix to get subdomain
        const sub = parts.slice(1, -1).join('_');
        return sub === subdomainId;
    });
}
