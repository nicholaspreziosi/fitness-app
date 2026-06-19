# React Native Architecture Guidelines

## Goal

Provide a clear, maintainable architecture for the Fitness / Rehab Workout App using:

- React Native
- Expo
- Expo Router
- TypeScript
- NativeWind
- React Native Reusables
- Firebase Auth
- Firestore

The app should be simple enough to build quickly, but structured enough that AI agents can add features without creating messy, tightly coupled code.

---

# Core Architecture Principles

## 1. Keep UI, business logic, and data access separate

Avoid putting Firestore calls, business rules, and complex state logic directly inside screens.

Preferred flow:

```text
Screen
  ↓
Hook
  ↓
Service
  ↓
Repository
  ↓
Firebase / Firestore
```

Example:

```text
ExerciseLibraryScreen
  ↓
useExercises
  ↓
ExerciseService
  ↓
ExerciseRepository
  ↓
Firestore
```

---

## 2. Screens should be thin

Expo Router screens should mostly compose UI and call hooks.

Screens should not:

- Contain Firestore queries directly
- Contain complex business logic
- Contain large inline form logic
- Know how data is stored in Firestore

Screens should:

- Render layouts
- Call hooks
- Pass data to components
- Handle navigation

Good:

```tsx
export default function ExerciseLibraryScreen() {
  return <ExerciseLibraryView />;
}
```

Avoid:

```tsx
export default function ExerciseLibraryScreen() {
  // Firestore calls
  // filtering logic
  // form state
  // mutations
  // large JSX tree
}
```

---

# Recommended Project Structure

```text
app/
  _layout.tsx
  (auth)/
    login.tsx
    signup.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    planner.tsx
    workout.tsx
    library.tsx
    settings.tsx
  exercises/
    [id].tsx
    new.tsx
  template-blocks/
    [id].tsx
    new.tsx
  workouts/
    [id].tsx
    new.tsx

src/
  contexts/
    exercises/
      domain/
      application/
      infrastructure/
    templateBlocks/
      domain/
      application/
      infrastructure/
    workouts/
      domain/
      application/
      infrastructure/
    auth/
      domain/
      application/
      infrastructure/
    shared/
      domain/
      infrastructure/
      utils/

  ui/
    exercises/
      views/
      components/
      hooks/
    templateBlocks/
      views/
      components/
      hooks/
    workouts/
      views/
      components/
      hooks/
    dashboard/
      views/
      components/
      hooks/
    shared/
      components/
      containers/
      hooks/
      providers/

  lib/
    firebase/
    query/
    theme/
    constants/
```

---

# Layer Responsibilities

## App Layer

Location:

```text
app/
```

Purpose:

- Expo Router routes
- Navigation structure
- Route groups
- Auth routing
- Tabs
- Stack screens

Rules:

- Keep route files thin
- Route files should usually render a View from `src/ui`
- Do not put Firestore logic in route files
- Do not put business logic in route files

Example:

```tsx
import { ExerciseLibraryView } from "@/src/ui/exercises/views/ExerciseLibraryView";

export default function LibraryScreen() {
  return <ExerciseLibraryView />;
}
```

---

## UI Layer

Location:

```text
src/ui/
```

Purpose:

- Screens/views
- Feature components
- Shared components
- Hooks that connect UI to application services
- Local UI state

### Views

Location:

```text
src/ui/{feature}/views/
```

Views are page-level UI compositions.

Examples:

```text
ExerciseLibraryView
TemplateBlockListView
WorkoutDetailView
WeeklyPlannerView
DashboardView
```

Views may:

- Compose components
- Use hooks
- Handle navigation
- Render loading/error/empty states

Views should not:

- Call Firestore directly
- Contain reusable business logic
- Own complex domain rules

---

### Components

Location:

```text
src/ui/{feature}/components/
src/ui/shared/components/
```

Components should be presentational and reusable.

Examples:

```text
ExerciseCard
ExerciseForm
TemplateBlockCard
WorkoutCard
WorkoutExerciseRow
CoverageBadge
EmptyState
ConfirmDialog
```

