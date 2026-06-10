# 4AM Dashboard

> The multi-tenant SaaS frontend for [4AM](https://github.com/jenzylove/4am-agent) — the autonomous on-call engineer.

**Built for the Google Cloud Rapid Agent Hackathon — Dynatrace track.**

[Live →](https://4am-dashboard.vercel.app) · [Agent repo →](https://github.com/jenzylove/4am-agent) · [Demo app →](https://github.com/jenzylove/starlight-4am-demo)

---

## What this is

The web frontend where users connect their services and watch the agent do its thing.

- Sign in with Google
- Connect Dynatrace (paste tenant URL + API token)
- Connect GitHub via OAuth
- Pick which repos 4AM should watch
- See the PRs 4AM has filed for you

Per-user state lives in Supabase with Row-Level Security. The companion [4am-agent](https://github.com/jenzylove/4am-agent) reads each user's stored credentials and runs the agent loop scoped to them.

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15 (App Router, Server Components, Server Actions) |
| Auth + DB | Supabase (Postgres with RLS, Google OAuth) |
| Styling | Tailwind CSS v4 with a custom dark-olive palette |
| OAuth | Supabase for Google · custom flow for GitHub |
| Hosting | Vercel |
| Language | TypeScript (strict) |

---

## Architecture

USER FLOW
Sign in → Connect Dynatrace → Connect GitHub → Pick repos
│
▼
Stored in Supabase
(RLS-isolated per user)
│
▼
4am-agent reads creds,
runs scoped to that user
│
▼
PRs appear in activity feed

Multi-tenancy is enforced at the database layer via Supabase Row-Level Security policies — each user only ever sees their own connections, watched repos, and activity.

---

## Setup

### Prerequisites

- Node.js 20+
- A Supabase project
- A Google Cloud OAuth client (for Sign in with Google via Supabase)
- A GitHub OAuth App (for the Connect GitHub flow)

### Install

```bash
git clone https://github.com/jenzylove/4am-dashboard.git
cd 4am-dashboard
npm install
```

### Configure

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
```

### Run

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## How it connects to the agent

This frontend doesn't run the agent — it just configures it. The reasoning + PR filing happens in [4am-agent](https://github.com/jenzylove/4am-agent), which reads per-user credentials from the same Supabase database this frontend writes to.

Together they form the full SaaS:

| Repo | Language | Role |
|---|---|---|
| [4am-dashboard](https://github.com/jenzylove/4am-dashboard) (this) | TypeScript / Next.js | User-facing SaaS |
| [4am-agent](https://github.com/jenzylove/4am-agent) | Python | Autonomous reasoning + PR filing |
| [starlight-4am-demo](https://github.com/jenzylove/starlight-4am-demo) | JavaScript | Demo app being watched |

---

## License

MIT.

---

*Built for the Google Cloud Rapid Agent Hackathon, June 2026.*  
*For when production breaks at 4AM.* 🌙
