<script lang="ts">
	import { romanToHangul } from '$lib/romanToHangul';

	interface EnglishHintPart {
		text: string;
		highlightType: 'none' | 'direct' | 'related';
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
		reviewCardId: string;
		id: string;
		fullSentence: string;
		sentenceWithBlank: string;
		vocabBaseForm: string;
		answers: string[];
		grammar: GrammarPoint;
		englishHint: EnglishHintPart[];
	}

	/** Normalize legacy { highlight: boolean } to { highlightType } */
	function normalizeHint(part: any): EnglishHintPart {
		if (typeof part.highlight === 'boolean') {
			return { text: part.text, highlightType: part.highlight ? 'direct' : 'none' };
		}
		return part;
	}

	// ── Receive from +page.server.ts ─────────────────────────────────────
	let { data } = $props();

	// ── Queue state ──────────────────────────────────────────────────────
	let queueIndex = $state(0);
	let currentCard = $derived(data.queue[queueIndex] as unknown as ClozeCard | undefined);

	// ── Normalized english hint ──────────────────────────────────────────
	const englishHint = $derived(currentCard ? currentCard.englishHint.map(normalizeHint) : []);

	// ── Sentence parts split at each ___ ─────────────────────────────────
	const parts = $derived(currentCard ? currentCard.sentenceWithBlank.split('___') : ['']);
	const blankCount = $derived(parts.length - 1);

	// ── Placeholder: tense/register metadata, fallback to hint ───────────
	const placeholderText = $derived(
		currentCard
			? [currentCard.grammar.tense, currentCard.grammar.register]
					.filter(Boolean)
					.join(', ') || currentCard.grammar.hint
			: ''
	);

	// ── Per-blank roman input ─────────────────────────────────────────────
	let romanInputs = $state<string[]>(['']);
	let hangulValues = $derived(romanInputs.map((r) => romanToHangul(r)));

	// ── Submission / result state ─────────────────────────────────────────
	let submitted = $state(false);
	let allCorrect = $derived(
		submitted && currentCard
			? hangulValues.every((h) => currentCard!.answers.some((a) => a === h.trim()))
			: false
	);

	// ── Undo snapshot ────────────────────────────────────────────────────
	let preSubmitSnapshot = $state<{ romanInputs: string[] } | null>(null);

	// ── Show answer state ────────────────────────────────────────────────
	let answerRevealed = $state(false);

	// ── Alt answer cycling ───────────────────────────────────────────────
	let altIndex = $state(0);

	// ── Reveal info state ────────────────────────────────────────────────
	let revealState = $state<'hidden' | 'confirming' | 'revealed'>('hidden');
	let autoFailed = $state(false);

	// ── FSRS posting state ───────────────────────────────────────────────
	let posting = $state(false);
	// ── Network error state ──────────────────────────────────────────────
	let networkError = $state<string | null>(null);
	// ── Shake animation ──────────────────────────────────────────────────
	let shaking = $state(false);

	function submit() {
		if (!currentCard) return;
		preSubmitSnapshot = { romanInputs: [...romanInputs] };
		submitted = true;

		if (!allCorrect) {
			shaking = true;
			setTimeout(() => {
				shaking = false;
			}, 300);
		}
	}

	function undo() {
		if (preSubmitSnapshot) {
			romanInputs = preSubmitSnapshot.romanInputs;
			submitted = false;
			answerRevealed = false;
			preSubmitSnapshot = null;
		}
	}

	function showAnswer() {
		answerRevealed = true;
	}

	function cycleAlt() {
		if (!currentCard) return;
		altIndex = (altIndex + 1) % currentCard.answers.length;
	}

	function toggleReveal() {
		if (revealState === 'hidden') {
			if (!allCorrect && !submitted) {
				revealState = 'confirming';
			} else {
				revealState = 'revealed';
			}
		} else if (revealState === 'confirming') {
			revealState = 'revealed';
			autoFailed = true;
		} else {
			revealState = 'hidden';
		}
	}

	async function next() {
		if (!currentCard) return;
		posting = true;
		networkError = null;

		try {
			// 6.2 — Server-side answer verification before FSRS update
			const checkRes = await fetch('/api/reviews/check', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					reviewCardId: currentCard.reviewCardId,
					answers: hangulValues
				})
			});

			let serverRating: number;
			if (checkRes.ok) {
				const checkData = await checkRes.json();
				serverRating = checkData.rating;
			} else {
				// If reveal-penalty was applied, force Again regardless
				serverRating = autoFailed ? 1 : (allCorrect ? 3 : 1);
			}

			// autoFailed (reveal-info penalty) always overrides server rating
			const rating = autoFailed ? 1 : serverRating;

			const fsrsRes = await fetch('/api/reviews', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reviewCardId: currentCard.reviewCardId, rating })
			});

			if (!fsrsRes.ok) {
				const body = await fsrsRes.json().catch(() => ({}));
				throw new Error(body?.message ?? `Server error ${fsrsRes.status}`);
			}
		} catch (e) {
			// 6.3 — Network error: show retry instead of silently advancing
			networkError = e instanceof Error ? e.message : 'Network error — please try again.';
			posting = false;
			return;
		}

		posting = false;

		// Advance to next card
		queueIndex++;
		resetCardState();
	}

	function resetCardState() {
		romanInputs = [''];
		submitted = false;
		answerRevealed = false;
		preSubmitSnapshot = null;
		altIndex = 0;
		revealState = 'hidden';
		autoFailed = false;
		shaking = false;
		networkError = null;
	}

	// ── Next review time formatting ───────────────────────────────────────
	function formatNextReview(date: Date | string | null): string {
		if (!date) return '';
		const d = new Date(date);
		const diffMs = d.getTime() - Date.now();
		const diffMin = Math.round(diffMs / 60_000);
		if (diffMin < 1) return 'less than a minute';
		if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'}`;
		const diffHr = Math.round(diffMin / 60);
		if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'}`;
		const diffDay = Math.round(diffHr / 24);
		return `${diffDay} day${diffDay === 1 ? '' : 's'}`;
	}
