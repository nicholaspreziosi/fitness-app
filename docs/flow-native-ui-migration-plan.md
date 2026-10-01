# Flow Native UI Migration Plan

## Objective

Refactor Flow toward a polished, platform-native experience while maintaining a recognizable Flow identity and maximizing shared architecture where it makes sense.

Flow should not attempt to render an identical interface across native and web.

Instead:

- **Native should feel like a native mobile application.**
- **Web should feel like a polished modern web application.**
- Both should share the same Flow design system, component APIs, business logic, state, validation, and domain behavior.

---

# 1. Core Architecture

Use a shared Flow component layer with platform-specific implementations where the experience meaningfully differs.

Conceptually:

    Flow Component API
            │
            ├── Native → NativewindUI
            │              ↓
            │            RNR for gaps
            │              ↓
            │            Expo UI selectively
            │
            └── Web → RNR
                       ↓
                     Custom web components where needed

Both implementations should share:

- Flow design tokens
- Component APIs
- TypeScript types
- Business logic
- Hooks
- State
- Validation
- Domain rules

The underlying component library should be treated as an implementation detail.

Feature screens should primarily consume Flow components rather than importing third-party UI libraries directly.

---

# 2. Platform-Specific Components

Expo/React Native platform resolution should be used when native and web require meaningfully different implementations.

Example:

    components/ui/date-picker/
    ├── DatePicker.native.tsx
    ├── DatePicker.web.tsx
    ├── types.ts
    └── index.ts

Native:

    DatePicker.native.tsx
        → NativewindUI

Web:

    DatePicker.web.tsx
        → RNR / custom web implementation

Feature code should simply use:

    import { DatePicker } from "@/components/ui/date-picker";

The feature should not need to know which implementation is being rendered.

Use the same public component API whenever practical.

---

# 3. Do Not Split Components Unnecessarily

Platform-specific files should only be introduced when they produce a meaningfully better experience.

Simple components may remain shared:

    Button.tsx
    Badge.tsx
    Separator.tsx
    Skeleton.tsx

More platform-dependent components may be split:

    DatePicker.native.tsx
    DatePicker.web.tsx

    ActionSheet.native.tsx
    ActionSheet.web.tsx

    BottomSheet.native.tsx
    BottomSheet.web.tsx

    SearchInput.native.tsx
    SearchInput.web.tsx

Decision rule:

> Share components by default. Split native/web implementations when doing so produces a meaningfully better platform experience.

Avoid maintaining two implementations purely for architectural symmetry.

---

# 4. Native Component Strategy

## NativewindUI — Primary Native UI

NativewindUI should be the primary component source and visual reference for Flow's native application.

Prioritize NativewindUI for experiences such as:

- Date Picker
- Action Sheet
- Profile
- Authentication
- Welcome
- Consent
- Settings
- Lists
- Search
- Forms
- Selection controls
- Native interaction patterns
- Other appropriate mobile components

Use NativewindUI where its implementation fits Flow's requirements and can be sufficiently customized.

NativewindUI should establish the overall native interaction language of Flow.

---

# 5. React Native Reusables — Shared Components + Native Gaps

RNR remains a major part of Flow's architecture.

Use RNR for:

- Shared components that work well across native and web
- Native components missing from NativewindUI
- Components where Flow requires greater source-level control
- Custom Flow-specific components
- Web implementations of native components
- Cross-platform primitives

On native, RNR components should be styled to visually integrate with NativewindUI.

They should NOT retain an obviously shadcn/web-derived appearance simply because they originate from RNR.

Normalize:

- Typography
- Spacing
- Height
- Touch targets
- Radius
- Borders
- Separators
- Icons
- Selected states
- Press states
- Disabled states
- Dark mode

A user should not be able to identify which native components came from NativewindUI and which came from RNR.

---

# 6. Web Component Strategy

RNR should be the primary component foundation for Flow Web.

RNR components should use Flow's shared design tokens and visually relate to the native application without attempting to reproduce native interactions unnecessarily.

Target:

    Native → NativewindUI-inspired native application

    Web → Clean, modern Flow web application

The two platforms should clearly belong to the same product while respecting their respective interaction conventions.

For web:

- Prefer RNR
- Use shared components where appropriate
- Create `.web.tsx` implementations for native-specific interactions
- Use web-appropriate dialogs, menus, popovers, date pickers, etc.
- Do not force iOS interaction patterns onto desktop

---

# 7. Expo UI — Selective Native Enhancement

Expo UI should NOT become Flow's general component library.

Use Expo UI selectively when it provides a meaningfully better native capability than NativewindUI/RNR/custom implementations.

