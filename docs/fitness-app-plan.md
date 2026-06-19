# Development Plan

## Phase 1: Project Foundation

### Goals

Set up the project structure, tooling, navigation, and design system before building features.

### Tasks

- Create Expo project
- Configure TypeScript
- Configure Expo Router
- Install and configure NativeWind
- Install React Native Reusables
- Configure Firebase
- Configure Firestore
- Configure ESLint / Prettier
- Create folder structure

### Deliverables

- Expo app running on iOS
- Expo app running on Android
- Expo app running on Web
- NativeWind working
- Firebase connected

---

## Phase 2: Application Shell & Navigation

### Goals

Create the application's overall structure before implementing screens.

### Tasks

- Create root layout
- Create bottom tab navigation
- Create stack navigation for each tab
- Create placeholder screens
- Create mobile-first screen layouts
- Leave responsive sidebar navigation as a future web/tablet enhancement

### Navigation

#### Dashboard

Weekly overview and insights.

#### Planner

Workout planning and scheduling.

#### Workout

Active workout execution.

#### Library

Exercises and template blocks.

#### Settings

Preferences and account management.

### Deliverables

- Navigation complete
- Mobile-first layouts working
- Consistent page structure
- Web layout functional, even if not fully optimized yet

---

## Phase 3: Shared UI Components

### Goals

Build reusable UI primitives before building feature screens.

### Components

#### Layout

- ScreenContainer
- PageHeader
- SectionHeader

#### Form Components

- Input
- TextArea
- Select
- MultiSelect
- Checkbox
- Switch

#### Lists

- ExerciseCard
- TemplateBlockCard
- WorkoutCard

#### Feedback

- EmptyState
- LoadingState
- ConfirmDialog

### Deliverables

- Shared component library
- Consistent UI patterns

---

## Phase 4: Data Models & Firestore

### Goals

Define application data structures and persistence.

### Collections

```text
users/{userId}/exercises

users/{userId}/templateBlocks

users/{userId}/workouts
```

WorkoutExercise records are embedded directly inside each Workout document.

No separate WorkoutExercise collection is required.

### Models

- Exercise
- TemplateBlock
- Workout
- WorkoutExercise

### Data Model Rules

#### Exercises

- Exercises use `status: "draft" | "active" | "archived"`.
- Exercises can be favorited.
- Exercises should not be hard deleted once used.
- Archived exercises should be hidden from normal selection but remain available for historical workouts.
- Exercise defaults represent the suggested prescription for the next workout.

#### Template Blocks

- Template blocks use `status: "draft" | "active" | "archived"`.
- Template blocks can be favorited.
- Template blocks store exercise references through `exerciseIds`.
- Template blocks are reusable blueprints.
- Changing a template block should not affect already-created workouts.
- Template blocks should generally be archived instead of hard deleted.
- Hard delete is acceptable only if a template block was never used.

#### Workouts

- Workouts use `status: "draft" | "planned" | "completed" | "skipped" | "archived"`.
- Draft and planned workouts can be hard deleted.
- Completed and skipped workouts should be archived instead of hard deleted.
- Workouts embed their own `WorkoutExercise[]` array.
- `Workout.date` can be optional while the workout is still a draft.

#### Workout Exercises

- WorkoutExercise is an embedded exercise instance inside a Workout.
- `exerciseId` maintains a link to the Exercise Library.
- Body part and muscles are copied from the Exercise Library when the workout is generated.
- Planned values are copied from Exercise defaults when the workout is generated.
- Actual values represent what was completed during the workout.
- Exercise name and other editable metadata can be loaded from the Exercise Library using `exerciseId`.

### Tasks

- Create TypeScript interfaces
- Create Firestore converters
- Create Firestore services
- Create validation helpers
- Create constants for body parts, muscles, statuses, purposes, types, and equipment
- Create helper for generating `WorkoutExercise[]` from selected Template Blocks
- Create helper for copying exercise defaults into planned workout values
- Create helper for copying body part and muscle metadata into WorkoutExercise

