// lib/content/index.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Content Registry Index
// Aggregates all domain content into a single lookup map.
// ════════════════════════════════════════════════════════════════════════

export * from './tool-content-types';

import { JASADI_CONTENT } from './jasadi-content';
import { NAFSI_CONTENT } from './nafsi-content';
import { FIKRI_CONTENT } from './fikri-content';
import { RUHI_CONTENT } from './ruhi-content';

import type { ToolContent } from './tool-content-types';

export const TOOL_CONTENT: Record<string, ToolContent> = {
    ...JASADI_CONTENT,
    ...NAFSI_CONTENT,
    ...FIKRI_CONTENT,
    ...RUHI_CONTENT,
};

export function getToolContent(toolId: string): ToolContent | null {
    return TOOL_CONTENT[toolId] ?? null;
}

export function hasToolPage(toolId: string): boolean {
    return toolId in TOOL_CONTENT;
}

export function getToolPageUrl(type: string, toolId: string): string {
    return `/tools/${type}/${toolId}`;
}
