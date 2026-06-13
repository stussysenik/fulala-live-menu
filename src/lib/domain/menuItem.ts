/**
 * Menu-item domain rules — the single source of truth for how an item is
 * named on screen and whether it is finished enough to face a customer.
 *
 * Why a pure module (architecture lesson): the same two questions are asked
 * from many places — every TV section, the public home menu, the admin
 * composer, the item editor. If each surface answered them inline they would
 * drift, which is exactly the bug we are fixing: the admin headlined the
 * English name while the TV headlined the Czech one. Pulling the answer into
 * one dependency-free module means admin and screen can never disagree again,
 * and the rules are unit-testable without a browser or a database.
 *
 * This file imports nothing on purpose. It is safe to use from Svelte
 * components AND from the Convex backend (same pattern as sectionConfig.ts).
 */

/**
 * The fields these rules read. Kept structurally loose (a subset of the
 * Convex `menuItems` document) so callers can pass a full Doc, a draft form
 * object, or a partial without fighting the type checker.
 */
export interface MenuItemLike {
	name?: string | null;
	nameLocal?: string | null;
	nameChinese?: string | null;
	price?: number | null;
	priceTiers?: { quantity?: string | null; price?: number | null }[] | null;
	categoryId?: unknown;
}

const clean = (s: string | null | undefined): string => (s ?? '').trim();

/**
 * The on-screen headline for an item.
 *
 * Product rule: Fulala is a Czech restaurant (FULALA.CZ), so the displays are
 * Czech-first — the local name is the title and English drops to a smaller
 * secondary line. EVERY surface that shows or previews a name must call this,
 * so "what the admin edits as the title" and "what the TV shows as the title"
 * are the same string. (Before this existed, editing the English field never
 * moved a Czech-headlined title — the sync bug.)
 */
export function displayName(item: MenuItemLike): string {
	return clean(item.nameLocal) || clean(item.name);
}

/**
 * The secondary line shown under the headline: the English name, but only
 * when there is a distinct Czech headline above it (otherwise English is
 * already the headline and we would print it twice).
 */
export function secondaryName(item: MenuItemLike): string {
	const local = clean(item.nameLocal);
	const en = clean(item.name);
	return local && en && local !== en ? en : '';
}

/**
 * Does the item have a real, sellable price?
 *
 * Two shapes are valid: a single flat `price` (drinks, sides) or a non-empty
 * set of `priceTiers` (dumplings sold by 4ks/6ks/12ks). A price of 0 is
 * treated as "not priced yet" — that is the default a freshly-created draft
 * carries, and a 0 Kč item on a customer screen is a mistake, not an offer.
 */
export function hasValidPrice(item: MenuItemLike): boolean {
	const tiers = item.priceTiers ?? [];
	if (tiers.length > 0) {
		return tiers.every(
			(t) => clean(t.quantity) !== '' && typeof t.price === 'number' && t.price > 0
		);
	}
	return typeof item.price === 'number' && item.price > 0;
}

/** A field an item still needs before it may face a customer. */
export type MissingField = 'name' | 'price' | 'category';

export interface MenuItemReadiness {
	/** True only when nothing is missing — safe to show on a customer screen. */
	ready: boolean;
	/** Which required fields are still blank, for the admin to fill in. */
	missing: MissingField[];
}

/**
 * Is this item finished enough to be seen by a paying customer?
 *
 * Required: a name (in either language), a real price, and a category. This is
 * the hard rail — incomplete drafts stay in the admin where staff can finish
 * them, and never appear on the TVs or the public menu. Availability is a
 * SEPARATE axis: a complete-but-sold-out item is still "ready" (the screens
 * show it struck through as VYPRODÁNO); only genuinely unfinished items are
 * railed off here.
 */
export function menuItemReadiness(item: MenuItemLike): MenuItemReadiness {
	const missing: MissingField[] = [];
	if (!displayName(item)) missing.push('name');
	if (!hasValidPrice(item)) missing.push('price');
	if (!item.categoryId) missing.push('category');
	return { ready: missing.length === 0, missing };
}

/** Convenience predicate for filtering customer-facing item lists. */
export function isReadyForDisplay(item: MenuItemLike): boolean {
	return menuItemReadiness(item).ready;
}

const FIELD_LABEL: Record<MissingField, string> = {
	name: 'name',
	price: 'price',
	category: 'category'
};

/**
 * Human one-liner for an admin badge, e.g. "Needs price" or
 * "Needs name & price". Empty string when the item is ready.
 */
export function readinessSummary(item: MenuItemLike): string {
	const { missing } = menuItemReadiness(item);
	if (missing.length === 0) return '';
	const labels = missing.map((m) => FIELD_LABEL[m]);
	const joined =
		labels.length === 1
			? labels[0]
			: labels.slice(0, -1).join(', ') + ' & ' + labels[labels.length - 1];
	return `Needs ${joined}`;
}

/**
 * Keep only the items that are safe to show a customer. Use this on every
 * customer-facing surface (TV sections, public menu); admin surfaces should
 * NOT filter — staff need to see the drafts they are finishing.
 */
export function readyForDisplay<T extends MenuItemLike>(items: readonly T[]): T[] {
	return items.filter(isReadyForDisplay);
}
