import { friendsProduct } from './products/friends'
import { dateProduct } from './products/date'
import type { PlanCandidate } from './candidates'
import type { PlanQuizAnswers, QuizStep } from './quiz'

export type ProductId = 'date' | 'friends'

export type QuizOption<T extends string | number = string> = {
  value: T
  label: string
  description?: string
}

export type LandingCopy = {
  eyebrow: string
  headline: string
  subheadline: string
  howEyebrow: string
  howHeadline: string
  howSubheadline: string
  steps: Array<{ headline: string; subheadline: string }>
  whoEyebrow: string
  whoHeadline: string
  whoSubheadline: string
  whoItems: Array<{ headline: string; body: string }>
  ctaHeadline: string
  ctaSubheadline: string
  ctaButton: string
}

export type AboutCopy = {
  eyebrow: string
  headline: string
  subheadline: string
  missionEyebrow: string
  missionHeadline: string
  missionSubheadline: string
  missionBody: string
  visionEyebrow: string
  visionHeadline: string
  visionSubheadline: string
  visionBody: string
  ctaHeadline: string
  ctaSubheadline: string
  ctaButton: string
}

export type ProductConfig = {
  id: ProductId
  name: string
  description: string
  titleDefault: string
  planStorageKey: string
  quizStorageKey: string
  ctaLabel: string
  conversationStartersLabel: string
  planEyebrow: string
  emptyPlanMessage: string
  footerFineprint: string
  quizPageTitle: string
  quizPageDescription: string
  planPageTitle: string
  planPageDescription: string
  aboutPageDescription: string
  privacyPageDescription: string
  constraintsPlaceholder: string
  locationYourLabel: string
  locationTheirLabel: string
  locationNeighborhoodLabel: string
  errorMissingApiKey: string
  errorCouldNotGenerate: string
  errorInvalidPlan: string
  schemaName: string
  schemaDescription: string
  groundedSchemaName: string
  groundedSchemaDescription: string
  planSystemPrompt: string
  groundedPlanSystemPrompt: string
  emptyQuizAnswers: PlanQuizAnswers
  parseQuizAnswers: (body: unknown) =>
    | { success: true; data: PlanQuizAnswers }
    | { success: false; error: { flatten: () => unknown } }
  getQuizSteps: (answers: PlanQuizAnswers) => QuizStep[]
  audienceOptions?: readonly QuizOption[]
  hangoutOptions?: readonly QuizOption[]
  groupSizeOptions?: readonly QuizOption<number>[]
  getMeetingPreferenceOptions: (answers: PlanQuizAnswers) => readonly QuizOption[]
  occasionOptions: readonly QuizOption[]
  vibeOptions: readonly QuizOption[]
  budgetOptions: readonly QuizOption[]
  timeOptions: readonly QuizOption[]
  energyOptions: readonly QuizOption[]
  buildPlanPrompt: (answers: PlanQuizAnswers, candidates?: PlanCandidate[]) => string
  buildSearchQueries: (answers: PlanQuizAnswers, areaLabel: string) => string[]
  landing: LandingCopy
  about: AboutCopy
}

const products: Record<ProductId, ProductConfig> = {
  date: dateProduct,
  friends: friendsProduct,
}

/** Active product from deploy env. Defaults to Better Date. */
export function getProductId(): ProductId {
  const raw = process.env.NEXT_PUBLIC_PRODUCT ?? process.env.EXPO_PUBLIC_PRODUCT ?? 'date'
  return raw === 'friends' ? 'friends' : 'date'
}

export function getProduct(productId: ProductId = getProductId()): ProductConfig {
  return products[productId]
}

export function getProductForAnswers(answers: PlanQuizAnswers): ProductConfig {
  return getProduct(answers.product === 'friends' ? 'friends' : 'date')
}
