<script lang="ts">
	import MasteryPips from '$lib/components/MasteryPips.svelte';
	import { TOPIK_LEVELS, getTopikDisplay, getTopikShort } from '$lib/topik';

	let { data } = $props();

	let searchQuery = $state('');

	/** Get SRS level label from FSRS state + mastery info */
	function getSrsLabel(gp: { srsState: number; masteredAt: string | null; hasReviewCard: boolean }): string {
		if (gp.masteredAt) return 'Mastered';
		if (!gp.hasReviewCard) return 'Unstudied';
		switch (gp.srsState) {
			case 0: return 'New';
			case 1: return 'Learning';
			case 2: return 'Review';
			case 3: return 'Relearning';
			default: return 'Unstudied';
		}
	}

	/** Get CSS modifier class for SRS state */
	function getSrsClass(gp: { srsState: number; masteredAt: string | null; hasReviewCard: boolean }): string {
		if (gp.masteredAt) return 'mastered';
		if (!gp.hasReviewCard) return 'unstudied';
		switch (gp.srsState) {
			case 0: return 'new';
			case 1: return 'learning';
			case 2: return 'review';
			case 3: return 'relearning';
			default: return 'unstudied';
		}
	}

	const filteredPoints = $derived(
		searchQuery.trim() === ''
			? data.grammarPoints
			: data.grammarPoints.filter(
					(gp) => gp.searchText.includes(searchQuery.toLowerCase())
				)
	);

	/** Group grammar points by topikLevel for section headers (only when unfiltered) */
	type GpType = typeof filteredPoints[number];
	type Section = { topikLevel: string; topikDisplay: string; points: GpType[] };

	const sections = $derived.by((): Section[] => {
		if (data.currentLevel || searchQuery.trim() !== '') {
			// When filtered by level or searching, single flat section
			return [{ topikLevel: '', topikDisplay: '', points: filteredPoints }];
		}
		// Group by topikLevel preserving order
		const map = new Map<string, GpType[]>();
		for (const gp of filteredPoints) {
			let arr = map.get(gp.topikLevel);
			if (!arr) { arr = []; map.set(gp.topikLevel, arr); }
			arr.push(gp);
		}
		return [...map.entries()].map(([level, points]) => ({
			topikLevel: level,
			topikDisplay: getTopikDisplay(level),
			points
		}));
	});
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
			placeholder="Search by Korean, romanized, or English..."
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
		{#each sections as section (section.topikLevel)}
			{#if section.topikDisplay}
				<div class="grammar-library__section-header">
					<h2 class="grammar-library__section-title">{section.topikDisplay}</h2>
					<span class="grammar-library__section-count">{section.points.length} points</span>
				</div>
			{/if}
			<div class="grammar-library__grid">
				{#each section.points as gp (gp.id)}
					<a href="/grammar/{gp.id}" class="grammar-card">
						<div class="grammar-card__header">
							<span class="grammar-card__title">{gp.title}</span>
							<span class="grammar-card__srs grammar-card__srs--{getSrsClass(gp)}">
								{getSrsLabel(gp)}
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
		{/each}
	{/if}
</div>
