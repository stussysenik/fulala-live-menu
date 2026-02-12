import { test, expect } from '@playwright/test';

/**
 * TV Portrait Cross-Page Consistency Tests
 *
 * Ensures all 3 TV pages (/tv-dumplings, /tv-noodles, /tv-info) are
 * consistent as a single visual unit — same tokens, same header/footer,
 * same typography scale.
 */

test.use({ viewport: { width: 1920, height: 1080 } });

const TV_ROUTES = ['/tv-dumplings', '/tv-noodles', '/tv-info'];
const MIN_FONT_SIZE = 24;

// Helper: wait for page data to load
async function waitForData(page: import('@playwright/test').Page) {
	await page.waitForSelector('.tv-portrait-page', { timeout: 10000 });
	await page.waitForTimeout(5000);
}

// Helper: wait for menu items to load on menu pages
async function waitForMenuData(page: import('@playwright/test').Page) {
	await page.waitForSelector('.tv-portrait-page', { timeout: 10000 });
	await page.waitForSelector('.tv-item', { timeout: 15000 });
	await page.waitForTimeout(1000);
}

// --- 1. Header consistency across all pages ---

test('all pages: header contains brand with tiger emoji', async ({ page }) => {
	for (const route of TV_ROUTES) {
		await page.goto(route);
		await waitForData(page);

		const brand = await page.locator('.tv-brand-name').textContent();
		expect(brand, `${route}: brand missing tiger emoji`).toContain('🐯');
		expect(brand, `${route}: brand missing FULALA.CZ`).toContain('FULALA.CZ');
	}
});

test('all pages: header has clock and schedule', async ({ page }) => {
	for (const route of TV_ROUTES) {
		await page.goto(route);
		await waitForData(page);

		await expect(page.locator('.tv-clock')).toBeVisible();
		await expect(page.locator('.tv-schedule')).toBeVisible();
	}
});

test('all pages: no tagline in header', async ({ page }) => {
	for (const route of TV_ROUTES) {
		await page.goto(route);
		await waitForData(page);

		const tagline = await page.locator('.tv-brand-tagline').count();
		expect(tagline, `${route}: should not have tagline`).toBe(0);
	}
});

// --- 2. Footer consistency ---

test('all pages: footer text matches and uses / separator', async ({ page }) => {
	let footerTexts: string[] = [];

	for (const route of TV_ROUTES) {
		await page.goto(route);
		await waitForData(page);

		const footer = await page.locator('.tv-footer-note').textContent();
		expect(footer, `${route}: footer should contain /`).toContain('/');
		expect(footer, `${route}: footer should contain Kč`).toContain('Kč');
		footerTexts.push(footer?.trim() ?? '');
	}

	// All footers identical
	expect(footerTexts[0]).toBe(footerTexts[1]);
	expect(footerTexts[1]).toBe(footerTexts[2]);
});

// --- 3. Font size consistency ---

test('all pages: all text >= 24px', async ({ page }) => {
	for (const route of TV_ROUTES) {
		await page.goto(route);
		await waitForData(page);

		const violations = await page.evaluate((minSize) => {
			const results: { text: string; size: number; className: string }[] = [];
			const container = document.querySelector('.tv-portrait-page');
			if (!container) return results;
			const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
			while (walker.nextNode()) {
				const node = walker.currentNode;
				const text = node.textContent?.trim();
				if (!text) continue;
				const el = node.parentElement;
				if (!el) continue;
				const size = parseFloat(getComputedStyle(el).fontSize);
				if (size < minSize) {
					results.push({
						text: text.substring(0, 50),
						size: Math.round(size * 10) / 10,
						className: el.className || el.tagName,
					});
				}
			}
			return results;
		}, MIN_FONT_SIZE);

		expect(violations, `${route}: font too small: ${JSON.stringify(violations)}`).toEqual([]);
	}
});

test('menu pages: price font sizes are consistent', async ({ page }) => {
	const priceSizes: Record<string, number[]> = {};

	for (const route of ['/tv-dumplings', '/tv-noodles']) {
		await page.goto(route);
		await waitForMenuData(page);

		const sizes = await page.evaluate(() => {
			return Array.from(document.querySelectorAll('.tv-item-price')).map(el =>
				parseFloat(getComputedStyle(el).fontSize)
			);
		});

		priceSizes[route] = sizes;
		expect(sizes.length, `${route}: should have prices`).toBeGreaterThan(0);

		// All prices on same page should be same size
		const uniqueSizes = [...new Set(sizes)];
		expect(uniqueSizes.length, `${route}: price sizes should be uniform`).toBe(1);
	}

	// Price sizes consistent across pages
	expect(priceSizes['/tv-dumplings']![0]).toBe(priceSizes['/tv-noodles']![0]);
});

test('menu pages: item name font sizes are consistent', async ({ page }) => {
	const nameSizes: Record<string, number> = {};

	for (const route of ['/tv-dumplings', '/tv-noodles']) {
		await page.goto(route);
		await waitForMenuData(page);

		const sizes = await page.evaluate(() => {
			return Array.from(document.querySelectorAll('.tv-item-name')).map(el =>
				parseFloat(getComputedStyle(el).fontSize)
			);
		});

		expect(sizes.length).toBeGreaterThan(0);
		nameSizes[route] = sizes[0]!;

		// All names on same page same size
		const uniqueSizes = [...new Set(sizes)];
		expect(uniqueSizes.length, `${route}: name sizes should be uniform`).toBe(1);
	}

	expect(nameSizes['/tv-dumplings']).toBe(nameSizes['/tv-noodles']);
});

