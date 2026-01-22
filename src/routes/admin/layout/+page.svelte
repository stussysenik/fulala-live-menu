<script lang="ts">
	import { browser, dev } from '$app/environment';
	import { useQuery, useMutation } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import { onMount } from 'svelte';
	import type { ComponentType } from 'svelte';

	// Dynamically import LayoutRenderer only in browser
	let LayoutRenderer: ComponentType | null = null;
	onMount(async () => {
		const module = await import('$lib/components/layouts/LayoutRenderer.svelte');
		LayoutRenderer = module.default;
	});

	// Fetch layouts
	const layoutsQuery = browser ? useQuery(api.layouts.getAllLayouts) : null;
	$: layouts = $layoutsQuery ?? [];

	const activeLayoutQuery = browser ? useQuery(api.layouts.getActiveLayout) : null;
	$: activeLayout = $activeLayoutQuery;

	// Mutations
	const createLayout = browser ? useMutation(api.layouts.createLayout) : null;
	const updateLayout = browser ? useMutation(api.layouts.updateLayout) : null;
	const setActiveLayout = browser ? useMutation(api.layouts.setActiveLayout) : null;
	const initDefaultLayouts = browser ? useMutation(api.layouts.initializeDefaultLayouts) : null;

	// Layout type labels
	const layoutLabels: Record<string, { name: string; description: string; icon: string }> = {
		'standard-list': {
			name: 'Standard List',
			description: 'Traditional vertical list layout with full descriptions',
			icon: '📋',
		},
		'dim-sum-grid': {
			name: 'Dim Sum Grid',
			description: 'Checkbox-style grid with item numbers, perfect for ordering',
			icon: '☑️',
		},
		'card-grid': {
			name: 'Card Grid',
			description: 'Pinterest-style cards with images, great for visual menus',
			icon: '🖼️',
		},
	};

	// Category style labels
	const categoryStyles = [
		{ value: 'header', label: 'Headers', description: 'Bold section headers' },
		{ value: 'tabs', label: 'Tabs', description: 'Tab navigation' },
		{ value: 'colored', label: 'Colored', description: 'Color-coded sections' },
	];

	// Toast notification state
	let toast: { message: string; type: 'success' | 'error' } | null = null;

	function showToast(message: string, type: 'success' | 'error' = 'success') {
		toast = { message, type };
		setTimeout(() => (toast = null), 3000);
	}

	// Loading states
	let isInitializing = false;
	let activatingId: string | null = null;
	let isSaving = false;

	async function handleInitDefaults() {
		if (!initDefaultLayouts) return;
		isInitializing = true;
		try {
			await initDefaultLayouts({});
			showToast('Default layouts initialized');
		} catch (error) {
			showToast('Failed to initialize layouts', 'error');
		} finally {
			isInitializing = false;
		}
	}

	async function handleActivate(layoutId: string) {
		if (!setActiveLayout) return;
		activatingId = layoutId;
		try {
			await setActiveLayout({ id: layoutId as any });
			showToast('Layout activated successfully!');
		} catch (error) {
			showToast('Failed to activate layout', 'error');
		} finally {
			activatingId = null;
		}
	}

	async function handleUpdateConfig(layoutId: string, config: any) {
		if (!updateLayout) return;
		isSaving = true;
		try {
			await updateLayout({ id: layoutId as any, config });
			showToast('Configuration saved successfully!');
		} catch (error) {
			showToast('Failed to save configuration', 'error');
		} finally {
			isSaving = false;
		}
	}

	// Editing state
	let editingLayout: string | null = null;
	let editConfig: any = {};

	function startEditing(layout: any) {
		editingLayout = layout._id;
		editConfig = { ...layout.config };
	}

	function cancelEditing() {
		editingLayout = null;
		editConfig = {};
	}

	async function saveEditing() {
		if (editingLayout) {
			await handleUpdateConfig(editingLayout, editConfig);
			cancelEditing();
		}
	}

	// Preview layout type selection
	let previewLayoutType: 'standard-list' | 'dim-sum-grid' | 'card-grid' = 'standard-list';
	$: if (activeLayout?.layoutType) {
		previewLayoutType = activeLayout.layoutType as typeof previewLayoutType;
	}

	// Show/hide preview panel
	let showPreview = false;

	function setPreviewType(type: string) {
		previewLayoutType = type as 'standard-list' | 'dim-sum-grid' | 'card-grid';
	}
</script>

<svelte:head>
	<title>Layout Configuration | Fulala Admin</title>
</svelte:head>

