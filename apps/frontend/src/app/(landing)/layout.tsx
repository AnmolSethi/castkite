import '../landing.scss';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { brandFont } from '@gitroom/frontend/fonts/space-grotesk/space.grotesk.font';
import { LandingShell } from '@gitroom/frontend/components/landing/landing.shell';

export const metadata: Metadata = {
  metadataBase: process.env.FRONTEND_URL
    ? new URL(process.env.FRONTEND_URL)
    : undefined,
};

// Public marketing pages: their own root layout, without the app's providers
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${brandFont.className} light bg-[#fffdf5]`}>
        <LandingShell>{children}</LandingShell>
      </body>
    </html>
  );
}
