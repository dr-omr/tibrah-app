/**
 * AI Health Memory — Long-term health context for AI conversations
 * Extracts and persists health information from user interactions
 * Provides rich context to AI for personalized responses
 */

export interface HealthProfile {
    // Extracted health conditions
    conditions: string[];
    // Medications mentioned
    medications: string[];
    // Allergies mentioned
    allergies: string[];
    // Health goals expressed
    goals: string[];
    // Preferred treatments / interests
    interests: string[];
    // Key health metrics snapshots
    metrics: {
        weight?: { value: number; date: string };
        height?: { value: number; date: string };
        bloodPressure?: { systolic: number; diastolic: number; date: string };
        sleepAvg?: { hours: number; date: string };
        waterAvg?: { cups: number; date: string };
    };
    // User preferences
    preferences: {
        language: 'ar' | 'en';
        responseStyle: 'brief' | 'detailed' | 'motivational';
        name?: string;
        age?: number;
        gender?: 'male' | 'female';
    };
    // Conversation insights — key takeaways
    insights: HealthInsight[];
    // Last updated
    updatedAt: string;
}

export interface HealthInsight {
    id: string;
    text: string;
    category: 'condition' | 'symptom' | 'goal' | 'progress' | 'concern';
    extractedAt: string;
    source: 'chat' | 'tracker' | 'analysis';
}

const STORAGE_KEY = 'tibrah_health_memory';
const MAX_INSIGHTS = 30;

// Health keyword patterns for Arabic text
const HEALTH_PATTERNS = {
    conditions: [
        /أعاني\s+من\s+(.+?)(?:\s|$|،|\.)/g,
        /عندي\s+(.+?)(?:\s|$|،|\.)/g,
        /مصاب\s+ب(.+?)(?:\s|$|،|\.)/g,
        /مشكلة\s+في\s+(.+?)(?:\s|$|،|\.)/g,
        /تم\s+تشخيصي\s+ب(.+?)(?:\s|$|،|\.)/g,
    ],
    medications: [
        /أستخدم\s+(.+?)(?:\s|$|،|\.)/g,
        /آخذ\s+(.+?)(?:\s|$|،|\.)/g,
        /دوائي\s+(.+?)(?:\s|$|،|\.)/g,
        /أتناول\s+دواء\s+(.+?)(?:\s|$|،|\.)/g,
    ],
    allergies: [
        /حساسية\s+(?:من|ل)\s*(.+?)(?:\s|$|،|\.)/g,
        /لا\s+أتحمل\s+(.+?)(?:\s|$|،|\.)/g,
    ],
    goals: [
        /أريد\s+أن\s+(.+?)(?:\s|$|،|\.)/g,
        /هدفي\s+(.+?)(?:\s|$|،|\.)/g,
        /محتاج\s+(.+?)(?:\s|$|،|\.)/g,
        /أحتاج\s+(.+?)(?:\s|$|،|\.)/g,
        /أبي\s+(.+?)(?:\s|$|،|\.)/g,
    ],
    weight: [
        /وزني\s+(\d+)/,
        /(\d+)\s*كيلو/,
        /(\d+)\s*kg/i,
    ],
    age: [
        /عمري\s+(\d+)/,
        /عندي\s+(\d+)\s+سنة/,
    ],
};

function loadProfile(): HealthProfile {
    if (typeof window === 'undefined') return getDefaultProfile();
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch { }
    return getDefaultProfile();
}

function getDefaultProfile(): HealthProfile {
    return {
        conditions: [],
        medications: [],
        allergies: [],
        goals: [],
        interests: [],
        metrics: {},
        preferences: { language: 'ar', responseStyle: 'motivational' },
        insights: [],
        updatedAt: new Date().toISOString(),
    };
}

function saveProfile(profile: HealthProfile): void {
    if (typeof window === 'undefined') return;
    profile.updatedAt = new Date().toISOString();
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch { }
}

function addUnique(arr: string[], value: string, maxItems = 20): string[] {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 100) return arr;
    if (arr.includes(trimmed)) return arr;
    return [...arr, trimmed].slice(-maxItems);
}

/**
 * Extract health information from user message text
 */
