<script lang="ts">
	interface Props {
		title: string;
		hint: string;
		vocabBaseForm?: string;
		deckContext?: {
			deckTitle: string;
			deckSlug: string;
			lessonNumber: number;
			positionInLesson: number;
			totalInLesson: number;
		};
	}

	let { title, hint, vocabBaseForm, deckContext }: Props = $props();
</script>

<div class="grammar-hero">
	{#if deckContext}
		<div class="grammar-hero__breadcrumb">
			<a href="/dashboard" class="grammar-hero__back">← Dashboard</a>
			<span class="grammar-hero__sep">/</span>
			<a href="/decks/{deckContext.deckSlug}" class="grammar-hero__deck">{deckContext.deckTitle}</a>
			<span class="grammar-hero__sep">·</span>
			<span class="grammar-hero__lesson">
				Lesson {deckContext.lessonNumber}: {deckContext.positionInLesson}/{deckContext.totalInLesson}
			</span>
		</div>
	{:else}
		<div class="grammar-hero__breadcrumb">
			<a href="/dashboard" class="grammar-hero__back">← Dashboard</a>
		</div>
	{/if}

	<h1 class="grammar-hero__title">
		{#if vocabBaseForm}
			<span class="grammar-hero__hangul">{vocabBaseForm}</span>
		{/if}
		<span class="grammar-hero__name">{title}</span>
	</h1>

	<p class="grammar-hero__hint">{hint}</p>
</div>
