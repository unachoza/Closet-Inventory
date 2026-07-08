# E12 · User Profile & Identity

> **Date:** 2026-06-24 · **Updated:** 2026-07-08 · **Pillar:** Foundation (load-bearing for locations + laundry + social) · **Detail:** medium · **Est:** ~tbd
> **Goal:** Give the user a profile that serves several masters: **functional** data that tunes their own closet
> (locations, laundry machine, lifestyle, measurements), **social** data that friends see when sharing, and the
> **identity/logistics** questions that surface on ingestion: *whose* closet is this, and *which* location does it
> live in? The profile is built **progressively** — a light first-run, then a hub the user returns to in order to
> unlock features (custom locations, "fits me now," laundry forecast, sharing).
>
> **Single home for profile fields** — E11 (machine/lifestyle), E4 (visible-to-friends), and **E2 Part Une
> (custom / multi-home locations, `P1-6`/`P1-7`)** all reference this epic; do not redefine profile/location
> fields elsewhere. The **location manager UI + onboarding location step live here** (E12); the location *data
> model + card picker/filter* live in [E2 Part Une](../launch/epics/E2-part-une-inventory-truth-status-location.md).

---

## Backend reality check (2026-07-08) — what already exists vs. what custom locations need

Grounding the stories below in the deployed Supabase schema, so the UI work is scoped honestly.

**Already built (no migration needed):**
- **`public.profiles`** — `id` (=auth.users), `display_name`, `photo_url`, `settings jsonb` (reserved for
  functional/private E12 data), `created_at`. Google OAuth pre-fills `display_name`/`photo_url` on first sign-in.
- **`public.locations`** — a **per-user CRUD table**: `id` (uuid), `owner_user_id`, `label` (free text),
  `kind`, `created_at`; RLS `locations_all_own` (owner-scoped). `items.location_id` is a uuid FK to it.
  → **Custom, named locations are already storable.** "Aspen house" = `{ label: "Aspen house", kind: "home" }`.
- **`public.closets`** + **`public.closet_members`** (many-to-many, `role` in owner/editor/stylist/viewer) —
  the multi-closet / co-owned-closet spine already exists. `items.closet_id` is a uuid FK.
- **Client bridge** — [`locationSync.ts`](../../src/services/locationSync.ts) seeds the 4 starter rows per user
  and maps registry-id ↔ row-uuid (E2-sync.1). `kind` CHECK = `home/storage/suitcase/other`
  ([migration 20260707000002](../../supabase/migrations/20260707000002_locations_client_kinds.sql)).

**What custom / multi-home locations actually require:**
1. **Client:** stop reading the static `LOCATIONS` array in [`locations.ts`](../../src/utils/locations.ts); read
   the user's real `locations` rows through context. (Border/status coloring already keys off `kind`, so custom
   rows color correctly for free.)
2. **UI:** a **location manager** (add / rename / delete named locations, each mapped to a `kind`) — see US-12.3.
3. **Onboarding:** a "Where do your clothes live?" step that seeds a *personalized* starter set — see US-12.5.
4. **One small schema add:** `locations.is_primary boolean` (exactly one true per user) so multi-home users can
   mark which named location is "home/neutral" — today "home" is inferred from `kind`, which can't disambiguate
   two homes. _(This is the only migration the custom-location work needs.)_

> **Answer to "does this change the backend?"** — Overwhelmingly it's **client + UI** on a table that's already
> per-user and RLS-scoped. The single backend change is the `is_primary` flag (+ maybe a `sort_order` for
> display). No new table.

---

## Information architecture — the Profile Hub

The profile is **not one big form**. It's a hub of sections, each of which **unlocks a capability** and shows
its own completeness. This lets us keep first-run friction near zero and let power users (Sloane, Diana) go deep.