Current example:

## Bottom Sheet

    BottomSheet.native.tsx
        → Expo UI BottomSheet

    BottomSheet.web.tsx
        → RNR/custom Dialog or Drawer

Expo UI may also be considered when it provides meaningful advantages in:

- Native gestures
- Accessibility
- Platform integration
- Performance
- System behavior
- Complex native interactions

Decision rule:

> If NativewindUI or RNR can provide an excellent native experience while allowing greater control, prefer them.

> If Expo provides substantially better native behavior that would be difficult or unnecessary to reproduce, use Expo.

Do not adopt Expo components merely because equivalents exist.

---

# 8. Flow Component Layer

Create/maintain a Flow-owned UI abstraction layer.

Example:

    components/
      ui/
        action-sheet/
        avatar/
        badge/
        bottom-sheet/
        button/
        checkbox/
        date-picker/
        dialog/
        input/
        list-item/
        search-input/
        select/
        separator/
        skeleton/
        switch/

Feature code should generally import:

    "@/components/ui/..."

rather than:

    NativewindUI
    RNR
    Expo UI

directly.

This keeps Flow independent from individual libraries.

For example:

    Flow BottomSheet
            ↓
    Native → Expo UI
    Web    → RNR/custom

while:

    Flow DatePicker
            ↓
    Native → NativewindUI
    Web    → RNR/custom

and:

    Flow Badge
            ↓
    Shared RNR implementation

This architecture allows underlying libraries to be replaced later without rewriting feature screens.

---

# 9. Design Direction

## Visual Philosophy

Target:

- Native
- Clean
- Modern
- Spacious
- Athletic
- Premium
- Familiar
- Slightly branded

Avoid:

- Sterile enterprise UI
- Generic component-library appearance
- Excessive cards
- Excessive borders
- Excessive rounded rectangles
- Web-style forms on native
- Tiny controls
- Dense layouts
- Brand-colored buttons everywhere
- Making every piece of content its own container

The interface should rely heavily on:

- Typography
- Spacing
- Hierarchy
- Native interaction patterns
- Subtle separators
- Thoughtful use of surfaces

rather than excessive card containers.

---

# 10. Flow Branding

Native should not mean generic iOS.

Maintain a subtle but recognizable Flow identity through:

- Brand accent color
- Selected states
- Active navigation states
- Charts
- Analytics
- Progress indicators
- Heat maps
- Focus states
- Small visual details
- Subtle tinted surfaces
- Branded onboarding/authentication
- Flow logo/mark where appropriate

The majority of the interface should remain neutral.

Think:

    90% platform-native neutral UI
    10% Flow identity

Avoid relying on brand-colored primary CTA buttons everywhere.

Primary CTAs can generally remain dark/light depending on theme while the Flow accent appears throughout supporting states.

---

# 11. Shared Design Tokens

NativewindUI should influence the visual language, but Flow should own its design tokens.

Create/normalize semantic tokens for:

## Color

    background
    foreground
    surface
    surfaceElevated
    muted
    mutedForeground
    border
    primary
    primaryForeground
    accent
    accentForeground
    destructive
    success
    warning

Do not hardcode library-specific colors throughout feature code.

## Radius

Use restrained radius.

Suggested baseline:

    sm: 6
    md: 8
    lg: 12
    xl: 16
    full: 999

Reserve large/pill radius for components where it has a purpose.

## Sizing

Increase sizing from the previous implementation where necessary.

General targets:

    Buttons: 44–48px+
    Inputs: 48–56px
    Rows: comfortable native touch height
    Cards: 16–20px internal padding

## Typography

Define consistent styles for:

- Page title
- Section title
- Body
- Secondary body
- Caption
- Button
- Input
- Metric
- Numeric display

Prefer typography and spacing over containers for establishing hierarchy.

---

# 12. Navigation

## Native Push Navigation

Use normal stack navigation for screens representing deeper navigation.

Examples:

- Exercise Detail
- Create Exercise
- Edit Exercise
- Template Detail
- Create Template
- Edit Template
- Workout Detail
- Settings subsections

On native these should use standard native-feeling stack transitions such as slide-from-right where appropriate.

Web should use normal route navigation.

---

# 13. Full-Screen Modal Workflows

Large temporary workflows should use full-screen/modal presentation rather than cramped BottomSheets.

Examples:

- Add Exercises
- Exercise Library Picker
- Add Templates
- Template Library Picker
- Large multi-select experiences
- Complex filtering workflows

These screens should have enough space for:

- Search
- Filters
- Categories
- Results
- Selection states
- Primary action

