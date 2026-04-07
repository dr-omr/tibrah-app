/**
 * Advanced Search Normalizer
 * Handles phonetic smoothing and English-to-Arabic keyboard layout mapping.
 */

const EN_TO_AR_MAP: Record<string, string> = {
    "`": "ذ", "q": "ض", "w": "ص", "e": "ث", "r": "ق", "t": "ف", "y": "غ", "u": "ع", "i": "ه", "o": "خ", "p": "ح", "[": "ج", "]": "د",
    "a": "ش", "s": "س", "d": "ي", "f": "ب", "g": "ل", "h": "ا", "j": "ت", "k": "ن", "l": "م", ";": "ك", "'": "ط",
    "z": "ئ", "x": "ء", "c": "ؤ", "v": "ر", "b": "لا", "n": "ى", "m": "ة", ",": "و", ".": "ز", "/": "ظ"
};

/**
 * Attempts to translate an English typing string to Arabic based on standard QWERTY layout.
 */
export function mapEnglishToArabicKeyboard(query: string): string | null {
    if (!query) return null;
    let isEnglish = false;
    let mapped = '';
    
    for (let char of query.toLowerCase()) {
        if (EN_TO_AR_MAP[char]) {
            mapped += EN_TO_AR_MAP[char];
            isEnglish = true;
        } else {
            mapped += char;
        }
    }
    
    return isEnglish ? mapped : null; // Only return if it actually mapped English chars
}

/**
 * Arabic Prefix Stripper
 * Removes common connector prefixes to expose the root word for strict matching.
 */
function stripArabicPrefixes(word: string): string {
    // Only strip prefixes if the word is long enough to avoid destroying 3-letter words
    if (word.length <= 4) return word;
    
    // Ordered by length (longest prefixes first)
    const prefixes = ['وال', 'فال', 'بال', 'كال', 'لل', 'ال', 'و', 'ب', 'ف', 'ك'];
    for (let prefix of prefixes) {
        if (word.startsWith(prefix)) {
            // Only strip if the remaining word is at least 3 letters
            if (word.length - prefix.length >= 3) {
                return word.slice(prefix.length);
            }
        }
    }
    return word;
}

/**
 * Medical Synonym Expansion Graph
 * Injects related concepts so the user finds what they mean, not just what they type.
 */
const MEDICAL_SYNONYMS: Record<string, string[]> = {
    "مغص": ["الم", "بطن", "تقلصات"],
    "صداع": ["راس", "الم", "شقيقه"],
    "تعب": ["ارهاق", "اجهاد", "نوم"],
    "علاج": ["دواء", "ادويه", "صيدليه", "حبوب"],
    "دواء": ["علاج", "شفاء", "وصفه"],
    "بطن": ["معده", "امعاء", "مغص"],
    "نوم": ["ارق", "نعاس", "راحه"],
    "حراره": ["حمى", "سخونه"]
};

/**
 * Unified Arabic string simplification for fuzzy searching.
 * Smooths out letters that people commonly misspell verbally or typographically.
 * Includes Lemmatization (Prefix stripping).
 */
export function normalizeSearchString(text: string, applyLemmatization: boolean = false): string {
    if (!text) return '';
    let normalized = text
        .toLowerCase()
        // Remove Arabic Diacritics (Tashkeel)
        .replace(/[\u064B-\u0652]/g, '')
        // Normalize Alif
        .replace(/[أإآ]/g, 'ا')
        // Normalize Ta-Marbuta to Ha
        .replace(/ة/g, 'ه')
        // Normalize Alif Maqsura to Yaa
        .replace(/ى/g, 'ي')
        // Phonetic Smoothing
        .replace(/[ظض]/g, 'ز') 
        .replace(/[ثص]/g, 'س')
        // Ignore spaces between al-tarif and next words
        .replace(/\s+/g, ' ')
        .trim();

    if (applyLemmatization) {
        normalized = normalized.split(' ').map(stripArabicPrefixes).join(' ');
    }
    
    return normalized;
}

/**
 * Semantic Expansion Engine
 * If the user types a word, this function silently appends known medical synonyms 
 * into the search query so the fuzzy engine can catch concept-based results.
 */
export function expandQueryWithSynonyms(query: string): string {
    const normalized = normalizeSearchString(query);
    const words = normalized.split(' ');
    let expansion = new Set<string>();
    
    words.forEach(word => {
        expansion.add(word); // Keep original
        if (MEDICAL_SYNONYMS[word]) {
            MEDICAL_SYNONYMS[word].forEach(syn => expansion.add(syn));
        }
    });

    return Array.from(expansion).join(' ');
}
