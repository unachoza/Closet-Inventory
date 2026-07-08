# User Stories

> Grounded in the **Maya — "The Overwhelmed Fashionista"** persona (see README).
> Format: _As a … I want … so that …_, each with acceptance criteria. ✅ = shippable
> on `main` today, 🚧 = partially built, 🔲 = roadmap.

---

## Epic 1 — Know what I own

**US-1.1 ✅ Add an item by hand**
_As Maya, I want to add a garment through a guided form so that logging something is quick and I don't skip fields._

- [x] 9-step form with visible progress; back/next navigation
- [x] Photo upload with live preview
- [x] Saved item appears in the grid immediately, with a confirmation toast

**US-1.2 ✅ See everything at a glance**
_As Maya, I want a grid of my whole closet so that I can see what I own without digging through piles._

- [x] Responsive grid (mobile → desktop)
- [x] Card shows photo, name, category, color, size
- [x] Flip/expand a card for composition, care, condition, purchase age

**US-1.3 ✅ Find a specific piece fast**
_As Maya, I want fuzzy search + stacked filters so that I can locate "that black silk top" in seconds._

- [x] Typo-tolerant search by name/brand/material (Fuse.js)
- [x] Filter by color/category/care; OR within a dimension, AND across
- [x] Active-filter pills with individual remove + "Clear all"; live result count

---

## Epic 2 — Stop wasting money

**US-2.1 ✅ Import purchases from email**
_As Maya, I want to import items straight from order-confirmation emails so that I don't retype what I already bought online._

- [x] Gmail OAuth connect
- [x] Advanced search (sender/date/keyword) to find purchase emails
- [x] Detected products render as cards I can import individually or all at once

**US-2.2 ✅ Auto-fill the boring fields**
_As Maya, I want imported items pre-filled with brand, price, color, size, material, and care so that I only review, not type._

- [x] Multi-retailer HTML parsing (Zara, Aritzia, Anthropologie, SKIMS, Shein, …)
- [x] Material blend + care + style attributes inferred from the product name
- [x] Purchase date captured for a factual age ("1.5 years"), condition editable

**US-2.3 🔲 Never buy a duplicate**
_As Maya, I want the app to warn me when I'm about to buy something I already own so that I stop buying my third white sneaker._

- [ ] "Similar items you own" surfaced by category + color + name match
- [ ] (dedup-by-UUID already prevents re-importing the same order)

---

## Epic 3 — Get dressed faster

**US-3.1 🔲 Build an outfit**
_As Maya, I want to drag items onto a canvas so that I can plan outfits without trying everything on._

- [ ] Closet grid (left) + outfit canvas (right), drag-and-drop
- [ ] Weather-aware suggestions for today

**US-3.2 🔲 Pack for a trip**
_As Maya, I want a packing checklist generated from my closet so that I stop over-packing._

- [ ] Trip form (destination, duration, luggage); checklist pulled by occasion tag
- [ ] Carry-on weight running total

---

## Epic 4 — Care & sustainability

**US-4.1 ✅ Know how to wash it**
_As Maya, I want care guidance per item so that I don't ruin my clothes._

- [x] Material-to-care mapping; washing/drying inferred on import
- [x] Attribute rules (whites → wash with like colors; jeans → wash inside out)
- [x] Interactive fabric guide + fiber-journey visualization

**US-4.2 🔲 Feel good, not guilty**
_As Maya, I want cost-per-wear and a "guilt items" view so that I wear what I own and shop smarter._

- [ ] "Log a Wear" (`wornCount`) + cost-per-wear chip
- [ ] Guilt filter: 0 wears + age > 6 months, with donate/sell CTA
- [ ] 🌱 sustainability badge at 20+ wears

---

## Epic 5 — It works the way I live (mobile)

**US-5.1 🔲 Add from my camera roll**
_As Maya, I want to snap or pick a photo so that logging an in-store buy is as fast as an online one._

- [ ] Native photo picker / camera capture (no app store needed)
- [ ] AI vision pre-fills category/color/brand for review

**US-5.2 🔲 Use it like an app**
_As Maya, I want to add it to my home screen and use it offline so that it feels native without an App Store._

- [ ] PWA install (manifest + service worker), full-screen launch
- [ ] Offline view of cached closet; bottom nav + thumb-reachable "Add Item"

---

## Epic 6 — My data, my devices

**US-6.1 ✅ Keep my closet in the cloud**
_As Maya, I want my closet synced so that I see the same wardrobe on my phone and laptop._

- [x] Supabase per-user collection; localStorage as offline cache
- [x] First sign-in seeds the cloud from local; last-write-wins on conflict

**US-6.2 ✅ Take my data with me**
_As Maya, I want to export my closet so that I'm never locked in._

- [x] One-click CSV/JSON export; re-import from file
