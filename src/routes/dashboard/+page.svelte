<script lang="ts">
	import ReviewHistoryChart from '$lib/components/ReviewHistoryChart.svelte';
	import ProfileSidebar from '$lib/components/ProfileSidebar.svelte';
	import SrsDistribution from '$lib/components/SrsDistribution.svelte';
	import { getTopikDisplay } from '$lib/topik';

	let { data } = $props();

	// Find the first enrolled deck for learn/review links
	const primaryDeck = $derived(data.enrolledDecks[0] ?? null);
	const totalLearnable = $derived(data.enrolledDecks.reduce((sum: number, d: { learnable: number }) => sum + d.learnable, 0));
	const totalMastered = $derived(data.enrolledDecks.reduce((sum: number, d: { masteredCount: number }) => sum + d.masteredCount, 0));
	const totalGrammar = $derived(data.enrolledDecks.reduce((sum: number, d: { totalGrammar: number }) => sum + d.totalGrammar, 0));
</script>

<svelte:head>
	<title>Dashboard — Korean Cloze SRS</title>
</svelte:head>

<div class="dashboard-grid">
	<!-- Learn Card -->
	<a
		href={primaryDeck && primaryDeck.learnable > 0 ? `/learn?deck_id=${primaryDeck.id}` : (primaryDeck ? `/decks/${primaryDeck.slug}` : '/decks')}
		class="action-card action-card--learn"
	>
		<p class="action-card__heading">Learn</p>
		{#if primaryDeck && primaryDeck.learnable > 0}
			<p class="action-card__title">{primaryDeck.title}</p>
			{#if primaryDeck.nextLessonNumber}
				<p class="action-card__subtitle">Lesson {primaryDeck.nextLessonNumber}: {primaryDeck.learnable} new grammar points</p>
			{:else}
				<p class="action-card__subtitle">{primaryDeck.learnable} grammar points remaining</p>
			{/if}
			<span class="action-card__badge">{data.learnableCount}</span>
		{:else if !primaryDeck}
			<p class="action-card__title">Choose a Deck</p>
			<p class="action-card__subtitle">Pick a grammar deck to start learning</p>
		{:else}
			<p class="action-card__title">All caught up! 🎉</p>
			<p class="action-card__subtitle">No new grammar to learn right now</p>
		{/if}
	</a>

	<!-- Review Card -->
	<a
		href={primaryDeck ? `/reviews?deck_id=${primaryDeck.id}` : '/reviews'}
		class="action-card action-card--review"
	>
		<p class="action-card__heading">Review</p>
		{#if data.reviewsDue > 0}
			<p class="action-card__title">{data.reviewsDue} reviews due</p>
			<p class="action-card__subtitle">Keep your streak going!</p>
			<span class="action-card__badge">{data.reviewsDue}</span>
		{:else}
			<p class="action-card__title">All caught up! 🎉</p>
			<p class="action-card__subtitle">No reviews due right now</p>
		{/if}
	</a>

	<!-- Mastery Overview -->
	{#if data.enrolledDecks.length > 0}
		<div class="mastery-overview">
			<h3 class="mastery-overview__title">Mastery Progress</h3>
			<div class="mastery-overview__bar-wrapper">
				<div class="mastery-overview__bar">
					<div class="mastery-overview__fill" style="width: {totalGrammar > 0 ? Math.round((totalMastered / totalGrammar) * 100) : 0}%"></div>
				</div>
				<span class="mastery-overview__text">{totalMastered}/{totalGrammar} mastered</span>
			</div>
			<div class="mastery-overview__decks">
				{#each data.enrolledDecks as deck (deck.id)}
					<a href="/decks/{deck.slug}" class="mastery-overview__deck">
						<span class="mastery-overview__deck-name">{deck.title}</span>
						<span class="mastery-overview__deck-badge">{getTopikDisplay(deck.topikLevel)}</span>
						<span class="mastery-overview__deck-stats">{deck.masteredCount}/{deck.totalGrammar}</span>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Profile Sidebar -->
	<ProfileSidebar
		userName={data.userName}
		userEmail={data.userEmail}
		levelInfo={data.levelInfo}
		streakData={data.streakData}
		streakDays={data.streakDays}
		topikProgress={data.topikProgress}
		quickStats={data.quickStats}
	/>

	<!-- Review History Chart -->
	<ReviewHistoryChart />

	<!-- SRS Distribution -->
	<SrsDistribution distribution={data.srsDistribution} />
</div>
