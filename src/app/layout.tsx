import { ButtonLink, PlainButtonLink } from '@/components/elements/button'
import { AuthNav, AuthNavMobileLink } from '@/components/elements/auth-nav'
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
import { getProduct, getProductId } from '@/lib/product'
import { defaultDescription, getSiteUrl, siteName } from '@/lib/site'
import type { Metadata } from 'next'
import './globals.css'

const product = getProduct()
const siteUrl = getSiteUrl()
const textingFirst = product.id === 'date'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: product.titleDefault,
    template: `%s — ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName,
    title: product.titleDefault,
    description: defaultDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: product.titleDefault,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
}

function ProductMark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span
        className={
          textingFirst
            ? 'font-display text-xl font-medium tracking-tight text-rose-700 dark:text-rose-300'
            : 'font-display text-xl font-medium tracking-tight text-mauve-950 dark:text-white'
        }
      >
        {product.name}
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
    <html lang="en" data-product={getProductId()}>
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
              {textingFirst && <NavbarLink href="/pricing">Pricing</NavbarLink>}
              <NavbarLink href="/about">About</NavbarLink>
              <AuthNavMobileLink />
              <NavbarLink href={textingFirst ? '/#text-us' : '/quiz'} className="sm:hidden">
                {textingFirst ? 'Text me' : product.ctaLabel}
              </NavbarLink>
            </>
          }
          logo={
            <NavbarLogo href="/">
              <ProductMark />
            </NavbarLogo>
          }
          actions={
            <>
              <AuthNav />
              <PlainButtonLink href="/#how-it-works" className="max-sm:hidden lg:hidden">
                How it works
              </PlainButtonLink>
              <ButtonLink href={textingFirst ? '/#text-us' : '/quiz'}>
                {textingFirst ? 'Text me' : product.ctaLabel}
              </ButtonLink>
            </>
          }
        />

        <Main className={textingFirst ? undefined : 'overflow-clip'}>{children}</Main>

        <FooterWithLinkCategories
          id="footer"
          links={
            <>
              <FooterCategory title="Product">
                {textingFirst && <FooterLink href="/#text-us">Text me</FooterLink>}
                <FooterLink href="/quiz">{textingFirst ? 'Take the quiz' : product.ctaLabel}</FooterLink>
                <FooterLink href="/#how-it-works">How it works</FooterLink>
                {textingFirst && <FooterLink href="/pricing">Pricing</FooterLink>}
              </FooterCategory>
              <FooterCategory title="Company">
                <FooterLink href="/about">About</FooterLink>
                {!textingFirst && <FooterLink href="/#who">Who it’s for</FooterLink>}
              </FooterCategory>
              <FooterCategory title="Legal">
                <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
                {textingFirst && <FooterLink href="/sms-terms">SMS Terms</FooterLink>}
              </FooterCategory>
            </>
          }
          fineprint={product.footerFineprint}
        />
      </body>
    </html>
  )
}
