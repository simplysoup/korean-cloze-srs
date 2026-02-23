<script lang="ts">
	import { romanToHangul } from '$lib/romanToHangul';

	let roman = $state('');
	let hangul = $derived(romanToHangul(roman));
</script>

<div class="wrapper">
	<h1 class="page-title">로마자 → 한글 변환기</h1>
	<p class="page-subtitle">
		Type romanized Korean (e.g. <code>annyeonghaseyo</code>) and see it converted to Hangul in real time (use hyphens <code>'-'</code> in case of unclear separation).
	</p>

	<div class="card">
		<label for="roman-input" class="field-label">Romanized input</label>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			id="roman-input"
			type="text"
			class="roman-input"
			bind:value={roman}
			placeholder="annyeonghaseyo"
			autofocus
			spellcheck={false}
			autocomplete="off"
		/>

		<label for="hangul-output" class="field-label">Hangul output</label>
		<div id="hangul-output" class="hangul-output" aria-live="polite">
			{hangul || '\u00A0'}
		</div>

	</div>
</div>


