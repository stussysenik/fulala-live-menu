# Tasks: Add Advanced Menu Features

## 1. Database Schema

### 1.1 Display Layouts Table
- [x] 1.1.1 Define `displayLayouts` table with layoutType enum (standard-list, dim-sum-grid, card-grid)
- [x] 1.1.2 Add config object (columnsPerRow, showCheckboxes, showItemNumbers, showImages, categoryStyle)
- [x] 1.1.3 Add isActive boolean for active layout tracking
- [x] 1.1.4 Create by_active index for efficient active layout queries

### 1.2 Customer Orders Table
- [x] 1.2.1 Define `customerOrders` table with sessionId for cart tracking
- [x] 1.2.2 Add status enum (active, submitted, completed) for order lifecycle
- [x] 1.2.3 Add items array with menuItemId, name, quantity, unitPrice, selectedModifiers
- [x] 1.2.4 Add subtotal, tax, total fields for pricing
- [x] 1.2.5 Add optional tableNumber and notes fields
- [x] 1.2.6 Add createdAt and updatedAt timestamps
- [x] 1.2.7 Create by_session and by_status indices

### 1.3 Event Management Tables
- [x] 1.3.1 Define `eventPackages` table (name, description, min/max guests, pricePerPerson, deposit, includedItems)
- [x] 1.3.2 Create by_active index for eventPackages
- [x] 1.3.3 Define `cateringMenus` table (name, minOrderAmount, deliveryRadius, items)
- [x] 1.3.4 Create by_active index for cateringMenus
- [x] 1.3.5 Define `schoolMeals` table (weekNumber, year, dayOfWeek enum, items, pricePerMeal)
- [x] 1.3.6 Create by_week compound index (year, weekNumber)

### 1.4 MenuItem Enhancements
- [x] 1.4.1 Add modifiers object with temperature, noodleType, fryingDegree, brothType, spiceLevel arrays
- [x] 1.4.2 Define temperatureValidator enum (hot, cold, room-temp)
- [x] 1.4.3 Define noodleTypeValidator enum (thin, flat, thick, hand-pulled, rice, glass, egg)
- [x] 1.4.4 Define fryingDegreeValidator enum (light, golden, crispy)
- [x] 1.4.5 Define brothTypeValidator enum (clear, bone, spicy, tomato, coconut)
- [x] 1.4.6 Define spiceLevelValidator enum (mild, medium, hot, extra-hot)
- [x] 1.4.7 Add dietaryTags array field to menuItems
- [x] 1.4.8 Define dietaryTagValidator enum (vegetarian, vegan, contains-seafood, contains-pork, contains-beef, contains-chicken, contains-nuts, gluten-free, dairy-free, halal, kosher)
- [x] 1.4.9 Add drinkOptions object (temperatures, defaultTemp, sugarLevels, addOns)
- [x] 1.4.10 Add itemCode string field for dim sum numbering (e.g., "S1", "F2")

## 2. Backend Functions (Convex)

### 2.1 Layout Operations (convex/layouts.ts)
- [x] 2.1.1 Create `getActiveLayout` query to fetch current active layout
- [x] 2.1.2 Create `getAllLayouts` query to list all layouts
- [x] 2.1.3 Create `createLayout` mutation to add new layout
- [x] 2.1.4 Create `updateLayout` mutation to modify layout config
- [x] 2.1.5 Create `setActiveLayout` mutation to switch active layout (deactivates others)
- [x] 2.1.6 Create `deleteLayout` mutation to remove layout

### 2.2 Order Operations (convex/orders.ts)
- [x] 2.2.1 Create `getActiveOrder` query to fetch active order by sessionId
- [x] 2.2.2 Create `getOrderById` query to fetch specific order
- [x] 2.2.3 Create `getOrdersByStatus` query to list orders by status
- [x] 2.2.4 Create `createOrder` mutation to start new order
- [x] 2.2.5 Create `addItemToOrder` mutation to add item with modifiers to cart
- [x] 2.2.6 Create `updateOrderItem` mutation to change quantity or modifiers
- [x] 2.2.7 Create `removeItemFromOrder` mutation to delete cart item
- [x] 2.2.8 Create `updateOrderDetails` mutation to set tableNumber/notes
- [x] 2.2.9 Create `submitOrder` mutation to move from active → submitted
- [x] 2.2.10 Create `completeOrder` mutation to move from submitted → completed
- [x] 2.2.11 Create `clearOrder` mutation to empty cart while keeping sessionId
- [x] 2.2.12 Implement automatic subtotal/tax/total recalculation on item changes

