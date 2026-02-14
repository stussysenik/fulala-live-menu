import { test, expect } from '@playwright/test';

/**
 * Valentine TV Route Tests
 *
 * Tests the 3 Valentine-themed TV portrait routes for visual consistency,
 * data loading, and parity with the standard TV routes.
 */

test.use({ viewport: { width: 1920, height: 1080 } });

const VALENTINE_ROUTES = [
	'/tv-dumplings-valentine',
	'/tv-noodles-valentine',
	'/tv-info-valentine',
];
const MENU_ROUTES = ['/tv-dumplings-valentine', '/tv-noodles-valentine'];

async function waitForValentine(page: import('@playwright/test').Page) {
	await page.waitForSelector('.tv-valentine-page', { timeout: 10000 });
	await page.waitForTimeout(5000);
}

async function waitForValentineMenu(page: import('@playwright/test').Page) {
	await page.waitForSelector('.tv-valentine-page', { timeout: 10000 });
	await page.waitForSelector('.tv-item', { timeout: 15000 });
	await page.waitForTimeout(1000);
}

// --- 1. Valentine layout renders ---

test('all valentine pages: layout renders with valentine page class', async ({ page }) => {
	for (const route of VALENTINE_ROUTES) {
		await page.goto(route);
		await waitForValentine(page);

		const container = await page.locator('.tv-valentine-page').count();
		expect(container, `${route}: should have .tv-valentine-page`).toBe(1);
	}
});

test('all valentine pages: header has brand with tiger and heart', async ({ page }) => {
	for (const route of VALENTINE_ROUTES) {
		await page.goto(route);
		await waitForValentine(page);

		const brand = await page.locator('.v-brand-name').textContent();
		expect(brand, `${route}: brand missing FULALA.CZ`).toContain('FULALA.CZ');

		const tiger = await page.locator('.v-tiger').count();
		expect(tiger, `${route}: should have tiger emoji`).toBe(1);

		const heart = await page.locator('.v-heart').count();
		expect(heart, `${route}: should have pulsing heart`).toBe(1);
	}
});

test('all valentine pages: has valentine greeting', async ({ page }) => {
	for (const route of VALENTINE_ROUTES) {
		await page.goto(route);
		await waitForValentine(page);

		const greeting = await page.locator('.v-greeting').textContent();
		expect(greeting, `${route}: should have valentine greeting`).toContain('Valentýn');
		expect(greeting, `${route}: should be bilingual`).toContain("Valentine's Day");
	}
});

test('all valentine pages: has clock and schedule', async ({ page }) => {
	for (const route of VALENTINE_ROUTES) {
		await page.goto(route);
		await waitForValentine(page);

		await expect(page.locator('.v-clock')).toBeVisible();
		await expect(page.locator('.v-schedule')).toBeVisible();
	}
});

// --- 2. Valentine-specific visual elements ---

test('all valentine pages: warm cream background', async ({ page }) => {
	for (const route of VALENTINE_ROUTES) {
		await page.goto(route);
		await waitForValentine(page);

		const bg = await page.evaluate(() => {
			const el = document.querySelector('.tv-valentine-page');
			return el ? getComputedStyle(el).getPropertyValue('--color-bg').trim() : '';
		});
		expect(bg, `${route}: should have warm cream bg`).toBe('#FFF8F0');
	}
});

test('valentine dumplings: has heart decorations', async ({ page }) => {
	await page.goto('/tv-dumplings-valentine');
	await waitForValentineMenu(page);

	const hearts = await page.locator('.v-decor-hearts').count();
	expect(hearts, 'dumplings page should have heart decorations').toBeGreaterThanOrEqual(1);
});

test('valentine noodles: has fortune coin decoration', async ({ page }) => {
	await page.goto('/tv-noodles-valentine');
	await waitForValentineMenu(page);

	const fortune = await page.locator('.v-decor-fortune').count();
	expect(fortune, 'noodles page should have fortune coin decoration').toBeGreaterThanOrEqual(1);
});

// --- 3. Menu data loads correctly ---

test('valentine menu pages: items load from Convex', async ({ page }) => {
	for (const route of MENU_ROUTES) {
		await page.goto(route);
		await waitForValentineMenu(page);

		const items = await page.locator('.tv-item').count();
		expect(items, `${route}: should have menu items`).toBeGreaterThan(0);
	}
});

test('valentine dumplings: shows 6 items', async ({ page }) => {
	await page.goto('/tv-dumplings-valentine');
	await waitForValentineMenu(page);

	const items = await page.locator('.tv-item').count();
	expect(items, 'should have 6 dumpling items').toBe(6);
});

