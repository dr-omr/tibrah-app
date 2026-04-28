// lib/tool-content-map.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tool Content Map (Compatibility Shim)
// ════════════════════════════════════════════════════════════════════════
//
// This file is now a thin re-export shim.
// All content is in modular domain files under lib/content/:
//
//   lib/content/jasadi-content.ts  — 40 entries (8 subdomains × 5 tools)
//   lib/content/nafsi-content.ts   — 30 entries (6 subdomains × 5 tools)
//   lib/content/fikri-content.ts   — 30 entries (6 subdomains × 5 tools)
//   lib/content/ruhi-content.ts    — 30 entries (6 subdomains × 5 tools)
//   lib/content/tool-content-types.ts — all shared interfaces
//   lib/content/index.ts           — aggregates all into TOOL_CONTENT
//
// All existing imports from '@/lib/tool-content-map' continue to work.
// ════════════════════════════════════════════════════════════════════════

import type { ToolType } from '@/components/health-engine/types';

// Re-export all types (backwards compatible)
export type {
    ToolContent,
    ProtocolContent,
    ProtocolDay,
    ProtocolTask,
    PracticeContent,
    PracticeStep,
    TestContent,
    TestQuestion,
    TestResult,
    WorkshopContent,
    WorkshopSection,
    TrackerContent,
    TrackerField,
} from './content/tool-content-types';

// Re-export the merged content map and helper functions
export { TOOL_CONTENT } from './content/index';

// ── Helper Functions ──────────────────────────────────────────────────────────
import { TOOL_CONTENT } from './content/index';
import type { ToolContent } from './content/tool-content-types';

/**
 * Get tool content by tool ID.
 * Returns null if no content is defined yet.
 */
export function getToolContent(toolId: string): ToolContent | null {
    return TOOL_CONTENT[toolId] ?? null;
}

/**
 * Build the tool page URL from tool type and ID.
 * /tools/protocol/jasadi_digestive_protocol
 */
export function getToolPageUrl(type: ToolType, toolId: string): string {
    return `/tools/${type}/${toolId}`;
}

/**
 * Check if a tool has a real page (embedded content) vs. redirect.
 */
export function hasToolPage(toolId: string): boolean {
    return toolId in TOOL_CONTENT;
}