### 2.3 Event Operations (convex/events.ts)
- [x] 2.3.1 Create `getActiveEventPackages` query
- [x] 2.3.2 Create `getEventPackageById` query
- [x] 2.3.3 Create `createEventPackage` mutation
- [x] 2.3.4 Create `updateEventPackage` mutation
- [x] 2.3.5 Create `deleteEventPackage` mutation
- [x] 2.3.6 Create `getActiveCateringMenus` query
- [x] 2.3.7 Create `getCateringMenuById` query
- [x] 2.3.8 Create `createCateringMenu` mutation
- [x] 2.3.9 Create `updateCateringMenu` mutation
- [x] 2.3.10 Create `deleteCateringMenu` mutation
- [x] 2.3.11 Create `getSchoolMealsByWeek` query (year, weekNumber)
- [x] 2.3.12 Create `getSchoolMealById` query
- [x] 2.3.13 Create `createSchoolMeal` mutation
- [x] 2.3.14 Create `updateSchoolMeal` mutation
- [x] 2.3.15 Create `deleteSchoolMeal` mutation

## 3. Admin Interface

### 3.1 Layout Management (/admin/layout)
- [x] 3.1.1 Create `/admin/layout/+page.svelte` route
- [x] 3.1.2 Add layout type selector (standard-list, dim-sum-grid, card-grid)
- [x] 3.1.3 Add config editors for each layout type (columns, checkboxes, images, etc.)
- [x] 3.1.4 Implement live preview of selected layout
- [x] 3.1.5 Add "Set Active" button to activate layout
- [x] 3.1.6 Display current active layout indicator

### 3.2 Item Modifier Editor
- [x] 3.2.1 Create `ItemModifierEditor.svelte` component
- [x] 3.2.2 Add temperature modifier multi-select
- [x] 3.2.3 Add noodle type modifier multi-select with Chinese translations
- [x] 3.2.4 Add frying degree modifier multi-select
- [x] 3.2.5 Add broth type modifier multi-select with Chinese translations
- [x] 3.2.6 Add spice level modifier multi-select
- [x] 3.2.7 Add drink options editor (temperatures, sugar levels, add-ons with prices)
- [x] 3.2.8 Integrate modifier editor into existing menu item admin form
- [x] 3.2.9 Add visual indicators for which modifiers are active on each item

### 3.3 Dietary Tag Editor
- [x] 3.3.1 Add dietary tag multi-select to menu item admin form
- [x] 3.3.2 Display emoji icons next to tag names for clarity
- [x] 3.3.3 Group tags by category (dietary restrictions, protein types, allergens, religious)

### 3.4 Event Management (/admin/events)
- [x] 3.4.1 Create `/admin/events/+page.svelte` route
- [x] 3.4.2 Add tab navigation (Event Packages, Catering, School Meals)
- [x] 3.4.3 Implement Event Packages tab with create/edit/delete forms
- [x] 3.4.4 Add guest count range inputs (min/max)
- [x] 3.4.5 Add per-person pricing and deposit fields
- [x] 3.4.6 Add included items multi-select (from menu items)
- [x] 3.4.7 Implement Catering tab with menu creation forms
- [x] 3.4.8 Add minimum order amount and delivery radius inputs
- [x] 3.4.9 Implement School Meals tab with weekly schedule
- [x] 3.4.10 Add week/year selector and day-of-week schedule grid
- [x] 3.4.11 Add per-meal pricing input

### 3.5 Navigation Updates
- [x] 3.5.1 Add "Layouts" link to admin sidebar in `/admin/+layout.svelte`
- [x] 3.5.2 Add "Events" link to admin sidebar
- [x] 3.5.3 Update navigation highlighting for new routes

## 4. Customer Interface

### 4.1 Display Layout Components
- [x] 4.1.1 Create `CardGrid.svelte` component with image cards and responsive grid
- [x] 4.1.2 Create `DimSumGrid.svelte` component with 2-column layout and checkboxes
- [x] 4.1.3 Add item code display (S1, F2, etc.) in dim sum grid
- [x] 4.1.4 Create `LayoutRenderer.svelte` dynamic switcher based on active layout
- [x] 4.1.5 Integrate LayoutRenderer into main menu page `/+page.svelte`

### 4.2 Dietary Tags Display
- [x] 4.2.1 Create `DietaryTags.svelte` component with emoji icons
- [x] 4.2.2 Add icon mapping (vegetarian 🥬, vegan 🌱, seafood 🦐, etc.)
- [x] 4.2.3 Integrate into MenuItem display components
- [x] 4.2.4 Add tooltips for accessibility

### 4.3 Modifier Components
- [x] 4.3.1 Create `ModifierBadges.svelte` for read-only modifier display
- [x] 4.3.2 Add visual styling for each modifier type
- [x] 4.3.3 Create `ModifierSelector.svelte` for interactive selection
- [x] 4.3.4 Implement dropdown/button groups for each modifier type
- [x] 4.3.5 Add validation (only show applicable modifiers per item)
- [x] 4.3.6 Add "Add-ons" section with price increments for drinks
- [x] 4.3.7 Emit modifier selection events for cart integration

