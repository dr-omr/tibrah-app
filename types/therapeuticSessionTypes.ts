// ============================================================
// Therapeutic Audio Hub — Unified Types
// ============================================================

/** Evidence grading for each session */
export type EvidenceLevel =
  | 'evidence_supported'    // Backed by peer-reviewed research (e.g. binaural beats for relaxation)
  | 'emerging_evidence'     // Preliminary studies / pilot data
  | 'traditional_experiential' // Traditional practices, community-reported benefits
  | 'exploratory_only';     // No clinical evidence — purely experimental / symbolic

/** Safety classification */
export type SafetyLevel = 'safe_general' | 'caution_advised' | 'restricted';

/** Audio generation / playback type */
export type AudioType =
  | 'binaural_beat'
  | 'isochronic_tone'
  | 'pure_tone'
  | 'tone_sequence'    // Rife-style multi-frequency
  | 'guided_audio'
  | 'soundscape'
  | 'mixed';

/** Beat / entrainment type */
export type BeatType = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'none';

/** Session depth level */
export type DepthLevel = 'beginner' | 'intermediate' | 'advanced';

/** Guidance type */
export type GuidanceType = 'unguided' | 'light_guidance' | 'full_guidance' | 'breathwork_led';

/** All session categories */
export type SessionCategory =
  | 'relaxation'
  | 'sleep'
  | 'focus'
  | 'emotional_regulation'
  | 'pain_coping'
  | 'breathwork'
  | 'meditation_depth'
  | 'solfeggio_inspired'
  | 'binaural_entrainment'
  | 'monroe_inspired'
  | 'nature_soundscapes'
  | 'guided_healing'
  | 'chakra_traditional'
  | 'rife_exploratory'
  | 'organ_support'
  | 'custom';

/** Source type of the session */
export type SourceType = 'original' | 'community' | 'clinician' | 'imported';

// ============================================================
// Core Session Model
// ============================================================

export interface TherapeuticSession {
  id: string;
  title_ar: string;
  title_en: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  description_ar: string;
  description_en?: string;

  // Classification
  category: SessionCategory;
  tags: string[];
  protocol_type?: string;           // e.g. "binaural_entrainment", "rife_sequence", "guided_breathwork"

  // Intent
  intended_outcome_ar: string;
  intended_outcome_en?: string;
  not_intended_for_ar?: string;     // "This does NOT claim to treat…"
  not_intended_for_en?: string;

  // Evidence & Safety
  evidence_level: EvidenceLevel;
  safety_level: SafetyLevel;
  contraindications_ar?: string[];
  contraindications_en?: string[];
  headphone_required: boolean;
  best_time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
  session_end_grounding: boolean;   // Show grounding/reorientation at session end

  // Audio
  audio_type: AudioType;
  beat_type: BeatType;
  guidance_type: GuidanceType;
  frequency_hz?: number;            // Primary frequency for display
  frequencies?: number[];           // Multi-frequency (Rife sequences)
  carrier_frequency?: number;       // For binaural: carrier
  background_sound?: string;        // e.g. "rain", "ocean", "none"
  duration_options: number[];       // Available durations in minutes, e.g. [5, 10, 15, 30]
  default_duration: number;         // Default in minutes
  frequency_display?: string;       // Human-readable e.g. "10 Hz Alpha"

  // Therapeutic depth
  therapeutic_goal?: string;        // Primary goal: "deep_relaxation", "sleep_prep", etc.
  emotional_tone?: string;          // Mood/tone: "calming", "uplifting", "grounding", etc.
  depth_level?: DepthLevel;         // beginner / intermediate / advanced
  beginner_friendly?: boolean;      // Quick filter for beginner pathway
  who_suits_ar?: string;            // "مناسب لمن يعاني من الأرق"
  when_to_use_ar?: string;          // "استخدمها قبل النوم بـ30 دقيقة"
  mood_tags?: string[];             // For mood-based discovery: ['stressed','anxious','tired']
  track_url?: string;               // For pre-recorded audio files

