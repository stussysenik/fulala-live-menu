<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery, useMutation } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';

	// Tab state
	let activeTab: 'events' | 'catering' | 'schools' = 'events';

	// Queries
	const eventPackagesQuery = browser ? useQuery(api.events.getEventPackages, {}) : null;
	const cateringMenusQuery = browser ? useQuery(api.events.getCateringMenus, {}) : null;
	const schoolMealsQuery = browser ? useQuery(api.events.getSchoolMeals, {}) : null;
	const menuItemsQuery = browser ? useQuery(api.menu.getMenuItems) : null;

	$: eventPackages = $eventPackagesQuery ?? [];
	$: cateringMenus = $cateringMenusQuery ?? [];
	$: schoolMeals = $schoolMealsQuery ?? [];
	$: menuItems = $menuItemsQuery ?? [];

	// Mutations
	const createEventPackage = browser ? useMutation(api.events.createEventPackage) : null;
	const updateEventPackage = browser ? useMutation(api.events.updateEventPackage) : null;
	const deleteEventPackage = browser ? useMutation(api.events.deleteEventPackage) : null;

	const createCateringMenu = browser ? useMutation(api.events.createCateringMenu) : null;
	const updateCateringMenu = browser ? useMutation(api.events.updateCateringMenu) : null;
	const deleteCateringMenu = browser ? useMutation(api.events.deleteCateringMenu) : null;

	const createSchoolMeal = browser ? useMutation(api.events.createSchoolMeal) : null;
	const updateSchoolMeal = browser ? useMutation(api.events.updateSchoolMeal) : null;
	const deleteSchoolMeal = browser ? useMutation(api.events.deleteSchoolMeal) : null;

	// Toast
	let toast: { message: string; type: 'success' | 'error' } | null = null;

	function showToast(message: string, type: 'success' | 'error' = 'success') {
		toast = { message, type };
		setTimeout(() => (toast = null), 3000);
	}

	// Event form
	let showEventForm = false;
	let eventFormData = {
		name: '',
		description: '',
		minGuests: 10,
		maxGuests: 50,
		pricePerPerson: 2500,
		depositRequired: 5000,
		isActive: true,
	};

	async function handleCreateEventPackage() {
		if (!createEventPackage) return;
		try {
			await createEventPackage({
				...eventFormData,
				includedItems: [],
			});
			showToast('Event package created');
			showEventForm = false;
			eventFormData = {
				name: '',
				description: '',
				minGuests: 10,
				maxGuests: 50,
				pricePerPerson: 2500,
				depositRequired: 5000,
				isActive: true,
			};
		} catch (error) {
			showToast('Failed to create event package', 'error');
		}
	}

	async function handleToggleEventActive(id: string, isActive: boolean) {
		if (!updateEventPackage) return;
		try {
			await updateEventPackage({ id: id as any, isActive: !isActive });
			showToast(isActive ? 'Package deactivated' : 'Package activated');
		} catch (error) {
			showToast('Failed to update package', 'error');
		}
	}

	async function handleDeleteEvent(id: string) {
		if (!deleteEventPackage || !confirm('Delete this event package?')) return;
		try {
			await deleteEventPackage({ id: id as any });
			showToast('Package deleted');
		} catch (error) {
			showToast('Failed to delete package', 'error');
		}
	}

	// Catering form
	let showCateringForm = false;
	let cateringFormData = {
		name: '',
		description: '',
		minOrderAmount: 10000,
		deliveryRadius: 20,
		isActive: true,
	};

	async function handleCreateCateringMenu() {
		if (!createCateringMenu) return;
		try {
			await createCateringMenu({
				...cateringFormData,
				items: [],
			});
			showToast('Catering menu created');
			showCateringForm = false;
			cateringFormData = {
				name: '',
				description: '',
				minOrderAmount: 10000,
				deliveryRadius: 20,
				isActive: true,
			};
		} catch (error) {
			showToast('Failed to create catering menu', 'error');
		}
	}

	async function handleToggleCateringActive(id: string, isActive: boolean) {
		if (!updateCateringMenu) return;
		try {
			await updateCateringMenu({ id: id as any, isActive: !isActive });
			showToast(isActive ? 'Menu deactivated' : 'Menu activated');
		} catch (error) {
			showToast('Failed to update menu', 'error');
		}
	}

	async function handleDeleteCatering(id: string) {
		if (!deleteCateringMenu || !confirm('Delete this catering menu?')) return;
		try {
			await deleteCateringMenu({ id: id as any });
			showToast('Menu deleted');
		} catch (error) {
			showToast('Failed to delete menu', 'error');
		}
	}

	// School meal form
	let showSchoolForm = false;
	let schoolFormData = {
		weekNumber: 1,
		year: new Date().getFullYear(),
		dayOfWeek: 'monday' as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
		pricePerMeal: 1500,
		isActive: true,
	};

	const daysOfWeek = [
		{ value: 'monday', label: 'Monday' },
		{ value: 'tuesday', label: 'Tuesday' },
		{ value: 'wednesday', label: 'Wednesday' },
		{ value: 'thursday', label: 'Thursday' },
		{ value: 'friday', label: 'Friday' },
	];

	async function handleCreateSchoolMeal() {
		if (!createSchoolMeal) return;
		try {
			await createSchoolMeal({
				...schoolFormData,
				items: [],
			});
			showToast('School meal created');
			showSchoolForm = false;
		} catch (error: any) {
			showToast(error.message || 'Failed to create school meal', 'error');
		}
	}

	async function handleToggleSchoolActive(id: string, isActive: boolean) {
		if (!updateSchoolMeal) return;
		try {
			await updateSchoolMeal({ id: id as any, isActive: !isActive });
			showToast(isActive ? 'Meal deactivated' : 'Meal activated');
		} catch (error) {
			showToast('Failed to update meal', 'error');
		}
	}

	async function handleDeleteSchoolMeal(id: string) {
		if (!deleteSchoolMeal || !confirm('Delete this school meal?')) return;
		try {
			await deleteSchoolMeal({ id: id as any });
			showToast('Meal deleted');
		} catch (error) {
			showToast('Failed to delete meal', 'error');
		}
	}

	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2);
	}
