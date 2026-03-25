import { TherapeuticSession, TherapeuticProgram, FeaturedCollection } from '@/types/therapeuticSessionTypes';

// ============================================================
// Helper to create sessions with shared defaults
// ============================================================
const s = (partial: Partial<TherapeuticSession> & Pick<TherapeuticSession, 'id' | 'title_ar' | 'title_en' | 'description_ar' | 'category' | 'evidence_level' | 'audio_type' | 'beat_type'>): TherapeuticSession => ({
  subtitle_ar: '', subtitle_en: '', description_en: '',
  intended_outcome_ar: partial.description_ar,
  tags: [], protocol_type: '',
  safety_level: 'safe_general',
  headphone_required: partial.audio_type === 'binaural_beat',
  session_end_grounding: false,
  guidance_type: 'unguided',
  duration_options: [5, 10, 15, 30],
  default_duration: 15,
  language: 'bilingual',
  source_type: 'original',
  premium: false,
  featured: false,
  icon: '🎵',
  ...partial,
});

// ============================================================
// EVIDENCE-SUPPORTED SESSIONS
// ============================================================
const evidenceSupportedSessions: TherapeuticSession[] = [
  s({
    id: 'es-001', title_ar: 'استرخاء ألفا العميق', title_en: 'Deep Alpha Relaxation',
    description_ar: 'موجات ألفا (10 هرتز) لتهدئة الجهاز العصبي وتقليل التوتر',
    category: 'relaxation', evidence_level: 'evidence_supported',
    audio_type: 'binaural_beat', beat_type: 'alpha',
    frequency_hz: 10, carrier_frequency: 200,
    frequency_display: '10 Hz Alpha', icon: '🌿', featured: true,
    intended_outcome_ar: 'استرخاء عميق وتهدئة الجهاز العصبي',
    tags: ['relaxation', 'stress', 'calm'], best_time_of_day: 'evening',
    duration_options: [5, 10, 15, 30, 60], default_duration: 15,
    related_session_ids: ['es-002', 'es-004'],
  }),
  s({
    id: 'es-002', title_ar: 'تحضير النوم دلتا', title_en: 'Delta Sleep Preparation',
    description_ar: 'موجات دلتا (2 هرتز) للتحضير للنوم العميق والمريح',
    category: 'sleep', evidence_level: 'evidence_supported',
    audio_type: 'binaural_beat', beat_type: 'delta',
    frequency_hz: 2, carrier_frequency: 150,
    frequency_display: '2 Hz Delta', icon: '🌙', featured: true,
    intended_outcome_ar: 'تحضير الجسم والعقل للنوم العميق',
    tags: ['sleep', 'insomnia', 'rest'], best_time_of_day: 'night',
    session_end_grounding: false, duration_options: [10, 15, 30, 45, 60], default_duration: 30,
    related_session_ids: ['es-001', 'em-001'],
  }),
  s({
    id: 'es-003', title_ar: 'تعزيز التركيز بيتا', title_en: 'Beta Focus Enhancement',
    description_ar: 'موجات بيتا (18 هرتز) لتحسين التركيز والانتباه والوضوح الذهني',
    category: 'focus', evidence_level: 'evidence_supported',
    audio_type: 'binaural_beat', beat_type: 'beta',
    frequency_hz: 18, carrier_frequency: 250,
    frequency_display: '18 Hz Beta', icon: '🎯', featured: true,
    intended_outcome_ar: 'تعزيز التركيز والوضوح الذهني',
    tags: ['focus', 'study', 'work', 'concentration'], best_time_of_day: 'morning',
    duration_options: [10, 15, 30, 45], default_duration: 15,
  }),
  s({
    id: 'es-004', title_ar: 'إعادة ضبط التوتر ثيتا', title_en: 'Theta Stress Reset',
    description_ar: 'موجات ثيتا (6 هرتز) لإعادة ضبط الجهاز العصبي وتخفيف التوتر المتراكم',
    category: 'relaxation', evidence_level: 'evidence_supported',
    audio_type: 'binaural_beat', beat_type: 'theta',
    frequency_hz: 6, carrier_frequency: 180,
    frequency_display: '6 Hz Theta', icon: '🧘',
    intended_outcome_ar: 'تخفيف التوتر المتراكم وإعادة التوازن',
    tags: ['stress', 'reset', 'calm'], best_time_of_day: 'afternoon',
    session_end_grounding: true, duration_options: [10, 15, 20, 30], default_duration: 15,
  }),
  s({
    id: 'es-005', title_ar: 'تنظيم التنفس الهادئ', title_en: 'Calm Breathing Pacer',
    description_ar: 'ترددات ألفا-ثيتا (4-7 هرتز) مع إيقاع تنفس هادئ لتعزيز الاسترخاء',
    category: 'breathwork', evidence_level: 'evidence_supported',
    audio_type: 'binaural_beat', beat_type: 'theta',
    frequency_hz: 5, carrier_frequency: 200,
    frequency_display: '4-7 Hz', icon: '🌬️', guidance_type: 'breathwork_led',
    intended_outcome_ar: 'تنظيم التنفس وتحقيق الهدوء',
    tags: ['breathing', 'calm', 'anxiety'], best_time_of_day: 'anytime',
    duration_options: [3, 5, 10, 15], default_duration: 5,
  }),
];

// ============================================================
// EMERGING EVIDENCE SESSIONS
// ============================================================
const emergingEvidenceSessions: TherapeuticSession[] = [
  s({
    id: 'em-001', title_ar: 'نزول التأمل', title_en: 'Meditation Descent',
    description_ar: 'تدرج من ألفا إلى ثيتا للوصول لحالات تأمل أعمق تدريجياً',
    category: 'meditation_depth', evidence_level: 'emerging_evidence',
    audio_type: 'binaural_beat', beat_type: 'theta',
    frequency_hz: 7, carrier_frequency: 200,
    frequency_display: 'Alpha→Theta', icon: '🧘', featured: true,
    intended_outcome_ar: 'الوصول لحالة تأمل هادئة وعميقة',
    tags: ['meditation', 'deep', 'awareness'], session_end_grounding: true,
    duration_options: [10, 15, 20, 30], default_duration: 15,
  }),
  s({
    id: 'em-002', title_ar: 'دعم تخفيف الألم', title_en: 'Pain Coping Support',
    description_ar: 'ترددات دلتا-ثيتا لطيفة للمساعدة في التعامل مع الألم وتخفيف الانزعاج',
    category: 'pain_coping', evidence_level: 'emerging_evidence',
    audio_type: 'binaural_beat', beat_type: 'delta',
    frequency_hz: 3, carrier_frequency: 150,
    frequency_display: '2-4 Hz Delta', icon: '🩹',
    intended_outcome_ar: 'دعم التعامل مع الألم والانزعاج الجسدي',
    not_intended_for_ar: 'ليس بديلاً عن مسكنات الألم أو العلاج الطبي',
    tags: ['pain', 'comfort', 'coping'], best_time_of_day: 'anytime',
    safety_level: 'caution_advised',
    contraindications_ar: ['استشر طبيبك إذا كان الألم شديداً أو مستمراً'],
    duration_options: [10, 15, 20, 30], default_duration: 15,
  }),
  s({
    id: 'em-003', title_ar: 'تفريغ عاطفي', title_en: 'Emotional Decompression',
    description_ar: 'موجات ألفا مع خلفية طبيعية لدعم التوازن العاطفي والتفريغ',
    category: 'emotional_regulation', evidence_level: 'emerging_evidence',
    audio_type: 'binaural_beat', beat_type: 'alpha',
    frequency_hz: 10, carrier_frequency: 200,
    frequency_display: '10 Hz Alpha', icon: '💜',
    intended_outcome_ar: 'دعم التوازن العاطفي والهدوء النفسي',
    tags: ['emotions', 'calm', 'healing', 'balance'],
    background_sound: 'rain', session_end_grounding: true,
    duration_options: [10, 15, 20, 30], default_duration: 15,
  }),
  s({
    id: 'em-004', title_ar: 'مسح الجسم الصوتي', title_en: 'Sonic Body Scan',
    description_ar: 'ترددات متدرجة مع توجيه خفيف لمسح الجسم والوعي بالإحساسات',
    category: 'guided_healing', evidence_level: 'emerging_evidence',
    audio_type: 'mixed', beat_type: 'alpha',
    frequency_hz: 10, frequency_display: 'Progressive Alpha', icon: '🕊️',
    guidance_type: 'light_guidance',
    intended_outcome_ar: 'الوعي بإحساسات الجسم والاسترخاء العميق',
    tags: ['body-scan', 'awareness', 'relaxation'],
    session_end_grounding: true,
    duration_options: [10, 15, 20], default_duration: 15,
  }),
  s({
    id: 'em-005', title_ar: 'صوت التعافي', title_en: 'Recovery Soundscape',
    description_ar: 'مشهد صوتي طبيعي مع ترددات دلتا-ألفا لدعم الراحة والتعافي',
    category: 'nature_soundscapes', evidence_level: 'emerging_evidence',
    audio_type: 'soundscape', beat_type: 'delta',
    frequency_hz: 3, frequency_display: 'Delta + Nature', icon: '🌊',
    background_sound: 'ocean',
    intended_outcome_ar: 'دعم الراحة الجسدية والتعافي',
    tags: ['recovery', 'rest', 'nature', 'healing'],
    duration_options: [15, 30, 45, 60], default_duration: 30,
  }),
  s({
    id: 'em-006', title_ar: 'غاما الوعي العالي', title_en: 'High Awareness Gamma',
    description_ar: 'موجات غاما (40 هرتز) لتعزيز الوعي والإدراك والانتباه الحاد',
    category: 'focus', evidence_level: 'emerging_evidence',
    audio_type: 'binaural_beat', beat_type: 'gamma',
    frequency_hz: 40, carrier_frequency: 300,
    frequency_display: '40 Hz Gamma', icon: '⚡',
    intended_outcome_ar: 'تعزيز الوعي والانتباه الحاد',
    tags: ['awareness', 'gamma', 'clarity'],
    duration_options: [5, 10, 15], default_duration: 10,
  }),
];

