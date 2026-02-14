import { test, expect } from '@playwright/test';

/**
 * Admin Panel Tests
 *
 * Tests the admin dashboard, menu management, live preview,
 * schedule, theme, events, print, and analytics pages.
 * Uses Desktop Chrome viewport.
 */

test.use({ viewport: { width: 1280, height: 800 } });

const ADMIN_PASSWORD = 'fulala2026';

// Helper: login to admin
async function adminLogin(page: import('@playwright/test').Page) {
	await page.goto('/admin');
	// Should redirect to login
	await page.waitForSelector('#password', { timeout: 5000 });
	await page.fill('#password', ADMIN_PASSWORD);
	await page.click('.login-button');
	await page.waitForSelector('.admin-layout', { timeout: 10000 });
}

// --- 1. Login ---

test('admin login: shows login form', async ({ page }) => {
	await page.goto('/admin');
	await page.waitForSelector('.login-page', { timeout: 5000 });

	await expect(page.locator('.login-title')).toContainText('Fulala Admin');
	await expect(page.locator('#password')).toBeVisible();
	await expect(page.locator('.login-button')).toContainText('Sign In');
});

test('admin login: wrong password shows error', async ({ page }) => {
	await page.goto('/admin');
	await page.waitForSelector('#password', { timeout: 5000 });
	await page.fill('#password', 'wrongpassword');
	await page.click('.login-button');
	await page.waitForSelector('.error-message', { timeout: 5000 });

	await expect(page.locator('.error-message')).toBeVisible();
});

test('admin login: correct password redirects to dashboard', async ({ page }) => {
	await adminLogin(page);

	await expect(page.locator('.dashboard')).toBeVisible();
	await expect(page.locator('h1')).toContainText('Dashboard');
});

// --- 2. Sidebar navigation ---

test('admin sidebar: has all 8 nav items', async ({ page }) => {
	await adminLogin(page);

	const navItems = page.locator('.nav-item');
	await expect(navItems).toHaveCount(8);

	const expectedLabels = [
		'Dashboard',
		'Menu Items',
		'Live Preview',
		'Schedule',
		'Theme',
		'Events',
		'Print Menu',
		'Analytics',
	];

	for (const label of expectedLabels) {
		await expect(page.locator('.nav-item', { hasText: label })).toBeVisible();
	}
});

test('admin sidebar: nav links navigate correctly', async ({ page }) => {
	await adminLogin(page);

	// Click Menu Items
	await page.click('.nav-item >> text=Menu Items');
	await expect(page).toHaveURL(/\/admin\/menu/);

	// Click Live Preview
	await page.click('.nav-item >> text=Live Preview');
	await expect(page).toHaveURL(/\/admin\/preview/);

	// Click Schedule
	await page.click('.nav-item >> text=Schedule');
	await expect(page).toHaveURL(/\/admin\/schedule/);
});

// --- 3. Dashboard ---

test('admin dashboard: shows stats grid', async ({ page }) => {
	await adminLogin(page);

	await expect(page.locator('.stats-grid')).toBeVisible();

	const statCards = page.locator('.stat-card');
	await expect(statCards).toHaveCount(4);
});

test('admin dashboard: has quick action links', async ({ page }) => {
	await adminLogin(page);

	await expect(page.locator('.quick-actions')).toBeVisible();

	const actionCards = page.locator('.action-card');
	const count = await actionCards.count();
	expect(count).toBeGreaterThanOrEqual(5);
});

// --- 4. Menu Items ---

test('admin menu: displays categories and items', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Menu Items');
	await page.waitForSelector('.category-section', { timeout: 10000 });

	const categories = page.locator('.category-section');
	const catCount = await categories.count();
	expect(catCount, 'should have at least 2 categories').toBeGreaterThanOrEqual(2);

	const items = page.locator('.item-row');
	const itemCount = await items.count();
	expect(itemCount, 'should have menu items').toBeGreaterThan(0);
});

test('admin menu: shows price tier badges for dumplings', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Menu Items');
	await page.waitForSelector('.category-section', { timeout: 10000 });

	const tierBadges = page.locator('.tier-badge');
	const count = await tierBadges.count();
	expect(count, 'should have tier badges for dumplings').toBeGreaterThan(0);
});

test('admin menu: has add item button', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Menu Items');
	await page.waitForSelector('.page-header', { timeout: 10000 });

	await expect(page.locator('.btn-primary')).toContainText('+ Add Item');
});

test('admin menu: item rows have action buttons', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Menu Items');
	await page.waitForSelector('.item-row', { timeout: 10000 });

	const firstRow = page.locator('.item-row').first();
	await expect(firstRow.locator('.btn-sm', { hasText: /Enable|Disable/ })).toBeVisible();
	await expect(firstRow.locator('.btn-sm', { hasText: 'Edit' })).toBeVisible();
	await expect(firstRow.locator('.btn-sm.danger', { hasText: 'Delete' })).toBeVisible();
});

test('admin menu: clickable thumbnails for image swap', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Menu Items');
	await page.waitForSelector('.item-row', { timeout: 10000 });

	const thumbBtn = page.locator('.thumb-btn').first();
	await expect(thumbBtn).toBeVisible();

	// Click thumbnail to open image picker popover
	await thumbBtn.click();
	await expect(page.locator('.image-swap-popover')).toBeVisible();

	// Click again to close
	await thumbBtn.click();
	await expect(page.locator('.image-swap-popover')).not.toBeVisible();
});