Native may use a modal/slide-up presentation.

Web may use a dedicated page or appropriately sized dialog depending on context.

---

# 14. Bottom Sheets

Reserve BottomSheets for concise interactions.

Examples:

- Quick actions
- Small option lists
- Status selection
- Contextual actions

Use:

    Native → Expo UI BottomSheet
    Web → RNR/custom equivalent

Do not put complex searchable/filterable libraries inside BottomSheets.

---

# 15. Action Sheets

Use NativewindUI Action Sheet patterns on native for contextual actions.

Examples:

## Workout

- Edit
- Duplicate
- Change Status
- Delete

## Exercise

- Edit
- Delete

## Template

- Edit
- Duplicate
- Delete

Web should use the appropriate RNR menu/dropdown/contextual-action equivalent.

Destructive actions must remain visually distinct and retain confirmation where required.

---

# 16. Date Selection

Use:

    DatePicker.native.tsx
        → NativewindUI

    DatePicker.web.tsx
        → RNR/custom web picker

Apply consistently to:

- Workout dates
- Duplicate workout destination
- Create workout date
- Other date-selection workflows

Do not change workout scheduling/domain logic during this migration.

---

# 17. Authentication

Refactor native authentication around NativewindUI patterns.

Review:

- Login
- Sign Up
- Password Reset
- Loading
- Error states
- Keyboard behavior

Web may use RNR equivalents while sharing:

- Authentication logic
- Firebase integration
- Validation
- Error handling
- Types

Both should clearly belong to Flow without needing identical layouts.

---

# 18. Welcome + Consent

Use NativewindUI Welcome and Consent patterns as the native foundation.

Potential onboarding:

1. Welcome to Flow
2. Brief Flow philosophy
3. Optional training preferences
4. Permissions / consent
5. Enter Flow

Keep onboarding concise.

Core concept:

> Training should adapt to your life — not the other way around.

Avoid creating an extensive questionnaire for MVP.

---

# 19. Profile

Use NativewindUI Profile patterns on native.

Potential sections:

- Account
- Preferences
- Appearance
- Integrations
- Privacy
- Sign Out

Future integrations may include:

- Apple Health
- WHOOP
- Other fitness platforms

Do not implement integrations as part of this UI migration unless separately scoped.

---

# 20. Lists

Move native screens away from excessive card usage when a list provides better hierarchy.

Instead of:

    [ Exercise Card ]

    [ Exercise Card ]

    [ Exercise Card ]

prefer native patterns such as:

    Exercises

    Leg Extension             >
    Pallof Press              >
    Band Walk                 >
    SL Glute Bridge           >

Use:

- Typography
- Spacing
- Separators
- Icons
- Disclosure indicators
- Press states

Cards should remain when content genuinely benefits from visual grouping.

Web may use slightly more structured/card-based layouts where appropriate.

---

# 21. Calendar

Preserve Calendar architecture and domain behavior.

Maintain:

- Week navigation
- Workout cards
- Autosave
- Pull-to-refresh
- Workout movement/editing rules
- Date requirements
- Status rules

Native migration should focus on:

- Native contextual actions
- Better typography
- Larger touch targets
- Cleaner workout presentation
- Reduced unnecessary borders
- Native gestures
- Better spacing
- Platform-appropriate date selection

Do not redesign Calendar business logic during this migration.

---

# 22. Workout

Preserve Workout functionality and autosave behavior.

Improve:

- Exercise rows
- Set controls
- Completion controls
- Input sizing
- Contextual actions
- Native keyboard handling
- Pull-to-refresh
- Visual hierarchy
- One-handed usability

Workout Mode is a high-frequency interaction surface and should receive particular attention to native ergonomics.

---

# 23. Library

Move the native Library toward a searchable native list experience.

Potential structure:

    Library

    [ Search ]

    Exercises    Templates

    Recently Used

    Leg Extension
    Pallof Press
    Band Walk
    ...

Use NativewindUI patterns where appropriate.

Use RNR to fill gaps while matching the same Flow visual language.

Web should use RNR and web-appropriate filtering/search patterns.

---

# 24. Dashboard

Dashboard can retain more custom Flow visual design than utility screens.

Use branding more visibly through:

- Charts
- Muscle heat maps
- Training-category analytics
- Progress indicators
- Completion visualization
- Selected analytics states
- Accent surfaces

Keep the underlying structure relatively neutral so analytics provide the visual interest.

Avoid turning every metric into an independent heavily styled card.

---

# 25. Migration Order

## Phase 1 — Audit + Foundation

