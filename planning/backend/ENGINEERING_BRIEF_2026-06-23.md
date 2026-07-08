# NTW Engineering Brief — Architecture & Roadmap

_Last updated 2026-07-07. Status: E1 (Cloud Backend) ~95% complete; E2 (Status/Location) in progress._

---

## Current Stack (decided, don't change)

- React 19 + TypeScript + Vite 6
- **Supabase** (Postgres + Auth + Storage) — chosen over Firebase; PR #44 (Firebase) abandoned
- **Offline-first sync** via `SyncedClosetRepository` (local localStorage → cloud on sign-in; reconcile on reconnect)
- Gmail OAuth 2.0 + 10+ retailer receipt parsers (shipped; server-side token handling)
- Fuse.js fuzzy search (shipped)
- Framer Motion + Radix UI (web-only, stays web-only)
- Vitest + Playwright E2E + Supabase local dev environment
- Distribution via PWA (no App Store; intentional — no 30% cut)

---

## Architecture Decisions (settled — don't re-open)

### 1. Stay React + PWA. Do NOT pivot to React Native.

- Framer Motion and Radix UI don't exist in React Native — full component rewrite required
- PWA covers all use cases for v1–v5 (no heavy native sensors needed)
- iOS 16.4+ supports Web Push, camera API, offline mode
- Revisit native only after 10K users with data to justify the rewrite cost

### 2. Separate backend from frontend. Service layer pattern.

- Frontend never calls Supabase directly (except Auth SDK for sign-in)
- All data access goes through `ClosetRepository` interface (abstraction over Supabase)
- Components use `useCloset()` hook; never import Supabase client
- This means: swapping Supabase for a different DB = replace one service, zero component changes

```typescript
// ❌ wrong — tight coupling
import { supabase } from '@/lib/supabaseClient'
const items = await supabase.from('items').select()

// ✅ right — abstracted
const { closet } = useCloset()
// backed by SyncedClosetRepository → SupabaseClosetRepository
```

The repository layer is what changes if we ever swap databases. Components never know what's underneath.

### 3. Supabase now. Full-featured, offline-first, Postgres-backed.

- ✅ Decided 2026-06-20 — Supabase Firestore as primary store (not localhost, not Firebase)
- ✅ Merged 2026-06-30 — Supabase Auth (Google OAuth) + RLS policies verified safe
- ✅ Merged 2026-07-06 — offline-first sync layer (E1-1.4/1.5/1.6)
- ✅ Merged 2026-07-07 — account deletion + data export (GDPR/CCPA compliance)
- **Do NOT migrate existing users from localStorage to Supabase** — use the sync layer (seeding on first sign-in)
- Firebase PR #44 is explicitly abandoned; don't merge it

### 4. Monorepo structure — optional, not yet needed

The current single-package structure works fine. Revisit monorepo (pnpm workspaces + shared `@ntw/types`) when the backend grows (Hotmail/Yahoo OAuth spikes, lending features, etc.). For now: keep it simple.

---

## Current Architecture (E1 state — post 2026-07-07)

### Data Storage

```
Supabase Project (prod + dev split)
├── Postgres tables
│   ├── auth.users (managed by Supabase Auth)
│   ├── public.profiles (user account metadata)
│   ├── public.closets (co-owned closet headers; roles for sharing)
│   ├── public.items (primary data: clothing inventory)
│   ├── public.item_materials (normalized fiber blends)
│   ├── public.wear_events (wear tracking + photos)
│   └── public.* (E2/E3 tables: locations, tags, members, etc.)
├── Storage (bucket: item-photos)
│   └── <userId>/<uuid>.<ext> (signed URLs, 5-min expiry, auto-refresh)
└── Edge Functions
    └── delete-user-account (true identity erasure: storage + auth.users deletion)
```

### Sync Architecture

```
App Start
├── User signed out? → Local-only (localStorage, no Supabase)
└── User signed in?
    └── SyncedClosetRepository (wraps both LocalClosetRepository + SupabaseClosetRepository)
        ├── getAll() → reconcile(local, remote) via last-write-wins (updatedAt)
        ├── First sign-in: seed remote from local (if remote empty)
        ├── add/update/remove → local first (instant), then async to remote
        └── Remote failures tracked in syncFailureTracker; user sees "N changes not synced" in NavBar
```

**Recovery:** on reconnect, the next successful `getAll()` reconcile clears the failure state. No active retry queue yet (deferred post-MVP).

