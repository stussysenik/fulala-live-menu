# Design: Add Advanced Menu Features

## Overview

This document captures the architectural decisions made during the implementation of advanced menu features (Phases 1-5). Since this is a retrospective design document, it explains **why** specific approaches were chosen and what alternatives were considered.

## Technical Decisions

### 1. Layout Storage Approach

**Decision:** Store layout configurations in a dedicated `displayLayouts` table with a single active layout at any time.

**Rationale:**
- Allows multiple layouts to be pre-configured and switched instantly
- Active layout is a single database query (`isActive: true`)
- Real-time reactivity via Convex ensures all connected clients update immediately
- Supports future multi-location expansion (each location can have its own active layout)

**Alternatives Considered:**
- **Theme-embedded layouts:** Store layout in `siteSettings.theme`
  - ❌ Rejected: Mixing presentation (theme) with structure (layout) violates separation of concerns
  - ❌ Rejected: Would require theme reload for layout changes

- **Hardcoded layouts:** 3 fixed layouts with no database storage
  - ❌ Rejected: No flexibility for custom configurations
  - ❌ Rejected: Cannot switch layouts without code deployment

**Trade-offs:**
- ✅ Pro: Instant layout switching without deployment
- ✅ Pro: Configuration per layout (columns, checkboxes, images)
- ⚠️ Con: Additional database table and queries
- ⚠️ Con: Must ensure only one active layout at a time (handled by `setActiveLayout` mutation)

---

### 2. Session-Based Order Tracking

**Decision:** Use browser sessionId (not user authentication) to track orders, with orders persisting across page reloads.

**Rationale:**
- No login required for customers reduces friction
- sessionId generated on first cart interaction, stored in Svelte store
- Orders can be retrieved by sessionId even if browser refreshes
- Suitable for casual dining where customer identity isn't critical

**Alternatives Considered:**
- **User authentication required:** Force login before ordering
  - ❌ Rejected: Too much friction for casual dining
  - ❌ Rejected: Adds OAuth complexity

- **LocalStorage-only cart:** No backend persistence
  - ❌ Rejected: Cannot track orders across devices
  - ❌ Rejected: No order history for restaurant
  - ❌ Rejected: Lost on browser data clear

- **Table-based orders:** Associate orders with physical table numbers
  - ⚠️ Partially adopted: tableNumber is optional field in orders
  - ⚠️ Can be enhanced in Phase 6 (Table Management)

**Trade-offs:**
- ✅ Pro: Zero friction customer experience
- ✅ Pro: Cart persists across page reloads
- ✅ Pro: Restaurant can track order history
- ⚠️ Con: Orders lost if sessionId cleared (mitigated by localStorage backup in future)
- ⚠️ Con: Multiple tabs = multiple carts (acceptable for MVP)

---

### 3. Modifier Schema Design

**Decision:** Embed modifiers as optional nested objects in `menuItems` table using validated enums.

**Rationale:**
- Modifiers are item-specific (not all items have all modifiers)
- Validated enums ensure data integrity (no typos like "medum" vs "medium")
- Optional fields mean no storage overhead for items without modifiers
- Convex schema validation catches invalid modifier values at write time

**Alternatives Considered:**
- **Separate modifiers table:** Normalize modifiers into their own table with foreign keys
  - ❌ Rejected: Over-engineering for fixed modifier sets
  - ❌ Rejected: Adds join complexity to queries
  - ❌ Rejected: Modifiers are item attributes, not entities

- **Free-text modifiers:** String arrays without validation
  - ❌ Rejected: No data integrity
  - ❌ Rejected: Cannot enforce UI constraints (e.g., only 7 noodle types)
  - ❌ Rejected: Typos would break filtering

- **Global modifier configuration:** Single modifier schema for all items
  - ❌ Rejected: Forces all items to have all modifiers (not realistic)
  - ❌ Rejected: Cannot model item-specific modifier sets

**Trade-offs:**
- ✅ Pro: Type-safe with validated enums
- ✅ Pro: Flexible per-item modifier availability
- ✅ Pro: Self-documenting schema (enum values are specification)
- ⚠️ Con: Adding new modifier types requires schema update
- ⚠️ Con: Nested objects make queries slightly more complex

