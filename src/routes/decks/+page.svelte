<script lang="ts">
	import { getTopikDisplay, getTopikShort } from '$lib/topik';

	let { data } = $props();
</script>

<div class="deck-index">
	<h1 class="deck-index__title">Decks</h1>

	{#if data.decks.length === 0}
		<div class="deck-index__empty">
			<p>No decks available yet. Check back soon!</p>
		</div>
	{:else}
		<div class="deck-index__grid">
			{#each data.decks as deck (deck.id)}
				<a href="/decks/{deck.slug}" class="deck-card">
					{#if deck.icon}
						<span class="deck-card__icon">{deck.icon}</span>
					{/if}
					<div class="deck-card__body">
						<div class="deck-card__header">
							<h2 class="deck-card__title">{deck.title}</h2>
							<span class="deck-card__badge deck-card__badge--{deck.topikLevel}">
								{getTopikShort(deck.topikLevel)}
							</span>
						</div>
						<p class="deck-card__desc">{deck.description}</p>
						<div class="deck-card__meta">
							<span>{deck.lessonCount} lesson{deck.lessonCount !== 1 ? 's' : ''}</span>
							<span class="deck-card__dot">·</span>
							<span>{deck.grammarCount} grammar point{deck.grammarCount !== 1 ? 's' : ''}</span>
						</div>
						{#if data.user && deck.grammarCount > 0}
							<div class="deck-card__progress">
								<div class="deck-card__progress-bar">
									<div
										class="deck-card__progress-fill"
										style="width: {Math.round((deck.mastered / deck.total) * 100)}%"
									></div>
								</div>
								<span class="deck-card__progress-text">
									{deck.mastered}/{deck.total} mastered
								</span>
							</div>
						{:else if deck.grammarCount === 0}
							<div class="deck-card__coming-soon">Coming soon</div>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
