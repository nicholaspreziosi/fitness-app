# UI Theme & Design Guidelines

## Design Philosophy

The application should feel:

- Clean
- Athletic
- Focused
- Premium
- Minimal

The UI should balance fitness, rehab, and performance training without feeling like:

- A bodybuilding app
- A CrossFit app
- A medical application
- A complex analytics dashboard

Prioritize usability, clarity, and consistency over visual effects.

---

# Visual Inspiration

The overall aesthetic should resemble:

- Linear
- Apple Fitness
- Whoop
- Notion

Avoid:

- Excessive gradients
- Glassmorphism
- Neumorphism
- Heavy shadows
- Bright neon colors

---

# Color Palette

Use a slate-based neutral palette for backgrounds, text, borders, and muted UI.

## Light Mode

```css
--background: #F8FAFC; /* slate-50 */
--foreground: #0F172A; /* slate-900 */

--card: #FFFFFF;
--card-foreground: #0F172A; /* slate-900 */

--muted: #F1F5F9; /* slate-100 */
--muted-foreground: #64748B; /* slate-500 */

--border: #E2E8F0; /* slate-200 */

--primary: #2563EB; /* blue-600 */
--primary-foreground: #FFFFFF;

--success: #16A34A; /* green-600 */
--warning: #D97706; /* amber-600 */
--danger: #DC2626; /* red-600 */
```

## Dark Mode

```css
--background: #020617; /* slate-950 */
--foreground: #F8FAFC; /* slate-50 */

--card: #0F172A; /* slate-900 */
--card-foreground: #F8FAFC; /* slate-50 */

--muted: #1E293B; /* slate-800 */
--muted-foreground: #94A3B8; /* slate-400 */

--border: #334155; /* slate-700 */

--primary: #3B82F6; /* blue-500 */
--primary-foreground: #FFFFFF;

--success: #22C55E; /* green-500 */
--warning: #F59E0B; /* amber-500 */
--danger: #EF4444; /* red-500 */
```

---

# Color Usage

## Primary Blue

Use for:

- Primary actions
- Active states
- Selected items
- Navigation highlights
- Progress indicators

## Success Green

Use for:

- Completed exercises
- Completed workouts
- Positive confirmations

## Warning Amber

Use for:

- Missing categories
- Incomplete workouts
- Attention states

## Danger Red

Use for:

- Destructive actions
- Delete confirmations
- Error states

---

# Typography

## Font

Prefer native system fonts.

### iOS

- SF Pro

### Android

- Roboto

### Web

- Inter

If a single cross-platform font is desired:

- Inter

---

# Border Radius

Use consistent border radius values.

## Radius Scale

```text
none: 0px
sm:   6px
md:   8px
lg:   12px
xl:   16px
2xl:  20px
full: 9999px
```

## Standard Components

Use NativeWind radius utilities.

### Cards

```text
rounded-lg
```

### Inputs

```text
rounded-lg
```

### Buttons

```text
rounded-lg
```

### Badges / Pills

```text
rounded-full
```

### Modals / Dialogs

```text
rounded-xl
```


### Bottom Sheets / Mobile Drawers

```text
rounded-t-2xl
```


Avoid:

- Overusing `rounded-2xl`
- Mixing many radius values on the same screen
- Using sharp `rounded-none` unless there is a specific layout reason

---

# Spacing

Use NativeWind / Tailwind’s default spacing scale.

Prefer common spacing values:

```text
p-2
p-3
p-4
p-6

gap-2
gap-3
gap-4
gap-6

space-y-2
space-y-3
space-y-4
space-y-6
```

Avoid arbitrary spacing values unless there is a specific layout need.

---

# Borders & Shadows

Prefer borders and subtle NativeWind shadow utilities.

Recommended:

```text
border
border-border
shadow-sm
shadow
```

Avoid:

```text
shadow-lg
shadow-xl
custom shadow values
multiple nested shadows
```

Use borders as the main surface separator.

Use shadows sparingly for:

- Modals
- Bottom sheets
- Floating action buttons
- Elevated active states

---

# Icons

Use Lucide icons.

Examples:

- Dashboard → Chart
- Planner → Calendar
- Workout → Check Circle
- Library → Dumbbell
- Settings → Settings

Icons should support content, not dominate it.

---

# Cards

Cards are the primary surface throughout the application.

Cards should generally use:

```text
rounded-lg
border
border-border
bg-card
p-4
```

Optional elevation:

```text
shadow-sm
```

Avoid excessive nesting and stacked card-on-card layouts.

---

# Forms

Prefer simple forms.

Guidelines:

- Labels above inputs
- Clear validation states
- Consistent spacing
- Large touch targets
- Mobile-first layouts

Recommended input pattern:

```text
rounded-lg
border
border-border
bg-background
px-3
py-3
```

---

# Dashboard Design

The dashboard should feel like a productivity dashboard rather than a fitness analytics platform.

Focus on:

- Workout completion
- Weekly coverage
- Missing training areas
- Recent activity

Avoid excessive charts and metrics in the MVP.

---

# Workout Experience

The workout screen is the application's most important experience.

Prioritize:

- Fast interaction
- Minimal taps
- Large touch targets
- Clear completion states

Status colors:

```text
Planned      → Neutral
Active       → Blue
Completed    → Green
Attention    → Amber
```

The experience should feel closer to a checklist than a spreadsheet.

---

# Accessibility

- Support light and dark mode
- Maintain sufficient contrast ratios
- Use semantic labels
- Support screen readers where possible
- Ensure touch targets are at least 44px

---

# Guiding Principle

When making design decisions, favor:

```text
Clarity > Creativity
Consistency > Variety
Usability > Visual Effects
```

The application should feel fast, focused, and effortless to use during training.