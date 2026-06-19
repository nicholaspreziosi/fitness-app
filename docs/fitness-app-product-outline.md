# Fitness / Rehab Workout App

## Goal

Build a mobile-first fitness, rehab, and performance training app for personal use.

### Primary Goals

- Exercise library and exercise bank
- Reusable workout building blocks
- Weekly workout planning
- Workout checklists during training
- Progress tracking
- Basic category coverage analysis
- Learn React Native / Expo while building a useful real-world application

The app should prioritize simplicity and usability over advanced analytics.

---

# Tech Stack

## Frontend

- React Native
- Expo
- Expo Router
- TypeScript
- NativeWind
- React Native Reusables

## Backend

- Firebase Auth
- Firestore

## Deployment Targets

- iOS
- Android
- Web (via React Native Web)

The application should support a single codebase that can run on mobile and web.

---

# Application Structure

The application should be designed mobile-first.

Navigation should use:

- Bottom tab navigation on mobile
- Stack navigation within each tab
- Responsive sidebar navigation on larger web/tablet layouts (future enhancement)

## Primary Navigation

- Dashboard
- Planner
- Workout
- Library
- Settings

---

# Core Architecture

```text
Exercise Library
    ↓
Template Blocks
    ↓
Workouts
      └── WorkoutExercise[]
```

---

# Data Models

## Exercise

Master exercise definition.

```ts
type BodyPart =
  | "Full Body"
  | "Neck"
  | "Shoulders"
  | "Chest"
  | "Back"
  | "Upper Arms"
  | "Lower Arms"
  | "Core"
  | "Hip"
  | "Upper Legs"
  | "Lower Legs"
  | "Feet";

type Muscle =
  | "Neck"
  | "Upper Traps"
  | "Front Delts"
  | "Side Delts"
  | "Rear Delts"
  | "Infraspinatus"
  | "Teres Minor"
  | "Subscapularis"
  | "Serratus Anterior"
  | "Mid Traps"
  | "Lower Traps"
  | "Rhomboids"
  | "Pecs"
  | "Lats"
  | "Biceps"
  | "Triceps"
  | "Forearms"
  | "Abs"
  | "Obliques"
  | "Transverse Abdominis"
  | "Spinal Erectors"
  | "Quadratus Lumborum"
  | "Glute Max"
  | "Glute Med"
  | "Glute Min"
  | "Hip Adductors"
  | "Hip Abductors"
  | "Hip Flexors"
  | "Quads"
  | "Hamstrings"
  | "Calves"
  | "Tibialis"
  | "Feet";

type ExerciseStatus =
  | "draft"
  | "active"
  | "archived";

interface Exercise {
  id: string

  name: string

  createdAt: Date;
  
  updatedAt: Date;

  status: ExerciseStatus;

  favorite?: boolean;

  bodyPart?: BodyPart

  primaryMuscles?: Muscle[]

  secondaryMuscles?: Muscle[]

  otherPrimaryMuscles?: string[]

  otherSecondaryMuscles?: string[]

  type?: (
    | "Compound"
    | "Isolation"
    | "Isometric"
    | "Eccentric"
    | "Concentric"
    | "Conditioning"
    | "Mobility"
  )[]

  purpose?: (
    | "Strength"
    | "Stability"
    | "Endurance"
    | "Rehab"
    | "Mobility"
    | "Aerobic Fitness"
    | "Anaerobic Fitness"
  )[]

  equipment?: (
    | "Bands"
    | "Barbell"
    | "Bodyweight"
    | "Cable"
    | "Dumbbells"
    | "Kettlebell"
    | "Machine"
    | "Mobility"
  )[]

  otherEquipment?: string[]

  defaultSets?: number
  defaultReps?: number
  defaultHoldSeconds?: number
  defaultWeight?: number

  notes?: string
}
```

### Notes

- never hard delete once used

### Examples

#### Pendulum Squat

```ts
{
  name: "Pendulum Squat",

  bodyPart: "Upper Legs",

  primaryMuscles: [
    "Quads"
  ],

  secondaryMuscles: [
    "Glute Max"
  ]
}
```

#### Romanian Deadlift

```ts
{
  name: "Romanian Deadlift",

  bodyPart: "Upper Legs",

  primaryMuscles: [
    "Hamstrings"
  ],

  secondaryMuscles: [
    "Glute Max",
    "Spinal Erectors"
  ]
}
```

---

## Template Block

Reusable exercise groups.

### Examples

- Quad Strength
- Knee Rehab
- Shoulder Rehab
- Foot & Ankle
- Core
- Surf Conditioning
- Push

```ts
type TemplateBlockStatus =
  | "draft"
  | "active"
  | "archived";

interface TemplateBlock {
  id: string;

  name: string;

  favorite?: boolean;

  createdAt: Date;
  
  updatedAt: Date;

  status: TemplateBlockStatus;

  exerciseIds: string[];

  notes?: string;
}
```

### Notes

Template blocks are reusable blueprints.

Changing a template block should **not** affect completed workouts.

When creating a workout:

1. User selects one or more template blocks.
2. App loads exercises from those template blocks.
3. App generates workout exercises from the current exercise definitions.
4. App copies planned values into the workout.
5. Workout becomes completely independent from the template.

Template blocks only store references to exercises.

Workouts store their own exercise instances.

Archived exercises should be hidden from selection while remaining available for historical workouts.

Exercises should never be hard deleted. Instead:

```ts
  status: "archived"
```

