# E4 Part Une — View a Friend's Closet (Share-Link MVP)

> **Date:** 2026-07-10 · **Parent epic:** [E4 · Shared & Social](./E4-shared-social.md) (US-4.1, US-4.4) ·
> **Status:** 📐 design — not scheduled; launch scope is unchanged (this is designed now, built post-Block-C)
> **Mockups:** [planning/design/mockups/friend-view-flow.html](../design/mockups/friend-view-flow.html)
> **Goal:** The first slice of Shared & Social: an owner texts a link, a friend who has **never seen NTW**
> lands on a branded page, peeks at a teaser of the closet, and signs in with Google to keep viewing —
> converting a borrow-adjacent conversation into a new account. **View-only. No lending yet** (that's
> [Part Deux](./E4-part-deux-simple-lending.md)).

---

## Why this slice first (user acquisition)

Sharing is NTW's only native growth loop. Every "can I see your closet?" text is a warm, personal referral —
the recipient arrives with a reason to care (their friend's actual wardrobe) instead of a marketing pitch. The
share landing page is deliberately designed as the **first brand touch**: it must sell NTW in the 3 seconds
before the closet renders. Decisions locked 2026-07-10:

| Decision | Locked choice |
|---|---|
| Access model | **Hybrid** — tokenized link grants an anonymous **2-hour teaser**; Google sign-in converts it to a **durable, revocable viewer grant** |
| Teaser scope | **Limited peek** — capped slice (12 items, owner-curatable), sign-in unlocks the full closet |
| Privacy default | `isPrivate` items **never** appear anywhere; **intimates category is `isPrivate` by default** (per US-4.4) |
| Mockup branding | Net-new, derived from app tokens (`src/tokens.css`: alabaster canvas, terracotta brand, espresso text, Lora/DM Sans) — seed of the future marketing site |

---

## US-4.1a — Text a friend my closet
_As Arianna (Closet Pair), I want to text MJ a link to my closet so that she can see what I own before she asks to borrow — without me photographing anything or her installing anything._

- [ ] "Share my closet" action generates a tokenized link + native share sheet (iMessage/WhatsApp first)
- [ ] Link preview (OG tags) shows NTW branding + "Arianna shared her closet with you" — not a raw URL
- [ ] Owner can see active links and revoke any of them at any time
- [ ] Owner can pick the 12 teaser items (default: 12 most recently added visible items)

## US-4.1b — Peek without an account
_As MJ, who has never heard of NTW, I want to tap the link and immediately see Arianna's closet so that I don't have to decide whether to trust an app before I've seen the value._

- [ ] Landing page renders with **zero auth**: brand mark, owner name/avatar, item count, expiry chip
- [ ] Teaser grid: 12 visible items render fully; the rest render as blurred/locked placeholders with a count ("+ 43 more")
- [ ] `isPrivate` items are excluded **server-side** — they are not in the payload, not merely hidden (no "blur = still in the DOM" leak)
- [ ] Link expires **2 hours** after first open (not after creation — a link texted at night shouldn't be dead by morning); expired page offers "Ask {owner} for a new link" + a sign-up CTA
- [ ] Clear viewer framing: "You're viewing {owner}'s closet · view only"

## US-4.1c — Sign in to keep it
_As MJ, once I've seen the closet, I want one tap to keep access so that I can come back before the trip to plan borrowing._

- [ ] Single CTA: **Continue with Google** (matches the app's Google-only auth posture)
- [ ] On sign-in, the anonymous session converts to a **viewer grant** (`closet_viewers` row) — durable until revoked
- [ ] Post-sign-in: full visible closet (still excluding `isPrivate`), plus the onboarding hook: "Start your own closet — import it from Gmail in minutes"
- [ ] PWA install prompt surfaced *after* the value moment (viewing the full closet), not on landing
- [ ] Owner gets a notification: "MJ is now viewing your closet" with a one-tap revoke

## US-4.1d — Owner control (trust & safety)
_As the owner, I want to see and revoke everything so that sharing never feels like a leak._

- [ ] "Sharing" panel: active links (created/expires/opens), current viewers, per-viewer revoke
- [ ] First-share **privacy review** interstitial: "{n} intimates items are private by default · review what's visible" with a preview-as-viewer mode
- [ ] Revoking a viewer or link takes effect on next request (no cached grant)

---

## Key exchange & security model

**The link is a capability token for the teaser only; durable access always rides on auth + RLS.**

```
share_links
  id            uuid PK
  closet_id     uuid FK → closets
  token_hash    text        -- SHA-256 of the URL token; raw token never stored
  teaser_item_ids uuid[]    -- owner-curated cap (≤12); null = 12 most recent visible
  first_opened_at timestamptz -- null until first open; expiry = first_opened_at + 2h
  created_at / revoked_at   timestamptz

closet_viewers
  closet_id     uuid FK → closets
  viewer_id     uuid FK → auth.users
  granted_via   uuid FK → share_links   -- provenance
  created_at / revoked_at  timestamptz
  PK (closet_id, viewer_id)
```

- **Anonymous teaser reads go through an Edge Function** (`share-view`), not client-side Supabase queries:
  the function validates the token hash + expiry + revocation, then returns a **filtered projection** of the
  teaser items (name, photo, category, brand — no purchase price, no locations, no wear data). RLS is never
  opened to `anon`; the function uses the service role and does the filtering itself. Same deployment pattern
  as the existing `delete-user-account` function.
- **Signed-in viewer reads use RLS**: `items` SELECT policy extends to
  `EXISTS (closet_viewers cv WHERE cv.closet_id = items.closet_id AND cv.viewer_id = auth.uid() AND cv.revoked_at IS NULL) AND NOT items.is_private`.
  Same RLS extension pattern applies to `item_photos` (photos of private items must not leak via the photos table).
- **Token hygiene:** 128-bit random token, transmitted only in the URL fragment-free path, stored hashed;
  Edge Function rate-limits by IP + token to blunt enumeration; opening an expired/revoked link returns the
  same neutral page as an invalid one (no oracle).
- **`is_private` is enforced in three places** (defense in depth): excluded from the Edge Function projection,
  excluded by the viewer RLS policy, and excluded from any viewer-facing UI state. Intimates default per
  US-4.4 (`E4-4.1`), applied by migration backfill when the column ships.
- **What a viewer never sees**, even signed-in: private items, purchase prices, locations, wear history,
  sync/status internals. The viewer projection is a *lookbook*, not the owner's operational dashboard.

**Why not signed URLs / JWT-only?** A DB row per link is what makes *revocation* and the owner's audit view
("this link was opened 3 times") possible — both are US-4.1d requirements. Stateless tokens can't be revoked.

---

## Flow (mirrors the mockups)

1. **Owner: share** — Closet → "Share" → privacy review (first time) → link created → native share sheet → iMessage
2. **Friend: cold-start landing** — brand hero, "{owner} shared her closet with you", peek CTA, 2h expiry chip
3. **Friend: teaser** — 12 real cards + locked overflow tiles, "Continue with Google to see all {n}" banner, "private items are never shown" reassurance line
4. **Friend: sign in** — Google one-tap → viewer grant created → full visible closet, viewer badge, no edit affordances
5. **Friend: convert** — post-view hooks: "Start your own closet (Gmail import)" + PWA install prompt
6. **Owner: manage** — Sharing panel: links, viewers, opens, revoke; "preview as viewer"

## Tickets (estimates assume E1 RLS patterns + Edge Function deploy pipeline already proven)

- `E4-1.5` `share_links` + `closet_viewers` tables, RLS policies (viewer SELECT + `is_private` exclusion), migration — _1.5d_ (subsumes half of `E4-1.1`)
- `E4-1.6` `share-view` Edge Function: token validation, expiry-on-first-open, teaser projection, rate limiting — _1.5d_
- `E4-1.7` Share flow UI: share action + link creation, native share sheet, OG meta for link unfurl, privacy-review interstitial — _1.5d_
- `E4-1.8` Public routes: landing + teaser grid + expired/invalid page (these are the app's first unauthenticated routes — needs router split from the authed shell) — _2d_
- `E4-1.9` Sign-in conversion: Google auth on the public route → grant creation → full viewer closet view (read-only closet reusing Card/grid components with a `viewerMode` projection) — _2d_
- `E4-1.10` Owner sharing panel: links/viewers list, revoke, preview-as-viewer — _1.5d_
- `E4-1.11` (prereq, from parent epic) `E4-4.1` `isPrivate` column + intimates backfill + per-item toggle — _1d incl. UI_

**Total ≈ 10–11 dev-days.** Cut line for a first ship: `E4-1.5/1.6/1.7/1.8` (share + anonymous teaser only,
sign-in-to-keep as fast-follow) ≈ 6.5d.

## Dependencies & risks

- **E1 (hard):** RLS, `closets`/`items` schema, Edge Function deploy pipeline (proven by `delete-user-account`).
- **`is_private` must ship before or with the first share** — retrofitting privacy after links exist is a leak.
- **Unauthenticated routes are new** — today the app assumes an authed/local shell everywhere; the public
  landing/teaser needs a router boundary that never mounts sync/Gmail providers (keep the anonymous bundle lean;
  helps the E5-follow.1 code-split too).
- **OG link unfurl requires a real deployed domain** (Block 0 dependency); design assumes `ntw.app/c/{token}` shape.
- Photos: teaser serves `primary_photo_url` via short-lived signed Storage URLs minted by the Edge Function —
  public buckets stay closed.
