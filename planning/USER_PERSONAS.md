# NTW User Personas — Consolidated

_Product Management · Consolidated 2026-07-04_

> **Canonical persona doc.** Merges the former `USER_PERSONAS_V2.md` (Diana, Becca, Jade, Sloane) and
> `USER_PERSONAS_V3.md` (Arianna/Founder, revised Becca, the Closet Pair), plus Maya from the README.
> The three source files were archived to [`planning/archive/`](./archive/). Where Becca appeared in both
> volumes, the **V3 (refined)** version is canonical here.
>
> **Why this exists now:** we are building the **inventory-truth spine — status + location** on the
> `EPIC-status-location` branch. Each persona below carries a **Named Locations** block (starter drafts,
> edit freely) so the location model is grounded in real user geography — Sloane in her Lake Como house
> looking for her blazer, the Executive Mom's dry-cleaper run, the Closet Pair split across two cities.
> Persona-derived status/location stories + tickets live in
> [E2 Part Une — Inventory Truth · Status & Location](./launch/epics/E2-part-une-inventory-truth-status-location.md).

---

## Summary — Seven Personas, One Product

| #   | Persona                                | Age   | Core problem                                         | Feature unlocked                                  | Location shape                          |
| --- | -------------------------------------- | ----- | ---------------------------------------------------- | ------------------------------------------------- | --------------------------------------- |
| 1   | **Maya** — The Overwhelmed Fashionista | 26    | Decision fatigue, overstuffed closet, duplicate buys | Gmail import, outfit suggestions                  | Single home + gym/travel                |
| 2   | **The Closet Pair** — "Our Closet"     | 30–34 | Shared clothes across cities, loan decay             | Lending Circle, Location Tracking                 | 2 homes + with-person + suitcase        |
| 3   | **Arianna** — The Founder              | 30s   | Wardrobe-as-system; things migrate; body gap         | Body Stage Tags, The Archive                      | Home + storage + on-loan + cleaner      |
| 4   | **Becca Fischer** — The Executive Mom  | 41    | Morning time-poverty, laundry chaos                  | Morning Mode, Laundry Forecast                    | Home + dry cleaner + laundry states     |
| 5   | **Diana Chen** — The Curator           | 54    | 30 years of history blocking daily wardrobe          | The Archive, Closet Archaeology, Body Stage Tags  | 3 in-home zones + seasonal storage      |
| 6   | **Jade Morrison** — The Stylist        | 33    | Pro multi-client wardrobe & PR-return logistics      | NTW Pro, PR Tracker, Pull List                    | Studio + on-set + tailor + showrooms    |
| 7   | **Sloane Whitmore** — The Collector    | 29    | Collection across 4 homes, lending black hole        | Collection View, Lending Circle, Insurance Export | 4 homes + safe + with-friend + carry-on |

**The through-line:** every persona has a _logistics_ problem that styling apps ignore. NTW's thesis — the hard
problem is **truth** (what state is it in, where is it, can I actually wear it), not **style** — holds from a
26-year-old overwhelmed by her closet to a 29-year-old who owns the perfect thing for tonight but doesn't know
which house it's in. **Status + location are the spine every downstream feature reads.**

---

## Location kinds (the shared model)

Every named location below maps to one of four `kind`s in the code
([`src/utils/locations.ts`](../src/utils/locations.ts)). Home/primary is **neutral** (not shown as "away").

| kind       | Meaning                                                      | Card treatment              |
| ---------- | ------------------------------------------------------------ | --------------------------- |
| `home`     | Primary residence / default                                  | Neutral — no away indicator |
| `storage`  | Off-site or off-season storage, bins, units                  | Colored border              |
| `suitcase` | Packed / carry-on / traveling with the owner                 | Colored border              |
| `other`    | Second home, with a person (loan), tailor, cleaner, showroom | Colored border              |