// ============================================================
// TRADITIONAL / EXPERIENTIAL — Solfeggio
// ============================================================
const solfeggioSessions: TherapeuticSession[] = [
  { id: 'sol-174', title_ar: 'تردد التحرر', title_en: '174 Hz Liberation', description_ar: 'تردد مستوحى من سلم سولفيجيو — يُستخدم تقليدياً لتخفيف التوتر', category: 'solfeggio_inspired', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 174, frequency_display: '174 Hz', icon: '🎵', intended_outcome_ar: 'تخفيف التوتر والشعور بالأمان', not_intended_for_ar: 'ليس علاجاً طبياً — تجربة صوتية تقليدية', tags: ['solfeggio', 'tradition'], headphone_required: false, session_end_grounding: false, safety_level: 'safe_general', guidance_type: 'unguided', duration_options: [5, 10, 15, 30], default_duration: 15, language: 'bilingual', source_type: 'original', premium: false, featured: false },
  { id: 'sol-285', title_ar: 'تردد التجديد', title_en: '285 Hz Renewal', description_ar: 'تردد سولفيجيو مرتبط تقليدياً بالتجديد والحيوية', category: 'solfeggio_inspired', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 285, frequency_display: '285 Hz', icon: '🎵', intended_outcome_ar: 'الشعور بالتجديد والطاقة', not_intended_for_ar: 'ليس علاجاً طبياً', tags: ['solfeggio'], headphone_required: false, session_end_grounding: false, safety_level: 'safe_general', guidance_type: 'unguided', duration_options: [5, 10, 15, 30], default_duration: 15, language: 'bilingual', source_type: 'original', premium: false, featured: false },
  { id: 'sol-396', title_ar: 'تردد التحرر من الخوف', title_en: '396 Hz Release', description_ar: 'تردد سولفيجيو يُستخدم تقليدياً للتحرر من المشاعر السلبية', category: 'solfeggio_inspired', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 396, frequency_display: '396 Hz', icon: '🎵', intended_outcome_ar: 'التحرر من التوتر العاطفي', tags: ['solfeggio', 'release'], headphone_required: false, session_end_grounding: false, safety_level: 'safe_general', guidance_type: 'unguided', duration_options: [5, 10, 15, 30], default_duration: 15, language: 'bilingual', source_type: 'original', premium: false, featured: false },
  { id: 'sol-528', title_ar: 'تردد الانسجام', title_en: '528 Hz Harmony', description_ar: 'من أشهر ترددات سولفيجيو — يُعرف تقليدياً بتردد الحب والانسجام', category: 'solfeggio_inspired', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 528, frequency_display: '528 Hz', icon: '💛', intended_outcome_ar: 'الشعور بالانسجام والسلام الداخلي', not_intended_for_ar: 'ادعاءات "إصلاح DNA" غير مثبتة علمياً', tags: ['solfeggio', 'harmony', 'love'], headphone_required: false, session_end_grounding: false, safety_level: 'safe_general', guidance_type: 'unguided', duration_options: [5, 10, 15, 30], default_duration: 15, language: 'bilingual', source_type: 'original', premium: false, featured: true },
  { id: 'sol-639', title_ar: 'تردد التواصل', title_en: '639 Hz Connection', description_ar: 'تردد سولفيجيو مرتبط تقليدياً بالانسجام والعلاقات', category: 'solfeggio_inspired', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 639, frequency_display: '639 Hz', icon: '🎵', intended_outcome_ar: 'تعزيز الشعور بالتواصل والانسجام', tags: ['solfeggio', 'connection'], headphone_required: false, session_end_grounding: false, safety_level: 'safe_general', guidance_type: 'unguided', duration_options: [5, 10, 15, 30], default_duration: 15, language: 'bilingual', source_type: 'original', premium: false, featured: false },
  { id: 'sol-741', title_ar: 'تردد التعبير', title_en: '741 Hz Expression', description_ar: 'تردد سولفيجيو يُربط تقليدياً بالتعبير عن الذات', category: 'solfeggio_inspired', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 741, frequency_display: '741 Hz', icon: '🎵', intended_outcome_ar: 'دعم التعبير الذاتي والوضوح', tags: ['solfeggio', 'expression'], headphone_required: false, session_end_grounding: false, safety_level: 'safe_general', guidance_type: 'unguided', duration_options: [5, 10, 15, 30], default_duration: 15, language: 'bilingual', source_type: 'original', premium: false, featured: false },
  { id: 'sol-852', title_ar: 'تردد البصيرة', title_en: '852 Hz Intuition', description_ar: 'تردد سولفيجيو مرتبط تقليدياً بالحدس والوعي', category: 'solfeggio_inspired', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 852, frequency_display: '852 Hz', icon: '🎵', intended_outcome_ar: 'تعزيز الوعي والبصيرة الداخلية', tags: ['solfeggio', 'intuition'], headphone_required: false, session_end_grounding: false, safety_level: 'safe_general', guidance_type: 'unguided', duration_options: [5, 10, 15, 30], default_duration: 15, language: 'bilingual', source_type: 'original', premium: false, featured: false },
  { id: 'sol-963', title_ar: 'تردد الوحدة', title_en: '963 Hz Unity', description_ar: 'أعلى ترددات سولفيجيو — يُربط تقليدياً بالوعي الكوني', category: 'solfeggio_inspired', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 963, frequency_display: '963 Hz', icon: '✨', intended_outcome_ar: 'الشعور بالوحدة والسكينة', tags: ['solfeggio', 'unity'], headphone_required: false, session_end_grounding: false, safety_level: 'safe_general', guidance_type: 'unguided', duration_options: [5, 10, 15, 30], default_duration: 15, language: 'bilingual', source_type: 'original', premium: false, featured: false },
];