- Audit existing component usage.
- Identify NativewindUI native replacements.
- Identify components that should remain shared RNR.
- Identify components requiring `.native.tsx` / `.web.tsx`.
- Identify limited Expo UI use cases.
- Define Flow design tokens.
- Normalize typography.
- Normalize spacing.
- Normalize radius.
- Normalize colors.

## Phase 2 — Flow Component Layer

Establish consistent Flow APIs for:

- Button
- Input
- ListItem
- SearchInput
- DatePicker
- ActionSheet
- BottomSheet
- Dialog
- Select
- Checkbox
- Switch
- Badge
- Separator
- Skeleton

Do not migrate screens until the underlying architecture is clear.

## Phase 3 — Core Platform Components

Implement appropriate platform variants.

Examples:

    DatePicker.native.tsx → NativewindUI
    DatePicker.web.tsx    → RNR/custom

    ActionSheet.native.tsx → NativewindUI
    ActionSheet.web.tsx    → RNR

    BottomSheet.native.tsx → Expo UI
    BottomSheet.web.tsx    → RNR/custom

Verify APIs remain consistent across platforms.

## Phase 4 — Authentication + Onboarding

Migrate:

- Login
- Sign Up
- Password Reset
- Welcome
- Consent
- Profile

## Phase 5 — Library

Migrate:

- Exercise Library
- Template Library
- Search
- Filters
- Exercise selection
- Template selection
- Context actions

## Phase 6 — Calendar

Migrate presentation while preserving behavior.

## Phase 7 — Workout

Migrate:

- Workout listing
- Workout detail
- Workout Mode
- Add Exercise workflow

Prioritize native ergonomics.

## Phase 8 — Dashboard

Apply the new system while allowing greater Flow-specific visual expression.

## Phase 9 — Consistency Audit

Audit for:

- Old component-library styling
- Inconsistent radius
- Inconsistent padding
- Hardcoded colors
- Small touch targets
- Unnecessary borders
- Excessive cards
- Web patterns leaking into native
- Native patterns leaking unnecessarily into web
- Inconsistent icons
- Inconsistent modal behavior
- Light/dark mode inconsistencies

---

# 26. Testing Strategy

The UI migration must not change domain behavior.

For each migration:

1. Run existing tests.
2. Confirm tests pass.
3. Replace/refactor UI implementation.
4. Run tests again.
5. Add interaction tests where new platform behavior warrants them.
6. Manually verify iOS.
7. Verify Android where possible.
8. Verify web.
9. Verify light mode.
10. Verify dark mode.

Specifically test:

- Navigation
- Platform resolution
- Form submission
- Autosave
- Date selection
- Action sheets
- Bottom sheets
- Modal dismissal
- Keyboard behavior
- Pull-to-refresh
- Destructive confirmations
- Loading states
- Empty states
- Error states

Platform-specific components should conform to the same public API wherever practical.

---

# 27. Migration Constraints

Do NOT:

- Rewrite working business logic solely for the UI migration.
- Change Firestore schemas unnecessarily.
- Change workout status/domain rules.
- Remove existing tests.
- Force identical native/web implementations.
- Split every component into native/web versions unnecessarily.
- Replace RNR simply because NativewindUI or Expo provides an equivalent.
- Adopt Expo UI as the general component system.
- Create unnecessary abstractions.
- Allow third-party library imports to spread throughout feature code when a Flow wrapper is appropriate.

Optimize for:

- Native UX
- Web UX
- Source ownership
- Maintainability
- Shared business logic
- Design consistency
- Platform flexibility

---

# 28. Definition of Done

The migration is complete when:

- Native feels intentionally native rather than web-derived.
- NativewindUI establishes the primary native interaction language.
- RNR provides shared primitives, fills native gaps, and forms the primary web component foundation.
- Expo UI is used selectively where its native implementation provides clear value.
- Platform-specific components share consistent Flow APIs.
- Web feels intentionally designed for web rather than like an iOS interface on desktop.
- Native and web clearly belong to the same Flow design system.
- Light and dark modes feel intentional.
- Flow branding remains recognizable but restrained.
- Touch targets and typography are comfortably sized.
- Complex workflows have sufficient screen space.
- Navigation conventions are platform appropriate.
- Existing domain functionality remains unchanged.
- Existing tests continue to pass.
- No major screen feels inconsistent with the rest of Flow.

## Final Architecture Principle

Do not optimize for making native and web identical.

Optimize for:

> **One product. One design system. One domain model. Platform-appropriate experiences.**

Flow should share what benefits from being shared and diverge where doing so creates a better experience.