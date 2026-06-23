# E3 · Frictionless Fill 🔅

> **Date:** 2026-06-20 · **Pillar:** Frictionless Fill · **Detail:** light (expand when scheduled) · **README:** v2.2 / v2.3 / v3.1
> **Goal:** Make filling the closet effortless — more email providers, richer web-sourced detail, and
> camera import — because the category dies at onboarding. Builds on the shipped Gmail + inference pipeline.

---

## US-3.1 — Import from more inboxes
_As a user on Hotmail/Outlook/Yahoo, I want to import purchases from my provider so that Gmail isn't the only option._
- [ ] Microsoft Graph (Hotmail + Outlook — one integration) ⭐ next priority
- [ ] IMAP service for Yahoo / iCloud / AOL (needs backend — see [DB decision](../BACKEND_DATABASE_DECISION.md#does-the-db-choice-affect-email-provider-expansion-hotmailoutlookyahooicloudprotonaol))
- [ ] (ProtonMail shelved — E2E, no usable web IMAP)

**Ticket stubs:** Microsoft Graph OAuth + parser wiring · server-side IMAP service · provider-picker UI.

## US-3.2 — Richer details from the web (v2.2)
_As a user, I want imported items enriched with full description/material/style so that thin email data gets deep._
- [ ] Server fetch layer past Cloudflare; URL resolver; feed existing `infer*` pipeline
- [ ] Full spec: [EngagingWebForProductDetails.md](../EngagingWebForProductDetails.md) (do the feasibility spike first)

**Ticket stubs:** see the v2.2 doc's phased plan.

## US-3.3 — Snap an item (v3.1)
_As Maya, I want to photograph an item so that logging an in-store / second-hand buy is as fast as online._
- [ ] Native photo picker / camera capture (no app store)
- [ ] AI vision pre-fills category/color/brand for review

**Ticket stubs:** `<input capture>` flow · Vision API call · pre-fill review screen.

## US-3.4 — Efficient, transparent Gmail API usage
_As a user, I want imports to reuse cached emails and clearly tell me what they're doing so that I'm not waiting on (or paying for) redundant Gmail API calls._
- [ ] Cache all fetched emails (metadata + bodies) and clear the cache deliberately — never leave a stale or oversized cache around
- [ ] Make a brand-new fetch visibly distinct from a filter over cached results; prefer the cache and minimize live API calls wherever possible
- [ ] More descriptive UI about what was fetched — date range of emails, cached vs. fresh count, last-fetched indicator

**Ticket stubs:** cache lifecycle + invalidation/TTL audit · fetch-vs-cache mode indicator + cache-first routing · date-range / cached-count status UI in the search bar.

---

## Shipped
- ✅ **Skip non-clothing / uncategorizable imports** (esp. Amazon) with a reviewable "Include" recovery list, excluded noise senders, and category-keyword cleanup — shipped in **PR #72** (tracked under **E0 US-0.5**).

## Known bugs
- `E3-bug.1` **Email preview horizontal scroll** — some Gmail previews don't format nicely and create an awkward horizontal scroll. Attempted `.gmail-container:has(.display-email-preview-panel){max-width:1175px}` but it didn't hold across the board. Needs a robust preview-width / overflow fix in `EmailPreview`.

---

## Dependencies
- v2.2 web enrichment + IMAP need **E1 backend**. Camera import needs **E1 image storage** (base64 ceiling).
- **Expand this epic into full stories/tickets when it's scheduled.**
