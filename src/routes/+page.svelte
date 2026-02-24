<script lang="ts">
	let { data } = $props();

	let search = $state('');
	const filtered = $derived(
		data.grammarPoints.filter(
			(gp) =>
				gp.title.toLowerCase().includes(search.toLowerCase()) ||
				gp.hint.toLowerCase().includes(search.toLowerCase()) ||
				gp.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
		)
	);
</script>

<div class="home-wrapper">
	<h1 class="home-title">Korean Cloze SRS</h1>
	<p class="home-subtitle">Learn Korean grammar through spaced-repetition cloze exercises.</p>

	{#if data.user}
		<div class="stats-row">
			<div class="stat">
				<span class="stat-value">{data.reviewsDue}</span>
				<span class="stat-label">Reviews Due</span>
			</div>
			<div class="stat">
				<span class="stat-value">{data.totalReviewed}</span>
				<span class="stat-label">Total Reviewed</span>
			</div>
			<div class="stat">
				<span class="stat-value">{data.grammarPoints.length}</span>
				<span class="stat-label">Grammar Points</span>
			</div>
		</div>

		{#if data.reviewsDue > 0}
			<a href="/reviews" class="btn btn--primary btn--lg">
				Start Reviews ({data.reviewsDue} due)
			</a>
		{:else}
			<p class="home-done">No reviews due — come back later!</p>
		{/if}
	{:else}
		<div class="home-cta">
			<a href="/login" class="btn btn--primary btn--lg">Login to Start</a>
		</div>
	{/if}

	<div class="search-section">
		<input
			type="text"
			class="roman-input"
			placeholder="Search grammar points…"
			bind:value={search}
			spellcheck={false}
			autocomplete="off"
		/>
	</div>

	<div class="grammar-list">
		{#each filtered as gp (gp.id)}
			<div class="grammar-item">
				<div class="grammar-item-header">
					<span class="grammar-item-title">{gp.title}</span>
					<span class="grammar-item-count">{gp.cardCount} card{gp.cardCount === 1 ? '' : 's'}</span>
				</div>
				<div class="grammar-item-meta">
					<span class="grammar-item-hint">{gp.hint}</span>
					{#each gp.tags as tag}
						<span class="grammar-tag">{tag}</span>
					{/each}
				</div>
			</div>
		{:else}
			<p class="grammar-empty">No grammar points match your search.</p>
		{/each}
	</div>
</div>

<style>
	.home-wrapper {
		max-width: 620px;
		margin: 2rem auto;
		padding: 0 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.home-title {
		font-size: 2rem;
		margin: 0;
		color: var(--text);
		text-align: center;
	}

	.home-subtitle {
		text-align: center;
		color: var(--text-muted);
		margin: 0;
		font-size: 1rem;
	}

	.stats-row {
		display: flex;
		justify-content: center;
		gap: 2rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
	}

	.stat-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--text);
	}

	.stat-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
	}

	.home-done {
		text-align: center;
		color: var(--green-text);
		font-weight: 500;
	}

	.home-cta {
		text-align: center;
	}

	:global(.btn--lg) {
		display: inline-block;
		padding: 0.65rem 1.75rem;
		font-size: 1.05rem;
		text-decoration: none;
		text-align: center;
	}

	.search-section {
		margin-top: 0.5rem;
	}

	.grammar-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.grammar-item {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 0.75rem 1rem;
	}

	.grammar-item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.grammar-item-title {
		font-weight: 600;
		color: var(--text);
	}

	.grammar-item-count {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.grammar-item-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.grammar-item-hint {
		font-size: 0.85rem;
		color: var(--text-muted);
		font-style: italic;
	}

	.grammar-tag {
		font-size: 0.7rem;
		padding: 0.1rem 0.4rem;
		background: #f3f4f6;
		border-radius: 4px;
		color: var(--text-muted);
	}

	.grammar-empty {
		text-align: center;
		color: var(--text-faint);
		padding: 1rem;
	}
</style>