> Multi-home users (Sloane, the Closet Pair) need **several `other`/`home` locations with custom labels** —
> the current starter registry ships one of each kind; per-user custom locations are the next increment
> (see the epic doc's tickets).

---

## 1. Maya — "The Overwhelmed Fashionista" (26)

> _"I keep buying things I already own, and I still feel like I have nothing to wear."_

|         |                                                      |
| ------- | ---------------------------------------------------- |
| Age     | 26 · Marketing Coordinator · NYC/LA/Chicago          |
| Devices | iPhone, MacBook · high tech comfort (10+ apps daily) |

**Pain points:** 20+ minutes to decide each morning; bought the same white sneaker three times; can't
remember what she paid; over-packs when traveling with no system; "guilt items" she never wore.

**Goals:** know what she owns without digging; get dressed faster; shop to fill gaps not duplicates; feel good
(not guilty) about her wardrobe.

**Feature unlocked:** Gmail import (zero-photo onboarding) + trustworthy outfit suggestions. She is the funnel.

**Named Locations (starter draft):**

| Label          | kind       | Notes                                   |
| -------------- | ---------- | --------------------------------------- |
| Apartment      | `home`     | Primary; default for everything         |
| Gym bag        | `suitcase` | Activewear that lives out of the house  |
| Parents' house | `other`    | Off-season / overflow left at home-home |

---

## 2. The Closet Pair — "Our Closet" (30-34)

**The origin story.** MJ took the dress to Italy. Not maliciously — it was there, it was perfect for the
trip. Arianna spent two days thinking she'd lost it before texting MJ and learning it was in Milan. Not a
technology failure — a _visibility_ failure. The dress existed, it was fine, it was just invisible.

|         |                                                                         |
| ------- | ----------------------------------------------------------------------- |
| Ages    | 30–34 · e.g. cousins Arianna (SD) + MJ (Miami)                          |
| Also    | Roommates, partners, same-city lending friends, multi-home people       |
| Pattern | 2+ people with shared/overlapping wardrobes; casual trust-based sharing |

**Their "nothing to wear":** _the thing I want is somewhere I can't reach._ The grey blazer is in Arianna's
apartment; Arianna's in New York; MJ's in Milan. Or the skirt came back but smells of perfume and needs
cleaning — technically available, practically not.

**Pain points (ranked):** location blindness · loan decay (borrowed → permanently gone) · availability
ambiguity ("I'll bring it back soon" is not a status) · no graceful way to ask for something back ·
multi-location wardrobe blindness.

**User stories:**

| #   | As the Closet Pair, I want to...                                                 | So that...                                                             |
| --- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| CP1 | Mark an item "on loan to [person]" with an optional expected return date         | My closet reflects reality — that item is unavailable until it returns |
| CP2 | See at a glance what's currently with another person                             | I know what I can/can't wear without texting                           |
| CP3 | Get a gentle nudge when a loaned item has been out a while                       | I get a neutral prompt to follow up, not an awkward text               |
| CP4 | Accept a borrow from a trusted person → auto-update the item's location + status | The logistics happen in the app, not a text thread                     |
| CP5 | Tag items by location (home · traveling · storage · with [person])               | I can filter to what's accessible right now                            |
| CP6 | See combined availability — what's clean, home, and not on loan                  | Dressing shows only what I actually have access to                     |
| CP7 | Invite a trusted person to see select items                                      | We coordinate borrowing before packing, not after                      |
| CP8 | Mark a returned item "back home" in one tap                                      | State updates instantly when something comes back                      |
| CP9 | Filter wardrobe by location ("what's with me in NYC right now")                  | Packing/dressing is based on what's present, not remembered            |

**Feature unlocked:** **Lending Circle** (private trusted loan tracker + gentle, never-transactional nudges;
also the product's only native growth loop — borrowing pulls a trusted person into the app) + **Location
Tracking** (home label + current location; availability = clean AND home AND not-on-loan). **This is the
spine.** Strategic note: no competitor serves this pair — they are retention, virality, and the network effect.

**Named Locations (starter draft):**

| Label                     | kind       | Notes                               |
| ------------------------- | ---------- | ----------------------------------- |
| Arianna's San Diego condo | `home`     | Arianna's primary                   |
| MJ's Miami flat           | `other`    | The other person's home ("with MJ") |
| Carry-on                  | `suitcase` | In transit between cities           |
| Storage (SD)              | `storage`  | Off-season bins                     |
| With a friend             | `other`    | Generic on-loan-to-person           |

---

## 3. Arianna — "The Founder" (30s)

She built this because she couldn't find her clothes. She has a developer's relationship with her wardrobe:
she wants **status**, she wants **location**, she wants to **query it**. A missing item isn't just frustrating —
it's a data-integrity problem, and she knows exactly what's missing from the schema. She also has a body that
has changed enough that a slice of her wardrobe doesn't fit _right now_ — she won't delete it, won't let it
clutter her mornings, and finds it offensive that no app built the middle layer between "wearable now" and
"deleted forever."

|     |                                                           |
| --- | --------------------------------------------------------- |
| Age | Early 30s · SWE + founder · SD · solo, travels frequently |

**Her "nothing to wear":** a systems failure. The item is at the dry cleaner, in a moving bin, or lent at a
dinner party eight months ago and never returned — or it's right there but doesn't fit today, and seeing it is
its own small tax.

**User stories:**

| #   | As the Founder, I want to...                                         | So that...                                                                                  |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| F1  | Mark items "fits now" / "almost" / "keeping for reasons"             | My morning view shows only what I can wear, without deleting pieces that still belong to me |
| F2  | See my full wardrobe across all locations (home, storage, traveling) | I have one true picture, not a fragmented one                                               |
| F3  | Track loans — who has what, since when                               | I stop losing things to the lending gap without having to ask                               |
| F4  | Import purchases from Gmail without photographing anything           | Setup happens as I shop, not in a brutal weekend                                            |
| F5  | See fabric + care info on every item                                 | I stop destroying expensive things by guessing the wash                                     |
| F6  | See what's actually available today: clean, home, fits               | My morning starts from truth, not hope                                                      |
| F7  | Archive items with a memory note instead of deleting                 | The dress from that trip stays — it just doesn't crowd my mornings                          |

**Feature unlocked:** **Body Stage Tags** (judgment-free "fits now / almost / keeping for reasons"; latter two
hidden from daily view but kept with full metadata) + **The Archive** (sentimental, kept-not-worn items with
memory tags — the display case, not the donation bin).

**Named Locations (starter draft):**

| Label          | kind       | Notes                                                 |
| -------------- | ---------- | ----------------------------------------------------- |
| SD condo       | `home`     | Primary                                               |
| Storage unit   | `storage`  | Moving bins / off-season                              |
| At the cleaner | `other`    | Out for dry cleaning (pairs with status `at_cleaner`) |
| With a friend  | `other`    | Lent out (pairs with status `on_loan`)                |
| Carry-on       | `suitcase` | Traveling                                             |

---

## 4. Becca Fischer — "The Executive Mom" (41)

_(Refined V3 version — canonical.)_

Morning starts at 6:15am; by 7:00 she's fed two kids, signed something, found a missing shoe, and must be
dressed for a WFH or office day she can't remember until she opens Calendly. Her closet isn't disorganized in
the usual sense — the problem is specific: **she does not know, at any moment, what is clean.** Laundry exists
in three states at once (in the wash, in the dryer, on the bedroom chair) and none of them are "available to
wear right now." Last Tuesday she wore the same outfit three times — not by choice, but because it was the only
thing she could confirm, without investigation, was clean and video-call appropriate.

|           |                                                               |
| --------- | ------------------------------------------------------------- |
| Age       | 41 · VP Marketing (B2B SaaS) · Hoboken, commutes to NYC 2×/wk |
| Household | Married · kids 6 & 9 · husband travels Mon–Thu · $280K        |

**Her "nothing to wear":** not style, not quantity — a **logistics** problem. The closet is full; the information layer is missing. If the app shows her something that's in the dryer, she'll delete it and never
return.

**User stories:**

| #   | As Becca, I want to...                                                       | So that...                                      |
| --- | ---------------------------------------------------------------------------- | ----------------------------------------------- |
| R1  | A morning notification with one complete, clean, calendar-appropriate outfit | I spend zero minutes deciding                   |
| R2  | Mark items "in the wash" / "in the dryer" / "needs dry cleaning" / "clean"   | Suggestions never show me something unavailable |
| R3  | A laundry forecast — "3 of 5 work blouses are dirty, laundry soon"           | I do laundry before I run out, not after        |
| R4  | Pre-load a full week of outfits Sunday night in under 5 min                  | Every morning is already decided                |
| R5  | Tag by occasion (WFH · office · school · evening) and auto-filter to today   | I only see outfits relevant to today's schedule |
| R6  | A panic button for when I have 3 minutes to dress                            | I never show up looking chaotic                 |
| R7  | Import my closet from receipts without photographing                         | Setup takes a morning, not a weekend            |

**Feature unlocked:** **Morning Mode** (a _decision_, not a suggestion; <10s, notification-first) — which only
works if laundry state is accurate, making **R2 (status) the foundational feature** — plus **Laundry Forecast**,
the natural output of the status data layer.

**Named Locations (starter draft):**

| Label              | kind      | Notes                                               |
| ------------------ | --------- | --------------------------------------------------- |
| Hoboken closet     | `home`    | Primary                                             |
| Dry cleaner        | `other`   | Blazers/silk out for cleaning (status `at_cleaner`) |
| Returns pile (car) | `other`   | Bought-but-unresolved, effectively out of rotation  |
| Seasonal storage   | `storage` | Off-season bins                                     |

> Becca's dominant axis is **status** (clean/dirty/in-wash), not location — most of her wardrobe is `home`.
> Her card view leans on the status dot; location is a lighter concern than for Sloane or the Closet Pair.

---

## 5. Diana Chen — "The Curator" (54)

Diana has built a wardrobe for 30 years — a living archive: the sharp suits from her law-firm days, the
cashmere from Edinburgh at 40, the dress she wore to her mother's funeral, the 2009 jeans that don't quite fit
but were her favorite ever. The problem: **archives and wardrobes are not the same thing.** Every morning she
stands in front of 30 years of accumulated meaning and can't find what to wear today.

|           |                                                                    |
| --------- | ------------------------------------------------------------------ |
| Age       | 54 · Senior Director of Development (nonprofit) · Newton, MA       |
| Household | Married 28 yrs · two kids in college · $165K · iPhone, casual user |

**Her "nothing to wear":** _too much_ — layered across three in-home locations (bedroom closet, guest-room
closet, basement seasonal bins), across three body stages and four career phases. She needs an app that
respects the difference between _what she wears_, _what she owns_, and _what she keeps for reasons that aren't
about wearing it at all._

**User stories (location/archive relevant):**

| #   | As Diana, I want to...                                                | So that...                                                    |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| D1  | Archive emotionally-valuable-but-unwearable items _without deleting_  | My active wardrobe shows only what I can wear today           |
| D3  | Mark items "fits now" / "almost" / "keeping for reasons"              | My morning view is filtered to what works for my body now     |
| D4  | See items I haven't looked at in 6+ months                            | I can rediscover gems or decide to let them go                |
| D5  | Assign items to locations (bedroom closet, guest room, basement bins) | I see my full wardrobe even when it's spread across the house |
| D8  | Set seasonal rotation reminders                                       | I pull the right pieces before I need them                    |

**Feature unlocked:** **The Archive** (kept, not worn — the display case), **Closet Archaeology** (warm
"haven't-touched-in-6-months" rediscovery), **Body Stage Tags**.

**Named Locations (starter draft):**

| Label                  | kind      | Notes                     |
| ---------------------- | --------- | ------------------------- |
| Bedroom closet         | `home`    | Active rotation (primary) |
| Guest-room closet      | `storage` | Overflow / secondary      |
| Basement seasonal bins | `storage` | Off-season archive        |
| At the tailor          | `other`   | Alterations pending       |

> Diana proves `home` alone isn't enough even for a **single-address** user: her three in-home _zones_ argue for
> allowing multiple `home`/`storage` labels within one residence.

---

## 6. Jade Morrison — "The Stylist" (33)

Jade manages **other people's** wardrobes: four celebrity clients plus 8–12 editorial jobs/month. Each job is a
"pull" — borrow 40+ pieces from showrooms/PR/rental houses, dress the talent, photograph, then return every
piece in pristine condition within 5–10 business days. She runs this on Google Sheets and prayer. Last month
she returned a borrowed coat to the wrong showroom; it took two weeks and an uncomfortable call to fix.

|       |                                                                   |
| ----- | ----------------------------------------------------------------- |
| Age   | 33 · freelance celebrity/editorial stylist · LA (Silver Lake)     |
| Tools | Sheets (pull lists), Notes, Milanote, VSCO — all cobbled together |

**Her "nothing to wear":** a _where-IS-that-coat-and-whose-showroom-and-when-is-it-due_ problem. Purely
logistical, costing her professional credibility and hours weekly.

**User stories (status/location relevant):**

| #   | As Jade, I want to...                                                        | So that...                                                  |
| --- | ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| J2  | Log a borrowed PR item with showroom, PR contact, pull date, return deadline | NTW reminds me before the window closes                     |
| J6  | Mark items "at tailor" with what's being altered + expected return           | I never arrive to a shoot with the dress still being hemmed |
| J7  | Filter a client's closet by available / at tailor / on loan / at shoot       | I have one real-time view of each client's wardrobe state   |

**Feature unlocked:** **NTW Pro** — multi-closet accounts, **PR Tracker** (borrow log + return deadlines),
Project Archive, Pull List Generator, Client Share Portal, Alteration Log. A high-value professional tier
solving PR-return tracking that _no software in the market addresses._

**Named Locations (starter draft):**

| Label                | kind       | Notes                                       |
| -------------------- | ---------- | ------------------------------------------- |
| Studio               | `home`     | Her base of operations (per client account) |
| On set / shoot       | `suitcase` | Pieces packed for/at a shoot                |
| At tailor            | `other`    | Alterations                                 |
| Showroom (borrowed)  | `other`    | PR pull — return deadline attached          |
| Returned to showroom | `other`    | Closed-out loans (archive)                  |

> Jade's model is **status-heavy at professional scale**: her "status" set is richer (at-shoot, at-tailor,
> borrowed-out, returned) and her "location" is often _someone else's_ address. Pro-tier, post-branch.

---

## 7. Sloane Whitmore — "The Collector" (29)

Sloane's closet is a _collection_ — pieces that have appreciated (a $4,200 vintage Chanel jacket now worth
$9,000+), discontinued Hermès, archival Alaïa from a Paris estate sale. The problem: it's distributed across
**four locations she rotates between seasonally**, lent to a social circle that borrows without anxiety, and
increasingly impossible to see as a whole. She bought a third $900 cream cashmere turtleneck because she
couldn't be _sure_ she owned one. She'd never call it "nothing to wear" — she'd call it a **visibility
problem**: she knows she owns the perfect thing for tonight; she just doesn't know **which house it's in.**

