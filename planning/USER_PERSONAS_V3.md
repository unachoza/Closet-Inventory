# NTW User Personas — Volume 3
_Product Management · Updated 2026-06-25_

> Focused personas: The Founder, The Executive Mom (refined), and The Closet Pair.
> Companion to USER_PERSONAS_V2.md. These three are the core — the ones the product must serve before it serves anyone else.

---

## Persona 7 — Arianna, 30s
### "The Founder"

---

**The snapshot**

| | |
|---|---|
| Age | Early 30s |
| Location | Los Angeles, CA |
| Role | Software engineer + startup founder |
| Household | Solo · active social life · travels frequently |
| Income | Variable (freelance + building) |
| Phone | iPhone Pro · heavy user · developer mindset |
| Shopping | Deliberate but impulsive at the margins. Knows what she likes. Has made expensive mistakes she's still holding onto. |
| Fashion identity | Tasteful, editorial, analytical. She dresses with intention on good days and chaos on bad ones. The gap between the two is the app. |

---

**Her world**

She built this. Not because she saw a market opportunity — because she couldn't find her clothes. She lived with her cousin. They shared everything: clothes, a closet, a sense of humor about who borrowed what. Then her cousin took a dress to Italy without telling her, and she spent two days thinking she'd lost it. That moment is the whole product.

She has a developer's relationship with her wardrobe: she wants it to behave like a system. She wants status. She wants location. She wants to query it. When she opens her closet and can't find something, it's not just frustrating — it's a data integrity problem, and she knows exactly what's missing from the schema.

She also has a body that has changed. Not dramatically, not permanently, but enough that a meaningful slice of her wardrobe doesn't fit right now. She's not getting rid of it. She's not ready to say those things don't belong to her anymore. Some of it she wants to tailor. Some of it she's keeping because she wore it to something that mattered. But she doesn't want those pieces cluttering her morning view either. She needs a middle layer between "wearable now" and "deleted forever," and she finds it offensive that no app has thought to build one.

---

**Her version of "nothing to wear"**

It's a systems failure. She knows she owns the right thing — she just can't surface it. The item is at the dry cleaner, or in a bin from when she last moved, or she lent it to someone at a dinner party eight months ago and it never came back. Or it's in the closet, right there, but it doesn't fit right now and seeing it every morning is its own small tax.

She built the app to solve her own problem. That's both the strength and the risk: she has to hold enough distance to build for users who are not her.

---

**Pain points (ranked)**

1. **Visibility across locations** — Things migrate. To storage, to a friend's apartment, to the wrong city. She can't see her wardrobe as a whole because it isn't in one place.
2. **The body gap** — A portion of her wardrobe doesn't fit right now. She doesn't want to delete it, she doesn't want it polluting her daily view. She wants a principled third option.
3. **Lending without tracking** — She's generous with her clothes. She doesn't always get them back. She'd rather have a system than an awkward conversation.
4. **Care knowledge gaps** — She's bought expensive things and destroyed them in the wash. She wants to know how to care for what she owns before it's too late.
5. **Re-buying what she already owns** — She's done this. The duplicate white shirt. The third black turtleneck. It happens when the wardrobe is invisible.

---

**What she wants from an app**

- A single source of truth for everything she owns, regardless of where it is
- A "fits now" / "almost" / "keeping for reasons" layer — not deletion, a holding state
- Loan tracking that doesn't require her to remember to use it
- Care information surfaced at the item level, not buried in settings
- The ability to see what's actually available to wear today — clean, home, fits — without manual overhead

---

**What she does NOT want**

- To photograph every item individually (she knows from building it how painful that is)
- Outfit suggestions from an algorithm before she's had coffee
- Social features that feel performative
- Anything that adds friction to the morning routine

---

**Quotes**

> "I built this because I couldn't find my things. I keep building it because I realize most people can't find their things either, they just don't know that's the problem."

> "I have a blazer I love that doesn't fit right now. I'm not getting rid of it. I just need the app to stop showing it to me every morning like a reminder of something."

> "My cousin took my dress to Italy without asking. That's the whole product."

---

**User stories**

| # | As the Founder, I want to... | So that... |
|---|---|---|
| F1 | Mark items as "fits now" / "almost" / "keeping for reasons" | My morning view only shows me things I can actually wear today, without deleting pieces that still belong to me |
| F2 | See my full wardrobe across all locations (home, storage, traveling) | I have one true picture of what I own, not a fragmented one |
| F3 | Track loans — who has what, since when | I stop losing things to the social lending gap without having to ask |
| F4 | Import purchases from Gmail without photographing anything | Setup happens automatically as I shop, not in one brutal weekend |
| F5 | See fabric and care information on every item | I stop destroying expensive things because I guessed wrong on the wash cycle |
| F6 | See what's actually available to wear today: clean, home, fits | My morning starts with a true picture, not a hopeful one |
| F7 | Archive items with a memory note rather than deleting them | The dress from that trip, the jacket from that job — they stay, they just don't crowd my mornings |

