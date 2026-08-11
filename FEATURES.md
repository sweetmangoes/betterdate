# Better Date — Feature backlog

Living list of product ideas beyond the current MVP (quiz → AI plan, no accounts).

**Mission:** Eliminate bad dates by helping plan thoughtful and intentional dates based on our users’ preferences.  
**Vision:** A world without bad dates.

Status key: `shipped` · `next` · `planned` · `later`

---

## Shipped (MVP)

| Feature | Notes |
|---------|--------|
| Preference quiz | 9 steps: audience, meeting preference, location(s), occasion, budget, time, energy, vibes, constraints |
| AI date plan | OpenAI `gpt-4o-mini` structured itinerary via `/api/plan` |
| Plan result page (web) | Timeline, conversation starters, backup idea; `sessionStorage` |
| Marketing landing + About | Mission/vision; how it works; who it’s for |
| Monorepo + shared schemas | `packages/shared` for quiz/plan Zod types |
| iOS Expo app (SDK 54) | Home → quiz → plan; calls deployed API; AsyncStorage; Expo Go compatible |
| Vercel deploy | Public HTTPS API for mobile |
| Google Places grounding | Places-first search → LLM picks only from real candidates; Maps links on plan |
| Meeting location modes | Halfway (midpoint), near me, near them, or a specific neighborhood |
| Light SEO | `robots.ts`, `sitemap.ts`, metadataBase / OG / per-page titles; `/plan` noindex |

---

## Next / planned

### 1. Google Places grounding — `shipped`

**Why:** Stop inventing venues; only plan from real local results.

**Shipped approach:** Resolve search center from meeting preference (midpoint between both locations, near me, near them, or a neighborhood) → geocode → 2–4 Text Searches from vibes/budget → LLM selects by `placeId` only → enrich stops with address, rating, Maps URL.

**Meeting modes:**
- **Halfway** — geocode both people, search around the geographic midpoint with a radius that scales with distance
- **Near me / near them** — bias Places search to that person’s location
- **Neighborhood** — geocode the chosen area and keep results walkable nearby

**Needs:** `GOOGLE_MAPS_API_KEY` with Places API (New) + Geocoding enabled. Falls back to AI-only inventing if key is missing (dev).

**Touchpoints:** `packages/shared` quiz schema, `src/lib/places.ts` (`resolveSearchCenter`), `src/lib/enrich-plan.ts`, `src/app/api/plan/route.ts`, web/iOS quiz + plan UIs

---

### 2. Pre-date checklist — `planned`

**Why:** A recommended plan isn’t done until the user prepares. A checklist turns the itinerary into action and reduces last-minute bad-date friction (forgot to book, no outfit plan, no meetup spot).

**What it is:** After a plan is generated, show a **to-do checklist** tailored to that plan (and audience: first date vs couple).

**Example items (AI- and/or template-generated):**

- Confirm / reserve restaurant or bar (link out when available)
- Check hours / weather for outdoor stops
- Pick meetup point and time
- Share plan with date (text / share sheet)
- Add to calendar
- Transit / parking note
- Conversation starters reviewed (first dates)
- Backup idea noted if weather turns

**Approach (phased):**

| Phase | What | How |
|-------|------|-----|
| A | Static + plan-aware template checklist | Rules from stop categories (food → “reserve?”, walk → “check weather”) on web + iOS |
| B | AI-generated checklist in plan JSON | Extend `datePlanSchema` with `checklist: [{ id, label, doneDefault? }]` |
| C | Interactive checkboxes | Persist checked state (`sessionStorage` / AsyncStorage); no accounts yet |
| D | Deep-link actions on items | “Reserve” / “Open Maps” / “Add to calendar” from checklist rows |

**Needs:** Plan page UI (web + iOS); optional schema field; pairs well with calendar + reserve deep links.

**Touchpoints:** `packages/shared` plan schema, web `/plan`, `apps/mobile` Plan screen

---

### 3. Calendar invite for the date — `planned`

**Why:** Make the plan feel real and easy to commit to.

**Approach (phased):**

| Phase | What | How |
|-------|------|-----|
| A | Download `.ics` | Generate ICS on the client/server from plan stops + chosen date/time; no auth |
| B | “Add to Google Calendar” link | Deep link / Google Calendar template URL with title, details, times |
| C | Email invite | Needs email capture or auth; send via Resend/Postmark with `.ics` attachment |
| D | Shared couple invite | Auth + two emails / share link; later |

