<script lang="ts">
	import type { UserLevel } from '$lib/levels';

	let {
		userName,
		userEmail,
		levelInfo,
		streakData,
		streakDays,
		topikProgress,
		quickStats
	}: {
		userName: string;
		userEmail: string;
		levelInfo: UserLevel;
		streakData: { currentStreak: number; longestStreak: number; lastStudiedDate: string | null };
		streakDays: { label: string; active: boolean; isToday: boolean }[];
		topikProgress: { deckTitle: string; total: number; states: { new: number; learning: number; review: number; relearning: number; mastered: number } }[];
		quickStats: { daysStudied: number; lastSessionAccuracy: number | null; itemsStudied: number };
	} = $props();

	const avatarLetter = $derived((userName || userEmail).charAt(0).toUpperCase());
</script>

<aside class="profile-sidebar">
	<!-- User info -->
	<div class="sidebar-card">
		<div class="user-header">
			<div class="user-header__avatar">{avatarLetter}</div>
			<div class="user-header__info">
				<span class="user-header__name">{userName}</span>
				<span class="user-header__subtitle">Korean Learner</span>
				<span class="user-header__level">Lv. {levelInfo.level}</span>
			</div>
		</div>

		<!-- XP bar -->
		<div class="xp-bar">
			<div class="xp-bar__label">
				<span>{levelInfo.currentXP} XP</span>
				<span>{levelInfo.xpForNextLevel} XP</span>
			</div>
			<div class="xp-bar__track">
				<div class="xp-bar__fill" style="width: {levelInfo.progress}%"></div>
			</div>
		</div>
	</div>

	<!-- Streak -->
	<div class="sidebar-card">
		<div class="streak-calendar">
			<div class="streak-calendar__header">
				<div>
					<span class="streak-calendar__count">{streakData.currentStreak}</span>
					<span class="streak-calendar__label"> day streak</span>
				</div>
			</div>
			<div class="streak-calendar__days">
				{#each streakDays as day}
					<div class="streak-calendar__day">
						<span class="streak-calendar__day-label">{day.label}</span>
						<span
							class="streak-calendar__day-dot {day.active ? 'streak-calendar__day-dot--active' : ''} {day.isToday ? 'streak-calendar__day-dot--today' : ''}"
						>
							{#if day.active}✓{/if}
						</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- TOPIK Progress -->
	{#if topikProgress.length > 0}
		<div class="sidebar-card">
			<h4 class="sidebar-card__title">TOPIK Progress (Grammar)</h4>
			{#each topikProgress as tp}
				<div class="topik-progress__item">
					<div class="topik-progress__label">
						<span>{tp.deckTitle}</span>
						<span>{tp.states.new + tp.states.learning + tp.states.review + tp.states.relearning + tp.states.mastered}/{tp.total}</span>
					</div>
					<div class="topik-progress__bar">
						{#if tp.total > 0}
							{@const totalStudied = tp.states.new + tp.states.learning + tp.states.review + tp.states.relearning + tp.states.mastered}
							<div class="topik-progress__segment" style="width: {(tp.states.mastered / tp.total) * 100}%; background: var(--green);"></div>
							<div class="topik-progress__segment" style="width: {(tp.states.review / tp.total) * 100}%; background: var(--srs-review);"></div>
							<div class="topik-progress__segment" style="width: {(tp.states.learning / tp.total) * 100}%; background: var(--srs-learning);"></div>
							<div class="topik-progress__segment" style="width: {(tp.states.relearning / tp.total) * 100}%; background: var(--srs-relearning);"></div>
							<div class="topik-progress__segment" style="width: {(tp.states.new / tp.total) * 100}%; background: var(--srs-new);"></div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Quick Stats -->
	<div class="sidebar-card">
		<h4 class="sidebar-card__title">Stats</h4>
		<div class="quick-stats">
			<div class="quick-stat">
				<span class="quick-stat__value">{quickStats.daysStudied}</span>
				<span class="quick-stat__label">Days Studied</span>
			</div>
			<div class="quick-stat">
				<span class="quick-stat__value">{quickStats.lastSessionAccuracy !== null ? `${quickStats.lastSessionAccuracy}%` : '—'}</span>
				<span class="quick-stat__label">Last Session</span>
			</div>
			<div class="quick-stat">
				<span class="quick-stat__value">{quickStats.itemsStudied}</span>
				<span class="quick-stat__label">Items Studied</span>
			</div>
		</div>
	</div>
</aside>
