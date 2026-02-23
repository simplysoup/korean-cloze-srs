<script lang="ts">
	import { romanToHangul } from '$lib/romanToHangul';

	interface EnglishHintPart {
		text: string;
		highlight: boolean;
	}

	interface GrammarPoint {
		title: string;
		category: string;
		tense: string | null;
		register: string | null;
		hint: string;
		description: string;
	}

	interface ClozeCard {
		id: string;
		fullSentence: string;
		sentenceWithBlank: string;
		vocabBaseForm: string;
		answers: string[];
		grammar: GrammarPoint;
		englishHint: EnglishHintPart[];
	}

	// ── Receive from +page.server.ts ─────────────────────────────────────
	let { data } = $props();

	// ── Sentence parts split at each ___ ─────────────────────────────────
	const parts = $derived(data.card.sentenceWithBlank.split('___'));
	const blankCount = $derived(parts.length - 1);

	// ── Per-blank roman input ─────────────────────────────────────────────────
	let romanInputs = $state<string[]>(['']);
	let hangulValues = $derived(romanInputs.map((r) => romanToHangul(r)));

	// ── Submission / result state ─────────────────────────────────────────────
	let submitted = $state(false);
	let correct = $derived(
		submitted
			? hangulValues.map((h) => data.card.answers.includes(h))
			: ([] as boolean[]),
	);
	let allCorrect = $derived(submitted && correct.length > 0 && correct.every(Boolean));

	// ── Handlers ──────────────────────────────────────────────────────────────
	function submit() {
		if (hangulValues.some((h) => h.trim() === '')) return;
		submitted = true;
	}

	function reset() {
		submitted = false;
		romanInputs = [''];
		setTimeout(() => (document.querySelector('.roman-input') as HTMLInputElement)?.focus(), 0);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') submit();
	}
</script>

<div class="wrapper">
	<!-- Grammar point card -->
	<div class="grammar-card">
		<div class="grammar-header">
			<span class="grammar-label">Grammar Point</span>
			<span class="grammar-title">{data.card.grammar.title}</span>
		</div>
		<p class="grammar-desc">{data.card.grammar.description}</p>
	</div>

	<!-- Cloze card -->
	<div class="cloze-card">
		<!-- Sentence with inline blanks -->
		<div class="sentence" aria-label="Cloze sentence">
			{#each parts as part, i}
				<span class="sentence-text">{part}</span>
				{#if i < blankCount}
					{@const h = hangulValues[i]}
					{@const isEmpty = h === ''}
					{@const blankState = !submitted ? 'idle' : correct[i] ? 'correct' : 'incorrect'}
					<span
						class="blank blank--{blankState}"
						aria-label="Blank {i + 1}"
						class:blank--placeholder={isEmpty}
					>
						{isEmpty ? data.card.grammar.hint : h}
					</span>
				{/if}
			{/each}
		</div>

		<!-- English translation hint -->
		<p class="english-hint" aria-label="English translation hint">
			{#each data.card.englishHint as part}
				{#if part.highlight}
					<span class="english-highlight">{part.text}</span>
				{:else}
					{part.text}
				{/if}
			{/each}
		</p>

		<!-- Roman inputs -->
		<div class="inputs-area">
			{#each romanInputs as _, i}
				<div class="input-group">
					<label for="roman-{i}" class="field-label">
						{blankCount === 1 ? 'Your answer (romanized)' : `Blank ${i + 1} (romanized)`}
					</label>
					<!-- svelte-ignore a11y_autofocus -->
					<input
						id="roman-{i}"
						type="text"
						class="roman-input"
						bind:value={romanInputs[i]}
						disabled={submitted}
						onkeydown={handleKeydown}
						placeholder="e.g. neun"
						autofocus={i === 0}
						spellcheck={false}
						autocomplete="off"
					/>
				</div>
			{/each}
		</div>

		<!-- Result message -->
		{#if submitted}
			<div class="result-message" class:result--correct={allCorrect} class:result--incorrect={!allCorrect}>
				{#if allCorrect}
					✓ Correct!
				{:else}
					✗ Not quite — correct answer{data.card.answers.length > 1 ? 's' : ''}:
				<strong>{data.card.answers.join(' / ')}</strong>
				{/if}
			</div>
		{/if}

		<!-- Controls -->
		<div class="controls">
			{#if !submitted}
				<button
					class="btn btn--primary"
					onclick={submit}
					disabled={hangulValues.some((h) => h.trim() === '')}
				>
					Check
				</button>
			{:else}
				<button class="btn btn--secondary" onclick={reset}>Try Again</button>
				<button class="btn btn--primary" onclick={reset}>Next →</button>
			{/if}
		</div>

	</div>
</div>


