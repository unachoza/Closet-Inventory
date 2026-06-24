# NTW Engineering Brief — Architecture & Roadmap

_For Claude Code context. Last updated 2026-06-23._

---

> ## 🔴 RECONCILED 2026-06-23 — Supabase is committed; Firebase is OFF the table.
>
> An earlier draft of this brief recommended "Firebase now, Supabase maybe never, don't migrate."
> **That is superseded.** The founder's decision (2026-06-23) and the source-of-truth docs win:
> - **Backend = Supabase Postgres**, committed. See [BACKEND_DATABASE_DECISION.md](./BACKEND_DATABASE_DECISION.md).
> - **Architecture = RLS-preserving GraphQL BFF (or pg_graphql-native if no AI).** See [E1-cloud-backend_ARCHITECTURE.md](./E1-cloud-backend_ARCHITECTURE.md).
> - **PR #44 (Firestore) is CLOSED.** It is reference material, not the path.
> - **Why now:** `main` is still localStorage-only, so there is no live cloud data to migrate — this is the cheapest possible moment to land Postgres. The only migration is a one-time **seed-on-first-sign-in** of each user's localStorage closet.
>
> Where the sections below still say "Firebase / Firestore / Cloud Functions," read **Supabase / Postgres+RLS / Edge Functions**. The genuinely reusable parts of this brief — the priority order, the viral-loop reasoning, the type contract, and the relational data model — remain valid and have been updated in place.

---

## Current Stack (do not change)

- React 19 + TypeScript + Vite 6
- localStorage (current main storage — working, shipped)
- ~~Firebase Firestore — PR #44~~ → **Supabase Postgres (committed; PR #44 closed).** Not yet stood up.
- Gmail OAuth + 10+ retailer receipt parsers (shipped)
- Fuse.js fuzzy search (shipped)
- Framer Motion + Radix UI (web-only, stays web-only)
- Vitest + Playwright E2E
- No App Store. Distribution via PWA. This is intentional — no 30% Apple/Google cut.

---

## Architecture Decisions (settled — don't re-open)

### 1. Stay React + PWA. Do NOT pivot to React Native.

- Framer Motion and Radix UI don't exist in React Native — full component rewrite required
- PWA covers all use cases for v1–v5 (no heavy native sensors needed)
- iOS 16.4+ supports Web Push, camera API, offline mode
- Revisit native only after 10K users with data to justify the rewrite cost

### 2. Separate backend from frontend. API layer pattern.

- Frontend never calls Firestore/database directly
- All data access goes through a service/API layer
- This means: adding React Native later = new frontend shell, zero backend changes

```
// ❌ wrong — tight coupling
import { getDoc, doc } from 'firebase/firestore'
const item = await getDoc(doc(db, 'items', itemId))

// ✅ right — abstracted
import { itemsApi } from '@/services/api'
const item = await itemsApi.getItem(itemId)
```

The service layer (`/src/services/`) is what changes if we ever swap databases. The components never know what's underneath.

### 3. ~~Firebase now. Postgres maybe never.~~ → Supabase Postgres, committed. (SUPERSEDED)

> Reconciled 2026-06-23. The original "Firebase now / Supabase maybe never / don't migrate" call is **reversed.** Rationale in [BACKEND_DATABASE_DECISION.md](./BACKEND_DATABASE_DECISION.md): the uncompeted core (status/location/availability + the v8 borrow/share graph) is inherently relational and access-controlled, and **Row-Level Security is the load-bearing reason for the choice.**

- **Stand up Supabase Postgres** — schema-as-migrations from day one, RLS on every table before real data lands.
- **No live-user migration exists** — `main` is localStorage-only. The only data move is a one-time **seed-on-first-sign-in** of each user's local closet into their account (real work; don't skip it or data silently vanishes).
- **Firebase / Firestore / PR #44 are off the table.**

### 4. Monorepo structure — set it up before the backend grows.

```
ntw/
├── packages/
│   └── types/               ← shared TypeScript types (@ntw/types) — the backend contract:
│                               Item, User, BorrowRequest, Connection, enums.
│                               consumed by the service layer + future backend.
├── apps/
│   └── web/                 ← existing React app (moves here LATER; today it stays at root
│                               and the workspace wraps it — moving 800+ tests is a separate step)
├── services/
│   └── bff/                 ← Node + Fastify + GraphQL Yoga BFF (forwards user JWT → RLS).
│                               Also the home for the IMAP worker at v2.3 (Yahoo/iCloud/AOL).
│                               DEFERRABLE — not needed for Gmail/Graph (both OAuth-HTTP).
└── supabase/
    ├── migrations/          ← versioned SQL schema + RLS policies (source of truth)
    └── functions/           ← Edge Functions: OAuth token refresh, Stripe webhook, v2.2 scraper
```

