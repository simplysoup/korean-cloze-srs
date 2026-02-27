<script lang="ts">
	let { data } = $props();

	async function enrollDeck(deckId: string) {
		const res = await fetch(`/api/decks/${deckId}/enroll`, { method: 'POST' });
		if (res.ok) {
			window.location.reload();
		}
	}
</script>

<div class="home-wrapper">
	<h1 class="home-title">Korean Cloze SRS</h1>
	<p class="home-subtitle">Learn Korean grammar through spaced-repetition cloze exercises.</p>

	{#if data.user}
		<!-- Quick stats -->
		<div class="stats-row">
			<div class="stat">
				<span class="stat-value">{data.reviewsDue}</span>
				<span class="stat-label">Reviews Due</span>
			</div>
			<div class="stat">
				<span class="stat-value">{data.totalReviewed}</span>
				<span class="stat-label">Total Reviewed</span>
			</div>
		</div>

		{#if data.reviewsDue > 0}
			<a href="/reviews" class="btn btn--primary btn--lg btn--center">
				Start Reviews ({data.reviewsDue} due)
			</a>
		{/if}

		<!-- Enrolled decks -->
		{#if data.enrolledDecks.length > 0}
			<section class="deck-section">
				<h2 class="section-title">Your Decks</h2>
				<div class="deck-grid">
					{#each data.enrolledDecks as deck (deck.id)}
						<a href="/decks/{deck.slug}" class="deck-card deck-card--enrolled">
							<div class="deck-card__header">
								{#if deck.icon}<span class="deck-card__icon">{deck.icon}</span>{/if}
								<span class="deck-card__title">{deck.title}</span>
							</div>
							<div class="deck-card__progress">
								<div class="deck-card__bar">
									<div
										class="deck-card__bar-fill"
										style="width: {deck.totalGrammar > 0 ? Math.round((deck.learnedCount / deck.totalGrammar) * 100) : 0}%"
									></div>
								</div>
								<span class="deck-card__stat">{deck.learnedCount}/{deck.totalGrammar} learned</span>
							</div>
							{#if deck.reviewsDue > 0}
								<span class="deck-card__reviews">{deck.reviewsDue} reviews due</span>
							{/if}
							<span class="deck-card__action">Continue →</span>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Available decks to enroll in -->
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
							<button class="btn btn--primary btn--sm" onclick={() => enrollDeck(deck.id)}>
								Start Learning
							</button>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	{:else}
		<!-- Unauthenticated view -->
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

	:global(.btn--sm) {
		padding: 0.35rem 0.9rem;
		font-size: 0.85rem;
	}

	.btn--center {
		text-align: center;
		align-self: center;
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
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	a.deck-card:hover {
		border-color: var(--blue);
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
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

	.deck-card__progress {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.deck-card__bar {
		flex: 1;
		height: 6px;
		background: var(--border);
		border-radius: 3px;
		overflow: hidden;
	}

	.deck-card__bar-fill {
		height: 100%;
		background: var(--green);
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.deck-card__stat {
		font-size: 0.8rem;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.deck-card__reviews {
		font-size: 0.8rem;
		color: var(--blue);
		font-weight: 500;
	}

	.deck-card__action {
		font-size: 0.85rem;
		color: var(--blue);
		font-weight: 500;
	}
</style>