|       |                                                                       |
| ----- | --------------------------------------------------------------------- |
| Age   | 29 · Brand Partnerships Director (luxury) · single                    |
| Homes | Nolita NYC (primary) · Hamptons · Paris pied-à-terre · Aspen (family) |

**Her "nothing to wear":** _everything, everywhere, and she can't see it._ The coat she wants is in the
Hamptons; the Paris boots are still in Paris; her Valentino heels are with a friend who "definitely has them, I
think"; her Birkin is in the Aspen safe.

**User stories:**

| #   | As Sloane, I want to...                                                         | So that...                                                  |
| --- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| SL1 | See my full wardrobe filtered by current location ("what's in NYC right now")   | I only see what's actually accessible when packing/dressing |
| SL2 | Track loans to friends — who, since when, whether I've asked back               | I stop losing pieces to the social lending black hole       |
| SL3 | Export a high-value inventory (name, brand, price, date, image) as PDF          | I have an insurance document I can send my advisor          |
| SL4 | Before buying, see "similar items you already own" — even from another location | I stop buying a fourth cream cashmere turtleneck            |
| SL5 | Tag "investment piece" with purchase price + current estimated value            | I treat my wardrobe as the asset it is                      |
| SL6 | Log what I wore to which event ("Sylvia's birthday, East Hampton, Mar 2026")    | I never repeat an outfit to the same social circle          |
| SL7 | Browse in a beautiful gallery view, organized by designer or season             | The app is something I open for pleasure                    |
| SL8 | Assign a provenance note — where I got it, the story                            | My wardrobe has context, not just categories                |