</script>

<div class="review-wrapper">
	{#if !currentCard}
		<div class="empty-state">
			<h2>🎉 All caught up!</h2>
			{#if data.nextReviewAt}
				<p>Next review in <strong>{formatNextReview(data.nextReviewAt)}</strong>.</p>
			{:else}
				<p>No reviews scheduled yet. Start learning from the home page!</p>
			{/if}
			<a href="/" class="btn btn--primary">Home</a>
		</div>
	{:else}
		<div class="cloze-card">
			<!-- Sentence with blanks -->
			<div
				class="sentence"
				class:sentence--correct={submitted && allCorrect}
				class:shake={shaking}
			>
				{#each parts as part, i}
					<span class="sentence-text">{part}</span>
					{#if i < blankCount}
						{@const h = hangulValues[i] ?? ''}
						{@const isEmpty = h.trim() === ''}
						{@const blankCorrect =
							submitted && currentCard.answers.some((a) => a === h.trim())}
						{@const blankIncorrect = submitted && !blankCorrect}
						<span
							class="blank"
							class:blank--placeholder={isEmpty && !answerRevealed}
							class:blank--correct={blankCorrect && !answerRevealed}
							class:blank--incorrect={blankIncorrect && !answerRevealed}
							class:blank--revealed={answerRevealed}
						>
							{#if answerRevealed}
								{currentCard.answers[altIndex]}
							{:else if isEmpty}
								{placeholderText}
							{:else}
								{h}
							{/if}
						</span>
					{/if}
				{/each}
			</div>

			<!-- English hint -->
			<div class="english-hint">
				{#each englishHint as part}
					<span
						class="hint-part"
						class:hint--direct={part.highlightType === 'direct'}
						class:hint--related={part.highlightType === 'related'}
					>
						{part.text}
					</span>
				{/each}
			</div>

			<!-- Romanized input -->
			{#if !submitted && !answerRevealed}
				<div class="input-group">
					{#each romanInputs as _, i}
						<input
							type="text"
							class="roman-input"
							placeholder="Type romanized Korean…"
							bind:value={romanInputs[i]}
							onkeydown={(e) => {
								if (e.key === 'Enter') submit();
							}}
						/>
					{/each}
				</div>
			{/if}

			<!-- Result message -->
			{#if submitted}
				<div
					class="result"
					class:result--correct={allCorrect}
					class:result--incorrect={!allCorrect}
				>
					{#if allCorrect && !autoFailed}
						✓ Correct!
					{:else if answerRevealed}
						Answer: <strong>{currentCard.answers.join(' / ')}</strong>
					{:else}
						✗ Incorrect
					{/if}
				</div>
			{/if}

			<!-- Network error + retry -->
			{#if networkError}
				<div class="network-error">
					⚠️ {networkError}
					<button class="btn btn--secondary" onclick={next} disabled={posting}>
						{posting ? 'Retrying…' : 'Retry'}
					</button>
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
				{:else if allCorrect && !autoFailed}
					<!-- Correct: show Alt button + Next -->
					{#if currentCard.answers.length > 1}
						<button class="btn btn--secondary" onclick={cycleAlt}>
							Alt ({currentCard.answers[altIndex]})
						</button>
					{/if}
					<button class="btn btn--primary" onclick={next} disabled={posting}>
						{posting ? 'Saving…' : 'Next →'}
					</button>
				{:else}
					<!-- Incorrect: Show Answer, Undo, Next -->
					{#if !answerRevealed}
						<button class="btn btn--danger" onclick={showAnswer}>Show Answer</button>
						<button
							class="btn btn--secondary"
							onclick={undo}
							title="Use only for typos, not incorrect answers"
						>
							Undo
						</button>
					{:else}
						{#if currentCard.answers.length > 1}
							<button class="btn btn--secondary" onclick={cycleAlt}>
								Alt ({currentCard.answers[altIndex]})
							</button>
						{/if}
						<button class="btn btn--primary" onclick={next} disabled={posting}>
							{posting ? 'Saving…' : 'Next →'}
						</button>
					{/if}
				{/if}
			</div>

			<!-- Reveal Info toggle -->
			<div class="reveal-info">
				<button class="btn btn--ghost" onclick={toggleReveal}>
					{#if revealState === 'hidden'}
						Reveal Info
					{:else if revealState === 'confirming'}
						⚠️ Revealing will mark this review as failed. Click again to confirm.
					{:else}
						Hide Info
					{/if}
				</button>

				{#if revealState === 'revealed'}
					<div class="grammar-description">
						<h3>{currentCard.grammar.title}</h3>
						<p class="grammar-meta">
							{currentCard.grammar.category}
							{#if currentCard.grammar.tense} · {currentCard.grammar.tense}{/if}
							{#if currentCard.grammar.register} · {currentCard.grammar.register}{/if}
						</p>
						<p>{currentCard.grammar.description}</p>
					</div>
				{/if}
			</div>

			<!-- Queue progress -->
			<div class="queue-progress">
				{queueIndex + 1} / {data.queue.length}
			</div>
		</div>
	{/if}
</div>

<style>
	.review-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 4rem);
		text-align: center;
		padding: 2rem 1rem;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.empty-state h2 {
		font-size: 1.5rem;
		margin: 0;
	}

	.cloze-card {
		background: none;
		border-radius: 0;
		padding: 0;
		box-shadow: none;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		width: 100%;
		max-width: 40rem;
	}

	.sentence {
		font-size: 1.75rem;
		line-height: 1.5;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.1rem;
		transition: color 0.2s;
	}

	.sentence--correct {
		color: var(--green, #16a34a);
	}

	.shake {
		animation: shake 0.3s ease-in-out;
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-4px);
		}
		40% {
			transform: translateX(4px);
		}
		60% {
			transform: translateX(-4px);
		}
		80% {
			transform: translateX(4px);
		}
	}

	.sentence-text {
		white-space: pre-wrap;
	}

	.blank {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 3rem;
		padding: 0.15rem 0.5rem;
		border-bottom: 2px solid var(--border, #d1d5db);
		font-size: 1.75rem;
		transition:
			border-color 0.2s,
			color 0.2s;
	}

	.blank--placeholder {
		color: var(--text-faint, #c5c9d0);
		font-size: 0.85rem;
	}

	.blank--correct {
		color: var(--green, #16a34a);
		border-color: var(--green, #16a34a);
	}

	.blank--incorrect {
		color: var(--red, #dc2626);
		border-color: var(--red, #dc2626);
	}

	.blank--revealed {
		color: var(--blue, #2563eb);
		border-color: var(--blue, #2563eb);
	}

	.english-hint {
		text-align: center;
		font-size: 1.1rem;
		color: var(--text-muted, #6b7280);
	}

	.hint--direct {
		color: var(--red-dark, #b91c1c);
		text-decoration: underline;
	}

	.hint--related {
		color: #b45309;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.roman-input {
		width: 100%;
		max-width: 20rem;
		padding: 0.6rem 0.75rem;
		font-size: 1.1rem;
		border: 2px solid var(--border, #d1d5db);
		border-radius: 0.5rem;
		text-align: center;
		outline: none;
		transition: border-color 0.15s;
	}

	.roman-input:focus {
		border-color: var(--primary, #3b82f6);
	}

	.result {
		font-size: 1.1rem;
		font-weight: 600;
		padding: 0.5rem;
	}

	.result--correct {
		color: var(--green, #16a34a);
	}

	.result--incorrect {
		color: var(--red, #dc2626);
	}

	.controls {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn {
		padding: 0.6rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			opacity 0.15s,
			background-color 0.15s;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn--primary {
		background: var(--primary, #3b82f6);
		color: white;
	}

	.btn--primary:hover:not(:disabled) {
		background: var(--primary-dark, #2563eb);
	}

	.btn--secondary {
		background: var(--bg-secondary, #e5e7eb);
		color: var(--text, #1f2937);
	}

	.btn--secondary:hover:not(:disabled) {
		background: var(--bg-secondary-dark, #d1d5db);
	}

	.btn--danger {
		background: var(--red, #dc2626);
		color: white;
	}

	.btn--danger:hover:not(:disabled) {
		background: var(--red-dark, #b91c1c);
	}

	.btn--ghost {
		background: none;
		color: var(--text-muted, #6b7280);
		text-decoration: underline;
		padding: 0.4rem 0.75rem;
		font-size: 0.9rem;
	}

	.btn--ghost:hover {
		color: var(--text, #1f2937);
	}

	.reveal-info {
		margin-top: 0.5rem;
	}

	.grammar-description {
		margin-top: 0.75rem;
		padding: 1rem;
		background: var(--bg-secondary, #f3f4f6);
		border-radius: 0.5rem;
		text-align: left;
		max-height: 15rem;
		overflow-y: auto;
	}

	.grammar-description h3 {
		margin: 0 0 0.25rem;
		font-size: 1.1rem;
	}

	.grammar-meta {
		color: var(--text-muted, #6b7280);
		font-size: 0.85rem;
		margin: 0 0 0.5rem;
	}

	.grammar-description p:last-child {
		margin: 0;
		line-height: 1.6;
	}

	.queue-progress {
		margin-top: 1rem;
		font-size: 0.85rem;
		color: var(--text-muted, #6b7280);
	}

	.network-error {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: var(--red-bg, #fef2f2);
		color: var(--red-text, #991b1b);
		border: 1px solid var(--red-border, #fecaca);
		border-radius: 0.5rem;
		padding: 0.6rem 1rem;
		font-size: 0.9rem;
	}
</style>
