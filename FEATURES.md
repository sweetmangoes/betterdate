# Better Date — Feature backlog

Living list of product ideas beyond the current MVP (quiz → AI plan, no accounts).

**Mission:** Eliminate bad dates by helping plan thoughtful and intentional dates based on our users’ preferences.  
**Vision:** A world without bad dates.

Status key: `shipped` · `next` · `planned` · `later`

---

## Shipped (MVP)

| Feature | Notes |
|---------|--------|
| Preference quiz | 8 steps: audience, location, occasion, budget, time, energy, vibes, constraints |
| AI date plan | OpenAI `gpt-4o-mini` structured itinerary via `/api/plan` |
| Plan result page | Timeline, conversation starters, backup idea; `sessionStorage` only |
| Marketing landing | Brand, how it works, who it’s for |

---

## Next / planned

### 1. Google Places grounding — `next`

**Why:** Stop inventing venues; only plan from real local results.

**Approach:** Places-first pipeline

1. Geocode city/neighborhood (Geocoding or Places)
2. Run 2–4 Text/Nearby searches from quiz vibes + budget
3. Pass candidate venues (id, name, address, rating, price, maps URL) into the LLM
4. Prompt: only choose/order from that list
5. Enrich plan stops with Maps links + “verify hours” still shown

**Needs:** Google Cloud project, billing, Places API (New), `GOOGLE_MAPS_API_KEY`

**Cost note:** Places calls dominate spend (~$0.06–$0.13/plan after free tier); LLM stays cheap.

**Touchpoints:** `src/lib/places.ts`, update `src/app/api/plan/route.ts`, extend plan schema + `/plan` UI

---

### 2. Calendar invite for the date — `planned`

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

### 3. Reservations (OpenTable, Resy, …) — `planned`

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

### 4. Blog (content marketing) — `planned`

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

### 5. Search indexing & SEO basics — `planned`

**Why:** The app won’t show up in Google unless we make it crawlable and submit it for indexing. Marketing pages + blog only help if search engines can find them.

**Must-do checklist:**

| Item | Notes |
|------|--------|
| Public marketing routes indexable | `/`, `/blog`, `/blog/[slug]`, `/about` — allow crawling |
| Do **not** index ephemeral plans | `/plan` (and quiz mid-flow if needed): `noindex` — personal/session content |
| `robots.txt` | Allow site; point to sitemap |
| `sitemap.xml` | Landing, blog index, all posts; regenerate when posts ship |
| Metadata | Unique `title` / `description` / Open Graph per page |
| Google Search Console | Verify property, submit sitemap, request indexing for key URLs |
| Canonical URLs | Stable production domain once deployed |
| Performance / Core Web Vitals | Helps ranking; keep landing + blog fast |

**Needs:** Production URL (Vercel or similar), Search Console access, sitemap route (`src/app/sitemap.ts`, `src/app/robots.ts`).

**Touchpoints:** `layout.tsx` metadata, per-page `metadata` / `generateMetadata`, `robots.ts`, `sitemap.ts`

---

### 6. iOS app (Apple-first) + web — `next` · 30-day MVP goal

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
- Light SEO: `robots.ts`, `sitemap.ts`, metadata (fast win while deploying)
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

**Touchpoints:** `apps/mobile` (Expo, iOS focus), `src/lib/places.ts`, `src/app/api/plan/route.ts`, shared schemas, web `/quiz` + `/plan`

---

## Later ideas

| Feature | Status | Notes |
|---------|--------|--------|
| **Android / Play Store** | `later` · phase 1.5 | Same Expo app; start after Week 4 iOS MVP |
| User accounts + saved plans | `later` | Required for email invites, history, couple sharing |
| Couple share link | `later` | One plan, two people; edit vibes together |
| “Plan another” with tweak | `later` | Reuse last quiz answers; regenerate |
| Weather-aware backups | `later` | Pull forecast for date night; prefer indoor if rain |
| Budget estimate from menus | `later` | Rough; don’t overclaim accuracy |
| Push reminders (“Date night tomorrow”) | `later` | Needs accounts + notification permission |
| Payments / premium | `later` | Rate-limit free plans; Places cost may force this |
| Blog cadence / CMS | `later` | After MVP; SEO compounds once indexing works |
| Capacitor/PWA fallback | `later` | Only if Expo path stalls; not the primary bet |

---

## After the 4 weeks

1. Android internal build + Play listing  
2. Blog content cadence  
3. Accounts + email invites  
4. Partner reservation APIs  

**Explicit tradeoff:** These 4 weeks = **Places + iOS + web product loop**. Not Android polish, not booking partnerships, not accounts.

---

## Env keys (future)

```
OPENAI_API_KEY=           # shipped
GOOGLE_MAPS_API_KEY=      # Places + Geocoding
RESEND_API_KEY=           # optional email invites
# OpenTable / Resy partner credentials — only if approved
```

Update this file when priorities change or a feature ships.
