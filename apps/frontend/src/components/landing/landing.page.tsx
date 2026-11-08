import { ReactNode } from 'react';
import Link from 'next/link';
import { getT } from '@gitroom/react/translation/get.translation.service.backend';
import { pricing } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing';
import {
  landingButton,
  SOURCE_URL,
} from '@gitroom/frontend/components/landing/landing.shell';

type T = Awaited<ReturnType<typeof getT>>;

const container = 'max-w-[1200px] mx-auto px-[20px]';
const eyebrow = 'font-mono text-[13px] uppercase tracking-[0.12em]';
const sectionTitle =
  'text-[36px] md:text-[52px] font-[700] leading-[1.02] tracking-[-0.03em]';
const panel = 'bg-white border-2 border-black shadow-[6px_6px_0_0_#000]';

const plans = ['STANDARD', 'TEAM', 'PRO', 'ULTIMATE'] as const;

const channels = [
  ['x', 'X'],
  ['linkedin', 'LinkedIn'],
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['tiktok', 'TikTok'],
  ['youtube', 'YouTube'],
  ['threads', 'Threads'],
  ['bluesky', 'Bluesky'],
  ['pinterest', 'Pinterest'],
  ['reddit', 'Reddit'],
  ['mastodon', 'Mastodon'],
  ['discord', 'Discord'],
  ['telegram', 'Telegram'],
  ['slack', 'Slack'],
  ['medium', 'Medium'],
  ['wordpress', 'WordPress'],
] as const;

const ChannelIcon = ({ id, name }: { id: string; name: string }) => (
  <img
    src={`/icons/platforms/${id}.png`}
    alt={name}
    width={28}
    height={28}
    loading="lazy"
    className="w-[28px] h-[28px] rounded-full border-2 border-black bg-white"
  />
);

