# E1 · Cloud Backend & Data (Supabase)

> **Date:** 2026-06-20 · **Pillar:** Foundation · **Detail:** full · **README:** v5.1 · **Est:** ~7–11 dev-days
> **Goal:** Stand up the cloud layer on **Supabase** (decided — [BACKEND_DATABASE_DECISION](../BACKEND_DATABASE_DECISION.md)):
> per-user closet in Postgres, image storage off base64, offline-first sync. Do NOT merge Firestore PR #44.
> **Riskiest unknown first:** Gmail access-token flow under Supabase Auth.

---

## US-1.1 — Sign in and keep my closet in the cloud
_As Maya, I want my closet synced to my account so that I see the same wardrobe on phone and laptop._
- [ ] Supabase Auth sign-in (Google)
- [ ] Per-user `items` table; RLS so a user reads/writes only their own rows
- [ ] localStorage acts as offline cache; reconciles on reconnect
- [ ] First sign-in seeds the cloud from existing local closet

**Tickets**
- `E1-1.1` ⚠️ **Spike:** Gmail API access-token flow under Supabase Auth (prove before porting) — _1–1.5d_
- `E1-1.2` Supabase project + schema: `items` table mirroring `ClothingItem` (incl. E2 status/location columns) — _1d_
- `E1-1.3` RLS policies: owner-only read/write — _0.5d_
- `E1-1.4` Port `useCloudCloset` to Supabase client; keep `useLocalCloset` as offline cache — _2–3d_
- `E1-1.5` First-sign-in seed: upload local closet to Supabase — _1d_
- `E1-1.6` Offline-first reconcile (last-write-wins via `updatedAt`) — _1–1.5d_

## US-1.2 — Images that don't blow the storage budget
_As Maya, I want my photos stored properly so that big closets and camera imports don't silently fail._
- [ ] Images upload to Supabase Storage; row stores a URL, not base64
- [ ] Existing base64 images migrate to Storage
- [ ] Upload handles failure with a user-facing message

**Tickets**
- `E1-2.1` Supabase Storage bucket + upload pipeline (replaces base64 in `ImageUploader`) — _1–1.5d_
- `E1-2.2` One-time migration: base64 localStorage images → Storage URLs — _1d_

## US-1.3 — Know my sync state
_As Maya, I want a sync indicator so that I know my data is safe / when I'm offline._
- [ ] Nav shows synced / syncing / offline
- [ ] Pending local writes flush on reconnect

**Tickets**
- `E1-3.1` Sync-status indicator in NavBar — _0.5d_

## US-1.4 - Know my data is secure
_As Maya, I want to trust NTW with my google login and personal profile info
- [ ] Handle client credentials & user tokens securely
- [ ] cross account protection & user flow protection 
---

## Dependencies
- **E0** (clean base) recommended first.
- **E2 schema:** include status/location columns in `E1-1.2` so the inventory spine syncs without a later migration.
- Decommission PR #44 (reference only).

## Definition of done (epic)
Signed-in users have a private, synced, offline-capable closet on Supabase; images in Storage; sync state visible; Gmail import still works under Supabase Auth.