<div class="layout-admin">
	<header class="page-header">
		<div class="header-content">
			<h1>Display Layouts</h1>
			<p class="subtitle">Configure how your menu is displayed to customers</p>
		</div>
		<div class="header-actions">
			<a href="/order" class="preview-btn" target="_blank" rel="noopener">
				Preview Order Page
			</a>
		</div>
	</header>

	{#if toast}
		<div class="toast" class:error={toast.type === 'error'}>
			{toast.message}
		</div>
	{/if}

	{#if layouts.length === 0}
		<div class="empty-state">
			<p>No layouts configured yet.</p>
			<button class="btn primary" on:click={handleInitDefaults} disabled={isInitializing}>
				{#if isInitializing}
					<span class="spinner"></span> Initializing...
				{:else}
					Initialize Default Layouts
				{/if}
			</button>
		</div>
	{:else}
		<!-- Live Preview Toggle -->
		<div class="preview-toggle-bar">
			<button class="btn preview-toggle" class:active={showPreview} on:click={() => showPreview = !showPreview}>
				{showPreview ? '✕ Hide Preview' : '👁️ Show Live Preview'}
			</button>
			{#if showPreview}
				<div class="preview-layout-selector">
					<span>Preview:</span>
					{#each Object.entries(layoutLabels) as [type, info]}
						<button
							class="preview-type-btn"
							class:selected={previewLayoutType === type}
							on:click={() => setPreviewType(type)}
						>
							{info.icon} {info.name}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Live Preview Panel -->
		{#if showPreview && LayoutRenderer}
			<div class="live-preview-panel">
				<div class="preview-header">
					<h3>Live Preview: {layoutLabels[previewLayoutType]?.name}</h3>
					<p class="preview-note">This shows how the menu will appear to customers</p>
				</div>
				<div class="preview-content">
					<svelte:component this={LayoutRenderer} layoutOverride={previewLayoutType} />
				</div>
			</div>
		{/if}

		<div class="layouts-grid">
			{#each layouts as layout (layout._id)}
				{@const info = layoutLabels[layout.layoutType]}
				<article class="layout-card" class:active={layout.isActive}>
					<div class="layout-header">
						<div class="layout-info">
							<span class="layout-icon">{info?.icon ?? '📄'}</span>
							<div>
								<h2>{info?.name ?? layout.layoutType}</h2>
								<p class="layout-desc">{info?.description ?? ''}</p>
							</div>
						</div>
						{#if layout.isActive}
							<span class="active-badge">✓ Active</span>
						{:else}
							<button
								class="btn sm activate-btn"
								on:click={() => handleActivate(layout._id)}
								disabled={activatingId === layout._id}
							>
								{#if activatingId === layout._id}
									<span class="spinner-sm"></span>
								{:else}
									Activate
								{/if}
							</button>
						{/if}
					</div>

					<div class="config-section">
						<h3>Configuration</h3>

						{#if editingLayout === layout._id}
							<div class="config-form">
								<label class="form-field">
									<span>Columns per row</span>
									<input
										type="number"
										min="1"
										max="6"
										bind:value={editConfig.columnsPerRow}
									/>
								</label>

								<label class="form-field checkbox">
									<input type="checkbox" bind:checked={editConfig.showCheckboxes} />
									<span>Show checkboxes</span>
								</label>

								<label class="form-field checkbox">
									<input type="checkbox" bind:checked={editConfig.showItemNumbers} />
									<span>Show item numbers</span>
								</label>

								<label class="form-field checkbox">
									<input type="checkbox" bind:checked={editConfig.showImages} />
									<span>Show images</span>
								</label>

								<label class="form-field">
									<span>Category style</span>
									<select bind:value={editConfig.categoryStyle}>
										{#each categoryStyles as style}
											<option value={style.value}>{style.label}</option>
										{/each}
									</select>
								</label>

								<div class="form-actions">
									<button class="btn sm" on:click={cancelEditing} disabled={isSaving}>Cancel</button>
									<button class="btn sm primary" on:click={saveEditing} disabled={isSaving}>
										{#if isSaving}
											<span class="spinner-sm"></span> Saving...
										{:else}
											Save Changes
										{/if}
									</button>
								</div>
							</div>
						{:else}
							<div class="config-display">
								<div class="config-item">
									<span class="config-label">Columns:</span>
									<span class="config-value">{layout.config.columnsPerRow ?? 1}</span>
								</div>
								<div class="config-item">
									<span class="config-label">Checkboxes:</span>
									<span class="config-value">{layout.config.showCheckboxes ? 'Yes' : 'No'}</span>
								</div>
								<div class="config-item">
									<span class="config-label">Item numbers:</span>
									<span class="config-value">{layout.config.showItemNumbers ? 'Yes' : 'No'}</span>
								</div>
								<div class="config-item">
									<span class="config-label">Images:</span>
									<span class="config-value">{layout.config.showImages ? 'Yes' : 'No'}</span>
								</div>
								<div class="config-item">
									<span class="config-label">Category style:</span>
									<span class="config-value">{layout.config.categoryStyle ?? 'header'}</span>
								</div>

								<button class="btn sm edit-btn" on:click={() => startEditing(layout)}>
									Edit Configuration
								</button>
							</div>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}

	<section class="preview-section">
		<h2>Layout Previews</h2>
		<div class="preview-cards">
			<div class="preview-card">
				<div class="preview-icon standard">
					<div class="line"></div>
					<div class="line"></div>
					<div class="line"></div>
				</div>
				<h4>Standard List</h4>
				<p>Classic vertical layout</p>
			</div>
			<div class="preview-card">
				<div class="preview-icon dim-sum">
					<div class="checkbox"></div>
					<div class="checkbox"></div>
					<div class="checkbox"></div>
					<div class="checkbox"></div>
				</div>
				<h4>Dim Sum Grid</h4>
				<p>Checkbox ordering style</p>
			</div>
			<div class="preview-card">
				<div class="preview-icon card-grid">
					<div class="card"></div>
					<div class="card"></div>
					<div class="card"></div>
				</div>
				<h4>Card Grid</h4>
				<p>Visual cards with images</p>
			</div>
		</div>
	</section>
</div>

<style>
	.layout-admin {
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Loading spinners */
	.spinner {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 0.8s linear infinite;
	}

	.spinner-sm {
		display: inline-block;
		width: 12px;
		height: 12px;
		border: 2px solid rgba(0, 0, 0, 0.2);
		border-radius: 50%;
		border-top-color: currentColor;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Preview Toggle Bar */
	.preview-toggle-bar {
		display: flex;
		align-items: center;
		gap: var(--space-4, 1rem);
		margin-bottom: var(--space-4, 1rem);
		flex-wrap: wrap;
	}

	.preview-toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
	}

	.preview-toggle.active {
		background: var(--color-accent, #c45a3b);
		color: white;
		border-color: var(--color-accent, #c45a3b);
	}

	.preview-layout-selector {
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
	}

	.preview-type-btn {
		padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: 20px;
		background: var(--color-surface, white);
		font-size: var(--text-xs, 0.75rem);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.preview-type-btn:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.preview-type-btn.selected {
		background: var(--color-accent, #c45a3b);
		color: white;
		border-color: var(--color-accent, #c45a3b);
	}

	/* Live Preview Panel */
	.live-preview-panel {
		background: var(--color-surface, white);
		border: 2px solid var(--color-accent, #c45a3b);
		border-radius: var(--radius-lg, 12px);
		margin-bottom: var(--space-5, 1.5rem);
		overflow: hidden;
	}

	.preview-header {
		padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
		background: rgba(196, 90, 59, 0.05);
		border-bottom: 1px solid var(--color-border, #e5e5e5);
	}

	.preview-header h3 {
		font-size: var(--text-base, 1rem);
		font-weight: 600;
		margin: 0;
		color: var(--color-accent, #c45a3b);
	}

	.preview-note {
		font-size: var(--text-xs, 0.75rem);
		color: var(--color-text-muted, #666);
		margin: var(--space-1, 0.25rem) 0 0;
	}

	.preview-content {
		max-height: 500px;
		overflow-y: auto;
		padding: var(--space-4, 1rem);
	}

	/* Layout Icon */
	.layout-icon {
		font-size: 24px;
		flex-shrink: 0;
	}

	.layout-info {
		display: flex;
		gap: var(--space-3, 0.75rem);
		align-items: flex-start;
	}

	/* Activate button */
	.activate-btn {
		min-width: 80px;
		justify-content: center;
	}

	.activate-btn:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-5, 1.5rem);
	}

	.header-content h1 {
		font-size: var(--text-2xl, 1.5rem);
		font-weight: 700;
		color: var(--color-text, #1a1a1a);
		margin: 0 0 var(--space-1, 0.25rem);
	}

	.subtitle {
		color: var(--color-text-muted, #666);
		margin: 0;
	}

	.preview-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
		background: var(--color-surface, white);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
		color: var(--color-text, #1a1a1a);
		text-decoration: none;
		font-size: var(--text-sm, 0.875rem);
		font-weight: 500;
		transition: all 0.15s ease;
	}

	.preview-btn:hover {
		background: var(--color-accent, #c45a3b);
		color: white;
		border-color: var(--color-accent, #c45a3b);
	}

	.toast {
		position: fixed;
		top: var(--space-4, 1rem);
		right: var(--space-4, 1rem);
		padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
		background: #16a34a;
		color: white;
		border-radius: var(--radius-md, 8px);
		font-weight: 500;
		z-index: 100;
		animation: slideIn 0.2s ease;
	}

	.toast.error {
		background: #dc2626;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.empty-state {
		text-align: center;
		padding: var(--space-8, 3rem);
		background: var(--color-surface, white);
		border-radius: var(--radius-lg, 12px);
		border: 1px solid var(--color-border, #e5e5e5);
	}

	.empty-state p {
		color: var(--color-text-muted, #666);
		margin-bottom: var(--space-4, 1rem);
	}

	.layouts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: var(--space-4, 1rem);
		margin-bottom: var(--space-6, 2rem);
	}

	.layout-card {
		background: var(--color-surface, white);
		border: 2px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-lg, 12px);
		padding: var(--space-4, 1rem);
		transition: all 0.15s ease;
	}

	.layout-card.active {
		border-color: var(--color-accent, #c45a3b);
		box-shadow: 0 0 0 3px rgba(196, 90, 59, 0.1);
	}

	.layout-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-4, 1rem);
		padding-bottom: var(--space-3, 0.75rem);
		border-bottom: 1px solid var(--color-border, #e5e5e5);
	}

	.layout-info h2 {
		font-size: var(--text-lg, 1.125rem);
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
		margin: 0 0 var(--space-1, 0.25rem);
	}

	.layout-desc {
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
		margin: 0;
	}

	.active-badge {
		font-size: var(--text-xs, 0.75rem);
		font-weight: 600;
		color: white;
		background: var(--color-accent, #c45a3b);
		padding: 4px 10px;
		border-radius: 20px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.btn {
		padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
		background: var(--color-surface, white);
		color: var(--color-text, #1a1a1a);
		font-size: var(--text-sm, 0.875rem);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.btn.primary {
		background: var(--color-accent, #c45a3b);
		color: white;
		border-color: var(--color-accent, #c45a3b);
	}

	.btn.primary:hover {
		opacity: 0.9;
	}

	.btn.sm {
		padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
		font-size: var(--text-xs, 0.75rem);
	}

	.config-section h3 {
		font-size: var(--text-sm, 0.875rem);
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
		margin: 0 0 var(--space-3, 0.75rem);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.config-display {
		display: flex;
		flex-direction: column;
		gap: var(--space-2, 0.5rem);
	}

	.config-item {
		display: flex;
		justify-content: space-between;
		font-size: var(--text-sm, 0.875rem);
	}

	.config-label {
		color: var(--color-text-muted, #666);
	}

	.config-value {
		font-weight: 500;
		color: var(--color-text, #1a1a1a);
	}

	.edit-btn {
		margin-top: var(--space-3, 0.75rem);
		align-self: flex-start;
	}

	.config-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3, 0.75rem);
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1, 0.25rem);
	}

	.form-field.checkbox {
		flex-direction: row;
		align-items: center;
		gap: var(--space-2, 0.5rem);
	}

	.form-field span {
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
	}

	.form-field input[type='number'],
	.form-field select {
		padding: var(--space-2, 0.5rem);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
		font-size: var(--text-sm, 0.875rem);
	}

	.form-field input[type='checkbox'] {
		width: 16px;
		height: 16px;
	}

	.form-actions {
		display: flex;
		gap: var(--space-2, 0.5rem);
		margin-top: var(--space-2, 0.5rem);
	}

	.preview-section {
		margin-top: var(--space-6, 2rem);
	}

	.preview-section h2 {
		font-size: var(--text-lg, 1.125rem);
		font-weight: 600;
		margin-bottom: var(--space-4, 1rem);
	}

	.preview-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4, 1rem);
	}

	.preview-card {
		text-align: center;
		padding: var(--space-4, 1rem);
		background: var(--color-surface, white);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-lg, 12px);
	}

	.preview-card h4 {
		margin: var(--space-3, 0.75rem) 0 var(--space-1, 0.25rem);
		font-size: var(--text-sm, 0.875rem);
	}

	.preview-card p {
		font-size: var(--text-xs, 0.75rem);
		color: var(--color-text-muted, #666);
		margin: 0;
	}

	.preview-icon {
		width: 80px;
		height: 60px;
		margin: 0 auto;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		padding: 8px;
		background: #f5f5f5;
		border-radius: 8px;
	}

	.preview-icon.standard {
		flex-direction: column;
		justify-content: center;
	}

	.preview-icon.standard .line {
		height: 8px;
		background: #ccc;
		border-radius: 4px;
	}

	.preview-icon.dim-sum {
		justify-content: center;
		align-items: center;
	}

	.preview-icon.dim-sum .checkbox {
		width: 16px;
		height: 16px;
		border: 2px solid #ccc;
		border-radius: 4px;
	}

	.preview-icon.card-grid {
		justify-content: center;
		align-items: center;
	}

	.preview-icon.card-grid .card {
		width: 20px;
		height: 24px;
		background: #ccc;
		border-radius: 4px;
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			gap: var(--space-3, 0.75rem);
		}

		.layouts-grid {
			grid-template-columns: 1fr;
		}

		.preview-cards {
			grid-template-columns: 1fr;
		}
	}
</style>