TemplateBlock:
- archive instead of hard delete
- hard delete only if never used


---

## Workout Exercise

Exercise instance embedded directly inside a workout.

```ts
interface WorkoutExercise {
  exerciseId: string;

  bodyPart?: BodyPart;
  primaryMuscles?: Muscle[];
  secondaryMuscles?: Muscle[];

  plannedSets?: number;
  plannedReps?: number;
  plannedHoldSeconds?: number;
  plannedWeight?: number;

  actualSets?: number;
  actualReps?: number;
  actualHoldSeconds?: number;
  actualWeight?: number;

  notes?: string;

  completed: boolean;
}
```

### Notes

- `exerciseId` maintains a relationship to the Exercise Library.
- Exercise name is loaded from the Exercise Library using `exerciseId`.
- Body part and muscles are copied from the Exercise Library when the workout is generated.
- Planned values are copied from Exercise defaults when the workout is generated.
- Actual values represent what was completed during the workout.
- Other editable exercise metadata, such as equipment, type, purpose, and notes, can still be loaded from the Exercise Library using `exerciseId`.
- If an exercise is archived, historical workouts remain unaffected.

---

## Workout

Specific workout on a specific date.

```ts
type WorkoutStatus =
  | "draft"
  | "planned"
  | "completed"
  | "skipped"
  | "archived";

interface Workout {
  id: string;

  name: string;

  createdAt: Date;

  updatedAt: Date;

  date?: Date;

  status: WorkoutStatus;

  exercises: WorkoutExercise[];

  notes?: string;
}
```

### Notes
- draft: can hard delete
- planned: can hard delete
- completed/skipped: archive, don’t hard delete

### Examples

- Wednesday Lower Body
- Friday Shoulder Rehab
- Saturday Upper Body

### Example Generated Workout

```ts
{
  id: "workout-1",

  name: "Wednesday Lower Body",

  date: new Date(),

  status: "planned",

  exercises: [
    {
      exerciseId: "pendulum-squat",

      plannedSets: 2,
      plannedReps: 8,
      plannedWeight: 100,

      completed: false
    },
    {
      exerciseId: "leg-extension",

      plannedSets: 2,
      plannedReps: 8,
      plannedWeight: 75,

      completed: false
    }
  ]
}
```

---

# Firestore Structure

```text
users/{userId}/exercises

users/{userId}/templateBlocks

users/{userId}/workouts
```

WorkoutExercise records are embedded directly inside each Workout document.

No separate WorkoutExercise collection is required.

---

# Progression Logic

Exercise defaults represent what should be suggested next time.

WorkoutExercise represents what was actually performed.

## Example

### Exercise Default

```text
Leg Extension
2 x 8 @ 75 lbs
```

### Workout Result

```text
2 x 8 @ 80 lbs
```

## On Completion

Compare actual values against defaults.

If performance increased:

```text
Update exercise default?
```

If accepted:

```text
Default becomes:
2 x 8 @ 80 lbs
```

### Rules

- Do NOT automatically update defaults
- Do NOT lower defaults because of fatigue
- Do NOT lower defaults because of injury
- Do NOT lower defaults because of deloads
- User must approve default updates

---

# Main Screens

## Dashboard

Weekly overview.

### Example

- Quad: 4 exercises
- Shoulder: 3 exercises
- Core: 2 exercises
- Foot: 0 ⚠️

### Potential Future Alerts

- No shoulder work this week
- No foot/ankle work this week
- No conditioning work this week

Keep initial logic simple.

---

## Exercise Library

### Features

- Search
- Favorites
- Filter by status
- Filter by category
- Filter by type
- Filter by purpose
- Filter by body part
- Filter by muscles
- Edit exercise details

---

## Template Blocks

View reusable blocks.

### Example

#### Quad Strength

- Pendulum Squat
- Leg Press
- Wall Sit

#### Shoulder Rehab

- Row → ER → W
- Bottoms-Up Press
- Prone Raise

#### Foot & Ankle

- Tib Raise
- Short Foot
- Calf Raise

---

## Weekly Planner

Create workouts for the week.

### Example

#### Wednesday

- Quad Strength
- Foot & Ankle
- Core

#### Friday

- Shoulder Rehab
- Surf Conditioning

### Requirements

Users should be able to combine multiple template blocks into a workout.

---

## Workout Mode

Mobile-first checklist experience.

### Example

#### Legs

- [ ] Pendulum Squat
  - 2 × 10 @ 50 lbs

- [ ] Leg Press
  - 2 × 8 @ 80 lbs

- [ ] Pigeon Split Squat
  - 3 × 6

#### Foot

- [ ] Tib Raise

- [ ] Short Foot

#### Core

- [ ] Ab Roller

---

# MVP Scope

## Build Initially

Phase 1: Project Foundation
Phase 2: Application Shell & Navigation
Phase 3: Shared UI Components
Phase 4: Data Models & Firestore
Phase 5: Authentication
Phase 6: Exercise Library
Phase 7: Template Blocks
Phase 8: Workout Planning
Phase 9: Workout Mode
Phase 10: Progression Logic
Phase 11: Dashboard
Phase 12: Polish & Quality
Phase 13: Future enhancements

## Possible future enhancements (but not in MVP)

- Body "heat map" graphic
- Advanced analytics
- AI coaching and analysis of exercise data
- Social features
- Complex charts

---

# Guiding Principle

The app should answer:

> What should I train this week, what did I complete, and am I neglecting any important area?

Not:

> How do I build the most complex workout tracker possible?