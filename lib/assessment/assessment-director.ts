import { PATHWAYS } from '@/components/health-engine/constants';
import type {
  AssessmentConfidenceReadiness,
  AssessmentFlowSnapshot,
  EngineAnswers,
  StepId,
} from '@/components/health-engine/types';
import { buildAdaptiveQuestionPlan } from '@/lib/health-engine/adaptive-question-orchestrator';

export const GENERAL_UNCERTAIN_PATHWAY_ID = 'general_uncertain';

export type AssessmentDirectorState = {
  currentStage: string;
  stageTitle: string;
  stageMeaning: string;
  visibleReason: string;
  nextActionLabel: string;
  shouldShowDeepQuestions: boolean;
  shouldShowNutritionLayer: boolean;
  shouldShowEmotionalLayer: boolean;
  shouldMinimizeBurden: boolean;
  missingImportantData: string[];
  userProgressMeaning: string;
  flowSnapshot: AssessmentFlowSnapshot;
  answerThatChangedPath?: string;
  keyAnsweredSignals: string[];
  skippedSections: string[];
  tayyibatMode: 'none' | 'educational_only' | 'beginner' | 'pattern_followup';
};

export type AssessmentReviewSnapshot = NonNullable<EngineAnswers['assessmentReviewSnapshot']>;