Workspaces via **npm** (the repo is npm today — `package-lock.json`). pnpm/Turborepo can come later; switching package managers now is needless churn. **Privileged server work (token refresh, Stripe, scraper) lives in Supabase Edge Functions — the long-running Node host is only required at IMAP (v2.3).**

The shared `types` package is the highest-value move. Define `Item`, `User`, `BorrowRequest`, `ItemStatus`, `ItemLocation` once. Both Firebase Functions and React frontend import from `@ntw/types`. TypeScript catches mismatches at compile time.

---

## Priority Order (do not deviate)

1. ✅ Closet inventory + Gmail ingestion — **ship this week**
2. 🔲 User accounts + public profile — **prerequisite for sharing**
3. 🔲 Sharing / borrow-lend — **next major milestone, before outfit builder**
4. 🔲 Item status + location (v1.5) — alongside or after sharing
5. 🔲 Outfit builder (v7) — later, table stakes, not the differentiator

**Sharing is the only feature in the category with a built-in viral loop.**
When User A sends a borrow request to User B, User B must install NTW to respond.
One transaction = one new user. This is the growth mechanic. Build it before anything else social.

---

## Data Model for Sharing — relational (Postgres + RLS)

> Reconciled 2026-06-23. The document shapes below were originally written as Firestore collections.
> They map cleanly onto **Postgres tables**: each `/collection/{id}` becomes a table with a `uuid` PK,
> `*Id` fields become **foreign keys**, and the security-rule notes below become **RLS policies**.
> The canonical schema lives in `supabase/migrations/` once stood up — treat the shapes here as the
> conceptual model, not the DDL. `trustedCircle`/`connections` is the relational join the SoT doc calls
> out as the reason Supabase was chosen over Firestore fan-out writes.

```
/users/{userId}
  - displayName: string
  - email: string
  - photoURL: string
  - trustedCircle: userId[]      ← people they share with
  - createdAt: timestamp

/items/{itemId}
  - ownerId: userId
  - name: string
  - brand: string
  - category: string
  - material: string             ← inferred from product name
  - careInstructions: string[]
  - status: 'clean' | 'dirty' | 'at_cleaner' | 'on_loan' | 'in_repair'
  - location: 'home' | 'storage' | 'suitcase' | 'other'
  - locationLabel: string        ← e.g. "Aspen house", "storage unit"
  - borrowedBy: userId | null
  - isShareable: boolean
  - source: 'manual' | 'gmail_import' | 'camera'
  - retailer: string
  - purchaseDate: timestamp
  - purchasePrice: number
  - wearCount: number
  - lastWornAt: timestamp
  - imageUrl: string
  - createdAt: timestamp

/borrow_requests/{requestId}
  - fromUserId: userId           ← person requesting to borrow
  - toUserId: userId             ← item owner
  - itemId: string
  - status: 'pending' | 'accepted' | 'declined' | 'returned'
  - requestedAt: timestamp
  - respondedAt: timestamp
  - returnedAt: timestamp
  - message: string              ← optional note from requester

/connections/{connectionId}
  - userA: userId
  - userB: userId
  - status: 'pending' | 'connected'
  - createdAt: timestamp
```

RLS policies (the Postgres equivalent of the original Firestore rules):

