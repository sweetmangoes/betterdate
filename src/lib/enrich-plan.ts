import {
  type DatePlan,
  type GroundedPlanDraft,
  type PlanCandidate,
} from '@betterdate/shared'

import { normalizePlaceId } from '@/lib/places'

/** Strip Google Place IDs the model sometimes leaks into user-facing copy. */
export function scrubPlaceIdsFromCopy(text: string, candidates: PlanCandidate[]): string {
  let result = text

  for (const place of candidates) {
    const escaped = place.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(`\\s*\\(id:\\s*${escaped}\\)`, 'gi'), '')
    result = result.replace(new RegExp(escaped, 'g'), place.name)
  }

  result = result.replace(/\s*\(id:\s*[A-Za-z0-9_-]+\)/gi, '')
  result = result.replace(/\bplaces\/[A-Za-z0-9_-]+\b/g, '')
  return result.replace(/\s{2,}/g, ' ').trim()
}

function resolveCandidate(
  placeId: string,
  byId: Map<string, PlanCandidate>,
): PlanCandidate | undefined {
  const normalized = normalizePlaceId(placeId)
  return byId.get(normalized) ?? byId.get(placeId)
}

export function enrichPlanFromCandidates(
  draft: GroundedPlanDraft,
  candidates: PlanCandidate[],
): DatePlan {
  const byId = new Map(candidates.map((c) => [normalizePlaceId(c.id), c]))
  const usedIds = new Set<string>()

  const stops = draft.stops
    .map((stop) => {
      let place = resolveCandidate(stop.placeId, byId)

      // Model occasionally invents/typos an id — fall back to an unused candidate
      if (!place || usedIds.has(place.id)) {
        place = candidates.find((candidate) => !usedIds.has(normalizePlaceId(candidate.id)))
      }

      if (!place) return null

      usedIds.add(place.id)

      return {
        order: stop.order,
        name: place.name,
        neighborhood: place.neighborhood,
        category: stop.category,
        timeHint: stop.timeHint,
        whyItFits: scrubPlaceIdsFromCopy(stop.whyItFits, candidates),
        tip: scrubPlaceIdsFromCopy(stop.tip, candidates),
        placeId: place.id,
        address: place.address,
        mapsUrl: place.mapsUrl,
        rating: place.rating,
      }
    })
    .filter((stop): stop is NonNullable<typeof stop> => stop != null)
    .map((stop, index) => ({ ...stop, order: index + 1 }))

  if (stops.length < 2) {
    throw new Error('Model returned unknown placeId: not enough valid stops after enrichment')
  }

  return {
    title: scrubPlaceIdsFromCopy(draft.title, candidates),
    summary: scrubPlaceIdsFromCopy(draft.summary, candidates),
    estimatedCost: draft.estimatedCost,
    duration: draft.duration,
    stops,
    conversationStarters: draft.conversationStarters.map((s) =>
      scrubPlaceIdsFromCopy(s, candidates),
    ),
    backupIdea: scrubPlaceIdsFromCopy(draft.backupIdea, candidates),
    disclaimer: scrubPlaceIdsFromCopy(draft.disclaimer, candidates),
  }
}