// The hero's product moment: one post, stamped onto each channel in turn
const HeroComposer = ({ t }: { t: T }) => {
  const rows = [
    ['x', 'X', t('landing_demo_scheduled', 'Scheduled 09:00'), 'bg-brand'],
    ['linkedin', 'LinkedIn', t('landing_demo_scheduled', 'Scheduled 09:00'), 'bg-brand'],
    ['threads', 'Threads', t('landing_demo_best_time', 'Best time 09:15'), 'bg-brand'],
    ['instagram', 'Instagram', t('landing_demo_needs_approval', 'Needs approval'), 'bg-white'],
  ];

  return (
    <div aria-hidden="true" className="relative">
      <div className={`${panel} p-[20px] md:p-[24px]`}>
        <div className="flex items-center justify-between border-b-2 border-black pb-[12px]">
          <span className={eyebrow}>{t('landing_demo_new_post', 'New post')}</span>
          <span className="font-mono text-[13px]">
            {t('landing_demo_date', 'Tue, 12 May · 09:00')}
          </span>
        </div>
        <p className="py-[16px] text-[17px] leading-[1.45]">
          {t(
            'landing_demo_post',
            'Bulk scheduling is live. Upload one CSV, fill your calendar for the month, and get your Mondays back.'
          )}
        </p>
        <ul className="flex flex-col border-t-2 border-black">
          {rows.map(([id, name, status, color], index) => (
            <li
              key={id}
              className="flex items-center gap-[12px] py-[10px] border-b border-dashed border-black last:border-b-0"
            >
              <ChannelIcon id={id} name="" />
              <span className="font-[600] text-[15px]">{name}</span>
              <span
                className={`landing-stamp ms-auto font-mono text-[12px] uppercase border-2 border-black px-[8px] py-[3px] ${color}`}
                style={{ animationDelay: `${600 + index * 450}ms` }}
              >
                {status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ApprovalFragment = ({ t }: { t: T }) => (
  <div aria-hidden="true" className={`${panel} divide-y-2 divide-black`}>
    {[
      ['linkedin', 'LinkedIn', 'Maya R.', t('landing_frag_approval_1', 'Q3 hiring post')],
      ['instagram', 'Instagram', 'Sam K.', t('landing_frag_approval_2', 'Launch carousel')],
    ].map(([id, name, author, title]) => (
      <div key={id} className="flex items-center gap-[12px] p-[14px]">
        <ChannelIcon id={id} name={name} />
        <div className="flex flex-col min-w-0">
          <span className="font-[600] text-[15px] truncate">{title}</span>
          <span className="font-mono text-[12px]">{author}</span>
        </div>
        <span className="ms-auto flex gap-[6px] text-[13px] font-[700]">
          <span className="border-2 border-black bg-brand px-[10px] py-[4px]">
            {t('landing_frag_approve', 'Approve')}
          </span>
          <span className="border-2 border-black px-[10px] py-[4px] hidden sm:inline">
            {t('landing_frag_reject', 'Reject')}
          </span>
        </span>
      </div>
    ))}
  </div>
);

const CsvFragment = ({ t }: { t: T }) => (
  <div aria-hidden="true" className={`${panel} overflow-hidden font-mono text-[12px]`}>
    <div className="grid grid-cols-[88px_80px_1fr] bg-black text-brand px-[12px] py-[8px] uppercase">
      <span>date</span>
      <span>channel</span>
      <span>content</span>
    </div>
    {[
      ['05-12 09:00', 'X', t('landing_frag_csv_1', 'Bulk scheduling is live…')],
      ['05-13 12:30', 'LinkedIn', t('landing_frag_csv_2', 'How we plan a month…')],
      ['05-14 17:00', 'Threads', t('landing_frag_csv_3', 'Three CSV tips…')],
    ].map(([date, channel, content]) => (
      <div
        key={date}
        className="grid grid-cols-[88px_80px_1fr] px-[12px] py-[9px] border-t-2 border-black"
      >
        <span>{date}</span>
        <span>{channel}</span>
        <span className="truncate">{content}</span>
      </div>
    ))}
    <div className="border-t-2 border-black px-[12px] py-[10px] bg-brand font-[700] text-[13px]">
      {t('landing_frag_csv_ready', '500 rows · all ready to schedule')}
    </div>
  </div>
);

const BestTimeFragment = ({ t }: { t: T }) => {
  const bars = [2, 3, 5, 9, 14, 11, 7, 6, 8, 12, 6, 4];
  return (
    <div aria-hidden="true" className={`${panel} p-[16px]`}>
      <div className="flex items-end gap-[6px] h-[110px] border-b-2 border-black">
        {bars.map((height, index) => (
          <span
            key={index}
            className={`flex-1 border-2 border-b-0 border-black ${
              height >= 11 ? 'bg-brand' : 'bg-[#fffdf5]'
            }`}
            style={{ height: `${height * 7}px` }}
          />
        ))}
      </div>
      <div className="flex justify-between font-mono text-[11px] pt-[6px]">
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
      </div>
      <p className="mt-[12px] text-[14px] font-[600]">
        {t('landing_frag_best', 'Suggested: 10:00 and 15:00 · 1.8× more engagement')}
      </p>
    </div>
  );
};

const CaptionFragment = ({ t }: { t: T }) => (
  <div aria-hidden="true" className={`${panel} p-[14px] flex flex-col gap-[10px]`}>
    <div className="border-2 border-black px-[12px] py-[8px] font-mono text-[13px]">
      {t('landing_frag_search', 'Search: launch')}
    </div>
    {[
      [t('landing_frag_snippet_1', 'Launch sign-off'), '#buildinpublic #saas'],
      [t('landing_frag_snippet_2', 'Webinar invite'), t('landing_frag_snippet_2_text', 'Save your seat →')],
    ].map(([name, text]) => (
      <div key={name} className="flex items-center gap-[12px] border-2 border-black p-[10px]">
        <div className="flex flex-col min-w-0">
          <span className="font-[700] text-[14px]">{name}</span>
          <span className="text-[13px] truncate">{text}</span>
        </div>
        <span className="ms-auto border-2 border-black bg-brand px-[10px] py-[4px] text-[13px] font-[700]">
          {t('landing_frag_insert', 'Insert')}
        </span>
      </div>
    ))}
  </div>
);

const Feature = ({
  number,
  title,
  text,
  children,
}: {
  number: string;
  title: string;
  text: string;
  children: ReactNode;
}) => (
  <article className="flex flex-col gap-[20px] p-[24px] md:p-[40px] border-black">
    <span className="font-mono text-[14px]">{number}</span>
    <h3 className="text-[28px] md:text-[32px] font-[700] leading-[1.1] tracking-[-0.02em]">
      {title}
    </h3>
    <p className="text-[17px] leading-[1.55] max-w-[440px]">{text}</p>
    <div className="mt-auto pt-[8px]">{children}</div>
  </article>
);

export const LandingPage = async () => {
  const t = await getT();
  const from = pricing.STANDARD.month_price;

  const faq = [
    [
      t('faq_what_are_channels', 'What are channels?'),
      t(
        'faq_postiz_gitroom_allows_you_to_schedule_posts',
        'Castkite allows you to schedule your posts between different channels.'
      ),
    ],
    [
      t('landing_faq_bulk', 'Can I schedule a lot of posts at once?'),
      t(
        'landing_faq_bulk_answer',
        'Yes. Upload a CSV with a date, channel and content column and schedule up to 500 posts in one go. Every row is checked before anything is scheduled.'
      ),
    ],
    [
      t('faq_what_are_team_members', 'What are team members?'),
      t(
        'faq_if_you_have_a_team_with_multiple_members',
        'If you have a team with multiple members, you can invite them to your workspace to collaborate on your posts and add their personal channels'
      ),
    ],
    [
      t('landing_faq_cancel', 'Can I cancel anytime?'),
      t(
        'landing_faq_cancel_answer',
        'Yes. You cancel from your settings in two clicks, without talking to anyone.'
      ),
    ],
    [
      t('faq_can_i_trust_postiz_gitroom', 'Can I trust Castkite?'),
      t(
        'faq_postiz_gitroom_is_proudly_open_source',
        'Castkite is proudly open-source!'
      ),
    ],
  ];

  return (
    <>
      <section className="border-b-2 border-black overflow-hidden">
        <div className={`${container} grid lg:grid-cols-12 gap-[48px] py-[56px] md:py-[96px] items-center`}>
          <div className="lg:col-span-7 flex flex-col gap-[28px]">
            <p className={eyebrow}>
              {t('landing_hero_eyebrow', 'Social media scheduling · Open source')}
            </p>
            <h1 className="text-[48px] sm:text-[64px] lg:text-[84px] font-[700] leading-[0.95] tracking-[-0.045em]">
              {t('landing_hero_title_1', 'Write it once.')}{' '}
              <span className="bg-brand px-[6px] box-decoration-clone">
                {t('landing_hero_title_2', 'Launch it everywhere.')}
              </span>
            </h1>
            <p className="text-[19px] md:text-[21px] leading-[1.5] max-w-[560px]">
              {t(
                'landing_hero_text',
                'Castkite schedules your posts to X, LinkedIn, Instagram, TikTok and 24 more channels, with approvals, bulk CSV import and best-time suggestions built in. From ${{price}} a month.',
                { price: from }
              )}
            </p>
            <div className="flex flex-wrap items-center gap-[24px]">
              <Link href="/auth" className={landingButton}>
                {t('landing_start_scheduling', 'Start scheduling')}
              </Link>
              <Link
                href="#pricing"
                className="text-[16px] font-[700] underline underline-offset-[6px] decoration-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[4px] focus-visible:outline-black"
              >
                {t('landing_see_pricing', 'See pricing')}
              </Link>
            </div>
            <p className="font-mono text-[13px]">
              {t('landing_hero_trust', 'AGPL-3.0 · Cancel anytime from settings')}
            </p>
          </div>
          <div className="lg:col-span-5">
            <HeroComposer t={t} />
          </div>
        </div>
      </section>

      <section aria-labelledby="channels-title" className="border-b-2 border-black bg-black text-white">
        <div className={`${container} py-[28px] flex flex-col md:flex-row md:items-center gap-[20px]`}>
          <h2 id="channels-title" className="font-mono text-[13px] uppercase tracking-[0.12em] text-brand shrink-0">
            {t('landing_channels_title', '28+ channels')}
          </h2>
          <ul className="flex flex-wrap gap-[10px]">
            {channels.map(([id, name]) => (
              <li key={id}>
                <ChannelIcon id={id} name={name} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="features" aria-labelledby="features-title" className="border-b-2 border-black scroll-mt-[20px]">
        <div className={`${container} pt-[72px] md:pt-[112px] pb-[40px]`}>
          <p className={eyebrow}>{t('landing_features_eyebrow', 'Built for teams that post a lot')}</p>
          <h2 id="features-title" className={`${sectionTitle} mt-[16px] max-w-[820px]`}>
            {t('landing_features_title', 'The four things a busy social calendar actually needs.')}
          </h2>
        </div>
        <div className={`${container} pb-[72px] md:pb-[112px]`}>
          <div className="grid md:grid-cols-2 border-2 border-black bg-[#fffdf5] [&>*]:border-black [&>*:nth-child(n+2)]:border-t-2 md:[&>*:nth-child(2)]:border-t-0 md:[&>*:nth-child(even)]:border-s-2">
            <Feature
              number="01"
              title={t('landing_feature_approvals_title', 'Nothing goes out unchecked.')}
              text={t(
                'landing_feature_approvals_text',
                'Turn on approvals and every post from your team waits in one queue. An admin approves it and it is scheduled, or sends it back as a draft.'
              )}
            >
              <ApprovalFragment t={t} />
            </Feature>
            <Feature
              number="02"
              title={t('landing_feature_csv_title', 'A month of posts in one upload.')}
              text={t(
                'landing_feature_csv_text',
                'Plan in a spreadsheet, upload the CSV, check the preview and schedule up to 500 posts at once. Rows with a problem are flagged before anything goes out.'
              )}
            >
              <CsvFragment t={t} />
            </Feature>
            <Feature
              number="03"
              title={t('landing_feature_best_title', 'Post when your audience is awake.')}
              text={t(
                'landing_feature_best_text',
                'Castkite looks at how your recent posts performed on each channel and suggests the hours that do best, ready to add to your posting times.'
              )}
            >
              <BestTimeFragment t={t} />
            </Feature>
            <Feature
              number="04"
              title={t('landing_feature_captions_title', 'Your best lines, one click away.')}
              text={t(
                'landing_feature_captions_text',
                'Save sign-offs, hashtag sets and calls to action in a shared caption library, search them by name and drop them into any post.'
              )}
            >
              <CaptionFragment t={t} />
            </Feature>
          </div>
        </div>
      </section>

      <section id="pricing" aria-labelledby="pricing-title" className="border-b-2 border-black bg-brand scroll-mt-[20px]">
        <div className={`${container} py-[72px] md:py-[112px]`}>
          <p className={eyebrow}>{t('landing_pricing_eyebrow', 'Pricing')}</p>
          <h2 id="pricing-title" className={`${sectionTitle} mt-[16px] max-w-[760px]`}>
            {t('landing_pricing_title', 'Simple plans. Pick by channels and team size.')}
          </h2>
          <ul className="mt-[48px] grid sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
            {plans.map((plan) => {
              const tier = pricing[plan];
              const highlight = plan === 'TEAM';
              const perks = [
                t('landing_plan_channels', '{{count}} channels', { count: tier.channel }),
                tier.posts_per_month >= 1000000
                  ? t('landing_plan_unlimited', 'Unlimited posts')
                  : t('landing_plan_posts', '{{count}} posts a month', { count: tier.posts_per_month }),
                tier.team_members
                  ? t('landing_plan_team', 'Team members and approvals')
                  : t('landing_plan_solo', 'One user'),
                t('landing_plan_images', '{{count}} AI images a month', { count: tier.image_generation_count }),
                t('landing_plan_webhooks', '{{count}} webhooks', { count: tier.webhooks }),
                ...(tier.public_api ? [t('landing_plan_api', 'Public API and MCP')] : []),
              ];
              return (
                <li
                  key={plan}
                  className={`flex flex-col gap-[16px] p-[24px] border-2 border-black shadow-[6px_6px_0_0_#000] ${
                    highlight ? 'bg-black text-white' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-[14px] uppercase tracking-[0.12em]">
                      {plan.charAt(0) + plan.slice(1).toLowerCase()}
                    </h3>
                    {highlight && (
                      <span className="font-mono text-[11px] uppercase bg-brand text-black px-[8px] py-[2px]">
                        {t('landing_plan_for_teams', 'For teams')}
                      </span>
                    )}
                  </div>
                  <p>
                    <span className="text-[48px] font-[700] tracking-[-0.03em]">${tier.month_price}</span>
                    <span className="text-[15px]"> {t('landing_per_month', '/ month')}</span>
                  </p>
                  <p className="font-mono text-[12px] -mt-[8px]">
                    {t('landing_yearly', 'or ${{price}} / year', { price: tier.year_price })}
                  </p>
                  <ul className="flex flex-col gap-[8px] text-[15px] border-t-2 border-current pt-[16px]">
                    {perks.map((perk) => (
                      <li key={perk} className="flex gap-[8px]">
                        <span aria-hidden="true">→</span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth"
                    className={`${landingButton} mt-auto w-full ${highlight ? '!shadow-[4px_4px_0_0_#ffd400] focus-visible:!outline-brand' : ''}`}
                  >
                    {t('landing_choose_plan', 'Choose {{plan}}', {
                      plan: plan.charAt(0) + plan.slice(1).toLowerCase(),
                    })}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="open-title" className="border-b-2 border-black bg-black text-white">
        <div className={`${container} py-[72px] md:py-[96px] grid lg:grid-cols-12 gap-[32px] items-end`}>
          <h2 id="open-title" className={`${sectionTitle} lg:col-span-8 text-brand`}>
            {t('landing_open_title', 'The code is public. Read it, run it, fork it.')}
          </h2>
          <div className="lg:col-span-4 flex flex-col gap-[20px]">
            <p className="text-[17px] leading-[1.55]">
              {t(
                'landing_open_text',
                'Castkite is open source under the AGPL-3.0. Use our hosted version, or run it on your own servers.'
              )}
            </p>
            <a
              href={SOURCE_URL}
              className="text-[16px] font-[700] underline underline-offset-[6px] decoration-2 text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[4px] focus-visible:outline-brand"
            >
              {t('landing_open_link', 'View the source on GitHub')}
            </a>
          </div>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="border-b-2 border-black scroll-mt-[20px]">
        <div className={`${container} py-[72px] md:py-[112px] grid lg:grid-cols-12 gap-[40px]`}>
          <h2 id="faq-title" className={`${sectionTitle} lg:col-span-4`}>
            {t('landing_faq_title', 'Questions')}
          </h2>
          <div className="lg:col-span-8 border-t-2 border-black">
            {faq.map(([question, answer]) => (
              <details key={question} className="group border-b-2 border-black">
                <summary className="flex items-center gap-[16px] py-[20px] cursor-pointer list-none text-[19px] font-[700] focus-visible:outline focus-visible:outline-2 focus-visible:outline-black [&::-webkit-details-marker]:hidden">
                  {question}
                  <span aria-hidden="true" className="ms-auto font-mono text-[24px] transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div
                  className="pb-[24px] text-[17px] leading-[1.6] max-w-[640px] whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: answer }}
                />
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="cta-title">
        <div className={`${container} py-[72px] md:py-[112px] flex flex-col items-start gap-[32px]`}>
          <h2 id="cta-title" className="text-[40px] md:text-[64px] font-[700] leading-[1] tracking-[-0.04em] max-w-[900px]">
            {t('landing_cta_title', 'Your next month of posts, scheduled before lunch.')}
          </h2>
          <Link href="/auth" className={landingButton}>
            {t('landing_start_scheduling', 'Start scheduling')}
          </Link>
        </div>
      </section>
    </>
  );
};
