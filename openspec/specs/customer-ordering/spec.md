# customer-ordering Specification

## Purpose
TBD - created by archiving change add-advanced-menu-features. Update Purpose after archive.
## Requirements
### Requirement: Session-Based Cart Tracking

The system SHALL track customer orders using browser sessionId without requiring authentication, with cart persistence across page reloads.

#### Scenario: Generate sessionId on first cart interaction
- **GIVEN** customer has no existing sessionId
- **WHEN** customer adds first item to cart
- **THEN** a unique sessionId is generated (e.g., UUID v4)
- **AND** sessionId is stored in Svelte store and localStorage
- **AND** an active order is created in database with this sessionId

#### Scenario: Reuse existing sessionId on page reload
- **GIVEN** customer has an existing sessionId in localStorage
- **WHEN** customer reloads the page or navigates back to `/order`
- **THEN** the existing sessionId is loaded from localStorage
- **AND** the active order is retrieved from database by sessionId
- **AND** cart items are restored to the UI

#### Scenario: Multiple tabs with same sessionId
- **GIVEN** customer opens multiple tabs with same sessionId
- **WHEN** customer adds item in one tab
- **THEN** both tabs share the same cart (via Convex reactivity)
- **AND** cart updates appear in both tabs within 1 second

---

### Requirement: Add Items to Cart

The system SHALL allow customers to add menu items to their cart with quantity and optional modifiers.

#### Scenario: Add item without modifiers
- **GIVEN** customer is viewing a menu item with no modifiers
- **WHEN** customer clicks "Add to Cart"
- **THEN** item is added to order with quantity 1
- **AND** cart updates to show the new item
- **AND** subtotal increases by item price

#### Scenario: Add item with selected modifiers
- **GIVEN** customer is viewing an item with modifiers (e.g., noodle type, spice level)
- **WHEN** customer selects modifiers and clicks "Add to Cart"
- **THEN** item is added with selectedModifiers object populated
- **AND** selected modifiers display in cart next to item name
- **AND** subtotal increases by item price (modifiers do not add cost in MVP)

#### Scenario: Add same item with different modifiers
- **GIVEN** cart already contains "Pad Thai" with thin noodles
- **WHEN** customer adds "Pad Thai" with flat noodles
- **THEN** a separate cart line item is created
- **AND** both items display with their respective modifiers

#### Scenario: Add item with drink add-ons
- **GIVEN** customer is ordering a drink with add-ons configured (e.g., +Boba +$1, +Honey +$0.50)
- **WHEN** customer selects add-ons and adds to cart
- **THEN** item price includes add-on costs
- **AND** cart displays base price + add-on breakdown

---

### Requirement: Cart Item Management

The system SHALL allow customers to update quantities, remove items, and clear the entire cart.

#### Scenario: Increase item quantity
- **GIVEN** cart contains an item with quantity 2
- **WHEN** customer clicks increment button
- **THEN** quantity increases to 3
- **AND** subtotal increases by one unit price
- **AND** total recalculates automatically

#### Scenario: Decrease item quantity
- **GIVEN** cart contains an item with quantity 3
- **WHEN** customer clicks decrement button
- **THEN** quantity decreases to 2
- **AND** subtotal decreases by one unit price

#### Scenario: Remove item when quantity reaches zero
- **GIVEN** cart contains an item with quantity 1
- **WHEN** customer clicks decrement button
- **THEN** item is removed from cart entirely
- **AND** cart updates to reflect removal

#### Scenario: Remove item directly
- **GIVEN** cart contains multiple items
- **WHEN** customer clicks "Remove" button on an item
- **THEN** item is removed regardless of quantity
- **AND** cart and totals update immediately

#### Scenario: Clear entire cart
- **GIVEN** cart contains multiple items
- **WHEN** customer clicks "Clear Cart" button
- **AND** confirms the action in the confirmation dialog
- **THEN** all items are removed from cart
- **AND** subtotal and total reset to 0
- **AND** sessionId is preserved for future orders

---

### Requirement: Order Calculations

The system SHALL automatically calculate subtotal, tax (10%), and total for all cart operations.

#### Scenario: Calculate subtotal from item prices
- **GIVEN** cart contains Item A ($10) qty 2, Item B ($5) qty 1
- **WHEN** cart is rendered
- **THEN** subtotal displays $25 (10*2 + 5*1)

#### Scenario: Calculate 10% tax
- **GIVEN** subtotal is $25
- **WHEN** cart is rendered
- **THEN** tax displays $2.50 (25 * 0.10)

#### Scenario: Calculate total
- **GIVEN** subtotal is $25 and tax is $2.50
- **WHEN** cart is rendered
- **THEN** total displays $27.50 (25 + 2.50)

#### Scenario: Recalculate on quantity change
- **GIVEN** cart totals are calculated
- **WHEN** customer increases item quantity
- **THEN** subtotal, tax, and total recalculate immediately
- **AND** new values display within 100ms

---

### Requirement: Order Submission

The system SHALL allow customers to submit orders, transitioning them from active to submitted status.

#### Scenario: Submit order with table number
- **GIVEN** cart contains at least one item
- **WHEN** customer enters table number "12" and clicks "Submit Order"
- **THEN** order status changes from active to submitted
- **AND** order cannot be modified further
- **AND** order receipt displays with table number