test('valentine noodles: shows 5 items', async ({ page }) => {
	await page.goto('/tv-noodles-valentine');
	await waitForValentineMenu(page);

	const items = await page.locator('.tv-item').count();
	expect(items, 'should have 5 noodle items').toBe(5);
});

test('valentine menu pages: all prices use Kč notation', async ({ page }) => {
	for (const route of MENU_ROUTES) {
		await page.goto(route);
		await waitForValentineMenu(page);

		const prices = await page.evaluate(() => {
			return Array.from(document.querySelectorAll('.tv-item-price'))
				.map(el => el.textContent?.trim() ?? '');
		});

		for (const price of prices) {
			expect(price, `${route}: price "${price}" should end with Kč`).toMatch(/^\d+ Kč$/);
		}
	}
});

// --- 4. Valentine info page ---

test('valentine info: has extras section', async ({ page }) => {
	await page.goto('/tv-info-valentine');
	await waitForValentine(page);

	await expect(page.locator('.vi-extras')).toBeVisible();
	const items = await page.locator('.vi-extras-item').count();
	expect(items, 'should have extras items').toBeGreaterThanOrEqual(6);
});

test('valentine info: has drinks section', async ({ page }) => {
	await page.goto('/tv-info-valentine');
	await waitForValentine(page);

	await expect(page.locator('.vi-drinks')).toBeVisible();
	const cards = await page.locator('.vi-drink-card').count();
	expect(cards, 'should have 5 drink cards').toBe(5);
});

test('valentine info: has color-coded customer cards', async ({ page }) => {
	await page.goto('/tv-info-valentine');
	await waitForValentine(page);

	const kids = await page.locator('.vi-card-kids').count();
	const students = await page.locator('.vi-card-students').count();
	const seniors = await page.locator('.vi-card-seniors').count();

	expect(kids, 'should have kids card').toBe(1);
	expect(students, 'should have students card').toBe(1);
	expect(seniors, 'should have seniors card').toBe(1);
});

test('valentine info: has heart dividers', async ({ page }) => {
	await page.goto('/tv-info-valentine');
	await waitForValentine(page);

	const dividers = await page.locator('.vi-heart-divider').count();
	expect(dividers, 'should have heart dividers').toBeGreaterThanOrEqual(1);
});

// --- 5. No overflow ---

test('all valentine pages: content does not overflow viewport', async ({ page }) => {
	for (const route of VALENTINE_ROUTES) {
		await page.goto(route);
		await waitForValentine(page);

		const overflow = await page.evaluate(() => {
			const wrapper = document.querySelector('.tv-valentine-page');
			if (!wrapper) return { overflows: false, detail: 'no wrapper' };
			const wRect = wrapper.getBoundingClientRect();
			const allElements = wrapper.querySelectorAll('*');
			for (const el of allElements) {
				const r = el.getBoundingClientRect();
				if (r.bottom > wRect.bottom + 2 || r.right > wRect.right + 2) {
					return {
						overflows: true,
						detail: `${(el as HTMLElement).className} bottom=${Math.round(r.bottom)} > wrapper=${Math.round(wRect.bottom)}`,
					};
				}
			}
			return { overflows: false, detail: 'ok' };
		});

		expect(overflow.overflows, `${route}: overflow: ${overflow.detail}`).toBe(false);
	}
});

// --- 6. Font size floor ---

test('all valentine pages: all text >= 24px', async ({ page }) => {
	for (const route of VALENTINE_ROUTES) {
		await page.goto(route);
		await waitForValentine(page);

		const violations = await page.evaluate(() => {
			const results: { text: string; size: number; className: string }[] = [];
			const container = document.querySelector('.tv-valentine-page');
			if (!container) return results;
			const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
			while (walker.nextNode()) {
				const node = walker.currentNode;
				const text = node.textContent?.trim();
				if (!text) continue;
				// Skip decorative separator characters (hearts, dots, etc.)
				if (/^[♥♡·•\s]+$/.test(text)) continue;
				const el = node.parentElement;
				if (!el) continue;
				const size = parseFloat(getComputedStyle(el).fontSize);
				if (size < 24) {
					results.push({
						text: text.substring(0, 50),
						size: Math.round(size * 10) / 10,
						className: el.className || el.tagName,
					});
				}
			}
			return results;
		});

		expect(violations, `${route}: font too small: ${JSON.stringify(violations)}`).toEqual([]);
	}
});