export function extractFromMessage(text: string): void {
    const profile = loadProfile();
    const today = new Date().toISOString().split('T')[0];

    // Extract conditions
    for (const pattern of HEALTH_PATTERNS.conditions) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(text)) !== null) {
            profile.conditions = addUnique(profile.conditions, match[1]);
        }
    }

    // Extract medications
    for (const pattern of HEALTH_PATTERNS.medications) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(text)) !== null) {
            profile.medications = addUnique(profile.medications, match[1]);
        }
    }

    // Extract allergies
    for (const pattern of HEALTH_PATTERNS.allergies) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(text)) !== null) {
            profile.allergies = addUnique(profile.allergies, match[1]);
        }
    }

    // Extract goals
    for (const pattern of HEALTH_PATTERNS.goals) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(text)) !== null) {
            profile.goals = addUnique(profile.goals, match[1]);
        }
    }

    // Extract weight
    for (const pattern of HEALTH_PATTERNS.weight) {
        const match = text.match(pattern);
        if (match) {
            const value = parseInt(match[1]);
            if (value > 20 && value < 300) {
                profile.metrics.weight = { value, date: today };
            }
        }
    }

    // Extract age
    for (const pattern of HEALTH_PATTERNS.age) {
        const match = text.match(pattern);
        if (match) {
            const age = parseInt(match[1]);
            if (age > 5 && age < 120) {
                profile.preferences.age = age;
            }
        }
    }

    // Detect gender hints
    if (text.includes('أنا رجل') || text.includes('أنا ذكر') || text.includes('أخ')) {
        profile.preferences.gender = 'male';
    } else if (text.includes('أنا امرأة') || text.includes('أنا أنثى') || text.includes('أخت')) {
        profile.preferences.gender = 'female';
    }

    saveProfile(profile);
}

/**
 * Add a specific health insight
 */
export function addInsight(text: string, category: HealthInsight['category'], source: HealthInsight['source'] = 'chat'): void {
    const profile = loadProfile();

    const insight: HealthInsight = {
        id: `insight_${Date.now()}`,
        text: text.substring(0, 200),
        category,
        extractedAt: new Date().toISOString(),
        source,
    };

    profile.insights = [...profile.insights, insight].slice(-MAX_INSIGHTS);
    saveProfile(profile);
}

/**
 * Update health metrics from tracker data
 */
export function updateMetrics(metrics: Partial<HealthProfile['metrics']>): void {
    const profile = loadProfile();
    profile.metrics = { ...profile.metrics, ...metrics };
    saveProfile(profile);
}

/**
 * Build AI context string from stored health memory
 * This is injected into the system prompt for personalized responses
 */
export function buildHealthContext(): string {
    const profile = loadProfile();
    const parts: string[] = [];

    // User info
    if (profile.preferences.name) {
        parts.push(`اسم المستخدم: ${profile.preferences.name}`);
    }
    if (profile.preferences.age) {
        parts.push(`العمر: ${profile.preferences.age} سنة`);
    }
    if (profile.preferences.gender) {
        parts.push(`الجنس: ${profile.preferences.gender === 'male' ? 'ذكر' : 'أنثى'}`);
    }

    // Health conditions
    if (profile.conditions.length > 0) {
        parts.push(`الحالات الصحية: ${profile.conditions.join('، ')}`);
    }

    // Medications
    if (profile.medications.length > 0) {
        parts.push(`الأدوية الحالية: ${profile.medications.join('، ')}`);
    }

    // Allergies
    if (profile.allergies.length > 0) {
        parts.push(`الحساسيات: ${profile.allergies.join('، ')}`);
    }

    // Goals
    if (profile.goals.length > 0) {
        parts.push(`الأهداف الصحية: ${profile.goals.slice(-5).join('، ')}`);
    }

    // Metrics
    if (profile.metrics.weight) {
        parts.push(`الوزن: ${profile.metrics.weight.value}كجم (${profile.metrics.weight.date})`);
    }
    if (profile.metrics.sleepAvg) {
        parts.push(`متوسط النوم: ${profile.metrics.sleepAvg.hours} ساعات`);
    }
    if (profile.metrics.waterAvg) {
        parts.push(`متوسط شرب الماء: ${profile.metrics.waterAvg.cups} أكواب`);
    }

    // Recent insights
    const recentInsights = profile.insights.slice(-5);
    if (recentInsights.length > 0) {
        parts.push(`ملاحظات سابقة: ${recentInsights.map(i => i.text).join(' | ')}`);
    }

    if (parts.length === 0) return '';

    return `\n\n[ذاكرة المستخدم الصحية]\n${parts.join('\n')}`;
}

/**
 * Get full health profile for display
 */
export function getHealthProfile(): HealthProfile {
    return loadProfile();
}

/**
 * Clear all health memory
 */
export function clearHealthMemory(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
}