// ============================================================
// TRADITIONAL — Chakra
// ============================================================
const chakraSessions: TherapeuticSession[] = [
  s({ id: 'chk-001', title_ar: 'شاكرا الجذر', title_en: 'Root Chakra (Muladhara)', description_ar: 'تردد 396 هرتز مرتبط تقليدياً بالتأريض والأمان — ممارسة تقليدية', category: 'chakra_traditional', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 396, color: '#EF4444', icon: '🔴', intended_outcome_ar: 'الشعور بالتأريض والاستقرار', tags: ['chakra', 'grounding', 'traditional'] }),
  s({ id: 'chk-002', title_ar: 'شاكرا العجز', title_en: 'Sacral Chakra (Svadhisthana)', description_ar: 'تردد 417 هرتز — مرتبط تقليدياً بالإبداع والعواطف', category: 'chakra_traditional', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 417, color: '#F97316', icon: '🟠', intended_outcome_ar: 'تحفيز الإبداع والتدفق', tags: ['chakra', 'creativity'] }),
  s({ id: 'chk-003', title_ar: 'شاكرا الضفيرة الشمسية', title_en: 'Solar Plexus Chakra', description_ar: 'تردد 528 هرتز — مرتبط تقليدياً بالثقة والقوة', category: 'chakra_traditional', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 528, color: '#EAB308', icon: '🟡', intended_outcome_ar: 'تعزيز الثقة بالنفس', tags: ['chakra', 'confidence'] }),
  s({ id: 'chk-004', title_ar: 'شاكرا القلب', title_en: 'Heart Chakra (Anahata)', description_ar: 'تردد 639 هرتز — الحب والرحمة في التقليد الهندي', category: 'chakra_traditional', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 639, color: '#22C55E', icon: '💚', intended_outcome_ar: 'الشعور بالحب والرحمة', tags: ['chakra', 'love', 'compassion'] }),
  s({ id: 'chk-005', title_ar: 'شاكرا الحلق', title_en: 'Throat Chakra (Vishuddha)', description_ar: 'تردد 741 هرتز — التعبير والصدق في التراث التقليدي', category: 'chakra_traditional', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 741, color: '#3B82F6', icon: '🔵', intended_outcome_ar: 'دعم التعبير الأصيل', tags: ['chakra', 'expression'] }),
  s({ id: 'chk-006', title_ar: 'شاكرا العين الثالثة', title_en: 'Third Eye Chakra (Ajna)', description_ar: 'تردد 852 هرتز — الحدس والبصيرة في الممارسات التأملية', category: 'chakra_traditional', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 852, color: '#6366F1', icon: '🟣', intended_outcome_ar: 'تعزيز الحدس والبصيرة', tags: ['chakra', 'intuition'] }),
  s({ id: 'chk-007', title_ar: 'شاكرا التاج', title_en: 'Crown Chakra (Sahasrara)', description_ar: 'تردد 963 هرتز — الوعي والسلام الروحي في التقليد', category: 'chakra_traditional', evidence_level: 'traditional_experiential', audio_type: 'pure_tone', beat_type: 'none', frequency_hz: 963, color: '#A855F7', icon: '👑', intended_outcome_ar: 'الشعور بالسلام والوحدة', tags: ['chakra', 'awareness'] }),
];

// ============================================================
// MONROE-INSPIRED STATE SESSIONS
// ============================================================
const monroeInspiredSessions: TherapeuticSession[] = [
  s({
    id: 'mi-001', title_ar: 'حالة التركيز 10', title_en: 'Focus State 10',
    description_ar: 'حالة استرخاء مع وعي كامل — مستوحاة من أنظمة حالات الوعي المتدرجة',
    category: 'monroe_inspired', evidence_level: 'emerging_evidence',
    audio_type: 'binaural_beat', beat_type: 'alpha',
    frequency_hz: 10, carrier_frequency: 200, frequency_display: 'Focus 10 (Alpha)',
    icon: '✨', featured: true,
    intended_outcome_ar: 'حالة استرخاء عميقة مع وعي يقظ',
    tags: ['state', 'awareness', 'relaxation'], session_end_grounding: true,
    duration_options: [10, 15, 20, 30], default_duration: 20,
  }),
  s({
    id: 'mi-002', title_ar: 'حالة التوسع 12', title_en: 'Expanded State 12',
    description_ar: 'حالة توسع في الإدراك — ثيتا عميقة مع وعي بالمحيط',
    category: 'monroe_inspired', evidence_level: 'emerging_evidence',
    audio_type: 'binaural_beat', beat_type: 'theta',
    frequency_hz: 5, carrier_frequency: 180, frequency_display: 'Focus 12 (Theta)',
    icon: '🌌',
    intended_outcome_ar: 'توسع في الإدراك والوعي بالمحيط',
    tags: ['state', 'expansion', 'awareness'], session_end_grounding: true,
    duration_options: [15, 20, 30], default_duration: 20,
    safety_level: 'caution_advised',
    contraindications_ar: ['يُنصح بعدم الاستخدام لمن يعاني من اضطرابات نفسية حادة'],
  }),
  s({
    id: 'mi-003', title_ar: 'جسر النوم 15', title_en: 'Sleep Bridge 15',
    description_ar: 'حالة بين اليقظة والنوم — دلتا هادئة للعبور إلى النوم العميق',
    category: 'monroe_inspired', evidence_level: 'emerging_evidence',
    audio_type: 'binaural_beat', beat_type: 'delta',
    frequency_hz: 2, carrier_frequency: 140, frequency_display: 'Focus 15 (Delta)',
    icon: '🌉',
    intended_outcome_ar: 'العبور السلس من اليقظة إلى النوم',
    tags: ['state', 'sleep', 'transition'], best_time_of_day: 'night',
    duration_options: [20, 30, 45], default_duration: 30,
  }),
];

