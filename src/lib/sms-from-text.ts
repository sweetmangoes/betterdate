import { dateQuizAnswersSchema, type DateQuizAnswers } from '@betterdate/shared'

const VIBE_KEYWORDS: { match: RegExp; vibe: DateQuizAnswers['vibes'][number] }[] = [
  { match: /\b(cozy|quiet|low[- ]key|chill|easy|slow)\b/i, vibe: 'cozy' },
  { match: /\b(sushi|food|dinner|taco|pizza|eat|restaurant|ramen)\b/i, vibe: 'foodie' },
  { match: /\b(hike|walk|park|outdoor|patio|canal)\b/i, vibe: 'outdoorsy' },
  { match: /\b(museum|gallery|show|theatre|theater|live music|concert)\b/i, vibe: 'culture' },
  { match: /\b(game|playful|arcade|fun|drinks|bar|cocktail|pub)\b/i, vibe: 'playful' },
]

const KNOWN_AREAS =
  /\b(Ottawa|Montreal|Toronto|Vancouver|Halifax|Glebe|Orleans|Elgin|Kanata|Westboro|Hintonburg|Centretown|Byward|ByWard Market)\b/i

/** Pull a neighborhood or city out of a last-minute vibe text. */
export function extractLocation(text: string): string | null {
  const near = text.match(/\b(?:in|near|around)\s+(?:the\s+)?([A-Za-z][A-Za-z\s'-]{1,40}?)(?:,|$|\.|!)/i)
  if (near?.[1] && near[1].trim().length >= 2) return near[1].trim()
  const known = text.match(KNOWN_AREAS)
  return known?.[1] ?? null
}

function extractVibes(text: string): DateQuizAnswers['vibes'] {
  const found: DateQuizAnswers['vibes'] = []
  for (const { match, vibe } of VIBE_KEYWORDS) {
    if (match.test(text) && !found.includes(vibe)) found.push(vibe)
    if (found.length === 2) break
  }
  return found
}

function extractOccasion(text: string): DateQuizAnswers['occasion'] {
  if (/\banniversary\b/i.test(text)) return 'anniversary'
  if (/\b(tonight|today|weeknight|monday|tuesday|wednesday|thursday)\b/i.test(text)) return 'weeknight'
  if (/\b(friday|saturday|sunday|weekend)\b/i.test(text)) return 'weekend'
  return 'just_because'
}

function extractBudget(text: string): DateQuizAnswers['budget'] {
  if (/\b(under\s*\$?\s*40|cheap|budget|inexpensive)\b/i.test(text) || /\b\$\b/.test(text)) return '$'
  if (/\b(under\s*\$?\s*80|\$\$)\b/i.test(text)) return '$$'
  if (/\b(treat|splurge|\$\$\$)\b/i.test(text)) return '$$$'
  return '$$'
}

/** Returns quiz answers when we have enough to plan; otherwise null (usually missing an area). */
export function answersFromSmsText(text: string, area?: string | null): DateQuizAnswers | null {
  const location = area?.trim() || extractLocation(text)
  if (!location) return null

  const vibes = extractVibes(text)
  const parsed = dateQuizAnswersSchema.safeParse({
    product: 'date',
    audience: /\b(anniversary|girlfriend|boyfriend|wife|husband|partner|couple)\b/i.test(text) ? 'couple' : 'first_date',
    meetingPreference: 'neighborhood',
    location,
    occasion: extractOccasion(text),
    budget: extractBudget(text),
    time: /\b(morning|brunch)\b/i.test(text) ? 'morning' : /\bafternoon\b/i.test(text) ? 'afternoon' : 'evening',
    energy: /\badventurous\b/i.test(text) ? 'adventurous' : /\b(cozy|easy|chill|low[- ]key)\b/i.test(text) ? 'low_key' : 'mixed',
    vibes: vibes.length ? vibes.slice(0, 2) : ['cozy'],
    constraints: text.trim().slice(0, 400),
  })
  return parsed.success ? parsed.data : null
}
