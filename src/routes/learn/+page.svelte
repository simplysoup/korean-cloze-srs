<script lang="ts">
	import GrammarHero from '$lib/components/GrammarHero.svelte';
	import GrammarTabs from '$lib/components/GrammarTabs.svelte';
	import StructureCard from '$lib/components/StructureCard.svelte';
	import MetadataCard from '$lib/components/MetadataCard.svelte';
	import GrammarAbout from '$lib/components/GrammarAbout.svelte';
	import GrammarExamples from '$lib/components/GrammarExamples.svelte';
	import { romanToHangul } from '$lib/romanToHangul';

	interface EnglishHintPart {
		text: string;
		highlightType: 'none' | 'direct' | 'related';
	}

	function normalizeHint(part: any): EnglishHintPart {
		if (typeof part.highlight === 'boolean') {
			return { text: part.text, highlightType: part.highlight ? 'direct' : 'none' };
		}
		return part;
	}

	let { data } = $props();

	// ── Session phases: 'learning' → 'quiz' → 'complete' ────────────────
	type Phase = 'learning' | 'quiz' | 'complete';
	let phase = $state<Phase>('learning');

	// ── Learning phase state ─────────────────────────────────────────────
	let currentIndex = $state(0);
	let activeTab = $state<'details' | 'examples'>('details');
	let adding = $state(false);
	let addError = $state<string | null>(null);
	let addedGrammarIds = $state<Set<string>>(new Set());
	let totalCardsCreated = $state(0);

	// ── Session size (user-adjustable) ───────────────────────────────────
	let sessionSize = $state(5);
	let showSessionSettings = $state(false);

	// Sync initial session size from server data
	$effect(() => {
		if (data.sessionSize) sessionSize = data.sessionSize;
	});

	const grammarPoints = $derived(data.grammarPoints);
	const currentGP = $derived(grammarPoints[currentIndex]);
	const addedCount = $derived(addedGrammarIds.size);

	// Build hero deck context
	const heroDeckContext = $derived({
		deckTitle: data.deckTitle,
		deckSlug: data.deckSlug,
		lessonNumber: 0,
		positionInLesson: currentIndex + 1,
		totalInLesson: grammarPoints.length
	});

	const vocabBaseForm = $derived(currentGP?.clozeCards[0]?.vocabBaseForm);

	const notes = $derived(
		currentGP && Array.isArray(currentGP.notes)
			? (currentGP.notes as { type: 'caution' | 'funfact' | 'tip'; title: string; content: string }[])
			: null
	);

	const pageTitle = $derived(
		data.deckComplete
			? `Deck Complete — ${data.deckTitle}`
			: phase === 'complete'
				? `Session Complete!`
				: phase === 'quiz'
					? `Practice Quiz — ${data.deckTitle}`
					: `Learn — ${data.deckTitle}`
	);

	// ── Add to Deck: creates review cards & auto-advances ────────────────
	async function addToDeck() {
		if (!currentGP || adding) return;
		adding = true;
		addError = null;

		try {
			const res = await fetch('/api/learn/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					deckId: data.deckId,
					grammarPointId: currentGP.id
				})
			});

			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.error ?? `Server error ${res.status}`);
			}

			const result = await res.json();
			totalCardsCreated += result.reviewCardsCreated;

			// Track this grammar point as added
			addedGrammarIds = new Set([...addedGrammarIds, currentGP.id]);

			// Check if session target reached or at end of available points
			const newAddedCount = addedGrammarIds.size;
			if (newAddedCount >= sessionSize || currentIndex >= grammarPoints.length - 1) {
				// Move to quiz phase
				startQuiz();
			} else {
				// Auto-advance to next grammar point
				currentIndex++;
				activeTab = 'details';
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		} catch (e) {
			addError = e instanceof Error ? e.message : 'Failed to add to deck';
		} finally {
			adding = false;
		}
	}

	// ── Quiz phase state ─────────────────────────────────────────────────
	// Collect all cloze cards from added grammar points
	let quizCards = $state<any[]>([]);
	let quizIndex = $state(0);
	let quizRomanInput = $state('');
	let quizSubmitted = $state(false);
	let quizCorrectCount = $state(0);
	let quizTotalAnswered = $state(0);
	let quizShaking = $state(false);
	let quizAnswerRevealed = $state(false);

	const currentQuizCard = $derived(quizCards[quizIndex] ?? null);
	const quizHangul = $derived(romanToHangul(quizRomanInput));
	const quizParts = $derived(currentQuizCard ? currentQuizCard.sentenceWithBlank.split('___') : ['']);
	const quizEnglishHint = $derived(
		currentQuizCard
			? (currentQuizCard.englishHint as any[]).map(normalizeHint)
			: []
	);
	const quizPlaceholder = $derived(
		currentQuizCard
			? [currentQuizCard.grammar?.tense, currentQuizCard.grammar?.register]
					.filter(Boolean)
					.join(', ') || currentQuizCard.grammar?.hint || currentQuizCard.hint
			: ''
	);
	const quizIsCorrect = $derived(
		quizSubmitted && currentQuizCard
			? currentQuizCard.answers.some((a: string) => a === quizHangul.trim())
			: false
	);

	function startQuiz() {
		// Build quiz cards from all grammar points that were added
		const cards: any[] = [];
		for (const gp of grammarPoints) {
			if (!addedGrammarIds.has(gp.id)) continue;
			for (const cc of gp.clozeCards) {
				cards.push({
					...cc,
					answers: [cc.answer, ...cc.alternateAnswers],
					grammar: {
						title: gp.title,
						hint: gp.hint,
						tense: gp.tense,
						register: gp.register,
						description: gp.description
					},
					grammarPointId: gp.id
				});
			}
		}
		// Shuffle the cards
		for (let i = cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[cards[i], cards[j]] = [cards[j], cards[i]];
		}
		quizCards = cards;
		quizIndex = 0;
		quizCorrectCount = 0;
		quizTotalAnswered = 0;
		resetQuizCard();
		phase = 'quiz';
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function resetQuizCard() {
		quizRomanInput = '';
		quizSubmitted = false;
		quizShaking = false;
		quizAnswerRevealed = false;
	}

	function submitQuiz() {
		if (!currentQuizCard) return;
		quizSubmitted = true;
		quizTotalAnswered++;
		if (quizIsCorrect) {
			quizCorrectCount++;
		} else {
			quizShaking = true;
			setTimeout(() => { quizShaking = false; }, 300);
		}
	}

	function showQuizAnswer() {
		quizAnswerRevealed = true;
	}

	function nextQuizCard() {
		if (quizIndex < quizCards.length - 1) {
			quizIndex++;
			resetQuizCard();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} else {
			phase = 'complete';
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	// Test out: skip remaining quiz and go to completion
	function testOut() {
		phase = 'complete';
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// Keyboard handler for quiz
	function handleKeydown(e: KeyboardEvent) {
		if (phase !== 'quiz' || !currentQuizCard) return;
		if (e.key !== 'Enter') return;

		if (!quizSubmitted) return; // let input handler do the first Enter
		e.preventDefault();
		nextQuizCard();
	}

	function autofocus(node: HTMLInputElement) {
		node.focus();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

{#if data.deckComplete}
	<!-- Deck complete state -->
	<div class="learn-completion">
		<div class="learn-completion__card">
			<h1 class="learn-completion__title">🎉 Deck Complete!</h1>
			<p class="learn-completion__message">
				You've learned all grammar points in <strong>{data.deckTitle}</strong>.
			</p>
			<div class="learn-completion__actions">
				<a href="/reviews?deck_id={data.deckId}" class="btn btn--primary">Review Now</a>
				<a href="/decks/{data.deckSlug}" class="btn btn--secondary">Back to Deck</a>
				<a href="/dashboard" class="btn btn--secondary">Dashboard</a>
			</div>
		</div>
	</div>

{:else if phase === 'complete'}
	<!-- Session completion screen -->
	<div class="learn-completion">
		<div class="learn-completion__card">
			<h1 class="learn-completion__title">🎉 Session Complete!</h1>
			<p class="learn-completion__message">
				You learned {addedCount} grammar point{addedCount === 1 ? '' : 's'}:
			</p>
			<ul class="learn-completion__list">
				{#each grammarPoints as gp}
					{#if addedGrammarIds.has(gp.id)}
						<li>
							<strong>{gp.clozeCards[0]?.vocabBaseForm ?? ''}</strong> — {gp.title}
						</li>
					{/if}
				{/each}
			</ul>
			{#if totalCardsCreated > 0}
				<p class="learn-completion__cards-added">
					{totalCardsCreated} review card{totalCardsCreated === 1 ? '' : 's'} added to your queue.
				</p>
			{/if}
			{#if quizTotalAnswered > 0}
				<div class="learn-completion__quiz-results">
					<p>Practice quiz: <strong>{quizCorrectCount}/{quizTotalAnswered}</strong> correct ({Math.round((quizCorrectCount / quizTotalAnswered) * 100)}%)</p>
				</div>
			{/if}
			<div class="learn-completion__actions">
				<a href="/reviews?deck_id={data.deckId}" class="btn btn--primary">Review Now</a>
				<a href="/learn?deck_id={data.deckId}" class="btn btn--secondary">Learn More</a>
				<a href="/dashboard" class="btn btn--secondary">Dashboard</a>
			</div>
		</div>
	</div>

{:else if phase === 'quiz' && currentQuizCard}
	<!-- Practice quiz phase -->
	<div class="learn-quiz">
		<div class="learn-quiz__header">
			<h2 class="learn-quiz__title">Practice Quiz</h2>
			<p class="learn-quiz__subtitle">Test what you just learned</p>
			<div class="learn-quiz__progress">
				{quizIndex + 1} / {quizCards.length}
				{#if quizTotalAnswered > 0}
					<span class="learn-quiz__score">({quizCorrectCount}/{quizTotalAnswered} correct)</span>
				{/if}
			</div>
		</div>

		<div class="cloze-card">
			<!-- Sentence with blank -->
			<div
				class="sentence"
				class:sentence--correct={quizSubmitted && quizIsCorrect}
				class:shake={quizShaking}
			>
				{#each quizParts as part, i}
					<span class="sentence-text">{part}</span>
					{#if i < quizParts.length - 1}
						{@const h = quizHangul}
						{@const isEmpty = h.trim() === ''}
						{@const blankCorrect = quizSubmitted && quizIsCorrect}
						{@const blankIncorrect = quizSubmitted && !quizIsCorrect}
						<span
							class="blank"
							class:blank--placeholder={isEmpty && !quizAnswerRevealed}
							class:blank--correct={blankCorrect && !quizAnswerRevealed}
							class:blank--incorrect={blankIncorrect && !quizAnswerRevealed}
							class:blank--revealed={quizAnswerRevealed}
						>
							{#if quizAnswerRevealed}
								{currentQuizCard.answers[0]}
							{:else if isEmpty}
								{quizPlaceholder}
							{:else}
								{h}
							{/if}
						</span>
					{/if}
				{/each}
			</div>

			<!-- English hint -->
			<div class="english-hint">
				{#each quizEnglishHint as part}
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
			{#if !quizSubmitted && !quizAnswerRevealed}
				<div class="input-group">
					<input
						type="text"
						class="roman-input"
						placeholder="Type romanized Korean…"
						bind:value={quizRomanInput}
						use:autofocus
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.stopPropagation();
								submitQuiz();
							}
						}}
					/>
				</div>
			{/if}

			<!-- Result -->
			{#if quizSubmitted}
				<div
					class="result"
					class:result--correct={quizIsCorrect}
					class:result--incorrect={!quizIsCorrect}
				>
					{#if quizIsCorrect}
						✓ Correct!
					{:else if quizAnswerRevealed}
						Answer: <strong>{currentQuizCard.answers.join(' / ')}</strong>
					{:else}
						✗ Incorrect
					{/if}
				</div>
			{/if}

			<!-- Controls -->
			<div class="controls">
				{#if !quizSubmitted}
					<button
						class="btn btn--primary"
						onclick={submitQuiz}
						disabled={quizHangul.trim() === ''}
					>
						Check
					</button>
				{:else if quizIsCorrect}
					<button class="btn btn--primary" onclick={nextQuizCard}>
						{quizIndex < quizCards.length - 1 ? 'Next →' : 'Finish'}
					</button>
				{:else}
					{#if !quizAnswerRevealed}
						<button class="btn btn--danger" onclick={showQuizAnswer}>Show Answer</button>
					{:else}
						<button class="btn btn--primary" onclick={nextQuizCard}>
							{quizIndex < quizCards.length - 1 ? 'Next →' : 'Finish'}
						</button>
					{/if}
				{/if}
			</div>
		</div>

		<!-- Test out button -->
		<div class="learn-quiz__actions">
			<button class="btn btn--ghost" onclick={testOut}>
				Skip Quiz & Finish
			</button>
		</div>
	</div>

{:else if currentGP}
	<!-- Learning phase: grammar point content -->
	<div class="grammar-page learn-page">
		<!-- Session settings toggle -->
		<div class="learn-session-bar">
			<div class="learn-session-bar__progress">
				<span class="learn-session-bar__count">{addedCount} / {sessionSize} grammar points</span>
				<div class="learn-session-bar__bar">
					<div class="learn-session-bar__fill" style="width: {Math.min(100, (addedCount / sessionSize) * 100)}%"></div>
				</div>
			</div>
			<button class="learn-session-bar__settings" onclick={() => showSessionSettings = !showSessionSettings} title="Session settings">
				⚙️ {sessionSize}/session
			</button>
			<a href="/dashboard" class="btn btn--ghost learn-session-bar__exit" title="Exit session">
				✕ Exit
			</a>
		</div>

		{#if showSessionSettings}
			<div class="learn-session-settings">
				<label class="learn-session-settings__label">
					Grammar points per session:
					<input
						type="range"
						min="1"
						max="20"
						bind:value={sessionSize}
						class="learn-session-settings__slider"
					/>
					<span class="learn-session-settings__value">{sessionSize}</span>
				</label>
			</div>
		{/if}

		<GrammarHero
			title={currentGP.title}
			hint={currentGP.hint}
			{vocabBaseForm}
			deckContext={heroDeckContext}
		/>

		<div class="grammar-page__body">
			<div class="grammar-page__main">
				<GrammarTabs {activeTab} onTabChange={(tab) => (activeTab = tab)} />

				{#if activeTab === 'details'}
					<div id="tab-details" role="tabpanel" class="grammar-page__tab-content">
						<StructureCard
							structurePattern={currentGP.structurePattern}
							{vocabBaseForm}
						/>

						<MetadataCard
							category={currentGP.category}
							register={currentGP.register}
							tense={currentGP.tense}
							level={currentGP.level}
							tags={currentGP.tags}
						/>

						<GrammarAbout
							title={currentGP.title}
							description={currentGP.description}
							clozeCards={currentGP.clozeCards as any}
							{notes}
						/>
					</div>
				{:else}
					<GrammarExamples clozeCards={currentGP.clozeCards as any} />
				{/if}
			</div>
		</div>

		<!-- Learn Navigation Footer -->
		<nav class="lesson-nav learn-nav">
			<button
				class="lesson-nav__btn lesson-nav__btn--prev"
				class:lesson-nav__btn--disabled={currentIndex === 0}
				disabled={currentIndex === 0}
				onclick={() => { if (currentIndex > 0) { currentIndex--; activeTab = 'details'; window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
			>
				← Previous
			</button>

			<div class="lesson-nav__pellets">
				{#each grammarPoints as gp, i}
					<span
						class="lesson-nav__pellet"
						class:lesson-nav__pellet--active={i === currentIndex}
						class:lesson-nav__pellet--completed={addedGrammarIds.has(gp.id)}
					></span>
				{/each}
			</div>

			<button
				class="lesson-nav__btn lesson-nav__btn--add"
				onclick={addToDeck}
				disabled={adding || addedGrammarIds.has(currentGP.id)}
			>
				{#if addedGrammarIds.has(currentGP.id)}
					✓ Added
				{:else if adding}
					Adding…
				{:else}
					Add to Deck
				{/if}
			</button>

			{#if addError}
				<div class="learn-nav__error">
					⚠️ {addError}
				</div>
			{/if}
		</nav>
	</div>
{/if}