**Needs (phase A/B):** User picks date + start time on plan page (missing today).  
**Needs (phase C+):** Email provider and/or accounts.

**Touchpoints:** plan page date/time picker, `src/lib/calendar.ts`, optional `/api/calendar`

---

### 3b. Find free time (read calendars) — `planned`

**Why:** Planning a date fails when nobody knows when both people are free. Reading calendars (with permission) surfaces mutual open windows before we generate or lock a plan.

**What it is:** After (or before) the preference quiz, optionally connect calendars and suggest **shared free slots** for the date — then generate/attach the plan to a chosen slot.

**Approach (phased):**

| Phase | What | How |
|-------|------|-----|
| A | Solo free times (iOS) | EventKit: read user’s busy blocks locally; suggest open evenings this week (no cloud sync) |
| B | Solo free times (web) | Google Calendar API (OAuth) — freeBusy query for the signed-in user |
| C | Two-person overlap | Both connect calendars (or one shares a free/busy link); compute intersection of free windows |
| D | Plan into slot | Pick a free slot → generate plan for that time → add to calendar / invite |

**Privacy rules:** Request minimum scopes (`calendar.freebusy` / EventKit busy only — not full event titles when possible); clear consent copy; never store raw calendar event details long-term unless user opts in.

**Needs:** Sign-in (Supabase) for Google OAuth on web; Apple calendar permission on iOS; couples flow needs accounts or a share link.

**Platform notes:**
- **iOS:** EventKit first (native, no Google required)
- **Web:** Google Calendar freeBusy
- **Apple Calendar invitations** (later) can reuse the chosen slot

**Touchpoints:** quiz or pre-plan “When are you free?” step, `src/lib/availability.ts`, iOS EventKit module, Google OAuth + freeBusy API

---

### 4. Reservations (OpenTable, Resy, …) — `planned`

**Why:** Close the loop from “idea” to “booked table.”

**Reality check:** Most reservation apps do **not** offer open “book any restaurant for any user” APIs for third-party consumer apps. Expect deep links and partner programs first; full in-app booking later (if ever).

**Approach (phased):**

| Phase | What | How |
|-------|------|-----|
| A | Deep links | For each food/drink stop, link “Reserve on OpenTable / Resy / restaurant site” using known URL patterns or Places website |
| B | Availability hints | Where partners allow: widget embeds or affiliate/partner APIs for specific venues |
| C | In-app hold/book | Only with official partner access; store booking refs on a user account |

**Practical v1:** After Places enrichment, if venue has a website / known OT/Resy page → show **Reserve** CTA. Do not claim a reservation was made unless a real booking API confirms it.

**Needs:** Places (website, place id), optional OpenTable/Resy partner accounts, clear UX copy (“Opens OpenTable — you finish the booking”)

**Touchpoints:** plan stop actions, `src/lib/reservations.ts`

---

### 5. Blog (content marketing) — `planned`

**Why:** SEO + trust. Rank for “first date ideas [city]”, “intentional date night”, etc., and funnel readers into the quiz.

**Approach:**

| Phase | What | How |
|-------|------|-----|
| A | `/blog` index + post pages | MDX or markdown in-repo (`content/blog/*.mdx`); Next.js App Router |
| B | Nav + footer links | “Blog” in layout; CTA on posts → Start the quiz |
| C | Editorial cadence | City guides, first-date tips, couple date themes; 1–2 posts to start |
| D | CMS (optional) | Sanity/Contentful later if non-devs write; MDX is enough early |

**Needs:** Post template (title, date, description, OG image), author byline optional, internal links to `/quiz`.

