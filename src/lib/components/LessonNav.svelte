<script lang="ts">
	interface GrammarPointRef {
		id: string;
		title: string;
	}

	interface LessonContextProps {
		deckSlug: string;
		deckTitle: string;
		lessonNumber: number;
		grammarPoints: GrammarPointRef[];
		currentIndex: number;
		deckId?: string;
	}

	interface Props {
		lessonContext: LessonContextProps | null;
		deckContext?: { deckSlug: string; deckTitle: string } | null;
	}

	let { lessonContext, deckContext }: Props = $props();

	const hasPrev = $derived(lessonContext ? lessonContext.currentIndex > 0 : false);
	const hasNext = $derived(
		lessonContext ? lessonContext.currentIndex < lessonContext.grammarPoints.length - 1 : false
	);

	function grammarUrl(id: string): string {
		if (lessonContext) {
			return `/grammar/${id}?deck_id=${lessonContext.deckId ?? ''}&lesson=${lessonContext.lessonNumber}`;
		}
		return `/grammar/${id}`;
	}

	const prevUrl = $derived(
		lessonContext && hasPrev
			? grammarUrl(lessonContext.grammarPoints[lessonContext.currentIndex - 1].id)
			: null
	);

	const nextUrl = $derived(
		lessonContext && hasNext
			? grammarUrl(lessonContext.grammarPoints[lessonContext.currentIndex + 1].id)
			: null
	);
</script>

<nav class="lesson-nav">
	{#if lessonContext}
		<a
			href={prevUrl ?? '#'}
			class="lesson-nav__btn lesson-nav__btn--prev"
			class:lesson-nav__btn--disabled={!hasPrev}
			aria-disabled={!hasPrev}
		>
			← Previous
		</a>

		<div class="lesson-nav__pellets">
			{#each lessonContext.grammarPoints as _, i}
				<span
					class="lesson-nav__pellet"
					class:lesson-nav__pellet--active={i === lessonContext.currentIndex}
					class:lesson-nav__pellet--completed={i < lessonContext.currentIndex}
				></span>
			{/each}
		</div>

		<a
			href={nextUrl ?? '#'}
			class="lesson-nav__btn lesson-nav__btn--next"
			class:lesson-nav__btn--disabled={!hasNext}
			aria-disabled={!hasNext}
		>
			Next →
		</a>
	{:else}
		{#if deckContext}
			<a href="/decks/{deckContext.deckSlug}" class="lesson-nav__btn lesson-nav__btn--back">
				← Back to {deckContext.deckTitle}
			</a>
		{:else}
			<a href="/dashboard" class="lesson-nav__btn lesson-nav__btn--back">
				← Back to Dashboard
			</a>
		{/if}
	{/if}
</nav>