#### Scenario: Submit order with notes
- **GIVEN** cart contains items
- **WHEN** customer enters notes "No onions, extra spicy" and submits
- **THEN** order is submitted with notes field populated
- **AND** notes appear on order receipt

#### Scenario: Submit order without table number
- **GIVEN** cart contains items
- **WHEN** customer leaves table number blank and submits
- **THEN** order is submitted successfully
- **AND** tableNumber field is undefined in database

#### Scenario: Cannot submit empty cart
- **GIVEN** cart is empty
- **WHEN** customer attempts to click "Submit Order"
- **THEN** submit button is disabled
- **AND** customer sees message "Cart is empty"

---

### Requirement: Order Receipt Display

The system SHALL display a confirmation receipt after successful order submission.

#### Scenario: Display order receipt after submission
- **GIVEN** customer submitted an order
- **WHEN** submission completes successfully
- **THEN** order receipt displays showing all items, quantities, modifiers
- **AND** receipt shows subtotal, tax, total
- **AND** receipt shows table number and notes if provided
- **AND** receipt shows order timestamp

#### Scenario: Start new order from receipt
- **GIVEN** customer is viewing order receipt
- **WHEN** customer clicks "Start New Order"
- **THEN** a new active order is created with same sessionId
- **AND** cart is empty
- **AND** customer returns to menu page

---

### Requirement: Order Lifecycle States

The system SHALL manage orders through a 3-state lifecycle: active → submitted → completed.

#### Scenario: Create order in active state
- **GIVEN** customer has no existing active order
- **WHEN** customer adds first item to cart
- **THEN** new order is created with status: "active"
- **AND** order appears in database with active status

#### Scenario: Transition to submitted state
- **GIVEN** order is in active state
- **WHEN** customer submits the order
- **THEN** order status changes to "submitted"
- **AND** order timestamp is recorded
- **AND** order is immutable from customer perspective

#### Scenario: Complete order (staff action)
- **GIVEN** order is in submitted state
- **WHEN** staff marks order as completed (future Phase 6 feature)
- **THEN** order status changes to "completed"
- **AND** order appears in order history

#### Scenario: Cannot modify submitted order
- **GIVEN** order is in submitted state
- **WHEN** customer attempts to add/remove items
- **THEN** modification is rejected
- **AND** customer sees message "Order already submitted"

---

### Requirement: Modifier Selection in Orders

The system SHALL capture and display selected modifiers for each order item.

#### Scenario: Select noodle type modifier
- **GIVEN** customer is adding an item with noodle type modifier
- **WHEN** customer selects "flat" noodles and adds to cart
- **THEN** order item includes selectedModifiers.noodleType: "flat"
- **AND** cart displays "Flat Noodles" badge next to item

#### Scenario: Select multiple modifiers
- **GIVEN** customer is adding an item with temperature and spice level modifiers
- **WHEN** customer selects "hot" temperature and "medium" spice
- **THEN** order item includes both selectedModifiers.temperature: "hot" and selectedModifiers.spiceLevel: "medium"
- **AND** cart displays both badges

#### Scenario: Modifier selection is optional
- **GIVEN** item has modifiers configured but none are required
- **WHEN** customer adds item without selecting modifiers
- **THEN** item is added with selectedModifiers object undefined or empty
- **AND** no modifier badges appear in cart

#### Scenario: Selected modifiers persist in receipt
- **GIVEN** order was submitted with modifier selections
- **WHEN** order receipt is displayed
- **THEN** all selected modifiers appear in receipt
- **AND** modifiers are clearly labeled per item

---

### Requirement: Cart Persistence

The system SHALL persist cart state across page reloads and browser sessions using sessionId and database storage.

#### Scenario: Cart persists on page reload
- **GIVEN** customer has items in cart
- **WHEN** customer reloads the page (F5 or hard refresh)
- **THEN** cart items are retrieved from database by sessionId
- **AND** all items, quantities, and modifiers are restored
- **AND** cart appears identical to before reload

#### Scenario: Cart persists across navigation
- **GIVEN** customer has items in cart on `/order` page
- **WHEN** customer navigates to `/` and back to `/order`
- **THEN** cart items are still present
- **AND** cart state is unchanged

#### Scenario: Cart lost on sessionId clear
- **GIVEN** customer clears browser localStorage/cookies
- **WHEN** customer returns to `/order` page
- **THEN** new sessionId is generated
- **AND** cart is empty (previous cart cannot be retrieved)

---

### Requirement: Real-Time Cart Updates

The system SHALL use Convex reactivity to synchronize cart state across multiple tabs and devices in real-time.

#### Scenario: Cart update appears in other tabs
- **GIVEN** customer has two tabs open with same sessionId
- **WHEN** customer adds item in tab A
- **THEN** cart updates in tab B within 1 second
- **AND** item counts and totals match in both tabs

#### Scenario: Order submission syncs across tabs
- **GIVEN** customer has two tabs open
- **WHEN** customer submits order in tab A
- **THEN** tab B shows order receipt within 1 second
- **AND** cart is cleared in both tabs

---

