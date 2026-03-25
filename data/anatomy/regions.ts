export type RegionType = 'surface' | 'organ' | 'system' | 'joint';
export type CTAType = 'assessment' | 'ai_analysis' | 'booking' | 'care';

export interface AnatomicalRegion {
  id: string;
  name: string;
  label_en: string;
  anatomical_group: string;
  body_side: 'front' | 'back' | 'both';
  view: 'front' | 'back';
  region_type: RegionType;
  path_d: string;
  viewBoxBounds: { x: number; y: number; w: number; h: number };
  cx: number;
  cy: number;
  symptom_hooks: string[];
  medical_context: string;
  linkedCTA: CTAType;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  emotion: string;
  description: string;
  deeperCause: string;
  treatment: string[];
  affirmation: string;
}

/* ═════════════════════════════════════════════════
   High-fidelity silhouette (400×600)
   ═════════════════════════════════════════════════ */
export const BODY_SILHOUETTE_FRONT =
  'M200 18 ' +
  'C222 18 240 34 240 54 C240 70 230 80 218 84 ' +
  'L214 100 ' +
  'C226 103 252 110 272 118 C288 124 300 136 304 154 ' +
  'C310 180 312 212 306 244 C302 264 294 284 286 300 ' +
  'C282 312 278 324 276 334 ' +
  'L272 330 C270 320 268 302 266 282 ' +
  'L264 154 C262 140 256 130 250 128 ' +
  'L250 282 C250 306 246 324 240 334 ' +
  'L230 340 L228 530 C226 542 222 552 216 556 ' +
  'C210 560 206 558 204 552 L202 348 ' +
  'C201 343 199 343 198 348 ' +
  'L196 552 C194 558 190 560 184 556 ' +
  'C178 552 174 542 172 530 L170 340 ' +
  'L160 334 C154 324 150 306 150 282 ' +
  'L150 128 C144 130 138 140 136 154 ' +
  'L134 282 C132 302 130 320 128 330 ' +
  'L124 334 C122 324 118 312 114 300 ' +
  'C106 284 98 264 94 244 ' +
  'C88 212 90 180 96 154 ' +
  'C100 136 112 124 128 118 ' +
  'C148 110 174 103 186 100 ' +
  'L182 84 C170 80 160 70 160 54 ' +
  'C160 34 178 18 200 18 Z';

export const BODY_SILHOUETTE_BACK = BODY_SILHOUETTE_FRONT;

/* ═════════════════════════════════════════════════
   FRONT VIEW — Full-body coverage regions
   Order: broad coverage first, specific organs last
   (SVG renders later items on top for click priority)
   ═════════════════════════════════════════════════ */
