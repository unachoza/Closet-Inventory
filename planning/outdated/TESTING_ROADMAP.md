# Testing Roadmap (v2) - Written 2026-06-14

> Written 2026-06-14. Supersedes the framing in [TESTING_PLAN.md](./TESTING_PLAN.md),
> whose "Current State" is badly stale (it says 22 test files / ~30%).
> Keep TESTING_PLAN.md's per-file checklists and **Skip list** — they're still good.

---

## Where we actually are

- **70 test files, 919 cases** across **~95 source files.** The unit + integration
  layer is **mature**, not nascent. Most of TESTING_PLAN's Week 1–3 is **already done**:
  utilities, hooks (`useClosetFilters`, `useClosetSort`, `useFuzzySearch`, `useLocalCloset`,
  `usePagination`, `useStockPhoto`, `uselocalStorage`), components (Material*, Toast,
  Pagination, ProgressionTracker, the whole SearchCloset filter/sort/pill set), and
  integration flows (Add Item, Edit, Gmail import, Batch queue, EntireClosetView).
- **Measured coverage (v8, 2026-06-14):**

  | Metric | Coverage |
  |---|---|
  | Statements | **73.05%** |
  | Branches | **81.25%** |
  | Functions | **71%** |
  | Lines | **73.05%** |

  Reproduce with `npx vitest run --coverage` (`@vitest/coverage-v8` is installed).
  ~73% lines against the README's **80% target** — the gap is concentrated in the
  untested files below + the entirely-absent E2E layer, not thinly-spread across the
  tree. Branches (81%) already clear the bar; functions (71%) lag, which tracks with
  whole components/hooks that have no test at all.

- **Lowest-covered files** (statement % from `coverage-final.json`, 2026-06-14):

  _Worth testing — these move the needle and carry real logic:_

  | File | Stmts | Fns | Note |
  |---|---|---|---|
  | `hooks/useAdvancedSearch.tsx` | 31% | 18% | 307-stmt hook, real query/pagination logic — **highest value** |
  | `Features/Form/DatePicker/DatePicker.tsx` | 0% | 0% | ties to the MonthYearPicker known bug (Gap 2) |
  | `GmailImport/.../DesktopAdvancedSearchFlow.tsx` | 3% | 0% | ~312 stmts, form flow |
  | `GmailImport/.../MobileAdvancedSearchFlow.tsx` | 3% | 0% | ~298 stmts, form flow |
  | `GmailImport/.../SearchConfirmationModal.tsx` | 0% | 0% | interaction/confirm |
  | `Components/ClothesCard/Card/Card.tsx` | 43% | 11% | flip / edit / remove interactions |

  _Expected-low — correctly on TESTING_PLAN's **Skip list**, don't chase:_

  | File | Why skipped |
  |---|---|
  | `hooks/useGmailAuth.tsx`, `hooks/useGmailSearch.tsx` | real OAuth → E2E only |
  | `utils/detectColorFromImage.ts` | canvas + CORS → E2E only |
  | `GuideComponents/JourneyC.tsx`, `WeaveDiagram.tsx` | purely visual diagrams |
  | `Content/FiberJourney.ts`, `journeyData.ts`, `*/constants.ts` | data, not logic |
  | `main.tsx`, `Components/Header.tsx` | entry point / static markup |

  > Caveat: `TextileGuildInteractive.tsx` (372 stmts, 3%) is large but mostly
  > presentational — treat as low-priority unless its source-links/tab logic grows.

**So "how much testing is needed?" is not "a lot more unit tests."** The unit floor
is solid. The real gaps are two: **E2E exists but is mobile-only and thin** (no desktop
projects, core flows uncovered), and **the known bugs have no regression tests.**
Everything below is sized to those.

---

## Precondition: get green first

The suite is **1 red + has debug noise**. Fix before adding anything:

- [ ] `CardDetails > full variant renders inferred Style attributes` — failing
      against the in-progress Style render rework (joined vs labeled format). Align
      test ↔ component.
- [ ] Strip leftover `console.log`s (`CardDetails.tsx`, `GmailImport.tsx`, `App.tsx`)
      — they violate the no-console rule and muddy CI output.

A roadmap that assumes green is incomplete; this is step zero.

---

## Gap 1 — E2E exists but is mobile-only (broaden it)

> **Correction:** Playwright **is** installed and running (the README/TESTING_PLAN
> "planned — not installed" claims were stale). As of 2026-06-14: `playwright.config.ts`
> with **2 projects** (Mobile Safari iPhone 13, Mobile Chrome Pixel 7), **3 specs / 14
> tests** (`card-detail-modal.mobile`, `gmail-import.mobile`, `image-compression`),
> run via `npm run test:e2e`. **12 pass, 2 fail** — both the same `card-detail-modal`
> visual-snapshot baseline, stale after the CardDetails rework (re-bless with
> `--update-snapshots` once the modal layout is final; not a functional failure).

The layer is no longer absent — but it's **mobile-only and thin**. The real work is
breadth: desktop browsers and the core flows aren't covered yet.

