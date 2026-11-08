import { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, LegalSection } from '@gitroom/frontend/components/landing/legal.page';

export const metadata: Metadata = {
  title: 'Terms of Service · Castkite',
  description: 'The terms that apply when you use the hosted Castkite service.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 8, 2026">
      <p className="text-[17px] leading-[1.65]">
        These terms are an agreement between you and Anmol Sethi, an individual
        developer based in Ludhiana, Punjab, India, who runs Castkite
        (&quot;Castkite&quot;, &quot;we&quot;, &quot;us&quot;), about your use of the hosted
        Castkite service. By creating an account or using the service you accept
        them. If you use Castkite for an organization, you accept them on its
        behalf and confirm you are allowed to.
      </p>

      <LegalSection title="1. Your account">
        <p>
          You must give accurate sign-up details, keep your login secure and be at
          least 18 years old. You are responsible for everything done through your
          account, including by team members you invite.
        </p>
      </LegalSection>

      <LegalSection title="2. Connected channels">
        <p>
          Castkite publishes to social networks and other platforms on your behalf
          through the access you grant. Your use of each platform is also governed
          by that platform&apos;s own terms. Platforms can change or withdraw their
          APIs at any time; we are not responsible for posts a platform rejects,
          removes, delays or limits.
        </p>
      </LegalSection>

      <LegalSection title="3. Your content">
        <p>
          You keep all rights to the posts, media and other content you add. You
          give us the limited permission we need to store, process and publish
          that content to the channels you choose. You confirm you have the rights
          to everything you publish.
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>You may not use Castkite to:</p>
        <ul>
          <li>publish illegal, infringing, hateful or harassing content;</li>
          <li>send spam or run fake engagement and inauthentic accounts;</li>
          <li>break the rules of the platforms you publish to;</li>
          <li>
            probe, overload or get around the security or usage limits of the
            service.
          </li>
        </ul>
        <p>We may suspend accounts that do.</p>
      </LegalSection>

      <LegalSection title="5. Plans, payment and cancellation">
        <p>
          Paid plans are billed in advance, monthly or yearly, through our payment
          processor Stripe. Prices are shown on the{' '}
          <Link href="/#pricing">pricing section</Link> and may change with at
          least 30 days&apos; notice before your next renewal. You can cancel at
          any time from your settings; your plan stays active until the end of the
          period you paid for. Unless the law requires otherwise, payments are not
          refunded.
        </p>
      </LegalSection>

      <LegalSection title="6. AI features">
        <p>
          Some features use third-party AI providers to generate text, images or
          video. AI output can be wrong or unsuitable, so review it before you
          publish. You are responsible for what you publish.
        </p>
      </LegalSection>

      <LegalSection title="7. Open-source license">
        <p>
          The Castkite source code is licensed under the GNU Affero General Public
          License v3.0. These terms cover the hosted service we run; the AGPL
          covers the code, and nothing in these terms limits your rights under it.
        </p>
      </LegalSection>

      <LegalSection title="8. Availability and changes">
        <p>
          We work to keep Castkite available and reliable, but the service is
          provided &quot;as is&quot; without a guarantee that it will be
          uninterrupted or error-free. We may change or remove features; if a
          change materially reduces what a paid plan includes, we will tell you
          first.
        </p>
      </LegalSection>

      <LegalSection title="9. Liability">
        <p>
          To the extent the law allows, we are not liable for indirect or
          consequential losses, such as lost profits, reach or data, and our total
          liability is limited to the amount you paid us in the 12 months before
          the claim.
        </p>
      </LegalSection>

      <LegalSection title="10. Ending the agreement">
        <p>
          You can stop using Castkite and delete your account at any time from
          your settings. We may suspend or close an account that breaks these
          terms. After an account is closed, we delete its data as described in
          the <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to these terms">
        <p>
          If we change these terms in a meaningful way, we will notify you by
          email or in the app before the change takes effect. Continuing to use
          Castkite after that means you accept the new terms.
        </p>
      </LegalSection>

      <LegalSection title="12. Law and contact">
        <p>
          These terms are governed by the laws of India, and the courts at
          Ludhiana, Punjab have exclusive jurisdiction. Questions about these
          terms: <a href="mailto:anmol@castkite.com">anmol@castkite.com</a>.
          Help with your account:{' '}
          <a href="mailto:support@castkite.com">support@castkite.com</a>.
          Postal address: Ludhiana, Punjab, India.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
