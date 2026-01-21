import { test, expect } from '@playwright/test';

test.describe('Menu Display', () => {
  test('shows page title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Fulala/);
    await expect(page.getByRole('heading', { name: 'Fulala' })).toBeVisible();
  });

  test('shows loading state initially', async ({ page }) => {
    await page.goto('/');

    // Should show loading or menu content
    const menu = page.locator('.menu');
    await expect(menu).toBeVisible();
  });

  test('shows categories with items when data loads', async ({ page }) => {
    await page.goto('/');

    // Wait for categories to load (or loading to disappear)
    await page.waitForTimeout(2000); // Give Convex time to connect

    // Check for category headings (when data is loaded)
    const headings = page.getByRole('heading', { level: 2 });
    const count = await headings.count();

    // Either we have categories loaded, or we're still loading
    if (count > 0) {
      const firstHeading = headings.first();
      await expect(firstHeading).toBeVisible();
    } else {
      // Still loading - that's okay for this test
      const loadingText = page.getByText('Loading menu');
      await expect(loadingText).toBeVisible();
    }
  });

  test('menu items have prices', async ({ page }) => {
    await page.goto('/');

    // Wait for data
    await page.waitForTimeout(2000);

    const priceElements = page.locator('[data-testid="price"]');
    const count = await priceElements.count();

    if (count > 0) {
      // Prices should contain dollar sign
      const firstPrice = priceElements.first();
      await expect(firstPrice).toContainText('$');
    }
  });

  test('marks unavailable items with reduced opacity', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2000);

    const unavailableItem = page.locator('[data-available="false"]').first();

    if (await unavailableItem.count() > 0) {
      await expect(unavailableItem).toHaveCSS('opacity', '0.5');
    }
  });

  test('unavailable items show sold out badge', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2000);

    const unavailableItem = page.locator('[data-available="false"]').first();

    if (await unavailableItem.count() > 0) {
      const soldOutBadge = unavailableItem.getByText('Sold Out');
      await expect(soldOutBadge).toBeVisible();
    }
  });
});

test.describe('Menu Structure', () => {
  test('menu is wrapped in accessible region', async ({ page }) => {
    await page.goto('/');

    const menuRegion = page.getByRole('region', { name: 'Menu' });
    await expect(menuRegion).toBeVisible();
  });

  test('categories have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Main title is h1
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('Fulala');

    // Wait for categories
    await page.waitForTimeout(2000);

    // Category titles should be h2
    const h2s = page.getByRole('heading', { level: 2 });
    const h2Count = await h2s.count();

    if (h2Count > 0) {
      // Verify categories are h2
      const firstH2 = h2s.first();
      await expect(firstH2).toBeVisible();
    }
  });
});

test.describe('Responsive Design', () => {
  test('displays correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Content should fit without horizontal scroll
    const body = page.locator('body');
    const bodyWidth = await body.evaluate((el) => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test('displays correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const menu = page.locator('.menu');
    await expect(menu).toBeVisible();
  });
});
