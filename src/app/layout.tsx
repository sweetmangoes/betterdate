import { ButtonLink, PlainButtonLink } from '@/components/elements/button'
import { Main } from '@/components/elements/main'
import {
  FooterCategory,
  FooterLink,
  FooterWithLinkCategories,
} from '@/components/sections/footer-with-link-categories'
import {
  NavbarLink,
  NavbarLogo,
  NavbarWithLinksActionsAndCenteredLogo,
} from '@/components/sections/navbar-with-links-actions-and-centered-logo'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Better Date — AI date plans for first dates and couples',
  description:
    'Take a short preference quiz and get a thoughtful local date plan — for first dates and couples who want intentional time together.',
}

function BetterDateMark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="font-display text-xl font-medium tracking-tight text-mauve-950 dark:text-white">
        Better Date
      </span>
    </span>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Figtree:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NavbarWithLinksActionsAndCenteredLogo
          id="navbar"
          links={
            <>
              <NavbarLink href="/#how-it-works">How it works</NavbarLink>
              <NavbarLink href="/#who">Who it’s for</NavbarLink>
              <NavbarLink href="/quiz" className="sm:hidden">
                Plan a date
              </NavbarLink>
            </>
          }
          logo={
            <NavbarLogo href="/">
              <BetterDateMark />
            </NavbarLogo>
          }
          actions={
            <>
              <PlainButtonLink href="/#how-it-works" className="max-sm:hidden">
                How it works
              </PlainButtonLink>
              <ButtonLink href="/quiz">Plan a date</ButtonLink>
            </>
          }
        />

        <Main>{children}</Main>

        <FooterWithLinkCategories
          id="footer"
          links={
            <>
              <FooterCategory title="Product">
                <FooterLink href="/quiz">Plan a date</FooterLink>
                <FooterLink href="/#how-it-works">How it works</FooterLink>
              </FooterCategory>
              <FooterCategory title="Audience">
                <FooterLink href="/#who">First dates</FooterLink>
                <FooterLink href="/#who">Couples</FooterLink>
              </FooterCategory>
              <FooterCategory title="Legal">
                <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
              </FooterCategory>
            </>
          }
          fineprint="© 2026 Better Date. Venue suggestions are AI-generated — always verify hours and reservations."
        />
      </body>
    </html>
  )
}
