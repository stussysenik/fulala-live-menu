# TV Portrait Design System

The single source of truth for all 3 vertical TV displays at Fulala restaurant.
Check this file before making any TV route changes.

---

## Physical Constraints

| Property | Value |
|----------|-------|
| Hardware | 3x LG 43UR78003LK (43" 4K) |
| Mounting | Portrait orientation (physically rotated) |
| Signal | 1920x1080 landscape, rotated 90deg via CSS |
| Effective viewport | 1080 x 1920 CSS px |
| Viewing distance | ~3 meters (restaurant seating) |
| Environment | Bright indoor restaurant lighting |

## Legibility Rules

- **Minimum font size: 24px** — anything below is illegible at 3m
- **Recommended body text: 36-48px**
- **Recommended heading: 48-56px**
- **Chinese characters: +4px** vs Latin equivalent (more strokes need more space)
- **Price: largest text element after category title** (visual anchor)
- **Fonts: sans-serif only** for body (Inter), serif for headlines (Cormorant Garamond), mono for prices/numbers (DM Mono)
- **Contrast: WCAG AA minimum (4.5:1)**, aim for AAA (7:1) in bright environments

## Space Budget

```
Total viewport height:       1920px
Page padding (top + bottom): -56px   (28px x 2)
Header (brand + schedule):   -150px
Header bottom margin:        -28px
Footer (VAT note):           -60px
───────────────────────────────────
Content area:                ~1626px
```

## Page-Specific Constraints

### /tv-dumplings (6 items — most constrained)
- Category header: ~110px
- Per-item budget: ~252px
- Image: 120x120px
- Must fit: primary name, Chinese, English, price, quantity, allergen badges, tags

### /tv-noodles (5 items)
- Category header: ~110px
- Per-item budget: ~303px
- Image: 120x120px
- Some items have GF/Featured tags adding ~36px to meta row

### /tv-info (2 sections)
- Customer info: 3 cards (kids, students, seniors)
- Allergen legend: 2-column grid with used allergens only
- No featured items section (removed for clarity)
- Uses `space-evenly` to distribute sections vertically

## Token File

All tokens live in `src/lib/styles/tv-portrait.css`.
Naming convention: `--tv-{element}-{property}`.

**Never hardcode px values in TV components.** Always use a CSS custom property.

## Color Palette

| Role | Value | Usage |
|------|-------|-------|
| Accent | #E83636 | Fulala Red — borders, badges, featured |
| Price | #16a34a | Green — all prices |
| Text | #2C2C2C | Primary text |
| Muted | #6B6B6B | Secondary text, English names |
| Border | #E8E8E4 | Dividers, card borders |
| ISIC | #56C1BD / #006B6E | Student discount card |

## Design Gate Checklist

Run before every TV deploy:

1. [ ] No font size below 24px in any TV route
2. [ ] All `px` values in TV components use CSS custom properties from `tv-portrait.css`
3. [ ] tv-dumplings: 6 items fit without overflow at 1920x1080
4. [ ] tv-noodles: 5 items + tags fit without overflow at 1920x1080
5. [ ] tv-info: all text readable — no section below 26px
6. [ ] Food images >= 120px
7. [ ] `bun run test` passes (including `tests/tv-portrait.spec.ts`)
8. [ ] Visual check on actual TV hardware after deploy

## Component Inventory

| Component | File | Used By |
|-----------|------|---------|
| TvPortraitHeader | `src/lib/components/tv/TvPortraitHeader.svelte` | All TV pages (via layout) |
| TvPortraitFooter | `src/lib/components/tv/TvPortraitFooter.svelte` | All TV pages (via layout) |
| TvCategory | `src/lib/components/tv/TvCategory.svelte` | tv-dumplings, tv-noodles |
| TvMenuItem | `src/lib/components/tv/TvMenuItem.svelte` | TvCategory |
| Layout | `src/routes/(tv-portrait)/+layout.svelte` | All TV pages (rotation wrapper + header/footer) |

## Adding a New TV Page

1. Create `src/routes/(tv-portrait)/tv-{name}/+page.svelte`
2. Filter data from `api.menu.getFullMenu` by category name
3. Use `TvCategory` component (or compose from `TvMenuItem`)
4. Verify it fits within the 1626px content budget
5. Run the design gate checklist
6. Add to Playwright tests in `tests/tv-portrait.spec.ts`
