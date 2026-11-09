# Handoff notes (temporary)

Written on November 9, 2026, so work can continue on another Mac.
**Read it, then delete it** (`git rm HANDOFF.md`, commit and push). The lasting
checklist is `LAUNCH.md`; this file only covers the session in progress.

## What was done (all on `main`)

| Commit | What |
|---|---|
| `52be92b9` | Saved theme is rendered on the server (no dark flash in light mode) |
| `d80a8e83` | X posts from CSV import default to "everyone can reply"; `RUN_CRON` documented and set so the 30-day purge job starts |
| `45812ae0` | Plan cost caps (see below) and the landing/billing pages showing them |
| `9e5dc2eb` | Closed ways around the caps (made-up post ids, backdated dates, unknown copilot methods) |
| this commit | Own Docker image and CI, one more cap fix, this file |

### Pricing decision (locked)

The user kept Postiz's 4 plans and prices: Standard $29 (5 channels), Team $39
(10), Pro $49 (30), Ultimate $99 (100), with safeguards added in
`libraries/nestjs-libraries/src/database/prisma/subscriptions/pricing.ts`:

| | Standard | Team | Pro | Ultimate |
|---|---|---|---|---|
| X posts a month (`metered_posts_per_month`) | 100 | 200 | 300 | 500 |
| AI writing requests a month (`ai_text_count`) | 200 | 500 | 1,000 | 2,000 |
| Clipping minutes | 0 | 0 | 0 | 0 |

- AI images use medium quality (`openai.service.ts`), about a quarter of the cost.
- Trials: 10 AI images at most, no AI videos (`TRIAL_AI_IMAGES` in
  `subscription.service.ts`, `trial: false` on both video types).
- X cap: providers that bill us per post set `meteredPosts = true` (only X).
  `PostsService.checkMeteredPosts` runs in `createPost`, `changePostStatus`
  (approvals) and `changeDate` (draft → schedule), so the editor, CSV import,
  public API, MCP and autopost are all covered. It answers 402 with a message,
  which the app shows as an upgrade dialog.
- AI cap: `SubscriptionService.useAiTextCredit` stores an `ai_text` row in the
  `Credits` table per request. Charged in `copilot.controller.ts` (every method
  except a free list: info, connect, stop, inspector, threads) and on
  `POST /posts/generator`.
- All of it only applies when billing is on (`STRIPE_PUBLISHABLE_KEY` set).
- Known and accepted: parallel AI requests can go a few over the cap; a failed
  AI request is not refunded.

### Docker and CI (this commit)

- Image: `ghcr.io/anmolsethi/castkite`, built from `Dockerfile.dev` by
  `.github/workflows/build-containers.yml` (amd64 + arm64) on a tag push or by
  hand. `docker-compose.yaml` points at it.
- `.dockerignore` now excludes `.env` and `.claude`, so local secrets never
  land in an image.
- Removed Postiz-only workflows: `deploy-aws.yml`, `staging-conflicts.yml`,
  `stale.yml`, `issue-label-triggers.yml`, `build-extension.yaml`. Kept
  `build.yml` (CI build), `build-containers.yml`, `codeql.yml`,
  `publish-extension.yml` (manual, needs your Chrome Web Store secrets).

## Not verified yet — do these first

