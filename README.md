<p align="center">
  <a href="https://castkite.com" target="_blank">
    <img alt="Castkite" src="apps/frontend/public/castkite.svg" width="72" />
  </a>
</p>

<h1 align="center">Castkite</h1>

<p align="center">
  <strong>Write it once. Launch it everywhere.</strong><br />
  Schedule posts to X, LinkedIn, Instagram, TikTok and 24 more channels, with
  approvals, bulk CSV import, best-time suggestions and a caption library built in.
</p>

<p align="center">
  <a href="https://castkite.com">Website</a>
  ·
  <a href="https://docs.castkite.com">Docs</a>
  ·
  <a href="https://docs.castkite.com/public-api/introduction">Public API</a>
  ·
  <a href="https://docs.castkite.com/mcp/introduction">MCP</a>
  ·
  <a href="LICENSE">AGPL-3.0</a>
</p>

---

## What it does

- **Schedule everywhere.** One composer for 28+ social and chat channels, with
  per-channel tweaks, threads, comments and media.
- **See the whole week.** Day, week and month calendar views, customer groups
  and time slots per channel.
- **Approval workflow.** Members' posts wait as drafts until an admin approves
  them from the **Approvals** page.
- **Bulk CSV scheduling.** Upload a spreadsheet and schedule up to 500 posts at
  once, with every row checked before anything is created.
- **Best times to post.** Suggested posting hours per channel, based on how
  your recent posts performed.
- **Caption & hashtag library.** Named, searchable snippets you insert into any
  post.
- **Analytics, automations and AI.** Post and channel analytics, RSS
  auto-posting, plugs, webhooks, AI writing and image generation.
- **Build on it.** A Public API, OAuth apps and an MCP server for AI agents
  like Claude, ChatGPT and Cursor.

## Tech stack

- pnpm workspaces (monorepo)
- Next.js frontend (`apps/frontend`)
- NestJS backend (`apps/backend`)
- Temporal orchestrator for background jobs (`apps/orchestrator`)
- Prisma on PostgreSQL, Redis
- Mintlify docs (`apps/docs`) and a Chrome extension (`apps/extension`)

## Running it locally

You need Node.js 22, pnpm, PostgreSQL, Redis and a Temporal server.
`docker-compose.dev.yaml` starts the services for you.

```bash
pnpm install
cp .env.example .env          # then fill in the values
pnpm run prisma-db-push       # create the database schema
pnpm run dev                  # frontend on :4200, backend on :3000
```

The [developer guide](https://docs.castkite.com/contributing/developer-guide)
and [`CONTRIBUTING.md`](CONTRIBUTING.md) cover the details.

## Launching your own instance

Read [`LAUNCH.md`](LAUNCH.md) before deploying. Among other things, it explains
why you must build your own image instead of using the upstream one in
`docker-compose.yaml`.

## Credits and license

Castkite is a fork of [Postiz](https://github.com/gitroomhq/postiz-app) by
Gitroom, and its documentation is based on the
[Postiz docs](https://github.com/gitroomhq/postiz-docs) (MIT).

The source code is available under the [GNU Affero General Public License v3.0](LICENSE).
If you run a modified version as a network service, the AGPL requires you to
offer your users its source code.
