import type { Metadata } from 'next'

import { getProduct } from '@/lib/product'

const product = getProduct()

export const metadata: Metadata = {
  title: product.planPageTitle,
  description: product.planPageDescription,
  robots: {
    index: false,
    follow: false,
  },
}

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return children
}