---

**The feature the Founder unlocks: Body Stage Tags + The Archive**

Two features that come directly from lived experience and have no equivalent in any competitor product.

**Body Stage Tags** — a judgment-free status system: "Fits now" / "Almost" / "Keeping for reasons." Items in the latter two states are hidden from the daily view, morning mode, and outfit suggestions, but remain in the wardrobe with full metadata. This is not the trash. It is not denial. It is the honest middle ground that every woman with a fluctuating body has been asking for without knowing it was possible to ask.

The language matters enormously. Not "doesn't fit." Not "too small." Just: availability status. The app reflects reality without judging it.

**The Archive** — for items that are kept but not worn. Not body-gap items, but sentimental ones. The dress from the funeral. The blazer from the job offer. They leave the active closet, take nothing from the daily experience, and remain permanently accessible with memory tags, occasion notes, and photos. The Archive is the display case, not the donation bin.

---
---

## Persona 4 (Revised) — Becca Fischer, 41
### "The Executive Mom"

---

**The snapshot**

| | |
|---|---|
| Age | 41 |
| Location | Hoboken, NJ (commutes to NYC 2x/week) |
| Role | VP of Marketing, B2B SaaS company |
| Household | Married · kids aged 6 and 9 · husband travels Mon–Thu |
| Income | $280K household |
| Phone | iPhone Pro, heavy user (Notion, Slack, Calendly, Instacart) |
| Shopping | Buys when she has a moment. Returns pile up in the car. Not impulsive exactly — just never has time to be intentional. |
| Fashion identity | "I used to have one. Now I just need to not look bad on a video call." |

---

**Her world**

Becca's morning starts at 6:15am. By 7:00 she needs to have fed two kids, signed something, found someone's shoe, and be dressed for either a WFH day or a real office day — which have completely different dress codes and she never remembers which is which until she opens Calendly. She has 45 minutes. Most of them belong to the kids.

Her closet is not disorganized in the way people imagine disorganization. The problem is more specific: she genuinely does not know, at any given moment, what is clean. Laundry in her house exists in three states simultaneously — in the wash, in the dryer, draped over the chair in the bedroom — and none of those states are "available to wear right now." When the app shows her an outfit with the cream blouse, she has to stop and remember: is the cream blouse clean? Is it in the dryer? Did she wear it Tuesday? She doesn't know. She has never known. This is the problem.

Last Tuesday she wore the same outfit three times in a week. Not because she wanted to — because it was the only thing she could confirm, without investigation, was clean and appropriate for a video call.

---

**Her version of "nothing to wear"**

Not a style problem. Not a quantity problem. A logistics problem. She has enough clothes. What she doesn't have is accurate information about which of those clothes are available right now. The closet is full. The information layer is missing.

She doesn't need inspiration. She needs the app to tell her what's actually ready to wear.

---

**Pain points (ranked)**

1. **Laundry chaos** — She has no idea what's actually available right now. Outfit suggestions that include items currently in the wash are useless — and actively erode trust in the product.
2. **Morning decision fatigue** — She cannot spend mental energy on what to wear. That budget is gone by 7am.
3. **Occasion fragmentation** — WFH Becca and office Becca and school-board Becca and date-night Becca dress completely differently. Four micro-wardrobes jammed into one closet with no organization system.
4. **No time for onboarding** — She downloaded Stylebook once. Photographing every item individually took 20 minutes and she quit. She will never do that again.
5. **Outfit suggestions she can't trust** — If the app doesn't know what's clean, every suggestion is a guess. A guess at 6:30am is not helpful. It's another thing to evaluate.

---

**What she wants from an app**

- Tell her what to wear. Not suggestions — a decision.
- Know what's clean. Never surface something in the wash.
- Pre-load the week's outfits on Sunday so Monday through Friday mornings are already decided.
- Set up this week's outfits around her calendar (board meeting Tuesday = different than WFH Thursday).
- One-tap. She cannot deal with configuration.

---

**What she does NOT want**

- A styling quiz
- Influencer content or shopping recommendations
- Anything that takes more than 60 seconds to set up per day
- Manual photography of her closet
- Outfit suggestions she has to fact-check against the laundry pile

---