**Schema Structure:**
```typescript
modifiers: v.optional(v.object({
  temperature: v.optional(v.array(temperatureValidator)),
  noodleType: v.optional(v.array(noodleTypeValidator)),
  // ... other modifier types
}))
```

---

### 4. Event Management Separation

**Decision:** Create 3 separate tables (`eventPackages`, `cateringMenus`, `schoolMeals`) instead of a single polymorphic `events` table.

**Rationale:**
- Each event type has distinct fields (e.g., schoolMeals needs weekNumber, cateringMenus needs deliveryRadius)
- Separate tables enable type-safe queries without discriminator checks
- Future expansion easier (e.g., adding `corporateEvents` table without affecting existing data)
- Clearer admin UI (3 separate tabs vs. single form with conditional fields)

**Alternatives Considered:**
- **Single polymorphic events table:** One table with `eventType` discriminator
  - ❌ Rejected: All fields become optional (schema loses validation power)
  - ❌ Rejected: Queries require filtering by eventType
  - ❌ Rejected: Harder to reason about field requirements

- **Embedded in siteSettings:** Store events in JSON configuration
  - ❌ Rejected: No relational integrity (e.g., included menuItem IDs)
  - ❌ Rejected: Cannot query efficiently (e.g., "find all packages for 50 guests")

**Trade-offs:**
- ✅ Pro: Type-safe schemas per event type
- ✅ Pro: Efficient queries without discriminator filtering
- ✅ Pro: Clear separation of concerns
- ⚠️ Con: 3 tables instead of 1 (minimal cost with Convex)
- ⚠️ Con: Some duplication (e.g., name, description, isActive fields)

---

### 5. Dietary Tags as Array Field

**Decision:** Store dietary tags as an array of validated enums directly in `menuItems` table.

**Rationale:**
- Tags are intrinsic item properties (like price or name)
- Fixed set of 11 tags fits enum validation model
- Array allows multiple tags per item (e.g., item can be both "vegan" and "gluten-free")
- No need for many-to-many relationship table

**Alternatives Considered:**
- **Separate tags table with junction:** Normalize into `dietaryTags` + `menuItemTags` tables
  - ❌ Rejected: Over-engineering for fixed tag set
  - ❌ Rejected: Adds query complexity (joins)

- **Boolean flags:** 11 separate boolean fields on menuItems
  - ❌ Rejected: Verbose schema (11 fields vs 1 array)
  - ❌ Rejected: Cannot iterate over active tags in UI

**Trade-offs:**
- ✅ Pro: Simple schema with validation
- ✅ Pro: Easy to query (e.g., "all vegan items")
- ✅ Pro: Easy to render in UI (map over array)
- ⚠️ Con: Adding new tags requires schema update (acceptable for stable tag set)

---

### 6. Real-Time Layout Updates

**Decision:** Use Convex's built-in reactivity to push layout changes to all connected clients instantly.

**Rationale:**
- Convex query subscriptions automatically re-run when `displayLayouts` table changes
- No polling or manual refetch required
- Admin can change layout and see results on TV/mobile displays immediately
- Leverages existing Convex infrastructure (no WebSocket setup)

**Alternatives Considered:**
- **Polling:** Clients poll for active layout every N seconds
  - ❌ Rejected: Wasted bandwidth for infrequent changes
  - ❌ Rejected: Delay between admin action and client update

- **Manual refresh:** Require clients to reload page
  - ❌ Rejected: Poor UX (admin has to tell customers to refresh)

**Trade-offs:**
- ✅ Pro: Instant updates across all devices
- ✅ Pro: Zero additional code (Convex handles it)
- ⚠️ Con: Relies on Convex subscription infrastructure (vendor lock-in)

---

### 7. Order Lifecycle States

**Decision:** 3-state lifecycle (`active` → `submitted` → `completed`) tracked in `status` field.

**Rationale:**
- `active`: Cart is being built (customer can still modify)
- `submitted`: Order sent to kitchen (immutable from customer side)
- `completed`: Order fulfilled (visible in order history)
- Simple linear progression, no complex state transitions

**Alternatives Considered:**
- **Separate cart and order tables:** Active carts in one table, submitted orders in another
  - ❌ Rejected: Duplication when converting cart to order
  - ❌ Rejected: No unified order history

- **More granular states:** pending, preparing, ready, delivered, paid, etc.
  - ⚠️ Deferred to Phase 6 (Kitchen Display System)
  - ⚠️ MVP needs only 3 states

