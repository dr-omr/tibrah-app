/**
 * Splits lib/tool-content-map.ts into domain-specific files.
 * Run: node scripts/split-content-map.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');
const srcPath = join(root, 'lib', 'tool-content-map.ts');
const outDir = join(root, 'lib', 'content');

mkdirSync(outDir, { recursive: true });

const src = readFileSync(srcPath, 'utf8');
const lines = src.split('\n');

console.log(`Total lines: ${lines.length}`);

// ── Find key split points ────────────────────────────────────────────────────

function findLine(pattern, fromLine = 0) {
    for (let i = fromLine; i < lines.length; i++) {
        if (lines[i].includes(pattern)) return i;
    }
    return -1;
}

// Types block: lines 0..121
const typesEnd       = findLine("export const TOOL_CONTENT");          // line 122 → types end before this
const contentStart   = typesEnd;                                        // opening brace line

// Domain boundary markers inside TOOL_CONTENT
const nafsiStart     = findLine("'nafsi_anxiety_protocol'");
const fikriStart     = findLine("'fikri_overthink_protocol'");
const ruhi1Start     = findLine("'ruhi_rhythm_protocol'");

// Wave-2 nafsi psychosomatic
const nafsiW2Start   = findLine("NAFSI / PSYCHOSOMATIC");
// Wave-2 fikri  
const fikriW2Start   = findLine("'fikri_overthink_test'");
// Wave-2 ruhi
const ruhi2Start     = findLine("'ruhi_rhythm_test'");
// Wave-1 new content (sprint F)
const wave1Start     = findLine("WAVE 1 — PHASE 1 CONTENT FILL");
// Sprint F nafsi section
const nafsiSFStart   = findLine("'nafsi_suppress_test'");

// Helpers start
const helpersStart   = findLine("/* ══════════════════════════════════════════════════════════\n   HELPERS");
// fallback
const helpersStart2  = findLine("export function getToolContent");

console.log("typesEnd:", typesEnd);
console.log("nafsiStart:", nafsiStart);
console.log("fikriStart:", fikriStart);
console.log("ruhi1Start:", ruhi1Start);
console.log("nafsiW2Start:", nafsiW2Start);
console.log("fikriW2Start:", fikriW2Start);
console.log("ruhi2Start:", ruhi2Start);
console.log("wave1Start:", wave1Start);
console.log("nafsiSFStart:", nafsiSFStart);
console.log("helpers:", helpersStart, helpersStart2);

// ── Build types file ─────────────────────────────────────────────────────────

const typesContent = `// lib/content/tool-content-types.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tool Content Types (shared interfaces)
// ════════════════════════════════════════════════════════════════════════

${lines.slice(10, typesEnd).join('\n')}
`.trimStart();

writeFileSync(join(outDir, 'tool-content-types.ts'), typesContent, 'utf8');
console.log('✅ tool-content-types.ts');

// ── Helper: wrap entries as a Record export ──────────────────────────────────

function makeContentFile(name, domainComment, entryLines) {
    return `// lib/content/${name}.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — ${domainComment}
// ════════════════════════════════════════════════════════════════════════

import type {
    ToolContent,
    ProtocolContent, PracticeContent, TestContent,
    WorkshopContent, TrackerContent,
    ProtocolDay, ProtocolTask, PracticeStep,
    TestQuestion, TestResult,
    WorkshopSection, TrackerField,
} from './tool-content-types';

export const ${name.replace(/-/g,'_').toUpperCase()}_CONTENT: Record<string, ToolContent> = {
${entryLines.join('\n')}
};
`;
}

// ── Extract entry blocks ──────────────────────────────────────────────────────
// jasadi: from contentStart+1 to nafsiStart-1
// nafsi:  from nafsiStart to fikriStart-1  (includes wave-2 psychosomatic)
//         ALSO nafsiSFStart..wave1 nafsi section
// fikri:  from fikriStart to ruhi1Start-1  PLUS fikriW2Start..
// ruhi:   from ruhi1Start to nafsiW2Start-1  PLUS ruhi2Start..wave1Start

// After wave1Start (sprint F) we have: jasadi new, then nafsi new
// jasadi_energy_protocol = first key after wave1Start marker
const jasadiSFStart = findLine("'jasadi_energy_protocol'");

// jasadi content = lines contentStart+1..nafsiStart-1 (original) 
//                + lines jasadiSFStart..nafsiSFStart-1 (sprint F)
// nafsi content  = lines nafsiStart..fikriStart-1 (original)
//                + lines nafsiW2Start..fikriW2Start-1 (wave 2)
//                + lines nafsiSFStart..end-of-sprint-F-nafsi (sprint F)

// Easier: find ALL jasadi_* keys and ALL nafsi_* keys
const jasadiLines = [];
const nafsiLines  = [];
const fikriLines  = [];
const ruhuLines   = [];

// Find closing `};` of TOOL_CONTENT
let toolContentClose = findLine("export function getToolContent") - 2;
if (toolContentClose < 0) toolContentClose = lines.length - 60;

// Collect entries per domain
// Strategy: scan all lines, track current domain scope by key prefix
let currentKey = null;
let inEntry = false;
let entryLines = [];
let braceDepth = 0;

const domains = { jasadi: [], nafsi: [], fikri: [], ruhi: [] };

for (let i = contentStart + 1; i < toolContentClose; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect new top-level key inside TOOL_CONTENT
    const keyMatch = trimmed.match(/^'(jasadi|nafsi|fikri|ruhi)([^']+)':\s*\{/);
    
    if (!inEntry && keyMatch) {
        currentKey = keyMatch[1]; // domain prefix
        inEntry = true;
        braceDepth = 0;
        entryLines = [];
    }

    if (inEntry) {
        entryLines.push(line);
        // Count braces
        for (const ch of line) {
            if (ch === '{') braceDepth++;
            if (ch === '}') braceDepth--;
        }
        // Entry complete when outer brace closes
        if (braceDepth === 0 && entryLines.length > 1) {
            if (domains[currentKey]) {
                domains[currentKey].push(...entryLines, '');
            }
            inEntry = false;
            entryLines = [];
            currentKey = null;
        }
    }
}

console.log('jasadi entries total lines:', domains.jasadi.length);
console.log('nafsi entries total lines:', domains.nafsi.length);
console.log('fikri entries total lines:', domains.fikri.length);
console.log('ruhi entries total lines:', domains.ruhi.length);

// Write domain files
writeFileSync(join(outDir, 'jasadi-content.ts'), makeContentFile('jasadi-content', 'Jasadi (Physical) Tool Content', domains.jasadi), 'utf8');
console.log('✅ jasadi-content.ts');

writeFileSync(join(outDir, 'nafsi-content.ts'), makeContentFile('nafsi-content', 'Nafsi (Psychological) Tool Content', domains.nafsi), 'utf8');
console.log('✅ nafsi-content.ts');

writeFileSync(join(outDir, 'fikri-content.ts'), makeContentFile('fikri-content', 'Fikri (Intellectual) Tool Content', domains.fikri), 'utf8');
console.log('✅ fikri-content.ts');

writeFileSync(join(outDir, 'ruhi-content.ts'), makeContentFile('ruhi-content', 'Ruhi (Serenity) Tool Content', domains.ruhi), 'utf8');
console.log('✅ ruhi-content.ts');

// ── Write the new thin index file ─────────────────────────────────────────────
const indexContent = `// lib/content/index.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Content Registry Index
// Aggregates all domain content into a single lookup map.
// ════════════════════════════════════════════════════════════════════════

export * from './tool-content-types';

import { JASADI_CONTENT_CONTENT } from './jasadi-content';
import { NAFSI_CONTENT_CONTENT } from './nafsi-content';
import { FIKRI_CONTENT_CONTENT } from './fikri-content';
import { RUHI_CONTENT_CONTENT } from './ruhi-content';

import type { ToolContent } from './tool-content-types';

export const TOOL_CONTENT: Record<string, ToolContent> = {
    ...JASADI_CONTENT_CONTENT,
    ...NAFSI_CONTENT_CONTENT,
    ...FIKRI_CONTENT_CONTENT,
    ...RUHI_CONTENT_CONTENT,
};

export function getToolContent(toolId: string): ToolContent | null {
    return TOOL_CONTENT[toolId] ?? null;
}

export function hasToolPage(toolId: string): boolean {
    return toolId in TOOL_CONTENT;
}

export function getToolPageUrl(type: string, toolId: string): string {
    return \`/tools/\${type}/\${toolId}\`;
}
`;

writeFileSync(join(outDir, 'index.ts'), indexContent, 'utf8');
console.log('✅ content/index.ts');

// Log file sizes
const { statSync } = await import('fs');
const files = ['jasadi-content.ts', 'nafsi-content.ts', 'fikri-content.ts', 'ruhi-content.ts', 'tool-content-types.ts', 'index.ts'];
console.log('\n📦 File sizes:');
for (const f of files) {
    const stat = statSync(join(outDir, f));
    console.log(`  ${f}: ${Math.round(stat.size / 1024)}KB`);
}

console.log('\n🎉 Split complete!');
console.log('Next: update tool-content-map.ts to re-export from content/index.ts');
