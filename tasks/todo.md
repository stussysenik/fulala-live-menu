# Ship the June version to production — cleanly, with safeguards

Plan: ~/.claude/plans/zesty-tumbling-biscuit.md (approved 2026-06-13)

- [ ] Phase 0: Backup prod Convex data (cheery-setter-27) → backups/, gitignore
- [ ] Phase 1: Gate /order behind admin flag (default OFF) + admin toggle + test
- [ ] Phase 2: Deploy Convex backend to prod → verify live TVs recover
- [ ] Phase 3: Seed extras + drinks into prod → verify counts vs backup
- [ ] Phase 4: Visual parity check → merge branch to main → verify live pages
- [ ] Phase 5: Safeguards — atomic deploy wiring, useQuery onError, branch
      protection, backup:prod script, DEPLOYMENT.md runbook
- [ ] Phase 6: Compose /tv-info — archive discounts (versioned), publish
      extras + drinks sections, verify portrait TV viewport

## Review

(to be filled after completion)