- `items` SELECT: `owner_id = auth.uid()` OR (`is_shareable` AND `auth.uid()` is in the owner's connected circle via the `connections` table)
- `borrow_requests` SELECT/UPDATE: `from_user_id = auth.uid()` OR `to_user_id = auth.uid()`
- Every table: `ENABLE ROW LEVEL SECURITY` + explicit policies — a table with RLS off is wide open under the publishable key (the Tea-App-class mistake).

---

## What to Build This Week (V1 Deploy)

**Goal: stand up Supabase + land Gmail/Hotmail ingestion behind the service layer.**

> Reconciled 2026-06-23 — Supabase build order. Full detail in [E1-cloud-backend_ARCHITECTURE.md](./E1-cloud-backend_ARCHITECTURE.md) §"Build order."

1. **Service layer first (on `main`, no cloud spend)** — `/src/services/` so components never import the DB client directly. Repository interface + a localStorage-backed impl today; a Supabase impl slots in later. _(scaffolded 2026-06-23)_
2. **Create the Supabase project** (Pro, region near users). Schema as **migrations from day one** — never click tables into the dashboard.
3. **Core tables + RLS** — `profiles` (mirrors `auth.users` via trigger) + `items`. `ENABLE ROW LEVEL SECURITY` and verify policies with a JWT-scoped client before any real data.
4. **Enable Google + Microsoft auth providers.**
5. **Provider OAuth setup (start early — these have lead time):**
      - **Gmail** scope `https://www.googleapis.com/auth/gmail.readonly` is a Google **restricted scope** → needs OAuth verification + annual **CASA** assessment before public launch. Begin the consent-screen/verification process early.
      - **Microsoft (Hotmail/Outlook)** — Azure app registration **inside a directory/tenant** (free; create a tenant, no Enterprise needed), supported account types = "any org directory **+ personal Microsoft accounts**", Graph delegated `Mail.Read` + `offline_access`. Lighter than Gmail — no CASA equivalent for consumer mail.
6. **Spike the Gmail provider-token flow under Supabase Auth** — the one thing that can invalidate the plan. Prove Supabase Google OAuth yields a usable `provider_refresh_token` you can store + refresh server-side (Supabase does **not** auto-refresh it). If not, keep a separate Google OAuth client for Gmail.
7. **Storage migration** — base64 → private bucket + URL column (kills the ~5 MB Safari ceiling; unblocks camera import).
8. **Port the service layer** to Supabase; keep localStorage as offline cache. Build the **seed-on-first-sign-in** path.
9. **Deploy** — PWA static host (Vercel/Netlify/Cloudflare Pages); Edge Functions for token refresh/Stripe/scraper.

---

## What to Build Next Month (Sharing V0.5 — Achievable in 3–4 Weeks)

**Lighter sharing that still creates the viral loop:**

1. User profile setup (display name, photo)
2. Connection/trust system — send a "circle invite" by email or link
3. Item visibility toggle — mark items as shareable or private
4. Shareable closet view — a link that shows your shareable items to a connected user (read-only)
5. **Borrow request flow** — request an item → owner gets notification → accept/decline → item status updates to `on_loan`
6. Web Push notifications for borrow requests (PWA supports this)
7. In-app notification bell

This is the MVP viral loop. User A sees User B's shareable closet, requests to borrow a jacket. User B gets a push notification. If User B doesn't have NTW, they get an email with a link to install. **That's the loop.**

**Realistic timeline:**

- Full borrow/lend with push notifications: **6–8 weeks solo**
- Read-only shareable closet link only (no requests yet): **2–3 weeks**
- Recommended: ship the link first (fast), then the request flow (takes longer)

---

## What NOT to Build Yet

- Outfit builder / AI suggestions — v7, not now
- Virtual try-on — v7
- Travel weight calculator — v6.1
- Resale listing — never a priority
- Color analysis — not differentiated

---

## Key Constraints

- **No manual photography onboarding** — Gmail import is the wedge. If a user has to photograph every item, they will quit.
- **30-item free tier is tight** — consider raising to 50 for beta users. Whering and Alta are fully free. Users need to hit value before the paywall.
- **Fits (German competitor) shipped basic email import Oct 2025** — NTW's version is deeper (10+ parsers, material inference) but the moat narrows over time. Ship fast.
- **PWA install prompt** — trigger it after the user's first successful Gmail import, not on first visit. That's the magic moment.

---

## Type Definitions to Create First (in `@ntw/types`)

```typescript
export type ItemStatus = "clean" | "dirty" | "at_cleaner" | "on_loan" | "in_repair" | "unknown";
export type ItemLocation = "home" | "storage" | "suitcase" | "other";
export type ItemSource = "manual" | "gmail_import" | "camera";
export type ConnectionStatus = "pending" | "connected";
export type BorrowStatus = "pending" | "accepted" | "declined" | "returned";

export interface Item {
	id: string;
	ownerId: string;
	name: string;
	brand?: string;
	category: string;
	material?: string;
	careInstructions?: string[];
	status: ItemStatus;
	location: ItemLocation;
	locationLabel?: string;
	borrowedBy?: string;
	isShareable: boolean;
	source: ItemSource;
	retailer?: string;
	purchaseDate?: Date;
	purchasePrice?: number;
	wearCount: number;
	lastWornAt?: Date;
	imageUrl?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface User {
	id: string;
	displayName: string;
	email: string;
	photoURL?: string;
	trustedCircle: string[];
	createdAt: Date;
}

export interface BorrowRequest {
	id: string;
	fromUserId: string;
	toUserId: string;
	itemId: string;
	status: BorrowStatus;
	message?: string;
	requestedAt: Date;
	respondedAt?: Date;
	returnedAt?: Date;
}

export interface Connection {
	id: string;
	userA: string;
	userB: string;
	status: ConnectionStatus;
	createdAt: Date;
}
```

---

## Questions This Brief Does NOT Answer (decide before building)

- Free tier limit: 30 items or raise to 50 for beta?
- Auth methods: Google OAuth only, or also email/password?
- Will borrowers need a full NTW account to respond to a request, or just a link-based response? (Full account = more installs but more friction)
- Gmail import: keep client-side (current approach) or move token handling **server-side into a Supabase Edge Function** (API keys hidden, refresh server-side)? Recommend server-side before production — and it's required to store the `provider_refresh_token` securely anyway.
