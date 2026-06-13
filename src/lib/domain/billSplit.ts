/**
 * Bill splitting — whole-crown shares that always sum to the total.
 *
 * CZK has no usable sub-unit at the till, so shares are whole crowns: each
 * of `people` pays floor(total/people), and the remainder lands on the
 * first `total % people` shares — deterministic, no lost crowns, the
 * "who pays the extra koruna" question answered by position, not chance.
 */
export function splitBill(total: number, people: number): number[] {
	if (!Number.isFinite(total) || total < 0) return [];
	if (!Number.isInteger(people) || people < 2) return [Math.round(total)];
	const whole = Math.round(total);
	const base = Math.floor(whole / people);
	const remainder = whole - base * people;
	return Array.from({ length: people }, (_, i) => base + (i < remainder ? 1 : 0));
}
