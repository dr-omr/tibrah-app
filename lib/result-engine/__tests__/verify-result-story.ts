import { DEFAULT_ANSWERS, computeTriage } from '@/components/health-engine/constants';
import type { EngineAnswers, ResultViewModel } from '@/components/health-engine/types';
import { GENERAL_UNCERTAIN_PATHWAY_ID } from '@/lib/assessment/assessment-director';
import { computeRouting } from '@/lib/domain-scoring-engine';
import { buildResultViewModel } from '@/lib/result-engine/build-result-view-model';

function cloneAnswers(overrides: Partial<EngineAnswers> = {}): EngineAnswers {
  return {
    ...(JSON.parse(JSON.stringify(DEFAULT_ANSWERS)) as EngineAnswers),
    ...overrides,
    clinicalAnswers: {
      ...DEFAULT_ANSWERS.clinicalAnswers,
      ...(overrides.clinicalAnswers ?? {}),
    },
  };
}

function buildVm(answers: EngineAnswers): ResultViewModel {
  const triage = computeTriage(answers);
  const routing = computeRouting(answers, triage);
  return buildResultViewModel(answers, triage, routing);
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function run() {
  const stable = cloneAnswers({
    pathwayId: 'digestion',
    severity: 5,
    duration: 'days',
    chiefComplaint: {
      system: 'digestive',
      systemLabel: 'الجهاز الهضمي',
      complaint: 'bloating_gas',
      complaintLabel: 'انتفاخ وغازات',
      secondaryComplaints: ['حموضة'],
    },
    hopi: {
      onset: 'days',
      course: 'يروح ويجي',
      severity: 5,
      location: 'البطن',
      character: 'مغص',
      radiation: 'لا',
      aggravating: ['الأكل'],
      relieving: ['الراحة'],
      associated: ['غازات'],
      functionalImpact: 'متوسط',
    },
    relatedSymptoms: ['غازات', 'حموضة'],
    clinicalAnswers: {
      chief_complaint: 'انتفاخ وغازات',
      hopi_aggravating: ['الأكل'],
    },
  });
  const stableStory = buildVm(stable).resultStory;
  assert(stableStory, 'Stable case must expose resultStory.');
  assert(stableStory.primaryStorySentence.includes('انتفاخ وغازات'), 'Primary story must use chief complaint.');
  assert(stableStory.topSignals.some(signal => signal.source === 'chief_complaint'), 'Top signals must include chief complaint.');
  assert(stableStory.hopiTimeline.length >= 4, 'HOPI data must create timeline items.');

  const dontKnow = cloneAnswers({
    pathwayId: 'digestion',
    severity: 4,
    duration: 'weeks',
    chiefComplaint: {
      system: 'digestive',
      systemLabel: 'الجهاز الهضمي',
      complaint: 'bloating_gas',
      complaintLabel: 'انتفاخ وغازات',
      secondaryComplaints: [],
    },
    nutritionAnswers: {
      gateAnswers: { tay_know: 'dont_know' },
      deepAnswers: { tay_mode: 'educational_only' },
      deepTriggered: false,
    },
    clinicalAnswers: {
      food_relation: 'تزيد بعد الأكل',
    },
  });
  const dontKnowNutrition = buildVm(dontKnow).resultStory?.nutritionStoryState;
  assert(dontKnowNutrition?.mode === 'educational', 'dont_know must create educational nutrition story.');
  assert(dontKnowNutrition.showScore === false, 'dont_know nutrition story must not show score.');
  assert(!dontKnowNutrition.sentence.includes('ممتاز'), 'dont_know nutrition story must not say ممتاز.');

  const sparse = cloneAnswers({
    pathwayId: GENERAL_UNCERTAIN_PATHWAY_ID,
    severity: 5,
    duration: 'unknown',
    clinicalAnswers: { assessment_pathway_uncertain: 'yes' },
    assessmentFlowSnapshot: {
      visibleStages: ['welcome', 'chiefComplaint', 'review'],
      skippedStages: [],
      adaptiveTriggers: [],
      questionImpactMap: {},
      missingImportantData: ['الشكوى الأساسية', 'مدة الأعراض'],
      confidenceReadiness: 'weak',
      userWasUnsureOfPathway: true,
    },
  });
  const sparseStory = buildVm(sparse).resultStory;
  assert(sparseStory?.clarityNarrative.missing.length, 'Sparse case must expose missing data.');
  assert(sparseStory.primaryAction.tone === 'low_data', 'Sparse case primary action should be low_data.');

  const urgent = cloneAnswers({
    pathwayId: GENERAL_UNCERTAIN_PATHWAY_ID,
    severity: 9,
    duration: 'hours',
    redFlags: ['rf_gen_1'],
    hasEmergencyFlag: true,
    emergencyMessage: 'ألم صدر شديد أو ضيق تنفس شديد',
    clinicalAnswers: {
      assessment_pathway_uncertain: 'yes',
      red_flag: 'ألم صدر شديد أو ضيق تنفس شديد',
    },
    nutritionAnswers: {
      gateAnswers: { tay_know: 'dont_know' },
      deepAnswers: {},
      deepTriggered: false,
    },
  });
  const urgentStory = buildVm(urgent).resultStory;
  assert(urgentStory?.primaryAction.tone === 'urgent', 'Urgent case primary action should be urgent.');
  assert(urgentStory.nutritionStoryState?.mode === 'suppressed', 'Urgent case must suppress nutrition as primary story.');

  console.log('verify:result-story PASS');
}

run();
