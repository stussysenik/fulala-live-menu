<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { CurrencyConfig, CurrencyDisplayMode } from '$lib/theme/defaults';
	import type { CurrencyCode } from '$lib/currency';
	import { getCurrencyName, getCurrencyShortDisplay } from '$lib/currency/formats';

	export let config: CurrencyConfig;

	const dispatch = createEventDispatcher<{
		change: CurrencyConfig;
	}>();

	// All available currencies
	const allCurrencies: CurrencyCode[] = ['CZK', 'EUR', 'USD', 'CNY'];

	// Display mode options
	const displayModes: { value: CurrencyDisplayMode; label: string; description: string }[] = [
		{ value: 'single', label: 'Single', description: 'Show only primary currency' },
		{ value: 'multi', label: 'Multi', description: 'Show all currencies at once' },
		{ value: 'toggle', label: 'Toggle', description: 'Let users switch between currencies' },
	];

	// Local state for editing
	let localConfig = { ...config };
	$: if (JSON.stringify(config) !== JSON.stringify(localConfig)) {
		localConfig = { ...config };
	}

	function emitChange() {
		dispatch('change', { ...localConfig });
	}

	function moveUp(index: number) {
		if (index <= 0) return;
		const currencies = [...localConfig.displayCurrencies];
		[currencies[index - 1], currencies[index]] = [currencies[index], currencies[index - 1]];
		localConfig.displayCurrencies = currencies;
		emitChange();
	}

	function moveDown(index: number) {
		if (index >= localConfig.displayCurrencies.length - 1) return;
		const currencies = [...localConfig.displayCurrencies];
		[currencies[index], currencies[index + 1]] = [currencies[index + 1], currencies[index]];
		localConfig.displayCurrencies = currencies;
		emitChange();
	}

	function toggleCurrency(code: CurrencyCode) {
		const currencies = [...localConfig.displayCurrencies];
		const index = currencies.indexOf(code);
		if (index >= 0) {
			// Don't allow removing if it's the only currency
			if (currencies.length === 1) return;
			currencies.splice(index, 1);
		} else {
			currencies.push(code);
		}
		localConfig.displayCurrencies = currencies;
		emitChange();
	}

	function updateDisplayMode(mode: CurrencyDisplayMode) {
		localConfig.displayMode = mode;
		emitChange();
	}

	function updateRate(code: CurrencyCode, value: string) {
		const rate = parseFloat(value) || 0;
		localConfig.rates = { ...localConfig.rates, [code]: rate };
		emitChange();
	}

	function toggleShowSymbols() {
		localConfig.showSymbols = !localConfig.showSymbols;
		emitChange();
	}

	function toggleCompactMode() {
		localConfig.compactMode = !localConfig.compactMode;
		emitChange();
	}

	function updateBaseCurrency(code: CurrencyCode) {
		localConfig.baseCurrency = code;
		emitChange();
	}

	// Primary currency is always first in the display list
	$: primaryCurrency = localConfig.displayCurrencies[0];

	// Typed rates entries for the template
	$: ratesEntries = Object.entries(localConfig.rates) as [CurrencyCode, number][];
</script>

