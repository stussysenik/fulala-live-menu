/**
 * Item option validation — checks a customer's selections against the option
 * groups an item actually offers.
 *
 * The same function runs client-side (instant feedback in the modifier
 * sheet) and inside Convex mutations (authoritative rejection), so an order
 * can never be stored with options the kitchen can't honor.
 */

export interface OptionGroupConfig {
	/** Stable key, e.g. 'noodleType', 'spiceLevel', 'addOns'. */
	key: string;
	/** Optional display label; UI falls back to the key. */
	label?: string;
	/** Allowed values for this group. */
	values: string[];
	/** Customer must pick a value before the item can be added. */
	required: boolean;
	/** Allow picking several values (e.g. add-ons). Default: single pick. */
	multi?: boolean;
}

/** What the customer picked: group key → one value, or several for multi groups. */
export type OptionSelections = Record<string, string | string[]>;

export type OptionIssueCode =
	| 'missing-required'
	| 'unknown-group'
	| 'unknown-value'
	| 'multiple-not-allowed';

export interface OptionValidationIssue {
	groupKey: string;
	code: OptionIssueCode;
	message: string;
}

const asArray = (sel: string | string[]): string[] =>
	Array.isArray(sel) ? sel : sel === '' ? [] : [sel];

/**
 * Returns [] when the selection is valid; otherwise one issue per problem.
 * Empty strings / empty arrays count as "not selected" — they fail required
 * groups instead of slipping through as bogus values.
 */
export function validateSelections(
	config: OptionGroupConfig[] | undefined,
	selections: OptionSelections | undefined
): OptionValidationIssue[] {
	const groups = config ?? [];
	const picked = selections ?? {};
	const issues: OptionValidationIssue[] = [];
	const byKey = new Map(groups.map((g) => [g.key, g]));

	// Selections must reference groups the item offers.
	for (const [key, sel] of Object.entries(picked)) {
		const group = byKey.get(key);
		const values = asArray(sel);
		if (values.length === 0) continue; // empty = not selected; handled below
		if (!group) {
			issues.push({
				groupKey: key,
				code: 'unknown-group',
				message: `This item has no "${key}" option`,
			});
			continue;
		}
		if (values.length > 1 && !group.multi) {
			issues.push({
				groupKey: key,
				code: 'multiple-not-allowed',
				message: `Only one "${key}" can be selected`,
			});
			continue;
		}
		for (const value of values) {
			if (!group.values.includes(value)) {
				issues.push({
					groupKey: key,
					code: 'unknown-value',
					message: `"${value}" is not a valid "${key}" option`,
				});
			}
		}
	}

	// Every required group must have a non-empty selection.
	for (const group of groups) {
		if (!group.required) continue;
		const sel = picked[group.key];
		if (sel === undefined || asArray(sel).length === 0) {
			issues.push({
				groupKey: group.key,
				code: 'missing-required',
				message: `Please choose a "${group.label ?? group.key}"`,
			});
		}
	}

	return issues;
}

/** Shape of the legacy fields still present on `menuItems` documents. */
export interface LegacyOptionFields {
	optionGroups?: OptionGroupConfig[];
	modifiers?: Partial<Record<string, string[] | undefined>>;
	drinkOptions?: {
		temperatures?: string[];
		sugarLevels?: string[];
		addOns?: { name: string; price: number }[];
	};
}

/**
 * Bridge from the legacy `modifiers` / `drinkOptions` fields to option
 * groups. Explicit `optionGroups` (the new authoritative config) win; legacy
 * fields convert to optional groups so old items keep working untouched.
 */
export function legacyToOptionGroups(item: LegacyOptionFields): OptionGroupConfig[] {
	if (item.optionGroups && item.optionGroups.length > 0) return item.optionGroups;

	const groups: OptionGroupConfig[] = [];

	for (const [key, values] of Object.entries(item.modifiers ?? {})) {
		if (values && values.length > 0) {
			groups.push({ key, values, required: false });
		}
	}

	const drink = item.drinkOptions;
	if (drink) {
		if (drink.temperatures && drink.temperatures.length > 0) {
			groups.push({ key: 'temperature', values: drink.temperatures, required: false });
		}
		if (drink.sugarLevels && drink.sugarLevels.length > 0) {
			groups.push({ key: 'sugarLevel', values: drink.sugarLevels, required: false });
		}
		if (drink.addOns && drink.addOns.length > 0) {
			groups.push({
				key: 'addOns',
				values: drink.addOns.map((a) => a.name),
				required: false,
				multi: true,
			});
		}
	}

	return groups;
}