Components should:

- Receive data through props
- Avoid direct data fetching
- Avoid business logic
- Use NativeWind classes
- Use React Native Reusables where appropriate

---

### Hooks

Location:

```text
src/ui/{feature}/hooks/
```

Hooks connect UI to services.

Examples:

```text
useExercises
useExerciseForm
useTemplateBlocks
useWorkouts
useWorkoutCompletion
useWeeklyCoverage
```

Hooks may:

- Use React Query / TanStack Query
- Call application services
- Manage loading/error states
- Manage form submission
- Handle optimistic updates if needed

Hooks should not:

- Contain raw Firestore query code directly unless intentionally simple
- Duplicate business logic
- Know too much about UI layout

Good:

```tsx
export function useExercises() {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: () => exerciseService.listExercises(),
  });
}
```

---

# Domain Layer

Location:

```text
src/contexts/{feature}/domain/
```

Purpose:

- Core types
- Domain models
- Business rules
- Validation helpers
- Repository interfaces

Examples:

```text
exercise.model.ts
exercise.repository.ts
exercise.types.ts
exercise.rules.ts
workout.model.ts
workout.repository.ts
workout.rules.ts
```

The domain layer should not depend on:

- React Native
- Expo
- Firebase
- Firestore
- NativeWind
- UI components

The domain layer should be the most stable part of the app.

---

## Domain Models

Use TypeScript interfaces and type aliases.

Example:

```ts
export type ExerciseStatus = "draft" | "active" | "archived";

export interface Exercise {
  id: string;
  name: string;
  status: ExerciseStatus;
  favorite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Domain Rules

Put reusable business rules in domain helpers or services.

Examples:

```text
shouldPromptDefaultUpdate
calculateWeeklyCoverage
isExerciseArchived
canHardDeleteWorkout
canArchiveWorkout
```

Example:

```ts
export function canHardDeleteWorkout(status: WorkoutStatus): boolean {
  return status === "draft" || status === "planned";
}
```

---

# Application Layer

Location:

```text
src/contexts/{feature}/application/
```

Purpose:

- Orchestrate use cases
- Coordinate repositories
- Apply domain rules
- Return clean data to UI hooks

Examples:

```text
exercise.service.ts
templateBlock.service.ts
workout.service.ts
dashboard.service.ts
```

Services should contain app-level operations.

Examples:

```text
createExercise
archiveExercise
createTemplateBlock
generateWorkoutFromTemplateBlocks
completeWorkout
updateExerciseDefaults
calculateDashboardCoverage
```

---

## Application Service Example

```ts
export class WorkoutService {
  constructor(
    private readonly workoutRepository: WorkoutRepository,
    private readonly exerciseRepository: ExerciseRepository
  ) {}

  async createWorkoutFromTemplateBlocks(params: {
    name: string;
    date?: Date;
    templateBlockIds: string[];
  }): Promise<Workout> {
    // 1. Load template blocks
    // 2. Load exercises
    // 3. Generate embedded WorkoutExercise[]
    // 4. Copy planned values
    // 5. Copy bodyPart / muscles for analytics
    // 6. Save workout
  }
}
```

---

# Infrastructure Layer

Location:

```text
src/contexts/{feature}/infrastructure/
```

Purpose:

- Firebase Auth integration
- Firestore repositories
- Data mapping
- External storage
- Platform-specific implementations

Examples:

```text
firestoreExercise.repository.ts
firestoreTemplateBlock.repository.ts
firestoreWorkout.repository.ts
firebaseAuth.repository.ts
exercise.mapper.ts
workout.mapper.ts
```

Infrastructure is allowed to know about Firebase.

Domain and UI should not need to know Firestore document shapes.

---

## Repository Pattern

Use repository interfaces in the domain layer and Firestore implementations in infrastructure.

Example:

```ts
export interface ExerciseRepository {
  list(): Promise<Exercise[]>;
  findById(id: string): Promise<Exercise | null>;
  create(exercise: Exercise): Promise<void>;
  update(exercise: Exercise): Promise<void>;
  archive(id: string): Promise<void>;
}
```

Firestore implementation:

```ts
export class FirestoreExerciseRepository implements ExerciseRepository {
  async list(): Promise<Exercise[]> {
    // Firestore query
  }