### 4.4 Order Cart System
- [x] 4.4.1 Create `src/lib/stores/order.ts` Svelte store for cart state
- [x] 4.4.2 Implement cart item management (add, update, remove)
- [x] 4.4.3 Add sessionId generation and persistence
- [x] 4.4.4 Create `OrderCart.svelte` component with item list
- [x] 4.4.5 Add quantity increment/decrement controls
- [x] 4.4.6 Display selected modifiers for each item
- [x] 4.4.7 Show subtotal, tax (10%), and total calculations
- [x] 4.4.8 Add "Clear Cart" button with confirmation
- [x] 4.4.9 Add "Submit Order" button
- [x] 4.4.10 Create `OrderReceipt.svelte` for order confirmation display

### 4.5 Order Page (/order)
- [x] 4.5.1 Create `/order/+page.svelte` route
- [x] 4.5.2 Display menu items with "Add to Cart" buttons
- [x] 4.5.3 Integrate ModifierSelector for customizable items
- [x] 4.5.4 Show OrderCart component in sidebar (desktop) or bottom sheet (mobile)
- [x] 4.5.5 Add table number input field
- [x] 4.5.6 Add order notes textarea
- [x] 4.5.7 Implement order submission flow (active → submitted)
- [x] 4.5.8 Show OrderReceipt after successful submission
- [x] 4.5.9 Add "Start New Order" button after submission

## 5. UI Components

### 5.1 Layout Components (3 files)
- [x] 5.1.1 CardGrid.svelte: 8189 bytes, responsive card layout with images
- [x] 5.1.2 DimSumGrid.svelte: 8284 bytes, 2-column grid with checkboxes and item codes
- [x] 5.1.3 LayoutRenderer.svelte: 1786 bytes, dynamic layout switcher

### 5.2 Modifier Components (2 files)
- [x] 5.2.1 ModifierBadges.svelte: 4168 bytes, read-only modifier display
- [x] 5.2.2 ModifierSelector.svelte: 11874 bytes, interactive modifier picker with validation

### 5.3 Order Components (2 files)
- [x] 5.3.1 OrderCart.svelte: 8783 bytes, shopping cart with item management
- [x] 5.3.2 OrderReceipt.svelte: 7243 bytes, order confirmation display

### 5.4 Admin Components (1 file)
- [x] 5.4.1 ItemModifierEditor.svelte: 12895 bytes, comprehensive modifier configuration

### 5.5 Shared Components (1 file)
- [x] 5.5.1 DietaryTags.svelte: Visual dietary tag badges with emoji icons

## 6. Documentation

### 6.1 OpenSpec Documentation
- [x] 6.1.1 Create retrospective proposal.md documenting implementation
- [x] 6.1.2 Create comprehensive tasks.md with all completed work
- [x] 6.1.3 Create design.md documenting architectural decisions
- [x] 6.1.4 Create menu-display/spec.md with layout and modifier requirements
- [x] 6.1.5 Create customer-ordering/spec.md with order system requirements
- [x] 6.1.6 Create event-management/spec.md with event feature requirements

### 6.2 Project Documentation
- [x] 6.2.1 Create PROGRESS.md with version history and roadmap
- [x] 6.2.2 Create DOCS.md with technical reference
- [x] 6.2.3 Update README.md with new features and routes

### 6.3 Git Operations
- [x] 6.3.1 Stage all new and modified files
- [x] 6.3.2 Create comprehensive commit message documenting all changes
- [x] 6.3.3 Push to main branch

## Verification Checklist

### Database
- [x] All 5 new tables exist in Convex dashboard
- [x] All new fields exist in menuItems table
- [x] All indices created successfully

### Backend
- [x] All layout queries/mutations functional
- [x] All order queries/mutations functional
- [x] All event queries/mutations functional
- [x] Type generation includes new API functions

### Admin UI
- [x] Layout management page accessible and functional
- [x] Event management page accessible and functional
- [x] Modifier editor integrated into menu item forms
- [x] Dietary tag editor integrated into menu item forms
- [x] Navigation links working

### Customer UI
- [x] Display layouts switch correctly on main menu
- [x] Order page displays menu with cart
- [x] Cart persists across page reloads
- [x] Modifiers selectable and display correctly
- [x] Dietary tags visible on menu items
- [x] Order submission creates submitted order

### Integration
- [x] Real-time layout updates via Convex reactivity
- [x] Cart state syncs with Convex backend
- [x] Modifier selections persist in orders
- [x] Pricing calculations accurate (subtotal + 10% tax)