### Service Layer

```
src/services/
├── closetRepository.ts (interface: ClosetRepository)
├── supabaseClosetRepository.ts (Supabase + Postgres mapping)
├── syncedClosetRepository.ts (offline + sync orchestration)
├── localClosetRepository.ts (localStorage fallback)
├── accountDataService.ts (export/delete account)
└── base64PhotoGuard.ts (write-path guard: data:image → Storage upload)

src/context/
└── ClosetContext.tsx (single useCloudCloset instance; shared via useCloset hook)
```

All data access routes through `useCloset()`, which returns a `SyncedClosetRepository` instance.

---

## What's Complete (E1 — Cloud Backend)

✅ **E1-1:** Supabase Auth (Google OAuth) + offline-first sync  
✅ **E1-2:** Images in Storage (not base64); write-path guard for legacy prevention  
✅ **E1-3:** Sync status visible (SyncStatusIndicator + CloudSyncControl in NavBar)  
✅ **E1-4:** Security hardening (RLS proven, secrets scanned, account deletion deployed)  

**Next:** E2 (Status + Location + Simple Lending) — in progress on `EPIC-status-location` branch

---

## What NOT to Build Yet

- Sharing / borrow-lend requests (E4 — requires complex RLS + user profiles) — **post-MVP**
- Outfit builder / AI suggestions (E6–E7) — **post-MVP, table stakes not differentiator**
- Virtual try-on (E7) — **v3+**
- Travel weight calculator (E6.1) — **post-MVP**
- Hotmail/Outlook/Yahoo import (E1-5/E1-6) — **requires separate OAuth spikes, post-MVP**
- Internationalization (E13) — **post-MVP, backfill task**

---

## Key Constraints

- **No manual photography onboarding** — Gmail import is the wedge. If a user has to photograph every item, they will quit.
- **Offline-first is non-negotiable** — users expect to see their items instantly, even on flaky WiFi. localStorage seed + async Supabase push.
- **30-item free tier (current)** — consider raising to 50 for beta. Competitors (Whering, Alta) are fully free. Users need to hit value before paywall.
- **Gmail import:** parsed server-side (Firebase Functions alternative) vs. client-side (current). Current approach works, but consider moving to a secure Edge Function if parsing logic grows.
- **PWA install prompt** — trigger after first successful Gmail import, not on first visit. That's the magic moment.

---

## Type Definitions (see `src/utils/types.ts`)

Core types — all already in the codebase:

```typescript
type ItemStatus = "clean" | "dirty" | "at_cleaner" | "in_repair" | "traveling" | "on_loan" | "archived_seasonal";
type WearState = "new" | "like_new" | "good" | "fair" | "poor" | "needs_repair";
type ItemFit = "fits" | "tailored" | "too_big" | "too_small" | "unknown";

interface ClothingItem {
  id: string;
  imageURL: string;
  name: string;
  category: string;
  color: string;
  size: string;
  brand: string;
  price?: number; // numeric, not string (post-E1-1.6)
  material: MaterialBlend[];
  condition?: WearState;
  purchaseDate?: string; // ISO date
  care: string | string[];
  status?: ItemStatus;
  locationId?: string; // E2 location system
  isSentimental?: boolean;
  isLendable?: boolean; // E4 lending
  wornCount?: number; // E11 wear tracking
  updatedAt?: string; // last-write-wins timestamp
}
```

See `src/utils/types.ts` for the full definition. **Do NOT define types in multiple places.**

---

## Timeline Estimate (pre-2026-06-29 = outdated)

**Revised timeline post-E1 completion (2026-07-07):**

- **E2 (Status + Location)**: ~2–3 weeks (in progress on branch)
- **E5 (Mobile + PWA polish)**: ~1–2 weeks (responsive fixes, touch targets, installable)
- **Beta launch to 30 waitlisters**: ~6–8 weeks from 2026-06-29 → end of July / early August
- **Post-MVP**: Sharing (E4), Outfit Builder (E6), Internationalization (E13)

---

## Questions This Brief Does NOT Answer (decide later)

- Free tier limit: raise 30 → 50 for beta?
- Sharing model: E4 (full borrow-lend) or E4.5 (read-only links first)?
- Server-side receipt parsing: move Gmail parser to an Edge Function (same security as Firebase Functions)?
- i18n: when does it become a priority? (post-MVP, backfill task)
