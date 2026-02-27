<script lang="ts">
	import ReviewHistoryChart from '$lib/components/ReviewHistoryChart.svelte';
	import ProfileSidebar from '$lib/components/ProfileSidebar.svelte';
	import SrsDistribution from '$lib/components/SrsDistribution.svelte';

	let { data } = $props();

	// Find the first enrolled deck for learn/review links
	const primaryDeck = $derived(data.enrolledDecks[0] ?? null);
	const totalLearnable = $derived(data.enrolledDecks.reduce((sum: number, d: { learnable: number }) => sum + d.learnable, 0));
</script>

<svelte:head>
	<title>Dashboard — Korean Cloze SRS</title>
</svelte:head>

<div class="dashboard-grid">
	<!-- Learn Card -->
	<a
		href={primaryDeck ? `/decks/${primaryDeck.slug}` : '/'}
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
			<span class="action-card__badge">{totalLearnable}</span>
		{:else}
			<p class="action-card__title">All caught up! 🎉</p>
			<p class="action-card__subtitle">No new grammar to learn right now</p>
		{/if}
	</a>

	<!-- Review Card -->
	<a
		href="/reviews"
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
