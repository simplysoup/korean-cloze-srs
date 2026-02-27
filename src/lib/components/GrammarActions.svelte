<script lang="ts">
	interface Props {
		grammarPointId: string;
		isLearned: boolean;
		isAuthenticated: boolean;
	}

	let { grammarPointId, isLearned, isAuthenticated }: Props = $props();

	let localLearned = $state(false);
	let learned = $derived(isLearned || localLearned);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function markAsLearned() {
		loading = true;
		error = null;

		try {
			const res = await fetch(`/api/grammar/${grammarPointId}/learn`, {
				method: 'POST'
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message ?? 'Failed to mark as learned');
			}

			localLearned = true;
		} catch (e: any) {
			error = e.message ?? 'Something went wrong';
		} finally {
			loading = false;
		}
	}
</script>

<div class="grammar-actions">
	{#if isAuthenticated}
		<button
			class="grammar-actions__btn grammar-actions__btn--learn"
			class:grammar-actions__btn--learned={learned}
			onclick={markAsLearned}
			disabled={learned || loading}
		>
			{#if loading}
				Saving…
			{:else if learned}
				✓ Learned
			{:else}
				Mark as Learned
			{/if}
		</button>
	{:else}
		<a href="/login" class="grammar-actions__btn grammar-actions__btn--login">
			Log in to track progress
		</a>
	{/if}

	<button class="grammar-actions__btn grammar-actions__btn--note" disabled title="Coming in Phase 11">
		Add Note
	</button>

	{#if error}
		<p class="grammar-actions__error">{error}</p>
	{/if}
</div>
