# E3 · Frictionless Fill ⭐ (THE differentiator)

> **Date:** 2026-06-20 · **Updated:** 2026-06-24 · **Pillar:** Frictionless Fill · **Detail:** full · **README:** v2.2 / v2.3 / v3.1
> **Goal:** Make filling the closet effortless — because the category dies at onboarding.
>
> ### 🏁 Strategic framing (2026-06-24): frictionless upload is the moat
> Everyone already has a closet **in their inbox** — years of online-shopping receipts, not just new purchases.
> NTW's edge is turning that into an online closet with the least possible typing. The wedge has four prongs:
> 1. **Email import** — parse the existing inbox (the back-catalog, not just current orders)
> 2. **Web enrichment** — server-side PDP fetch for material breakdown + true sizing measurements (bump this up — see US-3.2)
> 3. **Manual quick-pills** — tap-to-tag, never type (extend to email-import editing — US-3.8)
> 4. **Chrome extension** — capture at point-of-purchase, like Alta (US-3.9)
> Inference (care-from-material, style-from-name) rides on all four. **This epic outranks its old "light" status.**

---

## US-3.0 — Broaden retailer parser coverage (Gmail) ✅ shipped
_As a Gmail user, I want more of my order emails recognized so that fewer purchases need manual entry._
- [x] 8 new brand-specific strategies (PR #73) — Shopbop/East Dane, Brooks Brothers, SwimOutlet, Lulus, Nike/Jordan, Blush Mark, Nordstrom, plus Savage X Fenty order-level discount handling
- [x] New layout strategies — older Banana Republic/Athleta labeled template, Zara MJML single-column, generic column-header tables (American Apparel, 2015 Zara)
- [x] Sale + `originalPrice` capture (struck/colored/"Was $X"/list-vs-paid) with discount % badge; order-level discounts spread evenly across line items
- [x] `™®©` symbol stripping from product names; all backed by real-email fixtures

## US-3.1 — Import from more inboxes
_As a user on Hotmail/Outlook/Yahoo, I want to import purchases from my provider so that Gmail isn't the only option._
- [ ] Microsoft Graph (Hotmail + Outlook — one integration) ⭐ next priority
- [ ] IMAP service for Yahoo / iCloud / AOL (needs backend — see [DB decision](../BACKEND_DATABASE_DECISION.md#does-the-db-choice-affect-email-provider-expansion-hotmailoutlookyahooicloudprotonaol))
- [ ] (ProtonMail shelved — E2E, no usable web IMAP)

**Ticket stubs:** Microsoft Graph OAuth + parser wiring · server-side IMAP service · provider-picker UI.

## US-3.2 — Richer details from the web ⬆️ PRIORITY-BUMPED
_As a user, I want imported items enriched with full description/material/style/**sizing measurements** so that thin email data gets deep enough for travel weight/volume + fit matching._
- [ ] ⬆️ **Bumped: build right after the database/full-stack (#2), before or alongside mobile.** Reason: server-side PDP queries unlock material breakdown + **true sizing** (retailer size charts: "M = 28\" waist" vs "M = 30\" waist"), which feed `item_materials`, `measurements`, weight/volume (E11/E9), and "fits me" (E12).
- [ ] Server fetch layer past Cloudflare; URL resolver; feed existing `infer*` pipeline
- [ ] Extract: material breakdown, size-chart measurements, country of origin, richer style descriptors → tags
- [ ] Full spec: [EngagingWebForProductDetails.md](../EngagingWebForProductDetails.md) (do the feasibility spike first — Cloudflare 403 verified 2026-06-20)

**Ticket stubs:** see the v2.2 doc's phased plan · size-chart parser → `measurements` · origin extractor → `country_of_origin`.

## US-3.3 — Snap an item (v3.1)
_As Maya, I want to photograph an item so that logging an in-store / second-hand buy is as fast as online._
- [ ] Native photo picker / camera capture (no app store)
- [ ] AI vision pre-fills category/color/brand for review

**Ticket stubs:** `<input capture>` flow · Vision API call · pre-fill review screen.

## US-3.4 — Efficient, transparent Gmail API usage
_As a user, I want imports to reuse cached emails and clearly tell me what they're doing so that I'm not waiting on (or paying for) redundant Gmail API calls._
- [ ] Cache all fetched emails (metadata + bodies); deliberate, careful cache invalidation (don't clear on every visit) — never leave a stale or oversized cache around
- [ ] Distinguish an entirely-new fetch from a filter over cached results; default to cache, only hit the API when the query shape actually changed
- [ ] **Email-list header shows count + date range, not just count.** Today it reads "Found 100 emails." It should read e.g. **"Found 20 emails · May 2018 – Dec 2018"** so it's obvious which tranche the user is viewing. Also surface cached vs. fresh count + last-fetched indicator.

**Ticket stubs:** cache lifecycle + invalidation/TTL audit · cache-key by query signature · new-vs-cached resolver · `E3-4.1` count + date-range + cached/fresh indicator in the email-list header.

## US-3.5 — Cleaner import results
_As Maya, I want obvious non-purchases filtered out and a way to recover anything wrongly skipped so that the import list is trustworthy and reversible._
- [ ] Tighten the default search query to exclude noise senders (Eventbrite, DoorDash, …)
- [ ] "Review skipped" affordance — show what was filtered/uncategorized, with one-tap add-back
- [ ] (The core skip-on-no-category guard lives in **E0 US-0.5** (`E0-5.1`); this story is the surrounding UX.)

**Ticket stubs:** sender denylist on the default query · skipped-items drawer + restore action.

---

## US-3.6 — Correct import form validation
_As Maya, I want the Edit Item form to only require fields that matter at import time so that I can save an item without being forced to fill in price, occasion, or care._
- [ ] Optional in email-import flow: `price`, `occasion`, `care`
- [ ] Mandatory: `name`, `category`, `color`, `size`, `brand`
- [ ] Both single-item and batch-import flows use the relaxed ruleset

**Ticket:** `E3-6.1` Relax `EditItemView` validation when `mode === "create"` from email import; add regression test — _0.5d_

## US-3.7 — Easier material-blend editing
_As Maya, I want editing a material blend to be intuitive so that I can correct fabric percentages without fighting the control._
- [ ] The blend editor is hard to use: the percentage control is disabled at 100% and it's awkward to dial back down to 100% from a multi-fiber blend
- [ ] Rework so adding/removing fibers and redistributing percentages is smooth; 100% single-fiber and multi-fiber states both editable
- [ ] Keep total ≤ 100% invariant clear (e.g. show remaining %, auto-balance, or free-form with validation)

**Ticket:** `E3-7.1` Redesign the material-blend editor interaction in `EditItemView` — _1d_

## US-3.8 — Tap-to-tag on email import (mobile friction killer)
_As Maya importing on my phone, I want to tap pills for occasion / vibe / care / season instead of typing so that ingestion isn't clunky on mobile._
- [ ] Email-import `EditItemView` uses the same **pill-tag inputs** that manual add already has for material/brand/care
- [ ] Dropdown-style fields become tappable tags: care (machine wash · cold · hang dry), occasion, vibe, season
- [ ] No free-typing required for controlled-vocab fields (`tag_vocab`)

**Ticket:** `E3-8.1` Port the manual pill-tag inputs into the email-import edit flow (care/occasion/vibe/season) — _1d_

## US-3.9 — Chrome extension capture (point-of-purchase)
_As a shopper, I want to add an item to my closet straight from a retailer's product page so that current purchases are captured with full detail, no email round-trip (the Alta move)._
- [ ] Browser extension grabs PDP details (name, price, image, material, size chart) on the product page
- [ ] Pushes through the same service layer / inference pipeline as email + manual
- [ ] Reuses US-3.2 web-extraction logic client-side at the source

**Ticket stubs:** extension scaffold · PDP scraper · auth handshake to the app · dedupe against email import.

---

## Shipped
- ✅ **Skip non-clothing / uncategorizable imports** (esp. Amazon) with a reviewable "Include" recovery list, excluded noise senders, and category-keyword cleanup — shipped in **PR #72** (tracked under **E0 US-0.5**).
- ✅ **localStorage security purge** — legacy `gmail_auth_token`, `gmail_email_bodies_cache`, `gmail_emails_cache` keys purged from localStorage on app mount so no sensitive data persists across sessions. PR #76 (XSS hardening) + PR #78 (clean cherry-pick purge on every mount, not just Gmail view). On `main` as of 2026-06-24.

## Known bugs

- `E3-bug.2` **🔴 CRITICAL — "Back to email" forces full re-auth** — After `GmailImport → EmailPreview → Import → EditItemView → "Back to email"`, the user lands on the Gmail connect screen and must redo the entire OAuth flow. Root cause: `gmail_auth_token` moved to memory-only state inside `useGmailAuth` (PR #76 security fix). Token is lost when the Gmail view unmounts; on remount `useGmailAuth` initialises with no token and shows the connect screen. Fix: hold the token in a stable ref or React context at the `AppShell` level so it survives Gmail ↔ Edit navigation without touching localStorage.

- `E3-bug.3` **Bulk import regression — "Skip item" hidden under "Add to Closet"** — In the multi-item import queue, the Skip button is obscured by the Add to Closet button. Layout regression in `EditItemView` batch controls. Needs z-index / stacking / ordering fix.

- `E3-bug.4` **Email fetch loading state not visible** — The "fetching from email" pulse indicator is no longer obvious. Users can't tell if a live Gmail API call is in progress. Restore or improve the loading pulse in `GmailImport` (tracked in US-3.4 cache/fetch UX work).

- `E3-bug.1` ✅ **Email preview mangling / horizontal scroll** — real reporter emails (Shopbop, Express, SwimOutlet, Lulus) showed the real cause: `word-break: break-word` on `.gmail-preview-html` let the browser break text mid-word, collapsing these emails' fixed-width (600–720px) tables to ~1 character per column on narrow viewports (the "one letter per line" mangling). **Fix:** removed `word-break` from `.gmail-preview-html` (emails keep natural column widths) and added explicit `overflow-x: auto` to `.gmail-preview-body` so a genuinely-wide email scrolls horizontally _inside_ the preview box (like Gmail's own preview) — never the panel or page. Verified by screenshot (clean word-wrap) + e2e (`e2e/gmail-preview-overflow.mobile.spec.ts`: word-break contract guard flips red on regression; page-overflow + body-scroll behavioural checks). _(The earlier 2026-06-24 "could not reproduce" pass failed because synthetic wide tables scrolled cleanly; the reporter's `width="100%"` nested tables were the missing ingredient.)_ — _✅ FIXED_
- `E3-bug.2` ⚠️ **Back to email forces full re-auth** — `useGmailAuth` token was lost when the Gmail view unmounted; returning from item edit triggered a full OAuth flow. Fixed by lifting the hook into a session-scoped `GmailAuthProvider` (`src/context/GmailAuthContext.tsx`) mounted above the view switch in `App()`. Token stays memory-only (still dies on reload, not on navigation). Email list + selected preview already survive via the sessionStorage cache + preserved `gmailSourceEmailId`. — _✅ FIXED (P0)_
- `E3-bug.5` **List/preview scroll mismatch** — on "Back to email" (and any selection) the left email list reset to the top while the right preview showed an out-of-view row — confusing, especially on mobile where the preview overlays the list. Fixed: `EmailList` scrolls the selected row into view (`scrollIntoView({ behavior: "smooth", block: "start" })`) so the highlighted list row always matches the open preview. — _✅ FIXED_
- `E3-bug.6` **"Include" skipped-item identity by name** — when an email skipped multiple items sharing a name (e.g. four "The Highwaist"), clicking one Include dropped all same-named items from the drawer but moved only one into the detected list; the leftovers leaked into the next email's detected list (unskip state never reset on email change). Fixed in `EmailPreview`: identity is now the per-email skipped index (not name), and unskip selections reset on `email.id` change. Added a batch **"Include all N items"** button (parallels Import All). — _✅ FIXED_
- `E3-bug.3` **Skip item button hidden under Add to Closet** — on the multi-item edit view from email ingestion, the Skip button was positioned under the submit button. Fixed with `position: initial` — _✅ PR #80_
- `E3-bug.4` **Inbox loading text — pulse scale animation** — added pulse-scale keyframe to the loading indicator text in the inbox view for better perceived feedback — _✅ PR #80_

---

## Dependencies
- v2.2 web enrichment + IMAP need **E1 backend**. Camera import needs **E1 image storage** (base64 ceiling).
- **Expand this epic into full stories/tickets when it's scheduled.**
