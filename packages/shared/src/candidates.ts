export type PlanCandidate = {
  id: string
  name: string
  address: string
  neighborhood: string
  rating?: number
  priceLevel?: string
  mapsUrl: string
  primaryType?: string
}

export function formatCandidateList(candidates: PlanCandidate[]): string {
  return candidates
    .map((place, index) => {
      const rating = place.rating != null ? `rating ${place.rating}` : 'no rating'
      const price = place.priceLevel ? `, ${place.priceLevel}` : ''
      const type = place.primaryType ?? 'place'
      return `${index + 1}. id=${place.id} | ${place.name} | ${place.address} | ${type} | ${rating}${price}`
    })
    .join('\n')
}
