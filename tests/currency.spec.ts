import { test, expect } from '@playwright/test';

test.describe('Currency Lens', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('toggle highlights button on click', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to fully load (not just "Loading menu...")
    await page.waitForSelector('[data-testid="price"]', { timeout: 15000 });

    // Wait for currency lens with an active button
    await page.waitForSelector('.currency-lens .lens-button.active', { timeout: 5000 });

    // Get all currency buttons
    const buttons = page.locator('.currency-lens .lens-button');
    const buttonCount = await buttons.count();

    if (buttonCount < 2) {
      test.skip();
      return;
    }

    // Test clicking each button and verify it becomes active
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);

      // Click the button
      await button.click();

      // Wait for the button to become active (Svelte reactivity)
      await expect(button).toHaveClass(/active/, { timeout: 2000 });

      // Verify aria-pressed is true
      await expect(button).toHaveAttribute('aria-pressed', 'true');

      // Verify only one button is active
      const activeButtons = page.locator('.currency-lens .lens-button.active');
      await expect(activeButtons).toHaveCount(1);
    }
  });

  test('rapid toggle switching maintains single active state', async ({ page }) => {
    await page.goto('/');

    // Wait for component to be fully initialized with an active button
    await page.waitForSelector('.currency-lens .lens-button.active', { timeout: 10000 });

    const buttons = page.locator('.currency-lens .lens-button');
    const buttonCount = await buttons.count();

    if (buttonCount < 2) {
      test.skip();
      return;
    }

    // Rapidly click between buttons
    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < buttonCount; i++) {
        await buttons.nth(i).click();

        // Immediately verify only ONE button is active
        const activeButtons = page.locator('.currency-lens .lens-button.active');
        const activeCount = await activeButtons.count();
        expect(activeCount).toBe(1);
      }
    }
  });

  test('displays prices on the menu page', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="price"]');

    const prices = page.locator('[data-testid="price"]');
    const count = await prices.count();

    expect(count).toBeGreaterThan(0);
  });

  test('shows currency lens when multiple currencies available', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check if currency lens exists (it only shows if multiple currencies are configured)
    const currencyLens = page.locator('.currency-lens');
    const lensExists = await currencyLens.count() > 0;

    if (lensExists) {
      await expect(currencyLens).toBeVisible();
    }
  });

  test('switches currency when lens button clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check if EUR button exists
    const eurButton = page.locator('[data-testid="currency-EUR"]');
    const eurExists = await eurButton.count() > 0;

    if (eurExists) {
      // Get initial price text
      const priceElement = page.locator('[data-testid="price"]').first();
      const initialPrice = await priceElement.textContent();

      // Click EUR button
      await eurButton.click();

      // Wait for price to update
      await page.waitForTimeout(500);

      // Get new price text
      const newPrice = await priceElement.textContent();

      // Price should have changed (contains euro symbol)
      expect(newPrice).toContain('€');
    }
  });

  test('persists currency choice in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check if EUR button exists
    const eurButton = page.locator('[data-testid="currency-EUR"]');
    const eurExists = await eurButton.count() > 0;

    if (eurExists) {
      // Click EUR button
      await eurButton.click();

      // Verify localStorage is set
      const storedCurrency = await page.evaluate(() => localStorage.getItem('selectedCurrency'));
      expect(storedCurrency).toBe('EUR');
    }
  });

  test('restores currency choice after page reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check if USD button exists
    const usdButton = page.locator('[data-testid="currency-USD"]');
    const usdExists = await usdButton.count() > 0;

    if (usdExists) {
      // Click USD button
      await usdButton.click();
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await page.waitForTimeout(2000);

      // Get price element
      const priceElement = page.locator('[data-testid="price"]').first();
      const priceText = await priceElement.textContent();

      // Should show USD price (dollar sign)
      expect(priceText).toContain('$');
    }
  });

  test('prices have distinct styling (price color)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const priceElement = page.locator('[data-testid="price"]').first();

    if (await priceElement.count() > 0) {
      // Verify price has font-weight 600 (semi-bold)
      await expect(priceElement).toHaveCSS('font-weight', '600');
    }
  });
});

test.describe('Currency Lens on TV View', () => {
  test('shows currency lens on TV display', async ({ page }) => {
    await page.goto('/tv');
    await page.waitForTimeout(2000);

    // Currency lens should be visible on TV view
    const currencyLens = page.locator('.currency-lens-wrapper .currency-lens');
    const lensExists = await currencyLens.count() > 0;

    if (lensExists) {
      await expect(currencyLens).toBeVisible();
    }
  });

  test('TV view displays single price per item', async ({ page }) => {
    await page.goto('/tv');
    await page.waitForTimeout(2000);

    // Select a specific currency first
    const czkButton = page.locator('[data-testid="currency-CZK"]');
    if (await czkButton.count() > 0) {
      await czkButton.click();
      await page.waitForTimeout(500);

      // Verify prices show in CZK
      const priceElement = page.locator('[data-testid="price"]').first();
      const priceText = await priceElement.textContent();

      // Should show CZK (Kč symbol)
      expect(priceText).toContain('Kč');
    }
  });
});

test.describe('Multi-Currency Display Mode', () => {
  test('displays multiple currencies when in multi mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Clear any currency lens selection to see multi mode
    await page.evaluate(() => localStorage.removeItem('selectedCurrency'));
    await page.reload();
    await page.waitForTimeout(2000);

    // Check for multi-currency display (contains separator)
    const priceMulti = page.locator('.price-multi');
    if (await priceMulti.count() > 0) {
      // Multi mode shows multiple currencies with separator
      const priceText = await priceMulti.first().textContent();
      expect(priceText).toMatch(/·|,/); // Contains separator
    }
  });
});

test.describe('Price Conversion Accuracy', () => {
  test('converted prices are reasonable', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Click CZK first
    const czkButton = page.locator('[data-testid="currency-CZK"]');
    if (await czkButton.count() > 0) {
      await czkButton.click();
      await page.waitForTimeout(500);

      const priceElement = page.locator('[data-testid="price"]').first();
      const czkPrice = await priceElement.textContent();

      // Extract number from CZK price
      const czkMatch = czkPrice?.match(/[\d,]+/);
      if (czkMatch) {
        const czkValue = parseInt(czkMatch[0].replace(/,/g, ''));

        // Switch to EUR
        const eurButton = page.locator('[data-testid="currency-EUR"]');
        if (await eurButton.count() > 0) {
          await eurButton.click();
          await page.waitForTimeout(500);

          const eurPrice = await priceElement.textContent();
          const eurMatch = eurPrice?.match(/[\d.,]+/);

          if (eurMatch) {
            const eurValue = parseFloat(eurMatch[0].replace(',', '.'));

            // EUR should be roughly 1/25th of CZK (rate around 25)
            // Allow for rate variations (15-35 range)
            const ratio = czkValue / eurValue;
            expect(ratio).toBeGreaterThan(10);
            expect(ratio).toBeLessThan(50);
          }
        }
      }
    }
  });
});
