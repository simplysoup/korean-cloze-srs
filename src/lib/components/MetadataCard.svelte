<script lang="ts">
	interface Props {
		category: string;
		register: string | null;
		tense: string | null;
		level: number;
		tags: string[];
	}

	let { category, register, tense, level, tags }: Props = $props();
</script>

<div class="metadata-card">
	<h3 class="metadata-card__heading">Details</h3>
	<div class="metadata-card__grid">
		<div class="metadata-card__field">
			<span class="metadata-card__label">Category</span>
			<span class="metadata-card__value">{category}</span>
		</div>
		{#if register}
			<div class="metadata-card__field">
				<span class="metadata-card__label">Register</span>
				<span class="metadata-card__value">{register}</span>
			</div>
		{/if}
		{#if tense}
			<div class="metadata-card__field">
				<span class="metadata-card__label">Tense</span>
				<span class="metadata-card__value">{tense}</span>
			</div>
		{/if}
		<div class="metadata-card__field">
			<span class="metadata-card__label">Level</span>
			<span class="metadata-card__value">TOPIK {level}</span>
		</div>
	</div>
	{#if tags.length > 0}
		<div class="metadata-card__tags">
			{#each tags as tag}
				<span class="metadata-card__tag">{tag}</span>
			{/each}
		</div>
	{/if}
</div>
