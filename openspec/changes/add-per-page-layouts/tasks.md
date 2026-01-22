# Tasks: Per-Page Layout Configuration

## 1. Schema & Backend

- [x] 1.1 Add pageType field to displayLayouts schema
- [x] 1.2 Add traditional-chinese layout type to schema
- [x] 1.3 Update getActiveLayout query to accept pageType parameter
- [x] 1.4 Add getAllLayouts query for admin filtering
- [x] 1.5 Create migrateLayoutsToPageType mutation for existing data
- [x] 1.6 Update initializeDefaultLayouts to create layouts for both page types

## 2. Layout Components

- [x] 2.1 Create TraditionalChineseGrid.svelte component
- [x] 2.2 Add colorScheme config option (classic-red, jade-green, gold)
- [x] 2.3 Add showQuantityInput config option
- [x] 2.4 Update LayoutRenderer to accept pageType prop
- [x] 2.5 Register traditional-chinese in LayoutRenderer

## 3. Admin Interface

- [x] 3.1 Add page type tabs to /admin/layout
- [x] 3.2 Filter layouts by selected page type
- [x] 3.3 Add color scheme selector for traditional-chinese layout
- [x] 3.4 Create CurrencyConfigEditor component
- [x] 3.5 Add migration button for existing layouts

## 4. Page Updates

- [x] 4.1 Update home page (+page.svelte) to use pageType="display"
- [x] 4.2 Update TV page to use pageType="display"
- [x] 4.3 Update order page to use pageType="order"

## 5. Build Validation

- [x] 5.1 Create scripts/validate-env.cjs
- [x] 5.2 Add validate:env npm script
- [x] 5.3 Update build script to run validation first
- [x] 5.4 Update vercel.json with explicit buildCommand

## 6. Testing

- [x] 6.1 Add Playwright tests for layout page type tabs
- [x] 6.2 Add Playwright tests for traditional chinese layout
- [x] 6.3 Add Playwright tests for currency display

## 7. Documentation

- [x] 7.1 Update README with v0.3.0 features
- [x] 7.2 Update DOCS.md with layout configuration
- [x] 7.3 Update PROGRESS.md with completed features