// ============================================================
// EXPANDED SLEEP SESSIONS
// ============================================================
const expandedSleepSessions: TherapeuticSession[] = [
  s({ id: 'slp-001', title_ar: 'نسيم الليل الهادئ', title_en: 'Gentle Night Breeze', description_ar: 'موجات دلتا لطيفة مع خلفية مطر هادئ للغرق في نوم عميق', category: 'sleep', evidence_level: 'evidence_supported', audio_type: 'binaural_beat', beat_type: 'delta', frequency_hz: 1.5, carrier_frequency: 130, frequency_display: '1.5 Hz Delta', icon: '🌧️', intended_outcome_ar: 'نوم عميق ومتواصل', background_sound: 'rain', best_time_of_day: 'night', mood_tags: ['tired', 'insomnia', 'restless'], depth_level: 'beginner', beginner_friendly: true, who_suits_ar: 'مناسب لمن يعاني من صعوبة النوم أو الأرق الخفيف', when_to_use_ar: 'استخدمها قبل النوم بـ15 دقيقة في بيئة مظلمة وهادئة', duration_options: [15, 30, 45, 60], default_duration: 30, tags: ['sleep', 'rain', 'deep'] }),
  s({ id: 'slp-002', title_ar: 'المحيط النائم', title_en: 'Sleeping Ocean', description_ar: 'أصوات محيط مع ترددات دلتا عميقة للعبور إلى النوم', category: 'sleep', evidence_level: 'emerging_evidence', audio_type: 'mixed', beat_type: 'delta', frequency_hz: 2, frequency_display: '2 Hz Delta + Ocean', icon: '🌊', intended_outcome_ar: 'الاستسلام للنوم بسلاسة', background_sound: 'ocean', best_time_of_day: 'night', mood_tags: ['tired', 'insomnia'], depth_level: 'beginner', beginner_friendly: true, who_suits_ar: 'لكل من يحب أصوات البحر ويحتاج للنوم', when_to_use_ar: 'عند الاستلقاء في السرير وإطفاء الأنوار', duration_options: [20, 30, 45, 60], default_duration: 30, tags: ['sleep', 'ocean', 'nature'] }),
  s({ id: 'slp-003', title_ar: 'تهويدة النجوم', title_en: 'Starlight Lullaby', description_ar: 'تدرج لطيف من ثيتا إلى دلتا — كتهويدة صوتية للنوم الهادئ', category: 'sleep', evidence_level: 'emerging_evidence', audio_type: 'binaural_beat', beat_type: 'delta', frequency_hz: 3, carrier_frequency: 160, frequency_display: 'Theta→Delta', icon: '⭐', intended_outcome_ar: 'انتقال هادئ وسلس إلى النوم', best_time_of_day: 'night', mood_tags: ['tired', 'anxious', 'restless'], depth_level: 'beginner', beginner_friendly: true, duration_options: [15, 20, 30], default_duration: 20, tags: ['sleep', 'lullaby', 'gentle'] }),
  s({ id: 'slp-004', title_ar: 'إعادة ضبط الساعة البيولوجية', title_en: 'Circadian Reset', description_ar: 'جلسة مسائية لإعادة ضبط إيقاع النوم الطبيعي على مدى عدة أيام', category: 'sleep', evidence_level: 'emerging_evidence', audio_type: 'binaural_beat', beat_type: 'theta', frequency_hz: 5, carrier_frequency: 180, frequency_display: '5 Hz Theta', icon: '🕐', intended_outcome_ar: 'إعادة ضبط نمط النوم', best_time_of_day: 'evening', mood_tags: ['tired', 'jet-lag'], depth_level: 'intermediate', duration_options: [15, 20, 30], default_duration: 20, tags: ['sleep', 'circadian', 'reset'] }),
  s({ id: 'slp-005', title_ar: 'الغابة الليلية', title_en: 'Night Forest', description_ar: 'أصوات غابة ليلية هادئة مع ترددات دلتا — بيئة نوم طبيعية', category: 'sleep', evidence_level: 'traditional_experiential', audio_type: 'soundscape', beat_type: 'delta', frequency_hz: 2, frequency_display: 'Delta + Forest', icon: '🌲', intended_outcome_ar: 'الشعور بالأمان والسكينة للنوم', background_sound: 'forest', best_time_of_day: 'night', mood_tags: ['tired', 'anxious'], depth_level: 'beginner', beginner_friendly: true, duration_options: [30, 45, 60, 90], default_duration: 45, tags: ['sleep', 'forest', 'nature'] }),
];

// ============================================================
// EXPANDED RELAXATION SESSIONS
// ============================================================
const expandedRelaxationSessions: TherapeuticSession[] = [
  s({ id: 'rlx-001', title_ar: 'استرخاء الجسم التدريجي', title_en: 'Progressive Body Relaxation', description_ar: 'ترددات ألفا مع توجيه خفيف لاسترخاء العضلات تدريجياً من القدم إلى الرأس', category: 'relaxation', evidence_level: 'evidence_supported', audio_type: 'mixed', beat_type: 'alpha', frequency_hz: 10, frequency_display: '10 Hz Alpha + Guide', icon: '🧖', guidance_type: 'light_guidance', intended_outcome_ar: 'استرخاء عضلي عميق وشامل', mood_tags: ['stressed', 'tense', 'tired'], depth_level: 'beginner', beginner_friendly: true, who_suits_ar: 'مناسب لمن يعاني من توتر عضلي أو إجهاد جسدي', when_to_use_ar: 'بعد يوم طويل أو عند الشعور بتوتر في الجسم', session_end_grounding: true, duration_options: [10, 15, 20], default_duration: 15, tags: ['relaxation', 'pmr', 'body', 'muscles'] }),
  s({ id: 'rlx-002', title_ar: 'حمام الصوت الدافئ', title_en: 'Warm Sound Bath', description_ar: 'طبقات صوتية دافئة ومتداخلة لخلق شعور بالدفء والراحة العميقة', category: 'relaxation', evidence_level: 'traditional_experiential', audio_type: 'soundscape', beat_type: 'alpha', frequency_hz: 8, frequency_display: 'Alpha Waves', icon: '🛁', intended_outcome_ar: 'الشعور بالدفء والراحة الكاملة', mood_tags: ['stressed', 'overwhelmed', 'exhausted'], depth_level: 'beginner', beginner_friendly: true, duration_options: [10, 15, 20, 30], default_duration: 15, tags: ['relaxation', 'sound-bath', 'warm'] }),
  s({ id: 'rlx-003', title_ar: 'الهدوء الفوري', title_en: 'Instant Calm', description_ar: 'جلسة قصيرة وسريعة — 3 إلى 5 دقائق من موجات ألفا المركزة للهدوء السريع', category: 'relaxation', evidence_level: 'evidence_supported', audio_type: 'binaural_beat', beat_type: 'alpha', frequency_hz: 10, carrier_frequency: 200, frequency_display: '10 Hz Alpha', icon: '⚡', intended_outcome_ar: 'هدوء سريع في دقائق', mood_tags: ['stressed', 'anxious', 'panic'], depth_level: 'beginner', beginner_friendly: true, featured: true, who_suits_ar: 'لمن يحتاج هدوءاً فورياً في لحظات الضغط', when_to_use_ar: 'في أي لحظة توتر — خذ 3 دقائق فقط', duration_options: [3, 5, 7], default_duration: 5, tags: ['relaxation', 'quick', 'instant', 'calm'] }),
  s({ id: 'rlx-004', title_ar: 'غروب هادئ', title_en: 'Quiet Sunset', description_ar: 'جلسة مسائية — تدرج ألفا لطيف مع أصوات طبيعية لإنهاء اليوم بسلام', category: 'relaxation', evidence_level: 'emerging_evidence', audio_type: 'mixed', beat_type: 'alpha', frequency_hz: 9, frequency_display: '9 Hz Alpha', icon: '🌅', intended_outcome_ar: 'إنهاء اليوم بهدوء واسترخاء', background_sound: 'evening', best_time_of_day: 'evening', mood_tags: ['tired', 'stressed', 'evening'], depth_level: 'beginner', beginner_friendly: true, duration_options: [10, 15, 20], default_duration: 15, tags: ['relaxation', 'evening', 'sunset'] }),
  s({ id: 'rlx-005', title_ar: 'واحة السكينة', title_en: 'Serenity Oasis', description_ar: 'ألفا-ثيتا عميقة — جلسة غوص في سكينة داخلية تامة', category: 'relaxation', evidence_level: 'emerging_evidence', audio_type: 'binaural_beat', beat_type: 'theta', frequency_hz: 7, carrier_frequency: 190, frequency_display: '7 Hz Theta', icon: '🏝️', intended_outcome_ar: 'سكينة عميقة وصفاء ذهني', mood_tags: ['overwhelmed', 'burnout'], depth_level: 'intermediate', session_end_grounding: true, duration_options: [15, 20, 30], default_duration: 20, tags: ['relaxation', 'deep', 'serenity'] }),
];

