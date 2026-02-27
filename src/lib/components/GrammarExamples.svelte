<script lang="ts">
	interface EnglishHintPart {
		text: string;
		highlightType: 'none' | 'direct' | 'related';
	}

	interface ClozeCard {
		id: string;
		fullSentence: string;
		answer: string;
		alternateAnswers: string[];
		vocabBaseForm: string;
		englishHint: EnglishHintPart[];
	}

	interface Props {
		clozeCards: ClozeCard[];
	}

	let { clozeCards }: Props = $props();

	/** Normalize legacy { highlight: boolean } to { highlightType } */
	function normalizeHint(part: any): EnglishHintPart {
		if (typeof part.highlight === 'boolean') {
			return { text: part.text, highlightType: part.highlight ? 'direct' : 'none' };
		}
		return part;
	}

	function highlightAnswer(sentence: string, answer: string): { before: string; match: string; after: string } {
		const idx = sentence.indexOf(answer);
		if (idx === -1) return { before: sentence, match: '', after: '' };
		return {
			before: sentence.slice(0, idx),
			match: sentence.slice(idx, idx + answer.length),
			after: sentence.slice(idx + answer.length)
		};
	}
</script>

<div class="grammar-examples" id="tab-examples" role="tabpanel">
	{#if clozeCards.length === 0}
		<p class="grammar-examples__empty">No example sentences yet.</p>
	{:else}
		<div class="grammar-examples__list">
			{#each clozeCards as card, i}
				{@const parts = highlightAnswer(card.fullSentence, card.answer)}
				<div class="grammar-examples__card">
					<div class="grammar-examples__number">{i + 1}</div>
					<div class="grammar-examples__content">
						<p class="grammar-examples__korean">
							{parts.before}<span class="grammar-examples__highlight">{parts.match}</span>{parts.after}
						</p>
						<p class="grammar-examples__english">
							{#each (card.englishHint as any[]).map(normalizeHint) as hint}
								<span
									class:grammar-examples__hint-direct={hint.highlightType === 'direct'}
									class:grammar-examples__hint-related={hint.highlightType === 'related'}
								>{hint.text}</span>
							{/each}
						</p>
						<div class="grammar-examples__meta">
							<span class="grammar-examples__meta-item">
								<span class="grammar-examples__meta-label">Base form:</span> {card.vocabBaseForm}
							</span>
							<span class="grammar-examples__meta-item">
								<span class="grammar-examples__meta-label">Answer:</span> {card.answer}
							</span>
							{#if card.alternateAnswers.length > 0}
								<span class="grammar-examples__meta-item">
									<span class="grammar-examples__meta-label">Alt:</span> {card.alternateAnswers.join(', ')}
								</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
