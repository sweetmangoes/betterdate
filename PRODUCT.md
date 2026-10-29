# Better Date family — Product overview

One AI planning engine, three products, each for a different kind of relationship. This is the "what are we building and why" doc. The detailed backlog lives in [`FEATURES.md`](./FEATURES.md).

| Product | Relationship | One-liner |
|---------|--------------|-----------|
| **Better Date** | Dating | AI planner for first dates and early dating. No history unless you pay. |
| **Better Boyfriend / Better Romance** (name undecided) | Committed relationship | AI planner that helps him plan better dates, built on her preferences and their history together. |
| **Better Hang** | Friendship | Plans hangouts, finds time to catch up, and nudges you to see people. |

All three share the same quiz, the same `/api/plan` endpoint, the same Google Places grounding, and the same Supabase login. Each product is a `ProductConfig` in `@betterdate/shared` selected by `NEXT_PUBLIC_PRODUCT`, not a separate codebase.

---

## Better Date — dating

**Who:** Someone planning a date, from first dates through the first few months of seeing someone.

**What it does:** Preference quiz → AI builds a multi-stop local plan from real Google Places venues → timing tips, conversation starters, backup idea.

**History model:** Free users get no stored history. Plans live on the device only. **Paid accounts** save past plans and dates.

**Growth:** Search and the blog ("first date ideas in [city]").

**Status:** Web shipped and deployed on Vercel. The iOS Expo app (Home, Quiz, Plan) is in progress.

---

## Better Boyfriend / Better Romance — relationships

**Name:** Undecided.
- **Better Boyfriend** is the sharper hook: "send him Better Boyfriend" is the marketing.
- **Better Romance** is more inclusive but more generic.

Either way, in-app copy should say "partner" so any couple can use it.

**Who:** Couples, especially girlfriends who want their boyfriend to plan more, and boyfriends who want to get it right.

**How it spreads:** She does a 3-minute web quiz without downloading anything, then texts him an invite link. He downloads the app already paired to her.

**Her side (web):**
- Preference profile: vibes, favorite food, coffee order, flowers, dietary needs, love language, "never again" list
- Hints: "that new omakase place looks good." She sees when he acts on one.
- Date teaser: she sees the time, dress code, and what to bring, but not the venues

**His side (iOS):**
- Home: countdown to the next anniversary or milestone, her new hints, a "plan a date" button
- Her cheat sheet: her profile as a quick reference
- Date plans grounded in her preferences and hints, with a "why she'll love it" note on each stop
- Pre-date checklist (reserve, flowers, and so on)

**History model:** Always on. Anniversaries, milestones, past dates, and hints used.

**Status:** Mockup only, in `mockups/better-boyfriend.html`.

---

## Better Hang — friendship

**Who:** Two friends, or a group of 3 to 8.

**What it does today:** Quiz → hangout plan. Meeting in the middle is the default for two friends, and "fair for everyone" uses two starting points for a group. Includes hang length options.

**Where it's going:**
- **Your people:** pick the friends you want to hang out with more (details below)
- **Book time to catch up:** find mutual free time across calendars, then plan into that slot
- **Suggestions:** "You haven't seen Alex in 6 weeks," driven by each person's "how often" goal

**Your people (signed-in users):**
- **Add people:** you type a name, and optionally their area and things to avoid ("doesn't drink"). The list is private, and they don't need an account. Later, you can invite someone on your list to join Better Hang and connect your accounts.
- **"How often" goal for each person:** every week, every 2 weeks, every month, or every few months. When someone is past their goal, Better Hang nudges you.
- **Plan with one tap:** "Plan a hang with Alex" opens the quiz set to two friends meeting in the middle, with Alex's area and dislikes filled in.
- **Hang log:** generating a plan with someone records the hang, which resets their goal and builds your history.
- **Groups (phase 2):** pick 3 or more people from your list, and it becomes a group plan.

**History model:** Your people list plus a hang log. Together they power the goals, nudges, and suggestions.