// ============================================================
// EXPANDED EMOTIONAL REGULATION SESSIONS
// ============================================================
const expandedEmotionalSessions: TherapeuticSession[] = [
  s({ id: 'emo-001', title_ar: 'تهدئة القلق', title_en: 'Anxiety Soother', description_ar: 'ترددات ألفا-ثيتا مصممة لتهدئة القلق والأفكار المتسارعة', category: 'emotional_regulation', evidence_level: 'evidence_supported', audio_type: 'binaural_beat', beat_type: 'alpha', frequency_hz: 10, carrier_frequency: 200, frequency_display: '10 Hz Alpha', icon: '🫂', intended_outcome_ar: 'تهدئة القلق وإبطاء الأفكار المتسارعة', mood_tags: ['anxious', 'worried', 'racing-thoughts'], depth_level: 'beginner', beginner_friendly: true, featured: true, who_suits_ar: 'لمن يعاني من قلق أو أفكار لا تتوقف', when_to_use_ar: 'عند الشعور بالقلق أو قبل موقف مقلق', duration_options: [5, 10, 15, 20], default_duration: 10, tags: ['anxiety', 'calm', 'worry'] }),
  s({ id: 'emo-002', title_ar: 'دعم الحزن', title_en: 'Grief Support', description_ar: 'ألفا وثيتا لطيفة مع خلفية مطر — مساحة آمنة للشعور والتعبير', category: 'emotional_regulation', evidence_level: 'emerging_evidence', audio_type: 'mixed', beat_type: 'theta', frequency_hz: 6, frequency_display: '6 Hz Theta + Rain', icon: '💧', intended_outcome_ar: 'مساحة آمنة للتعبير عن الحزن والمشاعر', background_sound: 'rain', mood_tags: ['sad', 'grieving', 'loss'], depth_level: 'intermediate', session_end_grounding: true, who_suits_ar: 'لمن يمر بفقدان أو حزن ويحتاج مساحة آمنة', duration_options: [10, 15, 20], default_duration: 15, tags: ['grief', 'sadness', 'emotions'] }),
  s({ id: 'emo-003', title_ar: 'تحرير الغضب', title_en: 'Anger Release', description_ar: 'تدرج من بيتا إلى ألفا — لتفريغ الغضب المكبوت والعودة للهدوء', category: 'emotional_regulation', evidence_level: 'emerging_evidence', audio_type: 'binaural_beat', beat_type: 'alpha', frequency_hz: 10, carrier_frequency: 210, frequency_display: 'Beta→Alpha', icon: '🔥', intended_outcome_ar: 'تحرير الغضب المكبوت والعودة للتوازن', mood_tags: ['angry', 'frustrated', 'irritated'], depth_level: 'intermediate', session_end_grounding: true, duration_options: [10, 15, 20], default_duration: 15, tags: ['anger', 'release', 'frustration'] }),
  s({ id: 'emo-004', title_ar: 'درع الهدوء الداخلي', title_en: 'Inner Calm Shield', description_ar: 'ترددات ألفا تبني شعوراً بالحماية والأمان العاطفي الداخلي', category: 'emotional_regulation', evidence_level: 'traditional_experiential', audio_type: 'binaural_beat', beat_type: 'alpha', frequency_hz: 10.5, carrier_frequency: 200, frequency_display: '10.5 Hz Alpha', icon: '🛡️', intended_outcome_ar: 'بناء شعور بالأمان والاستقرار العاطفي', mood_tags: ['vulnerable', 'overwhelmed', 'sensitive'], depth_level: 'beginner', beginner_friendly: true, duration_options: [10, 15, 20], default_duration: 15, tags: ['calm', 'safety', 'protection'] }),
];

// ============================================================
// EXPANDED FOCUS & CLARITY SESSIONS
// ============================================================
const expandedFocusSessions: TherapeuticSession[] = [
  s({ id: 'fcs-001', title_ar: 'وضع الدراسة', title_en: 'Study Mode', description_ar: 'بيتا منخفضة (14 هرتز) مع خلفية مطر خفيف — مصممة لساعات الدراسة والعمل', category: 'focus', evidence_level: 'evidence_supported', audio_type: 'binaural_beat', beat_type: 'beta', frequency_hz: 14, carrier_frequency: 240, frequency_display: '14 Hz Beta', icon: '📚', intended_outcome_ar: 'تركيز مستمر للدراسة والعمل', background_sound: 'rain', mood_tags: ['unfocused', 'distracted', 'study'], depth_level: 'beginner', beginner_friendly: true, featured: true, who_suits_ar: 'للطلاب والعاملين الذين يحتاجون تركيزاً مستمراً', when_to_use_ar: 'شغلها أثناء الدراسة أو العمل الذهني', duration_options: [15, 30, 45, 60, 90], default_duration: 30, tags: ['focus', 'study', 'work', 'concentration'] }),
  s({ id: 'fcs-002', title_ar: 'الإبداع المتدفق', title_en: 'Creative Flow', description_ar: 'ألفا-ثيتا (8 هرتز) — تردد مرتبط بحالة التدفق الإبداعي والإلهام', category: 'focus', evidence_level: 'emerging_evidence', audio_type: 'binaural_beat', beat_type: 'alpha', frequency_hz: 8, carrier_frequency: 200, frequency_display: '8 Hz Alpha', icon: '🎨', intended_outcome_ar: 'تحفيز الإبداع والتدفق الذهني', mood_tags: ['blocked', 'uninspired'], depth_level: 'intermediate', duration_options: [15, 20, 30], default_duration: 20, tags: ['creativity', 'flow', 'inspiration'] }),
  s({ id: 'fcs-003', title_ar: 'صفاء الصباح', title_en: 'Morning Clarity', description_ar: 'بيتا (16 هرتز) لبدء اليوم بوضوح ذهني وطاقة مركزة', category: 'focus', evidence_level: 'evidence_supported', audio_type: 'binaural_beat', beat_type: 'beta', frequency_hz: 16, carrier_frequency: 250, frequency_display: '16 Hz Beta', icon: '🌅', intended_outcome_ar: 'بدء اليوم بوضوح وطاقة', best_time_of_day: 'morning', mood_tags: ['groggy', 'foggy', 'morning'], depth_level: 'beginner', beginner_friendly: true, duration_options: [5, 10, 15], default_duration: 10, tags: ['morning', 'clarity', 'energy'] }),
];

// ============================================================
// EXPANDED BREATHWORK SESSIONS
// ============================================================
const expandedBreathworkSessions: TherapeuticSession[] = [
  s({ id: 'brw-001', title_ar: 'تنفس الصندوق', title_en: 'Box Breathing', description_ar: 'تنفس 4-4-4-4 مع نغمات ألفا داعمة — تقنية عسكرية لتهدئة الجهاز العصبي', category: 'breathwork', evidence_level: 'evidence_supported', audio_type: 'mixed', beat_type: 'alpha', frequency_hz: 10, frequency_display: 'Alpha + Breath', icon: '📦', guidance_type: 'breathwork_led', intended_outcome_ar: 'تهدئة فورية للجهاز العصبي عبر التنفس المنتظم', mood_tags: ['stressed', 'anxious', 'panic'], depth_level: 'beginner', beginner_friendly: true, featured: true, who_suits_ar: 'تقنية مستخدمة في الجيش والإسعاف — مناسبة للجميع', when_to_use_ar: 'في أي لحظة توتر أو قلق — حتى أثناء العمل', duration_options: [3, 5, 10], default_duration: 5, tags: ['breathing', 'box', 'calm'] }),
  s({ id: 'brw-002', title_ar: 'تنفس 4-7-8', title_en: '4-7-8 Breathing', description_ar: 'تنفس 4-7-8 الشهير مع نغمات ثيتا — مصمم كمهدئ طبيعي', category: 'breathwork', evidence_level: 'evidence_supported', audio_type: 'mixed', beat_type: 'theta', frequency_hz: 6, frequency_display: 'Theta + Breath', icon: '🌬️', guidance_type: 'breathwork_led', intended_outcome_ar: 'تأثير مهدئ قوي — كالمهدئ الطبيعي', mood_tags: ['anxious', 'insomnia', 'stressed'], depth_level: 'beginner', beginner_friendly: true, best_time_of_day: 'evening', duration_options: [3, 5, 10], default_duration: 5, tags: ['breathing', '4-7-8', 'sedative'] }),
  s({ id: 'brw-003', title_ar: 'تنفس التوازن', title_en: 'Coherence Breath', description_ar: 'تنفس بمعدل 5.5 نفس/دقيقة — التردد الأمثل لتوازن القلب والعقل', category: 'breathwork', evidence_level: 'evidence_supported', audio_type: 'mixed', beat_type: 'alpha', frequency_hz: 10, frequency_display: 'Coherence 5.5', icon: '💓', guidance_type: 'breathwork_led', intended_outcome_ar: 'توازن بين القلب والجهاز العصبي', mood_tags: ['stressed', 'unbalanced'], depth_level: 'intermediate', duration_options: [5, 10, 15, 20], default_duration: 10, tags: ['breathing', 'coherence', 'heart'] }),
];

