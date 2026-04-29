export type ComplaintSystem = {
  id: string;
  label: string;
  icon: string;
  complaints: { id: string; label: string; examples?: string; pathwayId: string }[];
};

export const COMPLAINT_SYSTEMS: ComplaintSystem[] = [
  {
    id: 'general',
    label: 'عام وطاقة',
    icon: '⚡',
    complaints: [
      { id: 'fatigue', label: 'تعب وخمول', examples: 'إرهاق، هبوط، ضعف تركيز', pathwayId: 'fatigue' },
      { id: 'fever_chills', label: 'حرارة/قشعريرة', examples: 'حرارة، رجفة، تعرق', pathwayId: 'immune' },
      { id: 'weight_loss', label: 'نقص وزن', examples: 'نقص بدون سبب واضح', pathwayId: 'fatigue' },
      { id: 'general_dizziness', label: 'دوخة عامة', examples: 'خفة رأس، عدم توازن', pathwayId: 'headache' },
      { id: 'poor_appetite', label: 'ضعف شهية', examples: 'أكل أقل من المعتاد', pathwayId: 'digestion' },
    ],
  },
  {
    id: 'digestive',
    label: 'الجهاز الهضمي',
    icon: '🍽️',
    complaints: [
      { id: 'abdominal_pain', label: 'ألم بطن', examples: 'مغص، شد، ألم بعد الأكل', pathwayId: 'digestion' },
      { id: 'bloating_gas', label: 'انتفاخ وغازات', examples: 'ثقل، غازات، قرقرة', pathwayId: 'digestion' },
      { id: 'reflux', label: 'حموضة/ارتجاع', examples: 'حرقان، مرارة، رجوع أكل', pathwayId: 'digestion' },
      { id: 'constipation', label: 'إمساك', examples: 'تأخر، صعوبة إخراج', pathwayId: 'digestion' },
      { id: 'diarrhea', label: 'إسهال', examples: 'تكرر، ليونة، استعجال', pathwayId: 'digestion' },
      { id: 'nausea_vomiting', label: 'غثيان/قيء', examples: 'لعيان، ترجيع', pathwayId: 'digestion' },
      { id: 'blood_stool', label: 'دم في البراز', examples: 'أحمر أو أسود', pathwayId: 'digestion' },
    ],
  },
  {
    id: 'respiratory',
    label: 'الجهاز التنفسي',
    icon: '🫁',
    complaints: [
      { id: 'cough', label: 'كحة', examples: 'جافة أو مع بلغم', pathwayId: 'immune' },
      { id: 'short_breath', label: 'ضيق نفس', examples: 'مع الراحة أو الجهد', pathwayId: 'pain' },
      { id: 'chest_breath_pain', label: 'ألم صدر مع النفس', examples: 'يزيد مع الشهيق', pathwayId: 'pain' },
      { id: 'wheeze', label: 'صفير', examples: 'صوت مع النفس', pathwayId: 'immune' },
      { id: 'phlegm', label: 'بلغم', examples: 'أبيض، أصفر، أخضر', pathwayId: 'immune' },
      { id: 'chest_allergy', label: 'حساسية صدر', examples: 'ربو، تهيج، كتمة', pathwayId: 'immune' },
    ],
  },
  {
    id: 'cardio',
    label: 'القلب والدورة الدموية',
    icon: '❤️',
    complaints: [
      { id: 'chest_pain', label: 'ألم صدر', examples: 'ضغط، ثقل، حرقان', pathwayId: 'pain' },
      { id: 'palpitations', label: 'خفقان', examples: 'نبض سريع أو غير منتظم', pathwayId: 'anxiety' },
      { id: 'effort_dyspnea', label: 'ضيق نفس مع الجهد', examples: 'مع المشي أو الدرج', pathwayId: 'fatigue' },
      { id: 'leg_swelling', label: 'تورم الرجلين', examples: 'انتفاخ القدمين', pathwayId: 'fatigue' },
      { id: 'syncope', label: 'إغماء أو شبه إغماء', examples: 'دوخة شديدة أو سقوط', pathwayId: 'general_uncertain' },
    ],
  },
  {
    id: 'neuro',
    label: 'الجهاز العصبي',
    icon: '🧠',
    complaints: [
      { id: 'headache', label: 'صداع', examples: 'ضغط، نبض، شقيقة', pathwayId: 'headache' },
      { id: 'vertigo', label: 'دوخة/دوار', examples: 'الدنيا تلف، عدم اتزان', pathwayId: 'headache' },
      { id: 'numbness', label: 'تنميل', examples: 'وخز، خدر', pathwayId: 'pain' },
      { id: 'limb_weakness', label: 'ضعف في طرف', examples: 'يد أو رجل', pathwayId: 'pain' },
      { id: 'seizures', label: 'تشنجات', examples: 'نوبة أو فقدان وعي', pathwayId: 'general_uncertain' },
      { id: 'poor_focus', label: 'ضعف تركيز', examples: 'تشوش، نسيان', pathwayId: 'fatigue' },
      { id: 'sudden_vision', label: 'اضطراب رؤية مفاجئ', examples: 'زغللة أو فقدان رؤية', pathwayId: 'headache' },
    ],
  },
  {
    id: 'musculoskeletal',
    label: 'العضلات والمفاصل',
    icon: '🦴',
    complaints: [
      { id: 'back_pain', label: 'ألم ظهر', examples: 'أسفل أو أعلى الظهر', pathwayId: 'pain' },
      { id: 'neck_pain', label: 'ألم رقبة', examples: 'شد، تيبس، ألم كتف', pathwayId: 'pain' },
      { id: 'joint_pain', label: 'ألم مفاصل', examples: 'ركبة، يد، كتف', pathwayId: 'pain' },
      { id: 'morning_stiffness', label: 'تيبس صباحي', examples: 'صعوبة بداية الحركة', pathwayId: 'pain' },
      { id: 'muscle_pain', label: 'ألم عضلات', examples: 'وجع منتشر أو موضعي', pathwayId: 'pain' },
      { id: 'injury_sprain', label: 'إصابة/التواء', examples: 'بعد سقوط أو حركة', pathwayId: 'pain' },
    ],
  },
  {
    id: 'skin_hair',
    label: 'الجلد والشعر',
    icon: '🧴',
    complaints: [
      { id: 'rash', label: 'طفح', examples: 'بقع، احمرار، حبوب', pathwayId: 'immune' },
      { id: 'itching', label: 'حكة', examples: 'مع أو بدون طفح', pathwayId: 'immune' },
      { id: 'eczema', label: 'أكزيما', examples: 'جفاف، تشقق، حكة', pathwayId: 'immune' },
      { id: 'hair_loss', label: 'تساقط شعر', examples: 'زيادة واضحة', pathwayId: 'hormonal' },
      { id: 'acne', label: 'حب شباب', examples: 'وجه أو جسم', pathwayId: 'hormonal' },
      { id: 'pigmentation', label: 'تصبغات', examples: 'بقع أو تغير لون', pathwayId: 'hormonal' },
      { id: 'skin_infection', label: 'جرح أو التهاب جلد', examples: 'ألم، صديد، حرارة', pathwayId: 'immune' },
    ],
  },
  {
    id: 'ent',
    label: 'الأنف والأذن والحنجرة',
    icon: '👂',
    complaints: [
      { id: 'sore_throat', label: 'ألم حلق', examples: 'بلع مؤلم، احتقان', pathwayId: 'immune' },
      { id: 'blocked_nose', label: 'انسداد أنف', examples: 'زكام أو حساسية', pathwayId: 'immune' },
      { id: 'runny_nose', label: 'سيلان', examples: 'ماء أو إفرازات', pathwayId: 'immune' },
      { id: 'ear_pain', label: 'ألم أذن', examples: 'ضغط أو التهاب', pathwayId: 'immune' },
      { id: 'tinnitus', label: 'طنين', examples: 'صفير أو وش', pathwayId: 'headache' },
      { id: 'hoarseness', label: 'بحة صوت', examples: 'تغير الصوت', pathwayId: 'immune' },
      { id: 'swallowing', label: 'صعوبة بلع', examples: 'ألم أو تعلق', pathwayId: 'digestion' },
    ],
  },
  {
    id: 'eye',
    label: 'العين',
    icon: '👁️',
    complaints: [
      { id: 'red_eye', label: 'احمرار', examples: 'احمرار أو دموع', pathwayId: 'immune' },
      { id: 'eye_pain', label: 'ألم عين', examples: 'ألم أو ضغط', pathwayId: 'headache' },
      { id: 'blurred_vision', label: 'زغللة', examples: 'رؤية غير واضحة', pathwayId: 'headache' },
      { id: 'eye_itch', label: 'حكة', examples: 'حساسية أو تهيج', pathwayId: 'immune' },
      { id: 'eye_discharge', label: 'إفرازات', examples: 'صديد أو التصاق', pathwayId: 'immune' },
      { id: 'eye_allergy', label: 'حساسية', examples: 'دموع وحكة', pathwayId: 'immune' },
    ],
  },
  {
    id: 'dental',
    label: 'الأسنان والفم',
    icon: '🦷',
    complaints: [
      { id: 'tooth_pain', label: 'ألم سن', examples: 'مع بارد أو حار', pathwayId: 'pain' },
      { id: 'gum_swelling', label: 'تورم لثة', examples: 'انتفاخ أو ألم', pathwayId: 'immune' },
      { id: 'mouth_ulcer', label: 'قرحة فم', examples: 'تقرح مؤلم', pathwayId: 'immune' },
      { id: 'bad_breath', label: 'رائحة فم', examples: 'مستمرة أو جديدة', pathwayId: 'digestion' },
      { id: 'gum_bleeding', label: 'نزيف لثة', examples: 'مع التفريش أو تلقائي', pathwayId: 'immune' },
    ],
  },
  {
    id: 'urinary',
    label: 'البول والكلى',
    icon: '💧',
    complaints: [
      { id: 'burning_urine', label: 'حرقان بول', examples: 'ألم أو لسعة', pathwayId: 'immune' },
      { id: 'frequent_urine', label: 'كثرة تبول', examples: 'ليل أو نهار', pathwayId: 'hormonal' },
      { id: 'flank_pain', label: 'ألم جنب', examples: 'يمين أو يسار', pathwayId: 'pain' },
      { id: 'blood_urine', label: 'دم في البول', examples: 'لون أحمر أو غامق', pathwayId: 'immune' },
      { id: 'urine_color', label: 'تغير لون البول', examples: 'غامق أو رغوي', pathwayId: 'general_uncertain' },
      { id: 'body_swelling', label: 'تورم', examples: 'وجه أو رجلين', pathwayId: 'fatigue' },
    ],
  },
  {
    id: 'hormones',
    label: 'الهرمونات والغدد',
    icon: '🧬',
    complaints: [
      { id: 'cold_fatigue', label: 'تعب مع برودة', examples: 'برد، خمول، بطء', pathwayId: 'hormonal' },
      { id: 'weight_change', label: 'زيادة/نقص وزن', examples: 'بدون سبب واضح', pathwayId: 'hormonal' },
      { id: 'sweating', label: 'تعرق', examples: 'حرارة أو عرق زائد', pathwayId: 'hormonal' },
      { id: 'cycle_change', label: 'اضطراب دورة', examples: 'تأخر أو عدم انتظام', pathwayId: 'hormonal' },
      { id: 'hair_loss_hormone', label: 'تساقط شعر', examples: 'مع تعب أو دورة', pathwayId: 'hormonal' },
      { id: 'tremor_palpitations', label: 'خفقان مع رجفة', examples: 'نبض وارتعاش', pathwayId: 'hormonal' },
    ],
  },
  {
    id: 'women',
    label: 'النساء',
    icon: '🌸',
    complaints: [
      { id: 'period_pain', label: 'ألم دورة', examples: 'قبل أو أثناء الدورة', pathwayId: 'hormonal' },
      { id: 'irregular_period', label: 'اضطراب دورة', examples: 'تأخر أو نزيف', pathwayId: 'hormonal' },
      { id: 'discharge', label: 'إفرازات', examples: 'لون أو رائحة', pathwayId: 'immune' },
      { id: 'pelvic_pain', label: 'ألم حوض', examples: 'أسفل البطن', pathwayId: 'pain' },
      { id: 'pregnancy_possible', label: 'حمل/احتمال حمل', examples: 'تأخر دورة أو اختبار', pathwayId: 'hormonal' },
      { id: 'abnormal_bleeding', label: 'نزيف غير طبيعي', examples: 'غزير أو خارج الدورة', pathwayId: 'hormonal' },
    ],
  },
  {
    id: 'mental',
    label: 'النفس والضغط',
    icon: '🌿',
    complaints: [
      { id: 'anxiety', label: 'قلق', examples: 'تفكير زائد أو خوف', pathwayId: 'anxiety' },
      { id: 'distress', label: 'ضيق', examples: 'ثقل أو انقباض', pathwayId: 'anxiety' },
      { id: 'panic', label: 'نوبات هلع', examples: 'خوف مفاجئ وخفقان', pathwayId: 'anxiety' },
      { id: 'stress', label: 'توتر', examples: 'شد وقلق داخلي', pathwayId: 'anxiety' },
      { id: 'thinking_insomnia', label: 'أرق بسبب التفكير', examples: 'العقل ما يهدأ', pathwayId: 'sleep' },
      { id: 'mental_fatigue', label: 'تعب نفسي', examples: 'استنزاف وضيق', pathwayId: 'anxiety' },
    ],
  },
  {
    id: 'sleep',
    label: 'النوم والروتين',
    icon: '🌙',
    complaints: [
      { id: 'insomnia', label: 'أرق', examples: 'صعوبة نوم', pathwayId: 'sleep' },
      { id: 'broken_sleep', label: 'نوم متقطع', examples: 'صحوات كثيرة', pathwayId: 'sleep' },
      { id: 'tired_wake', label: 'صحوة متعبة', examples: 'تقوم مرهق', pathwayId: 'sleep' },
      { id: 'day_sleepiness', label: 'نعاس نهاري', examples: 'خمول بعد الصباح', pathwayId: 'sleep' },
      { id: 'late_sleep', label: 'نوم متأخر', examples: 'سهر أو روتين مقلوب', pathwayId: 'sleep' },
      { id: 'nightmares', label: 'كوابيس', examples: 'أحلام مزعجة', pathwayId: 'sleep' },
    ],
  },
  {
    id: 'uncertain',
    label: 'لا أعرف',
    icon: '؟',
    complaints: [
      { id: 'not_sure', label: 'مش عارف أحدد', examples: 'الأعراض متداخلة أو غير واضحة', pathwayId: 'general_uncertain' },
    ],
  },
];