**Status:** Web shipped. Supabase login, account page, and saved preferences shipped. iOS later.

---

## Moving between Better Date and the relationship app

People move between dating and being in a relationship, so the products should let them move in both directions without starting over. One Supabase login covers both products.

**Dating → relationship:** A Better Date user starts seeing someone seriously and taps "Make it official."
- They get an invite link for their partner. When the partner joins, the two accounts are paired.
- Their saved Better Date plans with that person carry over as past dates.
- Their first date becomes the first milestone.

**Relationship → dating:** If a couple breaks up, either person can unpair.
- Their account goes back to Better Date. Their own preferences stay with them.
- **Open question:** what happens to the shared history (milestones, hints, past dates)? Options are to delete it for both, keep a private copy for each, or archive it. Decide before building pairing. Privacy and emotional tone both matter here.

---

## Shared foundation (build once, every product uses it)

| Piece | Better Date | Relationship app | Better Hang |
|-------|-------------|------------------|-------------|
| Quiz + `/api/plan` + Places | Yes | Yes | Yes |
| Supabase login | Optional | Required | Optional |
| Saved plans | Paid only | Always | Always |
| People (partner or friends) | No | One partner, paired | Friends list |
| Events (dates, milestones, hangouts) | Paid only | Always | Always |
| Calendar (free time, invites) | Later | Yes | Core feature |
| Pairing / invite links | Used when someone moves to the relationship app | Core feature | Group invites later |

Build the history tables (plans, people, events) once in Supabase with a `product` column, the same way `preference_profiles` works today.

---

## Features by product

Every idea so far, matched to the product(s) it belongs to.