**Trade-offs:**
- ✅ Pro: Simple to understand and implement
- ✅ Pro: Single query for order history
- ⚠️ Con: No intermediate states (e.g., "preparing") - acceptable for MVP
- ⚠️ Con: Must extend in Phase 6 for kitchen workflow

---

## Migration Strategy

### Schema Migration

**Approach:** Additive-only schema changes deployed via `npx convex deploy`.

**Steps:**
1. New tables auto-created on first deploy
2. New optional fields on `menuItems` default to undefined
3. Existing queries unaffected (backward compatible)

**Safety Measures:**
- All new fields are optional or have defaults
- No removal or renaming of existing fields
- No changes to existing indices

**Rollback Plan:**
- Can rollback deployment via Convex dashboard
- Data in new tables preserved (not deleted)
- Existing functionality unaffected by new tables

---

## Risk Assessment

### High Risk (Mitigated)

**Session Loss on Browser Clear**
- **Risk:** Customer loses cart if browser data cleared
- **Impact:** Frustration, abandoned orders
- **Mitigation (Phase 6):** Add localStorage backup for cart state
- **Current State:** Acceptable for MVP (rare edge case)

**Concurrent Session Conflicts**
- **Risk:** Two tabs with same sessionId conflict on cart updates
- **Impact:** Cart items may overwrite each other
- **Mitigation:** Use Convex optimistic updates with conflict resolution
- **Current State:** Acceptable (most users don't multi-tab)

### Medium Risk (Monitored)

**Complex Modifier Combinations**
- **Risk:** Too many modifiers confuse customers
- **Impact:** Order errors, customer frustration
- **Mitigation:** Only show applicable modifiers per item, clear visual UI
- **Current State:** Tested with dim sum menu (7 modifier types), works well

**Layout Changes During Active Orders**
- **Risk:** Layout switch while customer is ordering
- **Impact:** Mild confusion (menu reorganizes mid-order)
- **Mitigation:** Real-time update is smooth, cart persists across layout changes
- **Current State:** Acceptable (layout changes are infrequent)

### Low Risk (Accepted)

**Event Package Overbooking**
- **Risk:** Multiple customers book same event package simultaneously
- **Impact:** Double-booking
- **Mitigation (Phase 7):** Add booking system with capacity tracking
- **Current State:** Events are informational only (no booking yet)

---

## Performance Considerations

### Query Optimization

**Active Layout Query:**
- Indexed on `isActive` field
- O(1) lookup for single active layout
- Cached by Convex (sub-millisecond response)

**Order by Session:**
- Indexed on `sessionId` field
- Efficient cart retrieval on page load
- No N+1 queries (single fetch includes all items)

**Menu Items with Modifiers:**
- Modifiers stored inline (no joins)
- Single query fetches complete item with all modifiers
- Filtering by dietary tags uses array containment (efficient in Convex)

### Scalability

**Current Load:**
- Small restaurant: <100 menu items, <50 concurrent orders
- Convex free tier supports 1M function calls/month
- Expected usage: ~100K calls/month (comfortable margin)

**Growth Path:**
- Phase 6-10 features add more queries but stay within Convex limits
- Can upgrade to paid tier if >1M calls/month
- No architectural changes needed for 10x growth

---

## Future Enhancements (Phases 6-10)

### Phase 6: Payment Integration
- Stripe/Square integration for online payment
- Split bills for table orders
- Tip calculation

### Phase 7: Kitchen Display System
- Real-time order tracking (preparing → ready → served)
- Printer integration
- Order timing analytics

### Phase 8: Table Management
- Table reservation system
- Capacity tracking
- Wait list management

### Phase 9: Analytics Dashboard
- Order volume by time/day
- Popular items
- Revenue tracking

### Phase 10: Multi-Location Support
- Location selector
- Per-location menus and layouts
- Franchise mode with central management

---

## Conclusion

The implementation successfully balances simplicity (MVP features) with extensibility (clean architecture for future phases). Key decisions prioritize:
- **Developer experience:** Type-safe schemas, no complex ORMs
- **User experience:** Zero friction ordering, instant layout updates
- **Maintainability:** Clear separation of concerns, documented trade-offs

All high-risk items have mitigation plans in upcoming phases, and the current architecture supports planned enhancements without breaking changes.
