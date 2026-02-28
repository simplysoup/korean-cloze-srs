<script lang="ts">
	import MasteryPips from '$lib/components/MasteryPips.svelte';
	import { getTopikDisplay, getTopikShort } from '$lib/topik';

	let { data } = $props();

	const progressPercent = $derived(
		data.totalGrammar > 0 ? Math.round((data.totalLearned / data.totalGrammar) * 100) : 0
	);

	const lessonNames: Record<number, string> = {
		1: 'Basic Particles',
		2: 'Location & Direction',
		3: 'Inclusion & Limitation',
		4: 'Connecting Nouns'
	};

	function srsStatusClass(srsStatus: string | null): string {
		if (!srsStatus) return '';
		return `srs-badge--${srsStatus.toLowerCase()}`;
	}

	function statusIcon(status: 'learned' | 'current' | 'locked') {
		if (status === 'learned') return '✅';
		if (status === 'current') return '📖';
		return '🔒';
	}

	async function enroll() {
		const res = await fetch(`/api/decks/${data.deck.id}/enroll`, { method: 'POST' });
		if (res.ok) {
			window.location.reload();
		}
	}
</script>

<div class="deck-page">
	<!-- Deck Header -->
	<div class="deck-header">
		<div class="deck-header__top">
			{#if data.deck.icon}
				<span class="deck-header__icon">{data.deck.icon}</span>
			{/if}
			<div>
				<div class="deck-header__title-row">
					<h1 class="deck-header__title">{data.deck.title}</h1>
					<span class="deck-header__topik-badge">{getTopikDisplay(data.deck.topikLevel)}</span>
				</div>
				<p class="deck-header__desc">{data.deck.description}</p>
			</div>
		</div>

		{#if data.enrolled}
			<!-- Progress bar -->
			<div class="deck-progress">
				<div class="deck-progress__bar">
					<div class="deck-progress__fill" style="width: {progressPercent}%"></div>
				</div>
				<span class="deck-progress__text">{data.totalLearned}/{data.totalGrammar} learned</span>
			</div>

			<!-- Action buttons -->
			<div class="deck-actions">
				<a href="/" class="btn btn--primary">
					Continue Learning
				</a>
				{#if data.totalReviewsDue > 0}
					<a href="/reviews" class="btn btn--secondary">
						Review ({data.totalReviewsDue} due)
					</a>
				{/if}
			</div>
		{:else if data.user}
			<div class="deck-actions">
				<button class="btn btn--primary" onclick={enroll}>
					Start Learning
				</button>
			</div>
		{:else}
			<div class="deck-actions">
				<a href="/login" class="btn btn--primary">Login to Start</a>
			</div>
		{/if}
	</div>

	<!-- Lessons -->
	<div class="deck-lessons">
		{#each data.lessons as lesson (lesson.lessonNumber)}
			{@const lessonLearned = lesson.grammarPoints.filter((g) => g.status === 'learned').length}
			{@const lessonTotal = lesson.grammarPoints.length}
			{@const lessonPercent = lessonTotal > 0 ? Math.round((lessonLearned / lessonTotal) * 100) : 0}
			<div class="lesson-group">
				<h2 class="lesson-group__title">
					Lesson {lesson.lessonNumber}{#if lessonNames[lesson.lessonNumber]}: {lessonNames[lesson.lessonNumber]}{/if}
				</h2>
				{#if data.enrolled}
					<div class="lesson-group__progress">
						<div class="lesson-group__progress-bar">
							<div class="lesson-group__progress-fill" style="width: {lessonPercent}%"></div>
						</div>
						<span class="lesson-group__progress-text">{lessonLearned}/{lessonTotal}</span>
					</div>
				{/if}
				<div class="lesson-group__list">
					{#each lesson.grammarPoints as gp (gp.id)}
						<a
							href="/grammar/{gp.id}?deck_id={data.deck.id}&lesson={lesson.lessonNumber}"
							class="grammar-row grammar-row--{gp.status}"
						>
							<span class="grammar-row__index">{gp.sortOrder + 1}.</span>
							<div class="grammar-row__info">
								<span class="grammar-row__title">{gp.title}</span>
								<span class="grammar-row__hint">{gp.hint}</span>
							</div>
							<div class="grammar-row__right">
								{#if data.enrolled && gp.status === 'learned'}
									<div class="grammar-row__pips">
										<MasteryPips streakCorrect={gp.streakCorrect} masteredAt={gp.masteredAt} size="sm" />
									</div>
								{/if}
								{#if gp.srsStatus}
									<span class="srs-badge {srsStatusClass(gp.srsStatus)}">{gp.srsStatus}</span>
								{/if}
								{#if gp.reviewsDue > 0}
									<span class="grammar-row__reviews">{gp.reviewsDue} due</span>
								{/if}
								<span class="grammar-row__status">{statusIcon(gp.status)}</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.deck-page {
		max-width: 680px;
		margin: 2rem auto;
		padding: 0 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* ── Header ─────────────────────────────────────────────────── */
	.deck-header {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.deck-header__top {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.deck-header__icon {
		font-size: 2.5rem;
		line-height: 1;
	}

	.deck-header__title {
		font-size: 1.5rem;
		margin: 0;
		color: var(--text);
	}

	.deck-header__desc {
		margin: 0.25rem 0 0;
		color: var(--text-muted);
		font-size: 0.9rem;
		line-height: 1.4;
	}

	/* ── Progress ───────────────────────────────────────────────── */
	.deck-progress {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.deck-progress__bar {
		flex: 1;
		height: 8px;
		background: var(--border);
		border-radius: 4px;
		overflow: hidden;
	}

	.deck-progress__fill {
		height: 100%;
		background: var(--green);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.deck-progress__text {
		font-size: 0.8rem;
		color: var(--text-muted);
		white-space: nowrap;
	}

	/* ── Actions ────────────────────────────────────────────────── */
	.deck-actions {
		display: flex;
		gap: 0.75rem;
	}

	/* ── Lesson groups ──────────────────────────────────────────── */
	.deck-lessons {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.lesson-group__title {
		font-size: 1rem;
		color: var(--text-muted);
		margin: 0 0 0.5rem;
		font-weight: 600;
	}

	.lesson-group__list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	/* ── Grammar rows ───────────────────────────────────────────── */
	.grammar-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.65rem 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		transition: background 0.15s;
		text-decoration: none;
		color: inherit;
		cursor: pointer;
	}

	.grammar-row:hover {
		background: var(--bg);
	}

	.grammar-row--learned {
		border-left: 3px solid var(--green);
	}

	.grammar-row--current {
		border-left: 3px solid var(--blue);
		background: #f0f7ff;
	}

	.grammar-row--locked {
		opacity: 0.55;
	}

	.grammar-row__index {
		font-weight: 600;
		color: var(--text-muted);
		min-width: 1.75rem;
		text-align: right;
	}

	.grammar-row__info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.grammar-row__title {
		font-weight: 600;
		color: var(--text);
		font-size: 0.95rem;
	}

	.grammar-row__hint {
		font-size: 0.8rem;
		color: var(--text-muted);
		font-style: italic;
	}

	.grammar-row__right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.grammar-row__reviews {
		font-size: 0.75rem;
		color: var(--blue);
		font-weight: 500;
	}

	.grammar-row__status {
		font-size: 1.1rem;
	}
</style>
