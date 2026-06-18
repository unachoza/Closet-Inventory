# Nothing To Wear — Design System & Governance

> The rules that keep the UI consistent. If you are adding or changing any
> visual element, this document is the contract. Companion to
> [PRODUCT_DESIGN_PRINCIPLES.md](./PRODUCT_DESIGN_PRINCIPLES.md) (the *why*) and
> [`src/tokens.css`](../src/tokens.css) (the *values*).

---

## 1. The one rule everything hangs off

**Component CSS references _semantic_ tokens — never a raw hex, never a primitive color.**

```css
/* ❌ NEVER */
color: #492f28;
background: var(--primitive-neutral-dark-espresso);
border: 1px solid #847057;

/* ✅ ALWAYS */
color: var(--text-primary);
background: var(--bg-surface-primary);
border: 1px solid var(--border-hairline);
```

A raw hex can't theme (light/dark) and hides intent. A primitive color leaks the
palette into 50 files — rename the brand and you're editing everywhere. The
semantic layer is the seam that makes a global restyle a one-file change.

**Nuance — color vs. scale:** the "semantic only" rule is about **color**.
Spacing, radius, and type have no separate semantic alias because the
**primitive scale _is_ the design scale** — referencing `--primitive-spacing-md`
or `--layout-radius-card` is correct and expected. Just never invent an off-scale
value (`padding: 13px`, `border-radius: 7px`).

---

## 2. Token architecture

Three layers, one direction of dependency: **primitive → semantic → component.**

| Layer | Lives in | Example | Who reads it |
|---|---|---|---|
| **Primitive** | `tokens.css` | `--primitive-brand-rose-terracotta: #b28675` | semantic layer only |
| **Semantic** | `tokens.css` | `--bg-surface-brand`, `--text-primary` | **component CSS** |
| **Component** | each feature's `.css` + `primitives.css` | `.btn--primary { background: var(--bg-surface-brand) }` | the app |

- **Light** is the default (`:root`). **Dark** overrides under `[data-theme="dark"]`
  and `prefers-color-scheme: dark`.
- `status` and `typography` are theme-agnostic — defined once.
- `tokens.css` holds **tokens + token-utilities only** (`.editorial-header`,
  `.analytical-body`, `.data-label`). It must **not** hold component rules — a
  generic `.card`/`body` there collides with real components.

### Semantic token quick reference

| Need | Token |
|---|---|
| Page background (fallback behind closet image) | `--bg-canvas` |
| Card / panel background | `--bg-surface-primary` |
| Subtle/secondary surface | `--bg-surface-secondary` |
| Brand / primary action fill | `--bg-surface-brand` |
| Frosted surface over the photo | `--bg-surface-glass` (+ `.glass-canvas`) |
| Body / heading text | `--text-primary` |
| Captions, secondary labels | `--text-secondary` |
| Placeholders, metadata, disabled | `--text-muted` |
| Text on a terracotta fill | `--text-on-brand` |
| Hairline divider / border | `--border-hairline` |
| Success / error / warning / info | `--status-success` / `-error` / `-warning` / `-info` |
| Resting / raised shadow | `--elevation-low` / `--elevation-high` |
| Grid gap / card gap / tight pad | `--layout-gap-grid` / `--layout-gap-card` / `--layout-padding-tight` |
| Button / card radius | `--layout-radius-button` (2px) / `--layout-radius-card` (4px) |
| Spacing ramp | `--primitive-spacing-xs…xxl` (4/8/16/24/32/48) |
| Type sizes | `--primitive-font-size-xs…xl` (12/14/16/20/28) |
| Fonts | `--primitive-font-family-serif` (editorial) / `-sans` (analytical) |

---

## 3. The Golden Rules

1. **Color = semantic token.** No raw hex, no primitive color in component CSS.
2. **Spacing & radius = scale token.** Pull from `--primitive-spacing-*` /
   `--layout-radius-*`. No magic numbers.
3. **Type = the two voices.** Editorial serif (`--primitive-font-family-serif`)
   for headers/moments; analytical sans (`-sans`) for everything functional. Use
   the `.editorial-header` / `.analytical-body` / `.data-label` utilities.
4. **Reuse the primitive, don't re-roll.** A new button is `.btn` + a variant; a
   new chip is `.pill`/`.tag`; a field is `.field` + `.input`. Don't create
   `.my-feature-button`.
5. **One concept, one class.** We currently have 8+ pill classes — that's the bug
   this system fixes. New work adopts the canonical class.
6. **Theme-test every change.** If `--bg-canvas` were near-black, is your text
   still readable? If not, you hardcoded something.
7. **Migration is hard cutover, per file.** When you touch a file, convert its
   references fully to semantic tokens — no permanent alias bridge. Legacy and
   new coexist only until each file is migrated.