const STAGE_COPY: Record<StepId, Pick<AssessmentDirectorState, 'currentStage' | 'stageTitle' | 'stageMeaning' | 'visibleReason' | 'nextActionLabel'>> = {
  welcome: {
    currentStage: 'الدخول',
    stageTitle: 'ابدأ خريطة حالتك',
    stageMeaning: 'نهيّئ الرحلة كخريطة رعاية لا كنموذج أسئلة عادي.',
    visibleReason: 'سنرتّب الأسئلة من الأهم إلى الأوضح حتى لا تبدو عشوائية.',
    nextActionLabel: 'ابدأ التقييم',
  },
  personalHistory: {
    currentStage: 'معلومات عنك',
    stageTitle: 'قبل الأعراض… نحتاج نعرف عنك شوي',
    stageMeaning: 'هذه معلومات بسيطة تساعدنا نفهم حالتك بدون ما نثقل عليك.',
    visibleReason: 'العمر، الأمراض المزمنة، الأدوية والحساسية قد تغيّر معنى نفس العرض، لذلك نسأل عنها أولاً وباختصار.',
    nextActionLabel: 'التالي — الشكوى الرئيسية',
  },
  chiefComplaint: {
    currentStage: 'الشكوى الرئيسية',
    stageTitle: 'إيش أكثر شيء يضايقك الآن؟',
    stageMeaning: 'نحدد العرض الأساسي أو الجهاز الأقرب، وبعدها نضيّق الأسئلة.',
    visibleReason: 'اختيار الشكوى يساعدنا نعرض أسئلة مناسبة بدل ما نسألك كل شيء مرة واحدة.',
    nextActionLabel: 'التالي — تفاصيل العرض',
  },
  hopi: {
    currentStage: 'تفاصيل العرض',
    stageTitle: 'خلّينا نفهم العرض أكثر',
    stageMeaning: 'نسأل عن بداية العرض، شدته، مدته، وإيش يزيده أو يخففه.',
    visibleReason: 'هذه التفاصيل هي قلب القصة الطبية، ونستخدمها لاحقاً في ملخص حالتك.',
    nextActionLabel: 'التالي — أسئلة الأولوية',
  },
  relatedSymptoms: {
    currentStage: 'أعراض مرافقة',
    stageTitle: 'هل معه شيء ثاني؟',
    stageMeaning: 'الأعراض المرافقة تساعدنا نربط الصورة بدون تهويل.',
    visibleReason: 'بعض الأعراض المصاحبة تغيّر اتجاه القراءة أو تجعلها أوضح.',
    nextActionLabel: 'التالي — أشياء ممكن تزيد الحالة',
  },
  lifestyle: {
    currentStage: 'أشياء ممكن تزيد الحالة',
    stageTitle: 'الأكل والنوم والروتين',
    stageMeaning: 'نقرأ العوامل اللي ممكن تزيد أو تخفف العرض.',
    visibleReason: 'النوم، الضغط، الأكل، الكافيين، الماء والحركة قد تغيّر شدة العرض أو توقيته.',
    nextActionLabel: 'التالي',
  },
  pathway: {
    currentStage: 'نحدد العرض',
    stageTitle: 'ما أقرب وصف لما تشعر به؟',
    stageMeaning: 'نختار نقطة بداية، ثم نراجعها مع إجاباتك التالية.',
    visibleReason: 'المسار الأقرب يحدد أسئلة الشدة والنمط التي ستظهر بعده.',
    nextActionLabel: 'التالي — قراءة الإشارات',
  },
  redflags: {
    currentStage: 'نحدد الأولوية',
    stageTitle: 'أسئلة أولوية',
    stageMeaning: 'نبدأ من الإشارات التي تغيّر ترتيب التعامل.',
    visibleReason: 'هذه الإجابات تجعل الخطة تضع السلامة قبل التفاصيل عند الحاجة.',
    nextActionLabel: 'التالي — فهم الشدة والمدة',
  },
  clinical: {
    currentStage: 'نقرأ النمط',
    stageTitle: 'نفهم الشدة والمدة والتفاصيل',
    stageMeaning: 'هنا نضيّق الاحتمالات: متى يزيد العرض، وما الذي يخففه، وهل يتكرر.',
    visibleReason: 'إجاباتك هنا تحدد هل نحتاج أسئلة أعمق أو طبقة الغذاء والإيقاع.',
    nextActionLabel: 'التالي — السياق المؤثر',
  },
  emotional: {
    currentStage: 'نضيف السياق',
    stageTitle: 'السياق المؤثر',
    stageMeaning: 'نقرأ الضغط أو الكبت كعامل قد يغيّر شدة الأعراض، لا كحكم على الحالة.',
    visibleReason: 'وجود ضغط واضح يساعدنا نفرّق بين عرض مستقل وعرض يتأثر بالسياق.',
    nextActionLabel: 'التالي',
  },
  nutrition: {
    currentStage: 'الغذاء والإيقاع',
    stageTitle: 'الغذاء والإيقاع ضمن تقييمك',
    stageMeaning: 'نسأل فقط بالقدر الذي يساعدنا نفهم علاقة الأكل والتوقيت بالأعراض.',
    visibleReason: 'ظهرت هذه الطبقة لأن إجاباتك تحمل إشارة غذاء أو نوم أو إيقاع.',
    nextActionLabel: 'إنهاء الغذاء والإيقاع',
  },
  review: {
    currentStage: 'نبني الخريطة',
    stageTitle: 'قبل أن نبني الخريطة',
    stageMeaning: 'نراجع ما جمعناه حتى تشعر أن النتيجة مبنية على إجاباتك.',
    visibleReason: 'هذه المراجعة تمنحك فرصة تعديل المسار أو البيانات قبل التحليل.',
    nextActionLabel: 'متابعة التحليل',
  },
  analyzing: {
    currentStage: 'نربط الإشارات',
    stageTitle: 'نربط الإجابات ونبني خريطة الحالة',
    stageMeaning: 'نحوّل الإجابات إلى قراءة أولية وخطوة عملية.',
    visibleReason: 'التحليل يراجع الشدة، المدة، السياق، والغذاء عند وجوده.',
    nextActionLabel: 'خريطة حالتك جاهزة',
  },
  result: {
    currentStage: 'خريطة الحالة',
    stageTitle: 'ما فهمناه، لماذا ظهر، ماذا تفعل الآن',
    stageMeaning: 'النتيجة خريطة أولية قابلة للمتابعة وليست حكماً نهائياً.',
    visibleReason: 'نستخدم ما جمعناه لشرح القراءة والبيانات التي ترفع دقتها.',
    nextActionLabel: 'ابدأ خطتي',
  },
};

