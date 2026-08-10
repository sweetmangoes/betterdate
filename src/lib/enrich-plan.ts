import {
  type DatePlan,
  type GroundedPlanDraft,
  type PlanCandidate,
} from '@betterdate/shared'

/** Strip Google Place IDs the model sometimes leaks into user-facing copy. */
export function scrubPlaceIdsFromCopy(text: string, candidates: PlanCandidate[]): string {
  let result = text

  for (const place of candidates) {
    const escaped = place.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(`\\s*\\(id:\\s*${escaped}\\)`, 'gi'), '')
    result = result.replace(new RegExp(escaped, 'g'), place.name)
  }

  result = result.replace(/\s*\(id:\s*[A-Za-z0-9_-]+\)/gi, '')
  return result.replace(/\s{2,}/g, ' ').trim()
}

export function enrichPlanFromCandidates(
  draft: GroundedPlanDraft,
  candidates: PlanCandidate[],
): DatePlan {
  const byId = new Map(candidates.map((c) => [c.id, c]))

  const stops = draft.stops.map((stop) => {
    const place = byId.get(stop.placeId)
    if (!place) {
      throw new Error(`Model returned unknown placeId: ${stop.placeId}`)
    }

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
