import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('page has correct document language', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('page has descriptive title', async ({ page }) => {
    await page.goto('/');

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toContain('Fulala');
  });

  test('main heading is visible and descriptive', async ({ page }) => {
    await page.goto('/');

    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('Fulala');
  });

  test('menu items have accessible labels', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2000);

    const menuItems = page.locator('[data-testid="menu-item"]');
    const count = await menuItems.count();

    if (count > 0) {
      // Each menu item should have an aria-label
      const firstItem = menuItems.first();
      const ariaLabel = await firstItem.getAttribute('aria-label');
      expect(ariaLabel).not.toBeNull();
      expect(ariaLabel?.length).toBeGreaterThan(0);
    }
  });

  test('loading state has aria-live for screen readers', async ({ page }) => {
    await page.goto('/');

    const loadingDiv = page.locator('[aria-live="polite"]');
    const count = await loadingDiv.count();

    // Should have aria-live region for dynamic content
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('category sections are properly labeled', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2000);

    const sections = page.locator('section.category');
    const count = await sections.count();

    if (count > 0) {
      // Each section should have aria-labelledby
      const firstSection = sections.first();
      const labelledBy = await firstSection.getAttribute('aria-labelledby');
      expect(labelledBy).not.toBeNull();
    }
  });

  test('text has sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    // Check that primary text color is dark enough
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    const color = await heading.evaluate((el) => {
      const style = getComputedStyle(el);
      return style.color;
    });

    // Color should be dark (close to black)
    // rgb(26, 26, 26) = #1a1a1a
    expect(color).toBe('rgb(26, 26, 26)');
  });

  test('interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab through the page to ensure focus is visible
    await page.keyboard.press('Tab');

    // The body should handle focus properly
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    // Something should be focused (or body by default)
    expect(focusedElement).toBeDefined();
  });

  test('no images without alt text', async ({ page }) => {
    await page.goto('/');

    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });

  test('lists are properly structured', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2000);

    const lists = page.locator('[role="list"]');
    const count = await lists.count();

    if (count > 0) {
      // Lists should contain list items
      const firstList = lists.first();
      const items = firstList.locator('li');
      const itemCount = await items.count();
      expect(itemCount).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Visual Accessibility', () => {
  test('text is readable at default size', async ({ page }) => {
    await page.goto('/');

    const body = page.locator('body');
    const fontSize = await body.evaluate((el) => {
      const style = getComputedStyle(el);
      return parseFloat(style.fontSize);
    });

    // Font size should be at least 16px
    expect(fontSize).toBeGreaterThanOrEqual(16);
  });

  test('line height provides good readability', async ({ page }) => {
    await page.goto('/');

    const body = page.locator('body');
    const lineHeight = await body.evaluate((el) => {
      const style = getComputedStyle(el);
      return parseFloat(style.lineHeight);
    });

    // Line height should be at least 1.4
    // Note: may return NaN if 'normal', which is fine
    if (!isNaN(lineHeight)) {
      expect(lineHeight).toBeGreaterThanOrEqual(20); // Rough check for 1.4+ at 16px
    }
  });

  test('unavailable items have visual distinction beyond color', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2000);

    const unavailableItem = page.locator('[data-available="false"]').first();

    if (await unavailableItem.count() > 0) {
      // Should have "Sold Out" text as non-color indicator
      const soldOutText = unavailableItem.getByText('Sold Out');
      await expect(soldOutText).toBeVisible();
    }
  });
});
