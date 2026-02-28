<script lang="ts">
	import MasteryPips from '$lib/components/MasteryPips.svelte';
	import { TOPIK_LEVELS, getTopikDisplay, getTopikShort } from '$lib/topik';

	let { data } = $props();

	let searchQuery = $state('');

	const filteredPoints = $derived(
		searchQuery.trim() === ''
			? data.grammarPoints
			: data.grammarPoints.filter(
					(gp) =>
						gp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						gp.hint.toLowerCase().includes(searchQuery.toLowerCase()) ||
						gp.description.toLowerCase().includes(searchQuery.toLowerCase())
				)
	);
</script>

<div class="grammar-library">
	<h1 class="grammar-library__title">Grammar Library</h1>

	<!-- TOPIK Level Filter Tabs -->
	<div class="grammar-library__tabs" role="tablist">
		<a
			href="/grammar"
			class="grammar-library__tab"
			class:grammar-library__tab--active={!data.currentLevel}
			role="tab"
			aria-selected={!data.currentLevel}
		>
			All
		</a>
		{#each TOPIK_LEVELS as level}
			<a
				href="/grammar?level={level.value}"
				class="grammar-library__tab"
				class:grammar-library__tab--active={data.currentLevel === level.value}
				role="tab"
				aria-selected={data.currentLevel === level.value}
			>
				<span class="grammar-library__tab-full">{level.display}</span>
				<span class="grammar-library__tab-short">{level.short}</span>
			</a>
		{/each}
	</div>

	<!-- Search bar -->
	<div class="grammar-library__search">
		<input
			type="text"
			class="grammar-library__search-input"
			placeholder="Search grammar points..."
			bind:value={searchQuery}
		/>
	</div>

	<!-- Grammar cards grid -->
	{#if filteredPoints.length === 0}
		<div class="grammar-library__empty">
			{#if searchQuery.trim() !== ''}
				<p>No grammar points match "<strong>{searchQuery}</strong>".</p>
			{:else}
				<h3>Coming soon</h3>
				<p>Curriculum for this level is being developed.</p>
			{/if}
		</div>
	{:else}
		<div class="grammar-library__grid">
			{#each filteredPoints as gp (gp.id)}
				<a href="/grammar/{gp.id}" class="grammar-card">
					<div class="grammar-card__header">
						<span class="grammar-card__title">{gp.title}</span>
						<span class="grammar-card__badge grammar-card__badge--{gp.topikLevel}">
							{getTopikShort(gp.topikLevel)}
						</span>
					</div>
					<p class="grammar-card__hint">{gp.hint}</p>
					{#if data.user && gp.hasReviewCard}
						<div class="grammar-card__mastery">
							<MasteryPips streakCorrect={gp.streakCorrect} masteredAt={gp.masteredAt} size="sm" />
						</div>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</div>
