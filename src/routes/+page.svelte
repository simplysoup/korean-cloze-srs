<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Korean Cloze SRS</title>
</svelte:head>

<div class="home-wrapper">
	<h1 class="home-title">Korean Cloze SRS</h1>
	<p class="home-subtitle">Learn Korean grammar through spaced-repetition cloze exercises.</p>

	<div class="home-cta">
		<a href="/login" class="btn btn--primary btn--lg">Login to Start</a>
	</div>

	{#if data.availableDecks.length > 0}
		<section class="deck-section">
			<h2 class="section-title">Available Decks</h2>
			<div class="deck-grid">
				{#each data.availableDecks as deck (deck.id)}
					<div class="deck-card">
						<div class="deck-card__header">
							{#if deck.icon}<span class="deck-card__icon">{deck.icon}</span>{/if}
							<span class="deck-card__title">{deck.title}</span>
						</div>
						<p class="deck-card__desc">{deck.description}</p>
						<span class="deck-card__meta">{deck.totalGrammar} grammar points · TOPIK {deck.level}</span>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.home-wrapper {
		max-width: 680px;
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

	/* ── Deck sections ───────────────────────────────────────── */
	.deck-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-title {
		font-size: 1.1rem;
		color: var(--text);
		margin: 0;
		font-weight: 600;
	}

	.deck-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* ── Deck cards ──────────────────────────────────────────── */
	.deck-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-decoration: none;
		color: inherit;
	}

	.deck-card__header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.deck-card__icon {
		font-size: 1.5rem;
	}

	.deck-card__title {
		font-weight: 600;
		font-size: 1.05rem;
		color: var(--text);
	}

	.deck-card__desc {
		margin: 0;
		font-size: 0.85rem;
		color: var(--text-muted);
		line-height: 1.4;
	}

	.deck-card__meta {
		font-size: 0.8rem;
		color: var(--text-faint);
	}
</style>