Key: **Shipped** · **Planned** (on the roadmap) · **Later** · **Paid** (paid accounts only) · **Optional** (fits, but not core) · **No** (doesn't apply)

### Planning engine

| Feature | Better Date | Relationship app | Better Hang |
|---------|-------------|------------------|-------------|
| Preference quiz | Shipped | Planned (her profile replaces the quiz) | Shipped (pair or group of 3–8) |
| AI plan (`gpt-4o-mini`) | Shipped | Planned (uses her profile + hints) | Shipped |
| Google Places grounding (real venues, Maps links) | Shipped | Planned | Shipped |
| Meeting modes: halfway, near me, near them, neighborhood | Shipped | Optional (for couples who don't live together) | Shipped |
| “Meet in the middle” as a named feature | No | No | Shipped |
| “Fair for everyone” group mode | No | No | Shipped |
| Location autocomplete with nearby towns + browser location | Shipped | Planned | Shipped |
| Duration / how long to hang | Optional | Optional | Shipped |
| Backup idea | Shipped | Planned | Shipped |
| Conversation starters | Shipped | Optional | No (removed) |
| “Why she'll love it” note per stop | No | Planned | No |
| Plan another with a tweak | Later | Later | Later |
| Weather-aware backups | Later | Later | Later |
| Budget estimate from menus | Later | Later | Later |

### After the plan

| Feature | Better Date | Relationship app | Better Hang |
|---------|-------------|------------------|-------------|
| Pre-date checklist (reserve, outfit, meetup point) | Planned | Planned (adds flowers, gifts from her profile) | Planned (lighter) |
| Calendar invite (`.ics`, Google Calendar link) | Planned | Planned | Planned |
| Email invite | Later | Later | Later |
| Reservation links (OpenTable, Resy, venue site) | Planned | Planned | Planned |
| In-app booking (only with partner API access) | Later | Later | Later |
| Share plan (text / share sheet) | Planned | Planned (as a teaser) | Planned (to the group) |
| Date teaser (time, dress code, what to bring, no venues) | No | Planned | No |
| Push reminders | Later (“date night tomorrow”) | Planned (anniversaries, upcoming dates) | Planned (catch-up nudges) |

### Time and calendars

| Feature | Better Date | Relationship app | Better Hang |
|---------|-------------|------------------|-------------|
| Find your own free time (EventKit on iOS, Google on web) | Later | Planned | Planned |
| Find time you're both / all free | Later | Planned | Planned (core: “book time to catch up”) |
| Plan into a chosen time slot | Later | Planned | Planned |
| Apple Calendar invitations | Later | Later | Later |

### People and history

| Feature | Better Date | Relationship app | Better Hang |
|---------|-------------|------------------|-------------|
| Saved preferences | Planned | Planned | Shipped |
| Saved plans / date history | Paid | Planned (always on) | Planned (always on) |
| Her profile / cheat sheet | No | Planned | No |
| Hints from her | No | Planned | No |
| Anniversaries, milestones, countdown | No | Planned | No |
| “Your people”: pick who you want to hang with more (private names) | No | No | Planned |
| “How often” goal per person (week / 2 weeks / month / few months) | No | No | Planned |
| “Plan a hang with Alex” (quiz prefilled from their details) | No | No | Planned |
| Hang log (recorded when you plan with someone) | No | No | Planned |
| “You haven't seen Alex in 6 weeks” suggestions | No | No | Planned |
| Invite someone from your list to connect accounts | No | No | Later |
| Pick 3+ people from your list for a group plan | No | No | Planned (phase 2) |
| Connect friends' accounts so one person can set time and a plan for others (your referral idea) | No | No | Later |
| Pairing + invite link | Planned (“Make it official”) | Planned (core) | Later (group invites) |
| Move between Better Date and relationship app | Planned | Planned | No |

### Accounts and payments

| Feature | Better Date | Relationship app | Better Hang |
|---------|-------------|------------------|-------------|
| Supabase login | Planned (optional) | Planned (required) | Shipped (optional) |
| Sign in with Apple | Later | Later | Later |
| 1 anonymous plan, then sign in | Planned (build last) | No (accounts required) | To decide |
| Free: 1 plan / week · Pro: unlimited | Planned (build last) | To decide | To decide |
| Stripe (web) + Apple in-app purchase (iOS) | Planned (build last) | Planned | Planned |
| Server-side usage limits | Planned | Planned | Planned |

### Platforms and growth

| Feature | Better Date | Relationship app | Better Hang |
|---------|-------------|------------------|-------------|
| Web app | Shipped | Planned (her side) | Shipped |
| iOS app | In progress (Expo) | Planned (his side) | Later |
| TestFlight / App Store | Planned | Later | Later |
| Android | Later | Later | Later |
| Light SEO (robots, sitemap, metadata) | Shipped | Planned | Shipped |
| Google Search Console + custom domain | Planned (you liked “No Bad Dates” as a name/URL) | Planned | Planned |
| Blog for search traffic | Planned | Later | Later |
| Invite / referral as the main growth loop | No | Planned (she invites him) | Later |
| Pricing page | Needs rewrite (still the template) | Planned | Planned |

---

## Shipped vs. not yet

**Shipped**
- Quiz, AI plan (`gpt-4o-mini`), Google Places grounding, four meeting modes
- `@betterdate/shared` schemas shared by web and iOS
- Better Date web, light SEO, Vercel deploy
- Better Hang web, Supabase login, account page, saved preferences
- iOS Expo app for Better Date (Home, Quiz, Plan)

**Not yet**
- Pre-date checklist, calendar invites, reservation links
- Find free time (calendar access)
- Saved plans and history tables
- Pairing and invite links
- Payments (Stripe on web, Apple in-app purchase on iOS)
- Relationship app (beyond the mockup)
- Better Hang on iOS
- **Pricing page:** `src/app/pricing/page.tsx` is still the "Oatmeal" template, including the joke FAQs. Don't link to it until it's rewritten.

---

## Open decisions

1. **Name:** Better Boyfriend or Better Romance.
2. **Breakups:** what happens to shared history when a couple unpairs.
3. **Ship order:** Better Date on iOS is the current 30-day plan. The relationship app's web side (her quiz, invite, hints) is the strongest growth bet, because every signup brings in a second user.
4. **Payments:** which features are paid in each product, and whether one subscription covers all three.