**Quotes**

> "I don't have a style problem. I have a logistics problem. I need the app to think for me, not inspire me."

> "On Sunday nights I feel like I should plan my outfits for the week like I plan the kids' lunches. I never do it. I need the app to just do it for me."

> "I wore the same thing three times this week. Not because I love it — because it was the only thing I knew was clean."

> "If the app shows me something that's in the dryer, I will delete it immediately and never come back."

---

**User stories**

| # | As Becca, I want to... | So that... |
|---|---|---|
| R1 | Receive a morning notification with one complete outfit — clean, appropriate for today's calendar — before I need to get dressed | I spend zero minutes deciding what to wear |
| R2 | Mark items as "in the wash" / "in the dryer" / "needs dry cleaning" / "clean" | Outfit suggestions never show me something that isn't actually available to wear right now |
| R3 | See a laundry forecast — "3 of your 5 work blouses are dirty, laundry soon" | I do laundry before I run out of options, not after |
| R4 | Pre-load a full week of outfits on Sunday night in under 5 minutes | Every morning is already decided |
| R5 | Tag items by occasion (WFH · office · school · evening) and have the app filter by today's occasion automatically | I only see outfits that are relevant to today's actual schedule |
| R6 | Hit a panic button for when I have 3 minutes to get dressed | I never show up looking chaotic |
| R7 | Import my closet from email receipts without photographing anything | Setup takes a morning, not a weekend |

---

**The feature Becca unlocks: Morning Mode + Laundry Forecast**

**Morning Mode** — a daily automated outfit briefing. At 6:30am (configurable), a notification arrives with one complete outfit — not a suggestion, a decision. NTW checks what's on her calendar, what's marked clean and available, the occasion tags. One outfit. Confirmed with a single tap. The entire interaction takes fewer than 10 seconds. No app-open required for the 90% case.

This only works if the laundry state is accurate. That's the constraint that makes R2 the foundational feature: if users can't mark items as dirty/in-wash/clean with minimal friction, Morning Mode is built on bad data.

**Laundry Forecast** — derived from item status across categories. "4 of 5 work blouses are dirty." "You have 2 clean workout sets left." A nudge before she runs out, not after. This connects directly to the availability spine: the app knows what's available because it knows what's clean. Laundry Forecast is the natural output of that data layer and costs almost nothing to build once status tracking is live.

---
---

## Persona 2 — The Closet Pair
### "Our Closet"

---

**The snapshot**

| | |
|---|---|
| Ages | 24–34 |
| Example | Two cousins — Arianna (LA) and Sofia (Milan) — who share clothes, live across cities, and travel constantly |
| Also includes | Roommates who share · partners who share · friends in the same city with lending relationships · people with multiple homes |
| Household | 2+ people with access to shared or overlapping wardrobes |
| Income | Variable — the pattern matters more than the income level |
| Phone | Both on iPhone. Both comfortable with apps. Sofia uses WhatsApp for everything. |
| Shopping | Independent but influential on each other. Sofia's finds end up in Arianna's wardrobe. Arianna's pieces travel. |
| Fashion identity | Complementary. They share because their taste overlaps. The sharing is an expression of closeness, not just convenience. |

---

**Their world**

Sofia took the dress to Italy. Not maliciously — it was sitting there, it was perfect for the trip, she assumed Arianna wouldn't mind. She was probably right. But Arianna spent two days looking for it, convinced it was lost, before she texted Sofia and found out it was in Milan.

That's the whole origin story. Not a technology failure — a visibility failure. The dress existed. It was fine. It was just invisible.

The Closet Pair shares clothes the way close people share things: casually, with trust, without paperwork. The problem is that casual sharing at scale — across cities, across seasons, across the low-grade chaos of two people living full lives — creates an information problem. Who has what. Where is it. Is it clean. When is it coming back. Is it even coming back.

They've tried texting about it. That works until it doesn't. They've tried a shared note. That lasted two weeks. What they actually need is a system that lives where the clothes live — and that treats lending as a first-class data event, not an afterthought.

---

**Their version of "nothing to wear"**

It's not nothing. It's: the thing I want is somewhere I can't reach. The grey blazer is in Arianna's apartment. Arianna is in New York. Sofia is in Milan. The blazer might as well be on the moon.

Or: the skirt came back from Sofia but it smells like her perfume and needs to be cleaned before it's wearable again. Is it available? Technically yes. Practically no.

Or: Arianna has been wearing Sofia's leather jacket for three months and has genuinely forgotten it isn't hers. This happens. This is the kindest version of the problem.

---

**Pain points (ranked)**