**Touchpoints:** `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `content/blog/`, nav/footer in `layout.tsx`

---

### 6. Search indexing & SEO basics — `shipped` (light) · Search Console `later`

**Why:** The app won’t show up in Google unless we make it crawlable and submit it for indexing. Marketing pages + blog only help if search engines can find them.

**Shipped:**
| Item | Notes |
|------|--------|
| `robots.ts` | Allows `/`; disallows `/plan` and `/api/`; points to sitemap |
| `sitemap.ts` | `/`, `/about`, `/quiz`, `/privacy-policy` (blog URLs when posts ship) |
| Root + page metadata | `metadataBase`, title template, Open Graph / Twitter, canonicals |
| `/plan` noindex | Session-specific plan results stay out of search |

**Still todo:**
| Item | Notes |
|------|--------|
| Google Search Console | Verify property, submit sitemap, request indexing |
| Custom domain / `NEXT_PUBLIC_SITE_URL` | Set canonical production URL in Vercel env |
| Blog URLs in sitemap | When blog ships |
| Performance / Core Web Vitals | Keep landing fast |

**Touchpoints:** `src/lib/site.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`, `layout.tsx` + page/layout metadata

---

### 7. iOS app (Apple-first) + web — `next` · 30-day MVP goal

**Platform decision:** **iOS first.** Android is phase 1.5 (same Expo codebase; no Play polish in the 30-day window).

**Why Apple-first:** Dating early adopters skew iPhone in US/Canada; one store to nail; Apple Developer / TestFlight is the long pole; Expo keeps Android as a later build, not a rewrite.

**Stack:** Expo (React Native) for iOS · Next.js for API + marketing web

```text
[Expo iOS]     ──POST /api/plan──► [Next.js API]
[Web /quiz]    ──same API───────► [Next.js API]
[Web /] [/about] [/blog]         marketing + SEO
[Android]                        deferred — keep project buildable, don’t ship
```

**MVP definition (day 30):** A user can take the quiz on **iPhone (TestFlight)** or **web**, get a **Places-backed** local plan, share it, add it to Calendar, and open Maps / a reserve link.

#### In scope (30 days)

| Area | Deliverable |
|------|-------------|
| **Web API** | Deployed Next.js (Vercel); `/api/plan` with OpenAI + Google Places |
| **Web product** | Quiz + plan UI updated for real venues (address, Maps link) |
| **Web marketing** | Landing + about (shipped); basic SEO (robots, sitemap, metadata) |
| **iOS app** | Splash → quiz → plan → persist last plan → share sheet → calendar → Maps/reserve deep links |
| **Distribution** | TestFlight for testers; App Store submit if ready (approval may land after day 30) |

#### Out of scope (30 days)

- Android / Play Store polish (optional: smoke-compile only)
- Accounts, push, email invites, couple sharing
- In-app OpenTable/Resy booking (deep links only)
- Blog cadence / CMS (at most one post if leftover time)
- Payments

#### Shared engineering practices

| Practice | Why |
|----------|-----|
| Shared Zod schemas (`quiz` / `plan`) | Web + iOS stay in sync |
| AI + Places only on server | Keys never in the IPA |
| Design quiz/plan for phone first | Web follows; thumb-friendly |
| Ship a TestFlight build every week | Catch signing/review issues early |

#### Week-by-week plan

**MVP (day 30):** Quiz on **iPhone (TestFlight)** or **web** → **Places-backed** plan → share → Calendar → Maps / reserve link.

**Days 1–7 — Foundation**

- Deploy Next.js to Vercel (HTTPS API URL for the app)
- Apple Developer account; Expo + EAS set up (iOS)
- Scaffold Expo app (`apps/mobile`): splash → quiz shell → plan shell
- Extract shared Zod schemas so web/iOS don’t drift
- Light SEO: `robots.ts`, `sitemap.ts`, metadata — **shipped**
- First TestFlight build (even if UI is rough)

**Days 8–14 — iOS core + Places start**

- Finish iOS quiz → `POST /api/plan` → plan screen
- Persist last plan on device
- Start Google Places on the API (geocode + 2–4 searches → LLM only picks from results)
- Wire Maps links on plan stops (web + iOS)

**Days 15–21 — Close the loop**

- Finish Places enrichment (rating, address, maps URL)
- Calendar: pick date/time + add to Apple Calendar / `.ics` on web
- System share sheet (iOS) + simple copy on web
- Reserve deep links (OpenTable/Resy/website — open externally, don’t fake bookings)
- Error/empty states, loading, API key failures

**Days 22–30 — Ship the demo**

- TestFlight with real testers; fix crashes
- Privacy policy / listing copy aligned with AI + Places
- Web: quiz/plan polish to match iOS flows (not a redesign)
- Blog: optional — one post max if time; don’t block MVP
- Submit App Store if ready; otherwise TestFlight “MVP demo” is still valid
- Android / Play: deferred (phase 1.5 after day 30)

**Out of scope for these 30 days:** accounts, push, email invites, in-app booking, Android store polish, payments.

#### Needs

- Apple Developer Program ($99/yr)
- Expo EAS Build (iOS)
- Vercel (or similar) production URL
- `OPENAI_API_KEY` + `GOOGLE_MAPS_API_KEY`

**Touchpoints:** `apps/mobile` (Expo, iOS focus), `packages/shared` (quiz/plan schemas), `src/lib/places.ts` (upcoming), `src/app/api/plan/route.ts`, web `/quiz` + `/plan`


---

## Later ideas

| Feature | Status | Notes |
|---------|--------|--------|
| Payments / premium | `later` · **build last** | Free: **1 plan / week** after signup; Pro: unlimited via Stripe (web) + Apple IAP (iOS); Supabase |
| User accounts + saved plans | `later` · **build last** | Supabase Auth; **1 anonymous plan first**, then require sign-in |
| Sign in with Apple | `later` | iOS auth |
| Apple Calendar invitations | `later` | EventKit invitee flow |
| Find free time (read calendars) | `planned` | EventKit (iOS) + Google freeBusy (web); suggest mutual open slots before planning |
| **Android / Play Store** | `later` · phase 1.5 | Same Expo app; start after Week 4 iOS MVP |
| Couple share link | `later` | One plan, two people; edit vibes together |
| “Plan another” with tweak | `later` | Reuse last quiz answers; regenerate |
| Weather-aware backups | `later` | Pull forecast for date night; prefer indoor if rain |
| Budget estimate from menus | `later` | Rough; don’t overclaim accuracy |
| Push reminders (“Date night tomorrow”) | `later` | Needs accounts + notification permission |
| Blog cadence / CMS | `later` | After MVP; SEO compounds once indexing works |
| Capacitor/PWA fallback | `later` | Only if Expo path stalls; not the primary bet |

---

## After the 4 weeks

1. Android internal build + Play listing  
2. Blog content cadence  
3. Partner reservation APIs  
4. **Monetization last:** Supabase Auth + usage · 1 anonymous plan → sign-in · free 1/week · Stripe (web) + Apple IAP (iOS) · saved plans for Pro  

**Explicit tradeoff:** These 4 weeks = **Places + iOS + web product loop**. Not Android polish, not booking partnerships, not accounts/paywall.

---

## Monetization + Supabase — `later` (build last)

**Mission fit:** Free users can try Better Date; paid users get unlimited intentional planning. Caps protect OpenAI/Places cost.

### Tiers

| Tier | Limit | Notes |
|------|--------|--------|
| **Free** | **1 date plan per week** | Resets on a rolling 7-day window or calendar week (pick one at implement time; default: rolling 7 days from last plan) |
| **Pro (paid)** | **Unlimited** plans | History, sync, richer checklist/calendar features over time |

Also enforce a server-side sanity limit (e.g. burst protection) even for Pro to stop abuse.

### Supabase (source of truth)

| Table | Purpose |
|-------|---------|
| `profiles` | `tier` (`free` \| `pro`), Stripe / Apple customer ids |
| `usage` | `user_id`, period key, `plans_generated` (or `last_plan_at` for weekly free cap) |
| `date_plans` | Saved quiz answers + plan JSON (Pro; optional light save for free) |

**Enforce on `/api/plan`:** check auth → check free weekly cap → call AI/Places → record usage → return plan. Never trust the client for limits.

### Payments

| Surface | Billing |
|---------|---------|
| Web | Stripe Checkout → webhook sets `profiles.tier = pro` |
| iOS | Apple In-App Purchase (StoreKit) → App Store Server Notifications update same `tier` |

### Auth (locked)

- **Allow 1 anonymous plan first** (device/session keyed lightly — e.g. cookie or device id — just enough to block immediate spam).  
- After that, **require sign-in** to continue (free = 1/week, Pro = unlimited).  
- **Build order:** implement monetization / Supabase / paywall **last** — after Places, checklist, calendar, and iOS product loop feel solid.

### Apple-native (iOS, later)

EventKit calendar + invitations, Sign in with Apple, StoreKit, Share Sheet, MapKit — see Later ideas.

---

## Env keys (future)

```
OPENAI_API_KEY=           # shipped
GOOGLE_MAPS_API_KEY=      # Places + Geocoding
NEXT_PUBLIC_SITE_URL=     # canonical public URL for sitemap/OG (falls back to Vercel URL)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # server only — usage / webhooks
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=           # optional email invites
# OpenTable / Resy partner credentials — only if approved
```

Update this file when priorities change or a feature ships.
