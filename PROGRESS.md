# FULALA Live Menu — Progress

**Live:** [menu.fulala.cz](https://menu.fulala.cz)

---

## Current State (February 2026)

Production is live and healthy. Auto-deploys from `main` via Vercel (fra1 region). Real-time menu updates working across all connected clients.

### Version History

**v0.3.0 — Per-Page Layouts & Traditional Chinese Style** (Jan 22, 2026)
- Per-page layout configuration (display pages vs order page)
- Traditional Chinese dim sum order sheet layout (3 color schemes)
- Currency configuration admin UI (ordering, visibility, display modes)
- Fixed mobile price truncation on narrow screens (320px-480px)
- Changed default currency display to single-currency mode

**v0.2.0 — Advanced Features** (Jan 22, 2026)
- 4 display layouts (standard list, dim sum grid, card grid, traditional Chinese)
- Customer ordering with session-based cart
- 7 item modifier types (temperature, noodle, frying, broth, spice, drinks, add-ons)
- 11 dietary tags with emoji icons
- Event management (packages, catering, school meals)
- Multi-currency support (CZK, EUR, USD, CNY)

**v0.1.0 — Initial Release** (Jan 21, 2026)
- Menu management with real-time Convex sync
- Mobile + TV display modes
- Theme system with live preview
- Google Sheets sync integration
- Menu item images with lazy loading
- Display session analytics

**v0.3.1 — Svelte 5 + Allergen UX** (Feb 10, 2026)
- Upgraded to Svelte 5 with `componentApi:4` compat layer
- Improved allergen badge display and legend styling
- Switched Vercel region from iad1 to fra1 (Frankfurt)
- Added Nix flake for reproducible dev environment

**v0.4.0 — Vertical TV Portrait Display** (Feb 11, 2026)
- 3 dedicated routes for portrait-mounted TVs: `/tv-dumplings`, `/tv-noodles`, `/tv-info`
- CSS rotation wrapper for landscape-output TVs mounted vertically
- TV-optimized components: `TvMenuItem`, `TvCategory`, `TvPortraitHeader`, `TvPortraitFooter`
- Bilingual display (Czech + English shown simultaneously, no toggle needed)
- Shared route group layout `(tv-portrait)` as reusable template for future TV pages
- Designed for 3m viewing distance on LG 43UR78003LK (43" 4K) displays

**v0.4.1 — TV Design System & Legibility** (Feb 11, 2026)
- Design system bridge doc (`src/lib/design/tv-design-system.md`)
- All TV font sizes raised to 24px minimum (3m legibility floor)
- Food images increased from 96px to 120px
- Simplified tv-info: removed featured section, kept allergens + customer info only
- Replaced 30+ hardcoded px values with CSS custom properties
- Fixed tv-noodles overflow (last item clipping)
- Playwright TV portrait tests (overflow, font size, contrast, image size)

**v0.3.2 — Documentation Update** (Feb 11, 2026)
- Rewrote README.md, DOCS.md, PROGRESS.md

**v0.5.0 — Multi-Tier Pricing, Storybook, TV Polish** (Feb 12, 2026)
- Multi-tier pricing for dumplings: salty sold by 4ks/6ks/12ks, sweet by 3ks/6ks/9ks
- `priceTiers` schema field with proportional price calculation from per-piece rates
- Compact 3-row tier display in TvMenuItem price column (32px tier font, 48px single-price)
- Storybook v10 with `@storybook/sveltekit` for component development and visual verification
- 7 story variants for TvMenuItem (Default, Featured, Sweet, GF, Tiers Salty, Tiers Sweet, Sold Out)
- TV display fixes: 180px food images (up from 120px), line alignment, no double borders
- tv-info card redesign: Frank Ocean orange (kids), Royal blue (seniors), hand-drawn SVG icons
- ISIC logo fix with max-width constraint
- `flex-shrink` CSS variable for per-page override (noodles page)
- Playwright tests updated: 185 TV tests across 6 viewports, tier count test, split price-size check
- Fixed Vercel deploy: vitest peer dependency conflict (`^1` → `^3`), Playwright browser skip

---

### Completed Features

**Display**
- [x] Real-time menu display via Convex WebSocket subscriptions
- [x] Mobile-first responsive layout
- [x] TV display mode with optimized fonts
- [x] Vertical TV portrait routes for 3x wall-mounted displays
- [x] 4 display layouts with per-page configuration
- [x] Bilingual display (Czech + English) with language toggle
- [x] Multi-currency toggle (CZK, EUR, USD, CNY)
- [x] EU 14-allergen system with sub-types and bilingual legend
- [x] Weekly schedule banner (week number, date range)
- [x] Customer info section (discounts, family portions)
- [x] Food photography with lazy loading (180px on TV)
- [x] Multi-tier pricing for dumplings (4ks/6ks/12ks salty, 3ks/6ks/9ks sweet)
- [x] Color-coded customer info cards (kids, students, seniors)

**Ordering**
- [x] Session-based cart with localStorage persistence
- [x] 7 modifier types for item customization
- [x] 11 dietary tag badges
- [x] Order lifecycle (active -> submitted -> completed)
- [x] Subtotal, tax (10%), total calculation

**Admin**
- [x] Menu item CRUD with images and allergens
- [x] Category management with sort ordering
- [x] Theme editor with live preview and presets
- [x] Layout switcher with per-page tabs
- [x] Currency configuration (rates, visibility, display mode)
- [x] Event packages, catering menus, school meal schedules
- [x] Display analytics dashboard

**Infrastructure**
- [x] Vercel auto-deploy from `main` (fra1 region)
- [x] Convex production database
- [x] Playwright E2E tests (menu, currency, layouts, accessibility, TV portrait)
- [x] TV portrait design system with legibility tests (185 tests, 6 viewports)
- [x] Storybook v10 for TV component development and visual verification
- [x] Nix flake for reproducible dev environment
- [x] Google Sheets sync (optional)

---

## What's Next

### High Priority
- [ ] Payment integration (Stripe/Square)
- [ ] Kitchen display system at `/kitchen`
- [ ] Order notifications (sound/visual alerts for staff)
- [ ] Print-friendly menu export

### Medium Priority
- [ ] Order analytics (popular items, peak hours, revenue)
- [ ] Table management integration
- [ ] Multi-location support
- [ ] Image CDN integration (Cloudinary/Imgix)

### Low Priority
- [ ] Offline mode with service worker
- [ ] Push notifications for order status
- [ ] A/B testing for menu layouts
- [ ] Dark mode theme preset

---

## Technical Debt

- [ ] Migrate order cart from Svelte store to Convex mutations
- [ ] Backend validation for modifier selections
- [ ] Test coverage for ordering flow
- [ ] Improve error handling for network failures
- [ ] Code-split admin routes for smaller bundles
- [ ] Add ARIA labels to all interactive elements

---

## Key Files

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Database schema (14 tables) |
| `convex/menu.ts` | Menu CRUD + full menu query |
| `convex/settings.ts` | Theme, schedule, customer info, animations |
| `convex/seed.ts` | Real Fulala menu seed data |
| `src/routes/+page.svelte` | Main menu display |
| `src/lib/components/MenuItem.svelte` | Menu item rendering |
| `src/lib/allergens/index.ts` | EU 14-allergen data |
| `src/lib/theme/defaults.ts` | Theme configuration |
| `src/lib/design/tv-design-system.md` | TV portrait design system bridge doc |
| `tests/tv-portrait.spec.ts` | TV portrait Playwright tests |
| `tests/tv-consistency.spec.ts` | Cross-page TV consistency tests |
| `src/lib/components/tv/*.stories.svelte` | Storybook stories for TV components |
| `.storybook/` | Storybook configuration |

---

*Last updated: February 12, 2026*