1. **The Docker image has not finished a build.** On the previous Mac, with
   Docker limited to 4 GB, it ran out of memory in the frontend's type check
   (package install and the frontend compile worked). Build it on the Mac
   with 24 GB:

   1. Pull `main`.
   2. In Docker Desktop, set memory to at least 8 GB (Settings → Resources);
      Docker's default can be lower than the Mac's RAM.
   3. Build the image:

      ```bash
      docker build -f Dockerfile.dev -t castkite:local .
      ```

   4. In `docker-compose.yaml`, swap `ghcr.io/anmolsethi/castkite:latest`
      for `castkite:local` (don't commit that swap), run
      `docker compose up -d`, then check that `http://localhost:4007` loads
      and you can sign up.
2. **Rerun the cap tests** after the last fix in this commit (only queued X
   posts are skipped when saved again; republishing counts). The script used is
   at the end of this file; it passed on the commit before.
3. **GitHub Actions is off** for the repository, so no workflow runs. The user
   turns it on: Settings → Actions → General → Allow all actions. Then push a
   tag (`git tag v1.0.0 && git push origin v1.0.0`) to publish the first image,
   and make the GHCR package public or `docker login ghcr.io` on the server.

## Next steps after that

- Create the 4 Stripe products (monthly and yearly).
- Check the X API price per post (and per post with a link) and Evolink's
  Seedance price; lower the caps if they are higher than assumed ($0.015 /
  $0.20 per X post, $0.161 per second of video).
- Decide the Pro and Ultimate video counts (30 and 60): the only limits where a
  customer using everything costs more than they pay.
- Post to one real channel end to end; run the purge job on a copy of
  production data; make the purge unit test run (`@nx/jest` is missing).
- Polish: docs screenshots, landing keyboard focus check, extension build.
- Leftover Postiz text in `.github/PULL_REQUEST_TEMPLATE.md`,
  `.github/ISSUE_TEMPLATE/config.yml` and `SECURITY.md`.

## Local setup notes (the previous Mac)

- Node 22 through nvm (`source ~/.nvm/nvm.sh && nvm use 22`), pnpm only.
- Postgres 16 from Homebrew on port 5432 with role `postiz-user` /
  `postiz-password` and database `postiz-db-local`. Redis and Temporal from
  `docker compose -f docker-compose.dev.yaml up -d postiz-redis temporal`
  (leave its Postgres off, the port is taken).
- `nest start --watch` failed with EMFILE, so the backend was built once and
  run: `cd apps/backend && NODE_OPTIONS=--max-old-space-size=8192 npx nest build
  && pnpm run start`. To test with billing on, start it with
  `STRIPE_PUBLISHABLE_KEY=pk_test_fake OPENAI_API_KEY=sk-fake pnpm run start`.
- Typechecks: `npx tsc --noEmit -p apps/backend/tsconfig.json` shows 6 errors
  that were already there (agent.graph, autopost, media.repository, empty
  providers); anything beyond those is new.
- Test accounts in the local database: `owner@castkite.test`,
  `member@castkite.test`, `purge@castkite.test`, with a fake X channel on the
  owner's workspace.

## Cap test script

Run from the repo root with the backend up and billing on:

```bash
set -a && source .env && set +a && NODE_PATH=$PWD/node_modules node caps.test.js
```

It fills the owner's workspace to 99 X posts, then checks: CSV import stops at
100, a made-up id and a backdated date are refused, editing a queued post still
works, scheduling a draft is refused, the AI chat and generator stop at the AI
cap, and a trial gets 10 images. It restores everything afterwards.

```js
// End-to-end check of the plan caps against the local backend (billing on).
const { PrismaClient } = require('@prisma/client');
const { sign } = require('jsonwebtoken');
const assert = require('assert');

const prisma = new PrismaClient();
const API = 'http://localhost:3000';

(async () => {
  const user = await prisma.user.findFirst({
    where: { email: 'owner@castkite.test' },
    include: { organizations: true },
  });
  const orgId = user.organizations[0].organizationId;
  const x = await prisma.integration.findFirst({
    where: { organizationId: orgId, providerIdentifier: 'x', deletedAt: null },
  });
  assert(x, 'needs the fake X channel from the earlier local run');

  const before = {
    sub: await prisma.subscription.findFirst({ where: { organizationId: orgId } }),
    org: await prisma.organization.findUnique({ where: { id: orgId } }),
  };
  const cookie = `auth=${sign({ id: user.id }, process.env.JWT_SECRET)}; showorg=${orgId}`;
  const call = (path, body, method = 'POST') =>
    fetch(API + path, {
      method,
      headers: { cookie, 'content-type': 'application/json' },
      body: body && JSON.stringify(body),
    }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => null) }));

  const created = [];
  try {
    if (before.sub) {
      await prisma.subscription.update({
        where: { id: before.sub.id },
        data: { subscriptionTier: 'STANDARD', createdAt: new Date(), deletedAt: null },
      });
    } else {
      await prisma.subscription.create({
        data: {
          organizationId: orgId, subscriptionTier: 'STANDARD', totalChannels: 5,
          period: 'MONTHLY', identifier: 'caps-test', isLifetime: false,
        },
      });
    }
    await prisma.organization.update({ where: { id: orgId }, data: { isTrailing: false } });

    // count what is already queued for X this period, then fill up to 99
    const from = new Date(Date.now() - 60_000);
    const existing = await prisma.post.count({
      where: {
        organizationId: orgId, publishDate: { gte: from },
        integration: { providerIdentifier: 'x' },
        OR: [{ deletedAt: null, state: 'QUEUE' }, { state: 'PUBLISHED' }],
      },
    });
    const fill = 99 - existing;
    const future = new Date(Date.now() + 5 * 86400_000);
    for (let i = 0; i < fill; i++) {
      const p = await prisma.post.create({
        data: {
          organizationId: orgId, integrationId: x.id, content: `cap fill ${i}`,
          publishDate: future, state: 'QUEUE', group: `caps-${i}`,
        },
      });
      created.push(p.id);
    }

    // 1) CSV import of 2 X rows: the first fits (100/100), the second is over
    const date = new Date(Date.now() + 6 * 86400_000).toISOString().slice(0, 16);
    const imp = await call('/posts/import', {
      rows: [
        { integrationId: x.id, date, content: 'cap row one' },
        { integrationId: x.id, date, content: 'cap row two' },
      ],
    });
    console.log('import', imp.status, JSON.stringify(imp.body));
    assert.equal(imp.body[0].ok, true);
    assert.equal(imp.body[1].ok, false);
    assert.match(imp.body[1].error, /100 posts a month to X and 0 are left/);

    // 1b) a made-up post id and a backdated publish date do not dodge the cap
    const sneaky = (id, when) =>
      call('/posts', {
        type: 'schedule', shortLink: false, tags: [], date: when,
        posts: [{ integration: { id: x.id }, settings: {}, value: [{ ...(id ? { id } : {}), content: 'cap sneaky', image: [] }] }],
      });
    const fakeId = await sneaky('00000000-0000-4000-8000-000000000001', future.toISOString());
    console.log('fake id', fakeId.status, fakeId.body?.message);
    assert.equal(fakeId.status, 402);
    const backdated = await sneaky(undefined, new Date(Date.now() - 60 * 86400_000).toISOString());
    console.log('backdated', backdated.status, backdated.body?.message);
    assert.equal(backdated.status, 402);
    assert.equal(await prisma.post.count({ where: { organizationId: orgId, content: { contains: 'cap sneaky' } } }), 0);
    // editing a post that is already queued is not a new post
    const edit = await sneaky(created[0], future.toISOString());
    console.log('edit queued at cap', edit.status);
    assert.ok(edit.status < 300);

    // 2) scheduling an X draft is blocked too
    const draft = await prisma.post.create({
      data: {
        organizationId: orgId, integrationId: x.id, content: 'cap draft',
        publishDate: future, state: 'DRAFT', group: 'caps-draft',
      },
    });
    created.push(draft.id);
    const sched = await call(`/posts/${draft.id}/date`, { date: future.toISOString(), action: 'schedule' }, 'PUT');
    console.log('schedule draft', sched.status, sched.body?.message);
    assert.equal(sched.status, 402);
    assert.equal((await prisma.post.findUnique({ where: { id: draft.id } })).state, 'DRAFT');

    // 3) AI writing cap: under the cap a non-model call passes, at the cap a run is blocked
    const info = await call('/copilot/chat', { method: 'info' });
    console.log('copilot info under cap', info.status);
    assert.notEqual(info.status, 402);
    await prisma.credits.create({ data: { organizationId: orgId, type: 'ai_text', credits: 200 } });
    const run = await call('/copilot/chat', { method: 'agent/run', params: { agentId: 'default' }, body: {} });
    console.log('copilot run at cap', run.status, run.body?.message);
    assert.equal(run.status, 402);
    const gen = await call('/posts/generator', { research: 'a post about scheduling tools', isPicture: false, format: 'one_short', tone: 'personal' });
    console.log('generator at cap', gen.status);
    assert.equal(gen.status, 402);

    // 4) a trial gets 10 images
    await prisma.organization.update({ where: { id: orgId }, data: { isTrailing: true } });
    const trial = await call('/copilot/credits?type=ai_images', undefined, 'GET');
    console.log('trial images', JSON.stringify(trial.body));
    assert.equal(trial.body.credits, 10);

    console.log('ALL CAP CHECKS PASSED');
  } finally {
    const imported = await prisma.post.findMany({
      where: { organizationId: orgId, content: { contains: 'cap row' } }, select: { id: true },
    });
    await prisma.post.deleteMany({ where: { id: { in: [...created, ...imported.map((p) => p.id)] } } });
    await prisma.credits.deleteMany({ where: { organizationId: orgId, type: 'ai_text' } });
    if (before.sub) {
      await prisma.subscription.update({
        where: { id: before.sub.id },
        data: { subscriptionTier: before.sub.subscriptionTier, createdAt: before.sub.createdAt, deletedAt: before.sub.deletedAt },
      });
    } else {
      await prisma.subscription.deleteMany({ where: { organizationId: orgId, identifier: 'caps-test' } });
    }
    await prisma.organization.update({ where: { id: orgId }, data: { isTrailing: before.org.isTrailing } });
    await prisma.$disconnect();
  }
})().catch((e) => {
  console.error('FAILED', e.message);
  process.exit(1);
});
```