// --- 4. Price notation consistency ---

test('menu pages: all prices use Kč notation', async ({ page }) => {
	for (const route of ['/tv-dumplings', '/tv-noodles']) {
		await page.goto(route);
		await waitForMenuData(page);

		const prices = await page.evaluate(() => {
			return Array.from(document.querySelectorAll('.tv-item-price'))
				.map(el => el.textContent?.trim() ?? '');
		});

		for (const price of prices) {
			expect(price, `${route}: price "${price}" should end with Kč`).toMatch(/^\d+ Kč$/);
		}
	}
});

// --- 5. No overflow ---

test('all pages: content does not overflow viewport', async ({ page }) => {
	for (const route of TV_ROUTES) {
		await page.goto(route);
		await waitForData(page);

		const overflow = await page.evaluate(() => {
			const wrapper = document.querySelector('.tv-portrait-page');
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

// --- 6. WCAG AA color contrast ---

test('menu pages: price text meets WCAG AA contrast', async ({ page }) => {
	for (const route of ['/tv-dumplings', '/tv-noodles']) {
		await page.goto(route);
		await waitForMenuData(page);

		const result = await page.evaluate(() => {
			function luminance(r: number, g: number, b: number) {
				const [rs, gs, bs] = [r, g, b].map(c => {
					c /= 255;
					return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
				});
				return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
			}
			function parseColor(color: string): [number, number, number] {
				const m = color.match(/\d+/g);
				return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
			}
			function contrastRatio(fg: string, bg: string) {
				const [r1, g1, b1] = parseColor(fg);
				const [r2, g2, b2] = parseColor(bg);
				const l1 = luminance(r1, g1, b1);
				const l2 = luminance(r2, g2, b2);
				return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
			}

			const el = document.querySelector('.tv-item-price');
			if (!el) return { ratio: 21, passes: true };
			const fg = getComputedStyle(el).color;
			const ratio = contrastRatio(fg, 'rgb(255, 255, 255)');
			return { ratio: Math.round(ratio * 10) / 10, passes: ratio >= 3.0 };
		});

		expect(result.passes, `${route}: price contrast ${result.ratio}:1 < 3:1`).toBe(true);
	}
});

// --- 7. Image consistency ---

test('menu pages: food images are consistent size', async ({ page }) => {
	const imageSizes: Record<string, { width: number; height: number }> = {};

	for (const route of ['/tv-dumplings', '/tv-noodles']) {
		await page.goto(route);
		await waitForMenuData(page);

		const sizes = await page.evaluate(() => {
			return Array.from(document.querySelectorAll('.tv-item-image')).map(el => {
				const rect = el.getBoundingClientRect();
				return { width: Math.round(rect.width), height: Math.round(rect.height) };
			});
		});

		expect(sizes.length).toBeGreaterThan(0);
		imageSizes[route] = sizes[0]!;

		// All images same size on same page
		for (const size of sizes) {
			expect(size.width).toBe(sizes[0]!.width);
			expect(size.height).toBe(sizes[0]!.height);
		}
	}

	// Same across pages
	expect(imageSizes['/tv-dumplings']!.width).toBe(imageSizes['/tv-noodles']!.width);
	expect(imageSizes['/tv-dumplings']!.height).toBe(imageSizes['/tv-noodles']!.height);
});

// --- 8. No category headings on menu pages ---

test('menu pages: no category heading displayed', async ({ page }) => {
	for (const route of ['/tv-dumplings', '/tv-noodles']) {
		await page.goto(route);
		await waitForMenuData(page);

		const headings = await page.locator('.tv-category-header').count();
		expect(headings, `${route}: should not have category header`).toBe(0);
	}
});

// --- 9. Extras section on info page ---

test('tv-info: has extras section', async ({ page }) => {
	await page.goto('/tv-info');
	await waitForData(page);

	await expect(page.locator('.tv-extras')).toBeVisible();
	const items = await page.locator('.tv-extras-item').count();
	expect(items).toBeGreaterThanOrEqual(6);
});

// --- 10. Drinks section on info ---

test('tv-info: has drinks section', async ({ page }) => {
	await page.goto('/tv-info');
	await waitForData(page);

	await expect(page.locator('.tv-drinks')).toBeVisible();
	const cards = await page.locator('.tv-drink-card').count();
	expect(cards).toBe(5);
});

test('tv-info: drink prices displayed with Kč notation', async ({ page }) => {
	await page.goto('/tv-info');
	await waitForData(page);

	const prices = await page.evaluate(() => {
		return Array.from(document.querySelectorAll('.tv-drink-price'))
			.map(el => el.textContent?.trim() ?? '');
	});

	// 4 drinks have prices (Tsingtao has no price)
	expect(prices.length).toBe(4);
	for (const price of prices) {
		expect(price).toMatch(/^\d+ Kč$/);
	}
});

test('tv-info: no allergen legend', async ({ page }) => {
	await page.goto('/tv-info');
	await waitForData(page);

	const allergens = await page.locator('.tv-allergen-grid').count();
	expect(allergens, 'allergen legend should be removed').toBe(0);
});

// --- 11. Color-coded customer info cards ---

test('tv-info: customer cards are color-coded', async ({ page }) => {
	await page.goto('/tv-info');
	await waitForData(page);

	const kids = await page.locator('.tv-card-kids').count();
	const students = await page.locator('.tv-card-students').count();
	const seniors = await page.locator('.tv-card-seniors').count();

	expect(kids, 'should have kids card').toBe(1);
	expect(students, 'should have students card').toBe(1);
	expect(seniors, 'should have seniors card').toBe(1);
});
