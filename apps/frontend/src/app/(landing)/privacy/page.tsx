import { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, LegalSection } from '@gitroom/frontend/components/landing/legal.page';

export const metadata: Metadata = {
  title: 'Privacy Policy · Castkite',
  description:
    'What data the hosted Castkite service collects, why, who processes it and how to delete it.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 8, 2026">
      <p className="text-[17px] leading-[1.65]">
        This policy explains how Anmol Sethi, the individual developer who runs
        Castkite (&quot;Castkite&quot;, &quot;we&quot;), handles personal data in the hosted Castkite service. We are
        the data fiduciary (data controller) for your account data. For content you publish
        through Castkite, we process it on your instructions.
      </p>

      <LegalSection title="What we collect">
        <ul>
          <li>
            <strong>Account data:</strong> name, email, password hash or sign-in
            provider, organization and team details.
          </li>
          <li>
            <strong>Connected channels:</strong> the access tokens and profile
            details the platforms return when you connect a channel. Tokens are
            used only to publish and read analytics for you.
          </li>
          <li>
            <strong>Content:</strong> posts, comments, media, caption library
            entries and schedules you create.
          </li>
          <li>
            <strong>Billing:</strong> plan and payment status. Card details are
            handled by Stripe and never stored by us.
          </li>
          <li>
            <strong>Usage and device data:</strong> logs, IP address, browser
            type and the pages you use, to run, secure and improve the service.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Why we use it">
        <ul>
          <li>to provide the service you signed up for (contract);</li>
          <li>to bill you and meet tax and accounting rules (legal obligation);</li>
          <li>
            to keep the service secure, fix errors and understand which features
            are used (legitimate interest);
          </li>
          <li>to send product and account emails you can opt out of (consent).</li>
        </ul>
        <p>We do not sell your personal data and do not use your content to train AI models.</p>
      </LegalSection>

      <LegalSection title="Who processes it for us">
        <ul>
          <li>hosting and file storage providers, to run the service and keep your media;</li>
          <li>Stripe, for payments;</li>
          <li>an email delivery provider, for account and notification emails;</li>
          <li>
            AI providers (such as OpenAI), only for the text, image and video you
            ask the AI features to generate;
          </li>
          <li>error monitoring and privacy-friendly analytics tools;</li>
          <li>the social networks and platforms you choose to publish to.</li>
        </ul>
        <p>
          Some of them are outside your country, including in the United States.
          Where required, transfers are covered by standard contractual clauses
          or an equivalent safeguard. For the full list of our processors, write to{' '}
          <a href="mailto:anmol@castkite.com">anmol@castkite.com</a>.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          We use cookies that are needed to keep you signed in and remember your
          language. Analytics cookies, where used, are set only as allowed by the
          law where you live.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          We keep your data while your account is open. When you delete your
          account from your settings, your name, email, password and sign-in
          details are anonymized immediately. Your workspace content (posts,
          media, connected channels) is removed from the service right away and
          permanently erased within 30 days, except what we must keep for legal
          or tax reasons. Backups are overwritten within 30 days.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Depending on where you live, you can ask to access, correct, export or
          delete your data, object to or restrict how we use it, and withdraw
          consent. Most of this you can do in the app; for the rest, write to{' '}
          <a href="mailto:anmol@castkite.com">anmol@castkite.com</a>. You can
          also nominate someone to exercise these rights for you, and complain
          to the Data Protection Board of India or your local data protection
          authority.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          Data is encrypted in transit, access is limited to the people who need
          it, and channel tokens are only used for the actions you start. No
          system is perfectly secure; if a breach affects you, we will tell you
          as the law requires.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>Castkite is not for anyone under 18, and we do not knowingly collect their data.</p>
      </LegalSection>

      <LegalSection title="Grievance Officer">
        <p>
          Under the Information Technology Act, 2000 and the Digital Personal Data
          Protection Act, 2023, our Grievance Officer is Anmol Sethi, reachable at{' '}
          <a href="mailto:anmol@castkite.com">anmol@castkite.com</a>. We
          acknowledge complaints within 24 hours and resolve them within 15 days.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          We will announce meaningful changes to this policy by email or in the
          app. Questions: <a href="mailto:anmol@castkite.com">anmol@castkite.com</a>.
          Postal address: Ludhiana, Punjab, India. See also our <Link href="/terms">Terms of Service</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
