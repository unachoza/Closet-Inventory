# E10 · Monetization 🔅

> **Date:** 2026-06-20 · **Pillar:** Business · **Detail:** light (expand when scheduled) · **README:** v1.0 (Stripe)
> **Goal:** Sustainable revenue via a PWA (no App Store / no 30% cut — Stripe ~2.9% + 30¢, keep ~97%).
> Free tier to hook; premium for the differentiated power features.

---

## US-10.1 — Upgrade to premium
_As a power user, I want to subscribe so that I unlock unlimited items, import, sync, and social._
- [ ] Stripe Checkout (hosted) + Customer Portal (self-serve billing)
- [ ] Webhook → Supabase `users.isPremium`
- [ ] Feature gates read `isPremium`

**Ticket stubs:** Stripe Checkout · Customer Portal · webhook→Supabase · gate helper.

## US-10.2 — Free tier that converts
_As a new user, I want a useful free tier so that I try before I buy._
- [ ] Free: up to 30 items, manual entry, local only
- [ ] Premium: unlimited, email/web import, cloud sync, social/borrow, camera import
- [ ] Item-limit enforcement in the closet hook

**Ticket stubs:** free-limit enforcement · upgrade prompts at the gate.

---

## Dependencies
- **E1 (Supabase `isPremium`)** + **E5 (PWA install path)** are hard prerequisites. **Expand when scheduled.**
- Gate the differentiators (E2/E3/E4) behind premium; keep basic inventory free.
