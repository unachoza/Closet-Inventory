# E3 · Frictionless Fill 🔅

> **Date:** 2026-06-20 · **Pillar:** Frictionless Fill · **Detail:** light (expand when scheduled) · **README:** v2.2 / v2.3 / v3.1
> **Goal:** Make filling the closet effortless — more email providers, richer web-sourced detail, and
> camera import — because the category dies at onboarding. Builds on the shipped Gmail + inference pipeline.

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

---

## Known bugs
- `E3-bug.1` **Email preview horizontal scroll** — some Gmail previews don't format nicely and create an awkward horizontal scroll. Attempted `.gmail-container:has(.display-email-preview-panel){max-width:1175px}` but it didn't hold across the board. Needs a robust preview-width / overflow fix in `EmailPreview`.
- _Skip non-clothing / uncategorizable imports (esp. Amazon) is tracked in **E0 US-0.5** (`E0-5.1`), the last open E0 item._

---

## Dependencies
- v2.2 web enrichment + IMAP need **E1 backend**. Camera import needs **E1 image storage** (base64 ceiling).
- **Expand this epic into full stories/tickets when it's scheduled.**
