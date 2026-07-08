# Figma Make prompt — Nothing To Wear · Profile onboarding, info gathering & profile views

> Paste the block below into Figma Make. It's written to produce a coherent multi-screen flow, not one screen.
> Context doc: [E12 · User Profile](../epics/E12-user-profile.md). Keep terminology in sync with that epic.

---

## The prompt

## Goal 
Primary UX goal: Users should feel they are organizing a physical wardrobe, not creating a social profile. Every screen should reduce friction to inventory, location, and garment logistics. Social features are secondary and never dominate the experience.

Design a mobile-first onboarding and profile system for **Nothing To Wear**, a personal wardrobe app (PWA) that
helps people track what they own, where each item is, what state it's in (clean/dirty/at cleaner/traveling/on
loan), and eventually what fits and who can borrow it. Aesthetic: warm, editorial, calm — a terracotta/clay
accent on soft warm-neutral surfaces, generous whitespace, flat (no heavy shadows or gradients), rounded 12px
cards, sentence case everywhere, friendly but unfussy copy. Two type weights only (regular + medium). Design for
a ~390px phone width; also provide tablet/desktop framing for the profile hub.

Build these screens as one connected flow:

### A. Onboarding (first run — keep it short, ≤ 2 real inputs)
1. **Welcome / value** — one line on what the app does, "Continue with Google" (identity auto-fills name + photo).
2. **"Where do your clothes live?"** — the single question worth asking up front. Show a list of location cards
   the user can toggle/add: a pre-selected **Home** (marked "primary · no border"), plus optional **Storage**,
   **Suitcase**, and an **"Name your own"** action that opens a small add-sheet (label text field + a kind
   picker: home / storage / suitcase / other). Multi-home users add several ("Nolita apartment", "Hamptons
   house"). A **"Just home"** shortcut for single-home users. Progress indicator "Step 1 of 2".
3. **Ready** — confirmation that lands them in their closet (import or add first item).

### B. Profile Hub (the home users return to — progressive, not one big form)
A hub of **section cards**, each of which *unlocks a capability* and shows its own state (Done / partial / empty).
Header shows avatar + name + a capability-framed completeness line ("3 of 6 — add measurements to unlock Fits me
now"). Sections:
- **Identity** (social) — name, photo; "from Google", editable.
- **Where my clothes live** → unlocks "Where is everything" + location filter. Subtitle shows count ("4 locations").
- **My closets / household** → unlocks per-person import routing. Subtitle lists people ("Me · Partner · 2 kids").
- **My measurements** → unlocks "Fits me now". Empty state reads "Unlocks Fits me now".
- **Laundry and lifestyle** → unlocks laundry forecast (machine size, activewear cadence).
- **Sharing and borrowers** → who can view my closet + frequent borrowers.
Empty sections are an **invitation** ("Add measurements → unlock Fits me now"), never a guilt percentage.

### C. Info-gathering detail screens (one per section)
- **Location manager** — list of the user's named locations. Each row: a small **swatch that encodes its kind by
  border-style** (home = solid neutral, storage = solid, suitcase = dashed, other = dotted) + label + kind +
  overflow menu (rename / delete / set as primary). "Add a location" button opens the same add-sheet as
  onboarding. Deleting a location that holds items prompts a "move its items to…" reassign step. Exactly one
  location is the primary (home/neutral).
- **Household / closets** — manage closets that represent people (Me / Partner / Kid 1 / Kid 2), each with an
  avatar + item count; a **closet switcher** control (segmented or dropdown) with an "All" aggregate; note that a
  closet (whose) and a location (where) are independent.
- **Measurements** — waist / chest / hips / inseam number inputs with an in ↔ cm unit toggle; a short note that
  these power the "Fits me now" filter and stay private.
- **Laundry and lifestyle** — machine size (small / standard / double) as a segmented control; a couple of
  lifestyle inputs (workout cadence, # activewear sets).
- **Sharing and borrowers** — a "who can view your closet" list (avatar + revoke), and a "frequent borrowers"
  list (name + add), with a clear note that private/functional data is never shared.

### D. States to include
- A **functional-vs-social privacy divider**: visually distinguish "only you" sections (measurements, laundry)
  from "shareable" ones (identity, viewers). A small lock/eye affordance.
- Empty, partial, and complete states for at least the location manager and the hub.
- Light and dark mode.

Deliverables: the onboarding flow (A), the hub (B) on mobile + desktop, and the five detail screens (C), all
linked, plus a small component set (location card, section card, add-location sheet, closet switcher, unit toggle).
Use realistic content from these personas: Maya (one home), the Executive Mom (household of 4), and Sloane (four
named homes). Avoid the words "simply / just / easy / seamless / unlock" in body copy except the deliberate
capability label "Unlocks …".
```

*MUST INCLUDE Mobile view and Desktop View*
Avoid long settings pages.

Favor progressive disclosure.

Each screen should feel lightweight and focused on one task.
Interactions should feel calm and lightweight.

Prefer bottom sheets over full-screen forms.

Prefer inline editing over modal-heavy flows.

Reduce unnecessary confirmations.

The product should feel:

• calm
• competent
• trustworthy
• quietly premium

Avoid gamification, streaks, confetti, badges, trophies, or productivity pressure.

Users should feel organized rather than judged.

The hub should comfortably support additional sections in future releases without feeling crowded.

The user should understand within 30 seconds:

• where their clothes are
• how to organize locations
• why adding profile information improves inventory management

Every screen should reinforce that the app manages real garments in real places.

The Profile Hub should visually communicate that profile information powers the app's core capabilities.

Inventory → Location → Status → Care → Share

Each section should clearly show which pillar it supports.