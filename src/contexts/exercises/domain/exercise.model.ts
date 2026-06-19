export const BODY_PARTS = [
  'Full Body',
  'Neck',
  'Shoulders',
  'Chest',
  'Back',
  'Upper Arms',
  'Lower Arms',
  'Core',
  'Hip',
  'Upper Legs',
  'Lower Legs',
  'Feet',
] as const;

export const MUSCLES = [
  'Neck',
  'Upper Traps',
  'Front Delts',
  'Side Delts',
  'Rear Delts',
  'Infraspinatus',
  'Teres Minor',
  'Subscapularis',
  'Serratus Anterior',
  'Mid Traps',
  'Lower Traps',
  'Rhomboids',
  'Pecs',
  'Lats',
  'Biceps',
  'Triceps',
  'Forearms',
  'Abs',
  'Obliques',
  'Transverse Abdominis',
  'Spinal Erectors',
  'Quadratus Lumborum',
  'Glute Max',
  'Glute Med',
  'Glute Min',
  'Hip Adductors',
  'Hip Abductors',
  'Hip Flexors',
  'Quads',
  'Hamstrings',
  'Calves',
  'Tibialis',
  'Feet',
] as const;

export const EXERCISE_STATUSES = ['draft', 'active', 'archived'] as const;

export const EXERCISE_TYPES = [
  'Compound',
  'Isolation',
  'Isometric',
  'Eccentric',
  'Concentric',
  'Conditioning',
  'Mobility',
] as const;

export const EXERCISE_PURPOSES = [
  'Strength',
  'Stability',
  'Endurance',
  'Rehab',
  'Mobility',
  'Aerobic Fitness',
  'Anaerobic Fitness',
] as const;

export const EQUIPMENT_OPTIONS = [
  'Bands',
  'Barbell',
  'Bodyweight',
  'Cable',
  'Dumbbells',
  'Kettlebell',
  'Machine',
  'Mobility',
] as const;

export type BodyPart = (typeof BODY_PARTS)[number];
export type Muscle = (typeof MUSCLES)[number];
export type ExerciseStatus = (typeof EXERCISE_STATUSES)[number];
export type ExerciseType = (typeof EXERCISE_TYPES)[number];
export type ExercisePurpose = (typeof EXERCISE_PURPOSES)[number];
export type Equipment = (typeof EQUIPMENT_OPTIONS)[number];

export interface Exercise {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: ExerciseStatus;
  favorite?: boolean;
  bodyPart?: BodyPart;
  primaryMuscles?: Muscle[];
  secondaryMuscles?: Muscle[];
  otherPrimaryMuscles?: string[];
  otherSecondaryMuscles?: string[];
  type?: ExerciseType[];
  purpose?: ExercisePurpose[];
  equipment?: Equipment[];
  otherEquipment?: string[];
  defaultSets?: number;
  defaultReps?: number;
  defaultHoldSeconds?: number;
  defaultWeight?: number;
  notes?: string;
}
