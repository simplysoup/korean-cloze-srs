<script lang="ts">
	interface Props {
		structurePattern: string | null;
		vocabBaseForm?: string;
	}

	let { structurePattern, vocabBaseForm }: Props = $props();

	const displayPattern = $derived(structurePattern ?? vocabBaseForm ?? null);
</script>

{#if displayPattern}
	<div class="structure-card">
		<h3 class="structure-card__heading">Structure</h3>
		<p class="structure-card__pattern">{displayPattern}</p>
	</div>
{/if}