- [x] Playwright installed + configured (2 mobile projects).
- [x] Mobile: card-detail modal flow, Gmail-import flow, image compression.
- [ ] **Re-bless the 2 stale `card-detail-modal` snapshots** (or fix if the drift is unintended).
- [ ] **Add desktop projects** (Chromium + WebKit desktop) — currently zero desktop coverage.
- [ ] **Add Item** full 9-step flow → item in grid (desktop + iPhone, incl. image upload).
- [ ] **Search + filter + sort** combined — desktop + mobile filter panel open/close.
- [ ] **Gmail OAuth** happy path (Chrome only).
- [ ] **PWA install** (Safari iOS) — once PWA scaffolding lands (currently nothing to test).

> Scope note: E2E is where `useGmailAuth`, `useGmailSearch`, and `detectColorFromImage`
> get exercised — they're correctly on the unit-test **skip list** (real OAuth / canvas + CORS).

---

## Gap 2 — Known bugs with no regression test

Each documented bug should land **with** a failing-then-passing test so it can't silently regress.

- [ ] **Material filter on `MaterialBlend[]`** — item `material: [{material:"cotton",percentage:100}]`
      + "cotton" filter → item appears. (Unit test on `useClosetFilters`.)
- [ ] **Remove doesn't re-render grid** — render Closet w/ 3 items → Remove on card → gone, no reload.
- [ ] **MonthYearPicker fabricated age** — mount emits nothing until the user changes a dropdown;
      selecting month+year commits to `purchaseDate` across edit AND create.
- [ ] **Import-non-clothing** — a product with no category maps to "skipped", not imported.
- [ ] **Title-case CAPS** (Zara/Aritzia/Shein) — name de-cap assertions on real fixtures.

---

## Gap 3 — Meaningful units/components still untested

Reconciled against TESTING_PLAN's **Skip list** (visual diagrams, Modal/Header wrappers,
data/constants/types, `main.tsx`, OAuth hooks, `detectColorFromImage` — all correctly skipped).
The genuinely worthwhile remainder is **~12–15 files**, most modest:

**Logic (worth it — pure, fast):**
- [ ] `utils/dateUtils.ts` (`toAbsoluteDate`) — drives card "Purchased …"; currently untested.
- [ ] `utils/inferSemanticAttributes.ts` — inference path with no test.
- [ ] `utils/importCloset.ts` — counterpart to the tested `exportCloset`; round-trip test.
- [ ] `Features/Onboarding/useOnboarding.tsx` — step/flag state machine.

**Context (light, high leverage):**
- [ ] `context/ViewContext.tsx`, `context/SearchContext.tsx` — provider + reducer behaviour.

**Components (render/interaction, modest value):**
- [ ] `Features/Form/DatePicker/{DatePicker,MonthYearPicker}.tsx` — overlaps Gap 2; do together.
- [ ] `Features/Form/EditContext.tsx` + `TextInput/TextPillField.tsx`.
- [ ] `GmailImport/{EmailList,EmailPreview,ProductCard}.tsx` — partly covered by the
      integration test; add focused unit tests only where logic (not markup) lives.
- [ ] AdvancedSearch `{Desktop,Mobile}AdvancedSearchFlow.tsx`, `SearchConfirmationModal.tsx`.
- [ ] SearchCloset `FilteredCard.tsx`, `FilteredItemGrid.tsx`, `FilterMatchPills.tsx`, `StickyTopBar.tsx`.

---

## How much testing is needed — the honest answer

| Layer | State | Needed |
|---|---|---|
| Utilities | Mature | Fill 3–4 logic gaps (dateUtils, semantic, importCloset, useOnboarding) |
| Hooks | Mature | — (OAuth hooks are E2E-only by design) |
| Components | Good | ~10 render/interaction tests, mostly modest value |
| Integration | Good | Add the bug-regression flows (Gap 2) |
| **E2E** | **Mobile-only (14 tests, 2 mobile projects)** | **Add desktop projects + core flows; biggest breadth gap** |

**Priority:** (0) green + de-noise (incl. re-blessing the 2 stale e2e snapshots) →
(1) regression tests for the known bugs, landed with their fixes → (2) broaden E2E:
desktop projects + the critical-flow set → (3) backfill the ~12–15 unit/component
gaps opportunistically. Chasing the long tail of "every file has a test" is **not**
where the risk is; desktop + real-browser breadth is.

---

## Definition of done

- [ ] Suite green; no `console.log` in source.
- [ ] Every README "Known Bug" has a regression test.
- [x] Playwright installed; mobile flows pass on iPhone 13 + Pixel 7 (2 snapshots need re-blessing).
- [ ] Desktop projects added; critical flows pass on Chromium + WebKit desktop too.
- [ ] Critical flows pass on Chrome + Safari desktop + iPhone Safari
- [x] `@vitest/coverage-v8` installed; baseline measured (73% lines, 2026-06-14).
- [ ] Lines coverage ≥ 80% (README target) and a coverage gate wired into CI.
