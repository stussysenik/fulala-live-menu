<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery, useMutation } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import MenuCardPreview from '$lib/components/admin/MenuCardPreview.svelte';

	// Tab state
	let activeTab: 'events' | 'catering' | 'schools' = 'events';

	// Queries
	const eventPackagesQuery = browser ? useQuery(api.events.getEventPackages, {}) : null;
	const cateringMenusQuery = browser ? useQuery(api.events.getCateringMenus, {}) : null;
	const schoolMealsQuery = browser ? useQuery(api.events.getSchoolMeals, {}) : null;
	// Full menu (categories with items) feeds the dish picker in every form.
	const fullMenuQuery = browser ? useQuery(api.menu.getFullMenu) : null;

	$: eventPackages = $eventPackagesQuery ?? [];
	$: cateringMenus = $cateringMenusQuery ?? [];
	$: schoolMeals = $schoolMealsQuery ?? [];
	$: menuCategories = $fullMenuQuery ?? [];
	$: itemNameById = new Map(
		menuCategories.flatMap((c: any) =>
			c.items.map((i: any) => [i._id, i.nameLocal || i.name])
		)
	);

	// --- Dish picker -----------------------------------------------------------
	// One selection buffer shared by whichever form is open (only one form is
	// ever open at a time); plain checkboxes, the menu composes the package.
	let pickedItemIds: string[] = [];

	function toggleItem(id: string) {
		pickedItemIds = pickedItemIds.includes(id)
			? pickedItemIds.filter((x) => x !== id)
			: [...pickedItemIds, id];
	}

	function pickedNames(ids: string[]): string {
		return ids.map((id) => itemNameById.get(id) ?? '?').join(', ');
	}

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

	// Event form — one form handles create AND edit; editingEventId decides.
	let showEventForm = false;
	let editingEventId: string | null = null;
	const emptyEventForm = () => ({
		name: '',
		description: '',
		minGuests: 10,
		maxGuests: 50,
		pricePerPerson: 2500,
		depositRequired: 5000,
		isActive: true,
	});
	let eventFormData = emptyEventForm();

	function openEventForm(pkg: any = null) {
		editingEventId = pkg?._id ?? null;
		eventFormData = pkg
			? {
					name: pkg.name,
					description: pkg.description ?? '',
					minGuests: pkg.minGuests,
					maxGuests: pkg.maxGuests,
					pricePerPerson: pkg.pricePerPerson,
					depositRequired: pkg.depositRequired,
					isActive: pkg.isActive,
				}
			: emptyEventForm();
		pickedItemIds = pkg ? [...pkg.includedItems] : [];
		showEventForm = true;
	}

	async function handleSubmitEventPackage() {
		try {
			if (editingEventId) {
				await updateEventPackage?.({
					id: editingEventId as any,
					...eventFormData,
					includedItems: pickedItemIds as any,
				});
				showToast('Event package updated');
			} else {
				await createEventPackage?.({
					...eventFormData,
					includedItems: pickedItemIds as any,
				});
				showToast('Event package created');
			}
			showEventForm = false;
			editingEventId = null;
			eventFormData = emptyEventForm();
			pickedItemIds = [];
		} catch (error) {
			showToast('Failed to save event package', 'error');
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
	let editingCateringId: string | null = null;
	const emptyCateringForm = () => ({
		name: '',
		description: '',
		minOrderAmount: 10000,
		deliveryRadius: 20,
		isActive: true,
	});
	let cateringFormData = emptyCateringForm();

	function openCateringForm(menu: any = null) {
		editingCateringId = menu?._id ?? null;
		cateringFormData = menu
			? {
					name: menu.name,
					description: menu.description ?? '',
					minOrderAmount: menu.minOrderAmount,
					deliveryRadius: menu.deliveryRadius ?? 20,
					isActive: menu.isActive,
				}
			: emptyCateringForm();
		pickedItemIds = menu ? [...menu.items] : [];
		showCateringForm = true;
	}

	async function handleSubmitCateringMenu() {
		try {
			if (editingCateringId) {
				await updateCateringMenu?.({
					id: editingCateringId as any,
					...cateringFormData,
					items: pickedItemIds as any,
				});
				showToast('Catering menu updated');
			} else {
				await createCateringMenu?.({
					...cateringFormData,
					items: pickedItemIds as any,
				});
				showToast('Catering menu created');
			}
			showCateringForm = false;
			editingCateringId = null;
			cateringFormData = emptyCateringForm();
			pickedItemIds = [];
		} catch (error) {
			showToast('Failed to save catering menu', 'error');
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
	let editingSchoolId: string | null = null;
	let schoolFormData = {
		weekNumber: 1,
		year: new Date().getFullYear(),
		dayOfWeek: 'monday' as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
		pricePerMeal: 1500,
		isActive: true,
	};

	function openSchoolForm(meal: any = null) {
		editingSchoolId = meal?._id ?? null;
		if (meal) {
			schoolFormData = {
				weekNumber: meal.weekNumber,
				year: meal.year,
				dayOfWeek: meal.dayOfWeek,
				pricePerMeal: meal.pricePerMeal,
				isActive: meal.isActive,
			};
		}
		pickedItemIds = meal ? [...meal.items] : [];
		showSchoolForm = true;
	}

	const daysOfWeek = [
		{ value: 'monday', label: 'Monday' },
		{ value: 'tuesday', label: 'Tuesday' },
		{ value: 'wednesday', label: 'Wednesday' },
		{ value: 'thursday', label: 'Thursday' },
		{ value: 'friday', label: 'Friday' },
	];

	async function handleSubmitSchoolMeal() {
		try {
			if (editingSchoolId) {
				await updateSchoolMeal?.({
					id: editingSchoolId as any,
					...schoolFormData,
					items: pickedItemIds as any,
				});
				showToast('School meal updated');
			} else {
				await createSchoolMeal?.({
					...schoolFormData,
					items: pickedItemIds as any,
				});
				showToast('School meal created');
			}
			showSchoolForm = false;
			editingSchoolId = null;
			pickedItemIds = [];
		} catch (error: any) {
			showToast(error.message || 'Failed to save school meal', 'error');
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
				<button class="btn primary" on:click={() => openEventForm()}>
					+ New Package
				</button>
			</div>

			{#if showEventForm}
				<form class="form-card" on:submit|preventDefault={handleSubmitEventPackage}>
				<div class="form-split">
					<div class="form-main">
					<h3>{editingEventId ? 'Edit Event Package' : 'Create Event Package'}</h3>
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
					<fieldset class="item-picker">
						<legend>Dishes on this menu ({pickedItemIds.length} picked)</legend>
						{#each menuCategories as category (category._id)}
							{#if category.items.length > 0}
								<div class="picker-category">
									<h4>{category.displayNameLocal || category.displayName}</h4>
									<div class="picker-grid">
										{#each category.items as item (item._id)}
											<label class="picker-item">
												<input
													type="checkbox"
													checked={pickedItemIds.includes(item._id)}
													on:change={() => toggleItem(item._id)}
												/>
												<span>{item.nameLocal || item.name}</span>
											</label>
										{/each}
									</div>
								</div>
							{/if}
						{/each}
					</fieldset>
					<div class="form-actions">
						<button type="button" class="btn" on:click={() => (showEventForm = false)}>
							Cancel
						</button>
						<button type="submit" class="btn primary">{editingEventId ? 'Save' : 'Create'}</button>
					</div>
				</div>
					<MenuCardPreview
						title={eventFormData.name}
						subtitle={`${eventFormData.minGuests}–${eventFormData.maxGuests} guests`}
						priceLine={`${(eventFormData.pricePerPerson / 100).toFixed(0)} Kč / person`}
						{pickedItemIds}
						{menuCategories}
					/>
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
						{#if pkg.includedItems.length > 0}
							<p class="item-dishes">🍽 {pickedNames(pkg.includedItems)}</p>
						{/if}
						<div class="item-actions">
							<button class="btn sm" on:click={() => openEventForm(pkg)}>Edit</button>
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
				<button class="btn primary" on:click={() => openCateringForm()}>
					+ New Menu
				</button>
			</div>

			{#if showCateringForm}
				<form class="form-card" on:submit|preventDefault={handleSubmitCateringMenu}>
				<div class="form-split">
					<div class="form-main">
					<h3>{editingCateringId ? 'Edit Catering Menu' : 'Create Catering Menu'}</h3>
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
					<fieldset class="item-picker">
						<legend>Dishes on this menu ({pickedItemIds.length} picked)</legend>
						{#each menuCategories as category (category._id)}
							{#if category.items.length > 0}
								<div class="picker-category">
									<h4>{category.displayNameLocal || category.displayName}</h4>
									<div class="picker-grid">
										{#each category.items as item (item._id)}
											<label class="picker-item">
												<input
													type="checkbox"
													checked={pickedItemIds.includes(item._id)}
													on:change={() => toggleItem(item._id)}
												/>
												<span>{item.nameLocal || item.name}</span>
											</label>
										{/each}
									</div>
								</div>
							{/if}
						{/each}
					</fieldset>
					<div class="form-actions">
						<button type="button" class="btn" on:click={() => (showCateringForm = false)}>
							Cancel
						</button>
						<button type="submit" class="btn primary">{editingCateringId ? 'Save' : 'Create'}</button>
					</div>
				</div>
					<MenuCardPreview
						title={cateringFormData.name}
						subtitle={cateringFormData.deliveryRadius ? `Delivery up to ${cateringFormData.deliveryRadius} km` : ''}
						priceLine={`Min. order ${(cateringFormData.minOrderAmount / 100).toFixed(0)} Kč`}
						{pickedItemIds}
						{menuCategories}
					/>
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
						{#if menu.items.length > 0}
							<p class="item-dishes">🍽 {pickedNames(menu.items)}</p>
						{/if}
						<div class="item-actions">
							<button class="btn sm" on:click={() => openCateringForm(menu)}>Edit</button>
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
				<button class="btn primary" on:click={() => openSchoolForm()}>
					+ New Meal
				</button>
			</div>

			{#if showSchoolForm}
				<form class="form-card" on:submit|preventDefault={handleSubmitSchoolMeal}>
				<div class="form-split">
					<div class="form-main">
					<h3>{editingSchoolId ? 'Edit School Meal' : 'Create School Meal'}</h3>
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
					<fieldset class="item-picker">
						<legend>Dishes on this menu ({pickedItemIds.length} picked)</legend>
						{#each menuCategories as category (category._id)}
							{#if category.items.length > 0}
								<div class="picker-category">
									<h4>{category.displayNameLocal || category.displayName}</h4>
									<div class="picker-grid">
										{#each category.items as item (item._id)}
											<label class="picker-item">
												<input
													type="checkbox"
													checked={pickedItemIds.includes(item._id)}
													on:change={() => toggleItem(item._id)}
												/>
												<span>{item.nameLocal || item.name}</span>
											</label>
										{/each}
									</div>
								</div>
							{/if}
						{/each}
					</fieldset>
					<div class="form-actions">
						<button type="button" class="btn" on:click={() => (showSchoolForm = false)}>
							Cancel
						</button>
						<button type="submit" class="btn primary">{editingSchoolId ? 'Save' : 'Create'}</button>
					</div>
				</div>
					<MenuCardPreview
						title={`School menu — ${schoolFormData.dayOfWeek}`}
						subtitle={`Week ${schoolFormData.weekNumber}, ${schoolFormData.year}`}
						priceLine={`${(schoolFormData.pricePerMeal / 100).toFixed(0)} Kč / meal`}
						{pickedItemIds}
						{menuCategories}
					/>
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
						{#if meal.items.length > 0}
							<p class="item-dishes">🍽 {pickedNames(meal.items)}</p>
						{/if}
						<div class="item-actions">
							<button class="btn sm" on:click={() => openSchoolForm(meal)}>Edit</button>
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

	/* Inputs left, live menu card right — the edit is evidenced visually. */
	.form-split {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(250px, 320px);
		gap: 1.25rem;
		align-items: start;
	}

	@media (max-width: 900px) {
		.form-split {
			grid-template-columns: 1fr;
		}
	}

	/* Dish picker — plain checkboxes grouped by category. */
	.item-picker {
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: 8px;
		padding: 0.75rem 1rem;
		margin-top: var(--space-4, 1rem);
	}

	.item-picker legend {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #2c2c2c;
		padding: 0 6px;
	}

	.picker-category h4 {
		font-size: 0.75rem;
		font-weight: 650;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b6b6b;
		margin: 0.625rem 0 0.375rem;
	}

	.picker-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
		gap: 0.25rem 1rem;
	}

	.picker-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: #2c2c2c;
		cursor: pointer;
	}

	.picker-item input {
		width: 16px;
		height: 16px;
	}

	.item-dishes {
		font-size: 0.75rem;
		color: #6b6b6b;
		line-height: 1.4;
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
