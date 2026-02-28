<script lang="ts">
	let { streakCorrect = 0, masteredAt = null, size = 'md' } = $props<{
		streakCorrect: number;
		masteredAt: string | null;
		size?: 'sm' | 'md';
	}>();
</script>

<div class="mastery-pips mastery-pips--{size}">
	<div class="mastery-pips__bar">
		{#each Array(8) as _, i}
			<span
				class="mastery-pips__pip"
				class:mastery-pips__pip--filled={i < streakCorrect}
				class:mastery-pips__pip--mastered={masteredAt !== null}
			></span>
		{/each}
	</div>
	{#if masteredAt}
		<span class="mastery-pips__badge">✓ Mastered</span>
	{/if}
</div>
