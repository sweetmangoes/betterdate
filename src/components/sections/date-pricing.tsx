import { ButtonLink } from '@/components/elements/button'

const freePerks = ['1 date plan a week', 'Reminders to book, plus a check-in after', 'No account needed']
const proPerks = ['Unlimited plans', 'Remembers your past dates', '“Last time was sushi — try something new”']

export function DatePricingCards({ ctaHref = '/#text-us' }: { ctaHref?: string }) {
  return (
    <div className="mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
      <div className="rounded-3xl border border-rose-600 bg-mauve-50 p-7 dark:border-rose-400 dark:bg-white/5">
        <p className="text-sm font-bold text-mauve-950 dark:text-white">Free</p>
        <p className="mt-2 font-display text-4xl text-mauve-950 dark:text-white">$0</p>
        <p className="mt-1 text-sm text-mauve-500">Start here</p>
        <ul className="mt-5 space-y-2 text-sm/6 text-mauve-700 dark:text-mauve-400">
          {freePerks.map((perk) => (
            <li key={perk}>{perk}</li>
          ))}
        </ul>
        <ButtonLink href={ctaHref} size="lg" className="mt-6">
          Text me
        </ButtonLink>
      </div>
      <div className="rounded-3xl border border-mauve-950/15 bg-mauve-50 p-7 dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-bold text-mauve-950 dark:text-white">Pro</p>
        <p className="mt-2 font-display text-4xl text-mauve-950 dark:text-white">Soon</p>
        <p className="mt-1 text-sm text-mauve-500">Not available yet</p>
        <ul className="mt-5 space-y-2 text-sm/6 text-mauve-700 dark:text-mauve-400">
          {proPerks.map((perk) => (
            <li key={perk}>{perk}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