</script>

<svelte:head>
	<title>Events & Catering | Fulala Admin</title>
</svelte:head>

<div class="events-admin">
	<header class="page-header">
		<h1>Events & Catering</h1>
		<p class="subtitle">Manage event packages, catering menus, and school meal programs</p>
	</header>

	{#if toast}
		<div class="toast" class:error={toast.type === 'error'}>
			{toast.message}
		</div>
	{/if}

	<nav class="tab-nav">
		<button
			class="tab-btn"
			class:active={activeTab === 'events'}
			on:click={() => (activeTab = 'events')}
		>
			Event Packages
		</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'catering'}
			on:click={() => (activeTab = 'catering')}
		>
			Catering Menus
		</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'schools'}
			on:click={() => (activeTab = 'schools')}
		>
			School Meals
		</button>
	</nav>

	<!-- Event Packages Tab -->
	{#if activeTab === 'events'}
		<section class="tab-content">
			<div class="section-header">
				<h2>Event Packages</h2>
				<button class="btn primary" on:click={() => (showEventForm = true)}>
					+ New Package
				</button>
			</div>

			{#if showEventForm}
				<form class="form-card" on:submit|preventDefault={handleCreateEventPackage}>
					<h3>Create Event Package</h3>
					<div class="form-grid">
						<label class="form-field">
							<span>Package Name</span>
							<input type="text" bind:value={eventFormData.name} required />
						</label>
						<label class="form-field full">
							<span>Description</span>
							<textarea bind:value={eventFormData.description} rows="2"></textarea>
						</label>
						<label class="form-field">
							<span>Min Guests</span>
							<input type="number" bind:value={eventFormData.minGuests} min="1" />
						</label>
						<label class="form-field">
							<span>Max Guests</span>
							<input type="number" bind:value={eventFormData.maxGuests} min="1" />
						</label>
						<label class="form-field">
							<span>Price/Person (cents)</span>
							<input type="number" bind:value={eventFormData.pricePerPerson} min="0" />
						</label>
						<label class="form-field">
							<span>Deposit Required (cents)</span>
							<input type="number" bind:value={eventFormData.depositRequired} min="0" />
						</label>
					</div>
					<div class="form-actions">
						<button type="button" class="btn" on:click={() => (showEventForm = false)}>
							Cancel
						</button>
						<button type="submit" class="btn primary">Create</button>
					</div>
				</form>
			{/if}

			<div class="items-grid">
				{#each eventPackages as pkg}
					<article class="item-card" class:inactive={!pkg.isActive}>
						<div class="item-header">
							<h3>{pkg.name}</h3>
							{#if pkg.isActive}
								<span class="status-badge active">Active</span>
							{:else}
								<span class="status-badge">Inactive</span>
							{/if}
						</div>
						{#if pkg.description}
							<p class="item-desc">{pkg.description}</p>
						{/if}
						<div class="item-details">
							<span>{pkg.minGuests} - {pkg.maxGuests} guests</span>
							<span>${formatPrice(pkg.pricePerPerson)}/person</span>
							<span>Deposit: ${formatPrice(pkg.depositRequired)}</span>
						</div>
						<div class="item-actions">
							<button class="btn sm" on:click={() => handleToggleEventActive(pkg._id, pkg.isActive)}>
								{pkg.isActive ? 'Deactivate' : 'Activate'}
							</button>
							<button class="btn sm danger" on:click={() => handleDeleteEvent(pkg._id)}>
								Delete
							</button>
						</div>
					</article>
				{:else}
					<p class="empty-state">No event packages yet. Create your first one!</p>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Catering Menus Tab -->
	{#if activeTab === 'catering'}
		<section class="tab-content">
			<div class="section-header">
				<h2>Catering Menus</h2>
				<button class="btn primary" on:click={() => (showCateringForm = true)}>
					+ New Menu
				</button>
			</div>

			{#if showCateringForm}
				<form class="form-card" on:submit|preventDefault={handleCreateCateringMenu}>
					<h3>Create Catering Menu</h3>
					<div class="form-grid">
						<label class="form-field">
							<span>Menu Name</span>
							<input type="text" bind:value={cateringFormData.name} required />
						</label>
						<label class="form-field full">
							<span>Description</span>
							<textarea bind:value={cateringFormData.description} rows="2"></textarea>
						</label>
						<label class="form-field">
							<span>Min Order Amount (cents)</span>
							<input type="number" bind:value={cateringFormData.minOrderAmount} min="0" />
						</label>
						<label class="form-field">
							<span>Delivery Radius (km)</span>
							<input type="number" bind:value={cateringFormData.deliveryRadius} min="0" />
						</label>
					</div>
					<div class="form-actions">
						<button type="button" class="btn" on:click={() => (showCateringForm = false)}>
							Cancel
						</button>
						<button type="submit" class="btn primary">Create</button>
					</div>
				</form>
			{/if}

			<div class="items-grid">
				{#each cateringMenus as menu}
					<article class="item-card" class:inactive={!menu.isActive}>
						<div class="item-header">
							<h3>{menu.name}</h3>
							{#if menu.isActive}
								<span class="status-badge active">Active</span>
							{:else}
								<span class="status-badge">Inactive</span>
							{/if}
						</div>
						{#if menu.description}
							<p class="item-desc">{menu.description}</p>
						{/if}
						<div class="item-details">
							<span>Min order: ${formatPrice(menu.minOrderAmount)}</span>
							{#if menu.deliveryRadius}
								<span>Delivery: {menu.deliveryRadius}km</span>
							{/if}
						</div>
						<div class="item-actions">
							<button class="btn sm" on:click={() => handleToggleCateringActive(menu._id, menu.isActive)}>
								{menu.isActive ? 'Deactivate' : 'Activate'}
							</button>
							<button class="btn sm danger" on:click={() => handleDeleteCatering(menu._id)}>
								Delete
							</button>
						</div>
					</article>
				{:else}
					<p class="empty-state">No catering menus yet. Create your first one!</p>
				{/each}
			</div>
		</section>
	{/if}

	<!-- School Meals Tab -->
	{#if activeTab === 'schools'}
		<section class="tab-content">
			<div class="section-header">
				<h2>School Meal Program</h2>
				<button class="btn primary" on:click={() => (showSchoolForm = true)}>
					+ New Meal
				</button>
			</div>

			{#if showSchoolForm}
				<form class="form-card" on:submit|preventDefault={handleCreateSchoolMeal}>
					<h3>Create School Meal</h3>
					<div class="form-grid">
						<label class="form-field">
							<span>Year</span>
							<input type="number" bind:value={schoolFormData.year} min="2024" max="2030" />
						</label>
						<label class="form-field">
							<span>Week Number</span>
							<input type="number" bind:value={schoolFormData.weekNumber} min="1" max="52" />
						</label>
						<label class="form-field">
							<span>Day of Week</span>
							<select bind:value={schoolFormData.dayOfWeek}>
								{#each daysOfWeek as day}
									<option value={day.value}>{day.label}</option>
								{/each}
							</select>
						</label>
						<label class="form-field">
							<span>Price per Meal (cents)</span>
							<input type="number" bind:value={schoolFormData.pricePerMeal} min="0" />
						</label>
					</div>
					<div class="form-actions">
						<button type="button" class="btn" on:click={() => (showSchoolForm = false)}>
							Cancel
						</button>
						<button type="submit" class="btn primary">Create</button>
					</div>
				</form>
			{/if}

			<div class="items-grid">
				{#each schoolMeals as meal}
					<article class="item-card" class:inactive={!meal.isActive}>
						<div class="item-header">
							<h3 class="capitalize">{meal.dayOfWeek}</h3>
							{#if meal.isActive}
								<span class="status-badge active">Active</span>
							{:else}
								<span class="status-badge">Inactive</span>
							{/if}
						</div>
						<div class="item-details">
							<span>Week {meal.weekNumber}, {meal.year}</span>
							<span>${formatPrice(meal.pricePerMeal)}/meal</span>
							<span>{meal.items.length} items</span>
						</div>
						<div class="item-actions">
							<button class="btn sm" on:click={() => handleToggleSchoolActive(meal._id, meal.isActive)}>
								{meal.isActive ? 'Deactivate' : 'Activate'}
							</button>
							<button class="btn sm danger" on:click={() => handleDeleteSchoolMeal(meal._id)}>
								Delete
							</button>
						</div>
					</article>
				{:else}
					<p class="empty-state">No school meals scheduled. Create your first one!</p>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.events-admin {
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: var(--space-4, 1rem);
	}

	.page-header h1 {
		font-size: var(--text-2xl, 1.5rem);
		font-weight: 700;
		margin: 0 0 var(--space-1, 0.25rem);
	}

	.subtitle {
		color: var(--color-text-muted, #666);
		margin: 0;
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
	}

	.toast.error {
		background: #dc2626;
	}

	.tab-nav {
		display: flex;
		gap: var(--space-2, 0.5rem);
		margin-bottom: var(--space-5, 1.5rem);
		border-bottom: 1px solid var(--color-border, #e5e5e5);
		padding-bottom: var(--space-2, 0.5rem);
	}

	.tab-btn {
		padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
		border: none;
		background: transparent;
		font-size: var(--text-body, 1rem);
		font-weight: 500;
		color: var(--color-text-muted, #666);
		cursor: pointer;
		border-radius: var(--radius-md, 8px);
		transition: all 0.15s ease;
	}

	.tab-btn:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.tab-btn.active {
		background: var(--color-accent, #c45a3b);
		color: white;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4, 1rem);
	}

	.section-header h2 {
		font-size: var(--text-lg, 1.125rem);
		font-weight: 600;
		margin: 0;
	}

	.btn {
		padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
		background: var(--color-surface, white);
		font-size: var(--text-sm, 0.875rem);
		font-weight: 500;
		cursor: pointer;
	}

	.btn.primary {
		background: var(--color-accent, #c45a3b);
		color: white;
		border-color: var(--color-accent, #c45a3b);
	}

	.btn.danger {
		color: #dc2626;
		border-color: #dc2626;
	}

	.btn.sm {
		padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
		font-size: var(--text-xs, 0.75rem);
	}

	.form-card {
		background: var(--color-surface, white);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-lg, 12px);
		padding: var(--space-4, 1rem);
		margin-bottom: var(--space-4, 1rem);
	}

	.form-card h3 {
		margin: 0 0 var(--space-4, 1rem);
		font-size: var(--text-body, 1rem);
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-3, 0.75rem);
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1, 0.25rem);
	}

	.form-field.full {
		grid-column: span 2;
	}

	.form-field span {
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
	}

	.form-field input,
	.form-field textarea,
	.form-field select {
		padding: var(--space-2, 0.5rem);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
		font-size: var(--text-sm, 0.875rem);
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2, 0.5rem);
		margin-top: var(--space-4, 1rem);
	}

	.items-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--space-4, 1rem);
	}

	.item-card {
		background: var(--color-surface, white);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-lg, 12px);
		padding: var(--space-4, 1rem);
	}

	.item-card.inactive {
		opacity: 0.6;
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-2, 0.5rem);
	}

	.item-header h3 {
		font-size: var(--text-body, 1rem);
		font-weight: 600;
		margin: 0;
	}

	.capitalize {
		text-transform: capitalize;
	}

	.status-badge {
		font-size: var(--text-xs, 0.75rem);
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.1);
		color: var(--color-text-muted, #666);
	}

	.status-badge.active {
		background: rgba(22, 163, 74, 0.1);
		color: #16a34a;
	}

	.item-desc {
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
		margin: 0 0 var(--space-3, 0.75rem);
	}

	.item-details {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2, 0.5rem);
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
		margin-bottom: var(--space-3, 0.75rem);
	}

	.item-details span {
		background: rgba(0, 0, 0, 0.05);
		padding: 2px 8px;
		border-radius: 4px;
	}

	.item-actions {
		display: flex;
		gap: var(--space-2, 0.5rem);
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		padding: var(--space-6, 2rem);
		color: var(--color-text-muted, #666);
	}

	@media (max-width: 600px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.form-field.full {
			grid-column: span 1;
		}

		.items-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
