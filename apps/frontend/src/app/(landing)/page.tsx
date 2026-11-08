import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { pricing } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing';
import { LandingPage } from '@gitroom/frontend/components/landing/landing.page';

export const dynamic = 'force-dynamic';

const description =
  'Schedule posts to X, LinkedIn, Instagram, TikTok and 24 more channels, with approvals, bulk CSV import, best-time suggestions and a caption library.';

export const metadata: Metadata = {
  title: 'Castkite · Social media scheduling for busy teams',
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Castkite',
    title: 'Castkite · Write it once. Launch it everywhere.',
    description,
  },
  twitter: {
    card: 'summary',
    title: 'Castkite · Write it once. Launch it everywhere.',
    description,
  },
};

const plans = ['STANDARD', 'TEAM', 'PRO', 'ULTIMATE'];

export default function Home() {
  // self-hosted installs (no billing) have no marketing page: straight to sign-in
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    redirect('/auth');
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Castkite',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description,
    offers: plans.map((plan) => ({
      '@type': 'Offer',
      name: plan.charAt(0) + plan.slice(1).toLowerCase(),
      price: pricing[plan].month_price,
      priceCurrency: 'USD',
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPage />
    </>
  );
}
