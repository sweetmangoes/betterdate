import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plan a date',
  description:
    'Answer a short preference quiz and get a thoughtful local date plan for a first date or couples night.',
  openGraph: {
    title: 'Plan a date — Better Date',
    description:
      'Answer a short preference quiz and get a thoughtful local date plan for a first date or couples night.',
  },
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children
}
