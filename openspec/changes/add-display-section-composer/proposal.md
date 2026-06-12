# Change: Display section composer — data-driven swappable sections, category photo grids, atomic components

## Why

`/tv-info` is a monolith: customer-info cards, an extras list, and a drinks grid are hardcoded in the page component — the extras prices on the live TV already drifted from the database (TV shows Pork +79 Kč, menu says 69 Kč), and drinks exist only in code, invisible to ordering and analytics. The owner wants to swap sections in and out of display pages, add image-forward category grids (dumplings, noodles, drinks) for visual impact, and have every change recorded — a deterministic "black box" where what's on screen is always explainable from versioned data, never from code archaeology.

## What Changes

- **Sections become data**: each display page renders an ordered list of section instances — `{ id, type, props, visible }` — stored per page slug and resolved by a `SectionRenderer` registry. `/tv-info` is rebuilt as the first composed page; its hardcoded arrays are deleted.
- **Section types v1** (each must earn its place): `info-cards` (existing customer-info), `extras-list` (reads the real `extras` category — kills the price drift class of bug), `category-photo-grid` (NEW — image-forward grid of any category's items: photo, bilingual name, price; configurable columns and photo size), and `text-banner` (simple announcement block).
- **Atomic component architecture**: section components compose from small atoms (`ItemPhoto`, `PriceTag`, `BilingualName`, `SectionTitle`) shared with existing TV components; one section type = one focused Svelte file; the registry maps type → component. Pages stop owning markup.
- **Admin section composer** in `/admin/displays` per page: add/remove/reorder (deterministic up/down, not drag), swap a section's type, edit its props with live preview, toggle visibility. A staff member should be able to recite a page from memory: "info cards, then extras, then the drinks grid."
- **Drinks become data**: a `drinks` category + items (lineup currently hardcoded: Wang Lao Ji 85, Lemonade 89, Tsingtao 79, Coffee 65, Kofola 65) seeded after owner confirmation — making drinks orderable, photo-grid-able, and analytics-visible.
- **Every composition change is versioned**: section configs ride the same draft → publish → version-history pipeline as `add-displays-control-center`, so "what did the screen show in week 23?" has a true answer.

## Non-Goals

- Free-form drag-and-drop canvas or pixel positioning (sections are an ordered list — deterministic and memorable beats flexible).
- New section types beyond the four above until usage evidence demands them.
- Cross-device shared carts and user profiles/role-based dashboards — future changes (`add-cross-device-cart`, `add-user-profiles`), noted here so the section/atom architecture doesn't preclude them.

## Impact

- Affected specs: NEW `display-sections`; touches none of `add-ordering-mvp`'s deltas (composes with its template gallery: templates style *how* a category renders, sections decide *what* a page contains).
- Affected code:
  - `convex/schema.ts` / `convex/settings.ts` — section config per page slug (draft + published), validated shape
  - `src/lib/components/sections/` — NEW `SectionRenderer.svelte` + one component per section type
  - `src/lib/components/atoms/` — NEW shared atoms extracted from existing TV components
  - `src/routes/(tv-portrait)/tv-info/+page.svelte` — rebuilt as composed page (hardcoded extras/drinks arrays deleted)
  - `src/routes/admin/displays/+page.svelte` — section composer panel
  - Data: `drinks` category seeding (dev first; prod only with owner sign-off)
- Depends on: `add-displays-control-center` for the draft/publish/version plumbing (can land with a simplified direct-publish mode if that change is deferred).
- Deployment: dev sandbox only; prod promotion explicit. Until promoted, the live TV keeps its hardcoded (drifted) extras prices — promoting this change is what fixes the 79/69 Kč mismatch.
