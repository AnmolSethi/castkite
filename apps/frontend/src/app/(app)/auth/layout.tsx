import { getT } from '@gitroom/react/translation/get.translation.service.backend';

export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import loadDynamic from 'next/dynamic';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
import { MantineWrapper } from '@gitroom/react/helpers/mantine.wrapper';
import { Toaster } from '@gitroom/react/toaster/toaster';
const ReturnUrlComponent = loadDynamic(() => import('./return.url.component'));
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getT();

  return (
    <MantineWrapper>
      <Toaster />
      <div className="bg-[#0E0E0E] flex flex-1 p-[12px] gap-[12px] min-h-screen w-screen text-white">
        {/*<style>{`html, body {overflow-x: hidden;}`}</style>*/}
        <ReturnUrlComponent />
        <div className="flex flex-col py-[40px] px-[20px] flex-1 lg:w-[600px] lg:flex-none rounded-[12px] text-white p-[12px] bg-[#1A1919]">
          <div className="w-full max-w-[440px] mx-auto justify-center gap-[20px] h-full flex flex-col text-white">
            <LogoTextComponent />
            <div className="flex">{children}</div>
          </div>
        </div>
        <div className="flex-1 hidden lg:flex flex-col justify-center px-[64px] gap-[32px] rounded-[12px] bg-brand text-black border-2 border-black">
          <h2 className="text-[56px] font-[700] leading-[1] tracking-[-2px] max-w-[560px]">
            Plan it. Queue it. Post everywhere.
          </h2>
          <ul className="flex flex-col gap-[12px] text-[18px] font-[500] max-w-[480px]">
            {[
              'Schedule to 28+ social and chat channels',
              'See your whole week on one calendar',
              'Track what performs with built-in analytics',
              'Bring your team into one workspace',
            ].map((item) => (
              <li
                key={item}
                className="bg-white border-2 border-black shadow-[4px_4px_0_0_#000] px-[16px] py-[12px]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MantineWrapper>
  );
}