function hasAnswer(value: unknown): boolean {
  return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== '';
}

function hasUncertainAnswer(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasUncertainAnswer);
  if (typeof value !== 'string') return false;
  return value === 'not_sure'
    || value === 'unknown'
    || value.includes('لا أعرف')
    || value.includes('لست متأكد')
    || value.includes('غير واضح');
}

function flattenAnswerText(answers: EngineAnswers): string {
  const clinical = Object.values(answers.clinicalAnswers).flat().join(' ');
  const emotional = [...answers.emotionalContext, answers.emotionalNote].join(' ');
  const personal = [
    answers.personalHistory?.sex,
    answers.personalHistory?.pregnant,
    ...(answers.personalHistory?.chronicConditions ?? []),
    answers.personalHistory?.medicationUse,
    answers.personalHistory?.allergies,
    ...(answers.personalHistory?.familyHistory ?? []),
  ].filter(Boolean).join(' ');
  const complaint = [
    answers.chiefComplaint?.systemLabel,
    answers.chiefComplaint?.complaintLabel,
    ...(answers.chiefComplaint?.secondaryComplaints ?? []),
  ].filter(Boolean).join(' ');
  const hopi = [
    answers.hopi?.onset,
    answers.hopi?.course,
    answers.hopi?.location,
    answers.hopi?.character,
    answers.hopi?.radiation,
    answers.hopi?.functionalImpact,
    ...(answers.hopi?.aggravating ?? []),
    ...(answers.hopi?.relieving ?? []),
    ...(answers.hopi?.associated ?? []),
  ].filter(Boolean).join(' ');
  const related = (answers.relatedSymptoms ?? []).join(' ');
  const lifestyle = Object.values(answers.lifestyleContext ?? {}).flat().join(' ');
  const nutrition = [
    ...Object.values(answers.nutritionAnswers?.gateAnswers ?? {}),
    ...Object.values(answers.nutritionAnswers?.deepAnswers ?? {}),
  ].join(' ');
  return `${answers.pathwayId} ${answers.duration} ${personal} ${complaint} ${hopi} ${related} ${lifestyle} ${clinical} ${emotional} ${nutrition}`;
}

function userWasUnsureOfPathway(answers: EngineAnswers): boolean {
  return answers.pathwayId === GENERAL_UNCERTAIN_PATHWAY_ID
    || answers.chiefComplaint?.complaint === 'not_sure'
    || answers.clinicalAnswers.assessment_pathway_uncertain === 'yes';
}

function nutritionMode(answers: EngineAnswers): AssessmentDirectorState['tayyibatMode'] {
  const tayKnow = answers.nutritionAnswers?.gateAnswers?.tay_know;
  const mode = answers.nutritionAnswers?.deepAnswers?.tay_mode;
  if (!tayKnow) return 'none';
  if (tayKnow === 'dont_know') return 'educational_only';
  if (tayKnow === 'know_not_following') return 'beginner';
  if (mode === 'known_system_followup' || tayKnow === 'yes_partial' || tayKnow === 'yes_following') return 'pattern_followup';
  return 'none';
}

function hasFoodSignal(text: string, pathwayId: string): boolean {
  return pathwayId === 'digestion'
    || text.includes('الأكل')
    || text.includes('أكل')
    || text.includes('وجبة')
    || text.includes('انتفاخ')
    || text.includes('حموضة')
    || text.includes('رغبة سكر')
    || text.includes('أكل')
    || text.includes('وجبة')
    || text.includes('سكر')
    || text.includes('انتفاخ')
    || text.includes('حموضة')
    || text.includes('after_meals')
    || text.includes('post_meal')
    || text.includes('meal');
}

