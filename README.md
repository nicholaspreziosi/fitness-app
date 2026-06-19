# Flow

Mobile-first fitness, rehab, and performance training app built with React Native, Expo, NativeWind, and Firebase.

## Tech Stack

- React Native + Expo (iOS, Android, Web)
- Expo Router
- TypeScript
- NativeWind + React Native Reusables
- Firebase Auth + Firestore

## Getting Started

```bash
npm install
cp .env.example .env
# Add your Firebase project values to .env
npm run dev
```

### Platform commands

```bash
npm run ios
npm run android
npm run web
```

## Project Structure

```text
app/           Expo Router routes
src/contexts/  Domain, application, and infrastructure layers
src/ui/        Views, components, and hooks
src/lib/       Firebase, query client, theme, constants
docs/          Architecture, plan, and product reference docs
```

## Documentation

- [Architecture](docs/fitness-app-architecture.md)
- [Brand Theme](docs/fitness-app-brand-theme.md)
- [Development Plan](docs/fitness-app-plan.md)
- [Product Outline](docs/fitness-app-product-outline.md)

## Phase 1 Status

Complete. The foundation includes:

- Expo project with TypeScript, Expo Router, NativeWind, and React Native Reusables
- Brand theme tokens configured (light/dark)
- Architecture folder structure scaffolded under `src/contexts/` and `src/ui/`
- Firebase Auth + Firestore initialization with health-check screen
- ESLint and Prettier configured
- Web export verified (`npx expo export --platform web`)

## Phase 2 Status

Complete. The application shell includes:

- Root layout with `SafeAreaProvider`, providers, and tabs-focused stack
- Bottom tab navigation (Dashboard, Planner, Workout, Library, Settings)
- Nested stack navigator per tab with shared header styling
- Thin route files rendering views from `src/ui/`
- Shared layout components (`ScreenContainer`, `PageHeader`, `ThemeToggle`)
- Mobile-first placeholder screens with web max-width container

## Phase 3 Status

Complete. The shared UI component library includes:

- **RNR primitives** in `components/ui/`: Input, Textarea, Label, Select, Checkbox, Switch, Badge, Card, Separator, AlertDialog
- **Shared components** in `src/ui/shared/components/`: SectionHeader, EmptyState, LoadingState, ConfirmDialog, MultiSelect, ComponentDemoSection
- **List cards**: ExerciseCard, TemplateBlockCard, WorkoutCard
- **Brand**: App display name set to **Flow**; components use slate palette and `rounded-lg` surfaces
- Each tab shows a live component demo until feature data is built in later phases

## Phase 4.5 Status

Complete. Testing foundation and data model unit tests:

- Jest + jest-expo configured with `test`, `test:watch`, and `test:coverage` scripts
- Test utilities in `test-utils/` (mock data, dates, `renderWithProviders`)
- Domain models, Zod schemas, constants, archive/delete rules, workout generation, and progression helpers under `src/contexts/`
- 83 unit tests covering schemas, constants, domain rules, and pure helpers (no Firestore or UI)

Next up: Phase 4 — Firestore repositories and persistence.

## Phase 4.6 Status

Complete. Firestore persistence layer with TDD:

- Mappers/converters for Exercise, TemplateBlock, and Workout (embedded `WorkoutExercise[]`)
- Repository interfaces and Firestore implementations scoped to `users/{userId}/...`
- Application services for exercise, template block, and workout CRUD/generation flows
- In-memory Firestore mock for repository tests; mocked repositories for service tests
- Mapper, repository, and service unit tests for exercises, template blocks, workouts, and auth
- 149 unit tests passing (`npm test`)

## Phase 5 Status

Complete. Authentication includes:

- Firebase email/password sign-in and sign-up
- `AuthProvider` + `useAuth` with protected `(auth)` and `(tabs)` route groups
- Branded auth split layout — Flow + description | form on desktop, compact Flow header + form on mobile
- Login and signup screens with friendly error handling
- Sign-out flow in Settings
- Auth foundation tests: provider state/actions, route guards, friendly UI errors, architecture guardrails (`npm test`)
- User-scoped Firestore path helper (`users/{userId}/...`)
