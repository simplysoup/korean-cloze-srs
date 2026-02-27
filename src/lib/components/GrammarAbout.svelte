<script lang="ts">
	interface EnglishHintPart {
		text: string;
		highlightType: 'none' | 'direct' | 'related';
	}

	interface ClozeCard {
		fullSentence: string;
		answer: string;
		vocabBaseForm: string;
		englishHint: EnglishHintPart[];
	}

	interface Note {
		type: 'caution' | 'funfact' | 'tip';
		title: string;
		content: string;
	}

	interface Props {
		title: string;
		description: string;
		clozeCards: ClozeCard[];
		notes: Note[] | null;
	}

	let { title, description, clozeCards, notes }: Props = $props();

	/** Normalize legacy { highlight: boolean } to { highlightType } */
	function normalizeHint(part: any): EnglishHintPart {
		if (typeof part.highlight === 'boolean') {
			return { text: part.text, highlightType: part.highlight ? 'direct' : 'none' };
		}
		return part;
	}

	/** Build a highlighted sentence string: wrap [answer] portion in accent */
	function highlightAnswer(sentence: string, answer: string): { before: string; match: string; after: string } {
		const idx = sentence.indexOf(answer);
		if (idx === -1) return { before: sentence, match: '', after: '' };
		return {
			before: sentence.slice(0, idx),
			match: sentence.slice(idx, idx + answer.length),
			after: sentence.slice(idx + answer.length)
		};
	}

	// Show max 3 embedded examples in the About section
	const embeddedExamples = $derived(clozeCards.slice(0, 3));

	const noteIcons: Record<string, string> = {
		caution: '⚠️',
		funfact: '💡',
		tip: '💬'
	};
</script>

<div class="grammar-about">
	<h3 class="grammar-about__heading">About {title}</h3>

	<div class="grammar-about__description">
		<p>{description}</p>
	</div>

	{#if embeddedExamples.length > 0}
		<div class="grammar-about__examples">
			{#each embeddedExamples as card}
				{@const parts = highlightAnswer(card.fullSentence, card.answer)}
				<div class="grammar-about__example">
					<p class="grammar-about__example-korean">
						{parts.before}<span class="grammar-about__highlight">{parts.match}</span>{parts.after}
					</p>
					<p class="grammar-about__example-english">
						{#each (card.englishHint as any[]).map(normalizeHint) as hint}
							<span
								class:grammar-about__hint-direct={hint.highlightType === 'direct'}
								class:grammar-about__hint-related={hint.highlightType === 'related'}
							>{hint.text}</span>
						{/each}
					</p>
				</div>
			{/each}
		</div>
	{/if}

	{#if notes && notes.length > 0}
		<div class="grammar-about__notes">
			{#each notes as note}
				<div class="grammar-about__note grammar-about__note--{note.type}">
					<p class="grammar-about__note-title">
						{noteIcons[note.type] ?? ''} {note.title}
					</p>
					<p class="grammar-about__note-content">{note.content}</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
