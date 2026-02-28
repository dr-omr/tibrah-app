// Emotional Medicine Data - Lazy-loaded from /public/data/emotional-diseases.json
// Previously 112 KB embedded in bundle — now loaded on demand (~89 KB saved from JS bundle)

export interface EmotionalDisease {
    id: string;
    organSystem: string;
    organSystemEn: string;
    targetOrgan: string;
    symptom: string;
    emotionalConflict: string;
    biologicalPurpose: string;
    healingAffirmation: string;
    treatmentSteps: string[];
    sourceRef: string;
}

export interface OrganSystem {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    color: string;
}

// ============================================
// Cache for loaded data
// ============================================
let _cachedDiseases: EmotionalDisease[] | null = null;
let _cachedSystems: OrganSystem[] | null = null;
let _loadPromise: Promise<void> | null = null;

// ============================================
// Lazy-load function — fetches JSON on first use
// ============================================
async function loadData(): Promise<void> {
    if (_cachedDiseases && _cachedSystems) return;
    if (_loadPromise) return _loadPromise;

    _loadPromise = fetch('/data/emotional-diseases.json')
        .then(res => res.json())
        .then(data => {
            _cachedDiseases = data.emotionalDiseases;
            _cachedSystems = data.organSystems;
        })
        .catch(err => {
            console.error('Failed to load emotional diseases data:', err);
            _cachedDiseases = [];
            _cachedSystems = [];
        });

    return _loadPromise;
}

// ============================================
// Async accessors (preferred — use these in components)
// ============================================

/** Load and return all emotional diseases */
export async function getEmotionalDiseases(): Promise<EmotionalDisease[]> {
    await loadData();
    return _cachedDiseases || [];
}

/** Load and return all organ systems */
export async function getOrganSystems(): Promise<OrganSystem[]> {
    await loadData();
    return _cachedSystems || [];
}

/** Get diseases filtered by organ system */
export async function getDiseasesBySystemAsync(systemId: string): Promise<EmotionalDisease[]> {
    const diseases = await getEmotionalDiseases();
    return diseases.filter(d => d.organSystemEn === systemId);
}

/** Search diseases by query */
export async function searchDiseasesAsync(query: string): Promise<EmotionalDisease[]> {
    const diseases = await getEmotionalDiseases();
    return diseases.filter(d =>
        d.symptom.includes(query) ||
        d.targetOrgan.includes(query) ||
        d.emotionalConflict.includes(query) ||
        d.organSystem.includes(query)
    );
}

// ============================================
// Synchronous backward-compatible exports
// These return cached data (empty if not yet loaded)
// Components should call loadData() in useEffect first
// ============================================

/** @deprecated Use getEmotionalDiseases() async instead */
export const emotionalDiseases: EmotionalDisease[] = new Proxy([] as EmotionalDisease[], {
    get(target, prop) {
        if (_cachedDiseases) return Reflect.get(_cachedDiseases, prop);
        // If not loaded yet, trigger load and return empty for now
        loadData();
        return Reflect.get(target, prop);
    }
});

/** @deprecated Use getOrganSystems() async instead */
export const organSystems: OrganSystem[] = new Proxy([] as OrganSystem[], {
    get(target, prop) {
        if (_cachedSystems) return Reflect.get(_cachedSystems, prop);
        loadData();
        return Reflect.get(target, prop);
    }
});

// Helper function to get diseases by organ system (sync, backward-compatible)
export const getDiseasesBySystem = (systemId: string): EmotionalDisease[] => {
    if (!_cachedDiseases) return [];
    return _cachedDiseases.filter(d => d.organSystemEn === systemId);
};

// Helper function to search diseases (sync, backward-compatible)
export const searchDiseases = (query: string): EmotionalDisease[] => {
    if (!_cachedDiseases) return [];
    return _cachedDiseases.filter(d =>
        d.symptom.includes(query) ||
        d.targetOrgan.includes(query) ||
        d.emotionalConflict.includes(query) ||
        d.organSystem.includes(query)
    );
};

/** Preload data — call in useEffect to ensure data is ready */
export const preloadEmotionalData = loadData;
