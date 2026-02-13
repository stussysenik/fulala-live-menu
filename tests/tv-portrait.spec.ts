import { test, expect } from '@playwright/test';

/**
 * TV Portrait Display Tests
 *
 * Viewport: 1920×1080 CSS, DPR 2 (4K panel, CSS rotation creates 1080×1920 portrait)
 * Target: LG 43UR78003LK 43" 4K TVs at 3m viewing distance
 * Design system: src/lib/design/tv-design-system.md
 */

test.use({ viewport: { width: 1920, height: 1080 } });

const TV_ROUTES = [
	{ path: '/tv-dumplings', name: 'Dumplings' },
	{ path: '/tv-noodles', name: 'Noodles' },
	{ path: '/tv-info', name: 'Info' },
];

const MIN_FONT_SIZE = 24; // px — 3m legibility floor
const MIN_IMAGE_SIZE = 120; // px
const MIN_CONTRAST_RATIO = 4.5; // WCAG AA

// Helper: compute WCAG relative luminance
function luminanceJS(): string {
	return `
		function luminance(r, g, b) {
			const [rs, gs, bs] = [r, g, b].map(c => {
				c /= 255;
				return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
			});
			return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
		}
		function parseColor(color) {
			const m = color.match(/\\d+/g);
			return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
		}
		function contrastRatio(fg, bg) {
			const [r1, g1, b1] = parseColor(fg);
			const [r2, g2, b2] = parseColor(bg);
			const l1 = luminance(r1, g1, b1);
			const l2 = luminance(r2, g2, b2);
			const lighter = Math.max(l1, l2);
			const darker = Math.min(l1, l2);
			return (lighter + 0.05) / (darker + 0.05);
		}
	`;
}

// --- No Overflow ---

for (const route of TV_ROUTES) {
	test(`${route.name}: content does not overflow viewport`, async ({ page }) => {
		await page.goto(route.path);
		await page.waitForSelector('.tv-portrait-page', { timeout: 10000 });
		// Wait for Convex data
		await page.waitForTimeout(3000);

		const overflow = await page.evaluate(() => {
			const wrapper = document.querySelector('.tv-portrait-page');
			if (!wrapper) return { overflows: false, detail: 'no wrapper found' };
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

		expect(overflow.overflows, `Overflow detected: ${overflow.detail}`).toBe(false);
	});
}

// --- Font Size Legibility ---

for (const route of TV_ROUTES) {
	test(`${route.name}: all text >= ${MIN_FONT_SIZE}px`, async ({ page }) => {
		await page.goto(route.path);
		await page.waitForSelector('.tv-portrait-page', { timeout: 10000 });
		await page.waitForTimeout(3000);

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

		expect(violations, `Font too small: ${JSON.stringify(violations)}`).toEqual([]);
	});
}

// --- Color Contrast (WCAG AA) ---

test('tv-info: drink name text meets WCAG AA contrast', async ({ page }) => {
	await page.goto('/tv-info');
	await page.waitForSelector('.tv-drink-name', { timeout: 10000 });
	await page.waitForTimeout(2000);

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
			const lighter = Math.max(l1, l2);
			const darker = Math.min(l1, l2);
			return (lighter + 0.05) / (darker + 0.05);
		}

		const el = document.querySelector('.tv-drink-name');
		if (!el) return { ratio: 21, passes: true };
		const style = getComputedStyle(el);
		const fg = style.color;
		let bg = 'rgb(255, 255, 255)';
		let ancestor: Element | null = el;
		while (ancestor) {
			const bgColor = getComputedStyle(ancestor).backgroundColor;
			if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
				bg = bgColor;
				break;
			}
			ancestor = ancestor.parentElement;
		}
		const ratio = contrastRatio(fg, bg);
		return { ratio: Math.round(ratio * 10) / 10, passes: ratio >= 4.5 };
	});

	expect(result.passes, `Contrast ratio ${result.ratio}:1 < 4.5:1`).toBe(true);
});

test('tv-dumplings: price text meets WCAG AA contrast', async ({ page }) => {
	await page.goto('/tv-dumplings');
	await page.waitForSelector('.tv-item-price', { timeout: 10000 });
	await page.waitForTimeout(2000);

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
			const lighter = Math.max(l1, l2);
			const darker = Math.min(l1, l2);
			return (lighter + 0.05) / (darker + 0.05);
		}

		const el = document.querySelector('.tv-item-price');
		if (!el) return { ratio: 21, passes: true };
		const fg = getComputedStyle(el).color;
		const bg = 'rgb(255, 255, 255)';
		const ratio = contrastRatio(fg, bg);
		return { ratio: Math.round(ratio * 10) / 10, passes: ratio >= 3.0 };
	});

	// Large text (48px) only needs 3:1 for WCAG AA
	expect(result.passes, `Price contrast ratio ${result.ratio}:1 < 3:1`).toBe(true);
});

// --- Image Sizes ---

for (const route of ['/tv-dumplings', '/tv-noodles']) {
	test(`${route}: food images >= ${MIN_IMAGE_SIZE}px`, async ({ page }) => {
		await page.goto(route);
		await page.waitForSelector('.tv-item-image', { timeout: 10000 });
		await page.waitForTimeout(2000);

		const images = await page.evaluate(() => {
			return Array.from(document.querySelectorAll('.tv-item-image')).map(el => {
				const rect = el.getBoundingClientRect();
				return { width: Math.round(rect.width), height: Math.round(rect.height) };
			});
		});

		expect(images.length).toBeGreaterThan(0);
		for (const img of images) {
			expect(img.width, `Image width ${img.width}px < ${MIN_IMAGE_SIZE}px`).toBeGreaterThanOrEqual(MIN_IMAGE_SIZE);
			expect(img.height, `Image height ${img.height}px < ${MIN_IMAGE_SIZE}px`).toBeGreaterThanOrEqual(MIN_IMAGE_SIZE);
		}
	});
}

// --- tv-info Structure ---

test('tv-info: does NOT contain featured section', async ({ page }) => {
	await page.goto('/tv-info');
	await page.waitForTimeout(3000);

	const hasFeatured = await page.locator('.tv-featured').count();
	expect(hasFeatured).toBe(0);
});

test('tv-info: has drinks section', async ({ page }) => {
	await page.goto('/tv-info');
	await page.waitForSelector('.tv-drinks', { timeout: 10000 });

	const drinksSection = page.locator('.tv-drinks');
	await expect(drinksSection).toBeVisible();
});

test('tv-info: has customer info section', async ({ page }) => {
	await page.goto('/tv-info');
	await page.waitForSelector('.tv-customer', { timeout: 10000 });

	const customerSection = page.locator('.tv-customer');
	await expect(customerSection).toBeVisible();
});

// --- Item Counts ---

test('tv-dumplings: shows 6 menu items', async ({ page }) => {
	await page.goto('/tv-dumplings');
	await page.waitForSelector('.tv-item', { timeout: 10000 });
	await page.waitForTimeout(2000);

	const count = await page.locator('.tv-item').count();
	expect(count).toBe(6);
});

test('tv-noodles: shows 5 menu items', async ({ page }) => {
	await page.goto('/tv-noodles');
	await page.waitForSelector('.tv-item', { timeout: 10000 });
	await page.waitForTimeout(2000);

	const count = await page.locator('.tv-item').count();
	expect(count).toBe(5);
});