**Feature unlocked:** **Collection View** (editorial gallery browse) + **Lending Circle** + **Insurance Export**.
Sloane is a micro-influencer in a high-value stratum — word of mouth converts at premium rates.

**Named Locations (starter draft):**

| Label                  | kind       | Notes                                  |
| ---------------------- | ---------- | -------------------------------------- |
| Nolita apartment (NYC) | `home`     | Primary residence                      |
| Hamptons house         | `other`    | Seasonal second home                   |
| Paris pied-à-terre     | `other`    | Seasonal / travel base                 |
| Aspen (family) — safe  | `other`    | High-value pieces (Birkin) in the safe |
| With a friend          | `other`    | On loan (status `on_loan`)             |
| Carry-on               | `suitcase` | Currently traveling with her           |

> **Sloane is the strongest argument for multi-`home`/custom-labeled locations.** The current one-of-each-kind
> registry can't express four homes. Her "filter by where I am right now" (SL1) is the flagship location query.

---

## Feature concepts unlocked (cross-persona)

| Feature                  | Persona(s)                          | One-liner                                                                   |
| ------------------------ | ----------------------------------- | --------------------------------------------------------------------------- |
| **Location Tracking**    | Closet Pair, Sloane, Diana, Arianna | Home label + current location; the availability spine                       |
| **Lending Circle**       | Closet Pair, Sloane                 | Private, non-transactional loan tracker + gentle nudges; native growth loop |
| **Body Stage Tags**      | Arianna, Diana                      | "Fits now / almost / keeping for reasons" — reflect reality without judging |
| **The Archive**          | Diana, Arianna                      | Kept-not-worn items with memory tags; display case, not trash               |
| **Closet Archaeology**   | Diana                               | Warm rediscovery of long-untouched items                                    |
| **Morning Mode**         | Becca                               | A daily _decision_ (not a suggestion); depends on accurate status           |
| **Laundry Forecast**     | Becca                               | Derived from status across categories — nudge before you run out            |
| **Delivery Intercept**   | Becca, Sloane, Maya                 | Gmail receipt → "you already own N similar" before it arrives               |
| **NTW Pro / PR Tracker** | Jade                                | Multi-client closets, borrow/return deadlines, pull lists                   |
| **Collection View**      | Sloane                              | Editorial gallery browse — the wardrobe as art collection                   |

**Availability is the derived concept every feature reads:** `available = clean AND home AND not-on-loan`.
Build status + location once; Morning Mode, Laundry Forecast, the Lending Circle, outfit suggestions, and
multi-home all consume it.
