## 1. PriceTierEditor Component
- [ ] 1.1 Create PriceTierEditor.svelte with add/remove/edit tier rows
- [ ] 1.2 Add quick-add preset buttons (1ks, 2ks, 3ks, 6ks, 9ks, 12ks, 18ks, 24ks)
- [ ] 1.3 Add custom tier button for arbitrary quantities
- [ ] 1.4 Style using existing editor-section patterns from ItemModifierEditor

## 2. MenuItemEditor Integration
- [ ] 2.1 Import PriceTierEditor in MenuItemEditor
- [ ] 2.2 Add priceTiers local state initialized from item prop
- [ ] 2.3 Wire PriceTierEditor on:change to update local state
- [ ] 2.4 Include priceTiers in save dispatch

## 3. Admin Menu List View
- [ ] 3.1 Show priceTiers in item-meta when available
- [ ] 3.2 Fall back to single price/quantity display
- [ ] 3.3 Add clickable image thumbnails for quick swap
- [ ] 3.4 Add image picker popover with direct Convex mutation

## 4. ImagePicker Enhancement
- [ ] 4.1 Add custom URL text input with Use button
- [ ] 4.2 Add preview thumbnail for custom URLs
- [ ] 4.3 Add Clear image button
- [ ] 4.4 Add help text for adding static images

## 5. Consolidated Live Preview
- [ ] 5.1 Create /admin/preview route with 3 iframe panels
- [ ] 5.2 Add theme toggle (regular/valentine)
- [ ] 5.3 Add scale control slider
- [ ] 5.4 Add direct links to open full-screen

## 6. Admin Navigation
- [ ] 6.1 Add Live Preview link to sidebar
- [ ] 6.2 Add Events link to sidebar

## 7. Data Migration
- [ ] 7.1 Write updateDumplingTiers mutation in seed.ts
- [ ] 7.2 Run migration from Convex dashboard
- [ ] 7.3 Verify TV display shows updated tiers

## 8. Verification
- [ ] 8.1 Test adding tiers to a new item via admin
- [ ] 8.2 Test editing tiers on existing item
- [ ] 8.3 Test removing all tiers (falls back to single price)
- [ ] 8.4 Verify TV display updates in real-time
- [ ] 8.5 Test quick image swap from thumbnails
- [ ] 8.6 Test custom URL in ImagePicker
- [ ] 8.7 Verify all 3 iframes load in preview page
- [ ] 8.8 Test theme toggle in preview page