---

## 4. Component standards

Canonical, reusable primitives live in [`src/styles/primitives.css`](../src/styles/primitives.css).
Component-specific surfaces (Modal, NavBar) keep their CSS in their own files but
follow the same tokens.

### Buttons — `.btn`
Base `.btn` + one variant. Brand primary is terracotta, not blue.

| Class | Use |
|---|---|
| `.btn .btn--primary` | Primary action (terracotta fill, `--text-on-brand`) |
| `.btn .btn--secondary` | Secondary (outline, hairline border) |
| `.btn .btn--ghost` | Tertiary / low-emphasis (transparent) |
| `.btn .btn--danger` | Destructive (`--status-error`) |
| add `.btn--sm` / `.btn--block` | Size / full-width modifiers |

Don't: hardcode button colors, reuse `--color-primary` (legacy blue), or make a
per-feature button class.

### Cards & surfaces — `.panel`
`.panel` = generic content surface (`--bg-surface-primary`, `--layout-radius-card`,
`--elevation-low`, padded with `--layout-gap-card`). `.panel--glass` floats over
the closet background image via `.glass-canvas`.
*(`.card` is the bespoke ClothesCard — don't repurpose it.)*

### Inputs & forms — `.field` / `.input`
Wrap each control in `.field` (label + control + hint). Controls: `.input`,
`.select`, `.textarea`. Focus ring is brand (`--border-brand`), **not** blue
`#007aff`. Error state: `.field--error` (drives `--status-error` border + hint).

### Modals — `.modal-*`
Use the shared [`Modal`](../src/Components/Modal/Modal.tsx) component
(`.modal-overlay` / `.modal-panel` / `.modal-header` / `.modal-title` /
`.modal-body` / `.modal-footer` / `.modal-close`). Panel is `--bg-surface-primary`,
overlay is a dark scrim + blur, footer actions are `.btn`s. Don't hand-roll
overlays per feature.

### Nav — `.nav-*`
NavBar uses `--bg-surface-primary` (or `.glass-canvas` over the photo),
`--text-primary` links, `--bg-surface-brand` for the active/primary action.
Tap targets ≥ 44×44px (mobile). The "Add Item" primary action is a `.btn--primary`.

### Tags & pills — `.pill` / `.tag`
One chip primitive. `.pill` (neutral metadata: size, category, care, occasion) and
status variants `.pill--success` / `--warning` / `--error` / `--brand`. Small
variant `.pill--sm`. Capitalize, never ALL CAPS. Replaces `.filter-pill`,
`.scm-pill`, `.ob-pill`, `.card-details__*-pill`, etc. as those files migrate.

---

## 5. Theming & the editorial canvas

- Default theme is **light editorial**: alabaster canvas, white surfaces, espresso
  text, terracotta as the focal ~10%.
- The page background is a **closet photograph** (set in `index.css`) with a scrim
  toward `--bg-canvas` for legibility. `--bg-canvas` is the flat fallback, never
  an image inside a color token.
- Content that sits directly over the photo uses `.glass-canvas` (frosted, opaque
  enough to read on — Principle #1, Calm Over Busy).
- Dark mode: `[data-theme="dark"]` is defined and ready; the **toggle** is a
  separate follow-up (don't ship it half-wired).

---

## 6. Migration policy & enforcement

**Policy:** hard cutover, one file at a time. Pick a feature's `.css`, replace its
legacy `var(--White)` / `var(--color-primary)` / raw hex with semantic tokens,
adopt the canonical component classes, verify in the app, move on. The legacy
`:root` in `index.css` stays until the last file leaves it.

**Migration order (high-traffic first):** buttons → pills/tags → inputs/forms →
modals → cards/panels → nav → long-tail features.

**Enforcement (ratchet, not a wall):** a global "no hex / no legacy var" stylelint
rule would throw 300+ errors on day one and block everything — counter to the
plan. Instead scope it: `warning` severity globally, or `error` only on
already-migrated paths, ratcheting the allowed-legacy list down as files convert.
A rule with no teeth won't hold; a rule with full teeth blocks the migration — the
ratchet is the middle.

---

## 7. Principles → tokens

| Principle | How the system expresses it |
|---|---|
| Calm Over Busy | generous spacing ramp; restrained radii; opaque `.glass-canvas` over busy photos |
| Insight Over Raw Data | `.data-label` + `--text-secondary` for metrics; status colors are muted, never neon |
| Editorial Over Corporate | serif `.editorial-header`; terracotta focal accent; photo canvas |
| Soft Luxury | warm low-contrast `--elevation-*` shadows; small radii; restraint over decoration |
| Reduce Decision Fatigue | one button system, one pill, one field — fewer visual decisions everywhere |
