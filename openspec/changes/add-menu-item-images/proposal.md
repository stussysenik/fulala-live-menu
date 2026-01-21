# Change: Add Image URLs to Menu Items

## Why
Menu items currently display only text (name, description, price). Adding food images will make the menu more visually appealing and help customers identify dishes, improving the user experience on both mobile and TV displays.

## What Changes
- Add optional `imageUrl` field to the `menuItems` table schema
- Update `MenuItem.svelte` component to display images when available
- Update seed data with real food image URLs from the internet
- Update sync functions to support image URLs from Google Sheets

## Impact
- Affected specs: `menu-display` (new capability)
- Affected code:
  - `convex/schema.ts` - Add imageUrl field
  - `convex/seed.ts` - Add image URLs to seed data
  - `convex/sync.ts` - Support imageUrl in sync
  - `src/lib/components/MenuItem.svelte` - Display images