  async archive(id: string): Promise<void> {
    // Update status to archived
  }
}
```

---

# Firebase / Firestore Guidelines

## Firestore Collections

```text
users/{userId}/exercises

users/{userId}/templateBlocks

users/{userId}/workouts
```

Do not create a separate `workoutExercises` collection.

`WorkoutExercise[]` should be embedded inside each `Workout`.

---

## Firestore Access Rules

All user data should be scoped under:

```text
users/{userId}
```

Never store user-owned app data in global top-level collections unless there is a clear reason.

---

## Firestore Data Conversion

Use mappers to convert between Firestore data and domain models.

Why:

- Firestore timestamps differ from JS `Date`
- Firestore documents may contain missing fields
- Domain models should stay clean
- Type safety improves

Example:

```ts
export function workoutFromFirestore(doc: FirestoreWorkoutDocument): Workout {
  return {
    ...doc,
    date: doc.date.toDate(),
    createdAt: doc.createdAt.toDate(),
    updatedAt: doc.updatedAt.toDate(),
  };
}
```

---

# State Management Strategy

## Use the simplest state tool that fits

Preferred order:

1. Local component state
2. Custom hooks
3. React Query / TanStack Query
4. Context providers
5. Zustand only if needed

---

## Local State

Use local state for:

- Form field state
- Modal open/close state
- Filter panels
- Selected tabs
- Temporary UI values

---

## React Query / TanStack Query

Use React Query for Firestore/server state.

Use it for:

- Exercises
- Template blocks
- Workouts
- Dashboard data
- User profile data

Benefits:

- Loading states
- Error states
- Caching
- Refetching
- Mutation handling

Example query keys:

```ts
["exercises", userId]
["templateBlocks", userId]
["workouts", userId]
["workouts", userId, weekStart]
["dashboard", userId, weekStart]
```

---

## Context Providers

Use Context for app-wide state.

Good uses:

- Auth session
- Theme
- User preferences

Avoid using Context for large frequently changing lists like exercises or workouts.

---

## Zustand

Use Zustand only if there is a real need for complex client-side state.

Possible future uses:

- Draft workout builder state
- Offline queue
- Complex planner drag/drop state

Do not add Zustand by default.

---

# Auth Architecture

## Auth Provider

Create a shared auth provider.

Location:

```text
src/ui/shared/providers/AuthProvider.tsx
```

Responsibilities:

- Listen to Firebase Auth state
- Store current user
- Expose loading state
- Expose sign in / sign out helpers
- Protect app routes

---

## Auth Hook

```ts
export function useAuth() {
  // returns user, loading, signIn, signOut
}
```

Screens should use `useAuth`, not Firebase directly.

---

## Protected Routes

Use Expo Router route groups:

```text
(auth)
(tabs)
```

Unauthenticated users should see auth routes.

Authenticated users should see protected app routes.

---

# Navigation Guidelines

Use Expo Router.

Primary mobile navigation:

```text
Dashboard
Planner
Workout
Library
Settings
```

Guidelines:

- Use bottom tabs for primary sections
- Use stack routes for detail screens
- Keep route names predictable
- Keep route files thin
- Use dynamic routes for detail screens

Example:

```text
app/exercises/[id].tsx
app/template-blocks/[id].tsx
app/workouts/[id].tsx
```

---

# Data Flow Patterns

## Standard Read Flow

```text
Screen
  ↓
View
  ↓
Hook
  ↓
Application Service
  ↓
Repository
  ↓
Firestore
```

## Standard Mutation Flow

```text
User action
  ↓
Component callback
  ↓
Hook mutation
  ↓
