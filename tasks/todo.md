# Ship the June version to production — cleanly, with safeguards

Plan: ~/.claude/plans/zesty-tumbling-biscuit.md (approved 2026-06-13)

- [x] Phase 0: Backup prod Convex data (cheery-setter-27) → backups/ (2.8MB, verified)
- [x] Phase 1: Gate /order behind admin flag (default OFF) + admin toggle + test (commit fb0a7c4)
- [x] Phase 2: Deploy Convex backend to prod cheery-setter-27 → LIVE TVs RECOVERED, console clean, data intact
- [ ] Phase 4: FF merge feat→main → Vercel deploys June frontend → verify TVs identical + /order gated
- [ ] Phase 3: Seed extras + drinks + print-window (rice/baos/wontons) → verify appear with images
- [ ] Phase 5: Safeguards — branch protection, backup:prod script, DEPLOYMENT.md runbook
      (useQuery onError already shipped in fb0a7c4; atomic-deploy wiring DEFERRED until
       CONVEX_DEPLOY_KEY is in Vercel — must not break the build without it)
- [ ] Phase 6: Compose /tv-info — archive discounts (versioned), publish extras+drinks sections

## Review

(to be filled after completion)
