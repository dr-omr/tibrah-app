import { DEFAULT_ANSWERS } from '@/components/health-engine/constants';
import type { EngineAnswers } from '@/components/health-engine/types';
import {
  DURATION_QUESTION_META,
  SEVERITY_QUESTION_META,
  isUncertainAnswerValue,
} from '@/components/health-engine/assessment/questions/questionExperience';
import { GENERAL_UNCERTAIN_PATHWAY_ID, getAssessmentDirectorState } from '@/lib/assessment/assessment-director';

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

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function run() {
  assert(SEVERITY_QUESTION_META.whyWeAsk.includes('الشدة'), 'Severity question must have why metadata.');
  assert(SEVERITY_QUESTION_META.impact.includes('أولوية'), 'Severity question must have impact metadata.');
  assert(DURATION_QUESTION_META.whyWeAsk.includes('المدة'), 'Duration question must have why metadata.');
  assert(DURATION_QUESTION_META.impact.includes('الإيقاع'), 'Duration question must have impact metadata.');

  const food = cloneAnswers({
    pathwayId: GENERAL_UNCERTAIN_PATHWAY_ID,
    severity: 5,
    duration: 'weeks',
    clinicalAnswers: {
      assessment_pathway_uncertain: 'yes',
      general_pattern: ['تزيد بعد الأكل'],
      general_life_effect: 'تبطئ يومي قليلًا',
    },
  });
  const foodState = getAssessmentDirectorState(food, 'clinical');
  assert(foodState.shouldShowNutritionLayer, 'Food signal should show nutrition layer.');
  assert(foodState.flowSnapshot.adaptiveTriggers.some(item => item.caused.includes('الغذاء')), 'Food signal should show a specific adaptive reason.');

  const noFood = cloneAnswers({
    pathwayId: GENERAL_UNCERTAIN_PATHWAY_ID,
    severity: 3,
    duration: 'days',
    clinicalAnswers: {
      assessment_pathway_uncertain: 'yes',
      general_pattern: ['لا توجد إشارة واضحة'],
      general_life_effect: 'لا تؤثر كثيرًا',
    },
  });
  assert(!getAssessmentDirectorState(noFood, 'clinical').shouldShowNutritionLayer, 'No food signal should not show nutrition reason.');

  const uncertain = cloneAnswers({
    pathwayId: GENERAL_UNCERTAIN_PATHWAY_ID,
    duration: 'unknown',
    clinicalAnswers: {
      assessment_pathway_uncertain: 'yes',
      general_main_area: 'not_sure',
    },
  });
  const uncertainState = getAssessmentDirectorState(uncertain, 'review');
  assert(isUncertainAnswerValue('not_sure'), 'not_sure should be treated as uncertainty.');
  assert(uncertainState.flowSnapshot.missingImportantData.some(item => item.includes('غير المؤكدة')), 'Uncertainty should become missing data, not an error.');

  const changed = cloneAnswers({
    pathwayId: 'digestion',
    severity: 4,
    duration: 'days',
    clinicalAnswers: {
      general_main_area: 'هضم وانتفاخ',
      assessment_previous_pathway: GENERAL_UNCERTAIN_PATHWAY_ID,
      assessment_pathway_changed: 'yes',
    },
  });
  const changedState = getAssessmentDirectorState(changed, 'clinical');
  assert(changedState.flowSnapshot.visibleStages.length > 0, 'Changed pathway should recompute the visible plan.');
  assert(changed.clinicalAnswers.general_main_area === 'هضم وانتفاخ', 'Changing pathway scenario should preserve safe existing answers.');

  console.log('verify:questions PASS');
}

run();
