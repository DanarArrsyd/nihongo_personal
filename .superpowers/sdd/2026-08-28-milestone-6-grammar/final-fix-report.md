# Milestone 6 Grammar — Final Fix Report

## Scope completed

1. Related grammar cards retain two columns only from `sm` through below `lg`, then switch to one column at `lg` and above. This prevents two cramped cards from sharing the 19rem detail sidebar.
2. The decorative Grammar seal (`文法`) now declares Japanese language metadata.
3. The no-related-grammar message has direct UI regression coverage.
4. An example with an omitted reading now shows `—` and exposes the accessible label `Bacaan tidak tersedia`; a focused route-level regression test covers it.
5. Learn’s study-section accessible label now accurately includes Vocabulary, Kanji, and Grammar.

## Changed files

- `src/features/grammar/components/RelatedGrammar.jsx`
- `src/features/grammar/GrammarPage.jsx`
- `src/features/grammar/GrammarDetailPage.jsx`
- `src/features/learn/LearnPage.jsx`
- `src/features/grammar/GrammarPage.test.jsx`
- `src/features/grammar/GrammarDetailPage.test.jsx` (new)

## Test-first evidence

The missing-reading regression test was added before the fallback implementation.

Command:

```sh
npm test -- src/features/grammar/GrammarPage.test.jsx src/features/grammar/GrammarDetailPage.test.jsx
```

Initial output (expected red result):

```text
Test Files  1 failed | 1 passed (2)
Tests  1 failed | 7 passed (8)
FAIL ... labels a missing example reading while showing an em dash fallback
Unable to find a label with the text of: Bacaan tidak tersedia
```

After the implementation, the same command produced:

```text
Test Files  2 passed (2)
Tests  8 passed (8)
Duration  1.28s
```

The related-grammar empty-state test exercises the existing empty branch directly with `items={[]}` and verifies both its explanation and the absence of related links.

## Final validation

Command:

```sh
npm test
```

Output:

```text
Test Files  15 passed (15)
Tests  87 passed (87)
Duration  4.23s
```

Command:

```sh
npm run lint
```

Output:

```text
> nihongo-personal@0.1.0 lint
> eslint .
```

Exit code: `0`.

Command:

```sh
npm audit --audit-level=high
```

Output:

```text
found 0 vulnerabilities
```

Exit code: `0`.

Command:

```sh
npm run build
```

Output summary:

```text
> nihongo-personal@0.1.0 build
> vite build

vite v8.2.2 building client environment for production...
✓ 1871 modules transformed.
✓ built in 564ms

PWA v1.3.0
mode      generateSW
precache  5 entries (461.53 KiB)
files generated
  dist/sw.js
  dist/workbox-2fbc6a65.js
```

Exit code: `0`.

`git diff --check` also completed with no output and exit code `0`.

## Visual and accessibility reasoning

The detail layout introduces the 19rem related-grammar sidebar at the `lg` breakpoint (1024px). The related list now has `sm:grid-cols-2 lg:grid-cols-1`: at 1024px, `lg:grid-cols-1` overrides the small-screen two-column declaration, so each related card gets the entire sidebar width. The same override remains active at 1440px, preserving a vertical, readable card stack while the main content expands. Below 1024px the sidebar is no longer a constrained desktop column, so the two-column layout continues to be useful on sufficiently wide stacked layouts.

For a missing reading, the fallback does not assign Japanese language metadata to the non-Japanese em dash. Instead, it supplies a descriptive Indonesian accessible name, while normal Japanese readings keep `lang="ja"`.

## Self-review and concerns

Reviewed the targeted diff against all five findings and ran `git diff --check`. No concerns remain. The responsive verification is breakpoint/class-based in this environment; no browser screenshot harness is installed or required for this narrow CSS override.