export const anatomicalRegions: AnatomicalRegion[] = [

  // ── BROAD COVERAGE: Shoulders ──
  {
    id: 'right_shoulder',
    name: 'الكتف الأيمن',
    label_en: 'Right Deltoid',
    anatomical_group: 'Musculoskeletal',
    body_side: 'front',
    view: 'front',
    region_type: 'joint',
    path_d: 'M214 100 C226 103 252 110 272 118 C288 124 300 136 304 154 L264 154 C262 140 256 130 250 128 L214 100 Z',
    viewBoxBounds: { x: 210, y: 96, w: 98, h: 62 },
    cx: 262, cy: 128,
    symptom_hooks: ['ألم الكتف', 'تجمد الكتف', 'التهاب وتر'],
    medical_context: 'العضلة الدالية مسؤولة عن رفع وتدوير الذراع.',
    linkedCTA: 'booking',
    categoryName: 'حمل المسؤوليات',
    categoryColor: '#FF8B94',
    categoryIcon: '💪',
    emotion: 'ثقل المسؤوليات',
    description: 'الأكتاف تحمل أعباء المسؤوليات والتوقعات.',
    deeperCause: 'الشعور بأنك المسؤول الوحيد عن كل شيء.',
    treatment: ['تمارين دوران الكتف', 'تفويض المهام', 'التدليك العميق'],
    affirmation: 'أنا أحمل فقط ما يخصني، وأترك الباقي بسلام.'
  },
  {
    id: 'left_shoulder',
    name: 'الكتف الأيسر',
    label_en: 'Left Deltoid',
    anatomical_group: 'Musculoskeletal',
    body_side: 'front',
    view: 'front',
    region_type: 'joint',
    path_d: 'M186 100 C174 103 148 110 128 118 C112 124 100 136 96 154 L136 154 C138 140 144 130 150 128 L186 100 Z',
    viewBoxBounds: { x: 92, y: 96, w: 98, h: 62 },
    cx: 138, cy: 128,
    symptom_hooks: ['ألم الكتف', 'تيبس', 'محدودية الحركة'],
    medical_context: 'العضلة الدالية اليسرى — قريبة من القلب وتتأثر بالتوتر العاطفي.',
    linkedCTA: 'booking',
    categoryName: 'العبء العاطفي',
    categoryColor: '#FF8B94',
    categoryIcon: '💪',
    emotion: 'العبء العاطفي',
    description: 'الكتف الأيسر يرتبط بالأحمال العاطفية والحزن المكبوت.',
    deeperCause: 'حمل مشاعر الآخرين على عاتقك.',
    treatment: ['تمارين الاسترخاء', 'البكاء الصحي', 'مساج الأكتاف'],
    affirmation: 'أنا أحرر المشاعر الثقيلة وأسمح لنفسي بالراحة.'
  },

  // ── BROAD COVERAGE: Arms ──
  {
    id: 'right_arm',
    name: 'الذراع الأيمن',
    label_en: 'Right Arm',
    anatomical_group: 'Musculoskeletal',
    body_side: 'front',
    view: 'front',
    region_type: 'surface',
    path_d: 'M304 154 C310 180 312 212 306 244 C302 264 294 284 286 300 C282 312 278 324 276 334 L272 330 C270 320 268 302 266 282 L264 154 Z',
    viewBoxBounds: { x: 260, y: 150, w: 54, h: 188 },
    cx: 286, cy: 244,
    symptom_hooks: ['تنميل', 'ضعف العضلات', 'ألم المرفق', 'تشنج'],
    medical_context: 'يضم عضلات العضد والساعد المسؤولة عن الإمساك والحركة الدقيقة.',
    linkedCTA: 'assessment',
    categoryName: 'القدرة على العطاء',
    categoryColor: '#64748B',
    categoryIcon: '🤲',
    emotion: 'صعوبة العطاء أو الاستقبال',
    description: 'الأذرع تمثل قدرتنا على احتضان الحياة والإمساك بفرصها.',
    deeperCause: 'الخوف من فقدان السيطرة أو العجز عن التمسك بالأشياء.',
    treatment: ['تمارين التمدد', 'العطاء للآخرين', 'الاحتضان'],
    affirmation: 'ذراعاي مفتوحتان لاستقبال الخير والعطاء بحرية.'
  },
  {
    id: 'left_arm',
    name: 'الذراع الأيسر',
    label_en: 'Left Arm',
    anatomical_group: 'Musculoskeletal',
    body_side: 'front',
    view: 'front',
    region_type: 'surface',
    path_d: 'M96 154 C90 180 88 212 94 244 C98 264 106 284 114 300 C118 312 122 324 124 334 L128 330 C130 320 132 302 134 282 L136 154 Z',
    viewBoxBounds: { x: 86, y: 150, w: 54, h: 188 },
    cx: 114, cy: 244,
    symptom_hooks: ['ألم إشعاعي', 'ضعف القبضة', 'تنميل الأصابع'],
    medical_context: 'الذراع الأيسر — ألمه قد يرتبط بالقلب ويتطلب تقييماً دقيقاً.',
    linkedCTA: 'ai_analysis',
    categoryName: 'الاستقبال العاطفي',
    categoryColor: '#64748B',
    categoryIcon: '🤲',
    emotion: 'صعوبة تقبل المساعدة',
    description: 'الذراع الأيسر يمثل الجانب الاستقبالي — القدرة على قبول الدعم.',
    deeperCause: 'الاعتقاد بأن طلب المساعدة ضعف.',
    treatment: ['تقبل المساعدة', 'تمارين القبضة والإرخاء', 'التأمل'],
    affirmation: 'أنا أستحق المساعدة وأقبلها بامتنان.'
  },

  // ── BROAD COVERAGE: Pelvis ──
  {
    id: 'pelvis',
    name: 'الحوض',
    label_en: 'Pelvic Region',
    anatomical_group: 'Reproductive / Urinary',
    body_side: 'front',
    view: 'front',
    region_type: 'surface',
    path_d: 'M248 318 C248 328 246 334 240 334 L228 340 L202 348 C201 343 199 343 198 348 L172 340 L160 334 C154 334 152 328 152 318 C165 312 182 308 200 308 C218 308 235 312 248 318 Z',
    viewBoxBounds: { x: 148, y: 304, w: 104, h: 48 },
    cx: 200, cy: 328,
    symptom_hooks: ['آلام الحوض', 'مشاكل المثانة', 'آلام الدورة'],
    medical_context: 'يضم المثانة والأعضاء التناسلية وقاع الحوض.',
    linkedCTA: 'booking',
    categoryName: 'الأمان والإبداع',
    categoryColor: '#E879F9',
    categoryIcon: '🌸',
    emotion: 'قضايا الأمان والإبداع',
    description: 'منطقة الحوض مرتبطة بالأمان المادي والإبداع والعلاقات الحميمة.',
    deeperCause: 'فقدان الإحساس بالأمان الجسدي أو العاطفي.',
    treatment: ['تمارين كيجل', 'التأمل على الشاكرا الثانية', 'التعبير الإبداعي'],
    affirmation: 'أنا آمن في جسدي وأتدفق مع طاقة الحياة.'
  },

  // ── BROAD COVERAGE: Thighs ──
  {
    id: 'right_thigh',
    name: 'الفخذ الأيمن',
    label_en: 'Right Thigh',
    anatomical_group: 'Musculoskeletal',
    body_side: 'front',
    view: 'front',
    region_type: 'surface',
    path_d: 'M228 342 L226 440 L203 440 L202 348 Z',
    viewBoxBounds: { x: 200, y: 338, w: 32, h: 106 },
    cx: 216, cy: 390,
    symptom_hooks: ['شد عضلي', 'ألم الورك', 'إجهاد رباعية'],
    medical_context: 'أقوى مجموعة عضلية في الجسم — الرباعية والأوتار الخلفية.',
    linkedCTA: 'assessment',
    categoryName: 'القوة الداخلية',
    categoryColor: '#2D9B83',
    categoryIcon: '🏃',
    emotion: 'التردد في التقدم',
    description: 'الأفخاذ تمثل القوة الداخلية والقدرة على المضي قدماً.',
    deeperCause: 'الخوف من اتخاذ خطوات كبيرة في الحياة.',
    treatment: ['المشي السريع', 'تمارين السكوات', 'تحديد هدف واحد واضح'],
    affirmation: 'أنا قوي بما يكفي لاتخاذ الخطوة التالية.'
  },
  {
    id: 'left_thigh',
    name: 'الفخذ الأيسر',
    label_en: 'Left Thigh',
    anatomical_group: 'Musculoskeletal',
    body_side: 'front',
    view: 'front',
    region_type: 'surface',
    path_d: 'M172 342 L174 440 L197 440 L198 348 Z',
    viewBoxBounds: { x: 168, y: 338, w: 32, h: 106 },
    cx: 184, cy: 390,
    symptom_hooks: ['تشنج', 'ألم لفافي', 'ضعف عضلي'],
    medical_context: 'عضلات الفخذ اليسرى تدعم التوازن والحركة الوظيفية.',
    linkedCTA: 'assessment',
    categoryName: 'الثبات الداخلي',
    categoryColor: '#2D9B83',
    categoryIcon: '🏃',
    emotion: 'الشعور بعدم الثبات',
    description: 'ألم الفخذ الأيسر مرتبط بالتردد والشعور بفقدان الأرضية.',
    deeperCause: 'عدم الثقة في قدراتك على مواجهة التحديات.',
    treatment: ['اليوجا', 'تمارين التوازن', 'كتابة 3 إنجازات يومياً'],
    affirmation: 'أنا ثابت في جذوري وواثق في طريقي.'
  },

  // ── BROAD COVERAGE: Shins ──
  {
    id: 'right_shin',
    name: 'ساق يمنى',
    label_en: 'Right Lower Leg',
    anatomical_group: 'Musculoskeletal',
    body_side: 'front',
    view: 'front',
    region_type: 'surface',
    path_d: 'M226 440 C225 470 225 510 226 530 C225 542 221 552 216 556 C210 560 206 558 204 552 L203 440 Z',
    viewBoxBounds: { x: 200, y: 436, w: 30, h: 124 },
    cx: 215, cy: 500,
    symptom_hooks: ['ألم قصبة الساق', 'تشنج ربلة', 'دوالي', 'تورم الكاحل'],
    medical_context: 'تضم عظم القصبة والشظية وعضلات الربلة ومفصل الكاحل.',
    linkedCTA: 'assessment',
    categoryName: 'الأساس والتوازن',
    categoryColor: '#94A3B8',
    categoryIcon: '🦵',
    emotion: 'فقدان التوازن',
    description: 'ألم الساقين يرتبط بالشعور بعدم التوازن في مسيرة الحياة.',
    deeperCause: 'محاولة الجري أسرع من قدرتك أو الوقوف دون حراك.',
    treatment: ['رفع الساقين', 'المشي الحافي', 'تمارين التوازن'],
    affirmation: 'أنا أسير في الحياة بتوازن وسكينة.'
  },
  {
    id: 'left_shin',
    name: 'ساق يسرى',
    label_en: 'Left Lower Leg',
    anatomical_group: 'Musculoskeletal',
    body_side: 'front',
    view: 'front',
    region_type: 'surface',
    path_d: 'M174 440 C175 470 175 510 174 530 C175 542 179 552 184 556 C190 560 194 558 196 552 L197 440 Z',
    viewBoxBounds: { x: 170, y: 436, w: 30, h: 124 },
    cx: 185, cy: 500,
    symptom_hooks: ['تشنج', 'تنميل', 'ألم الكاحل', 'ثقل الساق'],
    medical_context: 'الساق اليسرى — تدعم الوزن وتتأثر بمشاكل الدورة الدموية.',
    linkedCTA: 'assessment',
    categoryName: 'المسيرة والاتجاه',
    categoryColor: '#94A3B8',
    categoryIcon: '🦵',
    emotion: 'التشتت في الاتجاه',
    description: 'ألم الساق اليسرى يدل على حيرة في اختيار الاتجاه الصحيح.',
    deeperCause: 'الشعور بأنك تسير في الطريق الخطأ.',
    treatment: ['المشي في الطبيعة', 'التأمل التوجيهي', 'تحديد الأولويات'],
    affirmation: 'خطواتي واثقة وأعلم أن طريقي هو الصحيح.'
  },

  // ═════════════════════════════════════════════
  // SPECIFIC ORGANS (rendered on top for click priority)
  // ═════════════════════════════════════════════
  {
    id: 'head',
    name: 'الرأس',
    label_en: 'Central Nervous System',
    anatomical_group: 'Neurological',
    body_side: 'front',
    view: 'front',
    region_type: 'organ',
    path_d: 'M200 26 C216 26 230 38 230 54 C230 68 218 78 200 78 C182 78 170 68 170 54 C170 38 184 26 200 26 Z',
    viewBoxBounds: { x: 166, y: 22, w: 68, h: 60 },
    cx: 200, cy: 52,
    symptom_hooks: ['صداع توتري', 'إرهاق ذهني', 'ضبابية التفكير', 'دوار'],
    medical_context: 'يتحكم الجهاز العصبي المركزي بجميع الوظائف الإدراكية والسلوكية.',
    linkedCTA: 'assessment',
    categoryName: 'مركز القيادة',
    categoryColor: '#FF6B6B',
    categoryIcon: '🧠',
    emotion: 'التوتر والضغط المستمر',
    description: 'كثرة التفكير (Overthinking) والشعور بمسؤولية مفرطة.',
    deeperCause: 'الرغبة في السيطرة على كل التفاصيل والخوف من الخطأ.',
    treatment: ['التفريغ الكتابي', 'التأمل لدقيقة', 'تقبل عدم الكمال'],
    affirmation: 'أنا أثق في سير الحياة، وأسمح لعقلي بالراحة.'
  },
  {
    id: 'throat',
    name: 'الحلق/الرقبة',
    label_en: 'Pharynx & Thyroid',
    anatomical_group: 'Endocrine/Respiratory',
    body_side: 'front',
    view: 'front',
    region_type: 'organ',
    path_d: 'M194 88 C190 92 189 102 191 108 C193 113 197 116 200 116 C203 116 207 113 209 108 C211 102 210 92 206 88 C203 86 197 86 194 88 Z',
    viewBoxBounds: { x: 185, y: 82, w: 30, h: 38 },
    cx: 200, cy: 100,
    symptom_hooks: ['صعوبة البلع', 'احتقان', 'بحة الصوت', 'تقلبات الغدة'],
    medical_context: 'يشمل مسارات التنفس والأحبال الصوتية ومنطقة الغدة الدرقية.',
    linkedCTA: 'assessment',
    categoryName: 'بوابة التعبير',
    categoryColor: '#4ECDC4',
    categoryIcon: '🗣️',
    emotion: 'كبت الكلام والحقيقة',
    description: 'الشعور بالعجز عن التعبير عن النفس أو "ابتلاع" الغضب.',
    deeperCause: 'الخوف من الرفض إذا عبرت عن حقيقتك.',
    treatment: ['الغناء أو الدندنة', 'التحدث بصدق مع النفس', 'شرب الماء بكثرة'],
    affirmation: 'صوتي مسموع، وأعبر عن نفسي بوضوح وحب.'
  },
  {
    id: 'chest',
    name: 'الصدر',
    label_en: 'Cardiopulmonary System',
    anatomical_group: 'Cardiovascular & Respiratory',
    body_side: 'front',
    view: 'front',
    region_type: 'system',
    path_d:
      'M168 134 C158 140 154 168 158 196 C160 214 170 226 182 226 C190 226 194 216 196 200 L196 158 C194 144 184 134 168 134 Z ' +
      'M232 134 C242 140 246 168 242 196 C240 214 230 226 218 226 C210 226 206 216 204 200 L204 158 C206 144 216 134 232 134 Z ' +
      'M196 178 C190 172 184 178 187 188 C190 198 196 206 200 210 C204 206 210 198 213 188 C216 178 210 172 204 178 C202 174 198 174 196 178 Z',
    viewBoxBounds: { x: 148, y: 128, w: 104, h: 104 },
    cx: 200, cy: 178,
    symptom_hooks: ['ضيق التنفس', 'خفقان غير منتظم', 'ألم في الصدر'],
    medical_context: 'المركز الرئيسي لتبادل الأكسجين والمضخة المركزية للدورة الدموية.',
    linkedCTA: 'ai_analysis',
    categoryName: 'بيت القلب',
    categoryColor: '#FF6B6B',
    categoryIcon: '❤️',
    emotion: 'الحزن والجرح القديم',
    description: 'كبت المشاعر، أو الشعور بعدم استحقاق الحب.',
    deeperCause: 'إغلاق القلب لحماية النفس من الألم.',
    treatment: ['التنفس العميق', 'العطاء والصدقة', 'احتضان من تحب'],
    affirmation: 'قلبي مفتوح لاستقبال الحب، وأنا أستحق السعادة.'
  },
  {
    id: 'liver',
    name: 'الكبد',
    label_en: 'Hepatic System',
    anatomical_group: 'Gastroenterology',
    body_side: 'front',
    view: 'front',
    region_type: 'organ',
    path_d: 'M160 228 C155 234 156 248 164 254 C172 260 190 262 202 258 C210 254 214 246 212 238 C210 232 200 226 186 225 C172 224 164 225 160 228 Z',
    viewBoxBounds: { x: 150, y: 220, w: 68, h: 42 },
    cx: 184, cy: 242,
    symptom_hooks: ['إرهاق مزمن', 'اضطراب هضمي', 'اصفرار وشحوب'],
    medical_context: 'العضو الأكبر لتنقية الدم ومعالجة العناصر الغذائية والسموم.',
    linkedCTA: 'assessment',
    categoryName: 'مصنع المشاعر',
    categoryColor: '#D4AF37',
    categoryIcon: '🧪',
    emotion: 'الغضب المكبوت',
    description: 'تراكم مشاعر الغضب والاستياء وعدم الرضا.',
    deeperCause: 'الشعور بالظلم أو الانتقاد الدائم للذات والآخرين.',
    treatment: ['التخلص من السموم (ديتوكس)', 'التعبير الصحي عن الغضب', 'المسامحة'],
    affirmation: 'أنا أحرر كل الغضب القديم، وأملأ كياني بالسلام والرضا.'
  },
  {
    id: 'stomach',
    name: 'المعدة',
    label_en: 'Gastric & Intestinal System',
    anatomical_group: 'Gastroenterology',
    body_side: 'front',
    view: 'front',
    region_type: 'organ',
    path_d:
      'M208 236 C198 233 192 242 194 254 C196 266 208 276 220 278 C232 280 242 272 244 260 C246 248 238 238 226 236 C218 234 212 234 208 236 Z ' +
      'M162 272 C172 264 228 264 238 272 C248 290 242 318 200 322 C158 318 152 290 162 272 Z',
    viewBoxBounds: { x: 150, y: 228, w: 100, h: 98 },
    cx: 200, cy: 275,
    symptom_hooks: ['قولون عصبي', 'حموضة', 'غثيان', 'تشنج معدي'],
    medical_context: 'المحطة للهضم الكيميائي والتفكيك ومسؤولة عن المناعة المعوية.',
    linkedCTA: 'ai_analysis',
    categoryName: 'هضم الأحداث',
    categoryColor: '#FFD93D',
    categoryIcon: '🥣',
    emotion: 'القلق من الجديد',
    description: 'عدم القدرة على "هضم" موقف جديد أو شخص معين.',
    deeperCause: 'الخوف من المستقبل والتمسك بالمألوف.',
    treatment: ['شرب النعناع أو البابونج', 'تقبل التغيير', 'التنفس البطني'],
    affirmation: 'أنا أهضم تجارب الحياة بسهولة، وكل جديد هو خير لي.'
  },

  /* ═════════════════════════════════════════════
     BACK VIEW
     ═════════════════════════════════════════════ */
  {
    id: 'shoulders_back',
    name: 'أعلى الظهر',
    label_en: 'Upper Musculature',
    anatomical_group: 'Musculoskeletal',
    body_side: 'back',
    view: 'back',
    region_type: 'surface',
    path_d: 'M150 122 C162 114 185 110 200 112 C215 110 238 114 250 122 C262 134 258 155 248 168 C236 178 218 184 200 184 C182 184 164 178 152 168 C142 155 138 134 150 122 Z',
    viewBoxBounds: { x: 134, y: 108, w: 132, h: 80 },
    cx: 200, cy: 148,
    symptom_hooks: ['عقد عضلية', 'تصلب رقبي', 'آلام إجهادية'],
    medical_context: 'تضم عضلات شبه المنحرف وهي الأكثر عرضة لتخزين التوتر الميكانيكي.',
    linkedCTA: 'booking',
    categoryName: 'حمل الأعباء',
    categoryColor: '#FFD93D',
    categoryIcon: '🎒',
    emotion: 'أعباء الحياة الثقيلة',
    description: 'الشعور بأنك تحمل مشاكل العائلة أو العمل وحدك.',
    deeperCause: 'اعتقادك أن "لا أحد يستطيع فعل ذلك غيري".',
    treatment: ['تفويض المسؤوليات', 'مساج الأكتاف', 'تعلم طلب المساعدة'],
    affirmation: 'أنا أسمح للآخرين بتحمل مسؤولياتهم، وأتحرر من الثقل.'
  },
  {
    id: 'upper_back',
    name: 'منتصف الظهر',
    label_en: 'Thoracic Back',
    anatomical_group: 'Musculoskeletal',
    body_side: 'back',
    view: 'back',
    region_type: 'surface',
    path_d: 'M152 185 C168 178 185 175 200 175 C215 175 232 178 248 185 L248 260 C232 264 215 266 200 266 C185 266 168 264 152 260 Z',
    viewBoxBounds: { x: 148, y: 172, w: 104, h: 98 },
    cx: 200, cy: 220,
    symptom_hooks: ['ألم بين الكتفين', 'تشنج صدري خلفي', 'ضيق التنفس الخلفي'],
    medical_context: 'المنطقة الصدرية الخلفية — تضم فقرات T1-T12 وعضلات التنفس.',
    linkedCTA: 'assessment',
    categoryName: 'الدعم العاطفي',
    categoryColor: '#818CF8',
    categoryIcon: '🫂',
    emotion: 'فقدان الدعم العاطفي',
    description: 'الشعور بالعزلة وعدم وجود من يسندك عاطفياً.',
    deeperCause: 'صعوبة التعبير عن الحاجة للدعم.',
    treatment: ['التواصل الصادق', 'العناق', 'بناء شبكة دعم'],
    affirmation: 'أنا محاط بالدعم والحب من كل الاتجاهات.'
  },
  {
    id: 'spine',
    name: 'العمود الفقري',
    label_en: 'Spinal / Nervous Axis',
    anatomical_group: 'Musculoskeletal / Neuro',
    body_side: 'back',
    view: 'back',
    region_type: 'system',
    path_d: 'M196 106 C194 110 194 120 194 135 L194 325 C194 330 196 332 200 332 C204 332 206 330 206 325 L206 135 C206 120 206 110 204 106 C202 104 198 104 196 106 Z',
    viewBoxBounds: { x: 190, y: 100, w: 20, h: 236 },
    cx: 200, cy: 218,
    symptom_hooks: ['ألم الظهر المركزي', 'انضغاط عصبي', 'تنميل'],
    medical_context: 'الحامي الرئيسي للحبل الشوكي والمحور الهيكلي المركزي.',
    linkedCTA: 'ai_analysis',
    categoryName: 'عمود الدعم',
    categoryColor: '#2D9B83',
    categoryIcon: '🦴',
    emotion: 'الدعم والسند',
    description: 'الشعور بعدم وجود دعم كافٍ في الحياة.',
    deeperCause: 'الاعتماد الكلي على الذات ورفض الدعم الخارجي.',
    treatment: ['اليوجا (وضعية الشجرة)', 'الثقة في دعم الحياة', 'بناء شبكة دعم'],
    affirmation: 'أنا مدعوم دائماً من الله ومن الكون ومن حولي.'
  },
  {
    id: 'kidneys',
    name: 'الكلى',
    label_en: 'Renal & Adrenal System',
    anatomical_group: 'Urology / Endocrine',
    body_side: 'back',
    view: 'back',
    region_type: 'organ',
    path_d:
      'M162 240 C152 244 150 262 158 270 C166 276 176 270 176 258 C176 250 170 242 162 240 Z ' +
      'M238 240 C248 244 250 262 242 270 C234 276 224 270 224 258 C224 250 230 242 238 240 Z',
    viewBoxBounds: { x: 146, y: 236, w: 108, h: 44 },
    cx: 200, cy: 256,
    symptom_hooks: ['احتباس سوائل', 'إرهاق كظري', 'أملاح', 'ألم في الخاصرة'],
    medical_context: 'المسؤول عن فلترة الدم الكلية وإدارة ضغط الدم.',
    linkedCTA: 'assessment',
    categoryName: 'العلاقات والمخاوف',
    categoryColor: '#6C5CE7',
    categoryIcon: '💧',
    emotion: 'الخوف وخيبة الأمل',
    description: 'مخاوف عميقة، غالباً مرتبطة بالعلاقات أو النقد.',
    deeperCause: 'الشعور بالطفولة (الخوف كالطفل) وعدم الأمان.',
    treatment: ['شرب الماء بوعي', 'مواجهة المخاوف', 'تعزيز الثقة بالنفس'],
    affirmation: 'أنا آمن، والحكمة الإلهية ترعاني في كل لحظة.'
  },
  {
    id: 'lower_back',
    name: 'أسفل الظهر',
    label_en: 'Lumbosacral Belt',
    anatomical_group: 'Musculoskeletal',
    body_side: 'back',
    view: 'back',
    region_type: 'surface',
    path_d: 'M156 274 C162 266 238 266 244 274 C256 294 248 324 200 330 C152 324 144 294 156 274 Z',
    viewBoxBounds: { x: 140, y: 262, w: 120, h: 72 },
    cx: 200, cy: 298,
    symptom_hooks: ['ديسك/عرق نسا', 'تشنج قطني شديد', 'ألم أسفل الظهر'],
    medical_context: 'المنطقة الحاملة للجزء الأكبر من وزن الجسم العلوي والضغط الحركي.',
    linkedCTA: 'booking',
    categoryName: 'الدعم المادي',
    categoryColor: '#A8E6CF',
    categoryIcon: '💰',
    emotion: 'الخوف المالي',
    description: 'قلق بشأن المال، العمل، أو المستقبل المادي.',
    deeperCause: 'الشعور بعدم الأمان المادي أو فقدان الدعم.',
    treatment: ['التخطيط المالي', 'التوكيدات للوفرة', 'الإيمان بالرزق'],
    affirmation: 'أثق أن رزقي مضمون، والكون يدعمني بوفرة.'
  }
];
