import { DEFAULT_ANSWERS } from '@/components/health-engine/constants';
import type { EngineAnswers } from '@/components/health-engine/types';
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
  const unsure = cloneAnswers({
    pathwayId: GENERAL_UNCERTAIN_PATHWAY_ID,
    severity: 4,
    duration: 'days',
    clinicalAnswers: { assessment_pathway_uncertain: 'yes' },
  });
  const unsureState = getAssessmentDirectorState(unsure, 'pathway');
  assert(unsure.pathwayId === GENERAL_UNCERTAIN_PATHWAY_ID, 'Unsure pathway must remain general_uncertain.');
  assert(unsure.pathwayId !== 'fatigue', 'Unsure pathway must not be forced to fatigue.');
  assert(unsureState.flowSnapshot.userWasUnsureOfPathway, 'Director must mark userWasUnsureOfPathway.');

  const foodSignals = cloneAnswers({
    pathwayId: GENERAL_UNCERTAIN_PATHWAY_ID,
    severity: 5,
    duration: 'weeks',
    clinicalAnswers: {
      assessment_pathway_uncertain: 'yes',
      general_main_area: 'هضم وانتفاخ',
      general_pattern: ['تزيد بعد الأكل'],
      general_life_effect: 'تبطئ يومي قليلًا',
    },
  });
  const foodState = getAssessmentDirectorState(foodSignals, 'clinical');
  assert(foodState.shouldShowNutritionLayer, 'Food signals must show nutrition/rhythm layer.');
  assert(foodState.flowSnapshot.adaptiveTriggers.some(item => item.caused.includes('الغذاء')), 'Food trigger must explain nutrition/rhythm layer.');

  const noFood = cloneAnswers({
    pathwayId: GENERAL_UNCERTAIN_PATHWAY_ID,
    severity: 3,
    duration: 'days',
    clinicalAnswers: {
      assessment_pathway_uncertain: 'yes',
      general_main_area: 'لا أعرف بعد',
      general_pattern: ['لا توجد إشارة واضحة'],
      general_life_effect: 'لا تؤثر كثيرًا',
    },
  });
  const noFoodState = getAssessmentDirectorState(noFood, 'clinical');
  assert(!noFoodState.shouldShowNutritionLayer, 'No food signals should keep nutrition hidden/minimal.');

  const stress = cloneAnswers({
    pathwayId: GENERAL_UNCERTAIN_PATHWAY_ID,
    severity: 4,
    duration: 'days',
    clinicalAnswers: {
      assessment_pathway_uncertain: 'yes',
      general_pattern: ['تزيد مع الضغط'],
    },
  });
  const stressState = getAssessmentDirectorState(stress, 'clinical');
  assert(stressState.shouldShowEmotionalLayer, 'Stress signal should keep emotional context meaningful.');

  const sparseState = getAssessmentDirectorState(cloneAnswers(), 'review');
  assert(sparseState.flowSnapshot.confidenceReadiness !== 'enough', 'Sparse answers should not be confidence-ready.');
  assert(sparseState.flowSnapshot.missingImportantData.length > 0, 'Sparse answers should report missing important data.');

  const changed = cloneAnswers({
    pathwayId: 'digestion',
    severity: 4,
    duration: 'days',
    clinicalAnswers: {
      assessment_previous_pathway: GENERAL_UNCERTAIN_PATHWAY_ID,
      assessment_pathway_changed: 'yes',
    },
  });
  const changedState = getAssessmentDirectorState(changed, 'clinical');
  assert(!changedState.flowSnapshot.userWasUnsureOfPathway, 'Changing to a concrete pathway should recompute the unsure flag.');
  assert(changedState.flowSnapshot.visibleStages.length > 0, 'Changing pathway should recompute visible stages.');

  console.log('verify:director PASS');
}

run();
