# Proposal: Add Advanced Menu Features

**Status:** Retrospective Documentation
**Type:** Feature Enhancement
**Scope:** Multiple capabilities (Display Layouts, Event Management, Customer Ordering, Item Modifiers, Dietary Tags)

## Why

This proposal documents the implementation of advanced menu features (Phases 1-5) that transform Fulala Live Menu from a basic digital menu board into a comprehensive restaurant management system. These features address real-world restaurant needs including:

- **Multiple display formats** for different service styles (dim sum vs. standard dining)
- **Event catering capabilities** for packages, catering orders, and school meal programs
- **Customer self-ordering** to reduce server workload and improve order accuracy
- **Food customization** through modifiers (temperature, noodle types, spice levels, etc.)
- **Dietary transparency** with visual tags for allergens and restrictions

The implementation was completed as a cohesive set of interdependent features rather than isolated additions, ensuring consistent data models and user experience across all capabilities.

## What Changes

This retrospective proposal documents 5 major feature additions implemented across Phases 1-5:

### 1. Display Layouts (Phase 1)
- **3 layout types**: Standard list, dim sum grid (2-column with checkboxes), card grid with images
- **Real-time switching**: Admin can change layout and customers see update instantly via Convex reactivity
- **Configurable options**: Column count, checkboxes, item numbers, images, category styling
- **Database**: New `displayLayouts` table with active layout tracking

### 2. Item Modifiers (Phase 2)
- **7 modifier types**: Temperature, noodle type, frying degree, broth type, spice level, drink options, add-ons
- **Schema integration**: Modifiers embedded in `menuItems` table with validated enums
- **Admin interface**: Visual modifier editor with add/remove/reorder capabilities
- **Customer interface**: Modifier selector on order page with visual badges

### 3. Dietary Tags (Phase 3)
- **11 dietary indicators**: Vegetarian 🥬, Vegan 🌱, Seafood 🦐, Pork 🐷, Beef 🐄, Chicken 🐔, Nuts 🥜, Gluten-free, Dairy-free, Halal ☪️, Kosher ✡️
- **Visual icons**: Emoji-based badges for quick recognition
- **Schema field**: `dietaryTags` array in `menuItems`
- **Display component**: `DietaryTags.svelte` for consistent rendering

### 4. Customer Ordering System (Phase 4)
- **Session-based cart**: Orders tracked by browser sessionId (no login required)
- **Order lifecycle**: Active → Submitted → Completed states
- **Cart management**: Add, remove, update quantities, clear cart
- **Modifier integration**: Selected modifiers stored per order item
- **Subtotal calculation**: Automatic tax and total computation
- **Database**: New `customerOrders` table with session and status indices

### 5. Event Management (Phase 5)
- **Event packages**: Min/max guest counts, per-person pricing, deposits, included items
- **Catering menus**: Minimum order amounts, delivery radius, item selection
- **School meals**: Weekly meal schedules (Mon-Fri), per-meal pricing
- **Database**: 3 new tables (`eventPackages`, `cateringMenus`, `schoolMeals`)
- **Admin routes**: `/admin/events` for managing all event types

## Impact

### Database Schema
**New Tables (5):**
- `displayLayouts` - Layout configurations with active flag
- `customerOrders` - Session-based orders with lifecycle states
- `eventPackages` - Event pricing and included items
- `cateringMenus` - Catering offerings with delivery options
- `schoolMeals` - Weekly school meal schedules

**Enhanced Tables:**
- `menuItems` - Added `modifiers`, `dietaryTags`, `drinkOptions`, `itemCode` fields

### Backend Functions
**New Convex Files (3):**
- `convex/layouts.ts` - Layout CRUD operations and active layout queries
- `convex/orders.ts` - Order management (create, update, submit, lifecycle)
- `convex/events.ts` - Event package, catering, and school meal operations

### Admin Interface
**New Components:**
- `ItemModifierEditor.svelte` - Visual modifier configuration (12KB)
- `DietaryTags.svelte` - Dietary tag display component

