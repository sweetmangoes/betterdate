# Better Date — Feature backlog

Living list of product ideas beyond the current MVP (quiz → AI plan, no accounts).

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

## Later ideas

| Feature | Status | Notes |
|---------|--------|--------|
| User accounts + saved plans | `later` | Required for email invites, history, couple sharing |
| Couple share link | `later` | One plan, two people; edit vibes together |
| “Plan another” with tweak | `later` | Reuse last quiz answers; regenerate |
| Weather-aware backups | `later` | Pull forecast for date night; prefer indoor if rain |
| Budget estimate from menus | `later` | Rough; don’t overclaim accuracy |
| Mobile app | `later` | PWA first is enough for a long time |
| Payments / premium | `later` | Rate-limit free plans; Places cost may force this |

---

## Suggested build order

1. **Google Places** — accuracy is the core promise  
2. **SEO / indexing basics** — robots, sitemap, metadata, Search Console (needed as soon as we’re on a public URL)  
3. **Blog** — content marketing that compounds with indexing  
4. **Date/time + `.ics` / Google Calendar link** — high value, no auth  
5. **Reserve deep links** on food/drink stops  
6. **Accounts + email invites** when retention matters  
7. **Partner reservation APIs** only after Places + demand prove it out

---

## Env keys (future)

```
OPENAI_API_KEY=           # shipped
GOOGLE_MAPS_API_KEY=      # Places + Geocoding
RESEND_API_KEY=           # optional email invites
# OpenTable / Resy partner credentials — only if approved
```

Update this file when priorities change or a feature ships.