  // Metadata
  language: 'ar' | 'en' | 'bilingual';
  source_type: SourceType;
  research_source?: string;
  premium: boolean;
  featured: boolean;
  icon?: string;                    // Emoji or icon name
  color?: string;                   // Brand color for the card
  image_url?: string;

  // User State (managed at runtime / localStorage)
  // These are default values for new sessions
  is_favorite?: boolean;
  recently_played?: boolean;
  play_count?: number;
  last_played_at?: string;

  // Relations
  related_session_ids?: string[];
  related_program_ids?: string[];
}

// ============================================================
// Evidence Badge Info
// ============================================================

export interface EvidenceLevelInfo {
  level: EvidenceLevel;
  label_ar: string;
  label_en: string;
  color: string;
  bg_color: string;
  icon: string;        // Emoji
  description_ar: string;
  description_en: string;
}

export const EVIDENCE_LEVELS: Record<EvidenceLevel, EvidenceLevelInfo> = {
  evidence_supported: {
    level: 'evidence_supported',
    label_ar: 'مدعوم بالأدلة',
    label_en: 'Evidence-Supported',
    color: 'text-emerald-700',
    bg_color: 'bg-emerald-50',
    icon: '🟢',
    description_ar: 'مدعوم بدراسات علمية محكّمة',
    description_en: 'Backed by peer-reviewed research',
  },
  emerging_evidence: {
    level: 'emerging_evidence',
    label_ar: 'أدلة ناشئة',
    label_en: 'Emerging Evidence',
    color: 'text-amber-700',
    bg_color: 'bg-amber-50',
    icon: '🟡',
    description_ar: 'دراسات أولية واعدة',
    description_en: 'Preliminary studies show promise',
  },
  traditional_experiential: {
    level: 'traditional_experiential',
    label_ar: 'تقليدي / تجريبي',
    label_en: 'Traditional / Experiential',
    color: 'text-blue-700',
    bg_color: 'bg-blue-50',
    icon: '🔵',
    description_ar: 'ممارسات تقليدية وتجارب شخصية',
    description_en: 'Traditional practice with anecdotal reports',
  },
  exploratory_only: {
    level: 'exploratory_only',
    label_ar: 'استكشافي فقط',
    label_en: 'Exploratory Only',
    color: 'text-slate-600',
    bg_color: 'bg-slate-100',
    icon: '⚪',
    description_ar: 'لا توجد أدلة سريرية — للاستكشاف فقط',
    description_en: 'No clinical evidence — experimental only',
  },
};

// ============================================================
// Category Definition
// ============================================================

export interface CategoryDefinition {
  id: SessionCategory;
  label_ar: string;
  label_en: string;
  icon: string;
  color_from: string;
  color_to: string;
  description_ar?: string;
}

// ============================================================
// Programs / Protocols
// ============================================================

export interface ProgramSession {
  session_id: string;
  day: number;
  order: number;
  required: boolean;
  note_ar?: string;
  note_en?: string;
}

export interface TherapeuticProgram {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en?: string;
  category: SessionCategory;
  duration_days: number;
  sessions: ProgramSession[];
  evidence_level: EvidenceLevel;
  icon: string;
  color_from: string;
  color_to: string;
  featured: boolean;
  tags: string[];
}

// ============================================================
// User Progress (localStorage)
// ============================================================

export interface UserSessionProgress {
  session_id: string;
  play_count: number;
  total_minutes: number;
  last_played_at: string;
  is_favorite: boolean;
  last_position_seconds?: number;
}

export interface UserProgramProgress {
  program_id: string;
  started_at: string;
  current_day: number;
  completed_sessions: string[];  // session_ids
  is_complete: boolean;
}

// ============================================================
// Featured Collection
// ============================================================

export interface FeaturedCollection {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  icon: string;
  color_from: string;
  color_to: string;
  session_ids: string[];
}

// ============================================================
// Mood Discovery Card (for quick-pick discovery row)
// ============================================================

export interface MoodDiscoveryCard {
  id: string;
  label_ar: string;
  label_en: string;
  icon: string;
  mood_key: string;     // Maps to session mood_tags
  color_from: string;
  color_to: string;
}
