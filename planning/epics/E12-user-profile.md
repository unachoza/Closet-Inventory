# E12 · User Profile & Identity

> **Date:** 2026-06-24 · **Pillar:** Foundation (load-bearing for laundry + social) · **Detail:** light–medium · **Est:** ~tbd
> **Goal:** Give the user a profile that serves two masters: **functional** data that tunes their own closet
> (laundry machine, lifestyle) and **social** data that friends see when sharing. Plus the identity question
> that surfaces on ingestion: *whose* closet is this, and *which* location does it live in?
>
> **Single home for profile fields** — E11 (machine/lifestyle) and E4 (visible-to-friends) reference this
> epic; do not redefine profile fields elsewhere.

---

## US-12.1 — Profile data: functional vs. social split
_As a user, I want my profile to separate "what improves my closet" from "what my friends can see" so that personal logistics stay private while I still share a real identity._
- [ ] **Functional (private) profile:** laundry machine config (size: small / standard / double), lifestyle (e.g. workout cadence, # of activewear sets) — feeds E11 forecast
- [ ] **Social (shareable) profile:** display name, photo, whatever friends see on a shared closet
- [ ] Clear boundary: functional data is never exposed in shared views

**Tickets**
- `E12-1.1` `profiles` model split into functional vs. social fields (`@ntw/types` `User`) — _1d_
- `E12-1.2` Profile edit UI (two clearly-labeled sections) — _1.5d_
- `E12-1.3` Laundry machine + lifestyle config (consumed by E11 US-11.4) — _1d_

## US-12.2 — Whose closet is this? (multi-closet ownership) 🔭 (down the line — light)
_As the mom-executive shopping for the whole family, I want items to belong to the right person's closet so that my husband's and kids' purchases don't clutter mine._
- [ ] Closets can represent different people (mine / kid's / partner's)
- [ ] **On email ingestion:** an item can be routed to a closet — or skipped as "not for my closet" (ties into the E3 import skip flow)
- [ ] Switch / view per-person closet

**Ticket stubs:** closet-owner model · ingestion routing/skip ("whose closet?") — cross-links **E3 US-3.5 import skip**.

## US-12.3 — Which location? (multi-home routing) 🔭 (down the line — light)
_As the multi-home user (Sloan), I want a newly imported item assigned to the right location so that my Aspen and summer closets stay accurate._
- [ ] On ingestion (or edit), assign an item's location (Aspen / summer / etc.)
- [ ] Reuses the **E2 location model** (parked) — this is the routing UX on top of it

**Ticket stubs:** location picker on ingestion · reuse E2 `location`. _Keep light; depends on parked E2 location work._

---

## Dependencies
- **E1 (Supabase auth + RLS):** real profiles + the functional/social privacy boundary want server-side enforcement.
- **E11 (laundry):** consumes machine size + lifestyle from US-12.1.
- **E4 (social):** consumes the shareable profile + the visible-vs-functional split.
- **E3 / E2:** multi-closet routing hooks the import skip flow (E3); multi-home routing reuses E2 location.

## Definition of done (epic)
A profile that cleanly separates functional (laundry/lifestyle) from social (shareable) data; machine + lifestyle config feeds E11; multi-closet / multi-home routing is specced (light) for when it's scheduled.
