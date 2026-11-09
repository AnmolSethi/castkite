# Castkite pre-launch guide

Everything that must be true before Castkite takes its first paying customer.
Castkite is a rebranded fork of [Postiz](https://github.com/gitroomhq/postiz-app)
(AGPL-3.0). Tick each item as you go.

Last updated: November 8, 2026.

---

## 1. Blockers: do not launch without these

### Domain and name

- [ ] **Buy `castkite.com`** (and `castkite.io` if you want it). Both were free on
      November 8, 2026 according to WHOIS, which is not authoritative. Confirm at a
      registrar.
- [ ] **Trademark search** for "Castkite" in India (IP India), the US (USPTO)
      and the EU (EUIPO). Not done yet.
- [ ] **DNS records.** The docs and the app assume this layout:

  | Host | Points to |
  |---|---|
  | `castkite.com` | the frontend (landing page at `/`, the app behind sign-in) |
  | `api.castkite.com` | the backend (Public API, OAuth) |
  | `mcp.castkite.com` | the backend (MCP server), set `MCP_URL` to it |
  | `uploads.castkite.com` | your storage bucket (Cloudflare R2 or similar) |
  | `docs.castkite.com` | Mintlify (see section 4) |

  If you choose different hosts, update `apps/docs` (search for `castkite.com`).

### Deploy your own code, not Postiz's

- [ ] **`docker-compose.yaml` still runs Postiz's image**
      (`ghcr.io/gitroomhq/postiz-app:latest`). Deploying it as-is runs Postiz,
      without any Castkite change. Build your own image from this repository:

  ```bash
  docker build --target dist -t castkite:latest -f Dockerfile.dev .
  ```

  Push it to your own registry and point `docker-compose.yaml` (or your host) at
  it.
- [ ] **Apply the database schema** on the production database. This fork adds
      columns: `Organization.requireApproval`, `Organization.purgedAt`,
      `Post.pendingApproval` (with an index) and `Signatures.name`, and the
      `LINKEDIN` and `X` sign-in providers.

  ```bash
  pnpm run prisma-db-push
  ```

- [ ] **Environment variables** (see `.env.example` for the full list):

  | Variable | Why it matters |
  |---|---|
  | `FRONTEND_URL` | `https://castkite.com`. Also used for analytics domains, canonical URLs, the sitemap and generated emails |
  | `NEXT_PUBLIC_BACKEND_URL` | `https://api.castkite.com` |
  | `MCP_URL` | `https://mcp.castkite.com` |
  | `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_SIGNING_KEY` | Billing. **The landing page only shows when `STRIPE_PUBLISHABLE_KEY` is set**, otherwise `/` goes straight to sign-in |
  | `EMAIL_FROM_ADDRESS` | Sender for all emails, and the recipient of agency review emails |
  | `EXTENSION_ID` | Your Chrome Web Store extension ID (section 3). Install links stay hidden until it is set |
  | `YOUTUBE_CLIENT_ID`, `GITHUB_CLIENT_ID`, `LINKEDIN_CLIENT_ID`, `X_CLIENT_ID` (and their secrets) | Sign-in buttons (see "Sign-in providers" below). The buttons always show, so set all four |
  | `JWT_SECRET` | A long random string, never the example value |
  | `RUN_CRON` | `true` on the backend. Without it the 30-day purge (section 2) never runs |

### Sign-in providers

Sign-up and login offer Google, X, LinkedIn and GitHub (plus email and
password). Each needs its developer app set up:

- [ ] **Google** uses the YouTube OAuth client (`YOUTUBE_CLIENT_ID`). Add
      `https://castkite.com/integrations/social/youtube` as a redirect URI and
      publish the consent screen.
- [ ] **X** uses OAuth 2.0 keys, which are different from `X_API_KEY`. In the X
      developer portal, under User authentication settings, turn on OAuth 2.0
      as a confidential web app and turn on **Request email from users** (X
      needs your privacy and terms URLs for that). Add
      `https://castkite.com/integrations/social/x` as a callback, then set
      `X_CLIENT_ID` and `X_CLIENT_SECRET`.
- [ ] **LinkedIn** uses the channel app (`LINKEDIN_CLIENT_ID`). Add the
      **Sign In with LinkedIn using OpenID Connect** product to it. The redirect
      `https://castkite.com/integrations/social/linkedin` is already registered
      for channels.
- [ ] **GitHub**: create an OAuth app with callback `https://castkite.com/settings`
      and set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
- [ ] Sign up once with each provider on production. None of them has been
      tried against the real services yet.

### License (AGPL-3.0)

The repository is public at <https://github.com/AnmolSethi/castkite>, which is
what the AGPL requires. To stay compliant:

- [ ] **Every change you deploy must be pushed** to the public repository.
      Users of the hosted service are entitled to the source of the version
      that is actually running.
- [ ] **Keep `LICENSE`** and the "Source code" link in the landing page footer.
- [ ] Do not add a closed-source component to the same codebase. Anything
      private must live in a separate service.

### Legal pages (`/terms`, `/privacy`)

Filled in for India on November 8, 2026. Before launch:

- [ ] **Confirm the operator name.** The pages say "Anmol Sethi, an individual
      developer based in Ludhiana, Punjab, India". This was inferred from the
      GitHub username; correct it if your legal name differs.
- [ ] **Full postal address.** "Ludhiana, Punjab, India" is on the pages now.
      Stripe India and some app stores ask for a complete street address.
- [ ] **Have a lawyer read both pages.** They are drafts.
- [ ] **Promises the pages make, which must stay true:**
  - Personal details are anonymized immediately when an account is deleted
    (true today).
  - Workspace content is permanently erased within 30 days (true once the
    purge job runs in production, section 2).
  - Backups are overwritten within 30 days: **set your database host's backup
    retention to 30 days or less.**
  - Content is not used to train AI models, and card details are handled by
    Stripe only.
  - The Grievance Officer (anmol@castkite.com) acknowledges complaints within
    24 hours and resolves them within 15 days.
- [ ] **Minimum age is 18** (DPDP Act parental-consent rule). The sign-up form
      requires an "I confirm that I am 18 or older" box, checked again by the
      API, including for Google, X, LinkedIn and GitHub sign-ups.
- [ ] **Set up the mailboxes** `anmol@castkite.com` and `support@castkite.com`.
      Both are published on the legal pages and in the docs.

### Pricing

- [x] **Prices kept at Postiz's**: Standard $29, Team $39, Pro $49, Ultimate
      $99 a month, set in
      `libraries/nestjs-libraries/src/database/prisma/subscriptions/pricing.ts`
      (the landing page reads its prices from that file). Each plan also caps
      X posts (`metered_posts_per_month`, because the X API bills us per post)
      and AI writing requests (`ai_text_count`). Clipping is off, AI images
      use medium quality, and trials get 10 AI images and no AI videos.
- [ ] **Create the matching products in Stripe** (monthly and yearly).
- [ ] **Check the two vendor prices the caps rest on**: the X API charge per
      post (and per post with a link), and Evolink's Seedance price per second.
- [ ] **Decide the Pro and Ultimate video counts** (30 and 60). They are the
      only limits where a customer using everything costs more than they pay.

---

## 2. Data deletion (the purge job)

Merged from the `purge-deleted-organizations` branch.

- A daily Temporal workflow, `purgeDeletedOrganizationsWorkflow`, runs on the
  orchestrator. The backend starts it on boot **only when `RUN_CRON` is set**
  (the same goes for Postiz's missed-post job). Upstream never set it, so both
  jobs were off by default.
- It finds organizations whose `deletedAt` is more than 30 days old and, per
  organization, in one transaction: deletes their content children-first,
  removes their media files from storage, anonymizes the organization row and
  stamps `purgedAt`.
- Billing records stay for tax reasons: the organization's `paymentId`,
  `Subscription` and `UsedCodes`.
- A security fix: a storage file is never deleted while another
  organization's media, clip or post still refers to it.

Before launch:

- [ ] **Its unit test has not run.** `jest.config.ts` needs `@nx/jest`, which
      is not installed, so `organization.repository.spec.ts` could not run
      here. Typechecks pass.
- [x] **Ran against a local database** on November 8, 2026: a workspace
      deleted 31 days earlier lost its posts, channels, media and members, the
      row was anonymized with `purgedAt` set, and another workspace was left
      untouched.
- [ ] Run it once against a copy of production data (or a staging database)
      before launch and confirm what was removed and what was kept.
- [ ] Make sure the orchestrator (Temporal worker) runs in production; without
      it nothing is purged and the privacy policy is false.

---

## 3. Chrome extension (`apps/extension`)

Rebranded as Castkite. It reads login cookies for cookie-based channels (Skool)
and only accepts messages from `*.castkite.com` and localhost.

- [ ] Build it:

  ```bash
  pnpm run build:extension
  ```

- [ ] Create a Chrome Web Store developer account (one-time $5 fee) and upload
      `apps/extension/extension.zip`.
- [ ] In the store listing, justify the `cookies` permission and the
      `*.skool.com` host permission, and link `https://castkite.com/privacy`.
      Review rejects listings without both.
- [ ] Once approved, set `EXTENSION_ID` to the ID the store assigns. The app's
      install links use it.
- [ ] If you add another domain (a staging site), add it to
      `externally_connectable` in `apps/extension/manifest.json` and to
      `ALLOWED_ORIGIN_PATTERNS` in `apps/extension/src/background.ts`.

---

## 4. Documentation (`apps/docs`)

A Mintlify site based on the Postiz docs (MIT license, kept in
`apps/docs/LICENSE`). The Postiz CLI, Cloud and self-hosting sections were
removed; pages for approvals, bulk CSV import, best times and the caption
library were added.

- [ ] In Mintlify (free plan), connect this repository with `apps/docs` as the
      docs directory.
- [ ] Add `docs.castkite.com` as a custom domain (CNAME at your DNS provider).
- [ ] **Take the screenshots.** Postiz's screenshots were removed. The seven
      pages that need one show a placeholder (`apps/docs/images/**/*.svg`)
      that names the screen to capture and the `.png` path to save it as.
      After adding a PNG, change that page's `<img src>` from `.svg` to `.png`
      and delete the placeholder.
- [ ] Run the checks after any edit:

  ```bash
  cd apps/docs && npm run check
  ```

`apps/docs` is excluded from the pnpm workspace on purpose, so its tooling never
changes the app's lockfile.

---

## 5. Not tested yet

Checked in a full local run on November 8, 2026 (backend, orchestrator,
Temporal, Redis, Postgres): email sign-up with the 18+ box, bulk CSV import as
admin and as a member (the member's post waited for approval, then got
scheduled), the Approvals page, and light mode on the calendar and Approvals.
X posts imported from CSV now default to "everyone can reply"; before, every X
row was rejected.

The plan caps were checked against the local backend with billing on, on
November 9, 2026: the 101st X post of the month and scheduling an X draft past
the cap were refused, AI writing stopped at the plan's limit, and a trial got 10
AI images.

Still never exercised in a running app:

- [ ] Posting to a real channel (the local run used a fake one).
- [ ] The landing page, `/terms` and `/privacy` in production (they were only
      checked on a local dev server, desktop and mobile).
- [ ] Keyboard focus on the landing page.
- [ ] The rebranded extension in Chrome.
- [ ] Sign-up shows the new favicon and links; the API settings page shows
      manual MCP setup only.

---

## 6. Postiz leftovers (known, low risk)

- **Removed:** Postiz's unused agency directory service (its emails linked to
  `postiz.com`), its npm SDK (`apps/sdk`), crypto wallet sign-in (with the
  Solana packages) and generic OAuth/OIDC sign-in (the "Authentik" button).
  The `Agency` tables and the `WALLET`/`GENERIC` provider values stay in the
  schema so no data is dropped.
- **`.github/workflows`** includes Postiz's container build, AWS deploy and
  extension publish workflows. GitHub Actions are disabled on the repository;
  delete or rewrite them before you turn Actions on.
- **Internal names kept on purpose**, because renaming them breaks existing
  setups: the `POSTIZ_*` environment variables, the `x-postiz-*` API headers,
  translation keys, and the AI agent id `postiz`.

---

## 7. What Castkite adds on top of Postiz

For your landing page, support replies and changelog:

| Feature | Where | Notes |
|---|---|---|
| Approval workflow | Settings, Global Settings, Approval Workflow; **Approvals** in the top menu | Members' posts wait as drafts until an admin approves. Posts made with an API key skip it |
| Bulk CSV scheduling | Calendar, **Bulk schedule from CSV** | Up to 500 posts per file, checked against the monthly post limit |
| Best times to post | Channel menu, **Edit Time Slots** | From the last 20 published posts with analytics; needs at least 5 |
| Caption & hashtag library | Settings, **Caption & hashtag library**; composer **Insert from library** | Named snippets with search |
| Landing page, terms, privacy | `/`, `/terms`, `/privacy` | Server-rendered, with sitemap and robots |
| 30-day purge | Orchestrator | Section 2 |
