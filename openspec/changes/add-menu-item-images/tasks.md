# Tasks: Add Menu Item Images

## 1. Schema Update
- [x] 1.1 Add `imageUrl` field (optional string) to `menuItems` table in `convex/schema.ts`
- [x] 1.2 Run `npx convex dev --once` to push schema changes

## 2. Component Update
- [x] 2.1 Update `MenuItem.svelte` to display image when `imageUrl` is present
- [x] 2.2 Add responsive image styling (thumbnail size, lazy loading)
- [x] 2.3 Handle missing/broken images gracefully

## 3. Seed Data Update
- [x] 3.1 Find appropriate food images from the internet for each menu item
- [x] 3.2 Update `convex/seed.ts` with image URLs
- [x] 3.3 Clear and re-seed database with new data

## 4. Sync Support
- [x] 4.1 Update `syncMenuItems` mutation to accept `imageUrl`
- [x] 4.2 Update `syncMenuItemsInternal` mutation to handle `imageUrl`
- [x] 4.3 Update Google Sheets documentation for image column

## 5. Verification
- [x] 5.1 Verify images display correctly on mobile view (/)
- [x] 5.2 Verify images display correctly on TV view (/tv)
- [x] 5.3 Verify fallback behavior when no image is set
