<script lang="ts">
	import { romanToHangul } from '$lib/romanToHangul';

	interface EnglishHintPart {
		text: string;
		highlight: boolean; // highlight in red — marks what the blank corresponds to
	}

	interface GrammarPoint {
		title: string;
		description: string;
		hint: string; // generic label shown inside the blank before typing
	}

	interface ClozeCard {
		sentence: string;           // ___ marks each blank
		answers: string[][];        // answers[i] = accepted hangul strings for blank i
		grammar: GrammarPoint;
		englishHint: EnglishHintPart[]; // translation with blank's equivalent highlighted
	}

	// ── Hardcoded card — future: Prisma 7 + PostgreSQL ───────────────────────
	const card: ClozeCard = {
		sentence: '저___한국어를 공부해요.',
		answers: [['는']],
		grammar: {
			title: '은/는 — Topic Particle (주제 조사)',
			description:
				'Attaches directly after a noun to mark it as the sentence topic. ' +
				'Use 은 after a noun ending in a consonant (받침), ' +
				'는 after a noun ending in a vowel. ' +
				'The topic particle sets contrast or emphasis relative to other things.',
			hint: 'topic particle',
		},
		// 저는 한국어를 공부해요 → "I study Korean."
		// The topic particle 는 is what makes 저 the sentence topic — equivalent to "I" in English.
		englishHint: [
			{ text: 'I', highlight: true },
			{ text: ' study Korean.', highlight: false },
		],
	};

	// ── Sentence parts split at each ___ ─────────────────────────────────────
	const parts: string[] = card.sentence.split('___');
	const blankCount = parts.length - 1;

	// ── Per-blank roman input ─────────────────────────────────────────────────
	let romanInputs = $state<string[]>(Array.from({ length: blankCount }, () => ''));
	let hangulValues = $derived(romanInputs.map((r) => romanToHangul(r)));

	// ── Submission / result state ─────────────────────────────────────────────
	let submitted = $state(false);
	let correct = $derived(
		submitted
			? hangulValues.map((h, i) => (card.answers[i] ?? []).includes(h))
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
		romanInputs = Array.from({ length: blankCount }, () => '');
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
			<span class="grammar-title">{card.grammar.title}</span>
		</div>
		<p class="grammar-desc">{card.grammar.description}</p>
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
						{isEmpty ? card.grammar.hint : h}
					</span>
				{/if}
			{/each}
		</div>

		<!-- English translation hint -->
		<p class="english-hint" aria-label="English translation hint">
			{#each card.englishHint as part}
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
					✗ Not quite — correct answer{card.answers.length > 1 ? 's' : ''}:
					{#each card.answers as answerSet, i}
						<strong>{answerSet.join(' / ')}</strong>{i < card.answers.length - 1 ? ', ' : ''}
					{/each}
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