<div class="currency-editor">
	<section class="editor-section">
		<h3>Currency Order</h3>
		<p class="section-hint">First currency is primary (shown with a star). Drag or use arrows to reorder.</p>

		<div class="currency-list">
			{#each localConfig.displayCurrencies as code, index (code)}
				<div class="currency-item" class:primary={index === 0}>
					<div class="currency-info">
						{#if index === 0}
							<span class="primary-badge" title="Primary currency">&#9733;</span>
						{/if}
						<span class="currency-symbol">{getCurrencyShortDisplay(code)}</span>
						<span class="currency-name">{getCurrencyName(code)}</span>
						<span class="currency-code">({code})</span>
					</div>

					<div class="currency-actions">
						<button
							type="button"
							class="move-btn"
							on:click={() => moveUp(index)}
							disabled={index === 0}
							title="Move up"
						>
							&#9650;
						</button>
						<button
							type="button"
							class="move-btn"
							on:click={() => moveDown(index)}
							disabled={index === localConfig.displayCurrencies.length - 1}
							title="Move down"
						>
							&#9660;
						</button>
						{#if localConfig.displayCurrencies.length > 1}
							<button
								type="button"
								class="remove-btn"
								on:click={() => toggleCurrency(code)}
								title="Remove currency"
							>
								&times;
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<div class="add-currency">
			<span class="add-label">Add currency:</span>
			<div class="add-buttons">
				{#each allCurrencies.filter(c => !localConfig.displayCurrencies.includes(c)) as code}
					<button
						type="button"
						class="add-btn"
						on:click={() => toggleCurrency(code)}
					>
						+ {code}
					</button>
				{/each}
				{#if allCurrencies.every(c => localConfig.displayCurrencies.includes(c))}
					<span class="all-added">All currencies added</span>
				{/if}
			</div>
		</div>
	</section>

	<section class="editor-section">
		<h3>Display Mode</h3>
		<div class="mode-options">
			{#each displayModes as mode}
				<label class="mode-option" class:selected={localConfig.displayMode === mode.value}>
					<input
						type="radio"
						name="displayMode"
						value={mode.value}
						checked={localConfig.displayMode === mode.value}
						on:change={() => updateDisplayMode(mode.value)}
					/>
					<div class="mode-content">
						<span class="mode-label">{mode.label}</span>
						<span class="mode-desc">{mode.description}</span>
					</div>
				</label>
			{/each}
		</div>
	</section>

	<section class="editor-section">
		<h3>Display Options</h3>
		<div class="options-list">
			<label class="option-toggle">
				<input
					type="checkbox"
					checked={localConfig.showSymbols}
					on:change={toggleShowSymbols}
				/>
				<span class="option-label">Show currency symbols</span>
				<span class="option-preview">
					{localConfig.showSymbols ? '159 Kc' : '159'}
				</span>
			</label>

			<label class="option-toggle">
				<input
					type="checkbox"
					checked={localConfig.compactMode}
					on:change={toggleCompactMode}
				/>
				<span class="option-label">Compact mode (no decimals)</span>
				<span class="option-preview">
					{localConfig.compactMode ? '159' : '159.00'}
				</span>
			</label>
		</div>
	</section>

	<section class="editor-section">
		<h3>Exchange Rates</h3>
		<p class="section-hint">
			Base currency: <strong>{localConfig.baseCurrency}</strong> (prices stored in {localConfig.baseCurrency})
		</p>

		<div class="rates-grid">
			{#each ratesEntries as [code, rate]}
				<div class="rate-item">
					<label class="rate-label" for="rate-{code}">
						1 {localConfig.baseCurrency} =
					</label>
					<input
						id="rate-{code}"
						type="number"
						step="0.01"
						min="0"
						value={rate}
						on:input={(e) => updateRate(code, e.currentTarget.value)}
						class="rate-input"
					/>
					<span class="rate-code">{code}</span>
				</div>
			{/each}
		</div>

		<p class="rates-note">
			Tip: Exchange rates can be updated automatically via the cron job or manually here.
		</p>
	</section>
</div>

<style>
	.currency-editor {
		display: flex;
		flex-direction: column;
		gap: var(--space-5, 1.5rem);
	}

	.editor-section {
		background: var(--color-bg, #f9f9f9);
		border-radius: var(--radius-md, 8px);
		padding: var(--space-4, 1rem);
	}

	.editor-section h3 {
		font-size: var(--text-base, 1rem);
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
		margin: 0 0 var(--space-2, 0.5rem);
	}

	.section-hint {
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
		margin: 0 0 var(--space-3, 0.75rem);
	}

	/* Currency list */
	.currency-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2, 0.5rem);
	}

	.currency-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
		background: var(--color-surface, white);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
		transition: all 0.15s ease;
	}

	.currency-item.primary {
		border-color: var(--color-accent, #c45a3b);
		background: rgba(196, 90, 59, 0.05);
	}

	.currency-info {
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
	}

	.primary-badge {
		color: var(--color-accent, #c45a3b);
		font-size: 1rem;
	}

	.currency-symbol {
		font-weight: 600;
		font-size: var(--text-lg, 1.125rem);
		color: var(--color-text, #1a1a1a);
	}

	.currency-name {
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text, #1a1a1a);
	}

	.currency-code {
		font-size: var(--text-xs, 0.75rem);
		color: var(--color-text-muted, #666);
	}

	.currency-actions {
		display: flex;
		align-items: center;
		gap: var(--space-1, 0.25rem);
	}

	.move-btn,
	.remove-btn {
		width: 28px;
		height: 28px;
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-sm, 4px);
		background: var(--color-surface, white);
		color: var(--color-text-muted, #666);
		font-size: 12px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}

	.move-btn:hover:not(:disabled),
	.remove-btn:hover {
		background: var(--color-accent, #c45a3b);
		color: white;
		border-color: var(--color-accent, #c45a3b);
	}

	.move-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.remove-btn {
		font-size: 18px;
		font-weight: bold;
	}

	.remove-btn:hover {
		background: var(--color-unavailable, #dc2626);
		border-color: var(--color-unavailable, #dc2626);
	}

	/* Add currency */
	.add-currency {
		display: flex;
		align-items: center;
		gap: var(--space-3, 0.75rem);
		margin-top: var(--space-3, 0.75rem);
		padding-top: var(--space-3, 0.75rem);
		border-top: 1px dashed var(--color-border, #e5e5e5);
	}

	.add-label {
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
	}

	.add-buttons {
		display: flex;
		gap: var(--space-2, 0.5rem);
		flex-wrap: wrap;
	}

	.add-btn {
		padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
		border: 1px dashed var(--color-accent, #c45a3b);
		border-radius: var(--radius-md, 8px);
		background: transparent;
		color: var(--color-accent, #c45a3b);
		font-size: var(--text-sm, 0.875rem);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.add-btn:hover {
		background: var(--color-accent, #c45a3b);
		color: white;
	}

	.all-added {
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
		font-style: italic;
	}

	/* Display mode */
	.mode-options {
		display: flex;
		gap: var(--space-2, 0.5rem);
		flex-wrap: wrap;
	}

	.mode-option {
		flex: 1;
		min-width: 120px;
		padding: var(--space-3, 0.75rem);
		background: var(--color-surface, white);
		border: 2px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.mode-option:hover {
		border-color: var(--color-accent, #c45a3b);
	}

	.mode-option.selected {
		border-color: var(--color-accent, #c45a3b);
		background: rgba(196, 90, 59, 0.05);
	}

	.mode-option input {
		display: none;
	}

	.mode-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-1, 0.25rem);
	}

	.mode-label {
		font-weight: 600;
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text, #1a1a1a);
	}

	.mode-desc {
		font-size: var(--text-xs, 0.75rem);
		color: var(--color-text-muted, #666);
	}

	/* Options */
	.options-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2, 0.5rem);
	}

	.option-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-3, 0.75rem);
		padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
		background: var(--color-surface, white);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
		cursor: pointer;
	}

	.option-toggle input {
		width: 18px;
		height: 18px;
		accent-color: var(--color-accent, #c45a3b);
	}

	.option-label {
		flex: 1;
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text, #1a1a1a);
	}

	.option-preview {
		font-family: monospace;
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
		background: rgba(0, 0, 0, 0.05);
		padding: 2px 8px;
		border-radius: var(--radius-sm, 4px);
	}

	/* Exchange rates */
	.rates-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-3, 0.75rem);
	}

	.rate-item {
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
		background: var(--color-surface, white);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
	}

	.rate-label {
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
		white-space: nowrap;
	}

	.rate-input {
		flex: 1;
		min-width: 60px;
		padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-sm, 4px);
		font-size: var(--text-sm, 0.875rem);
		text-align: right;
	}

	.rate-input:focus {
		outline: none;
		border-color: var(--color-accent, #c45a3b);
	}

	.rate-code {
		font-weight: 600;
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text, #1a1a1a);
	}

	.rates-note {
		font-size: var(--text-xs, 0.75rem);
		color: var(--color-text-muted, #666);
		margin-top: var(--space-3, 0.75rem);
		padding-top: var(--space-2, 0.5rem);
		border-top: 1px dashed var(--color-border, #e5e5e5);
	}
</style>