// ============================================================
// EXPANDED NATURE SOUNDSCAPES
// ============================================================
const expandedNatureSessions: TherapeuticSession[] = [
  s({ id: 'nat-001', title_ar: 'غابة المطر الاستوائية', title_en: 'Tropical Rain Forest', description_ar: 'غمر صوتي في غابة مطر استوائية — أمطار وطيور وأوراق شجر', category: 'nature_soundscapes', evidence_level: 'emerging_evidence', audio_type: 'soundscape', beat_type: 'none', icon: '🌴', intended_outcome_ar: 'الشعور بالانغماس في الطبيعة والهروب من الضغوط', background_sound: 'rainforest', mood_tags: ['stressed', 'overwhelmed', 'escape'], depth_level: 'beginner', beginner_friendly: true, duration_options: [15, 30, 45, 60], default_duration: 30, tags: ['nature', 'rainforest', 'birds'] }),
  s({ id: 'nat-002', title_ar: 'جدول الجبل', title_en: 'Mountain Stream', description_ar: 'صوت جدول ماء جبلي صافٍ مع نسيم وطيور — هدوء طبيعي نقي', category: 'nature_soundscapes', evidence_level: 'emerging_evidence', audio_type: 'soundscape', beat_type: 'none', icon: '⛰️', intended_outcome_ar: 'صفاء ذهني وهدوء عميق', background_sound: 'stream', mood_tags: ['stressed', 'foggy', 'tired'], depth_level: 'beginner', beginner_friendly: true, duration_options: [15, 30, 45, 60], default_duration: 30, tags: ['nature', 'stream', 'mountain'] }),
  s({ id: 'nat-003', title_ar: 'عاصفة رعدية آمنة', title_en: 'Safe Thunderstorm', description_ar: 'رعد بعيد ومطر كثيف — شعور بالأمان والدفء مع قوة الطبيعة', category: 'nature_soundscapes', evidence_level: 'traditional_experiential', audio_type: 'soundscape', beat_type: 'none', icon: '⛈️', intended_outcome_ar: 'شعور بالأمان والراحة مع صوت المطر والرعد', background_sound: 'thunder', mood_tags: ['insomnia', 'anxious'], depth_level: 'beginner', beginner_friendly: true, duration_options: [20, 30, 45, 60], default_duration: 30, tags: ['nature', 'thunder', 'rain', 'cozy'] }),
];

// ============================================================
// EXPANDED GUIDED HEALING
// ============================================================
const expandedGuidedSessions: TherapeuticSession[] = [
  s({ id: 'gd-001', title_ar: 'رحلة السلام الداخلي', title_en: 'Inner Peace Journey', description_ar: 'جلسة موجهة مع ترددات ثيتا — رحلة تخيلية نحو مكان آمن في داخلك', category: 'guided_healing', evidence_level: 'emerging_evidence', audio_type: 'guided_audio', beat_type: 'theta', frequency_hz: 6, frequency_display: '6 Hz Theta', icon: '🕊️', guidance_type: 'full_guidance', intended_outcome_ar: 'الوصول لمكان آمن وسلام داخلي عميق', mood_tags: ['anxious', 'overwhelmed', 'lost'], depth_level: 'beginner', beginner_friendly: true, session_end_grounding: true, duration_options: [10, 15, 20], default_duration: 15, tags: ['guided', 'peace', 'visualization'] }),
  s({ id: 'gd-002', title_ar: 'جلسة الامتنان', title_en: 'Gratitude Session', description_ar: 'توجيه لطيف مع ألفا — لبناء شعور بالامتنان والرضا', category: 'guided_healing', evidence_level: 'emerging_evidence', audio_type: 'guided_audio', beat_type: 'alpha', frequency_hz: 10, frequency_display: '10 Hz Alpha', icon: '🙏', guidance_type: 'light_guidance', intended_outcome_ar: 'تعزيز الامتنان والشعور بالرضا', mood_tags: ['sad', 'negative', 'ungrateful'], depth_level: 'beginner', beginner_friendly: true, best_time_of_day: 'morning', duration_options: [5, 10, 15], default_duration: 10, tags: ['gratitude', 'positive', 'morning'] }),
  s({ id: 'gd-003', title_ar: 'إعادة بناء الطاقة', title_en: 'Energy Rebuilding', description_ar: 'جلسة موجهة لإعادة بناء الطاقة بعد الإرهاق — ألفا-بيتا تصاعدي', category: 'guided_healing', evidence_level: 'traditional_experiential', audio_type: 'guided_audio', beat_type: 'alpha', frequency_hz: 10, frequency_display: 'Alpha→Beta', icon: '🔋', guidance_type: 'full_guidance', intended_outcome_ar: 'استعادة الطاقة والحيوية بعد الإرهاق', mood_tags: ['exhausted', 'burnout', 'depleted'], depth_level: 'intermediate', session_end_grounding: true, duration_options: [10, 15, 20], default_duration: 15, tags: ['energy', 'recovery', 'burnout'] }),
];

// ============================================================
// MERGE ALL SESSIONS
// ============================================================
export const ALL_SESSIONS: TherapeuticSession[] = [
  ...evidenceSupportedSessions,
  ...emergingEvidenceSessions,
  ...solfeggioSessions,
  ...chakraSessions,
  ...monroeInspiredSessions,
  ...expandedSleepSessions,
  ...expandedRelaxationSessions,
  ...expandedEmotionalSessions,
  ...expandedFocusSessions,
  ...expandedBreathworkSessions,
  ...expandedNatureSessions,
  ...expandedGuidedSessions,
];