```
Profile
├── Identity (social)         → display name, photo            [auto-filled from Google]
├── Where my clothes live     → location manager (custom/multi-home)   → unlocks "Where is everything" + location filter
├── My closets / household    → closets I manage (me / kids / partner) → unlocks per-person routing on import
├── My body / measurements    → measurements (in↔cm)                    → unlocks "Fits me now"
├── Laundry & lifestyle       → machine size, activewear cadence        → unlocks laundry forecast (E11)
└── Sharing & borrowers       → who can view my closet, frequent borrowers → feeds E4 lend/share
```

**Completeness meter:** each section reports done/partial/empty; the hub shows "3 of 6 — add measurements to
unlock Fits Me Now." The nudge is **capability-framed** ("unlock X"), never a guilt-trip percentage.

**Progressive disclosure:** first-run captures only what's cheap + high-value (identity is auto; one location).
Everything else is a return visit, prompted contextually (e.g. tapping the empty "Fits me now" filter deep-links
to the measurements section).

---

## US-12.5 — Onboarding & progressive profile building ⭐ (NEW)
_As a new user, I want a short first-run that gets me to a useful closet fast, and a profile I can deepen later,
so that I'm not blocked by a giant form but can still unlock the smart features when I'm ready._

**First-run (minimal, ≤ 2 taps of profile):**
- [ ] Identity is **auto-seeded** from Google (display name + photo) — no input required; editable later.
- [ ] **"Where do your clothes live?"** — the one profile question worth asking up front, because every item
      imported next needs a home. Default a single **Home**; multi-home users add more inline (see US-12.3).
      Single-home users (Maya, Becca) tap "Just home" and move on.
- [ ] Land the user in the closet (import / add) immediately after.

**Progressive deepening (return visits, contextual nudges):**
- [ ] **Profile Hub** with the section cards above + capability-framed completeness.
- [ ] **Contextual deep-links:** an empty "Fits me now" filter → measurements section; an empty laundry
      forecast → machine/lifestyle section; "Lend…" with no saved borrowers → borrowers section.
- [ ] **Never block** closet use on profile completeness — every smart feature degrades gracefully when its
      profile input is absent (border coloring works without measurements, etc.).

**Tickets**
- `E12-5.1` Onboarding flow: identity auto-seed + "Where do your clothes live?" step (writes `locations` rows) — _1.5d_
- `E12-5.2` Profile Hub shell: section cards + capability-framed completeness meter — _1.5d_
- `E12-5.3` Contextual deep-links from empty feature states into the matching profile section — _0.5d_
> **Coordinates with:** onboarding entry point already exists ([`OnboardingSteps.tsx`](../../src/Features/Onboarding/OnboardingSteps.tsx)); extend, don't fork. Location writes reuse `locationSync.ts`.

---

## US-12.3 — Where my clothes live: custom & multi-home locations 🏠 (the E12 home for E2 `P1-6`/`P1-7`)
_As the multi-home user (Sloane) / the Closet Pair / Diana, I want to name my own locations (and say how many I
have) so that "Aspen house," "Lake Como," and "storage unit B" replace the four generic kinds — and each item
lands in the right place._

**What the user does:**
- [ ] **Onboarding step** ("Where do your clothes live?"): pick a count / add named locations, each mapped to a
      `kind` (home · storage · suitcase · other). Persona starter presets offered (Sloane → 4 homes; Maya → 1).
