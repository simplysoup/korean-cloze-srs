<script lang="ts">
	let { distribution }: {
		distribution: { new: number; learning: number; review: number; relearning: number; mastered: number; unstudied: number };
	} = $props();

	const cards = $derived([
		{ name: 'New', count: distribution.new, color: 'var(--srs-new)' },
		{ name: 'Learning', count: distribution.learning, color: 'var(--srs-learning)' },
		{ name: 'Review', count: distribution.review, color: 'var(--srs-review)' },
		{ name: 'Relearning', count: distribution.relearning, color: 'var(--srs-relearning)' },
		{ name: 'Mastered', count: distribution.mastered, color: 'var(--srs-mastered)' },
		{ name: 'Unstudied', count: distribution.unstudied, color: 'var(--text-faint)' }
	]);
</script>

<div class="srs-distribution">
	<h3 class="srs-distribution__title">SRS Level Distribution</h3>
	<div class="srs-distribution__grid">
		{#each cards as card (card.name)}
			<div class="srs-card {card.count === 0 ? 'srs-card--dim' : ''}" style="background: {card.color};">
				<div class="srs-card__name">{card.name}</div>
				<div class="srs-card__count">{card.count}</div>
			</div>
		{/each}
	</div>
</div>
