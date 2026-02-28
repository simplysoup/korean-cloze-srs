<script lang="ts">
	import GrammarHero from '$lib/components/GrammarHero.svelte';
	import GrammarTabs from '$lib/components/GrammarTabs.svelte';
	import StructureCard from '$lib/components/StructureCard.svelte';
	import MetadataCard from '$lib/components/MetadataCard.svelte';
	import GrammarAbout from '$lib/components/GrammarAbout.svelte';
	import GrammarExamples from '$lib/components/GrammarExamples.svelte';
	import GrammarActions from '$lib/components/GrammarActions.svelte';
	import LessonNav from '$lib/components/LessonNav.svelte';

	let { data } = $props();

	let activeTab = $state<'details' | 'examples'>('details');

	const gp = $derived(data.grammarPoint);
	const lessonContext = $derived(data.lessonContext);
	const deckContext = $derived(data.deckContext);
	const isLearned = $derived(data.isLearned);

	// Build hero deck context from lesson context
	const heroDeckContext = $derived(
		lessonContext
			? {
					deckTitle: lessonContext.deckTitle,
					deckSlug: lessonContext.deckSlug,
					lessonNumber: lessonContext.lessonNumber,
					positionInLesson: lessonContext.currentIndex + 1,
					totalInLesson: lessonContext.grammarPoints.length
				}
			: undefined
	);

	// Get first cloze card's vocabBaseForm for the hero
	const vocabBaseForm = $derived(gp.clozeCards[0]?.vocabBaseForm);

	// Parse notes from JSON
	const notes = $derived(
		Array.isArray(gp.notes) ? (gp.notes as { type: 'caution' | 'funfact' | 'tip'; title: string; content: string }[]) : null
	);

	const isAuthenticated = $derived(!!data.user);
</script>

<svelte:head>
	<title>{vocabBaseForm ? `${vocabBaseForm} — ` : ''}{gp.title} | Korean Cloze</title>
</svelte:head>

<div class="grammar-page">
	<GrammarHero
		title={gp.title}
		hint={gp.hint}
		{vocabBaseForm}
		deckContext={heroDeckContext}
	/>

	<div class="grammar-page__body">
		<div class="grammar-page__main">
			<GrammarTabs {activeTab} onTabChange={(tab) => (activeTab = tab)} />

			{#if activeTab === 'details'}
				<div id="tab-details" role="tabpanel" class="grammar-page__tab-content">
					<StructureCard
						structurePattern={gp.structurePattern}
						{vocabBaseForm}
					/>

					<MetadataCard
						category={gp.category}
						register={gp.register}
						tense={gp.tense}
						level={gp.level}
						tags={gp.tags}
					/>

					<GrammarAbout
						title={gp.title}
						description={gp.description}
						clozeCards={gp.clozeCards as any}
						{notes}
					/>
				</div>
			{:else}
				<GrammarExamples clozeCards={gp.clozeCards as any} />
			{/if}
		</div>

		<aside class="grammar-page__sidebar">
			<GrammarActions
				grammarPointId={gp.id}
				{isLearned}
				{isAuthenticated}
			/>
		</aside>
	</div>

	<LessonNav {lessonContext} {deckContext} />
</div>
