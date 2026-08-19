import type { Metadata } from 'next'

import { getProduct } from '@/lib/product'

const product = getProduct()

export const metadata: Metadata = {
  title: product.quizPageTitle,
  description: product.quizPageDescription,
  openGraph: {
    title: `${product.quizPageTitle} — ${product.name}`,
    description: product.quizPageDescription,
  },
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children
}
