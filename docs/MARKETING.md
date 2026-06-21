# Marketing — Feature Arguments & Campaign

> Positioning and copy for Closet Inventory. Audience anchor: **Maya, 26, marketing
> coordinator, iPhone-first, owns too much and wears too little of it.**

---

## The one-liner

**Closet Inventory — your whole wardrobe, organized in the time it takes to forward an email.**

Alt taglines:
- _"You already own it. We'll help you remember."_
- _"Shop your closet before you shop the store."_
- _"The closet app that fills itself in."_

---

## The core insight (the wedge)

Every wardrobe app dies the same way: **manual data entry.** Nobody photographs and
tags 200 garments. Closet Inventory's wedge is that **your closet is already in your
inbox** — every order confirmation is a structured receipt. We turn those into a
catalog automatically. The app is populated before the user does any work.

> **Lead with this in every channel.** It's the only feature competitors can't trivially copy.

---

## Feature → benefit → proof

| Feature | The pitch (benefit) | Proof it's real |
|---|---|---|
| **Gmail import** | "Build your closet from emails you already have — no typing." | Multi-retailer parsers (Zara, Aritzia, Anthropologie, SKIMS, Shein…), tested on real emails |
| **Smart auto-fill** | "We read the receipt: brand, price, size, material, even care instructions." | Material-blend + care + style inferred from product names |
| **Fuzzy search & filters** | "Find 'that black silk top' in two seconds, typos and all." | Fuse.js search; stacked color/category/care filters with live counts |
| **Care guidance** | "Never shrink a sweater again — care steps for every fabric." | Material-to-care engine + attribute rules (whites, denim, delicates) |
| **Cost-per-wear** _(soon)_ | "See which $200 boots were actually a steal — and which were guilt." | `price` already tracked; `wornCount` is a small add |
| **Works like an app** _(soon)_ | "Add to home screen. No App Store, no 30% tax, just open and go." | PWA path; same web stack |

---

## The three campaign pillars

### 1. "Shop your closet" — the anti-overconsumption hook
Maya has bought the same white sneaker **three times.** The emotional promise:
*stop re-buying, start re-discovering.* This pillar carries the sustainability story
(guilt items, cost-per-wear, 🌱 badges) without preaching — it's framed as **saving
money and decision time**, not sacrifice.

> Hero spot: a closet that fills itself from her inbox, then surfaces "you already own 4 white tops."

### 2. "Zero-effort setup" — kill the onboarding cliff
The reason wardrobe apps fail is the empty-state wall. Our demo *is* the pitch:
connect Gmail → watch items pour in. The animated onboarding already dramatizes this
exact moment — **lead the App Store / landing video with it.**

### 3. "It already knows your clothes" — the intelligence angle
Not a spreadsheet with photos — an app that **understands fabric.** It knows linen
wrinkles, that whites bleed, that your blend is 80% cotton. That's the difference
between *storage* and *a stylist*.

---

## Channel copy (ready to use)

**App Store subtitle (30 char):** _Your closet, auto-organized_

**Landing hero:**
> **Your closet is already in your inbox.**
> Connect Gmail and watch Closet Inventory build your wardrobe from order
> confirmations — brand, price, size, fabric, and care, filled in for you.
> _Start free →_

**Social (founder voice):**
> I've bought the same white tee 3 times. Not because I'm careless — because I
> genuinely couldn't remember what I owned. So I built a closet that fills itself
> from my email. First import surfaced 6 white tops. Six. 🫠

**Push notification ideas:**
- "3 new purchases landed in your inbox — import them in one tap?"
- "You've worn this jacket 22 times. Cost per wear: $4.10. Worth it. 🌱"
- "Heads up: you already own 4 similar black tops."

---

## Monetization narrative (for the pitch deck)

**Free → Premium, distributed as a PWA — you keep ~97% (Stripe ~2.9%, no Apple 30%).**

- **Free** earns trust: up to 35 items, manual entry, local storage. Enough to feel value, not enough to live in.
- **Premium** sells the magic: unlimited items, Gmail import, cloud sync across devices, AI camera import. The wedge feature (import) is the paywall — because it's the feature that's *worth* paying for and the one nobody else has.

> The PWA distribution isn't just margin — it's the **"no App Store gatekeeper"**
> story investors like, and it's why the camera/offline features matter beyond UX.

---

## What NOT to lead with

- ❌ "Wardrobe organizer / digital closet" — commodity category, instant bounce.
- ❌ Feature lists — lead with the *inbox* insight, then let features prove it.
- ❌ Sustainability as guilt — frame as **money + time saved**; the planet is the bonus.
