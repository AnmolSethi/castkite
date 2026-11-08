import { ReactNode } from 'react';
import Link from 'next/link';
import { getT } from '@gitroom/react/translation/get.translation.service.backend';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';

export const SOURCE_URL = 'https://github.com/AnmolSethi/kitepost';

export const landingButton =
  'inline-flex items-center justify-center h-[52px] px-[24px] border-2 border-black bg-brand text-black text-[16px] font-[700] shadow-[4px_4px_0_0_#000] transition-[transform,box-shadow] duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-black';

const navLink =
  'underline-offset-[6px] decoration-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[4px] focus-visible:outline-black';

// Header and footer shared by the landing page and the legal pages
export const LandingShell = async ({ children }: { children: ReactNode }) => {
  const t = await getT();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-[#fffdf5] text-[#111111]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-[12px] focus:start-[12px] focus:z-50 focus:bg-white focus:border-2 focus:border-black focus:px-[12px] focus:py-[8px]"
      >
        {t('landing_skip_to_content', 'Skip to content')}
      </a>
      <header className="border-b-2 border-black bg-[#fffdf5]">
        <nav
          aria-label={t('landing_main_navigation', 'Main')}
          className="max-w-[1200px] mx-auto px-[20px] h-[76px] flex items-center gap-[32px]"
        >
          <Link href="/" aria-label="Castkite" className={navLink}>
            <LogoTextComponent />
          </Link>
          <ul className="hidden md:flex items-center gap-[28px] text-[15px] font-[600]">
            <li>
              <Link href="/#features" className={navLink}>
                {t('landing_nav_features', 'Features')}
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className={navLink}>
                {t('landing_nav_pricing', 'Pricing')}
              </Link>
            </li>
            <li>
              <Link href="/#faq" className={navLink}>
                {t('landing_nav_faq', 'FAQ')}
              </Link>
            </li>
          </ul>
          <div className="ms-auto flex items-center gap-[20px] text-[15px] font-[600]">
            <Link href="/auth/login" className={navLink}>
              {t('landing_sign_in', 'Sign in')}
            </Link>
            <Link
              href="/auth"
              className={`${landingButton} !h-[42px] !px-[16px] !text-[14px] hidden sm:inline-flex`}
            >
              {t('landing_start_scheduling', 'Start scheduling')}
            </Link>
          </div>
        </nav>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t-2 border-black">
        <div className="max-w-[1200px] mx-auto px-[20px] py-[40px] flex flex-col md:flex-row gap-[24px] md:items-center">
          <LogoTextComponent />
          <p className="text-[14px] font-mono">
            © {year} Castkite
          </p>
          <ul className="md:ms-auto flex flex-wrap gap-x-[24px] gap-y-[8px] text-[14px] font-[600]">
            <li>
              <Link href="/terms" className={navLink}>
                {t('landing_terms', 'Terms of Service')}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={navLink}>
                {t('landing_privacy', 'Privacy Policy')}
              </Link>
            </li>
            <li>
              <a href={SOURCE_URL} className={navLink}>
                {t('landing_source_code', 'Source code')}
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};