1. **Location blindness** — Shared items migrate. Without tracking, neither person knows where things are. The mental overhead of remembering is real and grows over time.
2. **Loan decay** — Borrowed items quietly become permanent loans. The lender forgets they lent it. The borrower forgets they borrowed it. The item disappears from both wardrobes effectively.
3. **Availability ambiguity** — Even when they know who has something, they don't know if it's clean, packed, or otherwise unavailable to return. "I'll bring it back soon" is not a status.
4. **No graceful way to ask** — "Can I have my dress back?" is an awkward text after month three. There's no neutral way to track this without it feeling transactional in a relationship built on casualness.
5. **Multi-location wardrobe blindness** — For people with two homes or who travel seasonally, a meaningful slice of the wardrobe is always elsewhere. They can't see the whole picture without being in all the places at once.

---

**What they want from an app**

- To know where things are — which city, which closet, which suitcase
- To mark something as "on loan to [person]" without it feeling like a formal transaction
- A gentle nudge when something has been out for too long — not accusatory, just informational
- To see the combined wardrobe — what's home, what's traveling, what's with the other person
- To borrow with explicit tracking: "I'm taking the grey blazer, back by Sunday"
- Status and availability surfaced at a glance, not requiring a text thread to figure out

---

**What they do NOT want**

- A system that makes sharing feel transactional or suspicious
- Notifications that feel like debt collection ("Sofia still has your dress after 47 days")
- Manual photography of everything before lending is possible
- A feature that requires both people to be power users for it to work
- Social media framing — this is private, trusted sharing, not public performance

---

**Quotes**

> "She took it to Italy. I didn't know it was in Italy. That's it. That's the whole app."

> "I don't need to track every item. Just the ones that move."

> "At some point I stopped thinking of her leather jacket as borrowed. That's probably bad."

> "I want to know what's home. Not everything — just: is the thing I want to wear tonight actually here."

> "I'm not going to text her to ask for my dress back. That's a weird text. I just want the app to know she has it."

---

**User stories**

| # | As the Closet Pair, I want to... | So that... |
|---|---|---|
| CP1 | Mark an item as "on loan to [person]" with an optional expected return date | My closet reflects reality — that item is listed as unavailable until it comes back |
| CP2 | See at a glance what's currently with another person | I know what I can and can't wear without texting to find out |
| CP3 | Receive a gentle nudge when a loaned item has been out for a defined period | I get a neutral prompt to follow up, rather than an awkward text I have to initiate |
| CP4 | Accept a borrow request from a trusted person and have it auto-update the item's location and status | The logistics of sharing happen in the app, not in a text thread |
| CP5 | Tag items by location (home · traveling · storage · with [person]) | I can filter my wardrobe to show only what's accessible right now |
| CP6 | See my combined availability view — what's clean, home, and not on loan | When I'm getting dressed, I see only what I actually have access to |
| CP7 | Invite a trusted person to see select items in my wardrobe | We can coordinate borrowing before either of us packs, not after |
| CP8 | Mark a returned item as "back home" with one tap | The wardrobe state updates instantly when something comes back |
| CP9 | See my wardrobe filtered by location ("what's with me in New York right now") | Packing and dressing decisions are based on what's actually present, not what I remember owning |

---

**The feature the Closet Pair unlocks: The Lending Circle + Location Tracking**

These are the two features the product was literally born to build. They are not additions to a styling app. They are the reason the app exists.

**The Lending Circle** — a private, trusted loan tracker. When an item is marked "on loan to [name]," it leaves the available pool. Its status updates. The lender's view reflects reality. The borrower (if they're also on NTW) sees it in their wardrobe as "borrowed." An optional return date creates a gentle nudge — not a demand, a reminder. The language is designed to never make the relationship feel transactional: "The grey blazer has been traveling with Sofia for 3 weeks — want to check in?" Not: "OVERDUE."

The Lending Circle is also the product's only native growth loop. Borrowing requires a trusted person to install the app. Every lend/borrow interaction is an implicit invitation. No competitor has this.

**Location Tracking** — items have a home label and a current location. Home: Arianna's LA apartment. Current: traveling, in storage, with Sofia, packed. The availability calculation is the intersection: clean AND home AND not on loan = available to wear. This single data model underpins Morning Mode (Becca), the Laundry Forecast (Becca), the Lending Circle (Closet Pair), and eventually multi-home support. It is the spine of the product.

**Strategic note:** The Closet Pair persona is the one no competitor serves, and it's the most defensible. Maya gets downloads. The Closet Pair gets retention, virality, and a network effect. Build for Maya's funnel — but protect this core.
