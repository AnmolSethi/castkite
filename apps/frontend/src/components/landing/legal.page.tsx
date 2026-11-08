import { ReactNode } from 'react';

// Details only the owner can supply (legal name, address, contact):
// highlighted so a missing one is obvious on the live page
export const Fill = ({ children }: { children: ReactNode }) => (
  <mark className="bg-brand px-[4px] font-mono text-[0.9em]">[{children}]</mark>
);

export const LegalSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-[12px] border-t-2 border-black pt-[24px]">
    <h2 className="text-[24px] font-[700] tracking-[-0.02em]">{title}</h2>
    <div className="flex flex-col gap-[12px] text-[17px] leading-[1.65] [&_ul]:list-disc [&_ul]:ps-[24px] [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-[6px] [&_a]:underline [&_a]:underline-offset-[4px]">
      {children}
    </div>
  </section>
);

// Legal text stays in English on purpose: a translated contract needs a lawyer,
// not the app's translation files
export const LegalPage = ({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) => (
  <article className="max-w-[760px] mx-auto px-[20px] py-[56px] md:py-[96px] flex flex-col gap-[32px]">
    <header className="flex flex-col gap-[12px]">
      <h1 className="text-[44px] md:text-[64px] font-[700] leading-[1] tracking-[-0.04em]">
        {title}
      </h1>
      <p className="font-mono text-[13px] uppercase tracking-[0.12em]">
        Last updated {updated}
      </p>
    </header>
    {children}
  </article>
);