function hasSleepSignal(text: string, pathwayId: string): boolean {
  return pathwayId === 'sleep'
    || text.includes('نوم')
    || text.includes('أرق')
    || text.includes('أصحى تعبان')
    || text.includes('متأخر')
    || text.includes('نوم')
    || text.includes('أرق')
    || text.includes('استيقاظ')
    || text.includes('sleep')
    || text.includes('caffeine');
}

function hasStressSignal(text: string, pathwayId: string, answers: EngineAnswers): boolean {
  return pathwayId === 'anxiety'
    || answers.emotionalContext.some(item => item !== 'none')
    || text.includes('ضغط')
    || text.includes('توتر')
    || text.includes('قلق')
    || text.includes('تفكير')
    || text.includes('إرهاق نفسي')
    || text.includes('ضغط')
    || text.includes('توتر')
    || text.includes('قلق')
    || text.includes('كبت')
    || text.includes('stress')
    || text.includes('anxiety');
}

function readinessFor(missing: string[], answeredCore: number, hasPathway: boolean): AssessmentConfidenceReadiness {
  if (!hasPathway || answeredCore === 0 || missing.length >= 3) return 'weak';
  if (missing.length > 0) return 'preliminary';
  return 'enough';
}

function buildQuestionImpactMap(pathwayId: string, questionIds: string[]): Record<string, string> {
  const map: Record<string, string> = {
    severity: 'الشدة تغيّر أولوية المتابعة وتحدد إن كنا نختصر الأسئلة أو نفتح أسئلة أعمق.',
    duration: 'المدة تساعدنا نميّز بين حدث عابر ونمط يحتاج متابعة.',
    redFlags: 'إشارات الأولوية تجعل السلامة تسبق أي خطة منزلية.',
    emotionalContext: 'السياق المؤثر يساعدنا نفهم هل الضغط يزيد الشدة دون أن نلصق العرض بالنفس.',
    nutritionGate: 'إجابتك تحدد هل نعرض طبقة تعريفية فقط أم نسأل عن نمط الغذاء والإيقاع.',
  };

  questionIds.forEach(id => {
    if (id.includes('trigger') || id.includes('pattern') || id.includes('general_pattern')) {
      map[id] = 'هذه الإجابة تكشف ما الذي يغيّر توقيت الأعراض أو شدتها.';
      return;
    }
    if (id.includes('progression')) {
      map[id] = 'تطور الأعراض يحدد هل نكتفي بقراءة أولية أم نرفع أولوية المتابعة.';
      return;
    }
    if (pathwayId === GENERAL_UNCERTAIN_PATHWAY_ID) {
      map[id] = 'هذه الإجابة تساعدنا نحول المسار العام إلى اتجاه أوضح داخل خريطة الحالة.';
      return;
    }
    map[id] = 'إجابتك هنا تغير وزن هذه الإشارة داخل خريطة الحالة.';
  });

  return map;
}

