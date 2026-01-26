# Change: Auto-Initialize Default Layouts

## Why

Currently, when a new installation or fresh database is set up, the admin must manually click "Initialize Default Layouts" before any layout configuration is visible. This creates friction for new users and leaves the admin page in an empty state that requires action before being useful.

## What Changes

- **ADDED** Auto-initialization logic when admin first accesses `/admin/layout`
- **ADDED** Toast notification informing user that defaults were created
- **MODIFIED** Remove manual "Initialize Default Layouts" button (no longer needed)
- **MODIFIED** Empty state shows loading briefly, then populated layouts

## Impact

- Affected specs: display-layouts
- Affected code:
  - `src/routes/admin/layout/+page.svelte` - Add onMount auto-init logic
  - Remove empty state with manual init button
