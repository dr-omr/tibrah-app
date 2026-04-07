/**
 * Clinical Intelligence: Drug Interaction Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Offline-first interaction checker using a lightweight bundled database.
 * Used to immediately flag dangerous combinations before backend validation.
 */

export type SeverityLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'contraindicated';

export interface InteractionResult {
    severity: SeverityLevel;
    description: string;
    action: string;
    drugsInvolved: string[];
}

// Minimal stub database of common high-risk interactions 
// Real-world usage would download an encrypted JSON during app init
const INTERACTION_DB: Record<string, Record<string, { severity: SeverityLevel, description: string, action: string }>> = {
    // Blood Thinners
    'warfarin': {
        'aspirin': {
            severity: 'severe',
            description: 'يزيد بشكل كبير من خطر النزيف. التفاعل بين مضادات التخثر ومضادات الالتهاب.',
            action: 'تجنب الاستخدام المتزامن. راجع د. عمر فوراً لضبط الجرعة.'
        },
        'ibuprofen': {
            severity: 'moderate',
            description: 'قد يزيد من خطر نزيف الجهاز الهضمي.',
            action: 'استخدم بحذر ولا تتجاوز الجرعة الموصوفة.'
        }
    },
    // ACE Inhibitors
    'lisinopril': {
        'spironolactone': {
            severity: 'severe',
            description: 'خطر ارتفاع البوتاسيوم في الدم بشكل مهدد للحياة (Hyperkalemia).',
            action: 'يتطلب مراقبة دقيقة لمستويات البوتاسيوم في الدم.'
        }
    },
    // Statins
    'atorvastatin': {
        'clarithromycin': {
            severity: 'contraindicated',
            description: 'يزيد من تركيز الستاتين في الدم وخطر تلف العضلات (Rhabdomyolysis).',
            action: 'يمنع الاستخدام المتزامن قطعياً.'
        },
        'grapefruit_juice': {
            severity: 'moderate',
            description: 'عصير الجريب فروت يمنع تكسير الدواء في الكبد مما يزيد من تركيزه.',
            action: 'تجنب شرب عصير الجريب فروت أثناء فترة العلاج.'
        }
    },
    // SSRIs
    'fluoxetine': {
        'st_johns_wort': {
            severity: 'severe',
            description: 'خطر متلازمة السيروتونين (Serotonin Syndrome) المهددة للحياة.',
            action: 'تجنب تناول عشبة القديس يوحنا (St. John\'s Wort) مع مضادات الاكتاب.'
        }
    }
};

/**
 * Normalizes drug names for matching against the DB
 */
function normalizeName(name: string): string {
    return name.toLowerCase().trim()
        .replace(/[^a-z0-9]/g, '_') // Replace spaces/symbols with _
        .replace(/_+/g, '_');
}

/**
 * Checks for interactions between a new drug and an existing list of drugs.
 */
export function checkInteraction(newDrugName: string, currentDrugs: string[]): InteractionResult[] {
    const results: InteractionResult[] = [];
    const normalizedNew = normalizeName(newDrugName);

    for (const current of currentDrugs) {
        const normalizedCurrent = normalizeName(current);

        // Check A vs B
        if (INTERACTION_DB[normalizedNew]?.[normalizedCurrent]) {
            results.push({
                ...INTERACTION_DB[normalizedNew][normalizedCurrent],
                drugsInvolved: [newDrugName, current]
            });
        }
        
        // Check B vs A
        if (INTERACTION_DB[normalizedCurrent]?.[normalizedNew]) {
            results.push({
                ...INTERACTION_DB[normalizedCurrent][normalizedNew],
                drugsInvolved: [current, newDrugName]
            });
        }
    }

    // Sort by severity (contraindicated first)
    const severityWeight: Record<SeverityLevel, number> = {
        'contraindicated': 4,
        'severe': 3,
        'moderate': 2,
        'mild': 1,
        'none': 0
    };

    return results.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
}

/**
 * Validates a whole list of medications against each other
 */
export function validateMedicationList(drugs: string[]): InteractionResult[] {
    const allResults: InteractionResult[] = [];
    
    for (let i = 0; i < drugs.length; i++) {
        for (let j = i + 1; j < drugs.length; j++) {
            const interactions = checkInteraction(drugs[i], [drugs[j]]);
            allResults.push(...interactions);
        }
    }
    
    // Deduplicate identical interactions
    const uniqueMap = new Map<string, InteractionResult>();
    for (const res of allResults) {
        const key = res.drugsInvolved.sort().join('_');
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, res);
        }
    }
    
    return Array.from(uniqueMap.values());
}