function uniqueTriggers(triggers: AssessmentFlowSnapshot['adaptiveTriggers']): AssessmentFlowSnapshot['adaptiveTriggers'] {
  const seen = new Set<string>();
  return triggers.filter(item => {
    const key = `${item.trigger}|${item.caused}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getAssessmentDirectorState(answers: EngineAnswers, step: StepId): AssessmentDirectorState {
  const pathway = PATHWAYS.find(p => p.id === answers.pathwayId);
  const pathwayId = answers.pathwayId || '';
  const plan = buildAdaptiveQuestionPlan({
    pathwayId,
    severity: answers.severity,
    duration: answers.duration,
    existingAnswers: answers.clinicalAnswers,
    clinicalAnswers: answers.clinicalAnswers,
    hasRedFlagSignal: answers.hasEmergencyFlag || answers.redFlags.length > 0,
  });

  const text = flattenAnswerText(answers);
  const foodSignal = hasFoodSignal(text, pathwayId) || plan.snapshot.foodSignalFound;
  const sleepSignal = hasSleepSignal(text, pathwayId);
  const stressSignal = hasStressSignal(text, pathwayId, answers);
  const safetyPrioritized = answers.hasEmergencyFlag || answers.redFlags.length > 0 || plan.snapshot.safetyPrioritized;
  const shouldMinimizeBurden = safetyPrioritized || plan.snapshot.burdenMinimized;
  const shouldShowNutritionLayer = !safetyPrioritized && Boolean(plan.snapshot.nutritionShown || (foodSignal && !shouldMinimizeBurden) || answers.nutritionAnswers);
  const shouldShowDeepQuestions = !shouldMinimizeBurden && plan.snapshot.deepIntakeShown;
  const shouldShowEmotionalLayer = !safetyPrioritized && (!shouldMinimizeBurden || stressSignal || answers.emotionalContext.some(item => item !== 'none'));

  const coreQuestions = pathway?.clinicalQuestions ?? [];
  const answeredCore = coreQuestions.filter(q => hasAnswer(answers.clinicalAnswers[q.id])).length;
  const uncertainAnswerCount = [
    answers.duration,
    ...Object.values(answers.clinicalAnswers),
  ].filter(hasUncertainAnswer).length;
  const missingImportantData: string[] = [];
  if (!answers.chiefComplaint?.complaint) missingImportantData.push('الشكوى الرئيسية');
  if (!answers.hopi?.onset && (!answers.duration || answers.duration === 'unknown')) missingImportantData.push('متى بدأ العرض');
  if (typeof answers.hopi?.severity !== 'number' && !answers.severity) missingImportantData.push('شدة العرض');
  if (!answers.pathwayId) missingImportantData.push('المسار الأقرب');
  if (!answers.duration || answers.duration === 'unknown') missingImportantData.push('مدة الأعراض');
  if (answeredCore < Math.min(2, coreQuestions.length)) missingImportantData.push('إجابتان أساسيتان من قراءة الإشارات');
  if (foodSignal && shouldShowNutritionLayer && !answers.nutritionAnswers) missingImportantData.push('علاقة الغذاء أو الإيقاع بالأعراض');
  if (userWasUnsureOfPathway(answers) && answeredCore < 2) missingImportantData.push('تحديد أوضح للمسار العام');
  if (uncertainAnswerCount > 0) missingImportantData.push('توضيح الإجابات غير المؤكدة');

  const confidenceReadiness = readinessFor(missingImportantData, answeredCore, Boolean(answers.pathwayId));
  const unsure = userWasUnsureOfPathway(answers);
  const pathwayLabel = unsure
    ? 'لست متأكدًا — سنبدأ من الأعراض العامة'
    : pathway?.label ?? 'غير محدد';

  const keyAnsweredSignals = [
    answers.chiefComplaint?.complaintLabel ? `الشكوى: ${answers.chiefComplaint.complaintLabel}` : '',
    answers.personalHistory?.chronicConditions?.length ? `أمراض مزمنة: ${answers.personalHistory.chronicConditions.length}` : '',
    answers.hopi?.onset ? `بداية العرض: ${answers.hopi.onset}` : '',
    answers.hopi?.course ? `مسار العرض: ${answers.hopi.course}` : '',
    answers.relatedSymptoms?.length ? `أعراض مرافقة: ${answers.relatedSymptoms.length}` : '',
    answers.lifestyleContext ? `روتين مؤثر: ${Object.values(answers.lifestyleContext).filter(Boolean).length}` : '',
    answers.pathwayId ? `المسار: ${pathwayLabel}` : '',
    unsure ? 'بدأنا بمسار عام لأنك لم تكن متأكدًا من التصنيف' : '',
    answers.severity ? `الشدة: ${answers.severity}/10` : '',
    answers.duration ? `المدة: ${answers.duration}` : '',
    uncertainAnswerCount > 0 ? `إجابات غير مؤكدة: ${uncertainAnswerCount}` : '',
    answers.redFlags.length > 0 ? `علامات أولوية: ${answers.redFlags.length}` : 'لا توجد علامات أولوية محددة',
    answeredCore > 0 ? `إجابات النمط: ${answeredCore}` : '',
    stressSignal ? 'السياق المؤثر له معنى في القراءة' : '',
    shouldShowNutritionLayer ? 'الغذاء والإيقاع ظهرا بسبب إشارات في الإجابات' : '',
  ].filter(Boolean);

  const skippedStages: AssessmentFlowSnapshot['skippedStages'] = [];
  if (!shouldShowNutritionLayer) {
    skippedStages.push({
      stage: 'الغذاء والإيقاع',
      reason: safetyPrioritized
        ? 'اختصرناها لأن السلامة لها أولوية الآن.'
        : 'لم تظهر إشارة غذاء أو إيقاع كافية، فبقيت اختيارية/خفيفة.',
    });
  }
  if (!shouldShowDeepQuestions) {
    skippedStages.push({
      stage: 'أسئلة التعميق',
      reason: shouldMinimizeBurden
        ? 'اختصرنا التعميق لتقليل العبء.'
        : 'الإجابات الحالية تكفي لبناء قراءة أولية.',
    });
  }
  if (!shouldShowEmotionalLayer) {
    skippedStages.push({
      stage: 'السياق المؤثر',
      reason: 'خففنا هذه الطبقة لأن الأولوية أوضح الآن.',
    });
  }

  const adaptiveTriggers = uniqueTriggers([
    unsure ? { trigger: 'عدم التأكد من المسار', caused: 'بدء تقييم عام للأعراض بدل اختيار مسار ضيق.' } : null,
    foodSignal && shouldShowNutritionLayer ? { trigger: 'إشارة غذاء أو هضم أو هبوط بعد الأكل', caused: 'ظهور أسئلة الغذاء والإيقاع.' } : null,
    sleepSignal ? { trigger: 'نوم أو إيقاع مضطرب', caused: 'ربط القراءة بطبقة الإيقاع عند الحاجة.' } : null,
    stressSignal ? { trigger: 'ضغط أو توتر أو قلق', caused: 'إظهار السياق المؤثر بلغة غير اتهامية.' } : null,
    missingImportantData.length > 0 ? { trigger: 'بيانات قليلة أو غير مكتملة', caused: 'موثوقية القراءة ستظهر كمبدئية أو ضعيفة.' } : null,
    uncertainAnswerCount > 0 ? { trigger: 'إجابة غير مؤكدة', caused: 'سنحفظها كنقطة تحتاج توضيحًا لاحقًا لا كخطأ.' } : null,
    safetyPrioritized ? { trigger: 'علامة أولوية', caused: 'تقليل العبء وتقديم السلامة في النتيجة.' } : null,
  ].filter((item): item is AssessmentFlowSnapshot['adaptiveTriggers'][number] => Boolean(item)));

  const visibleStages = [
    'معلومات عنك',
    'الشكوى الرئيسية',
    'تفاصيل العرض',
    'أسئلة الأولوية',
    'أعراض مرافقة',
    'أشياء ممكن تزيد الحالة',
    shouldShowEmotionalLayer ? 'السياق المؤثر' : '',
    shouldShowNutritionLayer ? 'الأكل والنوم والروتين' : '',
    'مراجعة قبل التحليل',
    'بناء ملخص حالتك',
  ].filter(Boolean);

  const flowSnapshot: AssessmentFlowSnapshot = {
    visibleStages,
    skippedStages,
    adaptiveTriggers,
    questionImpactMap: buildQuestionImpactMap(pathwayId, coreQuestions.map(q => q.id)),
    missingImportantData,
    confidenceReadiness,
    userWasUnsureOfPathway: unsure,
  };

  const state = STAGE_COPY[step];
  return {
    ...state,
    shouldShowDeepQuestions,
    shouldShowNutritionLayer,
    shouldShowEmotionalLayer,
    shouldMinimizeBurden,
    missingImportantData,
    userProgressMeaning: confidenceReadiness === 'enough'
      ? 'بياناتك كافية لبناء قراءة مفيدة.'
      : confidenceReadiness === 'preliminary'
        ? 'القراءة ستكون أولية، ويمكن رفع دقتها لاحقًا بإضافة بيانات أكثر.'
        : 'القراءة ستكون ضعيفة نسبيًا لأن بيانات مهمة ما زالت ناقصة.',
    flowSnapshot,
    answerThatChangedPath: adaptiveTriggers[0]?.trigger ?? plan.reasons[0],
    keyAnsweredSignals,
    skippedSections: skippedStages.map(item => item.stage),
    tayyibatMode: nutritionMode(answers),
  };
}

export function buildAssessmentReviewSnapshot(answers: EngineAnswers): AssessmentReviewSnapshot {
  const state = getAssessmentDirectorState(answers, 'review');
  const pathway = PATHWAYS.find(p => p.id === answers.pathwayId);
  const pathwayLabel = state.flowSnapshot.userWasUnsureOfPathway
    ? 'لست متأكدًا — سنبدأ من الأعراض العامة'
    : pathway?.label ?? 'غير محدد';

  return {
    pathwayLabel,
    keyAnsweredSignals: state.keyAnsweredSignals,
    adaptiveReasonsShown: state.flowSnapshot.adaptiveTriggers.map(item => `${item.trigger}: ${item.caused}`),
    skippedSections: state.skippedSections,
    unknowns: state.missingImportantData,
    tayyibatMode: state.tayyibatMode,
    chiefComplaintLabel: answers.chiefComplaint?.complaintLabel,
    hopiSummary: [
      answers.hopi?.onset ? `بدأ: ${answers.hopi.onset}` : '',
      answers.hopi?.course ? `مساره: ${answers.hopi.course}` : '',
      typeof answers.hopi?.severity === 'number' ? `الشدة: ${answers.hopi.severity}/10` : '',
      answers.hopi?.functionalImpact ? `تأثيره على اليوم: ${answers.hopi.functionalImpact}` : '',
      answers.hopi?.aggravating?.length ? `يزيده: ${answers.hopi.aggravating.slice(0, 3).join('، ')}` : '',
      answers.hopi?.relieving?.length ? `يخففه: ${answers.hopi.relieving.slice(0, 3).join('، ')}` : '',
    ].filter(Boolean),
    personalHistorySignals: [
      answers.personalHistory?.age ? `العمر: ${answers.personalHistory.age}` : '',
      answers.personalHistory?.sex ? `الجنس: ${answers.personalHistory.sex}` : '',
      answers.personalHistory?.pregnant && answers.personalHistory.pregnant !== 'not_applicable' ? `الحمل: ${answers.personalHistory.pregnant}` : '',
      answers.personalHistory?.chronicConditions?.length ? `أمراض مزمنة: ${answers.personalHistory.chronicConditions.join('، ')}` : '',
      answers.personalHistory?.medicationUse ? `أدوية مستمرة: ${answers.personalHistory.medicationUse}` : '',
      answers.personalHistory?.allergies ? 'حساسية مذكورة' : '',
    ].filter(Boolean),
    relatedSymptoms: answers.relatedSymptoms ?? [],
    lifestyleSignals: Object.entries(answers.lifestyleContext ?? {})
      .filter(([, value]) => Array.isArray(value) ? value.length > 0 : Boolean(value))
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join('، ') : value}`),
    confidenceReadiness: state.flowSnapshot.confidenceReadiness,
    userWasUnsureOfPathway: state.flowSnapshot.userWasUnsureOfPathway,
    flowSnapshot: state.flowSnapshot,
    reviewedAt: new Date().toISOString(),
  };
}
