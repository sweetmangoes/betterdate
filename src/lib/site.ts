import { getProduct } from '@betterdate/shared'

/** Canonical site origin for metadata, sitemap, and robots. */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) {
    return explicit.replace(/\/$/, '')
  }

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (production) {
    return `https://${production.replace(/\/$/, '')}`
  }

  const preview = process.env.VERCEL_URL?.trim()
  if (preview) {
    return `https://${preview.replace(/\/$/, '')}`
  }

  return 'http://localhost:3000'
}

const product = getProduct()

export const siteName = product.name

export const defaultDescription = product.description