Application Service
  ↓
Repository
  ↓
Firestore update
  ↓
React Query invalidates/refetches data
```

## Workout Generation Flow

```text
User selects template blocks
  ↓
WorkoutService loads TemplateBlocks
  ↓
WorkoutService loads Exercises
  ↓
WorkoutService creates embedded WorkoutExercise[]
  ↓
WorkoutService copies planned values
  ↓
WorkoutService copies bodyPart / muscles
  ↓
WorkoutRepository saves Workout
```

---

# Error Handling Strategy

## Keep errors user-friendly

Infrastructure errors should not leak directly into UI.

Avoid showing:

```text
FirebaseError: Missing or insufficient permissions
```

Prefer:

```text
Unable to load workouts.
```

---

## Error Layers

### Repository Layer

Handles Firebase-specific errors.

Examples:

- Permission denied
- Network error
- Missing document
- Invalid query

Repositories should transform Firebase errors into app-level errors.

---

### Service Layer

Handles business errors.

Examples:

- Cannot complete workout with no exercises
- Cannot archive already archived exercise
- Cannot generate workout from empty template block

---

### UI Layer

Displays friendly error messages.

Examples:

- Toast
- Inline error
- Empty state
- Retry button

---

# Validation Strategy

Use Zod for form validation and data validation.

Recommended uses:

- Exercise form
- Template block form
- Workout creation form
- User settings form

Example:

```ts
const exerciseSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["draft", "active", "archived"]),
});
```

Use React Hook Form for forms.

Use Zod resolvers where appropriate.

---

# Component Guidelines

## Shared Components

Location:

```text
src/ui/shared/components/
```

Examples:

```text
Button
Input
TextArea
Card
Badge
EmptyState
LoadingState
ConfirmDialog
ScreenHeader
```

Prefer React Native Reusables components when available.

Customize through NativeWind classes.

---

## Feature Components

Location:

```text
src/ui/{feature}/components/
```

Examples:

```text
ExerciseCard
ExerciseFilters
ExerciseForm
TemplateBlockCard
WorkoutCard
WorkoutExerciseRow
WeeklyCoverageCard
```

Feature components may know about feature-specific models.

Shared components should not.

---

# Styling Guidelines

Use NativeWind for styling.

Prefer:

```tsx
<View className="rounded-lg border border-border bg-card p-4" />
```

Avoid:

```tsx
<View style={{ borderRadius: 12, padding: 16 }} />
```

Use inline styles only when NativeWind cannot express the requirement.

Examples:

- Dynamic calculated dimensions
- Animated styles
- Platform-specific edge cases

---

# NativeWind Guidelines

## Prefer semantic tokens

Use semantic classes where possible:

```text
bg-background
bg-card
text-foreground
text-muted-foreground
border-border
```

Avoid hard-coded colors:

```text
bg-blue-500
text-slate-900
border-slate-200
```

unless there is a specific reason.

---

## Keep class names readable

Good:

```tsx
<View className="rounded-lg border border-border bg-card p-4">
```

Avoid:

```tsx
<View className="m-[13px] rounded-[17px] border-[#dedede] bg-[#ffffff] p-[18px]">
```

---

# Mobile-First Guidelines

The app should be designed for mobile first.

Prioritize:

- One-column layouts
- Large touch targets
- Bottom tab navigation
- Bottom sheets for mobile actions
- Simple lists
- Fast checklist interaction

Avoid:

- Desktop-first table layouts
- Tiny buttons
- Dense forms
- Complex split panes in MVP

---

# Platform Guidelines

## iOS / Android

Use native-feeling patterns:

- Bottom tabs
- Stack navigation
- Native keyboard behavior
- Safe areas
- Touchable rows
- Bottom sheets

## Web

Web should work from the same codebase, but does not need to be perfect in MVP.

For larger screens:

- Add max-width containers
- Consider responsive sidebar later
- Avoid mobile UI stretching too wide

---

# Forms Guidelines

Use React Hook Form + Zod.

Guidelines:

- Keep forms simple
- Use controlled inputs only when necessary
- Validate required fields
- Show inline errors
- Use large tap targets
- Avoid overly long forms on one screen

For long forms, use sections:

```text
Basics
Classification
Defaults
Notes
```

---

# Offline & Sync Guidelines

For MVP, do not build complex offline sync.

However:

- Avoid data models that make offline sync impossible later
- Keep mutations simple
- Keep user data scoped by user ID
- Prefer full document updates for small documents
- Avoid deeply nested structures beyond `WorkoutExercise[]`

Future offline support may include:

- Firestore offline persistence
- Optimistic updates
- Mutation queue
- Conflict handling

---

# Performance Guidelines

## Lists

Use performant list components.

Prefer:

```tsx
<FlatList />
```

or equivalent list primitives.

Avoid rendering large arrays with:

```tsx
{items.map(...)}
```

for long lists.

---

## Memoization

Use memoization selectively.

Good uses:

- Expensive filtering
- Derived dashboard stats
- Large list item components

Avoid premature memoization everywhere.

---

## Firestore Reads

Avoid unnecessary reads.

Good:

- Load workouts by week
- Load active exercises for pickers
- Load archived exercises only when needed

Avoid:

- Loading every workout ever on app start
- Querying Firestore inside list rows
- Fetching exercise documents one by one when a batch/list query would work

---

# Testing Strategy

## Unit Tests

Focus on:

- Domain rules
- Workout generation
- Progression logic
- Coverage calculations
- Validation helpers

Examples:

```text
should generate workout exercises from template blocks
should copy planned values from exercise defaults
should not update defaults without approval
should detect increased weight
should calculate weekly muscle coverage
```

---

## Component Tests

Focus on:

- Rendering
- Empty states
- Loading states
- User interactions
- Form validation

---

## Integration Tests

Focus on:

- Hook + service behavior
- Repository mocking
- Auth-protected flows
- Workout creation flow

---

# Naming Conventions

## Files

```text
exercise.model.ts
exercise.repository.ts
exercise.service.ts
firestoreExercise.repository.ts
exercise.mapper.ts
useExercises.ts
ExerciseLibraryView.tsx
ExerciseCard.tsx
```

## Components

Use PascalCase:

```text
ExerciseCard
WorkoutExerciseRow
TemplateBlockForm
WeeklyCoverageCard
```

## Hooks

Use camelCase and start with `use`:

```text
useExercises
useTemplateBlocks
useWorkouts
useWeeklyCoverage
```

## Services

Use PascalCase:

```text
ExerciseService
TemplateBlockService
WorkoutService
DashboardService
```

---

# Feature Implementation Order

Recommended order:

1. Project setup
2. Navigation shell
3. Shared UI components
4. Data models
5. Firebase Auth
6. Firestore repositories
7. Exercise Library
8. Template Blocks
9. Workout Planning
10. Workout Mode
11. Progression Logic
12. Dashboard

---

# AI Agent Rules

When generating code for this app, follow these rules:

1. Do not put Firestore calls directly in screen components.
2. Do not create a separate `workoutExercises` collection.
3. Embed `WorkoutExercise[]` inside `Workout`.
4. Use repositories for Firestore access.
5. Use services for business operations.
6. Use hooks to connect UI to services.
7. Use NativeWind classes for styling.
8. Prefer React Native Reusables for shared UI primitives.
9. Keep screens thin.
10. Keep components small and focused.
11. Use TypeScript types from the domain layer.
12. Use Zod for form validation.
13. Archive records instead of hard deleting once they have been used.
14. Do not overbuild analytics in the MVP.
15. Favor simple mobile-first UI over complex desktop-style layouts.

---

# Guiding Principle

Architecture should make the app easier to build, not harder.

Use separation of concerns where it helps:

```text
UI → Hooks → Services → Repositories → Firestore
```

Avoid adding abstractions that do not provide immediate value.

The goal is a maintainable personal app, not an enterprise framework.