import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your date plan',
  description: 'Your personalized Better Date itinerary.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return children
}