export function findComplaint(systemId: string, complaintId: string) {
  const system = COMPLAINT_SYSTEMS.find(item => item.id === systemId);
  const complaint = system?.complaints.find(item => item.id === complaintId);
  return { system, complaint };
}

export const RELATED_SYMPTOMS_BY_SYSTEM: Record<string, string[]> = {
  digestive: ['انتفاخ', 'غازات', 'حموضة', 'إمساك', 'إسهال', 'غثيان', 'قيء', 'فقدان شهية', 'دم بالبراز', 'حرارة'],
  respiratory: ['ضيق نفس', 'صفير', 'بلغم', 'حرارة', 'ألم صدر', 'تعب شديد'],
  neuro: ['زغللة', 'تنميل', 'ضعف', 'غثيان', 'حساسية للضوء', 'دوخة'],
  musculoskeletal: ['تورم', 'احمرار', 'تيبس صباحي', 'تنميل', 'ضعف', 'إصابة'],
  cardio: ['ضيق نفس', 'خفقان', 'تعرق', 'دوخة', 'ألم ينتقل للذراع أو الفك', 'تورم الرجلين'],
  urinary: ['حرارة', 'ألم جنب', 'غثيان', 'تغير لون البول', 'تورم', 'ألم أسفل البطن'],
  skin_hair: ['حرارة', 'ألم', 'تورم', 'إفرازات', 'حكة', 'انتشار سريع'],
  ent: ['حرارة', 'كحة', 'بلغم', 'صعوبة بلع', 'ألم أذن', 'انسداد'],
  eye: ['ألم', 'حكة', 'زغللة', 'إفرازات', 'صداع', 'حساسية للضوء'],
  dental: ['تورم', 'حرارة', 'نزيف', 'رائحة فم', 'ألم مع المضغ'],
  hormones: ['تعب', 'برودة', 'خفقان', 'تغير وزن', 'تعرق', 'اضطراب نوم'],
  women: ['ألم حوض', 'إفرازات', 'نزيف', 'تأخر دورة', 'حرارة', 'دوخة'],
  mental: ['أرق', 'خفقان', 'ضيق نفس', 'شد عضلي', 'تعب', 'خوف صحي'],
  sleep: ['نعاس نهاري', 'صداع صباحي', 'خفقان', 'كوابيس', 'تعب', 'قلة تركيز'],
  general: ['حرارة', 'تعب شديد', 'دوخة', 'نقص وزن', 'ضعف شهية', 'ألم عام'],
  uncertain: ['تعب', 'دوخة', 'ألم', 'غثيان', 'قلق', 'أرق'],
};