**New Routes:**
- `/admin/events` - Event package, catering, school meal management
- `/admin/layout` - Display layout configuration and preview

### Customer Interface
**New Components:**
- `layouts/CardGrid.svelte` - Card-based menu display (8KB)
- `layouts/DimSumGrid.svelte` - 2-column dim sum style (8KB)
- `layouts/LayoutRenderer.svelte` - Dynamic layout switcher (1.8KB)
- `modifiers/ModifierBadges.svelte` - Visual modifier indicators (4KB)
- `modifiers/ModifierSelector.svelte` - Interactive modifier picker (12KB)
- `order/OrderCart.svelte` - Shopping cart interface (9KB)
- `order/OrderReceipt.svelte` - Order confirmation display (7KB)

**New Routes:**
- `/order` - Customer ordering page with cart and checkout

### Files Modified
- `convex/schema.ts` - Schema enhancements for modifiers, dietary tags, 5 new tables
- `convex/_generated/api.d.ts` - Type generation for new Convex functions
- `src/lib/stores/index.ts` - Enhanced theme store
- `src/lib/stores/order.ts` - New order state management (created)
- `src/routes/admin/+layout.svelte` - Navigation updates for new routes

## Breaking Changes

**Database Migration Required:**
- **Additive only** - No changes to existing table schemas
- **Safe migration** - All new fields are optional or have defaults
- **Steps:**
  1. Deploy new schema with `npx convex deploy`
  2. New tables auto-created on first deployment
  3. Existing data unaffected

**No API Breaking Changes:**
- All existing queries/mutations remain unchanged
- New functions are additive only

## Migration Plan

1. **Deploy Schema:**
   ```bash
   npx convex deploy
   ```
   - Creates 5 new tables
   - Adds optional fields to `menuItems`

2. **Verify Deployment:**
   - Check Convex dashboard for new tables
   - Test existing menu display (should work unchanged)

3. **Configure Features (Optional):**
   - Create display layout via `/admin/layout`
   - Add modifiers/dietary tags to menu items via `/admin`
   - Set up event packages via `/admin/events`

4. **Test Customer Flow:**
   - Visit `/order` to test ordering system
   - Verify cart persistence with sessionId
   - Test modifier selection

## Risks & Mitigation

**Risk: Session-based orders may be lost on browser clear**
- Mitigation: Implement localStorage backup for cart (future Phase 6)

**Risk: Complex modifier combinations may confuse users**
- Mitigation: Clear UI with visual badges, only show applicable modifiers per item

**Risk: Display layout changes may disrupt active customers**
- Mitigation: Real-time updates via Convex ensure instant sync across all devices

## Related Changes

This change builds upon:
- `add-menu-item-images` (archived) - Image display integrated with new layouts
- `fix-currency-toggle-reactivity` (archived) - Reactivity patterns used in order cart
- `add-multi-currency` (in progress) - Currency display integrated with order totals

## Validation

**Completed Tasks:**
- ✅ Database schema with 5 new tables
- ✅ Backend functions for layouts, orders, events
- ✅ Admin UI for all new features
- ✅ Customer ordering interface with cart
- ✅ Modifier system (7 types)
- ✅ Dietary tags (11 types)
- ✅ Display layouts (3 types)
- ✅ Event management (3 subsystems)

**Manual Testing:**
- ✅ Layout switching on live menu
- ✅ Order cart persistence across page reloads
- ✅ Modifier selection and display
- ✅ Dietary tag visibility
- ✅ Event package creation and display

## Timeline

**Implementation:** January 21-22, 2026 (Phases 1-5)
**Documentation:** January 22, 2026 (Retrospective)

## Notes

This is a **retrospective proposal** documenting already-implemented features. The purpose is to:
1. Create a comprehensive record of architectural decisions
2. Establish baseline specs for the new capabilities
3. Provide context for future enhancements (Phases 6-10)

All tasks in `tasks.md` are marked complete `[x]` to reflect implementation status.
