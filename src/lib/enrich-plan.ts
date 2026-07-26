import {
  type DatePlan,
  type GroundedPlanDraft,
  type PlanCandidate,
} from '@betterdate/shared'

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
      whyItFits: stop.whyItFits,
      tip: stop.tip,
      placeId: place.id,
      address: place.address,
      mapsUrl: place.mapsUrl,
      rating: place.rating,
    }
  })

  return {
    title: draft.title,
    summary: draft.summary,
    estimatedCost: draft.estimatedCost,
    duration: draft.duration,
    stops,
    conversationStarters: draft.conversationStarters,
    backupIdea: draft.backupIdea,
    disclaimer: draft.disclaimer,
  }
}
