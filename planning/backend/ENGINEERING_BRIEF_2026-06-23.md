# NTW Engineering Brief — Architecture & Roadmap

_For Claude Code context. Last updated 2026-06-23._

---

## Current Stack (do not change)

- React 19 + TypeScript + Vite 6
- localStorage (current main storage — working, shipped)
- Firebase Firestore — PR #44 exists, not yet merged
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

### 3. Firebase now. Postgres (Supabase) when social/sharing ships — maybe never.

- Merge PR #44 this week. Firebase Firestore is correct for v1 closet + ingestion.
- Firebase can handle the social/sharing graph too. See data model below.
- Do NOT migrate existing users from Firestore to Postgres — too much risk, no benefit yet.
- Only migrate if the social graph becomes complex enough to warrant it (v8+, real scale).

### 4. Monorepo structure — set it up before the backend grows.

```
ntw/
├── packages/
│   └── types/               ← shared TypeScript types — Item, User, BorrowRequest, etc.
│                               both frontend and backend import from here
│                               npm package: @ntw/types
├── apps/
│   └── web/                 ← existing React app moves here (or stays, monorepo wraps it)
└── backend/
    └── functions/           ← Firebase Functions (the API layer)
        ├── items/
        ├── users/
        ├── sharing/         ← borrow/lend endpoints go here
        └── gmail/           ← Gmail OAuth parsing (keeps API keys server-side)
```

Use **pnpm workspaces**. Turborepo is optional but helpful for large builds.

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

## Firebase Data Model for Sharing (use this, don't design from scratch)

Firestore can handle the borrow/lend social graph. No Postgres migration needed for v1 sharing.

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

Firestore security rules:

- Users can only read items where `ownerId == request.auth.uid` OR `isShareable == true && request.auth.uid in resource.data.ownerId.trustedCircle`
- Borrow requests: readable by fromUserId or toUserId only

---

## What to Build This Week (V1 Deploy)

**Goal: ship closet + Gmail ingestion to production by end of week.**

1. **Merge PR #44** — Firebase Firestore replaces localStorage as primary storage
2. **Set up Firebase project for production** (separate from dev)
      - Enable Firestore, Auth (Google + email), Storage
      - Set Firestore security rules (users can only read/write their own items)
3. **Wrap all Firestore calls in a service layer** before merging
      - Create `/src/services/itemsService.ts` — all CRUD for items goes here
      - Create `/src/services/authService.ts` — auth state management
      - Components import from services, never from firebase directly
4. **Update Gmail OAuth consent screen** for production domain
      - Add production domain to authorized origins in Google Cloud Console
      - Gmail OAuth scope: `https://www.googleapis.com/auth/gmail.readonly`
      - This is the step most likely to add days — do it first
5. **Deploy to Vercel or Netlify**
      - Add all Firebase + Gmail env vars to deployment config
      - Set up custom domain if you have one
6. **PWA manifest + service worker** — installable on home screen

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
- Gmail import: run server-side in Firebase Functions (more secure, API keys hidden) or client-side (current approach)? Recommend moving to server-side before production.