test('admin menu: edit form opens with price tier editor', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Menu Items');
	await page.waitForSelector('.item-row', { timeout: 10000 });

	// Click Edit on first item
	await page.locator('.item-row').first().locator('.btn-sm', { hasText: 'Edit' }).click();

	// Wait for editor form to appear
	await page.waitForSelector('form.editor', { timeout: 5000 });

	// Check for price tier editor section
	await expect(page.locator('.editor-section')).toBeVisible();
	await expect(page.getByText('Price Tiers')).toBeVisible();
});

// --- 5. Live Preview ---

test('admin preview: shows 3 TV panels', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Live Preview');
	await page.waitForSelector('.preview-page', { timeout: 10000 });

	await expect(page.locator('h1')).toContainText('Live Preview');

	const panels = page.locator('.panel');
	await expect(panels).toHaveCount(3);

	// Check panel headers
	await expect(page.locator('.panel-header h3').nth(0)).toContainText('Dumplings');
	await expect(page.locator('.panel-header h3').nth(1)).toContainText('Noodles');
	await expect(page.locator('.panel-header h3').nth(2)).toContainText('Info');
});

test('admin preview: has theme toggle', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Live Preview');
	await page.waitForSelector('.preview-page', { timeout: 10000 });

	const standardBtn = page.locator('.toggle-btn', { hasText: 'Standard' });
	const valentineBtn = page.locator('.toggle-btn', { hasText: 'Valentine' });

	await expect(standardBtn).toBeVisible();
	await expect(valentineBtn).toBeVisible();
});

test('admin preview: theme toggle switches iframe sources', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Live Preview');
	await page.waitForSelector('.preview-page', { timeout: 10000 });
	await page.waitForTimeout(1000);

	// Default should be valentine
	let srcs = await page.evaluate(() =>
		Array.from(document.querySelectorAll('iframe')).map(f => f.src)
	);
	expect(srcs[0]).toContain('valentine');

	// Switch to standard
	await page.locator('.toggle-btn', { hasText: 'Standard' }).click();
	await page.waitForTimeout(500);

	srcs = await page.evaluate(() =>
		Array.from(document.querySelectorAll('iframe')).map(f => f.src)
	);
	expect(srcs[0]).not.toContain('valentine');
	expect(srcs[0]).toContain('/tv-dumplings');

	// Switch back to valentine
	await page.locator('.toggle-btn', { hasText: 'Valentine' }).click();
	await page.waitForTimeout(500);

	srcs = await page.evaluate(() =>
		Array.from(document.querySelectorAll('iframe')).map(f => f.src)
	);
	expect(srcs[0]).toContain('valentine');
});

test('admin preview: has scale slider', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Live Preview');
	await page.waitForSelector('.preview-page', { timeout: 10000 });

	await expect(page.locator('#scale-slider')).toBeVisible();
	await expect(page.locator('.scale-control label')).toContainText('Scale:');
});

test('admin preview: panels have external links', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Live Preview');
	await page.waitForSelector('.preview-page', { timeout: 10000 });

	const openLinks = page.locator('.open-link');
	await expect(openLinks).toHaveCount(3);
});

// --- 6. Schedule ---

test('admin schedule: shows schedule form', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Schedule');
	await page.waitForSelector('h1', { timeout: 10000 });

	await expect(page.locator('h1')).toContainText('Menu Schedule');
	await expect(page.getByLabel('Week Number')).toBeVisible();
	await expect(page.getByLabel('Month')).toBeVisible();
	await expect(page.getByLabel('Year')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Save Schedule' })).toBeVisible();
});

// --- 7. Theme ---

test('admin theme: shows theme editor with tabs', async ({ page }) => {
	await adminLogin(page);
	await page.goto('/admin/theme');
	await page.waitForSelector('h1', { timeout: 10000 });

	await expect(page.locator('h1')).toContainText('Theme Editor');

	// Check tabs
	await expect(page.getByRole('button', { name: 'Colors' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Typography' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Display' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Currency' })).toBeVisible();
});

test('admin theme: has presets including fulala-valentine', async ({ page }) => {
	await adminLogin(page);
	await page.goto('/admin/theme');
	await page.waitForSelector('h1', { timeout: 10000 });

	// Preset buttons: name.charAt(0).toUpperCase() + name.slice(1)
	await expect(page.locator('.preset-btn', { hasText: 'Fulala-valentine' })).toBeVisible();
	await expect(page.locator('.preset-btn', { hasText: 'Fulala' }).first()).toBeVisible();
});

// --- 8. Events ---

test('admin events: shows 3 event tabs', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Events');
	await page.waitForSelector('h1', { timeout: 10000 });

	await expect(page.locator('h1')).toContainText('Events & Catering');

	await expect(page.getByRole('button', { name: 'Event Packages' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Catering Menus' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'School Meals' })).toBeVisible();
});

// --- 9. Print ---

test('admin print: shows printable menu with all categories', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Print Menu');
	await page.waitForSelector('h1', { timeout: 10000 });

	await expect(page.locator('h1').first()).toContainText('Print Menu');
	await expect(page.getByRole('button', { name: 'Print Menu' })).toBeVisible();

	// Check menu content renders
	await expect(page.getByText('STEAMED DUMPLINGS')).toBeVisible();
	await expect(page.getByText('NOODLE SOUPS')).toBeVisible();
});

// --- 10. Analytics ---

test('admin analytics: shows stats and chart', async ({ page }) => {
	await adminLogin(page);
	await page.click('.nav-item >> text=Analytics');
	await page.waitForSelector('h1', { timeout: 10000 });

	await expect(page.locator('h1')).toContainText('Analytics');

	// Check stat cards exist
	await expect(page.getByText('Active Now')).toBeVisible();
	await expect(page.getByText("Today's Sessions")).toBeVisible();
});
