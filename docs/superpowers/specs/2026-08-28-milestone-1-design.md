# Milestone 1 Design

## Scope

Build the minimum React/Vite foundation required by the empty repository, then implement only Milestone 1: the visual system, responsive application shell, navigation, and reusable UI primitives. Dashboard data, learning content, IndexedDB schemas, quizzes, and other later-milestone behavior are excluded.

## Visual Direction

Nihongo Personal should resemble a calm personal study desk rather than a gamified learning product. The fixed project palette drives every surface: warm paper backgrounds, ink-like text, Japanese red for the active path, matcha for supportive status, and restrained gold or blue only where semantically useful.

Geist is the interface typeface and Noto Sans JP is used for Japanese text. A vertical red study seal in the desktop sidebar is the signature element. Fine rules and compact metadata labels make navigation feel like an organized learning index without imitating a generic admin dashboard.

## Application Shell

Desktop uses a persistent sidebar with all six primary destinations. Tablet and mobile use a compact header and an accessible navigation drawer. Main content renders through React Router and each route receives a quiet milestone placeholder rather than invented product data.

Routes:

- `/` — Dashboard
- `/learn` — Learn
- `/practice` — Practice
- `/review` — Review
- `/progress` — Progress
- `/library` — Library

Unknown routes resolve to a focused not-found page with a return action.

## Design-System Components

- `Button`: primary, secondary, and ghost variants with visible focus states.
- `Card`: surface container with optional quiet treatment.
- `Badge`: neutral, accent, and success variants with text labels.
- `ProgressBar`: labelled semantic progress with numeric value exposed accessibly.
- `EmptyState`: clear explanation and optional action.
- `LoadingState`: restrained skeleton treatment, hidden from assistive technology where decorative.

## Responsiveness and Accessibility

The shell is desktop-first and fully usable down to small mobile widths. Navigation uses semantic links and landmarks, the drawer can be dismissed with Escape or its close control, focus indicators remain visible, and reduced-motion preferences disable nonessential transitions. Status is never communicated through color alone.

## Validation

Tests cover route rendering, navigation, mobile drawer behavior, and semantic progress output. Completion requires passing tests, ESLint, a production build, and a development-server smoke check without critical browser console errors.

