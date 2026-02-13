# TV Portrait Design System

The single source of truth for all 3 vertical TV displays at Fulala restaurant.
Check this file before making any TV route changes.

---

## Physical Constraints

| Property | Value |
|----------|-------|
| Hardware | 3x LG 43UR78003LK (43" 4K panel, 3840×2160 physical) |
| Mounting | Portrait orientation (physically rotated) |
| Signal | 1920×1080 landscape, rotated 90° via CSS |
| CSS viewport | 1080 × 1920 px (after rotation) |
| Device Pixel Ratio | 2 (webOS upscales 1080p → 4K panel) |
| Viewing distance | ~3 meters (restaurant seating) |
| Environment | Bright indoor restaurant lighting |

> **Why 1080p, not 4K?** The LG webOS browser renders at 1920×1080 CSS pixels
> regardless of panel resolution. DPR 2 means each CSS pixel maps to a 2×2
> hardware pixel grid. This is similar to a Retina MacBook — CSS dimensions
> stay the same, but images and text render at 2× sharpness.
> Serve images at 2× their CSS display size for best quality.

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

## Dev Setup

To match the real TV environment in your browser:

**Chrome DevTools:**
1. Open DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Set viewport to **1920 × 1080**
3. Set **DPR** (device pixel ratio) to **2** (in the toolbar dropdown)
4. Navigate to `/tv-dumplings`, `/tv-noodles`, or `/tv-info`

**Responsively App:**
1. Add custom device "Fulala TV": 1920 × 1080, DPR 2
2. Use landscape orientation (CSS rotation handles portrait)

**Physical size approximation:**
To preview at roughly the same angular size as the real TV at 3m, set your
browser zoom to approximately: `(your monitor's CSS PPI) ÷ 51`. For a typical
96 PPI monitor, that's ~188% zoom.

## TV Hardware Prep Checklist

Run through this on each TV before going live. These settings are **per-input
and per-app** — they reset if the TV is factory-reset or the browser is
reinstalled.

1. **Aspect Ratio:** Settings → Picture → Aspect Ratio → **Just Scan = On**
   (prevents the TV from cropping/overscanning the edges)
2. **Browser Zoom:** Open LG browser menu → set zoom to **100%**
   (each TV must match — different zoom = different effective font sizes)
3. **Live Zoom:** Long-press Home button → verify Live Zoom is **Off**
   (this feature can accidentally rescale the page)
4. **Aspect Ratio Mode:** Verify set to **Original** or **16:9**
   (not "All Direction Zoom" or "4:3")
5. **Verify:** Open a TV route and confirm text matches across all 3 displays

## Future: HDMI Direct

Connecting an external device (Raspberry Pi, mini PC) via HDMI at 3840×2160
native resolution would bypass the webOS 1080p CSS limit. This would require:

- New viewport math (3840×2160 CSS, DPR 1)
- Doubled token values in `tv-portrait.css`
- Updated Playwright config and tests
- Separate design gate verification

Not implemented — documenting for future reference.

## Adding a New TV Page

1. Create `src/routes/(tv-portrait)/tv-{name}/+page.svelte`
2. Filter data from `api.menu.getFullMenu` by category name
3. Use `TvCategory` component (or compose from `TvMenuItem`)
4. Verify it fits within the 1626px content budget
5. Run the design gate checklist
6. Add to Playwright tests in `tests/tv-portrait.spec.ts`