// ============================================================
// PROGRAMS
// ============================================================
export const ALL_PROGRAMS: TherapeuticProgram[] = [
  {
    id: 'prog-001', title_ar: 'برنامج إعادة ضبط النوم - 7 أيام', title_en: '7-Day Sleep Reset',
    description_ar: 'برنامج متدرج لتحسين جودة النوم عبر 7 أيام من الجلسات',
    category: 'sleep', duration_days: 7, evidence_level: 'evidence_supported',
    icon: '🌙', color_from: 'from-indigo-500', color_to: 'to-blue-700', featured: true,
    tags: ['sleep', 'program', 'reset'],
    sessions: [
      { session_id: 'es-001', day: 1, order: 1, required: true, note_ar: 'ابدأ بالاسترخاء' },
      { session_id: 'es-004', day: 2, order: 1, required: true, note_ar: 'إعادة ضبط التوتر' },
      { session_id: 'es-005', day: 3, order: 1, required: true, note_ar: 'تنظيم التنفس' },
      { session_id: 'em-003', day: 4, order: 1, required: true, note_ar: 'تفريغ عاطفي' },
      { session_id: 'es-002', day: 5, order: 1, required: true, note_ar: 'تحضير للنوم' },
      { session_id: 'mi-003', day: 6, order: 1, required: true, note_ar: 'جسر النوم' },
      { session_id: 'es-002', day: 7, order: 1, required: true, note_ar: 'نوم عميق' },
    ],
  },
  {
    id: 'prog-002', title_ar: 'تفكيك التوتر - 5 أيام', title_en: '5-Day Stress Decompression',
    description_ar: 'برنامج متكامل لتفكيك التوتر المتراكم على مدى 5 أيام',
    category: 'relaxation', duration_days: 5, evidence_level: 'evidence_supported',
    icon: '🌿', color_from: 'from-emerald-500', color_to: 'to-teal-600', featured: true,
    tags: ['stress', 'program', 'decompression'],
    sessions: [
      { session_id: 'es-005', day: 1, order: 1, required: true, note_ar: 'تنظيم التنفس' },
      { session_id: 'es-001', day: 2, order: 1, required: true, note_ar: 'استرخاء ألفا' },
      { session_id: 'es-004', day: 3, order: 1, required: true, note_ar: 'إعادة ضبط ثيتا' },
      { session_id: 'em-004', day: 4, order: 1, required: true, note_ar: 'مسح الجسم' },
      { session_id: 'em-003', day: 5, order: 1, required: true, note_ar: 'تفريغ نهائي' },
    ],
  },
  {
    id: 'prog-003', title_ar: 'طقس التركيز الصباحي', title_en: 'Morning Focus Ritual',
    description_ar: 'ثلاث جلسات صباحية لبدء يومك بوضوح ذهني وتركيز',
    category: 'focus', duration_days: 3, evidence_level: 'evidence_supported',
    icon: '🎯', color_from: 'from-amber-500', color_to: 'to-orange-600', featured: true,
    tags: ['focus', 'morning', 'ritual'],
    sessions: [
      { session_id: 'es-005', day: 1, order: 1, required: true, note_ar: 'تنفس لإيقاظ الجسم' },
      { session_id: 'es-003', day: 2, order: 1, required: true, note_ar: 'تركيز بيتا' },
      { session_id: 'em-006', day: 3, order: 1, required: true, note_ar: 'وعي غاما' },
    ],
  },
  {
    id: 'prog-004', title_ar: 'إعادة ضبط المشاعر - 3 أيام', title_en: '3-Day Emotional Reset',
    description_ar: 'ثلاث جلسات متدرجة لإعادة التوازن العاطفي عند الشعور بالإرهاق النفسي',
    category: 'emotional_regulation', duration_days: 3, evidence_level: 'emerging_evidence',
    icon: '💜', color_from: 'from-purple-500', color_to: 'to-violet-600', featured: true,
    tags: ['emotional', 'reset', 'balance'],
    sessions: [
      { session_id: 'emo-001', day: 1, order: 1, required: true, note_ar: 'تهدئة القلق أولاً' },
      { session_id: 'em-003', day: 2, order: 1, required: true, note_ar: 'تفريغ المشاعر المتراكمة' },
      { session_id: 'emo-004', day: 3, order: 1, required: true, note_ar: 'بناء درع الهدوء الداخلي' },
    ],
  },
  {
    id: 'prog-005', title_ar: 'طقس الهدوء المسائي', title_en: 'Evening Unwind Ritual',
    description_ar: 'روتين مسائي من 3 جلسات لإنهاء اليوم بسلام وتحضير الجسم للنوم',
    category: 'relaxation', duration_days: 3, evidence_level: 'evidence_supported',
    icon: '🌅', color_from: 'from-orange-500', color_to: 'to-rose-600', featured: true,
    tags: ['evening', 'unwind', 'ritual'],
    sessions: [
      { session_id: 'rlx-004', day: 1, order: 1, required: true, note_ar: 'غروب هادئ — إنهاء اليوم' },
      { session_id: 'brw-002', day: 2, order: 1, required: true, note_ar: 'تنفس 4-7-8 المهدئ' },
      { session_id: 'slp-001', day: 3, order: 1, required: true, note_ar: 'نسيم الليل للنوم' },
    ],
  },
  {
    id: 'prog-006', title_ar: 'برنامج الراحة العميقة - 5 أيام', title_en: '5-Day Deep Rest',
    description_ar: 'خمس جلسات تتدرج من الاسترخاء السطحي إلى الراحة العميقة الشاملة',
    category: 'relaxation', duration_days: 5, evidence_level: 'emerging_evidence',
    icon: '🛁', color_from: 'from-sky-500', color_to: 'to-cyan-600', featured: false,
    tags: ['rest', 'deep', 'recovery'],
    sessions: [
      { session_id: 'rlx-003', day: 1, order: 1, required: true, note_ar: 'هدوء فوري — البداية' },
      { session_id: 'rlx-001', day: 2, order: 1, required: true, note_ar: 'استرخاء الجسم التدريجي' },
      { session_id: 'rlx-002', day: 3, order: 1, required: true, note_ar: 'حمام الصوت الدافئ' },
      { session_id: 'em-005', day: 4, order: 1, required: true, note_ar: 'مشهد صوتي للتعافي' },
      { session_id: 'rlx-005', day: 5, order: 1, required: true, note_ar: 'واحة السكينة — الغوص العميق' },
    ],
  },
  {
    id: 'prog-007', title_ar: 'دعم تخفيف الألم - 5 أيام', title_en: '5-Day Pain Support',
    description_ar: 'برنامج داعم لمن يعاني من آلام مزمنة — يجمع بين ترددات واسترخاء وتنفس',
    category: 'pain_coping', duration_days: 5, evidence_level: 'emerging_evidence',
    icon: '🩹', color_from: 'from-rose-500', color_to: 'to-pink-600', featured: false,
    tags: ['pain', 'support', 'coping'],
    sessions: [
      { session_id: 'brw-001', day: 1, order: 1, required: true, note_ar: 'تنفس الصندوق — إدارة الألم' },
      { session_id: 'em-002', day: 2, order: 1, required: true, note_ar: 'دعم تخفيف الألم' },
      { session_id: 'rlx-001', day: 3, order: 1, required: true, note_ar: 'استرخاء عضلي عميق' },
      { session_id: 'em-004', day: 4, order: 1, required: true, note_ar: 'مسح صوتي للجسم' },
      { session_id: 'gd-001', day: 5, order: 1, required: true, note_ar: 'رحلة السلام الداخلي' },
    ],
  },
  {
    id: 'prog-008', title_ar: 'تهدئة الجهاز العصبي - 7 أيام', title_en: '7-Day Nervous System Calm',
    description_ar: 'برنامج شامل لإعادة ضبط الجهاز العصبي المفرط النشاط عبر أسبوع كامل',
    category: 'relaxation', duration_days: 7, evidence_level: 'evidence_supported',
    icon: '🧠', color_from: 'from-teal-500', color_to: 'to-emerald-600', featured: true,
    tags: ['nervous-system', 'calm', 'reset'],
    sessions: [
      { session_id: 'brw-003', day: 1, order: 1, required: true, note_ar: 'تنفس التوازن — البداية' },
      { session_id: 'es-001', day: 2, order: 1, required: true, note_ar: 'استرخاء ألفا عميق' },
      { session_id: 'rlx-001', day: 3, order: 1, required: true, note_ar: 'استرخاء عضلي تدريجي' },
      { session_id: 'es-004', day: 4, order: 1, required: true, note_ar: 'إعادة ضبط ثيتا' },
      { session_id: 'nat-002', day: 5, order: 1, required: true, note_ar: 'جدول الجبل — طبيعة' },
      { session_id: 'em-004', day: 6, order: 1, required: true, note_ar: 'مسح الجسم — الوعي' },
      { session_id: 'rlx-005', day: 7, order: 1, required: true, note_ar: 'واحة السكينة — الختام' },
    ],
  },
  {
    id: 'prog-009', title_ar: 'التأمل المتقدم - 10 جلسات', title_en: 'Advanced Meditation Progression',
    description_ar: 'رحلة تأملية متدرجة من الوعي البسيط إلى حالات وعي أعمق — للمتقدمين',
    category: 'meditation_depth', duration_days: 10, evidence_level: 'emerging_evidence',
    icon: '🧘', color_from: 'from-violet-600', color_to: 'to-purple-800', featured: false,
    tags: ['meditation', 'advanced', 'progression'],
    sessions: [
      { session_id: 'es-001', day: 1, order: 1, required: true, note_ar: 'استرخاء — تمهيد' },
      { session_id: 'brw-003', day: 2, order: 1, required: true, note_ar: 'تنفس التوازن' },
      { session_id: 'es-004', day: 3, order: 1, required: true, note_ar: 'إعادة ضبط ثيتا' },
      { session_id: 'em-001', day: 4, order: 1, required: true, note_ar: 'نزول التأمل' },
      { session_id: 'mi-001', day: 5, order: 1, required: true, note_ar: 'حالة التركيز 10' },
      { session_id: 'em-004', day: 6, order: 1, required: true, note_ar: 'مسح الجسم الصوتي' },
      { session_id: 'mi-002', day: 7, order: 1, required: true, note_ar: 'حالة التوسع 12' },
      { session_id: 'rlx-005', day: 8, order: 1, required: true, note_ar: 'واحة السكينة' },
      { session_id: 'gd-001', day: 9, order: 1, required: true, note_ar: 'رحلة السلام الداخلي' },
      { session_id: 'mi-003', day: 10, order: 1, required: true, note_ar: 'جسر النوم العميق — الختام' },
    ],
  },
];

