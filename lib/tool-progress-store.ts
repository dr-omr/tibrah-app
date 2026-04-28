// lib/tool-progress-store.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tool Progress Persistence Layer (Sprint F)
// ════════════════════════════════════════════════════════════════════════
//
// Per-tool progress tracking — survives page refresh and browser close.
// Independent from care-plan-store (additive, no breaking changes).
//
// Storage key: tibrah_tool_progress_{toolId}
// ════════════════════════════════════════════════════════════════════════

export type ToolStatus = 'not_started' | 'in_progress' | 'completed';

export interface ToolProgress {
    toolId: string;
    status: ToolStatus;
    startedAt?: string;        // ISO timestamp
    completedAt?: string;      // ISO timestamp
    lastVisitedAt: string;     // ISO timestamp

    // Practice: which step the user is on
    currentStep?: number;

    // Test: saved partial answers (question_id → selected value)
    savedAnswers?: Record<string, number>;

    // Protocol: per-day checked task IDs
    dayProgress?: Record<number, string[]>;

    // Tracker: how many times submitted
    submissionCount?: number;

    // Workshop: last expanded section index
    lastSectionViewed?: number;
}

/* ── Constants ────────────────────────────────────────── */
const PREFIX = 'tibrah_tool_progress_';

/* ── Helpers ──────────────────────────────────────────── */
function getKey(toolId: string): string {
    return PREFIX + toolId;
}

function safeRead<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function safeWrite(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // localStorage full — silent fail
    }
}

/* ── Public API ────────────────────────────────────────── */

/**
 * Get progress for a specific tool. Returns null if never visited.
 */
export function getToolProgress(toolId: string): ToolProgress | null {
    return safeRead<ToolProgress>(getKey(toolId));
}

/**
 * Save/update progress for a tool.
 * Merges with existing progress — safe to call with partial updates.
 */
export function saveToolProgress(toolId: string, update: Partial<ToolProgress>): void {
    const existing = getToolProgress(toolId);
    const now = new Date().toISOString();

    const merged: ToolProgress = {
        toolId,
        status: 'in_progress',
        lastVisitedAt: now,
        ...existing,
        ...update,
        // Always update lastVisitedAt
        ...(update.lastVisitedAt ? {} : { lastVisitedAt: now }),
    };

    // Auto-set startedAt on first save
    if (!merged.startedAt) {
        merged.startedAt = now;
    }

    safeWrite(getKey(toolId), merged);
}

/**
 * Mark a tool as started (in_progress).
 * Idempotent — won't overwrite if already in_progress or completed.
 */
export function markToolStarted(toolId: string): void {
    const existing = getToolProgress(toolId);
    if (existing && existing.status !== 'not_started') return;

    saveToolProgress(toolId, {
        status: 'in_progress',
        startedAt: new Date().toISOString(),
    });
}

/**
 * Mark a tool as completed.
 */
export function markToolProgressCompleted(toolId: string): void {
    saveToolProgress(toolId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
    });
}

/**
 * Get all tool IDs that have been completed.
 */
export function getCompletedToolIds(): string[] {
    if (typeof window === 'undefined') return [];

    const ids: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(PREFIX)) continue;
        try {
            const data = JSON.parse(localStorage.getItem(key)!) as ToolProgress;
            if (data.status === 'completed') ids.push(data.toolId);
        } catch { /* skip corrupted */ }
    }
    return ids;
}

/**
 * Get aggregate stats across all tools.
 */
export function getToolStats(): {
    opened: number;
    completed: number;
    inProgress: number;
} {
    if (typeof window === 'undefined') return { opened: 0, completed: 0, inProgress: 0 };

    let opened = 0, completed = 0, inProgress = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(PREFIX)) continue;
        try {
            const data = JSON.parse(localStorage.getItem(key)!) as ToolProgress;
            opened++;
            if (data.status === 'completed') completed++;
            else if (data.status === 'in_progress') inProgress++;
        } catch { /* skip */ }
    }
    return { opened, completed, inProgress };
}

/**
 * Get progress for multiple tools at once (batch read).
 */
export function getMultiToolProgress(toolIds: string[]): Record<string, ToolProgress | null> {
    const result: Record<string, ToolProgress | null> = {};
    toolIds.forEach(id => {
        result[id] = getToolProgress(id);
    });
    return result;
}