- [ ] **Location manager** (in the Profile Hub): add / rename / delete named locations; set **one primary**
      ("home/neutral"). Deleting a location that has items prompts a reassign step (don't orphan items).
- [ ] Items pick a location from **the user's real list** (edit form + import routing), not the static 4.

**How it maps to the backend (the crux of the question):**
- Each named location = **one row in `public.locations`** (`label`, `kind`, `owner_user_id`, new `is_primary`).
- `items.location_id` → that row's uuid (already wired via `locationSync.ts`).
- Border/status coloring keys off `kind`, so a custom "Aspen house" (kind `home`) or "Storage B" (kind
  `storage`) colors correctly with **no new CSS** — the legend (P1-10) already explains by kind.
- The client switches from the **static registry** to a **per-user locations context** as the source of truth.

**Tickets** _(paired with E2 `P1-6`/`P1-7` — data model + picker there; manager UI + onboarding here)_
- `E12-3.1` Schema: add `locations.is_primary boolean` (exactly one true/user) + optional `sort_order` — _0.25d_ ⚠️ only migration this work needs
- `E12-3.2` Per-user **locations context** (read real rows; replace static `LOCATIONS` as source of truth) — _1d_
- `E12-3.3` **Location manager** UI: list + add / rename / delete + set-primary + reassign-on-delete — _1.5d_
- `E12-3.4` Onboarding "Where do your clothes live?" step w/ persona presets (writes rows) — _1d_ (shared with `E12-5.1`)
- `E12-3.5` Migrate the static 4-kind seed into the per-user store on first run (idempotent) — _0.5d_ (was E2 `P1-7.2`)
> **Reuses the E2 location model** — the card picker/filter (`P1-6.2`, `P1-8`) stay in E2; this story owns the
> *manager screen* and *onboarding capture*. Keep the two in sync via the shared locations context.

---

## US-12.2 — Whose closet is this? Multi-closet / household 👪 (expanded)
_As the mom-executive shopping for the whole family, I want to manage a closet per person (me / partner / each
kid) so that everyone's purchases land in the right place and I can shop/track for all of them._

**What the user does:**
- [ ] **Household model:** create closets that represent different people (Me · Partner · Kid 1 · Kid 2). Each
      is a real `closets` row the user owns (via `closet_members`, role `owner`).
- [ ] **Closet switcher** (top-level UI): pick whose closet you're viewing / adding to. "All" aggregate view for
      the household manager.
- [ ] **On email ingestion:** route each parsed item to a closet — or skip as "not for my closet" (ties into the
      E3 import skip flow). A default closet is pre-selected; the user can override per item.
- [ ] **Closets × locations:** a household spans both axes — Kid's clothes (closet) can be at the Aspen house
      (location). The two FKs on `items` (`closet_id` = whose, `location_id` = where) already model this
      independently; the UI must let both be set without conflating them.

**How it maps to the backend:**
- `public.closets` + `public.closet_members` **already exist** (co-owned, role-based). Multi-closet is mostly a
  **switcher UI + ingestion routing**, not new schema. The `handle_new_user()` trigger already gives each signup
  one default closet; household = the user creating additional closets they own.
- Open question: do kids/partners get their **own auth accounts** (then it's real membership/sharing → E4), or
  are they **manager-owned sub-closets** (rows the manager owns, no separate login)? **Lean manager-owned for
  MVP** (no child accounts); promote to real accounts later via E4.

**Tickets**
- `E12-2.1` Closet switcher UI (view/add scoped to a chosen closet; "All" aggregate) — _1.5d_
- `E12-2.2` Create/rename/delete manager-owned closets (person-labeled) — _1d_
- `E12-2.3` Ingestion routing: per-item "whose closet?" + skip — cross-links **E3 US-3.5 import skip** — _1d_
> 🔭 Down-the-line weight, but the **switcher** is the load-bearing piece; specc'd now so import routing (E3) has
> a target. Child accounts explicitly deferred to E4.

---

## US-12.6 — Viewers & frequent borrowers 👀 (NEW — feeds E4)
_As a user, I want to see who can view my closet and keep a short list of frequent borrowers so that sharing and
the "Lend…" flow are one tap, not a re-entry every time._
- [ ] **Viewers list:** who currently has read access to my closet (the social side of E4 sharing) — view /
      revoke. Read-only grants map to `closet_members` role `viewer`.
- [ ] **Frequent borrowers:** a small saved list of people I lend to (free-text now; app-users later via E4), so
      the lend modal (E2 `US-2.5`) can offer them instead of retyping a name.
- [ ] Both live in the Profile Hub "Sharing & borrowers" section; neither is required for MVP closet use.

**Tickets**
- `E12-6.1` Viewers list (read/revoke `closet_members` viewer grants) — _1d_ (with E4)
- `E12-6.2` Frequent-borrowers store + surface in the lend modal (E2 `E2-5.1`) — _0.5d_
> **Coordinates with E4 (social/lending)** — the *trust model* is E4; this is just the profile-side surface.

---

## US-12.1 — Profile data: functional vs. social split
_As a user, I want my profile to separate "what improves my closet" from "what my friends can see" so that
personal logistics stay private while I still share a real identity._
- [ ] **Functional (private) profile:** laundry machine config (size: small / standard / double), lifestyle
      (e.g. workout cadence, # of activewear sets) — feeds E11 forecast. Stored in `profiles.settings jsonb`.
- [ ] **Social (shareable) profile:** display name, photo, whatever friends see on a shared closet.
- [ ] Clear boundary: functional data is **never** exposed in shared views (enforced server-side via RLS /
      column selection, not just client hiding).

**Tickets**
- `E12-1.1` `profiles` model split into functional vs. social fields (`@ntw/types` `User`); shape the
  `settings jsonb` (machine, lifestyle, measurements) — _1d_
- `E12-1.2` Profile edit UI (two clearly-labeled sections, inside the Hub) — _1.5d_
- `E12-1.3` Laundry machine + lifestyle config (consumed by E11 US-11.4) — _1d_

## US-12.4 — My measurements → "what fits me right now"
_As Maya whose body has changed, I want my measurements on my profile so that I can filter to what actually fits
me now — and keep pieces that don't fit yet for later._
- [ ] Body measurements on profile (waist/chest/hips/etc.), **same unit model as item `measurements`** (in↔cm).
- [ ] **"Fits me now"** filter: match profile measurements vs. `items.measurements` within a tolerance band.
- [ ] Items that don't fit now stay in the closet, just filtered out of "wearable now."
- [ ] Personas: lifestyle change, pre-baby wardrobe, weight change (the Diana "body gap").

**Tickets**
- `E12-4.1` Profile body-measurements (reuse measurement model) — _0.5d_
- `E12-4.2` "Fits me now" filter w/ tolerance per category (waist for bottoms, chest for tops) — _1d_
> Tolerance algorithm: see [DATA_MODEL](../backend/DATA_MODEL_2026-06-24.md) open Q6. Item measurements come from
> E2 US-2.8 + web enrichment (E3 US-3.2).

---

## Suggested build order (for the custom-locations + filters goal)

The user's immediate goal is **custom locations + location/status filters**. Minimal critical path:

1. `E12-3.1` add `locations.is_primary` (the only migration) →
2. `E12-3.2` per-user **locations context** (real rows replace the static registry) →
3. `E12-3.3` **location manager** UI + `E12-3.4`/`E12-5.1` onboarding capture →
4. E2 `P1-6.2` card **picker** reads the context → E2 `P1-8` **status + location filter dimensions**.

Everything else in E12 (measurements, machine/lifestyle, multi-closet, viewers) is independent and can follow.

---

## Dependencies
- **E1 (Supabase auth + RLS):** real profiles + the functional/social privacy boundary want server-side
  enforcement. `profiles`, `locations`, `closets`/`closet_members` tables + owner-scoped RLS already deployed.
- **E2 Part Une (`P1-6`/`P1-7`/`P1-8`):** the location *model + card picker + filter*; E12 owns the *manager UI +
  onboarding*. Keep in sync via the shared per-user locations context.
- **E11 (laundry):** consumes machine size + lifestyle from US-12.1.
- **E4 (social):** consumes the shareable profile, the visible-vs-functional split, viewers, and (later) real
  borrower accounts.
- **E3 (import):** multi-closet routing hooks the import skip flow; multi-home routing reuses the location context.

## Definition of done (epic)
A **progressively built** profile: light first-run (auto identity + one location), then a **Profile Hub** whose
sections each unlock a capability. Custom / multi-home **locations** are user-managed rows (the only new schema is
`is_primary`); **household closets** route imports per person; **measurements** drive "fits me now"; **machine +
lifestyle** feed E11; **viewers + frequent borrowers** feed E4 — all with the functional/social privacy boundary
enforced server-side.