// ============================================================
// FEATURED COLLECTIONS
// ============================================================
export const FEATURED_COLLECTIONS: FeaturedCollection[] = [
  {
    id: 'fc-sleep', title_ar: 'الأفضل للنوم', title_en: 'Best for Sleep',
    description_ar: 'جلسات مختارة لتحسين جودة النوم',
    icon: '🌙', color_from: 'from-indigo-500', color_to: 'to-blue-700',
    session_ids: ['es-002', 'mi-003', 'em-005', 'slp-001', 'slp-002', 'slp-005'],
  },
  {
    id: 'fc-stress', title_ar: 'إعادة ضبط التوتر', title_en: 'Stress Reset',
    description_ar: 'أفضل الجلسات لتخفيف التوتر والضغط',
    icon: '🌿', color_from: 'from-emerald-500', color_to: 'to-teal-600',
    session_ids: ['es-001', 'es-004', 'es-005', 'em-003', 'rlx-003', 'brw-001'],
  },
  {
    id: 'fc-beginner', title_ar: 'للمبتدئين', title_en: 'Beginner Friendly',
    description_ar: 'ابدأ رحلتك هنا — جلسات آمنة وسهلة',
    icon: '🌱', color_from: 'from-lime-500', color_to: 'to-green-600',
    session_ids: ['es-001', 'es-005', 'sol-528', 'rlx-003', 'brw-001', 'gd-002'],
  },
  {
    id: 'fc-deep', title_ar: 'الغوص العميق', title_en: 'Deep Reset',
    description_ar: 'جلسات للتأمل العميق وإعادة الضبط الشامل',
    icon: '🌌', color_from: 'from-violet-500', color_to: 'to-purple-700',
    session_ids: ['em-001', 'mi-001', 'mi-002', 'rlx-005'],
  },
  {
    id: 'fc-quick', title_ar: 'هدوء سريع', title_en: 'Quick Calm',
    description_ar: 'جلسات قصيرة — 3 إلى 5 دقائق فقط',
    icon: '⚡', color_from: 'from-amber-500', color_to: 'to-orange-500',
    session_ids: ['rlx-003', 'brw-001', 'brw-002', 'fcs-003'],
  },
  {
    id: 'fc-emotional', title_ar: 'العناية بالمشاعر', title_en: 'Emotional Care',
    description_ar: 'جلسات لدعم التوازن العاطفي والشعور بالأمان',
    icon: '💜', color_from: 'from-purple-500', color_to: 'to-fuchsia-600',
    session_ids: ['emo-001', 'em-003', 'emo-002', 'emo-004', 'gd-001'],
  },
  {
    id: 'fc-focus', title_ar: 'التركيز والوضوح', title_en: 'Focus & Clarity',
    description_ar: 'عزز تركيزك وصفاء ذهنك',
    icon: '🎯', color_from: 'from-cyan-500', color_to: 'to-blue-600',
    session_ids: ['es-003', 'em-006', 'fcs-001', 'fcs-002', 'fcs-003'],
  },
  {
    id: 'fc-night', title_ar: 'طقوس الليل', title_en: 'Night Rituals',
    description_ar: 'جلسات مسائية وليلية للراحة والنوم',
    icon: '🌃', color_from: 'from-slate-600', color_to: 'to-indigo-800',
    session_ids: ['slp-001', 'slp-003', 'slp-005', 'rlx-004', 'brw-002'],
  },
];

// ============================================================
// MOOD DISCOVERY CARDS
// ============================================================
import { MoodDiscoveryCard } from '@/types/therapeuticSessionTypes';

export const MOOD_DISCOVERY_CARDS: MoodDiscoveryCard[] = [
  { id: 'md-sleep', label_ar: 'أحتاج للنوم', label_en: 'I need sleep', icon: '🌙', mood_key: 'tired', color_from: 'from-indigo-500', color_to: 'to-blue-600' },
  { id: 'md-stressed', label_ar: 'أشعر بالتوتر', label_en: 'I feel stressed', icon: '😤', mood_key: 'stressed', color_from: 'from-rose-500', color_to: 'to-pink-600' },
  { id: 'md-anxious', label_ar: 'أشعر بالقلق', label_en: 'I feel anxious', icon: '😰', mood_key: 'anxious', color_from: 'from-amber-500', color_to: 'to-orange-600' },
  { id: 'md-focus', label_ar: 'أحتاج تركيز', label_en: 'I need focus', icon: '🎯', mood_key: 'unfocused', color_from: 'from-cyan-500', color_to: 'to-blue-500' },
  { id: 'md-sad', label_ar: 'أشعر بالحزن', label_en: 'I feel sad', icon: '💧', mood_key: 'sad', color_from: 'from-blue-500', color_to: 'to-indigo-600' },
  { id: 'md-exhausted', label_ar: 'مرهق تماماً', label_en: 'I\'m exhausted', icon: '🔋', mood_key: 'exhausted', color_from: 'from-slate-500', color_to: 'to-gray-600' },
  { id: 'md-overwhelmed', label_ar: 'أحتاج هدوء فوري', label_en: 'I need calm now', icon: '⚡', mood_key: 'panic', color_from: 'from-emerald-500', color_to: 'to-teal-600' },
  { id: 'md-pain', label_ar: 'أعاني من ألم', label_en: 'I\'m in pain', icon: '🩹', mood_key: 'pain', color_from: 'from-red-500', color_to: 'to-rose-600' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
export function getSessionById(id: string): TherapeuticSession | undefined {
  return ALL_SESSIONS.find(s => s.id === id);
}

export function getSessionsByCategory(category: string): TherapeuticSession[] {
  return ALL_SESSIONS.filter(s => s.category === category);
}

export function getFeaturedSessions(): TherapeuticSession[] {
  return ALL_SESSIONS.filter(s => s.featured);
}

export function getEvidenceSupportedSessions(): TherapeuticSession[] {
  return ALL_SESSIONS.filter(s => s.evidence_level === 'evidence_supported');
}

export function searchSessions(query: string): TherapeuticSession[] {
  const q = query.toLowerCase();
  return ALL_SESSIONS.filter(s =>
    s.title_ar.toLowerCase().includes(q) ||
    s.title_en.toLowerCase().includes(q) ||
    s.description_ar.toLowerCase().includes(q) ||
    s.tags.some(t => t.includes(q)) ||
    s.intended_outcome_ar.toLowerCase().includes(q)
  );
}

export function getSessionsByMood(moodKey: string): TherapeuticSession[] {
  return ALL_SESSIONS.filter(s => s.mood_tags?.includes(moodKey));
}

export function getBeginnerSessions(): TherapeuticSession[] {
  return ALL_SESSIONS.filter(s => s.beginner_friendly);
}

export function getRecentSessionsById(ids: string[]): TherapeuticSession[] {
  return ids.map(id => getSessionById(id)).filter(Boolean) as TherapeuticSession[];
}
