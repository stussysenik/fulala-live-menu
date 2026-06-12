# Project Context

## Purpose
Fulala (fulala.cz) — fresh noodles & dumplings shop in Prague. This repo is the live menu + ordering system: public mobile menu, TV display pages, QR/kiosk self-checkout, staff POS board, and the admin panel — all centralized so the restaurant owns its first-hand order data and iterates the menu on evidence.

## Tech Stack
- SvelteKit (Svelte 5) + TypeScript, Tailwind 4, deployed on Vercel
- Convex — permanent operational core: database, realtime queries, mutations (self-hostable escape hatch; no second backend, no ORM)
- Playwright (e2e), Vitest (unit), Storybook (components)
- `tools/print-agent/` (planned) — only non-Convex backend: Node ESC/POS print service on shop hardware

## Project Conventions

### Code Style
- Functional core, imperative shell: domain logic (pricing, state machines, validation) lives in pure TS modules under `src/lib/domain/`; Convex functions and components are thin adapters
- Atomic components: atoms (no data fetching) → sections/composites (fetch + compose) → pages (config + renderers)
- Educational doc comments that teach the pattern, not narrate the line

### Architecture Patterns
- **Determinism and truth**: what's on any screen must be derivable from versioned data — no hardcoded content in pages, every publish appends to history (black-box principle), exports keep data ownership
- **Minimalism and essentialism**: build what evidence (order data, usage) supports; a feature must earn its place; prefer the version a staff member can recite from memory
- **One realtime queue**: all order sources (QR, kiosk, staff) converge on one Convex-backed queue; surfaces (board, table map, status pages, printer) are views of it

### Testing Strategy
Unit-test the domain core; Playwright for full loops (order → board → history); visual side-by-side before any display-page change ships; nothing is "done" without running proof.

### Git Workflow
OpenSpec change proposals before non-trivial work; approval gate before implementation; archive changes after deployment.

## Domain Context
- Bilingual+ menu (Czech primary, English, Chinese names); EU allergen numbers are legal data — never guess silently
- Prices in CZK; EUR via exchange-rate config; Czech VAT for restaurant food is 12% (configurable, not hardcoded)
- Daily order numbers reset per Europe/Prague calendar day

## Important Constraints
- **Prod deployment (cheery-setter-27) drives live TVs in the shop**: data writes allowed with backup + read-back verification; code deploys to prod ONLY with explicit owner sign-off. Dev sandbox is focused-giraffe-228.
- Print "Window Outside" PDFs are the menu's source of truth when syncing data.

## External Dependencies
- Convex cloud (prod + dev deployments), Vercel hosting, thermal printer (model TBD) via print agent