### Deliverables

- Fully typed data layer
- Firestore CRUD utilities
- Workout generation utility
- Embedded WorkoutExercise model
- Clear archive/delete rules

---

## Phase 5: Authentication

### Goals

Allow users to sign in and access their data.

### Tasks

- Firebase Authentication
- Protected routes
- Auth context
- Login screen
- Logout flow
- User-scoped Firestore paths

### Deliverables

- User authentication
- Route protection
- User-specific data access

---

## Phase 6: Exercise Library

### Goals

Build the master exercise database.

### Features

- Exercise list
- Search
- Filter by status
- Filter by favorites
- Filter by body part
- Filter by muscle
- Filter by type
- Filter by purpose
- Filter by equipment
- View archived exercises separately
- Edit exercise details
- Edit default prescription

### CRUD

- Create Exercise
- Edit Exercise
- Archive Exercise
- Restore Exercise
- Favorite Exercise
- Hard delete only if safe and unused

### Deliverables

- Complete Exercise Library
- Status and favorite filtering
- Exercise default management

---

## Phase 7: Template Blocks

### Goals

Create reusable workout building blocks.

### Features

- Template Block list
- Create Template Block
- Edit Template Block
- Archive Template Block
- Restore Template Block
- Favorite Template Block
- Add/remove exercises
- Reorder exercises if needed
- Filter by status
- Filter by favorites

### Template Block Principle

Template blocks can be small blocks or larger reusable workouts.

Examples:

- Shoulder Rehab
- Foot & Ankle
- Core
- Lower Body A
- Upper Body A
- Travel Workout

Do not nest Template Blocks inside other Template Blocks for MVP.

### Deliverables

- Reusable workout templates
- Template status management
- Favorite Template Blocks

---

## Phase 8: Workout Planning

### Goals

Create workouts from template blocks.

### Features

- Weekly planner
- Calendar/date picker
- Create draft workout
- Assign date
- Move workout to another date
- Create workout from one or more template blocks
- Combine multiple template blocks into one workout
- Edit planned workout exercises
- Archive old completed/skipped workouts if needed

### Workflow

1. Select Template Blocks
2. Load Exercises from selected Template Blocks
3. Generate WorkoutExercise objects
4. Copy body part and muscle metadata into each WorkoutExercise
5. Copy Exercise defaults into planned values
6. Embed WorkoutExercise objects inside Workout
7. Save Workout

### Deliverables

- Weekly workout planning
- Draft workout support
- Planned workout generation
- Independent workout instances

---

## Phase 9: Workout Mode

### Goals

Execute workouts.

### Features

- Exercise checklist
- Mark exercise complete
- Edit planned values
- Enter actual values
- Notes
- Complete workout
- Skip workout

### Deliverables

- Mobile-first workout experience

---

## Phase 10: Progression Logic

### Goals

Track progression and update defaults.

### Workflow

1. Workout completed
2. Compare actual values to Exercise defaults
3. Detect improvements
4. Prompt user

```text
Update exercise default?
```

5. Update Exercise defaults if approved

### Rules

- Never automatically update defaults
- Never decrease defaults automatically
- User approval required
- Defaults should only update when performance improves
- Fatigue, injury, deloads, and temporary modifications should not lower defaults

### Deliverables

- Progressive overload tracking
- Default update prompt
- Safe default update flow

---

## Phase 11: Dashboard

### Goals

Provide simple weekly insights.

### Features

- Weekly workout summary
- Body part coverage
- Muscle coverage
- Favorite exercises
- Workout completion stats
- Missing coverage warnings

### Future Enhancements

- Muscle heat map
- Monthly trends
- Training volume
- Recovery tracking

### Deliverables

- MVP dashboard

---

## Phase 12: Polish & Quality

### Goals

Prepare app for daily use.

### Tasks

- Empty states
- Loading states
- Error handling
- Responsive web layouts
- Performance improvements
- Data cleanup
- Testing
- Firestore rules review
- Basic accessibility pass

### Deliverables

- Stable MVP
