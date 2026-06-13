# Ship the June version to production — cleanly, with safeguards

Plan: ~/.claude/plans/zesty-tumbling-biscuit.md (approved 2026-06-13)

- [x] Phase 0: Backup prod Convex data (cheery-setter-27) → backups/ (2.8MB, verified)
- [x] Phase 1: Gate /order behind admin flag (default OFF) + admin toggle + test (commit fb0a7c4)
- [x] Phase 2: Deploy Convex backend to prod cheery-setter-27 → LIVE TVs RECOVERED, console clean, data intact
- [x] Phase 4: June frontend LIVE (BPgIFmZh). Verified: tv-dumplings identical, /order gated,
      tv-info shows safe discount fallback, console clean on all pages
- [x] Phase 3: Seeded extras(6)+drinks(5)+baos(2)+rice(1)+wontons(1). Verified: 7 cats/28 items,
      original 13 intact, all 5 drink images load, 0 broken images, showing live on /
- [x] Phase 5a: backup:prod script + DEPLOYMENT.md runbook (useQuery onError shipped in fb0a7c4)
- [ ] Phase 5b: branch protection (block force-push/deletion on main)
- [ ] Phase 5c: atomic-deploy wiring — BLOCKED on owner adding CONVEX_DEPLOY_KEY to Vercel
- [ ] Phase 6: Compose /tv-info — swap discounts→extras+drinks (with owner's visual review;
      live physical screen, don't publish unreviewed)

## Review

(to be filled after completion)
