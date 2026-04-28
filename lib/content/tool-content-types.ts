// lib/content/tool-content-types.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tool Content Types (shared interfaces)
// ════════════════════════════════════════════════════════════════════════


/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

// --- Protocol ---
export interface ProtocolTask {
    id: string;
    text: string;
    durationMinutes: number;
    emoji: string;
}
export interface ProtocolDay {
    day: number;
    title: string;
    subtitle: string;
    tasks: ProtocolTask[];
}
export interface ProtocolContent {
    type: 'protocol';
    totalDays: 3 | 5 | 7 | 14;
    goal: string;
    howItWorks: string;
    days: ProtocolDay[];
    completionMessage: string;
}

// --- Practice ---
export interface PracticeStep {
    index: number;
    instruction: string;
    durationSeconds?: number;
}
export interface PracticeContent {
    type: 'practice';
    durationMinutes: number;
    goal: string;
    intro: string;
    steps: PracticeStep[];
    closingNote: string;
    repeatSuggestion: string;
}

// --- Test ---
export interface TestQuestion {
    id: string;
    text: string;
    options: { value: number; label: string }[];
}
export interface TestResult {
    minScore: number;
    maxScore: number;
    level: 'low' | 'moderate' | 'high';
    title: string;
    message: string;
    nextStep: string;
}
export interface TestContent {
    type: 'test';
    totalQuestions: number;
    goal: string;
    intro: string;
    questions: TestQuestion[];
    results: TestResult[];
}

// --- Workshop ---
export interface WorkshopSection {
    title: string;
    body: string;
    emoji: string;
    /** Optional YouTube video ID for this section */
    videoId?: string;
    /** Video title (shown above player) */
    videoTitle?: string;
    /** Why this video matters (shown as subtitle) */
    videoReason?: string;
}
export interface WorkshopContent {
    type: 'workshop';
    durationMinutes: number;
    goal: string;
    intro: string;
    /** Optional hero video for the entire workshop */
    heroVideoId?: string;
    /** Hero video title */
    heroVideoTitle?: string;
    sections: WorkshopSection[];
    keyTakeaways: string[];
    closingAction: string;
}

// --- Tracker ---
export interface TrackerField {
    id: string;
    label: string;
    emoji: string;
    type: 'scale' | 'boolean' | 'text' | 'choice';
    options?: string[];      // for 'choice'
    min?: number; max?: number; // for 'scale'
}
export interface TrackerContent {
    type: 'tracker';
    durationMinutes: number;
    goal: string;
    intro: string;
    fields: TrackerField[];
    insight: string;
}

export type ToolContent =
    | ProtocolContent
    | PracticeContent
    | TestContent
    | WorkshopContent
    | TrackerContent;

/* ══════════════════════════════════════════════════════════
   CONTENT MAP
   ══════════════════════════════════════════════════════════ */

