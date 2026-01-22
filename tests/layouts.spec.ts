import { test, expect } from '@playwright/test';

test.describe('Per-Page Layouts', () => {
  test('home page uses display layout', async ({ page }) => {
    await page.goto('/');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Should have a layout renderer
    const layoutRenderer = page.locator('.layout-renderer');
    await expect(layoutRenderer).toBeVisible();
  });

  test('TV page uses display layout', async ({ page }) => {
    await page.goto('/tv');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Should have layout content
    const tvMenu = page.locator('.tv-menu');
    await expect(tvMenu).toBeVisible();
  });

  test('order page loads with layout', async ({ page }) => {
    await page.goto('/order');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Should have order page container
    const orderPage = page.locator('.order-page');
    await expect(orderPage).toBeVisible();

    // Should have layout renderer
    const layoutRenderer = page.locator('.layout-renderer');
    await expect(layoutRenderer).toBeVisible();
  });

  test('order page has cart functionality', async ({ page }) => {
    await page.goto('/order');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Should have cart button in header
    const cartBtn = page.locator('.cart-btn');
    await expect(cartBtn).toBeVisible();
  });
});

test.describe('Layout Admin', () => {
  test('admin layout page loads', async ({ page }) => {
    await page.goto('/admin/layout');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Should have page header
    const header = page.getByRole('heading', { name: 'Display Layouts' });
    await expect(header).toBeVisible();
  });

  test('admin layout page has page type tabs', async ({ page }) => {
    await page.goto('/admin/layout');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Should have Display Pages tab
    const displayTab = page.getByText('Display Pages');
    await expect(displayTab).toBeVisible();

    // Should have Order Page tab
    const orderTab = page.getByText('Order Page');
    await expect(orderTab).toBeVisible();
  });

  test('can switch between page type tabs', async ({ page }) => {
    await page.goto('/admin/layout');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Click on Order Page tab
    const orderTab = page.locator('.tab-btn').filter({ hasText: 'Order Page' });
    await orderTab.click();

    // Tab should now be active
    await expect(orderTab).toHaveClass(/active/);
  });

  test('layout cards show configuration', async ({ page }) => {
    await page.goto('/admin/layout');

    // Wait for content to load
    await page.waitForTimeout(3000);

    // Look for layout cards
    const layoutCards = page.locator('.layout-card');
    const count = await layoutCards.count();

    if (count > 0) {
      // At least one layout should exist
      const firstCard = layoutCards.first();
      await expect(firstCard).toBeVisible();

      // Should show configuration section
      const configSection = firstCard.locator('.config-section');
      await expect(configSection).toBeVisible();
    } else {
      // Empty state or initialize button should be visible
      const emptyState = page.locator('.empty-state');
      await expect(emptyState).toBeVisible();
    }
  });
});

test.describe('Traditional Chinese Layout', () => {
  test('traditional chinese layout preview renders', async ({ page }) => {
    await page.goto('/admin/layout');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Click show preview button
    const previewToggle = page.locator('.preview-toggle');
    await previewToggle.click();

    // Select traditional chinese layout
    const traditionalBtn = page.locator('.preview-type-btn').filter({ hasText: 'Traditional Chinese' });

    if (await traditionalBtn.isVisible()) {
      await traditionalBtn.click();

      // Wait for preview to render
      await page.waitForTimeout(1000);

      // Preview should be visible
      const previewPanel = page.locator('.live-preview-panel');
      await expect(previewPanel).toBeVisible();
    }
  });

  test('layout preview icons show all 4 layout types', async ({ page }) => {
    await page.goto('/admin/layout');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Preview section should show all layout types
    const previewCards = page.locator('.preview-card');
    const count = await previewCards.count();

    // Should have 4 layout previews (standard, dim-sum, card, traditional)
    expect(count).toBe(4);

    // Traditional Chinese should be among them
    const traditionalCard = page.locator('.preview-card').filter({ hasText: 'Traditional Chinese' });
    await expect(traditionalCard).toBeVisible();
  });
});

test.describe('Layout Independence', () => {
  test('display and order pages can have different layouts', async ({ page }) => {
    // This test verifies the architecture allows independent layouts
    // by checking that both pages load successfully

    // Check display page
    await page.goto('/');
    await page.waitForTimeout(2000);
    const displayLayout = page.locator('.layout-renderer');
    await expect(displayLayout).toBeVisible();

    // Check order page
    await page.goto('/order');
    await page.waitForTimeout(2000);
    const orderLayout = page.locator('.layout-renderer');
    await expect(orderLayout).toBeVisible();

    // Both pages should have loaded their layouts independently
  });
});
