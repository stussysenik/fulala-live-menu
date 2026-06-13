# Deployment & production runbook

The live menu (`menu.fulala.cz`, embedded at `fulala.cz/menu`) is a SvelteKit app
on Vercel backed by a Convex deployment. **Two moving parts must always agree:**

| Part | Where | Notes |
|------|-------|-------|
| Frontend | Vercel, auto-deploys from `main` | `vercel.json` → `deploymentEnabled.main` |
| Backend  | Convex `cheery-setter-27` | the deployment production reads from (real menu data) |

> Convex labels `cheery-setter-27` internally as `dev/senik` of project
> `live-menu-fulala`, but it **is** production — it holds the real data and every
> live screen points at `https://cheery-setter-27.convex.cloud`. Don't be fooled
> by the label.

## The incident this runbook exists to prevent (2026-06-13)

Feature commits were pushed to `main`. Vercel auto-deployed the **new frontend**,
but the **new Convex functions were never deployed** to `cheery-setter-27`. The
frontend called `settings.getPageSettings` (and others) that didn't exist; the
Convex websocket died in a `FunctionPathNotFound` reconnect loop, and every TV
hung on "Načítání menu…". Root cause: **frontend and backend deployed
independently and desynced.**

Two defenses are now in place:

1. **Graceful degradation (shipped).** `src/lib/convex/index.ts` `useQuery` passes
   an `onError` handler to `ConvexClient.onUpdate`. A single missing/failing
   function now leaves that one query `undefined` (callers fall back to defaults)
   instead of tearing down the shared socket. One bad query can no longer blank
   every display.
2. **Atomic deploys (pending one secret).** Set `vercel.json` `buildCommand` to
   `npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name VITE_CONVEX_URL`
   so Vercel deploys the Convex backend **first**, then builds the frontend
   against it — they can never again ship apart. Requires a Convex **production
   deploy key** in Vercel env as `CONVEX_DEPLOY_KEY` (Production scope). Until that
   key is set, **do not** put `convex deploy` in the build command — the build
   will fail. See "Enabling atomic deploys" below.

## Deploy order (until atomic deploys are on)

Always, in this order:

1. **Back up prod data first:** `npm run backup:prod` → writes `backups/prod-<date>.zip`.
2. **Deploy the backend:** push Convex functions to `cheery-setter-27`
   (`CONVEX_DEPLOYMENT=dev:cheery-setter-27 npx convex dev --once`). Convex schema
   changes here are additive-only by convention (new optional fields / tables).
3. **Deploy the frontend:** merge to `main`; Vercel rebuilds and promotes.
4. **Verify** (next section).

Never deploy a frontend that calls a function the backend doesn't have yet.

## Verifying a production deploy

- Watch the live build hash flip: `curl -sSL https://menu.fulala.cz/ | grep -o '_app/immutable/entry/start[^"]*'`
- In a browser, load `/tv-dumplings`, `/tv-noodles`, `/tv-info`, `/` and the
  DevTools console — it must be **free of `FunctionPathNotFound` / reconnect**
  messages.
- `/order` should show "Objednávky brzy / Ordering coming soon" unless ordering
  is intentionally enabled (Admin dashboard → Self-ordering toggle).

## Instant rollback

Vercel Dashboard → project → Deployments → pick the last-good deployment →
**Promote to Production**. This swaps the alias in seconds without a rebuild.
(If a bad *backend* change is involved, also restore data — see below.)

## Data: backup & restore

- **Backup:** `npm run backup:prod`
- **Restore:** `CONVEX_DEPLOYMENT=dev:cheery-setter-27 npx convex import --replace backups/prod-<date>.zip`
  (destructive — only for genuine data loss, and back up again first).
- Seeds (`convex/seed.ts`) are **idempotent** — they skip categories that already
  exist, so re-running them is safe and never overwrites curated data.

## Enabling atomic deploys (one-time, needs owner)

1. Convex Dashboard → `cheery-setter-27` → Settings → **Generate a production
   deploy key**.
2. Vercel → project → Settings → Environment Variables → add `CONVEX_DEPLOY_KEY`
   = that key, **Production** scope only.
3. Change `vercel.json` `buildCommand` to
   `npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name VITE_CONVEX_URL`
   and push. From then on, backend + frontend deploy together, backend first.

## Environment

- Vercel Production must have `VITE_CONVEX_URL=https://cheery-setter-27.convex.cloud`
  (already set — the live HTML preconnects to it).
- Local dev uses the **dev sandbox** in `.env.local`
  (`focused-giraffe-228`) — never points local admin edits at prod.
